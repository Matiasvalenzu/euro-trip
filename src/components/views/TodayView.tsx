import { useState } from 'react'
import { ChevronLeft, ChevronRight, Clock, Coins, Languages, ListChecks, Phone, Plug } from 'lucide-react'
import type { Leg, Place, Rates, TabType, Trip } from '../../types/travel'
import { forecastFor, wxLabel, type Forecast } from '../../services/weather'
import { CITIES, COUNTRIES, countryOf, flagOf } from '../../data/destinations'
import { daysBetween, fmtLong, fmtRange, fmtShort, hoursAhead, timeIn, todayIso } from '../../lib/dates'
import { convert, fmtMoney } from '../../lib/money'
import { useNow } from '../../hooks/useStored'
import { Checklist } from '../Checklist'
import { DayBody, WxIcon } from '../DayParts'
import { LegCard } from '../LegCard'
import { Card, Eyebrow, Row, SectionTitle } from '../ui'

interface Props {
  trip: Trip
  forecast: Forecast
  rates: Rates
  onPlace: (p: Place, date: string) => void
  onLeg: (l: Leg) => void
  onCity: (key: string) => void
  onTab: (t: TabType) => void
}

export function TodayView({ trip, forecast, rates, onPlace, onLeg, onCity, onTab }: Props) {
  const today = todayIso()
  const now = useNow()
  const phase = today < trip.start ? 'before' : today > trip.end ? 'after' : 'during'
  const todayIdx = trip.days.findIndex((d) => d.date === today)
  const [idx, setIdx] = useState(phase === 'before' ? 0 : todayIdx >= 0 ? todayIdx : trip.days.length - 1)
  const day = trip.days[Math.min(idx, trip.days.length - 1)]

  // Ciudad europea de referencia (los días de vuelo desde/hacia Santiago usan la otra punta).
  const euroRef = day.excursion ?? (day.city.key === 'santiago' ? (day.to?.key !== 'santiago' ? day.to : day.from) : day.city)
  const euroCity = euroRef?.key ? CITIES[euroRef.key] : undefined
  const country = countryOf(euroRef) ?? COUNTRIES.NL
  const tz = euroCity?.tz ?? 'Europe/Paris'
  const ahead = hoursAhead(tz, 'America/Santiago', now)
  const wx = forecastFor(day, forecast)
  const firstLeg = trip.legs[0]
  const nextLeg = phase === 'during' ? trip.legs.find((l) => l.date > day.date && !l.optional) : undefined
  const daysLeft = daysBetween(today, trip.start)
  const isToday = day.date === today

  const local = country.currency === 'HUF' ? 1000 : 1
  const essentials = country.emergency.filter((e) => e.number !== '112').slice(0, 2)
  const thanks = country.phrases.find((p) => p[0] === 'Gracias')

  return (
    <div className="space-y-5">
      {phase === 'before' && (
        <>
          <div className="rounded-3xl bg-accent p-5 text-accent-ink">
            <div className="text-[13px] font-semibold uppercase tracking-[0.1em] opacity-80">Cuenta regresiva</div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="font-display text-[68px] font-semibold leading-none tabular-nums">{daysLeft}</span>
              <span className="text-[22px] font-semibold">{daysLeft === 1 ? 'día' : 'días'}</span>
            </div>
            {firstLeg && (
              <p className="mt-3 text-[15px] leading-snug opacity-90">
                Salen el {fmtLong(firstLeg.date)}
                {firstLeg.depart ? ` a las ${firstLeg.depart}` : ''} desde {firstLeg.from.name}. Primera parada: {firstLeg.to.name}.
              </p>
            )}
          </div>

          <div>
            <SectionTitle>La ruta</SectionTitle>
            <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 no-scrollbar">
              {trip.stays.map((s) => (
                <button key={s.id} type="button" onClick={() => s.city.key && onCity(s.city.key)} className="shrink-0 rounded-2xl border border-line bg-surface px-3.5 py-2.5 text-left">
                  <div className="text-[12px] text-ink-3">
                    {flagOf(s.city)} {fmtRange(s.checkIn, s.checkOut)}
                  </div>
                  <div className="font-display text-[19px] font-semibold leading-tight">{s.city.name}</div>
                  <div className="text-[12px] text-ink-2">
                    {s.nights} {s.nights === 1 ? 'noche' : 'noches'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <Card className="p-4">
            <SectionTitle
              icon={<ListChecks className="size-4" />}
              action={
                <button type="button" onClick={() => onTab('guia')} className="text-[14px] font-semibold text-accent">
                  Ver todo
                </button>
              }
            >
              Antes de viajar
            </SectionTitle>
            <Checklist trip={trip} limit={5} />
          </Card>
        </>
      )}

      {phase === 'after' && (
        <div className="rounded-3xl bg-accent p-5 text-accent-ink">
          <div className="font-display text-[28px] font-semibold">¡Bienvenidos de vuelta!</div>
          <p className="mt-1 text-[15px] opacity-90">El itinerario sigue acá para revisar cada día del viaje.</p>
        </div>
      )}

      <Card className="p-4">
        <div className="flex items-center justify-between gap-2">
          <button type="button" onClick={() => setIdx(idx - 1)} disabled={idx === 0} aria-label="Día anterior" className="grid size-10 place-items-center rounded-full bg-surface-2 disabled:opacity-30">
            <ChevronLeft className="size-5" />
          </button>
          <div className="min-w-0 text-center">
            <Eyebrow>{isToday ? `Hoy · día ${day.n} de ${trip.days.length}` : `Día ${day.n} de ${trip.days.length}`}</Eyebrow>
            <div className="text-[15px] font-semibold first-letter:uppercase">{fmtLong(day.date)}</div>
          </div>
          <button
            type="button"
            onClick={() => setIdx(idx + 1)}
            disabled={idx >= trip.days.length - 1}
            aria-label="Día siguiente"
            className="grid size-10 place-items-center rounded-full bg-surface-2 disabled:opacity-30"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>

        <div className="mt-4">
          <Eyebrow>
            {flagOf(day.city)} {countryOf(day.city)?.name}
          </Eyebrow>
          <button
            type="button"
            onClick={() => day.city.key && day.city.key !== 'santiago' && onCity(day.city.key)}
            className="mt-0.5 text-left font-display text-[42px] font-semibold leading-[1.02] tracking-tight"
          >
            {day.city.name}
          </button>
          {day.kind === 'transfer' && (
            <p className="mt-1 text-[15px] text-ink-2">
              Traslado {day.from?.name} → {day.to?.name}
            </p>
          )}
          {day.excursion && (
            <p className="mt-1 text-[15px] text-ink-2">
              Excursión a {flagOf(day.excursion)} {day.excursion.name}
            </p>
          )}
          {wx && (
            <p className="mt-2 flex items-center gap-2 text-[14px] text-ink-2">
              <WxIcon code={wx.code} className="size-5 text-accent" />
              <span>
                <b className="font-semibold text-ink">
                  {wx.min}–{wx.max} °C
                </b>{' '}
                · {wxLabel(wx.code)}
                {wx.pop ? ` · ${wx.pop} % lluvia` : ''}
              </span>
            </p>
          )}
        </div>

        <div className="mt-4">
          <DayBody day={day} trip={trip} forecast={forecast} onPlace={onPlace} onLeg={onLeg} onTab={onTab} />
        </div>
      </Card>

      {nextLeg && (
        <div>
          <SectionTitle>Próximo traslado · {fmtShort(nextLeg.date)}</SectionTitle>
          <LegCard leg={nextLeg} onOpen={() => onLeg(nextLeg)} />
        </div>
      )}

      <Card className="grid grid-cols-2 divide-x divide-line">
        <div className="p-4">
          <Eyebrow>{euroCity?.name ?? 'Europa'}</Eyebrow>
          <div className="mt-1 text-[30px] font-semibold leading-none tabular-nums">{timeIn(tz, now)}</div>
        </div>
        <div className="p-4">
          <Eyebrow>Chile</Eyebrow>
          <div className="mt-1 text-[30px] font-semibold leading-none tabular-nums">{timeIn('America/Santiago', now)}</div>
          <div className="mt-1.5 flex items-center gap-1 text-[12px] text-ink-3">
            <Clock className="size-3" />
            {ahead > 0 ? `Europa va ${ahead} h adelante` : 'Misma hora'}
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <SectionTitle
          action={
            <button type="button" onClick={() => onTab('guia')} className="shrink-0 text-[14px] font-semibold text-accent">
              Más
            </button>
          }
        >
          {country.flag} Lo básico en {country.name}
        </SectionTitle>
        <div className="divide-y divide-line">
          <Row icon={<Coins className="size-4" />} label="Moneda">
            {country.currency === 'EUR' ? 'Euro' : 'Forinto húngaro (HUF)'} · {fmtMoney(local, country.currency)} ≈ {fmtMoney(convert(local, country.currency, 'CLP', rates), 'CLP')}
            {country.currency !== 'EUR' && ` ≈ ${fmtMoney(convert(local, country.currency, 'EUR', rates), 'EUR')}`}
          </Row>
          <Row icon={<Phone className="size-4" />} label="Emergencias">
            <span className="flex flex-wrap gap-x-4 gap-y-1">
              <a href="tel:112" className="font-semibold text-danger">
                112 · todo tipo
              </a>
              {essentials.map((e) => (
                <a key={e.number} href={`tel:${e.number.replace(/\s/g, '')}`} className="font-semibold text-accent">
                  {e.number} · {e.label.toLowerCase()}
                </a>
              ))}
            </span>
          </Row>
          <Row icon={<Languages className="size-4" />} label="Idioma">
            {country.language}
            {thanks && (
              <span className="block text-ink-2">
                «Gracias» se dice <b className="font-semibold text-ink">{thanks[1]}</b>
                {thanks[2] ? ` (${thanks[2]})` : ''}
              </span>
            )}
          </Row>
          <Row icon={<Plug className="size-4" />} label="Enchufes">
            {country.plugs}
          </Row>
        </div>
      </Card>
    </div>
  )
}
