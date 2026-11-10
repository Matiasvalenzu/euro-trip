import type { ReactNode } from 'react'
import {
  BedDouble, ChevronRight, Cloud, CloudDrizzle, CloudFog, CloudLightning, CloudRain, CloudSnow, CloudSun,
  Coins, Footprints, KeyRound, MapPin, Moon, Plane, Shirt, Sun, TrainFront, TriangleAlert, Users,
} from 'lucide-react'
import type { Activity, Day, Leg, Place, TabType, Trip } from '../types/travel'
import type { Forecast } from '../services/weather'
import { forecastFor, wxLabel } from '../services/weather'
import { fmtTemp } from '../lib/text'
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

export function ActivityList({ day, onPlace }: { day: Day; onPlace: (p: Place, date: string) => void }) {
  let num = 0
  if (!day.activities.length) return null
  return (
    <div>
      <div className="mb-1 text-[12px] font-semibold uppercase tracking-[0.08em] text-ink-3">Plan del día</div>
      <ul className="divide-y divide-line">
        {day.activities.map((a, i) => {
          if (a.kind !== 'place' || !a.place) {
            return (
              <li key={i} className="flex items-start gap-3 py-2.5">
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-surface-2 text-ink-3">{PLAIN_ICON[a.kind === 'place' ? 'other' : a.kind]}</span>
                <span className="min-w-0 pt-0.5 text-[14px] leading-snug text-ink-2">{a.text}</span>
              </li>
            )
          }
          num++
          const place = a.place
          return (
            <li key={i}>
              <button type="button" onClick={() => onPlace(place, day.date)} className="flex w-full items-start gap-3 py-2.5 text-left active:opacity-70">
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-accent-soft text-[13px] font-bold text-accent">{num}</span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] font-semibold leading-snug">{a.text}</span>
                  <span className="mt-0.5 block text-[13px] leading-snug text-ink-2">{place.blurb}</span>
                  {(a.book || a.closedToday || a.optional || a.choice) && (
                    <span className="mt-1.5 flex flex-wrap gap-1.5">
                      {a.closedToday && <Chip tone="danger">{a.closedToday}</Chip>}
                      {a.book && <Chip tone="warn">Reservar entrada</Chip>}
                      {a.optional && <Chip>Opcional</Chip>}
                      {a.choice && !a.optional && <Chip>Una u otra</Chip>}
                    </span>
                  )}
                </span>
                <ChevronRight className="mt-1 size-4 shrink-0 text-ink-3" />
              </button>
            </li>
          )
        })}
      </ul>
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
          <span>{t}</span>
        </div>
      ))}
    </div>
  )
}

export function DayInfo({ day, trip, forecast, onTab }: { day: Day; trip: Trip; forecast: Forecast; onTab: (t: TabType) => void }) {
  const wx = forecastFor(day, forecast)
  const stay = trip.stays.find((s) => s.dayIndexes.includes(day.index))
  return (
    <div className="divide-y divide-line rounded-xl border border-line px-3">
      {(day.weather || day.temp || wx) && (
        <Row icon={wx ? <WxIcon code={wx.code} /> : <Cloud className="size-4" />} label="Clima">
          {[day.weather, fmtTemp(day.temp)].filter(Boolean).join(' · ')}
          {wx && (
            <span className="mt-1 block text-[13px] text-accent">
              Pronóstico actual: {wx.min}–{wx.max} °C, {wxLabel(wx.code).toLowerCase()}
              {wx.pop != null && wx.pop > 0 ? `, ${wx.pop} % de lluvia` : ''}
            </span>
          )}
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
      <button type="button" onClick={() => onTab('estadias')} className="block w-full text-left">
        <Row icon={<BedDouble className="size-4" />} label="Dónde duermen">
          {!day.sleep ? (
            'En el avión (noche en tránsito)'
          ) : stay?.lodging ? (
            <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span>{stay.lodging.name}</span>
              <Chip tone={stay.lodging.confirmed ? 'ok' : 'warn'}>{stay.lodging.confirmed ? 'Reservado' : stay.lodging.status}</Chip>
            </span>
          ) : (
            <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span>{day.sleep.name}</span>
              <Chip tone="danger">Sin reserva</Chip>
            </span>
          )}
        </Row>
      </button>
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
  onPlace: (p: Place, date: string) => void
  onLeg: (l: Leg) => void
  onTab: (t: TabType) => void
}) {
  return (
    <div className="space-y-4">
      {day.leg && <LegCard leg={day.leg} onOpen={() => onLeg(day.leg!)} />}
      <ActivityList day={day} onPlace={onPlace} />
      <DayAlerts day={day} />
      <DayInfo day={day} trip={trip} forecast={forecast} onTab={onTab} />
    </div>
  )
}
