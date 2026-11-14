export interface UrlMatch {
  url: string
  start: number
  end: number
}

export type TextSegment =
  | { type: 'text'; text: string }
  | { type: 'link'; label: string; url: string }

const URL_RE = /https?:\/\/[^\s<>"']+/gi

function trimUrlTrailing(raw: string): string {
  let end = raw.length
  while (end > 0) {
    const ch = raw[end - 1]
    if (/[.,;:!?]/.test(ch)) {
      end--
      continue
    }
    if (ch === ')') {
      const slice = raw.slice(0, end)
      const open = (slice.match(/\(/g) ?? []).length
      const close = (slice.match(/\)/g) ?? []).length
      if (close > open) {
        end--
        continue
      }
    }
    break
  }
  return raw.slice(0, end)
}

/** Encuentra todas las URLs http(s) preservando query strings (`?`) y fragmentos (`#`) completos. */
export function extractUrlMatches(text: string): UrlMatch[] {
  const out: UrlMatch[] = []
  for (const m of text.matchAll(URL_RE)) {
    const start = m.index ?? 0
    const url = trimUrlTrailing(m[0])
    if (url.length > 8) out.push({ url, start, end: start + url.length })
  }
  return out
}

export function hasUrl(text?: string): boolean {
  return !!text && /https?:\/\/\S+/i.test(text)
}

/** Devuelve la URL exacta si la línea contiene únicamente una URL. */
export function asPureUrl(line: string): string | null {
  const trimmed = line.trim()
  if (!trimmed) return null
  const matches = extractUrlMatches(trimmed)
  if (matches.length !== 1) return null
  const [m] = matches
  return m.start === 0 && m.end === trimmed.length ? m.url : null
}

/** True si la línea actúa como etiqueta descriptiva (no párrafo con múltiples oraciones) para una URL en la línea siguiente. */
export function isLabelLine(line: string): boolean {
  const t = line.trim()
  if (!t || hasUrl(t)) return false
  if (t.endsWith(':')) return true
  if (/[.!?]$/.test(t)) return false
  return !/[.!?]\s+[\p{Lu}]/u.test(t)
}

export function isMapsUrl(url: string): boolean {
  return /^https?:\/\/(?:[^/]*\.)?(?:google\.[^/]+\/maps|maps\.app\.goo\.gl|goo\.gl\/maps)/i.test(url)
}

export function isTicketUrl(label: string, url: string): boolean {
  return /\b(ticket|tickets|pasaje|pasajes|billete|billetes|boarding|check-?in|dnr|e-?ticket)\b|nsinternational|trainline|oebb|mavcsoport|wizzair|ryanair|latam/i.test(
    `${label} ${url}`,
  )
}

function splitInlineUrls(line: string): TextSegment[] {
  const matches = extractUrlMatches(line)
  if (!matches.length) return [{ type: 'text', text: line }]
  const segments: TextSegment[] = []
  let pos = 0
  for (const m of matches) {
    if (m.start > pos) segments.push({ type: 'text', text: line.slice(pos, m.start) })
    segments.push({ type: 'link', label: m.url, url: m.url })
    pos = m.end
  }
  if (pos < line.length) segments.push({ type: 'text', text: line.slice(pos) })
  return segments
}

/** Convierte texto multi-línea con URLs (y etiquetas en la línea anterior) en líneas con segmentos de texto y enlace. */
export function parseTextWithLinks(text: string): TextSegment[][] {
  const rawLines = text.split(/\r?\n/)
  const out: TextSegment[][] = []
  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i].trim()
    if (!line) continue
    const nextUrl = i + 1 < rawLines.length ? asPureUrl(rawLines[i + 1]) : null
    if (nextUrl && isLabelLine(line)) {
      const label = line.replace(/:\s*$/, '').trim() || nextUrl
      out.push([{ type: 'link', label, url: nextUrl }])
      i++
      continue
    }
    out.push(splitInlineUrls(rawLines[i]))
  }
  return out
}
