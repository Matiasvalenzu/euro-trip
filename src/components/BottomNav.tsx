import type { ComponentType } from 'react'
import { BedDouble, BookOpen, Route, Sun, TrainFront, Wallet } from 'lucide-react'
import type { TabType } from '../types/travel'

const TABS: { id: TabType; label: string; icon: ComponentType<{ className?: string }> }[] = [
  { id: 'hoy', label: 'Hoy', icon: Sun },
  { id: 'itinerario', label: 'Itinerario', icon: Route },
  { id: 'traslados', label: 'Traslados', icon: TrainFront },
  { id: 'estadias', label: 'Estadías', icon: BedDouble },
  { id: 'gastos', label: 'Gastos', icon: Wallet },
  { id: 'guia', label: 'Guía', icon: BookOpen },
]

export function BottomNav({ active, onSelect }: { active: TabType; onSelect: (t: TabType) => void }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg" aria-label="Secciones">
      <div className="mx-auto grid max-w-lg grid-cols-6 px-1">
        {TABS.map(({ id, label, icon: Icon }) => {
          const on = active === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => onSelect(id)}
              aria-current={on ? 'page' : undefined}
              className={`flex flex-col items-center gap-1 pb-2 pt-2 ${on ? 'text-accent' : 'text-ink-3'}`}
            >
              <span className={`grid h-7 w-12 place-items-center rounded-full transition ${on ? 'bg-accent-soft' : ''}`}>
                <Icon className="size-5" />
              </span>
              <span className={`text-[11px] leading-none ${on ? 'font-bold' : 'font-medium'}`}>{label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
