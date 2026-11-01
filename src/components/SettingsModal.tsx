import React, { useState } from 'react'
import { X, Save, ExternalLink, HelpCircle, Trash2, Sliders, FileSpreadsheet } from 'lucide-react'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  currentSheetId: string
  currentExchangeRate: number
  useMock: boolean
  onSaveSheetId: (id: string) => void
  onSaveExchangeRate: (rate: number) => void
  onToggleMock: (useMock: boolean) => void
  onRefresh: () => void
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  currentSheetId,
  currentExchangeRate,
  useMock,
  onSaveSheetId,
  onSaveExchangeRate,
  onToggleMock,
  onRefresh
}) => {
  const [sheetInput, setSheetInput] = useState(currentSheetId)
  const [rateInput, setRateInput] = useState(currentExchangeRate.toString())
  const [savedSuccess, setSavedSuccess] = useState(false)

  if (!isOpen) return null

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    onSaveSheetId(sheetInput)
    const parsedRate = parseFloat(rateInput)
    if (!isNaN(parsedRate) && parsedRate > 0) {
      onSaveExchangeRate(parsedRate)
    }
    setSavedSuccess(true)
    setTimeout(() => {
      setSavedSuccess(false)
      onClose()
      onRefresh()
    }, 600)
  }

  const handleClearCache = () => {
    if (confirm('¿Deseas vaciar la memoria caché guardada en este teléfono?')) {
      localStorage.removeItem('eurotrip_data_v1')
      onRefresh()
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm transition-opacity">
      <div
        className="w-full max-w-md bg-[#16181e] border-t sm:border border-[#272c36] rounded-t-3xl sm:rounded-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-200"
        role="dialog"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#272c36] flex items-center justify-between bg-[#191c22]">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-[#1e281f] text-[#7ea172] border border-[#2d422f]">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 m-0 leading-tight">Configuración del Viaje</h2>
              <p className="text-xs text-slate-400 mt-0.5">Fuente de datos y tasa de conversión</p>
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

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Sheet ID or URL input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              ID o Enlace de Google Sheets
            </label>
            <div className="relative">
              <input
                type="text"
                value={sheetInput}
                onChange={(e) => setSheetInput(e.target.value)}
                placeholder="ID de la hoja o link completo"
                className="w-full px-3 py-2.5 rounded-xl bg-[#121417] border border-[#272c36] text-slate-100 text-xs focus:outline-none focus:border-[#7ea172] transition-colors"
              />
            </div>
            <div className="flex items-center justify-between pt-1">
              <a
                href={`https://docs.google.com/spreadsheets/d/${sheetInput}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-[#96bb89] hover:underline flex items-center gap-1"
              >
                <FileSpreadsheet className="w-3 h-3" />
                Abrir hoja en Google Sheets
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
              <button
                type="button"
                onClick={() => setSheetInput('1fh_OpTMr-9Ygw51FMm5CZSXFAEWVRmpxCq79XckHf2I')}
                className="text-[11px] text-slate-400 hover:text-slate-200"
              >
                Restaurar original
              </button>
            </div>
          </div>

          {/* Currency conversion rate */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              Tasa de cambio: 1 EUR en CLP ($)
            </label>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-semibold text-slate-400">€ 1,00 =</span>
              <input
                type="number"
                step="1"
                min="100"
                max="5000"
                value={rateInput}
                onChange={(e) => setRateInput(e.target.value)}
                className="flex-1 px-3 py-2.5 rounded-xl bg-[#121417] border border-[#272c36] text-slate-100 text-xs focus:outline-none focus:border-[#7ea172] transition-colors font-mono font-bold"
              />
              <span className="text-xs font-semibold text-slate-400">CLP</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Se usa para unificar todos los montos de la pestaña "Presupuesto" y costos estimados a pesos chilenos.
            </p>
          </div>

          {/* Toggle Mock Mode */}
          <div className="p-3.5 rounded-xl bg-[#191c22] border border-[#272c36] flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-200">Modo Datos de Prueba (Demo)</div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Muestra un itinerario europeo completo si aún no compartes la hoja.
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={useMock}
                onChange={(e) => onToggleMock(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-[#252a36] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#7ea172]"></div>
            </label>
          </div>

          {/* Google Sheets Sharing Guide */}
          <div className="p-3.5 rounded-xl bg-[#191c22]/70 border border-[#272c36] text-xs text-slate-300 space-y-2">
            <div className="flex items-center gap-1.5 font-semibold text-slate-200">
              <HelpCircle className="w-4 h-4 text-[#7ea172]" />
              ¿Cómo hacer tu Google Sheet pública?
            </div>
            <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-400 leading-relaxed">
              <li>Abre tu hoja en Google Sheets desde un navegador.</li>
              <li>Toca el botón azul <strong className="text-slate-200">Compartir</strong> (arriba a la derecha).</li>
              <li>En <strong className="text-slate-200">Acceso general</strong>, cámbialo a: <strong className="text-slate-200">Cualquier persona con el enlace</strong>.</li>
              <li>Asegúrate de que el rol sea <strong className="text-slate-200">Lector</strong>.</li>
              <li>¡Listo! Tu app se sincronizará automáticamente desde cualquier teléfono sin login.</li>
            </ol>
          </div>

          {/* Clear Cache */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleClearCache}
              className="w-full py-2.5 px-3 rounded-xl bg-[#191c22] border border-[#272c36] text-slate-400 hover:text-red-400 text-xs flex items-center justify-center gap-2 active:scale-98 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Borrar caché local y forzar descarga
            </button>
          </div>

          {/* Save Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-[#7ea172] hover:bg-[#8eaf83] active:scale-95 text-[#121417] font-bold text-sm shadow-lg shadow-[#7ea172]/20 flex items-center justify-center gap-2 transition-all"
            >
              <Save className="w-4 h-4" />
              {savedSuccess ? '¡Guardado con éxito!' : 'Guardar y Sincronizar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
