import React, { useState } from 'react'
import type { EmergencyItem } from '../types/travel'
import { X, Phone, ShieldAlert, Copy, Check, AlertTriangle, ExternalLink } from 'lucide-react'

interface EmergencyModalProps {
  isOpen: boolean
  onClose: () => void
  emergencies: EmergencyItem[]
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({ isOpen, onClose, emergencies }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null)

  if (!isOpen) return null

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  // Sanitize phone number for tel: links
  const getCleanPhone = (val: string) => {
    return val.replace(/[^0-9+]/g, '')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm transition-opacity">
      <div
        className="w-full max-w-md bg-[#16181e] border-t sm:border border-red-900/40 rounded-t-3xl sm:rounded-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-200"
        role="dialog"
      >
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-red-950/80 to-[#191c22] border-b border-red-900/30 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-red-600 text-white shadow-md shadow-red-900/50">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 m-0 leading-tight">Emergencias y Auxilio</h2>
              <p className="text-xs text-red-300 font-medium mt-0.5">Contactos rápidos en caso de urgencia</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar modal"
            className="p-1.5 rounded-lg bg-[#222630] text-slate-400 hover:text-slate-100 active:scale-95 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto space-y-3.5 flex-1 pb-8">
          {/* 112 Universal Call Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-red-900/70 via-red-950/80 to-[#1a1c22] border border-red-500/40 text-slate-100 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-red-300 bg-red-950/90 px-2 py-0.5 rounded-full border border-red-700/60">
                  Universal en toda la UE
                </span>
                <h3 className="text-2xl font-black text-white mt-1 mb-0 tracking-tight">112 Emergencias</h3>
                <p className="text-xs text-red-200 mt-1 max-w-[220px]">
                  Policía, ambulancia y bomberos. Funciona gratis y sin saldo en cualquier teléfono.
                </p>
              </div>
              <a
                href="tel:112"
                className="flex items-center justify-center w-14 h-14 rounded-2xl bg-red-500 hover:bg-red-400 text-white shadow-lg shadow-red-600/50 active:scale-90 transition-all font-bold"
                title="Llamar al 112"
              >
                <Phone className="w-6 h-6 animate-pulse" />
              </a>
            </div>
          </div>

          {/* List of custom emergency contacts from Google Sheets */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
              Contactos y Seguros Registrados
            </h4>

            {emergencies.length === 0 ? (
              <div className="p-4 rounded-xl bg-[#191c22] border border-[#272c36] text-center text-slate-400 text-xs">
                No hay contactos de emergencia registrados en la hoja de cálculo.
              </div>
            ) : (
              emergencies.map((item) => {
                const cleanPhone = getCleanPhone(item.valor)
                const isPhone = cleanPhone.length >= 3 && /^[+0-9]/.test(item.valor.trim())
                const isUrl = item.valor.startsWith('http://') || item.valor.startsWith('https://')

                return (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl bg-[#191c22] border border-[#272c36] hover:border-slate-600 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <span className="inline-block text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#252a36] text-slate-300 mb-1">
                          {item.tipo || 'Emergencia'}
                        </span>
                        <div className="text-sm font-bold text-slate-100 truncate">
                          {item.nombre || item.tipo}
                        </div>
                        <div className="text-xs font-mono font-semibold text-[#96bb89] mt-0.5 select-all break-all">
                          {item.valor}
                        </div>
                        {item.notas && (
                          <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                            {item.notas}
                          </p>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center space-x-1.5 shrink-0 pt-1">
                        <button
                          onClick={() => handleCopy(item.id, item.valor)}
                          className="p-2 rounded-lg bg-[#222630] hover:bg-[#2c3240] text-slate-300 hover:text-white transition-all active:scale-95"
                          title="Copiar dato"
                        >
                          {copiedId === item.id ? (
                            <Check className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>

                        {isPhone && (
                          <a
                            href={`tel:${cleanPhone}`}
                            className="p-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-all active:scale-95 flex items-center justify-center shadow-md shadow-emerald-900/40"
                            title="Llamar"
                          >
                            <Phone className="w-4 h-4" />
                          </a>
                        )}

                        {isUrl && (
                          <a
                            href={item.valor}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-all active:scale-95"
                            title="Abrir enlace"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Quick Travel Advice */}
          <div className="p-3 rounded-xl bg-[#191c22]/60 border border-[#272c36] text-slate-400 text-xs flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              En caso de pérdida o robo de pasaporte chileno, acude al Consulado de Chile más cercano con una copia digital de tu cédula y la denuncia policial local.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
