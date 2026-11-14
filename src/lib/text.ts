import { extractUrlMatches } from './links'

/** Minúsculas y sin tildes, conservando la longitud (cada índice coincide con el texto original). */
export function norm(s: string): string {
  let out = ''
  for (let i = 0; i < s.length; i++) {
    if (s[i] === 'ł' || s[i] === 'Ł') {
      out += 'l'
      continue
    }
    const n = s[i].normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    out += n.length === 1 ? n : s[i]
  }
  return out
}

/**
 * Copia del texto con lo que va entre paréntesis tapado (mismos índices). Se tapa con un carácter
 * que no es espacio ni letra, para que separadores como " y " no se coman el paréntesis.
 */
export function maskParens(s: string): string {
  let depth = 0
  let out = ''
  for (let i = 0; i < s.length; i++) {
    const c = s[i]
    if (c === '(') depth++
    out += depth ? '\u0001' : c
    if (c === ')' && depth > 0) depth--
  }
  return out
}

/** Texto sin lo que va entre paréntesis. */
export const stripParens = (s: string) => tidy(s.replace(/\([^()]*\)/g, ' '))

/** Corta `s` donde calza `re` (global), salvo dentro de paréntesis o de los tramos `keep`. */
export function splitOutside(s: string, re: RegExp, keep: [number, number][] = []): { text: string; start: number }[] {
  const masked = maskParens(s)
  const out: { text: string; start: number }[] = []
  let last = 0
  for (const m of masked.matchAll(re)) {
    const at = m.index ?? 0
    if (keep.some(([a, b]) => at >= a && at < b)) continue
    out.push({ text: s.slice(last, at), start: last })
    last = at + m[0].length
  }
  out.push({ text: s.slice(last), start: last })
  return out.filter((p) => p.text.trim())
}

/** Oraciones de un texto, sin cortar dentro de paréntesis, URLs, dominios ni abreviaturas ("hl.st."). */
export function sentences(s: string): string[] {
  const collapsed = s.replace(/\s*\n+\s*/g, ' ')
  const keep = extractUrlMatches(collapsed).map((m): [number, number] => [m.start, m.end])
  return splitOutside(collapsed, /[.!?](?=\s+[\p{Lu}¿¡]|\s*$)/gu, keep)
    .map((p) => tidy(p.text))
    .filter(Boolean)
}

/** Rango corto de temperatura: "Máx. ~3 a 5 °C, mín. ~-1 a 0 °C (…)" → "-1 a 5 °C". */
export function shortTemp(t?: string): string | undefined {
  if (!t) return undefined
  const nums: number[] = []
  for (const m of t.matchAll(/(-?\d+)\s*(?:a|–|-)\s*~?(-?\d+)\s*°\s*C/gi)) nums.push(+m[1], +m[2])
  if (!nums.length) for (const m of t.matchAll(/(-?\d+)\s*°\s*C/gi)) nums.push(+m[1])
  if (!nums.length) return undefined
  const lo = Math.min(...nums)
  const hi = Math.max(...nums)
  return lo === hi ? `${lo} °C` : `${lo} a ${hi} °C`
}

export function isWordChar(c: string | undefined): boolean {
  return !!c && /[a-z0-9ñœæ]/.test(c)
}

/** Busca `needle` (ya normalizado) en `hay` (normalizado) respetando límites de palabra. */
export function findWord(hay: string, needle: string, from = 0): number {
  let i = hay.indexOf(needle, from)
  while (i !== -1) {
    if (!isWordChar(hay[i - 1]) && !isWordChar(hay[i + needle.length])) return i
    i = hay.indexOf(needle, i + 1)
  }
  return -1
}

export function capitalize(s: string): string {
  return s ? s[0].toUpperCase() + s.slice(1) : s
}

/** Quita espacios dobles y signos sueltos al inicio o al final, sin alterar URLs. */
export function tidy(s: string): string {
  const urls = extractUrlMatches(s)
  let work = s
  if (urls.length) {
    work = ''
    let pos = 0
    urls.forEach((m, i) => {
      work += s.slice(pos, m.start) + `\uE000${i}\uE000`
      pos = m.end
    })
    work += s.slice(pos)
  }
  const cleaned = work
    .replace(/\(\s*\)/g, '')
    .replace(/\s+/g, ' ')
    .replace(/^[\s:;,.\-–—]+|[\s:;,\-–—]+$/g, '')
    .replace(/\.$/, '')
    .trim()
  return urls.length ? cleaned.replace(/\uE000(\d+)\uE000/g, (_, idx: string) => urls[+idx].url) : cleaned
}

/** "2 a 8°C" → "2 a 8 °C" */
export const fmtTemp = (t?: string) => t?.replace(/\s*°\s*C/i, ' °C')

export function cleanCell(v: string | undefined): string {
  const t = (v ?? '').trim()
  return /^[—–\-\s]*$/.test(t) ? '' : t
}
