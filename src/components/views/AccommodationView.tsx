import React from 'react'
import type { AccommodationItem } from '../../types/travel'
import {
  MapPin,
  Phone,
  ExternalLink,
  Info,
  Navigation
} from 'lucide-react'

interface AccommodationViewProps {
  items: AccommodationItem[]
}

export const AccommodationView: React.FC<AccommodationViewProps> = ({ items }) => {
  return (
    <div className="space-y-4 pb-24 px-4 pt-3 max-w-md mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-100 m-0">Alojamientos y Hostels</h2>
          <p className="text-xs text-slate-400 mt-0.5">Direcciones, check-ins y teléfonos</p>
        </div>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#1e281f] text-[#96bb89] border border-[#2d422f]">
          {items.length} lugares
        </span>
      </div>

      {items.length === 0 ? (
        <div className="p-8 rounded-2xl bg-[#191c22] border border-[#272c36] text-center text-slate-400 text-xs">
          No hay alojamientos registrados en la pestaña "Alojamiento".
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((al) => {
            const mapQuery = encodeURIComponent(`${al.nombre} ${al.direccion} ${al.ciudad}`)
            const cleanPhone = (al.telefono || '').replace(/[^0-9+]/g, '')

            return (
              <div
                key={al.id}
                className="p-4 rounded-2xl bg-[#191c22] border border-[#272c36] hover:border-slate-600 transition-all shadow-sm space-y-3"
              >
                {/* Header: City badge & price */}
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-950/70 text-purple-300 border border-purple-800/50">
                    <MapPin className="w-2.5 h-2.5 mr-1" />
                    {al.ciudad}
                  </span>

                  {al.costoNoche && (
                    <span className="text-xs font-semibold text-slate-300 bg-[#222630] px-2 py-0.5 rounded-md">
                      {al.costoNoche} <span className="text-[10px] text-slate-400 font-normal">/noche</span>
                    </span>
                  )}
                </div>

                {/* Hotel Name & Address */}
                <div>
                  <h3 className="text-base font-bold text-slate-100 leading-snug m-0">
                    {al.nombre}
                  </h3>
                  <div className="text-xs text-slate-400 mt-1 flex items-start gap-1 leading-relaxed">
                    <span>{al.direccion}</span>
                  </div>
                </div>

                {/* Check-in & Check-out row */}
                <div className="p-3 rounded-xl bg-[#121417] border border-[#222630] grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Check-in</span>
                    <span className="font-semibold text-slate-200 mt-0.5 block">{al.checkIn || 'Por confirmar'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Check-out</span>
                    <span className="font-semibold text-slate-200 mt-0.5 block">{al.checkOut || 'Por confirmar'}</span>
                  </div>
                </div>

                {/* Notes (WiFi, door code, luggage, tax) */}
                {al.notas && (
                  <div className="p-2.5 rounded-xl bg-[#121417] border border-[#222630] text-xs text-slate-300 flex items-start gap-2">
                    <Info className="w-3.5 h-3.5 text-[#7ea172] shrink-0 mt-0.5" />
                    <p className="text-[11px] leading-relaxed">{al.notas}</p>
                  </div>
                )}

                {/* Action buttons: Google Maps, Phone, Link */}
                <div className="flex items-center space-x-2 pt-1">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2 px-3 rounded-xl bg-[#1e281f] hover:bg-[#28392a] text-[#96bb89] border border-[#2d422f] text-xs font-semibold flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    Cómo llegar (Maps)
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  {cleanPhone && (
                    <a
                      href={`tel:${cleanPhone}`}
                      className="p-2 rounded-xl bg-[#222630] hover:bg-[#2c3240] text-slate-200 border border-[#272c36] text-xs flex items-center justify-center active:scale-95 transition-all"
                      title={`Llamar a ${al.nombre}`}
                    >
                      <Phone className="w-4 h-4 text-emerald-400" />
                    </a>
                  )}

                  {al.linkReserva && (
                    <a
                      href={al.linkReserva}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-[#222630] hover:bg-[#2c3240] text-slate-200 border border-[#272c36] text-xs flex items-center justify-center active:scale-95 transition-all"
                      title="Abrir reserva"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
