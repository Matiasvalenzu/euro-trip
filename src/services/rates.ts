import type { Rates } from '../types/travel'
import { DEFAULT_RATES } from '../lib/money'
import { readJson, writeJson } from './storage'

const KEY = 'eurotrip_rates_v1'

export const loadRates = (): Rates => ({ ...DEFAULT_RATES, ...readJson<Partial<Rates>>(KEY, {}) })

export const saveRates = (r: Rates) => writeJson(KEY, r)

/** Tasas del día con base EUR (ExchangeRate-API, acceso abierto). */
export async function fetchRates(): Promise<Rates> {
  const res = await fetch('https://open.er-api.com/v6/latest/EUR')
  if (!res.ok) throw new Error(`No se pudieron actualizar las tasas (${res.status}).`)
  const { rates } = await res.json()
  const r: Rates = { EUR: 1, CLP: rates.CLP, HUF: rates.HUF, USD: rates.USD, updated: Date.now() }
  saveRates(r)
  return r
}
