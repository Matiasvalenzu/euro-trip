import type { Day } from '../types/travel'
import { CITIES } from '../data/destinations'
import { readJson, writeJson } from './storage'

export interface DayWx {
  max: number
  min: number
  pop?: number
  code: number
}

/** ciudad → fecha ISO → pronóstico */
export type Forecast = Record<string, Record<string, DayWx>>

const KEY = 'eurotrip_wx_v1'
const TTL = 3 * 60 * 60 * 1000

export function cachedForecast(): { data: Forecast; updated: number } | null {
  return readJson<{ data: Forecast; updated: number } | null>(KEY, null)
}

/** Pronóstico diario a 16 días (Open-Meteo, sin API key) para todas las ciudades en una sola consulta. */
export async function fetchForecast(keys: string[], force = false): Promise<Forecast> {
  const cached = cachedForecast()
  if (!force && cached && Date.now() - cached.updated < TTL) return cached.data
  const cities = keys.map((k) => CITIES[k]).filter(Boolean)
  const params = new URLSearchParams({
    latitude: cities.map((c) => c.lat).join(','),
    longitude: cities.map((c) => c.lon).join(','),
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
    timezone: 'auto',
    forecast_days: '16',
  })
  const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`)
  if (!res.ok) throw new Error(`Open-Meteo respondió ${res.status}`)
  const json = await res.json()
  const list = Array.isArray(json) ? json : [json]
  const data: Forecast = {}
  list.forEach((loc, i) => {
    const d = loc.daily
    const byDate: Record<string, DayWx> = {}
    d.time.forEach((t: string, j: number) => {
      byDate[t] = {
        max: Math.round(d.temperature_2m_max[j]),
        min: Math.round(d.temperature_2m_min[j]),
        pop: d.precipitation_probability_max?.[j] ?? undefined,
        code: d.weather_code[j],
      }
    })
    data[cities[i].key] = byDate
  })
  writeJson(KEY, { data, updated: Date.now() })
  return data
}

export function forecastFor(day: Day, forecast: Forecast): DayWx | undefined {
  const key = day.excursion?.key ?? day.city.key
  return key ? forecast[key]?.[day.date] : undefined
}

export function wxLabel(code: number): string {
  if (code === 0) return 'Despejado'
  if (code <= 2) return 'Parcialmente nublado'
  if (code === 3) return 'Nublado'
  if (code === 45 || code === 48) return 'Niebla'
  if (code >= 51 && code <= 57) return 'Llovizna'
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) return 'Lluvia'
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return 'Nieve'
  if (code >= 95) return 'Tormenta'
  return 'Variable'
}
