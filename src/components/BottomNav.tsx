import React from 'react'
import type { TabType } from '../types/travel'
import {
  CalendarDays,
  MapPin,
  Plane,
  Building2,
  ExternalLink,
  Wallet
} from 'lucide-react'

interface BottomNavProps {
  activeTab: TabType
  onSelectTab: (tab: TabType) => void
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onSelectTab }) => {
  const tabs: { id: TabType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'hoy', label: 'Hoy', icon: CalendarDays },
    { id: 'itinerario', label: 'Itinerario', icon: MapPin },
    { id: 'transporte', label: 'Transporte', icon: Plane },
    { id: 'alojamiento', label: 'Estadía', icon: Building2 },
    { id: 'enlaces', label: 'Enlaces', icon: ExternalLink },
    { id: 'presupuesto', label: 'Gastos', icon: Wallet }
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-[#121417]/95 backdrop-blur-lg border-t border-[#272c36] pb-safe">
      <div className="max-w-md mx-auto flex items-center justify-between px-2 py-1.5">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all duration-150 active:scale-95 ${
                isActive
                  ? 'text-[#96bb89] bg-[#1e281f]/80 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 text-[#7ea172]' : ''}`} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#7ea172]"></span>
                )}
              </div>
              <span className={`text-[10px] mt-1 tracking-tight leading-none ${isActive ? 'text-slate-100 font-bold' : 'text-slate-400'}`}>
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
