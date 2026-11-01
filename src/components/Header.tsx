import React from 'react'
import { RefreshCw, Settings, WifiOff, AlertCircle, Compass, Sparkles } from 'lucide-react'

interface HeaderProps {
  isSyncing: boolean
  isLoading: boolean
  isOnline: boolean
  syncError: string | null
  lastUpdated: number
  isMock?: boolean
  onRefresh: () => void
  onOpenSettings: () => void
}

export const Header: React.FC<HeaderProps> = ({
  isSyncing,
  isLoading,
  isOnline,
  syncError,
  lastUpdated,
  isMock,
  onRefresh,
  onOpenSettings
}) => {
  // Format relative or short time
  const formatLastSync = (timestamp: number) => {
    if (!timestamp) return 'Nunca'
    const diffMin = Math.round((Date.now() - timestamp) / 60000)
    if (diffMin < 1) return 'Recién'
    if (diffMin < 60) return `hace ${diffMin}m`
    const diffHours = Math.round(diffMin / 60)
    if (diffHours < 24) return `hace ${diffHours}h`
    return new Date(timestamp).toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })
  }

  return (
    <header className="sticky top-0 z-30 bg-[#121417]/95 backdrop-blur-md border-b border-[#272c36] px-4 pt-safe py-3">
      <div className="flex items-center justify-between">
        {/* App Title & Status */}
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#1e281f] border border-[#2d422f] flex items-center justify-center text-[#7ea172]">
            <Compass className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base font-bold text-slate-100 tracking-tight leading-none m-0">EuroTrip</h1>
              {isMock ? (
                <span className="inline-flex items-center text-[10px] font-semibold px-1.5 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-800">
                  <Sparkles className="w-2.5 h-2.5 mr-1" />
                  Demo
                </span>
              ) : !isOnline ? (
                <span className="inline-flex items-center text-[10px] font-medium px-1.5 py-0.5 rounded bg-amber-950/70 text-amber-300 border border-amber-800">
                  <WifiOff className="w-2.5 h-2.5 mr-1" />
                  Offline
                </span>
              ) : (
                <span className="inline-flex items-center text-[10px] font-medium px-1.5 py-0.5 rounded bg-[#1e281f] text-[#96bb89] border border-[#2d422f]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#7ea172] mr-1 animate-ping"></span>
                  Al día
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Sincronizado: <span className="text-slate-300">{formatLastSync(lastUpdated)}</span>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-1.5">
          <button
            onClick={onRefresh}
            disabled={isLoading || isSyncing}
            aria-label="Actualizar datos"
            className="p-2 rounded-lg bg-[#191c22] border border-[#272c36] text-slate-300 hover:text-slate-100 active:scale-95 transition-all disabled:opacity-50"
            title="Recargar desde Google Sheets"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading || isSyncing ? 'animate-spin text-[#7ea172]' : ''}`} />
          </button>

          <button
            onClick={onOpenSettings}
            aria-label="Configuración"
            className="p-2 rounded-lg bg-[#191c22] border border-[#272c36] text-slate-300 hover:text-slate-100 active:scale-95 transition-all"
            title="Configuración de hoja y tasa"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Sync Error Banner */}
      {syncError && !isMock && (
        <div className="mt-2.5 px-3 py-2 rounded-lg bg-amber-950/40 border border-amber-800/60 text-amber-200 text-xs flex items-start justify-between gap-2">
          <div className="flex items-start gap-1.5 flex-1">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span className="leading-tight">{syncError}</span>
          </div>
          <button
            onClick={onRefresh}
            className="text-[11px] font-semibold text-amber-300 underline hover:text-amber-100 shrink-0"
          >
            Reintentar
          </button>
        </div>
      )}
    </header>
  )
}
