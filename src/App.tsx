import { useState } from 'react'
import type { TabType } from './types/travel'
import { useTravelData } from './hooks/useTravelData'
import { Header } from './components/Header'
import { BottomNav } from './components/BottomNav'
import { EmergencyFab } from './components/EmergencyFab'
import { EmergencyModal } from './components/EmergencyModal'
import { SettingsModal } from './components/SettingsModal'

import { TodayView } from './components/views/TodayView'
import { ItineraryView } from './components/views/ItineraryView'
import { TransportView } from './components/views/TransportView'
import { AccommodationView } from './components/views/AccommodationView'
import { LinksView } from './components/views/LinksView'
import { BudgetView } from './components/views/BudgetView'

export function App() {
  const {
    data,
    sheetId,
    exchangeRate,
    useMock,
    isLoading,
    isSyncing,
    syncError,
    isOnline,
    refreshData,
    updateSheetId,
    updateExchangeRate,
    toggleMockMode
  } = useTravelData()

  const [activeTab, setActiveTab] = useState<TabType>('hoy')
  const [isEmergencyOpen, setIsEmergencyOpen] = useState<boolean>(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false)

  return (
    <div className="min-h-screen bg-[#121417] text-slate-100 flex flex-col font-sans selection:bg-[#7ea172] selection:text-[#121417]">
      {/* Top Header */}
      <Header
        isSyncing={isSyncing}
        isLoading={isLoading}
        isOnline={isOnline}
        syncError={syncError}
        lastUpdated={data.lastUpdated}
        isMock={data.isMock}
        onRefresh={refreshData}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main View Area */}
      <main className="flex-1 w-full max-w-md mx-auto relative overflow-x-hidden">
        {activeTab === 'hoy' && (
          <TodayView data={data} onNavigateTab={setActiveTab} />
        )}

        {activeTab === 'itinerario' && (
          <ItineraryView items={data.itinerario} />
        )}

        {activeTab === 'transporte' && (
          <TransportView items={data.transporte} />
        )}

        {activeTab === 'alojamiento' && (
          <AccommodationView items={data.alojamiento} />
        )}

        {activeTab === 'enlaces' && (
          <LinksView items={data.enlaces} />
        )}

        {activeTab === 'presupuesto' && (
          <BudgetView
            items={data.presupuesto}
            exchangeRate={exchangeRate}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        )}
      </main>

      {/* Floating Emergency Action Button */}
      <EmergencyFab onClick={() => setIsEmergencyOpen(true)} />

      {/* Bottom Sticky Navigation */}
      <BottomNav activeTab={activeTab} onSelectTab={setActiveTab} />

      {/* Emergency Modal */}
      <EmergencyModal
        isOpen={isEmergencyOpen}
        onClose={() => setIsEmergencyOpen(false)}
        emergencies={data.emergencias}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentSheetId={sheetId}
        currentExchangeRate={exchangeRate}
        useMock={useMock}
        onSaveSheetId={updateSheetId}
        onSaveExchangeRate={updateExchangeRate}
        onToggleMock={toggleMockMode}
        onRefresh={refreshData}
      />
    </div>
  )
}

export default App
