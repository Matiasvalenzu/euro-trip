import type { Activity, Block, CityRef, Companion, Day, Leg, LegLine, Lodging, LodgingOption, Mode, Place, Stay, Trip } from '../types/travel'
import { CITIES, HOLIDAYS, cityRef, countryOf, findCity } from '../data/destinations'
import { PLACES } from '../data/places'
import { capitalize, cleanCell, isWordChar, norm, tidy } from './text'
import { WEEKDAY_PLURAL, addDays, parseDayMonth, parseMinutes, toIso, weekdayOf } from './dates'

type Col = 'dia' | 'fecha' | 'companion' | 'etapa' | 'actividad' | 'transporte' | 'duracion' | 'valor' | 'clima' | 'temperatura' | 'ropa' | 'detalle' | 'alojamiento'

// Encabezados de la planilla (normalizados) → columna. Se compara por prefijo.
const HEADERS: [Col, string[]][] = [
  ['dia', ['dia']], ['fecha', ['fecha']], ['companion', ['tono']], ['etapa', ['ciudad', 'etapa']],
  ['actividad', ['actividad']], ['transporte', ['transporte']], ['duracion', ['duracion']],
  ['valor', ['valor', 'costo', 'precio']], ['clima', ['clima']], ['temperatura', ['temperatura']],
  ['ropa', ['vestimenta', 'ropa']], ['detalle', ['detalle']], ['alojamiento', ['alojamiento']],
]

const headerKey = (h: string) => norm(h).replace(/[^a-z0-9]/g, '')

// ---------- Actividades ----------

const STOP = new Set(
  'a al con de del dia e el en hace la las los min o opcional para paseo por recorrido reserva reservar anticipacion si tarde manana noche temprano tren excursion iluminados iluminado iluminada atardecer castillo museo vistas y visita'.split(' '),
)

function plainKind(t: string): Activity['kind'] {
  const n = norm(t)
  if (/dormir|descans|jet lag/.test(n)) return 'rest'
  if (/vuelo|avion|aeropuerto/.test(n)) return 'flight'
  if (/\btren\b/.test(n)) return 'train'
  if (/llegada|check-?in|check-?out/.test(n)) return 'arrive'
  return 'other'
}

const plain = (t: string): Activity => {
  const text = capitalize(tidy(t))
  return { kind: plainKind(text), text }
}

export function extractActivities(text: string, cityKeys: string[], weekday: number): Activity[] {
  const out: Activity[] = []
  const seen = new Set<string>()
  const candidates = PLACES.filter((p) => cityKeys.includes(p.city)).sort((a, b) => cityKeys.indexOf(a.city) - cityKeys.indexOf(b.city))

  const segments = text.replace(/^\s*excursi[oó]n:\s*/i, '').split(/[.;,](?=\s|$)|\s+y\s+|\s+e\s+/)
  for (const raw of segments) {
    const seg = tidy(raw ?? '')
    if (!seg) continue
    const n = norm(seg)

    const hits: { s: number; e: number; p: Place }[] = []
    for (const p of candidates) {
      for (const a of p.aliases) {
        for (let i = n.indexOf(a); i !== -1; i = n.indexOf(a, i + 1)) {
          if (!isWordChar(n[i - 1]) && !isWordChar(n[i + a.length])) hits.push({ s: i, e: i + a.length, p })
        }
      }
    }
    hits.sort((x, y) => x.s - y.s || y.e - y.s - (x.e - x.s))
    const picked: typeof hits = []
    let end = -1
    for (const h of hits) {
      if (h.s >= end) {
        picked.push(h)
        end = h.e
      }
    }

    if (!picked.length) {
      out.push(plain(seg))
      continue
    }

    // Texto que sobra fuera de los lugares reconocidos (p. ej. "Día libre compras tapas").
    let left = ''
    let pos = 0
    for (const h of picked) {
      left += seg.slice(pos, h.s) + ' '
      pos = h.e
    }
    left += seg.slice(pos)
    const words = norm(left).split(/[^a-z0-9ñœ]+/).filter((w) => w.length > 2 && !STOP.has(w) && !/^\d+$/.test(w))
    if (words.length >= 2) out.push(plain(left))

    const optional = /^(o|opcional)\b/i.test(seg)
    const reserveAt = n.indexOf('reserv')
    let bookIdx = -1
    if (reserveAt >= 0) {
      bookIdx = 0
      picked.forEach((h, k) => {
        if (h.e <= reserveAt) bookIdx = k
      })
    }
    // "Rijksmuseum o Museo Van Gogh": lugares alternativos.
    const choice = picked.some((h, k) => k > 0 && /(^|\s)o(\s|$)/i.test(seg.slice(picked[k - 1].e, h.s)))
    picked.forEach((h, k) => {
      if (seen.has(h.p.id)) return
      seen.add(h.p.id)
      out.push({
        kind: 'place',
        text: h.p.name,
        place: h.p,
        book: h.p.book || k === bookIdx,
        optional,
        choice,
        closedToday: h.p.closed?.includes(weekday) ? `Cierra los ${WEEKDAY_PLURAL[weekday]}` : undefined,
      })
    })
  }
  return out
}

// ---------- Tramos ----------

function detectMode(s: string): Mode {
  const n = norm(s)
  if (/avion|vuelo|flight/.test(n)) return 'avion'
  if (/\bbus\b|flixbus|autobus/.test(n)) return 'bus'
  if (/ferry|barco/.test(n)) return 'barco'
  return 'tren'
}

const CARRIER_RE = /\b(LATAM|Air France|Wizz Air|Ryanair|Iberia|Vueling|KLM|Lufthansa|easyJet|Eurostar|Eurocity Direct|Eurocity|ICE|Railjet|IC|EC|Rodalies R\d+(?: Sud)?|FlixBus|TGV|Ouigo)\b/

function splitSentences(s: string): string[] {
  return s.split(/\.\s+(?=[A-ZÁÉÍÓÚ])/).map((x) => tidy(x)).filter(Boolean)
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
    to = { key, name: CITIES[key].name }
    roundTrip = true
    optional = /opcional/i.test(detail)
  }
  if (!from || !to) return undefined

  const altMatch = detail.match(/\.?\s*(Alternativas[^:]*|Salidas de ejemplo|Otras opciones)\s*:\s*/i)
  const main = altMatch ? detail.slice(0, altMatch.index) : detail
  const alt = altMatch ? detail.slice((altMatch.index ?? 0) + altMatch[0].length) : ''

  const parts = main.split(/\s*\|\s*/).filter(Boolean)
  const lines: LegLine[] = []
  for (const p of parts) {
    if (/^escala/i.test(p)) lines.push({ kind: 'layover', text: tidy(p) })
    else if (/^total/i.test(p)) lines.push({ kind: 'total', text: tidy(p) })
    else splitSentences(p).forEach((s, i) => lines.push({ kind: i === 0 ? 'segment' : 'note', text: s }))
  }

  const segText = parts.filter((p) => !/^(escala|total)/i.test(p)).join(' ')
  const times = segText.match(/\b\d{1,2}:\d{2}\b/g) ?? []
  const depart = times[0]?.padStart(5, '0')
  const arrive = times.length > 1 ? times[times.length - 1].padStart(5, '0') : undefined

  const layover = main.match(/Escala\s+(?:en\s+)?([A-Z]{3})\s+([~\d][\w~]*)/)
  let via: string | undefined
  if (layover) {
    const city = main.match(new RegExp(`([A-ZÀ-Ý][\\wÀ-ÿ ]*?)\\s*\\(${layover[1]}\\)`))?.[1]
    via = `Escala en ${city ? `${city} (${layover[1]})` : layover[1]} · ${layover[2]}`
  }

  const durationRaw = cleanCell(c.duracion).replace(/\s*vuelo$/i, '') || main.match(/\((~?\d+h\d*|~?\d+\s?min)/)?.[1]
  const costRaw = cleanCell(c.valor)
  const costNote = costRaw.match(/\(([^)]*)\)/)?.[1]
  const status = /cotizad/i.test(costRaw)
    ? 'Cotizado'
    : /incluid/i.test(costRaw)
      ? 'Incluido'
      : /^~|estimad/i.test(costRaw)
        ? 'Estimado'
        : undefined

  const modeLabel = cleanCell(c.transporte) || (detectMode(detail) === 'avion' ? 'Avión' : 'Tren')
  const minutes = parseMinutes(durationRaw)

  return {
    id: `leg-${day.n}`,
    dayIndex: day.index,
    date: day.date,
    mode: detectMode(`${modeLabel} ${detail}`),
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
    codes: [...new Set(main.match(/\b[A-Z]{2}\d{2,4}\b/g) ?? [])],
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

function parseOptions(text: string): LodgingOption[] {
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
      opts.push({ group, name: name.trim(), detail: rest.join(' · ').trim(), url })
      continue
    }
    if (line.endsWith(':')) group = line.slice(0, -1).trim()
  }
  return opts
}

export function parseLodging(text: string): Lodging | undefined {
  const [first, ...others] = text.split(/\n\s*\n/)
  if (!LODGING_STATUS.test(first.trim())) return undefined
  const m = first.trim().match(/^([^(:]+?)\s*(?:\(([^)]*)\))?\s*:\s*([\s\S]*)$/)
  if (!m) return undefined
  const rest = m[3].replace(/https?:\/\/\S+/g, '').trim()
  const [nameRaw, ...after] = rest.split(/\s+[—–]\s+/)
  const body = after.join(' — ')
  const status = capitalize(m[1].trim().toLowerCase())
  return {
    status,
    confirmed: /reservad|confirmad/i.test(status),
    meta: m[2],
    name: tidy(nameRaw),
    price: body.match(/total(?: final| pagado)?\s*(?:de\s*)?(\$?\s?[\d.,]+\s*(?:USD|EUR|CLP|€)?)/i)?.[1]?.trim(),
    paid: /pagad/i.test(body),
    code: body.match(/c[oó]digo(?: de reserva)?:?\s*([A-Z0-9]{5,})/i)?.[1],
    refund: body.match(/((?:reembolso|cancelaci[oó]n)[^.\n]*)/i)?.[1],
    breakfast: body.match(/(desayuno[^.\n]*)/i)?.[1],
    url: first.match(/https?:\/\/\S+/)?.[0],
    options: parseOptions(others.join('\n')),
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
    const alerts: string[] = []
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
      activities: extractActivities(cells.actividad, cityKeys, weekday),
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
    if (!d.lodgingNote) continue
    const parsed = parseLodging(d.lodgingNote)
    if (parsed) {
      const s = stayOf(d.index)
      if (s && !s.lodging) s.lodging = parsed
    } else {
      const s = stayOf(d.kind === 'transfer' ? d.index - 1 : d.index)
      s?.notes.push(d.lodgingNote)
    }
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
