import { useState } from 'react'
import { TrainFront } from 'lucide-react'
import type { Trip } from '../../types/travel'
import { LegCard } from '../LegCard'
import { Empty, PageTitle } from '../ui'

type Filter = 'todos' | 'ciudades' | 'excursiones'

export function TransportView({ trip }: { trip: Trip }) {
  const [filter, setFilter] = useState<Filter>('todos')
  const main = trip.legs.filter((l) => !l.optional)
  const flights = main.filter((l) => l.mode === 'avion').length
  const trains = main.filter((l) => l.mode === 'tren').length
  const minutes = main.reduce((acc, l) => acc + (l.minutes ?? 0), 0)

  const legs = trip.legs.filter((l) => (filter === 'todos' ? true : filter === 'ciudades' ? !l.roundTrip : l.roundTrip))
  const tabs: [Filter, string][] = [
    ['todos', 'Todos'],
    ['ciudades', 'Ciudades'],
    ['excursiones', 'Excursiones'],
  ]

  return (
    <div className="space-y-4">
      <PageTitle
        title="Traslados"
        subtitle={`${flights} vuelos y ${trains} trenes · unas ${Math.round(minutes / 60)} horas de viaje en total`}
      />

      <div className="grid grid-cols-3 gap-1 rounded-xl bg-surface-2 p-1" role="tablist">
        {tabs.map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={filter === id}
            onClick={() => setFilter(id)}
            className={`rounded-lg py-2 text-[14px] font-semibold transition ${filter === id ? 'bg-surface text-ink shadow-sm' : 'text-ink-2'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {legs.length === 0 ? (
        <Empty icon={<TrainFront className="size-6" />} title="Sin traslados">
          No hay tramos de este tipo en la planilla.
        </Empty>
      ) : (
        <div className="space-y-3">
          {legs.map((l) => (
            <LegCard key={l.id} leg={l} />
          ))}
        </div>
      )}
    </div>
  )
}
