import React from 'react'
import { PhoneCall } from 'lucide-react'

interface EmergencyFabProps {
  onClick: () => void
}

export const EmergencyFab: React.FC<EmergencyFabProps> = ({ onClick }) => {
  return (
    <div className="fixed bottom-18 right-4 z-40">
      <button
        onClick={onClick}
        aria-label="Abrir emergencias y auxilio"
        className="group relative flex items-center gap-1.5 px-3 py-2.5 rounded-full bg-red-600 hover:bg-red-500 active:scale-95 text-white shadow-lg shadow-red-900/40 border border-red-400/30 transition-all"
      >
        <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-25"></span>
        <PhoneCall className="w-4 h-4 animate-bounce" />
        <span className="text-xs font-bold tracking-wide">SOS</span>
      </button>
    </div>
  )
}
