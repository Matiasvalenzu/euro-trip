import type { Currency, Rates } from '../types/travel'

export const CURRENCIES: Currency[] = ['EUR', 'PLN', 'HUF', 'CLP', 'USD']

export const DEFAULT_RATES: Rates = { EUR: 1, CLP: 1090, HUF: 363, PLN: 4.39, USD: 1.12 }

const LABELS: Record<string, string> = {
  EUR: 'Euro (€)',
  PLN: 'Złoty polaco (zł)',
  HUF: 'Forinto húngaro (Ft)',
  CLP: 'Peso chileno',
  USD: 'Dólar (US$)',
}

export const currencyLabel = (c: string) => LABELS[c] ?? c

export const isCurrency = (c: string): c is Currency => (CURRENCIES as string[]).includes(c)

export interface Amount {
  cur: Currency
  min: number
  max: number
  approx: boolean
}

function num(s: string): number {
  if (s.includes(',')) return parseFloat(s.replace(/\./g, '').replace(',', '.'))
  if (/\.\d{3}(?!\d)/.test(s)) return parseFloat(s.replace(/\./g, ''))
  return parseFloat(s)
}

const CUR_MAP: Record<string, Currency> = { eur: 'EUR', '€': 'EUR', clp: 'CLP', usd: 'USD', huf: 'HUF', ft: 'HUF', pln: 'PLN', 'zł': 'PLN' }

/** Primer monto con moneda de textos como "53,20 EUR (…)", "~60-160 EUR", "$413,84 USD", "513,36 PLN". */
export function parseAmount(text?: string): Amount | null {
  if (!text) return null
  const m = text.match(/(~)?\s?\$?\s?(\d[\d.,]*)(?:\s?[-–]\s?(\d[\d.,]*))?\s?(EUR|CLP|USD|HUF|PLN|Ft|zł|€)(?![a-z])/i)
  if (!m) return null
  const min = num(m[2])
  const max = m[3] ? num(m[3]) : min
  if (!isFinite(min)) return null
  return { cur: CUR_MAP[m[4].toLowerCase()], min, max, approx: !!m[1] || /aprox|estimad/i.test(text) }
}

export function convert(value: number, from: Currency, to: Currency, rates: Rates): number {
  return (value / rates[from]) * rates[to]
}

export function fmtMoney(value: number, cur: Currency): string {
  const decimals = cur === 'CLP' || cur === 'HUF' || Math.abs(value) >= 1000 || Number.isInteger(value) ? 0 : 2
  const n = new Intl.NumberFormat('es-CL', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(value)
  if (cur === 'CLP') return `$${n}`
  if (cur === 'EUR') return `€${n}`
  if (cur === 'USD') return `US$${n}`
  if (cur === 'PLN') return `${n} zł`
  return `${n} Ft`
}
