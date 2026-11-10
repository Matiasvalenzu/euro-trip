import { useState } from 'react'
import { ChevronDown, ChevronRight, Clock, Info, Ticket } from 'lucide-react'
import type { Leg } from '../types/travel'
import { fmtShort } from '../lib/dates'
import { Card, Chip, LinkButton, ModeBadge, ModeIcon } from './ui'

const modeName = (leg: Leg) => (leg.mode === 'avion' ? 'Vuelo' : leg.mode === 'bus' ? 'Bus' : 'Tren')

function stopsText(leg: Leg): string {
  if (leg.roundTrip) return 'ida y vuelta'
  if (leg.via) return '1 escala'
  const all = leg.lines.map((l) => l.text).join(' ')
  const t = all.match(/(\d+)\s+transbordo/)
  if (t) return `${t[1]} transbordo${t[1] === '1' ? '' : 's'}`
  return /directo/i.test(all) ? 'directo' : ''
}

function buyUrl(leg: Leg): string {
  const s = `${leg.costNote ?? ''} ${leg.carrier ?? ''}`
  if (/NS International/i.test(s)) return 'https://www.nsinternational.com'
  if (/Wizz/i.test(s)) return 'https://wizzair.com'
  if (/Railjet|ÖBB/i.test(s)) return 'https://www.oebb.at'
  if (/\bEC\b|MÁV/.test(s)) return 'https://www.mavcsoport.hu'
  return leg.mode === 'avion' ? 'https://www.google.com/travel/flights' : 'https://www.thetrainline.com'
}

export function LegRoute({ leg }: { leg: Leg }) {
  const hasTimes = !!leg.depart
  const stops = stopsText(leg)
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2">
      <div className="min-w-0">
        {hasTimes ? (
          <>
            <div className="truncate text-[13px] text-ink-2">{leg.from.name}</div>
            <div className="text-[26px] font-semibold leading-tight tabular-nums">{leg.depart}</div>
          </>
        ) : (
          <div className="truncate text-[18px] font-semibold">{leg.from.name}</div>
        )}
      </div>
      <div className="flex flex-col items-center px-1 text-center">
        {leg.duration && <span className="whitespace-nowrap text-[12px] font-semibold text-ink-2">{leg.duration}</span>}
        <span className="my-1 flex items-center gap-1 text-ink-3">
          <span className="h-px w-5 bg-line" />
          <ModeIcon mode={leg.mode} className="size-4" />
          <span className="h-px w-5 bg-line" />
        </span>
        {stops && <span className="whitespace-nowrap text-[11px] text-ink-3">{stops}</span>}
      </div>
      <div className="min-w-0 text-right">
        {hasTimes ? (
          <>
            <div className="truncate text-[13px] text-ink-2">{leg.to.name}</div>
            <div className="text-[26px] font-semibold leading-tight tabular-nums">
              {leg.arrive ?? '—'}
              {leg.nextDay && <sup className="ml-0.5 text-[12px] font-bold text-warn">+1</sup>}
            </div>
          </>
        ) : (
          <div className="truncate text-[18px] font-semibold">{leg.to.name}</div>
        )}
      </div>
    </div>
  )
}

function LegDetails({ leg }: { leg: Leg }) {
  return (
    <div className="mt-3 space-y-3 border-t border-line pt-3">
      <ul className="space-y-2">
        {leg.lines.map((l, i) => (
          <li key={i} className="flex gap-2.5 text-[14px] leading-snug">
            <span className="mt-0.5 shrink-0 text-ink-3">
              {l.kind === 'layover' ? <Clock className="size-4" /> : l.kind === 'segment' ? <ModeIcon mode={leg.mode} className="size-4" /> : <Info className="size-4" />}
            </span>
            <span className={`min-w-0 break-words ${l.kind === 'segment' ? 'text-ink' : 'text-ink-2'}`}>{l.text}</span>
          </li>
        ))}
      </ul>
      {leg.alternatives.length > 0 && (
        <div className="rounded-xl bg-surface-2 p-3">
          <div className="text-[12px] font-semibold uppercase tracking-[0.06em] text-ink-3">{leg.altLabel ?? 'Alternativas'}</div>
          <ul className="mt-1.5 space-y-1">
            {leg.alternatives.map((a, i) => (
              <li key={i} className="text-[14px] leading-snug text-ink-2 break-words">
                {a}
              </li>
            ))}
          </ul>
        </div>
      )}
      {(leg.status === 'Cotizado' || leg.status === 'Estimado') && (
        <LinkButton href={buyUrl(leg)} icon={<Ticket className="size-4" />} className="w-full">
          Buscar y comprar pasajes
        </LinkButton>
      )}
    </div>
  )
}

export function LegCard({ leg, onOpen, defaultOpen = false }: { leg: Leg; onOpen?: () => void; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        <ModeBadge mode={leg.mode} />
        <div className="min-w-0 flex-1">
          <div className="text-[16px] font-semibold leading-tight">
            {leg.from.name} {leg.roundTrip ? '⇄' : '→'} {leg.to.name}
          </div>
          <div className="mt-0.5 text-[13px] text-ink-2">
            {fmtShort(leg.date)} · {modeName(leg)}
            {leg.carrier ? ` ${leg.carrier}` : ''}
            {leg.codes.length ? ` · ${leg.codes.join(' + ')}` : ''}
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          {leg.optional && <Chip>Opcional</Chip>}
          {leg.status && <Chip tone={leg.status === 'Incluido' ? 'ok' : 'warn'}>{leg.status}</Chip>}
        </div>
      </div>

      <div className="mt-4">
        <LegRoute leg={leg} />
      </div>

      {leg.via && (
        <div className="mt-3 flex items-center gap-1.5 text-[13px] text-ink-2">
          <Clock className="size-3.5 shrink-0" />
          {leg.via}
        </div>
      )}

      {leg.cost && (
        <div className="mt-3 flex items-start justify-between gap-3 rounded-xl bg-surface-2 px-3 py-2">
          <span className="text-[13px] text-ink-2">Costo</span>
          <span className="min-w-0 text-right">
            <span className="text-[14px] font-semibold">{leg.cost}</span>
            {leg.costNote && <span className="block text-[12px] leading-snug text-ink-3">{leg.costNote}</span>}
          </span>
        </div>
      )}

      {onOpen ? (
        <button type="button" onClick={onOpen} className="mt-3 flex w-full items-center justify-between text-[14px] font-semibold text-accent">
          Ver detalle del tramo
          <ChevronRight className="size-4" />
        </button>
      ) : (
        <>
          <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} className="mt-3 flex w-full items-center justify-between text-[14px] font-semibold text-accent">
            {open ? 'Ocultar detalle' : 'Ver detalle, horarios y alternativas'}
            <ChevronDown className={`size-4 transition-transform ${open ? 'rotate-180' : ''}`} />
          </button>
          {open && <LegDetails leg={leg} />}
        </>
      )}
    </Card>
  )
}

/** Tramo entre dos ciudades dentro del itinerario. */
export function LegConnector({ leg, onOpen }: { leg: Leg; onOpen: () => void }) {
  return (
    <button type="button" onClick={onOpen} className="group flex w-full items-stretch gap-3 py-1 text-left">
      <span className="flex w-10 flex-col items-center">
        <span className="w-px flex-1 border-l border-dashed border-line" />
        <ModeBadge mode={leg.mode} size="sm" />
        <span className="w-px flex-1 border-l border-dashed border-line" />
      </span>
      <span className="my-2 flex min-w-0 flex-1 items-center gap-2 rounded-2xl border border-dashed border-line px-3.5 py-2.5 active:bg-surface-2">
        <span className="min-w-0 flex-1">
          <span className="block text-[14px] font-semibold">
            {modeName(leg)} {leg.from.name} → {leg.to.name}
          </span>
          <span className="block text-[13px] text-ink-2">
            {[fmtShort(leg.date), leg.depart && `${leg.depart}–${leg.arrive ?? ''}${leg.nextDay ? ' (+1)' : ''}`, leg.duration && `${leg.duration} de viaje`].filter(Boolean).join(' · ')}
          </span>
        </span>
        <ChevronRight className="size-4 shrink-0 text-ink-3" />
      </span>
    </button>
  )
}
