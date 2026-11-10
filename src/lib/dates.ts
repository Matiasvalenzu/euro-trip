const WD = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb']
const WD_LONG = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
const MO = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
const MO_LONG = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
const MONTH_RE = /(\d{1,2})\s*(?:de\s+)?(ene|feb|mar|abr|may|jun|jul|ago|sep|set|oct|nov|dic)[a-z]*/i

const pad = (n: number) => String(n).padStart(2, '0')

export const toIso = (y: number, m: number, d: number) => `${y}-${pad(m)}-${pad(d)}`

function parts(iso: string): [number, number, number] {
  const [y, m, d] = iso.split('-').map(Number)
  return [y, m, d]
}

/** Día y mes de textos como "jue 19 nov", "19/11/2026" o "2026-11-19". */
export function parseDayMonth(s: string): { y?: number; m: number; d: number } | null {
  const isoM = s.match(/(\d{4})-(\d{2})-(\d{2})/)
  if (isoM) return { y: +isoM[1], m: +isoM[2], d: +isoM[3] }
  const slash = s.match(/(\d{1,2})\/(\d{1,2})(?:\/(\d{4}))?/)
  if (slash) return { y: slash[3] ? +slash[3] : undefined, m: +slash[2], d: +slash[1] }
  const mm = s.match(MONTH_RE)
  if (!mm) return null
  const key = mm[2].toLowerCase() === 'set' ? 'sep' : mm[2].toLowerCase()
  return { m: MO.indexOf(key) + 1, d: +mm[1] }
}

export function addDays(iso: string, n: number): string {
  const [y, m, d] = parts(iso)
  const dt = new Date(Date.UTC(y, m - 1, d + n))
  return toIso(dt.getUTCFullYear(), dt.getUTCMonth() + 1, dt.getUTCDate())
}

export function weekdayOf(iso: string): number {
  const [y, m, d] = parts(iso)
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay()
}

export function daysBetween(a: string, b: string): number {
  const [y1, m1, d1] = parts(a)
  const [y2, m2, d2] = parts(b)
  return Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 86400000)
}

export function todayIso(): string {
  const n = new Date()
  return toIso(n.getFullYear(), n.getMonth() + 1, n.getDate())
}

/** "vie 20 nov" */
export function fmtShort(iso: string): string {
  const [, m, d] = parts(iso)
  return `${WD[weekdayOf(iso)]} ${d} ${MO[m - 1]}`
}

/** "viernes 20 de noviembre" */
export function fmtLong(iso: string): string {
  const [, m, d] = parts(iso)
  return `${WD_LONG[weekdayOf(iso)]} ${d} de ${MO_LONG[m - 1]}`
}

/** "20 nov" */
export function fmtDM(iso: string): string {
  const [, m, d] = parts(iso)
  return `${d} ${MO[m - 1]}`
}

export function dateTile(iso: string): { wd: string; d: number; mo: string } {
  const [, m, d] = parts(iso)
  return { wd: WD[weekdayOf(iso)], d, mo: MO[m - 1] }
}

/** "20–22 nov" o "30 nov – 3 dic" */
export function fmtRange(a: string, b: string): string {
  const [, m1, d1] = parts(a)
  const [, m2, d2] = parts(b)
  return m1 === m2 ? `${d1}–${d2} ${MO[m2 - 1]}` : `${d1} ${MO[m1 - 1]} – ${d2} ${MO[m2 - 1]}`
}

/** Hora "14:05" en una zona horaria. */
export function timeIn(tz: string, at: Date): string {
  return new Intl.DateTimeFormat('es-CL', { timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: false }).format(at)
}

function offsetMin(tz: string, at: Date): number {
  const name = new Intl.DateTimeFormat('en-US', { timeZone: tz, timeZoneName: 'shortOffset' }).formatToParts(at).find((p) => p.type === 'timeZoneName')?.value ?? ''
  const m = name.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/)
  return m ? (m[1] === '-' ? -1 : 1) * (+m[2] * 60 + (m[3] ? +m[3] : 0)) : 0
}

/** Horas que `a` va adelantada respecto de `b`. */
export function hoursAhead(a: string, b: string, at: Date): number {
  return (offsetMin(a, at) - offsetMin(b, at)) / 60
}

export const WEEKDAY_PLURAL = ['domingos', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábados']

/** Minutos de textos como "18h10", "2h52", "~1h c/u", "~58 min", "1h30 vuelo". */
export function parseMinutes(s?: string): number | undefined {
  if (!s) return undefined
  const hm = s.match(/(\d+)\s*h\s*(\d{1,2})?/i)
  if (hm) return +hm[1] * 60 + (hm[2] ? +hm[2] : 0)
  const mins = s.match(/(\d+)\s*min/i)
  return mins ? +mins[1] : undefined
}
