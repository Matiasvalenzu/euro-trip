import { useCallback, useEffect, useMemo, useState } from 'react'
import type { CachedRows } from '../services/gsheets'
import { fetchRows, getSheetId, loadCachedRows, setSheetId } from '../services/gsheets'
import { buildTrip } from '../lib/parseTrip'

/** Itinerario desde Google Sheets, con copia local para usar sin conexión. */
export function useTrip() {
  const [sheetId, setSheetIdState] = useState(getSheetId)
  const [cached, setCached] = useState<CachedRows | null>(loadCachedRows)
  const [syncing, setSyncing] = useState(() => navigator.onLine)
  const [error, setError] = useState<string | null>(null)
  const [online, setOnline] = useState(navigator.onLine)

  useEffect(() => {
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
    }
  }, [])

  const load = useCallback(async () => {
    try {
      const data = await fetchRows(sheetId)
      setCached(data)
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo leer la planilla.')
    } finally {
      setSyncing(false)
    }
  }, [sheetId])

  // Descarga al abrir, al cambiar de planilla y al recuperar la conexión.
  // `load` solo actualiza estado después de la respuesta de red.
  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect
    if (online) load()
  }, [online, load])

  const refresh = useCallback(() => {
    if (!navigator.onLine) return
    setSyncing(true)
    load()
  }, [load])

  const trip = useMemo(() => (cached ? buildTrip(cached.rows) : null), [cached])

  const changeSheet = (input: string) => {
    setSyncing(true)
    setSheetIdState(setSheetId(input))
  }

  return { trip, updated: cached?.updated, syncing, error, online, refresh, sheetId, changeSheet }
}
