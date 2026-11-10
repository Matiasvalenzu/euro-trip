import { useCallback, useEffect, useState } from 'react'
import type { Rates } from '../types/travel'
import { readJson, writeJson } from '../services/storage'
import { cachedForecast, fetchForecast, type Forecast } from '../services/weather'
import { fetchRates, loadRates, saveRates } from '../services/rates'

/** Estado que se guarda en este teléfono (localStorage). */
export function useStored<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => readJson(key, initial))
  const set = useCallback(
    (next: T | ((prev: T) => T)) =>
      setValue((prev) => {
        const v = typeof next === 'function' ? (next as (p: T) => T)(prev) : next
        writeJson(key, v)
        return v
      }),
    [key],
  )
  return [value, set] as const
}

export function useForecast(keys: string[]): Forecast {
  const [data, setData] = useState<Forecast>(() => cachedForecast()?.data ?? {})
  const sig = keys.join(',')
  useEffect(() => {
    if (!sig || !navigator.onLine) return
    let alive = true
    fetchForecast(sig.split(','))
      .then((d) => alive && setData(d))
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [sig])
  return data
}

const RATES_TTL = 12 * 60 * 60 * 1000

export function useRates() {
  const [rates, setRates] = useState<Rates>(loadRates)
  const refresh = useCallback(async () => setRates(await fetchRates()), [])
  const update = (r: Rates) => {
    saveRates(r)
    setRates(r)
  }
  useEffect(() => {
    if (navigator.onLine && (!rates.updated || Date.now() - rates.updated > RATES_TTL)) refresh().catch(() => {})
    // Solo al abrir la app.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return { rates, refresh, update }
}

export function useNow(intervalMs = 30000): Date {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])
  return now
}
