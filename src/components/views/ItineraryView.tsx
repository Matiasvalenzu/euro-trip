import { useEffect, useState } from 'react'
import { BookOpen, ChevronDown, TriangleAlert } from 'lucide-react'
import type { Day, Leg, Place, TabType, Trip } from '../../types/travel'
import { forecastFor, type Forecast } from '../../services/weather'
import { CITIES, countryOf, flagOf } from '../../data/destinations'
import { dateTile, fmtRange, fmtShort, todayIso } from '../../lib/dates'
import { fmtTemp } from '../../lib/text'
import { DayBody, WxIcon } from '../DayParts'
import { LegConnector } from '../LegCard'
import { Chip, Eyebrow, ModeChip, PageTitle } from '../ui'

interface Props {
  trip: Trip
  forecast: Forecast
  onPlace: (p: Place, date: string) => void
  onLeg: (l: Leg) => void
  onCity: (key: string) => void
  onTab: (t: TabType) => void
}

function dayTitle(d: Day): string {
  if (d.kind === 'transfer') return `${d.from?.name} → ${d.to?.name}`
  if (d.kind === 'excursion') return `Excursión a ${d.excursion?.name}`
  const places = d.activities.filter((a) => a.place).map((a) => a.text)
  if (!places.length) return d.activities[0]?.text ?? d.summary
  return places.slice(0, 3).join(' · ') + (places.length > 3 ? ` y ${places.length - 3} más` : '')
}

function legChip(leg: Leg): string {
  const base = leg.mode === 'avion' ? 'Avión' : leg.mode === 'bus' ? 'Bus' : 'Tren'
  return [`${base}${leg.roundTrip ? ' ida y vuelta' : ''}`, leg.duration].filter(Boolean).join(' · ')
}

function DayCard({ day, open, isToday, onToggle, ...rest }: { day: Day; open: boolean; isToday: boolean; onToggle: () => void } & Omit<Props, 'onCity'>) {
  const tile = dateTile(day.date)
  const wx = forecastFor(day, rest.forecast)
  const places = day.activities.filter((a) => a.place)
  const sub = day.kind !== 'stay' && places.length ? places.map((a) => a.text).join(' · ') : ''
  const otherCountry = day.excursion && countryOf(day.excursion)?.code !== countryOf(day.city)?.code
  const hasClosure = day.activities.some((a) => a.closedToday)

  return (
    <div id={`day-${day.n}`} className={`scroll-mt-24 rounded-2xl border bg-surface ${isToday ? 'border-accent' : 'border-line'}`}>
      <button type="button" onClick={onToggle} aria-expanded={open} className="flex w-full items-start gap-3 p-3.5 text-left">
        <span className="flex w-12 shrink-0 flex-col items-center rounded-xl bg-surface-2 py-1.5">
          <span className="text-[11px] font-semibold uppercase text-ink-3">{tile.wd}</span>
          <span className="text-[21px] font-bold leading-none tabular-nums">{tile.d}</span>
          <span className="text-[11px] uppercase text-ink-3">{tile.mo}</span>
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.06em] text-ink-3">
            Día {day.n}
            {isToday && <Chip tone="accent">Hoy</Chip>}
          </span>
          <span className="mt-0.5 block text-[16px] font-semibold leading-snug">{dayTitle(day)}</span>
          {sub && <span className="mt-0.5 block text-[13px] leading-snug text-ink-2 line-clamp-2">{sub}</span>}
          <span className="mt-2 flex flex-wrap gap-1.5">
            {day.leg && <ModeChip mode={day.leg.mode}>{legChip(day.leg)}</ModeChip>}
            {otherCountry && (
              <Chip>
                {flagOf(day.excursion)} {countryOf(day.excursion)?.name}
              </Chip>
            )}
            {wx ? (
              <Chip icon={<WxIcon code={wx.code} className="size-3.5" />}>
                {wx.min}–{wx.max} °C
              </Chip>
            ) : (
              day.temp && <Chip>{fmtTemp(day.temp)}</Chip>
            )}
            {(day.alerts.length > 0 || hasClosure) && (
              <Chip tone="warn" icon={<TriangleAlert className="size-3.5" />}>
                Ojo
              </Chip>
            )}
          </span>
        </span>
        <ChevronDown className={`mt-1 size-5 shrink-0 text-ink-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="border-t border-line px-3.5 pb-4 pt-3">
          <DayBody day={day} {...rest} />
        </div>
      )}
    </div>
  )
}

export function ItineraryView({ onCity, ...dayProps }: Props) {
  const { trip, onLeg } = dayProps
  const today = todayIso()
  const todayDay = trip.days.find((d) => d.date === today)
  const [open, setOpen] = useState<Set<number>>(() => new Set(todayDay ? [todayDay.index] : []))

  useEffect(() => {
    if (todayDay) document.getElementById(`day-${todayDay.n}`)?.scrollIntoView({ block: 'start' })
  }, [todayDay])

  const toggle = (i: number) =>
    setOpen((prev) => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })

  const countries = new Set<string>()
  const cities = new Set<string>()
  for (const d of trip.days) {
    for (const ref of [d.city, d.excursion, d.leg && !d.leg.optional ? d.leg.to : undefined]) {
      if (!ref?.key || ref.key === 'santiago') continue
      cities.add(ref.key)
      countries.add(CITIES[ref.key].country)
    }
  }

  const allOpen = open.size === trip.days.length

  return (
    <div className="space-y-4">
      <PageTitle
        title="Itinerario"
        subtitle={`${trip.days.length} días · ${countries.size} países · ${cities.size} ciudades · ${fmtShort(trip.start)} al ${fmtShort(trip.end)}`}
      />

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 no-scrollbar">
        {todayDay && (
          <button
            type="button"
            onClick={() => document.getElementById(`day-${todayDay.n}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            className="shrink-0 rounded-full bg-accent px-3.5 py-2 text-[14px] font-semibold text-accent-ink"
          >
            Hoy
          </button>
        )}
        {trip.blocks.map((b, i) => (
          <button
            key={i}
            type="button"
            onClick={() => document.getElementById(`block-${i}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            className="shrink-0 whitespace-nowrap rounded-full border border-line bg-surface px-3.5 py-2 text-[14px] font-medium"
          >
            {flagOf(b.city)} {b.city.name}
          </button>
        ))}
      </div>

      <div className="flex justify-end px-1">
        <button
          type="button"
          onClick={() => setOpen(allOpen ? new Set() : new Set(trip.days.map((d) => d.index)))}
          className="text-[14px] font-semibold text-accent"
        >
          {allOpen ? 'Cerrar todos los días' : 'Abrir todos los días'}
        </button>
      </div>

      <div>
        {trip.blocks.map((b, i) => {
          const first = b.days[0]
          const last = b.days[b.days.length - 1]
          const country = countryOf(b.city)
          return (
            <section key={i} id={`block-${i}`} className="scroll-mt-20">
              {b.legIn && <LegConnector leg={b.legIn} onOpen={() => onLeg(b.legIn!)} />}
              <div className="flex items-end justify-between gap-3 px-1 pb-3 pt-3">
                <div className="min-w-0">
                  <Eyebrow>
                    {country?.flag} {country?.name ?? ''}
                    {b.label ? ` · ${b.label}` : ''}
                  </Eyebrow>
                  <h2 className="mt-0.5 font-display text-[38px] font-semibold leading-[1.05] tracking-tight">{b.city.name}</h2>
                  <p className="mt-1 text-[14px] text-ink-2">
                    {b.days.length === 1 ? fmtShort(first.date) : fmtRange(first.date, last.date)} · {b.days.length} {b.days.length === 1 ? 'día' : 'días'}
                  </p>
                </div>
                {b.city.key && b.city.key !== 'santiago' && (
                  <button
                    type="button"
                    onClick={() => onCity(b.city.key!)}
                    className="mb-1 inline-flex shrink-0 items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-2 text-[13px] font-semibold text-accent"
                  >
                    <BookOpen className="size-4" />
                    Guía
                  </button>
                )}
              </div>
              <div className="space-y-2.5">
                {b.days.map((d) => (
                  <DayCard key={d.index} day={d} open={open.has(d.index)} isToday={d.date === today} onToggle={() => toggle(d.index)} {...dayProps} />
                ))}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
