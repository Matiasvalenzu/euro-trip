import React, { useState } from 'react'
import type { TransportItem } from '../../types/travel'
import {
  Plane,
  Train,
  Bus,
  Clock,
  ArrowRight,
  Copy,
  Check,
  ExternalLink,
  Ticket
} from 'lucide-react'

interface TransportViewProps {
  items: TransportItem[]
}

export const TransportView: React.FC<TransportViewProps> = ({ items }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const handleCopyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  // Get appropriate icon for transport type
  const getTransportIcon = (typeStr: string) => {
    const t = (typeStr || '').toLowerCase()
    if (t.includes('vuelo') || t.includes('avion') || t.includes('flight')) {
      return <Plane className="w-4 h-4 text-sky-400" />
    }
    if (t.includes('tren') || t.includes('ave') || t.includes('renfe') || t.includes('sncf') || t.includes('train')) {
      return <Train className="w-4 h-4 text-emerald-400" />
    }
    if (t.includes('flixbus') || t.includes('bus') || t.includes('autobus')) {
      return <Bus className="w-4 h-4 text-lime-400" />
    }
    return <Plane className="w-4 h-4 text-slate-300" />
  }

  return (
    <div className="space-y-4 pb-24 px-4 pt-3 max-w-md mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-100 m-0">Transportes del Viaje</h2>
          <p className="text-xs text-slate-400 mt-0.5">Vuelos, trenes y buses de ciudad a ciudad</p>
        </div>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#1e281f] text-[#96bb89] border border-[#2d422f]">
          {items.length} tramos
        </span>
      </div>

      {items.length === 0 ? (
        <div className="p-8 rounded-2xl bg-[#191c22] border border-[#272c36] text-center text-slate-400 text-xs">
          No hay transportes registrados en la pestaña "Transporte".
        </div>
      ) : (
        <div className="space-y-3.5">
          {items.map((tr) => (
            <div
              key={tr.id}
              className="p-4 rounded-2xl bg-[#191c22] border border-[#272c36] hover:border-slate-600 transition-all shadow-sm space-y-3"
            >
              {/* Type, service & date */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 rounded-lg bg-[#121417] border border-[#272c36]">
                    {getTransportIcon(tr.tipo)}
                  </div>
                  <div>
                    <span className="font-bold text-slate-200 capitalize">{tr.tipo}</span>
                    {tr.numeroServicio && (
                      <span className="text-[11px] text-slate-400 ml-1.5 font-mono">
                        ({tr.numeroServicio})
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] font-semibold text-slate-300 bg-[#222630] px-2 py-0.5 rounded-md">
                    {tr.fecha}
                  </span>
                </div>
              </div>

              {/* Route: Origin -> Destination */}
              <div className="p-3 rounded-xl bg-[#121417] border border-[#222630]">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Origen</span>
                    <span className="text-sm font-bold text-slate-100">{tr.origen}</span>
                  </div>

                  <div className="px-2 flex flex-col items-center">
                    <ArrowRight className="w-4 h-4 text-[#7ea172]" />
                    {tr.duracion && (
                      <span className="text-[9px] text-slate-400 font-mono mt-0.5">{tr.duracion}</span>
                    )}
                  </div>

                  <div className="flex-1 text-right">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Destino</span>
                    <span className="text-sm font-bold text-slate-100">{tr.destino}</span>
                  </div>
                </div>

                {tr.hora && (
                  <div className="mt-2 pt-2 border-t border-[#1d222b] flex items-center justify-between text-xs">
                    <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                      <Clock className="w-3 h-3 text-slate-400" />
                      Hora de salida:
                    </span>
                    <span className="font-bold text-slate-200">{tr.hora}</span>
                  </div>
                )}
              </div>

              {/* Confirmation Code & Ticket Link */}
              <div className="flex items-center justify-between pt-1 gap-2">
                {tr.codigoConfirmacion ? (
                  <div className="flex items-center space-x-1.5 bg-[#121417] px-2.5 py-1.5 rounded-xl border border-[#272c36] text-xs">
                    <span className="text-[10px] text-slate-400 uppercase">PNR:</span>
                    <span className="font-mono font-bold text-emerald-400">{tr.codigoConfirmacion}</span>
                    <button
                      onClick={() => handleCopyCode(tr.id, tr.codigoConfirmacion!)}
                      className="text-slate-400 hover:text-white p-0.5 active:scale-95 transition-all"
                      title="Copiar código"
                    >
                      {copiedId === tr.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                ) : (
                  <div />
                )}

                {tr.linkBillete && (
                  <a
                    href={tr.linkBillete}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-1.5 px-3 rounded-xl bg-[#1e281f] hover:bg-[#28392a] text-[#96bb89] border border-[#2d422f] text-xs font-semibold flex items-center gap-1 active:scale-95 transition-all"
                  >
                    <Ticket className="w-3.5 h-3.5" />
                    Billete / Check-in
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
