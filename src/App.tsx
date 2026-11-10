import { useCallback, useMemo, useState } from 'react'
import { CloudOff, Loader } from 'lucide-react'
import type { Activity, Day, Leg, TabType } from './types/travel'
import { useTrip } from './hooks/useTravelData'
import { useForecast, useRates, useStored } from './hooks/useStored'
import { sheetUrl } from './services/gsheets'
import { todayIso } from './lib/dates'
import { Header } from './components/Header'
import { BottomNav } from './components/BottomNav'
import { EmergencySheet } from './components/EmergencyModal'
import { SettingsSheet } from './components/SettingsModal'
import { GuideSheet, ReaderSheet, type GuideTarget, type ReaderTarget } from './components/GuideSheet'
import { LegCard } from './components/LegCard'
import { Button, Empty, Sheet } from './components/ui'
import { TodayView } from './components/views/TodayView'
import { ItineraryView } from './components/views/ItineraryView'
import { TransportView } from './components/views/TransportView'
import { AccommodationView } from './components/views/AccommodationView'
import { BudgetView } from './components/views/BudgetView'
import { GuideView } from './components/views/GuideView'

const TABS: TabType[] = ['hoy', 'itinerario', 'traslados', 'estadias', 'gastos', 'guia']

export function App() {
  const { trip, updated, syncing, error, online, refresh, sheetId, changeSheet } = useTrip()
  const { rates, refresh: refreshRates, update: updateRates } = useRates()
  const [storedTab, setStoredTab] = useStored<TabType>('eurotrip_tab', 'hoy')
  const tab = TABS.includes(storedTab) ? storedTab : 'hoy'

  const [guide, setGuide] = useState<GuideTarget | null>(null)
  const [reader, setReader] = useState<ReaderTarget | null>(null)
  const [leg, setLeg] = useState<Leg | null>(null)
  const [sos, setSos] = useState(false)
  const [settings, setSettings] = useState(false)

  const cityKeys = useMemo(() => {
    const keys = new Set<string>()
    trip?.days.forEach((d) => [d.city, d.excursion, d.leg?.to].forEach((r) => r?.key && r.key !== 'santiago' && keys.add(r.key)))
    return [...keys]
  }, [trip])
  const forecast = useForecast(cityKeys)

  const goTab = useCallback(
    (t: TabType) => {
      setStoredTab(t)
      window.scrollTo({ top: 0 })
    },
    [setStoredTab],
  )
  const openPlace = useCallback((a: Activity, d: Day) => {
    if (a.place) setGuide({ kind: 'place', place: a.place, date: d.date, note: a.note })
    else if (a.search) setGuide({ kind: 'search', label: a.text, query: a.search, cityKey: (d.excursion ?? d.city).key, note: a.note })
  }, [])
  const openCity = useCallback((key: string) => setGuide({ kind: 'city', key }), [])
  const closeGuide = useCallback(() => setGuide(null), [])
  const closeReader = useCallback(() => setReader(null), [])
  const closeLeg = useCallback(() => setLeg(null), [])
  const closeSos = useCallback(() => setSos(false), [])
  const closeSettings = useCallback(() => setSettings(false), [])

  const today = todayIso()
  const currentDay = trip ? (trip.days.find((d) => d.date === today) ?? (today < trip.start ? trip.days[0] : trip.days[trip.days.length - 1])) : undefined

  return (
    <div className="min-h-dvh">
      <Header syncing={syncing} online={online} error={error} updated={updated} onRefresh={refresh} onSos={() => setSos(true)} onSettings={() => setSettings(true)} />

      <main className="mx-auto w-full max-w-lg px-4 pb-[calc(env(safe-area-inset-bottom)+6.5rem)] pt-3">
        {!trip || trip.days.length === 0 ? (
          syncing ? (
            <Empty icon={<Loader className="size-6 animate-spin" />} title="Cargando el itinerario…" />
          ) : (
            <Empty icon={<CloudOff className="size-6" />} title={online ? 'No se pudo cargar el itinerario' : 'Sin conexión'}>
              {online ? (error ?? 'Revisa la planilla en Ajustes.') : 'Conéctate a internet una vez para descargar el itinerario; después funciona sin conexión.'}
              <div className="mt-4">
                <Button primary onClick={refresh} disabled={!online}>
                  Reintentar
                </Button>
              </div>
            </Empty>
          )
        ) : (
          <>
            {tab === 'hoy' && <TodayView trip={trip} forecast={forecast} rates={rates} onPlace={openPlace} onLeg={setLeg} onCity={openCity} onTab={goTab} />}
            {tab === 'itinerario' && <ItineraryView trip={trip} forecast={forecast} onPlace={openPlace} onLeg={setLeg} onCity={openCity} onTab={goTab} />}
            {tab === 'traslados' && <TransportView trip={trip} />}
            {tab === 'estadias' && <AccommodationView trip={trip} />}
            {tab === 'gastos' && <BudgetView trip={trip} rates={rates} onRefreshRates={refreshRates} onUpdateRates={updateRates} />}
            {tab === 'guia' && <GuideView trip={trip} sheetLink={sheetUrl(sheetId)} onCity={openCity} />}
          </>
        )}
      </main>

      <BottomNav active={tab} onSelect={goTab} />

      <GuideSheet target={guide} onClose={closeGuide} onRead={setReader} />
      <ReaderSheet reader={reader} onClose={closeReader} />
      <Sheet open={!!leg} onClose={closeLeg} label="Detalle del tramo">
        <div className="pt-8">{leg && <LegCard key={leg.id} leg={leg} defaultOpen />}</div>
      </Sheet>
      <EmergencySheet open={sos} onClose={closeSos} trip={trip} day={currentDay} />
      <SettingsSheet open={settings} onClose={closeSettings} sheetId={sheetId} syncing={syncing} onChangeSheet={changeSheet} onRefresh={refresh} />
    </div>
  )
}

export default App
