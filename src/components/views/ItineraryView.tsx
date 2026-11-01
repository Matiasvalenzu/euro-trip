import React, { useState } from 'react'
import type { ItineraryItem } from '../../types/travel'
import {
  Clock,
  MapPin,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Info,
  Ticket
} from 'lucide-react'

interface ItineraryViewProps {
  items: ItineraryItem[]
}

export const ItineraryView: React.FC<ItineraryViewProps> = ({ items }) => {
  const [selectedCity, setSelectedCity] = useState<string>('todas')
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({})

  // Distinct cities
  const cities = ['todas', ...Array.from(new Set(items.map((i) => i.ciudad))).filter(Boolean)]

  // Filter items
  const filteredItems = items.filter((item) => {
    if (selectedCity !== 'todas' && item.ciudad !== selectedCity) return false
    return true
  })

  // Group items by date
  const groupedByDate: Record<string, ItineraryItem[]> = {}
  filteredItems.forEach((item) => {
    const d = item.fecha || 'Sin fecha'
    if (!groupedByDate[d]) {
      groupedByDate[d] = []
    }
    groupedByDate[d].push(item)
  })

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  // Format date helper
  const formatDateHeader = (dStr: string) => {
    if (!dStr || dStr === 'Sin fecha') return 'Actividades sin fecha'
    if (dStr.includes('/')) return dStr
    const parts = dStr.split('-').map(Number)
    if (parts.length === 3) {
      const dt = new Date(parts[0], parts[1] - 1, parts[2])
      return dt.toLocaleDateString('es-CL', {
        weekday: 'short',
        day: 'numeric',
        month: 'short'
      })
    }
    return dStr
  }

  return (
    <div className="space-y-4 pb-24 px-4 pt-3 max-w-md mx-auto">
      {/* Header and City Filter Pills */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-bold text-slate-100 m-0">Itinerario Completo</h2>
          <span className="text-xs text-slate-400">{filteredItems.length} actividades</span>
        </div>

        {/* Horizontal scrolling city pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-2 scrollbar-none">
          {cities.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCity(c)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all active:scale-95 capitalize ${
                selectedCity === c
                  ? 'bg-[#7ea172] text-[#121417] shadow-sm shadow-[#7ea172]/30'
                  : 'bg-[#191c22] text-slate-300 border border-[#272c36] hover:border-slate-500'
              }`}
            >
              {c === 'todas' ? 'Todas las ciudades' : c}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline grouped by day */}
      {Object.keys(groupedByDate).length === 0 ? (
        <div className="p-8 rounded-2xl bg-[#191c22] border border-[#272c36] text-center text-slate-400 text-xs">
          No hay actividades registradas para el filtro seleccionado.
        </div>
      ) : (
        <div className="space-y-5">
          {Object.entries(groupedByDate).map(([dateStr, dayItems]) => (
            <div key={dateStr} className="space-y-2.5">
              {/* Date Header Pill */}
              <div className="sticky top-14 z-20 bg-[#121417]/95 backdrop-blur-md py-1 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-[#7ea172]"></span>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#96bb89] capitalize m-0">
                    {formatDateHeader(dateStr)}
                  </h3>
                </div>
                <span className="text-[10px] text-slate-400 font-medium">
                  {dayItems[0]?.ciudad}
                </span>
              </div>

              {/* Items for this day */}
              <div className="space-y-2 border-l-2 border-[#222630] ml-1 pl-3">
                {dayItems.map((item) => {
                  const isExpanded = !!expandedIds[item.id]

                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleExpand(item.id)}
                      className="p-3.5 rounded-2xl bg-[#191c22] border border-[#272c36] hover:border-slate-600 transition-all cursor-pointer shadow-sm active:scale-[0.99]"
                    >
                      {/* Top Bar: Time & City */}
                      <div className="flex items-center justify-between text-xs mb-1">
                        <div className="flex items-center space-x-1.5">
                          {(item.horaInicio || item.horaFin) && (
                            <span className="inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#1e281f] text-[#96bb89] border border-[#2d422f]">
                              <Clock className="w-2.5 h-2.5 mr-1" />
                              {item.horaInicio}{item.horaFin ? ` - ${item.horaFin}` : ''}
                            </span>
                          )}
                          <span className="inline-flex items-center text-[10px] text-slate-400 font-medium">
                            <MapPin className="w-2.5 h-2.5 mr-0.5 text-slate-500" />
                            {item.ciudad}
                          </span>
                        </div>

                        {item.costoEstimado && (
                          <span className="text-[10px] font-semibold text-slate-300 bg-[#222630] px-1.5 py-0.5 rounded">
                            {item.costoEstimado}
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <div className="flex items-start justify-between gap-2 mt-1">
                        <h4 className="text-sm font-bold text-slate-100 leading-snug m-0">
                          {item.actividad}
                        </h4>
                        <div className="text-slate-400 p-0.5 shrink-0">
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </div>
                      </div>

                      {/* Expandable details */}
                      {isExpanded && (
                        <div className="mt-3 pt-3 border-t border-[#272c36] space-y-2.5 animate-in fade-in duration-150">
                          {item.notas && (
                            <div className="p-2.5 rounded-xl bg-[#121417] border border-[#222630] text-xs text-slate-300 flex items-start gap-2">
                              <Info className="w-3.5 h-3.5 text-[#7ea172] shrink-0 mt-0.5" />
                              <p className="leading-relaxed text-[11px]">{item.notas}</p>
                            </div>
                          )}

                          {item.linkReserva && (
                            <div className="pt-1">
                              <a
                                href={item.linkReserva}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="w-full py-2 px-3 rounded-xl bg-[#1e281f] hover:bg-[#28392a] text-[#96bb89] border border-[#2d422f] text-xs font-semibold flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                              >
                                <Ticket className="w-3.5 h-3.5" />
                                Abrir reserva / entradas
                                <ExternalLink className="w-3 h-3 ml-0.5" />
                              </a>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
