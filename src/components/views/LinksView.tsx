import React, { useState } from 'react'
import type { UsefulLinkItem } from '../../types/travel'
import {
  ExternalLink,
  Search,
  Globe,
  Train,
  CloudSun,
  MapPin,
  Landmark,
  Languages,
  Pill,
  ShieldAlert
} from 'lucide-react'

interface LinksViewProps {
  items: UsefulLinkItem[]
}

export const LinksView: React.FC<LinksViewProps> = ({ items }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('todas')
  const [searchQuery, setSearchQuery] = useState<string>('')

  // Distinct categories
  const categories = ['todas', ...Array.from(new Set(items.map((i) => i.categoria))).filter(Boolean)]

  // Filter items
  const filtered = items.filter((item) => {
    if (selectedCategory !== 'todas' && item.categoria.toLowerCase() !== selectedCategory.toLowerCase()) {
      return false
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const matchName = item.nombre.toLowerCase().includes(q)
      const matchNotes = (item.notas || '').toLowerCase().includes(q)
      const matchCat = item.categoria.toLowerCase().includes(q)
      if (!matchName && !matchNotes && !matchCat) return false
    }
    return true
  })

  // Get icon by category
  const getCategoryIcon = (catStr: string) => {
    const c = catStr.toLowerCase()
    if (c.includes('transporte')) return <Train className="w-4 h-4 text-sky-400" />
    if (c.includes('clima')) return <CloudSun className="w-4 h-4 text-amber-400" />
    if (c.includes('mapa')) return <MapPin className="w-4 h-4 text-emerald-400" />
    if (c.includes('banco') || c.includes('cajero')) return <Landmark className="w-4 h-4 text-green-400" />
    if (c.includes('traductor')) return <Languages className="w-4 h-4 text-blue-400" />
    if (c.includes('farmacia')) return <Pill className="w-4 h-4 text-pink-400" />
    if (c.includes('emergencia') || c.includes('embajada')) return <ShieldAlert className="w-4 h-4 text-red-400" />
    return <Globe className="w-4 h-4 text-slate-400" />
  }

  return (
    <div className="space-y-4 pb-24 px-4 pt-3 max-w-md mx-auto">
      <div>
        <h2 className="text-lg font-bold text-slate-100 m-0">Enlaces y Utilidades</h2>
        <p className="text-xs text-slate-400 mt-0.5">Apps, transporte local, cajeros y guías oficiales</p>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar enlaces, apps o servicios..."
          className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#191c22] border border-[#272c36] text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#7ea172] transition-colors"
        />
      </div>

      {/* Category Pills */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all active:scale-95 capitalize ${
              selectedCategory === cat
                ? 'bg-[#7ea172] text-[#121417] shadow-sm shadow-[#7ea172]/30'
                : 'bg-[#191c22] text-slate-300 border border-[#272c36] hover:border-slate-500'
            }`}
          >
            {cat === 'todas' ? 'Todos los enlaces' : cat}
          </button>
        ))}
      </div>

      {/* Links List */}
      {filtered.length === 0 ? (
        <div className="p-8 rounded-2xl bg-[#191c22] border border-[#272c36] text-center text-slate-400 text-xs">
          No se encontraron enlaces para tu búsqueda.
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((item) => (
            <a
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-3.5 rounded-2xl bg-[#191c22] border border-[#272c36] hover:border-[#7ea172]/60 transition-all active:scale-[0.99] group shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start space-x-2.5 flex-1 min-w-0">
                  <div className="p-2 rounded-xl bg-[#121417] border border-[#272c36] shrink-0 mt-0.5">
                    {getCategoryIcon(item.categoria)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="inline-block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-0.5">
                      {item.categoria}
                    </span>
                    <h3 className="text-sm font-bold text-slate-100 group-hover:text-[#96bb89] transition-colors truncate m-0">
                      {item.nombre}
                    </h3>
                    {item.notas && (
                      <p className="text-xs text-slate-400 mt-1 leading-snug line-clamp-2">
                        {item.notas}
                      </p>
                    )}
                    <span className="text-[10px] text-slate-500 truncate block mt-1 font-mono">
                      {item.url}
                    </span>
                  </div>
                </div>

                <div className="p-2 rounded-xl bg-[#121417] text-slate-400 group-hover:text-[#7ea172] transition-colors shrink-0">
                  <ExternalLink className="w-4 h-4" />
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
