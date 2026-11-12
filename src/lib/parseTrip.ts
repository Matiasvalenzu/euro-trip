import type { Activity, Block, CityRef, Companion, Day, Leg, LegLine, Lodging, LodgingOption, MapPinLink, Mode, Place, Stay, Trip } from '../types/travel'
import { HOLIDAYS, cityRef, countryOf, findCity, getCity, mapsUrl } from '../data/destinations'
import { PLACES } from '../data/places'
import { capitalize, cleanCell, isWordChar, maskParens, norm, sentences, splitOutside, stripParens, tidy } from './text'
import { WEEKDAY_PLURAL, addDays, parseDayMonth, parseMinutes, toIso, weekdayOf } from './dates'

type Col = 'dia' | 'fecha' | 'companion' | 'etapa' | 'actividad' | 'transporte' | 'duracion' | 'valor' | 'clima' | 'temperatura' | 'ropa' | 'detalle' | 'alojamiento' | 'ubicaciones'

// Encabezados de la planilla (normalizados) → columna. Se compara por prefijo.
const HEADERS: [Col, string[]][] = [
  ['dia', ['dia']], ['fecha', ['fecha']], ['companion', ['tono']], ['etapa', ['ciudad', 'etapa']],
  ['actividad', ['actividad']], ['transporte', ['transporte']], ['duracion', ['duracion']],
  ['valor', ['valor', 'costo', 'precio']], ['clima', ['clima']], ['temperatura', ['temperatura']],
  ['ropa', ['vestimenta', 'ropa']], ['detalle', ['detalle']], ['alojamiento', ['alojamiento']],
  ['ubicaciones', ['ubicaciones', 'mapa', 'googlemaps']],
]

const headerKey = (h: string) => norm(h).replace(/[^a-z0-9]/g, '')

// ---------- Ubicaciones (Google Maps) ----------

export function parseLocations(cell: string): MapPinLink[] {
  const list: MapPinLink[] = []
  for (const raw of cell.split('\n')) {
    const line = raw.trim()
    if (!line) continue
    const m = line.match(/^(.+?):\s*(https?:\/\/\S+)\s*$/)
    if (!m) continue
    const rawLabel = m[1].trim()
    const url = m[2].trim()
    const isLodging = /\balojamiento\b|hotel|hostel|airbnb|poppies|cosy studio|casa de to[ñn]o/i.test(rawLabel)
    const isTransport =
      !isLodging &&
      /\b(aeropuerto|estaci[oó]n|station|centraal|centralna|hauptbahnhof|hbf|keleti|nyugati|gare|sants|ferry|transvip|bus\s+\d+\w*|terminal)\b/i.test(rawLabel)
    const parenMatch = rawLabel.match(/^([^(]+?)\s*\(([^)]+)\)\s*$/)
    let label = rawLabel
    let note: string | undefined
    if (parenMatch) {
      label = parenMatch[1].trim()
      const cleanNote = parenMatch[2].replace(/^alojamiento\s*,?\s*/i, '').trim()
      if (cleanNote) note = cleanNote
    }
    list.push({
      label,
      note,
      url,
      kind: isLodging ? 'lodging' : isTransport ? 'transport' : 'place',
    })
  }
  return list
}

function matchActivityMapUrl(a: Activity, locations: MapPinLink[], cityName: string): string | undefined {
  if (a.place) {
    const targets = [norm(a.place.name), ...a.place.aliases]
    const hit = locations.find((loc) => {
      if (loc.kind === 'lodging') return false
      const l = norm(loc.label)
      return targets.some((t) => l === t || (l.length >= 4 && (l.includes(t) || t.includes(l))))
    })
    return hit?.url ?? mapsUrl(`${a.place.name} ${cityName}`)
  }
  const t = norm(stripParens(a.text))
  const hit = locations.find((loc) => {
    const l = norm(loc.label)
    return l.length >= 4 && (t.includes(l) || (t.length >= 5 && l.includes(t)))
  })
  if (hit) return hit.url
  if (a.kind === 'place') return mapsUrl(a.search ?? `${stripParens(a.text)} ${cityName}`)
  return undefined
}

// ---------- Actividades ----------

const STOP = new Set(
  'a al barrio cafes caminata cerca compras con de del dia e el en excursion explorar hace hotel la las los luego min mirador molinos noche o opcional para paseo por recorrido reserva reservar semanas si suave tarde temprano tren iluminados iluminado iluminada atardecer castillo museo vistas y visita manana'.split(' '),
)

/** Etiquetas al inicio de una oración: "Mañana:", "Tarde/noche opcional:", "Excursión de medio día desde Ámsterdam:". */
const LEAD = /^(?:(ma[ñn]ana|tarde(?:\s*\/\s*noche)?|noche)(?:\s+opcional)?|(luego|despu[eé]s|opcional|si queda tiempo|si hay tiempo|excursi[oó]n(?:\s+de\s+(?:medio\s+)?d[ií]a)?(?:\s+desde\s+[^:,]+)?))\b\s*[:,]?\s*(?:en\s+(?:la|el|los|las)\s+)?/i
/** Oraciones que son avisos y no actividades. */
const NOTICE = /cerrad|\bcierra|verificar|por confirmar|\bsegun\b|estaria/
const LOGISTICS = /^(vuelo|vuelta|tren|bus\b|metro|tranv|traslado|transfer|llegada|llegar|salir|salida|check|dormir|descans|d[ií]a\b|volver|regreso|temprano|desayuno|almuerzo|cena|compras|tiempo|libre)/i

function plainKind(t: string): Activity['kind'] {
  const n = norm(t)
  if (/dormir|descans|jet lag/.test(n)) return 'rest'
  if (/\btren\b/.test(n)) return 'train'
  if (/vuelo|avion|aeropuerto/.test(n)) return 'flight'
  if (/llegada|check-?in|check-?out/.test(n)) return 'arrive'
  return 'other'
}

/** ¿Parece un lugar con nombre propio aunque no esté en el catálogo? */
function placeLike(text: string): boolean {
  const t = stripParens(text)
  if (!t || t.split(/\s+/).length > 6 || LOGISTICS.test(t)) return false
  const caps = t.match(/\p{Lu}[\p{L}'’-]+/gu) ?? []
  return caps.some((w) => !/^[A-Z]{2,4}$/.test(w) && !findCity(w))
}

interface Hit {
  s: number
  e: number
  p: Place
}

/** Lugares del catálogo mencionados fuera de paréntesis, sin solaparse (gana el alias más largo). */
function findHits(text: string, candidates: Place[]): Hit[] {
  const n = norm(maskParens(text))
  const hits: Hit[] = []
  for (const p of candidates) {
    for (const a of p.aliases) {
      for (let i = n.indexOf(a); i !== -1; i = n.indexOf(a, i + 1)) {
        if (!isWordChar(n[i - 1]) && !isWordChar(n[i + a.length])) hits.push({ s: i, e: i + a.length, p })
      }
    }
  }
  hits.sort((x, y) => x.s - y.s || y.e - y.s - (x.e - x.s))
  const picked: Hit[] = []
  let end = -1
  for (const h of hits) {
    if (h.s >= end) {
      picked.push(h)
      end = h.e
    }
  }
  return picked
}

const joinNote = (...parts: (string | undefined)[]) =>
  parts
    .map((p) => (p ? tidy(p) : ''))
    .filter(Boolean)
    .join(' · ') || undefined

/**
 * Convierte "Actividad / Notas" en una lista: lugares con guía, pasos del día y avisos.
 * Respeta paréntesis (su contenido queda como nota del lugar que lo precede).
 */
export function extractActivities(text: string, cityKeys: string[], weekday: number, cityName: string) {
  const activities: Activity[] = []
  const notes: string[] = []
  const alerts: string[] = []
  const byPlace = new Map<string, Activity>()
  const candidates = PLACES.filter((p) => cityKeys.includes(p.city)).sort((a, b) => cityKeys.indexOf(a.city) - cityKeys.indexOf(b.city))

  for (const sentence of sentences(text)) {
    const outside = norm(maskParens(sentence))
    if (NOTICE.test(outside)) {
      ;(/cerrad|\bcierra/.test(outside) ? alerts : notes).push(sentence)
      continue
    }

    let rest = sentence
    let when: string | undefined
    let optional = false
    const lead = rest.match(LEAD)
    if (lead) {
      const w = norm(lead[1] ?? lead[2] ?? '')
      when = w.startsWith('manana') ? 'Mañana' : w.startsWith('tarde') ? (w.includes('noche') ? 'Tarde/noche' : 'Tarde') : w.startsWith('noche') ? 'Noche' : undefined
      optional = /opcional|si queda|si hay/.test(norm(lead[0]))
      rest = rest.slice(lead[0].length)
    }
    if (/^o\s/i.test(rest)) {
      optional = true
      rest = rest.slice(2)
    }

    // "Lugar: detalle" → el detalle queda como nota del lugar.
    let tail = ''
    const colon = maskParens(rest).search(/(?<!\d):(?!\d)/)
    if (colon > 0 && findHits(rest.slice(0, colon), candidates).length) {
      tail = rest.slice(colon + 1)
      rest = rest.slice(0, colon)
    }

    const hits = findHits(rest, candidates)
    const created: Activity[] = []
    const items = splitOutside(rest, /[,;+]|\s+(?:y|e|o\s+bien)\s+/g, hits.map((h): [number, number] => [h.s, h.e]))
    for (const item of items) {
      const end = item.start + item.text.length
      const own = hits.filter((h) => h.s >= item.start && h.e <= end)

      if (!own.length) {
        const clean = capitalize(tidy(item.text))
        if (!clean) continue
        const search = placeLike(item.text) ? `${stripParens(item.text)} ${cityName}` : undefined
        const a: Activity = { kind: search ? 'place' : plainKind(clean), text: clean, search, when, optional: optional || undefined }
        activities.push(a)
        created.push(a)
        continue
      }

      const parens = [...item.text.matchAll(/\(([^()]*)\)/g)]
        .map((m) => ({ at: item.start + (m.index ?? 0), text: m[1] }))
        .filter((p) => !/^reserva(r)?( con anticipacion)?$/.test(norm(p.text).trim()))
      let left = ''
      let pos = item.start
      for (const h of own) {
        left += rest.slice(pos, h.s) + ' '
        pos = h.e
      }
      left += rest.slice(pos, end)
      const words = norm(maskParens(left))
        .split(/[^a-z0-9ñœ]+/)
        .filter((w) => w.length > 2 && !STOP.has(w) && !/^\d+$/.test(w))
      const context = words.length >= 2 ? stripParens(item.text) : undefined

      const choice = own.some((h, k) => k > 0 && /(^|[\s/])o(\s|$)/i.test(rest.slice(own[k - 1].e, h.s)))
      const reserveAt = norm(item.text).indexOf('reserv')
      let bookIdx = -1
      if (reserveAt >= 0) {
        bookIdx = 0
        own.forEach((h, k) => {
          if (h.e - item.start <= reserveAt) bookIdx = k
        })
      }

      own.forEach((h, k) => {
        const next = own[k + 1]?.s ?? Infinity
        const mine = parens.filter((p) => (p.at >= h.e && p.at < next) || (k === 0 && p.at < h.s)).map((p) => p.text)
        const note = joinNote(k === 0 ? context : undefined, ...mine)
        const existing = byPlace.get(h.p.id)
        if (existing) {
          existing.note = joinNote(existing.note, note)
          return
        }
        const a: Activity = {
          kind: 'place',
          text: h.p.name,
          place: h.p,
          note,
          when,
          optional: optional || undefined,
          choice: choice || undefined,
          book: h.p.book || k === bookIdx || undefined,
          closedToday: h.p.closed?.includes(weekday) ? `Cierra los ${WEEKDAY_PLURAL[weekday]}` : undefined,
        }
        byPlace.set(h.p.id, a)
        activities.push(a)
        created.push(a)
      })
    }

    if (tail.trim()) {
      const last = created[created.length - 1]
      if (last) last.note = joinNote(last.note, tail)
      else notes.push(tidy(tail))
    }
  }
  return { activities, notes, alerts }
}

// ---------- Tramos ----------

function detectMode(s: string): Mode {
  const n = norm(s)
  if (/avion|vuelo|flight/.test(n)) return 'avion'
  if (/\bbus\b|flixbus|autobus/.test(n)) return 'bus'
  if (/ferry|barco/.test(n)) return 'barco'
  return 'tren'
}

const CARRIER_RE =
  /\b(LATAM|Air France|Wizz Air|Ryanair|Iberia|Vueling|KLM|Lufthansa|LOT|Brussels Airlines|Eurowings|Austrian|SWISS|TAP|ITA Airways|Transavia|easyJet|Norwegian|SAS|Finnair|Eurostar|Eurocity Direct|Eurocity|ICE|Railjet|IC|EC|Rodalies R\d+(?: Sud)?|FlixBus|TGV|Ouigo|RegioJet|Nightjet)\b/

const splitSentences = (s: string) => sentences(s)

/** Duración del tramo principal: "Tren BRU ~17-20 min; vuelo 2h; WAW-centro ~20-30 min" → "2h". */
function pickDuration(col: string, mode: Mode): { main?: string; parts: string[] } {
  const parts = col
    .split(/;\s*/)
    .map((p) => tidy(p))
    .filter(Boolean)
  if (!parts.length) return { parts }
  const kw = mode === 'avion' ? /vuelo|avi[oó]n/i : mode === 'bus' ? /\bbus/i : /tren/i
  const part = parts.length > 1 ? (parts.find((p) => kw.test(p)) ?? parts[0]) : parts[0]
  const token = part.match(/~?\d+\s*h(?:\s*\d{1,2})?(?:\s*c\/u)?|~?\d+\s*min(?:\s*c\/u)?/i)?.[0]
  return { main: token ?? (part.length <= 14 ? part : undefined), parts }
}

type LegContext = Pick<Day, 'index' | 'n' | 'date' | 'kind' | 'from' | 'to' | 'excursion'> & { base?: CityRef }

function buildLeg(day: LegContext, c: Record<Col, string>): Leg | undefined {
  const detail = cleanCell(c.detalle)
  let from: CityRef | undefined
  let to: CityRef | undefined
  let roundTrip = false
  let optional = false

  if (day.kind === 'transfer') {
    from = day.from
    to = day.to
  } else if (day.kind === 'excursion') {
    from = day.base
    to = day.excursion
    roundTrip = true
  } else if (/ida y vuelta/i.test(detail) && /→/.test(detail) && day.base) {
    const key = findCity(detail.split('→')[1] ?? '', [day.base.key])
    if (!key) return undefined
    from = day.base
    to = { key, name: getCity(key)!.name }
    roundTrip = true
    optional = /opcional/i.test(detail)
  }
  if (!from || !to) return undefined

  const altMatch = detail.match(/\.?\s*(Alternativas[^:]*|Salidas de ejemplo|Otras opciones)\s*:\s*/i)
  const main = altMatch ? detail.slice(0, altMatch.index) : detail
  const alt = altMatch ? detail.slice((altMatch.index ?? 0) + altMatch[0].length) : ''

  const parts = main.split(/\n+|\s*\|\s*/).map((p) => p.trim()).filter(Boolean)
  const lines: LegLine[] = []
  for (const p of parts) {
    if (/^escala/i.test(p)) lines.push({ kind: 'layover', text: tidy(p) })
    else if (/^total/i.test(p)) lines.push({ kind: 'total', text: tidy(p) })
    else if (/^trayecto\s+casa/i.test(p)) splitSentences(p).forEach((s) => lines.push({ kind: 'note', text: s }))
    else {
      const sents = splitSentences(p)
      const arrowIdx = sents.findIndex((s) => /→/.test(s))
      const segIdx = arrowIdx >= 0 ? arrowIdx : 0
      sents.forEach((s, i) => lines.push({ kind: i === segIdx ? 'segment' : 'note', text: s }))
    }
  }

  // Horarios solo de los segmentos principales (no de notas como "el primero sale a las 04:14" o el Transvip al aeropuerto).
  const segText = lines
    .filter((l) => l.kind === 'segment')
    .map((l) => l.text)
    .join(' ')
  const times = segText.match(/\b\d{1,2}:\d{2}\b/g) ?? []
  const depart = times[0]?.padStart(5, '0')
  const arrive = times.length > 1 ? times[times.length - 1].padStart(5, '0') : undefined

  const layover = main.match(/Escala\s+(?:en\s+)?([A-Z]{3})\s+([~\d][\w~]*)/)
  let via: string | undefined
  if (layover) {
    const city = main.match(new RegExp(`([A-ZÀ-Ý][\\wÀ-ÿ ]*?)\\s*\\(${layover[1]}\\)`))?.[1]
    via = `Escala en ${city ? `${city} (${layover[1]})` : layover[1]} · ${layover[2]}`
  }

  const mode = detectMode(`${cleanCell(c.transporte)} ${detail}`)
  const dur = pickDuration(cleanCell(c.duracion), mode)
  const durationRaw = dur.main ?? main.match(/\((~?\d+\s?h\s?\d*|~?\d+\s?min)/)?.[1]
  if (dur.parts.length > 1) lines.push({ kind: 'note', text: `Tiempos: ${dur.parts.join(' · ')}` })
  const costRaw = cleanCell(c.valor)
  const costNote = costRaw.match(/\(([^)]*)\)/)?.[1]
  const status = /cotizad/i.test(costRaw)
    ? 'Cotizado'
    : /incluid/i.test(costRaw)
      ? 'Incluido'
      : /^~|estimad/i.test(costRaw)
        ? 'Estimado'
        : undefined

  const modeLabel = cleanCell(c.transporte) || (mode === 'avion' ? 'Avión' : 'Tren')
  const minutes = parseMinutes(durationRaw)

  return {
    id: `leg-${day.n}`,
    dayIndex: day.index,
    date: day.date,
    mode,
    modeLabel,
    from,
    to,
    roundTrip,
    optional,
    duration: durationRaw || undefined,
    minutes: minutes && roundTrip && /c\/u/.test(durationRaw ?? '') ? minutes * 2 : minutes,
    depart,
    arrive,
    nextDay: !!(depart && arrive && arrive < depart),
    codes: [...new Set((segText || main).match(/\b[A-Z]{2}\d{2,4}\b/g) ?? [])],
    carrier: main.match(CARRIER_RE)?.[1],
    via,
    cost: costRaw ? tidy(costRaw.replace(/\([^)]*\)/, '')) : undefined,
    costNote,
    status,
    lines,
    altLabel: altMatch?.[1],
    alternatives: alt.split(/;\s*|\.\s+/).map((x) => tidy(x)).filter(Boolean),
  }
}

// ---------- Alojamiento ----------

const LODGING_STATUS = /^(reservad[oa]|reserva confirmada|confirmad[oa]|opci[oó]n posible|opci[oó]n|pendiente|pre-?reserva)\b/i

function parseOptions(text: string, cityName = ''): LodgingOption[] {
  const opts: LodgingOption[] = []
  let group = ''
  for (const raw of text.split('\n')) {
    const line = raw.trim()
    if (!line) continue
    if (/^https?:\/\//.test(line)) {
      const last = opts[opts.length - 1]
      if (last && !last.url) last.url = line
      continue
    }
    if (/^[-•]\s/.test(line)) {
      let body = line.slice(2).trim()
      const url = body.match(/https?:\/\/\S+/)?.[0]
      if (url) body = body.replace(url, '').replace(/\s*[—–-]\s*$/, '').trim()
      const [name, ...rest] = body.split(/\s+[—–]\s+/)
      const cleanName = name.trim()
      opts.push({
        group,
        name: cleanName,
        detail: rest.join(' · ').trim(),
        url,
        mapsUrl: mapsUrl(`${stripParens(cleanName)} ${cityName}`.trim()),
      })
      continue
    }
    if (line.endsWith(':')) group = line.slice(0, -1).trim()
  }
  return opts
}

export function parseLodging(text: string, cityName = ''): Lodging | undefined {
  const [first, ...others] = text.split(/\n\s*\n/)
  if (!LODGING_STATUS.test(first.trim())) return undefined
  const m = first.trim().match(/^([^(:]+?)\s*(?:\(([^)]*)\))?\s*:\s*([\s\S]*)$/)
  if (!m) return undefined
  const rest = m[3].replace(/https?:\/\/\S+/g, '').trim()

  let nameRaw = ''
  let address: string | undefined
  let body = ''

  if (/\s+[—–]\s+/.test(rest)) {
    const [n, ...after] = rest.split(/\s+[—–]\s+/)
    nameRaw = n
    body = after.join(' — ')
  } else {
    const dotIdx = rest.indexOf('. ')
    const firstSent = dotIdx >= 0 ? rest.slice(0, dotIdx) : rest
    const afterDot = dotIdx >= 0 ? rest.slice(dotIdx + 2) : ''
    const commaParts = splitOutside(firstSent, /,\s*/g, []).map((p) => p.text.trim()).filter(Boolean)
    nameRaw = commaParts[0] ?? firstSent
    const addrParts = commaParts.slice(1).filter((p) => !/\b(room|bed|suite|studio|habitaci[oó]n)\b/i.test(p))
    if (addrParts.length > 0) address = addrParts.join(', ')
    body = [commaParts.slice(1).join(', '), afterDot].filter(Boolean).join('. ')
  }

  const phone = rest.match(/(\+\d[\d\s-]{7,}\d)/)?.[1]?.trim()
  const cleanName = tidy(
    nameRaw.replace(/\(([^)]*)\)/g, (_, inner: string) => {
      const parts = inner
        .split(/,\s*/)
        .filter((p) => !/^\+\d/.test(p.trim()))
        .map((p) => p.trim())
        .filter(Boolean)
      return parts.length ? `(${parts.join(' · ')})` : ''
    }),
  )

  const status = capitalize(m[1].trim().toLowerCase())
  const hours = body.match(/((?:check-?in|llegada)\s+desde\s+\d{1,2}:\d{2}(?:,\s*(?:check-?out|salida)\s+hasta\s+\d{1,2}:\d{2})?)/i)?.[1]?.trim()

  return {
    status,
    confirmed: /reservad|confirmad/i.test(status),
    meta: m[2],
    name: cleanName,
    address,
    hours,
    phone,
    price: body.match(/total(?: final| pagado)?\s*(?:de\s*)?(\$?\s?[\d.,]+\s*(?:USD|EUR|CLP|PLN|HUF|€)?)/i)?.[1]?.trim(),
    paid: /pagad|tarifa no reembolsable|itinerario expedia/i.test(body),
    code: body.match(/(?:c[oó]digo(?: de reserva)?|itinerario expedia):?\s*([A-Z0-9]{5,})/i)?.[1],
    refund: body.match(/((?:reembolso|cancelaci[oó]n|tarifa no reembolsable)[^.\n]*)/i)?.[1]?.trim(),
    breakfast: body.match(/(desayuno[^.,\n]*)/i)?.[1]?.trim(),
    url: first.match(/https?:\/\/\S+/)?.[0],
    options: parseOptions(others.join('\n'), cityName),
  }
}

// ---------- Acompañante (columna "Toño") ----------

function companionRange(text: string, year: number): [string, string] | null {
  const m = text.match(/\((\d{1,2})(?:\s*([a-z]{3}))?\s*[-–]\s*(\d{1,2})\s*([a-z]{3})\)/i)
  if (!m) return null
  const end = parseDayMonth(`${m[3]} ${m[4]}`)
  const start = parseDayMonth(`${m[1]} ${m[2] ?? m[4]}`)
  if (!start || !end) return null
  return [toIso(year, start.m, start.d), toIso(year, end.m, end.d)]
}

// ---------- Viaje completo ----------

export function buildTrip(rows: string[][]): Trip {
  const header = rows[0] ?? []
  const idx = {} as Record<Col, number>
  let companionLabel = ''
  header.forEach((h, i) => {
    const k = headerKey(h)
    if (!k) return
    const col = HEADERS.find(([, prefixes]) => prefixes.some((p) => k.startsWith(p)))?.[0]
    if (col && idx[col] === undefined) {
      idx[col] = i
      if (col === 'companion') companionLabel = h.trim()
    }
  })
  const get = (r: string[], c: Col) => (idx[c] === undefined ? '' : (r[idx[c]] ?? '').trim())

  const all = rows.flat().join(' ')
  let year = +(all.match(/\b(20\d{2})-\d{2}-\d{2}\b/)?.[1] ?? all.match(/\b(20\d{2})\b/)?.[1] ?? new Date().getFullYear())
  let prevMonth = 0

  const days: Day[] = []
  const tips: string[] = []
  let companionText = ''

  for (const r of rows.slice(1)) {
    const cells = Object.fromEntries(HEADERS.map(([c]) => [c, get(r, c)])) as Record<Col, string>
    const dm = cells.dia ? parseDayMonth(cells.fecha) : null
    if (!dm) {
      const text = r.map((x) => x.trim()).filter(Boolean).join(' ')
      if (text.length > 20) tips.push(text)
      continue
    }
    if (dm.y) year = dm.y
    else if (dm.m < prevMonth) year++
    prevMonth = dm.m
    const date = toIso(year, dm.m, dm.d)
    const weekday = weekdayOf(date)

    const stage = cells.etapa
    let kind: Day['kind'] = 'stay'
    let from: CityRef | undefined
    let to: CityRef | undefined
    let excursion: CityRef | undefined
    let base: CityRef | undefined
    if (/→|->/.test(stage)) {
      const [a, b] = stage.split(/→|->/)
      from = cityRef(a)
      to = cityRef(b ?? '')
      kind = 'transfer'
    } else if (stage.includes('+')) {
      const [a, b] = stage.split('+')
      base = cityRef(a)
      excursion = cityRef(b ?? '')
      kind = 'excursion'
    } else {
      base = cityRef(stage)
    }

    const n = Number(cells.dia) || days.length + 1
    const index = days.length
    const leg = buildLeg({ index, n, date, kind, from, to, excursion, base }, cells)

    // Día de traslado: si sale de tarde, el día "pertenece" a la ciudad de origen.
    const city =
      kind === 'transfer'
        ? leg?.depart && +leg.depart.slice(0, 2) >= 15
          ? from!
          : to!
        : base!
    const sleep = kind === 'transfer' ? (leg?.nextDay ? null : to!) : base!

    const cityKeys = [excursion?.key, city.key, from?.key, to?.key, leg?.to.key].filter((k): k is string => !!k)

    if (cells.companion) companionText = cells.companion
    let companion: Companion | undefined
    if (companionText && companionLabel) {
      const range = companionRange(companionText, year)
      if (!range || (date >= range[0] && date <= range[1])) {
        const key = findCity(companionText)
        companion = { label: companionLabel, text: companionText, together: !!key && (key === city.key || key === sleep?.key) }
      }
    }

    const country = countryOf(excursion ?? city)
    const locations = parseLocations(cells.ubicaciones)
    const activeCityName = (excursion ?? city).name
    const plan = extractActivities(cells.actividad, cityKeys, weekday, activeCityName)
    for (const a of plan.activities) {
      a.mapsUrl = matchActivityMapUrl(a, locations, activeCityName)
    }
    const alerts: string[] = [...plan.alerts]
    const holiday = HOLIDAYS.find((h) => h.md === date.slice(5) && h.country === country?.code)
    if (holiday) alerts.push(holiday.text)
    if (weekday === 0 && country?.sundayNote) alerts.push(country.sundayNote)

    days.push({
      index,
      n,
      date,
      weekday,
      stage,
      kind,
      city,
      from,
      to,
      excursion,
      sleep,
      summary: cells.actividad,
      activities: plan.activities,
      locations,
      notes: plan.notes,
      localTransport: kind === 'stay' ? cleanCell(cells.transporte) || undefined : undefined,
      localCost: kind === 'stay' && !leg ? cleanCell(cells.valor) || undefined : undefined,
      leg,
      weather: cleanCell(cells.clima) || undefined,
      temp: cleanCell(cells.temperatura) || undefined,
      clothing: cleanCell(cells.ropa) || undefined,
      lodgingNote: cleanCell(cells.alojamiento) || undefined,
      companion,
      alerts,
    })
  }

  // Estadías: noches consecutivas en la misma ciudad.
  const stays: Stay[] = []
  for (const d of days) {
    const last = stays[stays.length - 1]
    if (!d.sleep) continue
    const prevDay = days[d.index - 1]
    if (last && last.city.name === d.sleep.name && prevDay?.sleep?.name === d.sleep.name) {
      last.nights++
      last.checkOut = addDays(d.date, 1)
      last.dayIndexes.push(d.index)
    } else {
      stays.push({ id: `stay-${d.sleep.key ?? d.sleep.name}-${d.date}`, city: d.sleep, checkIn: d.date, checkOut: addDays(d.date, 1), nights: 1, dayIndexes: [d.index], notes: [] })
    }
  }
  const stayOf = (i: number) => stays.find((s) => s.dayIndexes.includes(i))
  for (const d of days) {
    const own = stayOf(d.index)
    const prev = d.kind === 'transfer' ? stayOf(d.index - 1) : undefined

    if (d.lodgingNote) {
      const parsed = parseLodging(d.lodgingNote, own?.city.name)
      if (parsed) {
        if (own && !own.lodging) own.lodging = parsed
      } else {
        // Texto libre: cada oración va a la estadía de la ciudad que menciona
        // ("Checkout…" a la que se deja; "Alojamiento en Varsovia: …" a Varsovia).
        for (const s of sentences(d.lodgingNote)) {
          if (/^misma (reserva|estad[ií]a)/i.test(s)) continue
          const key = findCity(s)
          const target = key
            ? ([own, prev].find((x) => x?.city.key === key) ?? own)
            : /^check-?out/i.test(s)
              ? (prev ?? own)
              : own
          if (!target) continue
          if (target.lodging && norm(s).includes(norm(target.lodging.name))) continue
          if (!target.lodging && !/^(check-?out|misma (reserva|estad[ií]a))|por reservar|pendiente|sin reserva|no hay reserva|\bllega|opci[oó]n|cotiz/i.test(s)) {
            const body = s.replace(/^alojamiento(?:\s+en\s+[^:]+)?:\s*/i, '').replace(/^en\s+/i, '')
            const name = capitalize(tidy(body.replace(/\([^)]*\)/g, '')))
            const extra = body.match(/\(([^)]*)\)/)?.[1]
            if (name) {
              target.lodging = { status: 'Confirmado', confirmed: true, name, price: extra ? capitalize(extra) : undefined, paid: false, options: [] }
              continue
            }
          }
          const cleanNote = s.replace(/\s*[—–-]\s*misma (reserva|estad[ií]a)[^.]*/i, '').trim()
          if (cleanNote && !target.notes.includes(cleanNote)) target.notes.push(cleanNote)
        }
      }
    }

    // Vincular ubicaciones de alojamiento de la columna Ubicaciones (Google Maps)
    for (const loc of d.locations) {
      if (loc.kind !== 'lodging') continue
      const key = findCity(loc.label)
      const target = key ? ([own, prev].find((x) => x?.city.key === key) ?? own) : own
      if (!target) continue
      const isGenericSearch = /^opciones de alojamiento/i.test(loc.label)
      if (!isGenericSearch) {
        target.mapsUrl ??= loc.url
        if (target.lodging) {
          target.lodging.mapsUrl ??= loc.url
          if (!target.lodging.address && loc.note) target.lodging.address = loc.note
          if (!target.lodging.address && /Mlynarska\+19/i.test(loc.url)) target.lodging.address = 'ul. Młynarska 19, Wola, Varsovia'
        }
      } else {
        target.mapsUrl ??= loc.url
      }
    }
  }

  for (const s of stays) {
    if (s.lodging) {
      s.lodging.mapsUrl ??=
        s.mapsUrl && !/Hoteles\+/i.test(s.mapsUrl)
          ? s.mapsUrl
          : mapsUrl(`${stripParens(s.lodging.name)} ${s.lodging.address ?? s.city.name}`.trim())
    }
    s.mapsUrl ??= s.lodging?.mapsUrl ?? mapsUrl(`Hoteles ${s.city.name} Centro`)
  }

  // Bloques del itinerario: días seguidos en la misma ciudad.
  const blocks: Block[] = []
  for (const d of days) {
    const last = blocks[blocks.length - 1]
    if (last && last.city.name === d.city.name) last.days.push(d)
    else blocks.push({ city: d.city, days: [d] })
  }
  blocks.forEach((b, i) => {
    if (i === 0) {
      if (b.days[0].kind === 'transfer' && b.days[0].from?.name === b.city.name) b.label = 'Salida'
      return
    }
    const prev = blocks[i - 1]
    const link = [prev.days[prev.days.length - 1], b.days[0]].find((d) => d.kind === 'transfer' && d.leg)
    b.legIn = link?.leg
    if (i === blocks.length - 1 && b.city.name === blocks[0].city.name) b.label = 'Regreso'
  })

  const legs = days.flatMap((d) => (d.leg ? [d.leg] : []))
  const lastDay = days[days.length - 1]
  return {
    days,
    legs,
    stays,
    blocks,
    tips,
    start: days[0]?.date ?? '',
    end: lastDay ? (lastDay.leg?.nextDay ? addDays(lastDay.date, 1) : lastDay.date) : '',
  }
}
