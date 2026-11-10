import { useState } from 'react'
import { Download, FileSpreadsheet, RefreshCw, Smartphone, Trash } from 'lucide-react'
import { PLACES } from '../data/places'
import { CITIES } from '../data/destinations'
import { DEFAULT_SHEET_ID, sheetUrl } from '../services/gsheets'
import { cachedSummary, fetchSummaries, warmImages } from '../services/wiki'
import { fetchForecast } from '../services/weather'
import { Button, Card, Eyebrow, LinkButton, Sheet } from './ui'

interface Props {
  open: boolean
  onClose: () => void
  sheetId: string
  syncing: boolean
  onChangeSheet: (input: string) => void
  onRefresh: () => void
}

const GUIDE_TITLES = [...new Set([...PLACES.map((p) => p.wiki ?? p.name), ...Object.values(CITIES).map((c) => c.wiki)])]

export function SettingsSheet({ open, onClose, sheetId, syncing, onChangeSheet, onRefresh }: Props) {
  const [input, setInput] = useState(sheetId)
  const [guideState, setGuideState] = useState<'idle' | 'busy' | 'done' | 'error'>('idle')
  const cached = GUIDE_TITLES.filter((t) => cachedSummary(t)).length

  const download = async () => {
    setGuideState('busy')
    try {
      await fetchSummaries(GUIDE_TITLES)
      await warmImages(GUIDE_TITLES, PLACES.flatMap((p) => (p.photo ? [p.photo] : [])))
      await fetchForecast(Object.keys(CITIES).filter((k) => k !== 'santiago'), true).catch(() => {})
      setGuideState('done')
    } catch {
      setGuideState('error')
    }
  }

  const clearCache = () => {
    if (!confirm('¿Borrar la copia del itinerario guardada en este teléfono? Se vuelve a descargar al tener conexión. Tus gastos, contactos y pendientes no se borran.')) return
    try {
      localStorage.removeItem('eurotrip_rows_v2')
    } catch {
      /* sin almacenamiento */
    }
    location.reload()
  }

  return (
    <Sheet open={open} onClose={onClose} label="Ajustes">
      <div className="space-y-5 pt-6">
        <h2 className="font-display text-[30px] font-semibold">Ajustes</h2>

        <Card className="p-4">
          <Eyebrow>Planilla de Google Sheets</Eyebrow>
          <p className="mt-1 text-[14px] text-ink-2">La app lee la primera pestaña. Debe estar compartida como «Cualquier persona con el enlace · Lector».</p>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="ID o enlace de la planilla"
            aria-label="ID o enlace de la planilla"
            className="mt-3 w-full rounded-xl border border-line bg-bg px-3 py-2.5 text-[16px] outline-none focus:border-accent"
          />
          <div className="mt-2 grid grid-cols-2 gap-2">
            <Button
              primary
              icon={<RefreshCw className={`size-4 ${syncing ? 'animate-spin' : ''}`} />}
              onClick={() => (input.trim() && input.trim() !== sheetId ? onChangeSheet(input) : onRefresh())}
              disabled={syncing}
            >
              {input.trim() && input.trim() !== sheetId ? 'Guardar' : 'Actualizar'}
            </Button>
            <LinkButton href={sheetUrl(sheetId)} icon={<FileSpreadsheet className="size-4" />}>
              Abrir
            </LinkButton>
          </div>
          {sheetId !== DEFAULT_SHEET_ID && (
            <button type="button" onClick={() => setInput(DEFAULT_SHEET_ID)} className="mt-2 text-[13px] font-semibold text-accent">
              Volver a la planilla original
            </button>
          )}
        </Card>

        <Card className="p-4">
          <Eyebrow>Guías sin conexión</Eyebrow>
          <p className="mt-1 text-[14px] text-ink-2">
            Descarga los resúmenes y fotos de las {GUIDE_TITLES.length} guías y el pronóstico, para verlos sin internet (metro, avión, sin roaming).
          </p>
          <p className="mt-1 text-[13px] text-ink-3">
            Guardadas: {cached} de {GUIDE_TITLES.length}
          </p>
          <Button primary icon={<Download className="size-4" />} onClick={download} disabled={guideState === 'busy'} className="mt-3 w-full">
            {guideState === 'busy' ? 'Descargando…' : guideState === 'done' ? 'Listo, guías guardadas' : 'Descargar guías'}
          </Button>
          {guideState === 'error' && <p className="mt-2 text-[13px] text-danger">No se pudo completar la descarga. Revisa la conexión e intenta de nuevo.</p>}
        </Card>

        <Card className="p-4">
          <Eyebrow>Instalar en el teléfono</Eyebrow>
          <div className="mt-2 flex gap-3 text-[14px] leading-snug">
            <Smartphone className="mt-0.5 size-5 shrink-0 text-ink-3" />
            <div className="space-y-1.5">
              <p>
                <b className="font-semibold">iPhone (Safari):</b> Compartir → «Agregar a pantalla de inicio».
              </p>
              <p>
                <b className="font-semibold">Android (Chrome):</b> menú ⋮ → «Instalar aplicación».
              </p>
              <p className="text-ink-2">Instalada, la app abre a pantalla completa y funciona sin conexión con la última copia.</p>
            </div>
          </div>
        </Card>

        <Button icon={<Trash className="size-4" />} onClick={clearCache} className="w-full text-danger">
          Borrar copia del itinerario
        </Button>
      </div>
    </Sheet>
  )
}
