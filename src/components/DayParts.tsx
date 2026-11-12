import type { ReactNode } from 'react'
import {
  BedDouble, ChevronRight, Cloud, CloudDrizzle, CloudFog, CloudLightning, CloudRain, CloudSnow, CloudSun,
  Coins, ExternalLink, Footprints, Info, KeyRound, MapPin, Moon, Plane, Shirt, Sun, TrainFront, TriangleAlert, Users,
} from 'lucide-react'
import type { Activity, Day, Leg, TabType, Trip } from '../types/travel'
import type { Forecast } from '../services/weather'
import { forecastFor, wxLabel } from '../services/weather'
import { fmtTemp, shortTemp } from '../lib/text'
import { LegCard } from './LegCard'
import { Chip, Row } from './ui'

export function WxIcon({ code, className = 'size-4' }: { code: number; className?: string }) {
  const Icon =
    code === 0 ? Sun : code <= 2 ? CloudSun : code === 3 ? Cloud : code <= 48 ? CloudFog : code <= 57 ? CloudDrizzle : code <= 67 || (code >= 80 && code <= 82) ? CloudRain : code <= 86 ? CloudSnow : code >= 95 ? CloudLightning : Cloud
  return <Icon className={className} aria-hidden />
}

const PLAIN_ICON: Record<Exclude<Activity['kind'], 'place'>, ReactNode> = {
  flight: <Plane className="size-3.5" />,
  train: <TrainFront className="size-3.5" />,
  arrive: <KeyRound className="size-3.5" />,
  rest: <Moon className="size-3.5" />,
  other: <Footprints className="size-3.5" />,
}

export function ActivityList({ day, onPlace }: { day: Day; onPlace: (a: Activity, d: Day) => void }) {
  let num = 0
  if (!day.activities.length) return null
  return (
    <div>
      <div className="mb-1 text-[12px] font-semibold uppercase tracking-[0.08em] text-ink-3">Plan del día</div>
      <ul className="divide-y divide-line">
        {day.activities.map((a, i) => {
          if (a.kind !== 'place') {
            return (
              <li key={i} className="flex items-start gap-3 py-2.5">
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-surface-2 text-ink-3">{PLAIN_ICON[a.kind]}</span>
                <span className="min-w-0 flex-1 pt-0.5 text-[14px] leading-snug text-ink-2 break-words">
                  {a.when && <span className="mr-1.5 text-[12px] font-semibold uppercase tracking-[0.06em] text-ink-3">{a.when}</span>}
                  {a.text}
                </span>
                {a.mapsUrl && (
                  <a
                    href={a.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Abrir ${a.text} en Google Maps`}
                    className="grid size-8 shrink-0 place-items-center rounded-full bg-surface-2 text-accent active:scale-95"
                  >
                    <MapPin className="size-4" />
                  </a>
                )}
              </li>
            )
          }
          num++
          return (
            <li key={i} className="flex items-start gap-2 py-2.5">
              <button type="button" onClick={() => onPlace(a, day)} className="flex min-w-0 flex-1 items-start gap-3 text-left active:opacity-70">
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-accent-soft text-[13px] font-bold text-accent">{num}</span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] font-semibold leading-snug">{a.text}</span>
                  {a.note && <span className="mt-0.5 block text-[13px] leading-snug text-ink break-words">{a.note}</span>}
                  {a.place ? (
                    <span className="mt-0.5 block text-[13px] leading-snug text-ink-3">{a.place.blurb}</span>
                  ) : (
                    <span className="mt-0.5 block text-[13px] font-medium text-accent">Ver guía del lugar</span>
                  )}
                  {(a.when || a.book || a.closedToday || a.optional || a.choice) && (
                    <span className="mt-1.5 flex flex-wrap gap-1.5">
                      {a.when && <Chip>{a.when}</Chip>}
                      {a.closedToday && <Chip tone="danger">{a.closedToday}</Chip>}
                      {a.book && <Chip tone="warn">Reservar entrada</Chip>}
                      {a.optional && <Chip>Opcional</Chip>}
                      {a.choice && <Chip>Una u otra</Chip>}
                    </span>
                  )}
                </span>
                <ChevronRight className="mt-1 size-4 shrink-0 text-ink-3" />
              </button>
              {a.mapsUrl && (
                <a
                  href={a.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Abrir ${a.text} en Google Maps`}
                  title="Ver en Google Maps"
                  className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-surface-2 text-accent active:scale-95"
                >
                  <MapPin className="size-4" />
                </a>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export function DayNotes({ day }: { day: Day }) {
  if (!day.notes.length) return null
  return (
    <div className="space-y-2">
      {day.notes.map((t, i) => (
        <div key={i} className="flex gap-2.5 rounded-xl bg-surface-2 px-3 py-2.5 text-[14px] leading-snug text-ink">
          <Info className="mt-0.5 size-4 shrink-0 text-ink-3" />
          <span className="min-w-0 break-words">{t}</span>
        </div>
      ))}
    </div>
  )
}

export function DayAlerts({ day }: { day: Day }) {
  if (!day.alerts.length) return null
  return (
    <div className="space-y-2">
      {day.alerts.map((t, i) => (
        <div key={i} className="flex gap-2.5 rounded-xl bg-warn-soft px-3 py-2.5 text-[14px] leading-snug text-ink">
          <TriangleAlert className="mt-0.5 size-4 shrink-0 text-warn" />
          <span className="min-w-0 break-words">{t}</span>
        </div>
      ))}
    </div>
  )
}

export function DayLocations({ day }: { day: Day }) {
  if (!day.locations.length) return null
  return (
    <div>
      <div className="mb-1.5 text-[12px] font-semibold uppercase tracking-[0.08em] text-ink-3">Ubicaciones en Google Maps</div>
      <div className="flex flex-wrap gap-1.5">
        {day.locations.map((loc, i) => (
          <a
            key={i}
            href={loc.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex max-w-full items-center gap-1.5 rounded-xl border border-line bg-surface-2 px-2.5 py-1.5 text-[13px] font-medium text-ink active:scale-[0.98]"
          >
            {loc.kind === 'lodging' ? (
              <BedDouble className="size-3.5 shrink-0 text-accent" />
            ) : loc.kind === 'transport' ? (
              <TrainFront className="size-3.5 shrink-0 text-accent" />
            ) : (
              <MapPin className="size-3.5 shrink-0 text-accent" />
            )}
            <span className="truncate">{loc.label}</span>
            {loc.note && <span className="truncate text-[12px] text-ink-3">· {loc.note}</span>}
            <ExternalLink className="size-3 shrink-0 text-ink-3" />
          </a>
        ))}
      </div>
    </div>
  )
}

export function DayInfo({ day, trip, forecast, onTab }: { day: Day; trip: Trip; forecast: Forecast; onTab: (t: TabType) => void }) {
  const wx = forecastFor(day, forecast)
  const stay = trip.stays.find((s) => s.dayIndexes.includes(day.index))
  const stayMapsUrl = stay?.lodging?.mapsUrl ?? stay?.mapsUrl
  return (
    <div className="divide-y divide-line rounded-xl border border-line px-3">
      {(day.weather || day.temp || wx) && (
        <Row icon={wx ? <WxIcon code={wx.code} /> : <Cloud className="size-4" />} label="Clima">
          {wx ? (
            <span className="block font-semibold">
              {wx.min}–{wx.max} °C · {wxLabel(wx.code)}
              {wx.pop != null && wx.pop > 0 ? ` · ${wx.pop} % lluvia` : ''}
              <span className="ml-1.5 text-[12px] font-normal text-ink-3">pronóstico actual</span>
            </span>
          ) : (
            shortTemp(day.temp) && <span className="block font-semibold">{shortTemp(day.temp)}</span>
          )}
          {day.weather && <span className="mt-0.5 block text-[13px] text-ink-2">{day.weather}</span>}
          {day.temp && (wx || fmtTemp(day.temp) !== shortTemp(day.temp)) && <span className="mt-0.5 block text-[13px] text-ink-3">{fmtTemp(day.temp)}</span>}
        </Row>
      )}
      {day.clothing && (
        <Row icon={<Shirt className="size-4" />} label="Qué ponerse">
          {day.clothing}
        </Row>
      )}
      {day.localTransport && (
        <Row icon={<MapPin className="size-4" />} label="Para moverse">
          {day.localTransport}
        </Row>
      )}
      {day.localCost && (
        <Row icon={<Coins className="size-4" />} label="Gasto estimado">
          {day.localCost}
        </Row>
      )}
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => onTab('estadias')} className="min-w-0 flex-1 text-left">
          <Row icon={<BedDouble className="size-4" />} label="Dónde duermen">
            {!day.sleep ? (
              'En el avión (noche en tránsito)'
            ) : stay?.lodging ? (
              <span className="block">
                <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span>{stay.lodging.name}</span>
                  <Chip tone={stay.lodging.confirmed ? 'ok' : 'warn'}>{stay.lodging.confirmed && stay.lodging.status !== 'Confirmado' ? 'Reservado' : stay.lodging.status}</Chip>
                </span>
                {stay.lodging.address && <span className="mt-0.5 block text-[13px] text-ink-2">{stay.lodging.address}</span>}
              </span>
            ) : (
              <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span>{day.sleep.name}</span>
                <Chip tone="danger">Sin reserva</Chip>
              </span>
            )}
          </Row>
        </button>
        {day.sleep && stayMapsUrl && (
          <a
            href={stayMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Ver alojamiento en ${day.sleep.name} en Google Maps`}
            title="Ver alojamiento en Google Maps"
            className="grid size-8 shrink-0 place-items-center rounded-full bg-surface-2 text-accent active:scale-95"
          >
            <MapPin className="size-4" />
          </a>
        )}
      </div>
      {day.companion && (
        <Row icon={<Users className="size-4" />} label={`Dónde está ${day.companion.label}`}>
          <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span>{day.companion.text}</span>
            {day.companion.together && <Chip tone="accent">¡Coinciden!</Chip>}
          </span>
        </Row>
      )}
    </div>
  )
}

export function DayBody({ day, trip, forecast, onPlace, onLeg, onTab }: {
  day: Day
  trip: Trip
  forecast: Forecast
  onPlace: (a: Activity, d: Day) => void
  onLeg: (l: Leg) => void
  onTab: (t: TabType) => void
}) {
  return (
    <div className="space-y-4">
      {day.leg && <LegCard leg={day.leg} onOpen={() => onLeg(day.leg!)} />}
      <ActivityList day={day} onPlace={onPlace} />
      <DayLocations day={day} />
      <DayAlerts day={day} />
      <DayNotes day={day} />
      <DayInfo day={day} trip={trip} forecast={forecast} onTab={onTab} />
    </div>
  )
}
