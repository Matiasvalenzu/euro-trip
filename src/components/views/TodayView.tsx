import React, { useState } from 'react'
import type { TravelData, TabType } from '../../types/travel'
import {
  Calendar,
  Clock,
  MapPin,
  Plane,
  Building2,
  ChevronRight,
  Compass,
  ArrowRight,
  Sparkles,
  Ticket
} from 'lucide-react'

interface TodayViewProps {
  data: TravelData
  onNavigateTab: (tab: TabType) => void
}

export const TodayView: React.FC<TodayViewProps> = ({ data, onNavigateTab }) => {
  // Normalize date helper
  const toStandardDate = (d: string) => {
    if (!d) return ''
    if (d.includes('/')) {
      const parts = d.split('/')
      if (parts.length === 3) {
        return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`
      }
    }
    return d.trim()
  }

  // Get current device date in YYYY-MM-DD
  const todayStr = new Date().toISOString().split('T')[0]

  // All distinct dates sorted
  const allDates = Array.from(new Set(data.itinerario.map((i) => toStandardDate(i.fecha)))).filter(Boolean).sort()
  const firstTripDate = allDates[0] || todayStr
  const lastTripDate = allDates[allDates.length - 1] || todayStr

  // Selected date (defaults to today if in range, otherwise first trip date or user selection)
  const isTodayInRange = todayStr >= firstTripDate && todayStr <= lastTripDate
  const [selectedDate, setSelectedDate] = useState<string>(isTodayInRange ? todayStr : firstTripDate)

  // Current active date items
  const todayItinerary = data.itinerario.filter((item) => toStandardDate(item.fecha) === selectedDate)
  const todayTransport = data.transporte.filter((item) => toStandardDate(item.fecha) === selectedDate)
  const todayAccommodation = data.alojamiento.find((item) => {
    const cin = toStandardDate(item.checkIn)
    const cout = toStandardDate(item.checkOut)
    return selectedDate >= cin && selectedDate <= cout
  })

  // Format readable Chilean date
  const formatReadableDate = (dateStr: string) => {
    if (!dateStr) return ''
    const [y, m, d] = dateStr.split('-').map(Number)
    if (!y || !m || !d) return dateStr
    const dateObj = new Date(y, m - 1, d)
    return dateObj.toLocaleDateString('es-CL', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    })
  }

  // Current city
  const currentCity = todayItinerary[0]?.ciudad || todayAccommodation?.ciudad || todayTransport[0]?.destino || 'Europa'

  // Calculate days difference
  const getDaysDiff = (targetDateStr: string) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const [y, m, d] = targetDateStr.split('-').map(Number)
    const target = new Date(y, m - 1, d)
    const diffTime = target.getTime() - today.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const daysUntilTrip = getDaysDiff(firstTripDate)

  return (
    <div className="space-y-4 pb-24 px-4 pt-3 max-w-md mx-auto">
      {/* Pre-trip Countdown or Status banner */}
      {daysUntilTrip > 0 ? (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-[#191c22] via-[#1e251f] to-[#191c22] border border-[#2d422f] shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#96bb89] bg-[#1e281f] px-2 py-0.5 rounded-full border border-[#2d422f]">
                Cuenta Regresiva
              </span>
              <h2 className="text-xl font-bold text-white mt-1.5 leading-tight">
                ¡Faltan {daysUntilTrip} {daysUntilTrip === 1 ? 'día' : 'días'} para el viaje!
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                Comienza el {formatReadableDate(firstTripDate)} en {data.itinerario[0]?.ciudad || 'Europa'}.
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#7ea172]/20 border border-[#7ea172]/40 flex items-center justify-center text-[#7ea172] shrink-0">
              <Calendar className="w-6 h-6" />
            </div>
          </div>
        </div>
      ) : daysUntilTrip === 0 ? (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/80 to-[#191c22] border border-emerald-700/50 text-white flex items-center justify-between shadow-lg">
          <div className="flex items-center space-x-2.5">
            <Sparkles className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <div className="text-sm font-bold">¡El viaje comienza hoy!</div>
              <div className="text-xs text-emerald-200">Disfruta cada momento en {currentCity}.</div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Hero City & Date Card */}
      <div className="p-4 rounded-2xl bg-[#191c22] border border-[#272c36] shadow-md relative overflow-hidden">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-1.5 text-[#96bb89] text-xs font-semibold uppercase tracking-wider">
              <MapPin className="w-3.5 h-3.5" />
              <span>Ciudad actual / destino</span>
            </div>
            <h1 className="text-2xl font-black text-slate-100 tracking-tight mt-0.5 mb-0">
              {currentCity}
            </h1>
            <p className="text-xs text-slate-400 capitalize mt-1">
              {formatReadableDate(selectedDate)}
            </p>
          </div>

          <div className="text-right">
            <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#222630] text-slate-300 border border-slate-700">
              {todayItinerary.length} {todayItinerary.length === 1 ? 'actividad' : 'actividades'}
            </span>
          </div>
        </div>

        {/* Quick Date Selector Picker */}
        {allDates.length > 1 && (
          <div className="mt-3 pt-3 border-t border-[#272c36] flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-medium">Ver otro día:</span>
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-[#121417] text-slate-200 text-xs px-2.5 py-1.5 rounded-lg border border-[#272c36] focus:outline-none focus:border-[#7ea172]"
            >
              {allDates.map((d, index) => (
                <option key={d} value={d}>
                  Día {index + 1} ({d})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Today's Transportation (if any) */}
      {todayTransport.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Plane className="w-3.5 h-3.5 text-blue-400" />
              Transporte de la jornada
            </span>
            <button
              onClick={() => onNavigateTab('transporte')}
              className="text-[11px] text-[#96bb89] hover:underline flex items-center"
            >
              Ver todos <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {todayTransport.map((tr) => (
            <div
              key={tr.id}
              className="p-3.5 rounded-2xl bg-gradient-to-r from-[#191c22] to-[#1d222b] border border-blue-900/40 shadow-sm"
            >
              <div className="flex items-center justify-between text-xs text-blue-300 font-semibold mb-1">
                <span className="uppercase tracking-wider font-mono">{tr.tipo} · {tr.numeroServicio || 'Programado'}</span>
                {tr.hora && <span className="bg-blue-950 px-2 py-0.5 rounded text-blue-200 border border-blue-800">{tr.hora}</span>}
              </div>

              <div className="flex items-center justify-between mt-2">
                <div className="font-bold text-slate-100 text-sm">{tr.origen}</div>
                <ArrowRight className="w-4 h-4 text-slate-500 mx-2" />
                <div className="font-bold text-slate-100 text-sm">{tr.destino}</div>
              </div>

              {tr.codigoConfirmacion && (
                <div className="mt-2.5 pt-2 border-t border-[#272c36] flex items-center justify-between text-xs">
                  <span className="text-slate-400">Reserva / PNR:</span>
                  <span className="font-mono font-bold text-emerald-400 bg-[#121417] px-2 py-0.5 rounded border border-[#272c36]">
                    {tr.codigoConfirmacion}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Today's Accommodation (if any) */}
      {todayAccommodation && (
        <div className="p-3.5 rounded-2xl bg-[#191c22] border border-[#272c36] shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-2.5">
              <div className="p-2 rounded-xl bg-purple-950/60 text-purple-300 border border-purple-800/40 shrink-0">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-semibold text-purple-300 uppercase tracking-wider">
                  Alojamiento de hoy
                </span>
                <div className="text-sm font-bold text-slate-100 leading-tight mt-0.5">
                  {todayAccommodation.nombre}
                </div>
                <div className="text-xs text-slate-400 mt-0.5 leading-snug">
                  {todayAccommodation.direccion}
                </div>
              </div>
            </div>

            <button
              onClick={() => onNavigateTab('alojamiento')}
              className="text-xs text-[#96bb89] hover:underline shrink-0 p-1"
            >
              Detalles
            </button>
          </div>
        </div>
      )}

      {/* Activities Timeline for Today */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#7ea172]" />
            Actividades del Día
          </span>
          <button
            onClick={() => onNavigateTab('itinerario')}
            className="text-[11px] text-[#96bb89] hover:underline flex items-center"
          >
            Ver itinerario completo <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {todayItinerary.length === 0 ? (
          <div className="p-6 rounded-2xl bg-[#191c22] border border-[#272c36] text-center space-y-2">
            <Compass className="w-8 h-8 text-slate-600 mx-auto" />
            <div className="text-sm font-semibold text-slate-300">Día libre o sin actividades programadas</div>
            <p className="text-xs text-slate-400">
              Aprovecha para recorrer {currentCity} a tu propio ritmo o descansar.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {todayItinerary.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl bg-[#191c22] border border-[#272c36] hover:border-[#38404f] transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    {/* Time pill */}
                    <div className="flex items-center space-x-2 mb-1.5">
                      <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#1e281f] text-[#96bb89] border border-[#2d422f]">
                        <Clock className="w-2.5 h-2.5 mr-1" />
                        {item.horaInicio || 'Durante el día'}{item.horaFin ? ` - ${item.horaFin}` : ''}
                      </span>
                      {item.costoEstimado && (
                        <span className="text-[10px] text-slate-400">
                          {item.costoEstimado}
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-bold text-slate-100 leading-snug m-0">
                      {item.actividad}
                    </h3>

                    {item.notas && (
                      <p className="text-xs text-slate-400 mt-1.5 leading-relaxed bg-[#121417] p-2 rounded-xl border border-[#222630]">
                        {item.notas}
                      </p>
                    )}
                  </div>

                  {/* Direct link button if any */}
                  {item.linkReserva && (
                    <a
                      href={item.linkReserva}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-[#222630] hover:bg-[#2c3240] text-[#96bb89] active:scale-95 transition-all shrink-0"
                      title="Abrir reserva o ticket"
                    >
                      <Ticket className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
