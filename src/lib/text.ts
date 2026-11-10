/** Minúsculas y sin tildes, conservando la longitud (cada índice coincide con el texto original). */
export function norm(s: string): string {
  let out = ''
  for (let i = 0; i < s.length; i++) {
    const n = s[i].normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    out += n.length === 1 ? n : s[i]
  }
  return out
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

/** Quita espacios dobles y signos sueltos al inicio o al final. */
export function tidy(s: string): string {
  return s
    .replace(/\(\s*\)/g, '')
    .replace(/\s+/g, ' ')
    .replace(/^[\s:;,.\-–—]+|[\s:;,\-–—]+$/g, '')
    .replace(/\.$/, '')
    .trim()
}

/** "2 a 8°C" → "2 a 8 °C" */
export const fmtTemp = (t?: string) => t?.replace(/\s*°\s*C/i, ' °C')

export function cleanCell(v: string | undefined): string {
  const t = (v ?? '').trim()
  return /^[—–\-\s]*$/.test(t) ? '' : t
}
