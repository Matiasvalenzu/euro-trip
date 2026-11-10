import { CircleCheck, Circle, ExternalLink } from 'lucide-react'
import type { Trip } from '../types/travel'
import { ESSENTIALS } from '../data/resources'
import { fmtRange, fmtShort } from '../lib/dates'
import { useStored } from '../hooks/useStored'

interface Item {
  id: string
  title: string
  note: string
  url?: string
}

function buildGroups(trip: Trip): { title: string; items: Item[] }[] {
  const stays: Item[] = trip.stays
    .filter((s) => !s.lodging?.confirmed)
    .map((s) => ({
      id: `stay:${s.id}`,
      title: s.lodging ? `Confirmar alojamiento en ${s.city.name}` : `Reservar alojamiento en ${s.city.name}`,
      note: `${fmtRange(s.checkIn, s.checkOut)} · ${s.nights} ${s.nights === 1 ? 'noche' : 'noches'}${s.lodging ? ` · opción: ${s.lodging.name}` : ''}`,
    }))

  const legs: Item[] = trip.legs
    .filter((l) => !l.optional && (l.status === 'Cotizado' || l.status === 'Estimado'))
    .map((l) => ({
      id: `leg:${l.id}:${l.date}`,
      title: `Comprar ${l.mode === 'avion' ? 'vuelo' : 'tren'} ${l.from.name} ${l.roundTrip ? '⇄' : '→'} ${l.to.name}`,
      note: `${fmtShort(l.date)} · ${l.status?.toLowerCase()} ${l.cost ?? ''}`.trim(),
    }))

  const seen = new Set<string>()
  const tickets: Item[] = []
  for (const d of trip.days) {
    for (const a of d.activities) {
      if (!a.book || !a.place || seen.has(a.place.id)) continue
      seen.add(a.place.id)
      tickets.push({ id: `book:${a.place.id}`, title: `Entradas: ${a.place.name}`, note: `${fmtShort(d.date)} · ${d.excursion?.name ?? d.city.name}`, url: a.place.url })
    }
  }

  return [
    { title: 'Alojamiento', items: stays },
    { title: 'Traslados por comprar', items: legs },
    { title: 'Entradas con reserva', items: tickets },
    { title: 'Antes de salir', items: ESSENTIALS },
  ].filter((g) => g.items.length)
}

function useChecklist(trip: Trip) {
  const [done, setDone] = useStored<Record<string, boolean>>('eurotrip_checklist_v1', {})
  const groups = buildGroups(trip)
  const all = groups.flatMap((g) => g.items)
  const doneCount = all.filter((i) => done[i.id]).length
  const toggle = (id: string) => setDone((p) => ({ ...p, [id]: !p[id] }))
  return { groups, done, doneCount, total: all.length, toggle }
}

function ItemRow({ item, checked, onToggle }: { item: Item; checked: boolean; onToggle: () => void }) {
  return (
    <li className="flex items-start gap-3 py-2.5">
      <button type="button" onClick={onToggle} aria-pressed={checked} aria-label={item.title} className="flex min-w-0 flex-1 items-start gap-3 text-left">
        {checked ? <CircleCheck className="mt-0.5 size-5 shrink-0 text-ok" /> : <Circle className="mt-0.5 size-5 shrink-0 text-ink-3" />}
        <span className="min-w-0">
          <span className={`block text-[15px] font-medium leading-snug ${checked ? 'text-ink-3 line-through' : ''}`}>{item.title}</span>
          <span className="block text-[13px] leading-snug text-ink-2">{item.note}</span>
        </span>
      </button>
      {item.url && (
        <a href={item.url} target="_blank" rel="noopener noreferrer" aria-label={`Abrir sitio: ${item.title}`} className="mt-0.5 p-1 text-accent">
          <ExternalLink className="size-4" />
        </a>
      )}
    </li>
  )
}

/** Lista de pendientes. `limit` muestra solo los primeros pendientes (vista Hoy). */
export function Checklist({ trip, limit }: { trip: Trip; limit?: number }) {
  const { groups, done, doneCount, total, toggle } = useChecklist(trip)
  const pct = total ? Math.round((doneCount / total) * 100) : 0

  const header = (
    <div className="mb-1">
      <div className="flex items-baseline justify-between text-[14px]">
        <span className="font-semibold">
          {doneCount} de {total} listos
        </span>
        <span className="text-ink-3">{pct} %</span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-2">
        <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )

  if (limit) {
    const pending = groups.flatMap((g) => g.items).filter((i) => !done[i.id]).slice(0, limit)
    return (
      <div>
        {header}
        <ul className="divide-y divide-line">
          {pending.map((i) => (
            <ItemRow key={i.id} item={i} checked={false} onToggle={() => toggle(i.id)} />
          ))}
        </ul>
      </div>
    )
  }

  return (
    <div>
      {header}
      {groups.map((g) => (
        <div key={g.title} className="mt-3">
          <div className="text-[12px] font-semibold uppercase tracking-[0.08em] text-ink-3">{g.title}</div>
          <ul className="divide-y divide-line">
            {g.items.map((i) => (
              <ItemRow key={i.id} item={i} checked={!!done[i.id]} onToggle={() => toggle(i.id)} />
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
