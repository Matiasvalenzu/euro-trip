import { RefreshCw, Settings, TriangleAlert, WifiOff } from 'lucide-react'

interface HeaderProps {
  syncing: boolean
  online: boolean
  error: string | null
  updated?: number
  onRefresh: () => void
  onSos: () => void
  onSettings: () => void
}

function ago(ts?: number): string {
  if (!ts) return 'Sin datos todavía'
  const min = Math.round((Date.now() - ts) / 60000)
  if (min < 1) return 'Al día'
  if (min < 60) return `Al día · hace ${min} min`
  const h = Math.round(min / 60)
  if (h < 24) return `Revisado hace ${h} h`
  return `Revisado el ${new Date(ts).toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })}`
}

export function Header({ syncing, online, error, updated, onRefresh, onSos, onSettings }: HeaderProps) {
  const status = syncing ? 'Actualizando…' : !online ? 'Sin conexión · usando copia guardada' : ago(updated)
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-bg/90 pt-[env(safe-area-inset-top)] backdrop-blur-lg">
      <div className="mx-auto flex h-14 max-w-lg items-center gap-2 px-4">
        <img src="favicon.svg" alt="" className="size-8 rounded-lg" />
        <div className="min-w-0 flex-1">
          <div className="font-display text-[19px] font-semibold leading-none">EuroTrip</div>
          <div className="mt-1 flex items-center gap-1 truncate text-[12px] text-ink-3">
            {!online && <WifiOff className="size-3 shrink-0" />}
            {status}
          </div>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          disabled={syncing || !online}
          aria-label="Actualizar desde la planilla"
          className="grid size-10 place-items-center rounded-full text-ink-2 active:bg-surface-2 disabled:opacity-40"
        >
          <RefreshCw className={`size-5 ${syncing ? 'animate-spin' : ''}`} />
        </button>
        <button type="button" onClick={onSos} className="h-9 rounded-full bg-danger px-3.5 text-[14px] font-bold tracking-wide text-danger-ink active:scale-95">
          SOS
        </button>
        <button type="button" onClick={onSettings} aria-label="Ajustes" className="grid size-10 place-items-center rounded-full text-ink-2 active:bg-surface-2">
          <Settings className="size-5" />
        </button>
      </div>
      {error && online && (
        <div className="mx-auto flex max-w-lg items-start gap-2 px-4 pb-2.5 text-[13px] text-warn">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" />
          <span className="min-w-0 flex-1">{error}</span>
          <button type="button" onClick={onRefresh} className="shrink-0 font-semibold underline">
            Reintentar
          </button>
        </div>
      )}
    </header>
  )
}
