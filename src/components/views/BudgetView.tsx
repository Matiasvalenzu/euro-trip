import React, { useState } from 'react'
import type { BudgetItem } from '../../types/travel'
import {
  PieChart,
  Sliders
} from 'lucide-react'

interface BudgetViewProps {
  items: BudgetItem[]
  exchangeRate: number
  onOpenSettings: () => void
}

export const BudgetView: React.FC<BudgetViewProps> = ({ items, exchangeRate, onOpenSettings }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('todas')

  // Convert an expense to CLP
  const convertToClp = (item: BudgetItem) => {
    const curr = (item.moneda || 'CLP').toUpperCase()
    if (curr === 'EUR' || curr.includes('€')) {
      return item.montoGastado * exchangeRate
    }
    if (curr === 'USD') {
      return item.montoGastado * 950
    }
    return item.montoGastado
  }

  // Format Chilean Pesos
  const formatClp = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0
    }).format(Math.round(amount))
  }

  // Format EUR
  const formatEur = (amountEur: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(Math.round(amountEur))
  }

  // Totals
  const totalClp = items.reduce((acc, curr) => acc + convertToClp(curr), 0)
  const totalEur = exchangeRate > 0 ? totalClp / exchangeRate : 0

  // Categories calculation
  const categoryTotals: Record<string, number> = {}
  items.forEach((item) => {
    const cat = item.categoria || 'Otros'
    categoryTotals[cat] = (categoryTotals[cat] || 0) + convertToClp(item)
  })

  // Distinct categories sorted by spend
  const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])
  const categoriesList = ['todas', ...sortedCategories.map(([cat]) => cat)]

  // Filtered items
  const filteredItems = items.filter((item) => {
    if (selectedCategory === 'todas') return true
    return (item.categoria || 'Otros').toLowerCase() === selectedCategory.toLowerCase()
  })

  return (
    <div className="space-y-4 pb-24 px-4 pt-3 max-w-md mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-100 m-0">Presupuesto y Gastos</h2>
          <p className="text-xs text-slate-400 mt-0.5">Control de gastos consolidado en pesos chilenos</p>
        </div>
        <button
          onClick={onOpenSettings}
          className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-[#191c22] border border-[#272c36] text-[#96bb89] hover:text-slate-100 flex items-center gap-1 active:scale-95 transition-all"
        >
          <Sliders className="w-3 h-3" />
          € 1 = ${exchangeRate.toLocaleString('es-CL')}
        </button>
      </div>

      {/* Main Total Card */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-[#191c22] via-[#1e251f] to-[#16181d] border border-[#2d422f] shadow-lg">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#96bb89] bg-[#1e281f] px-2 py-0.5 rounded-full border border-[#2d422f]">
          Gasto Acumulado Total
        </span>

        <div className="mt-2 flex items-baseline justify-between">
          <div>
            <div className="text-2xl font-black text-white tracking-tight">
              {formatClp(totalClp)}
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              Equivalente aprox: <span className="text-slate-300 font-semibold">{formatEur(totalEur)}</span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-400 block">{items.length} gastos</span>
            <span className="text-[10px] text-slate-500 font-mono">Tasa: $ {exchangeRate} CLP</span>
          </div>
        </div>
      </div>

      {/* Category breakdown bars */}
      <div className="p-4 rounded-2xl bg-[#191c22] border border-[#272c36] shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <PieChart className="w-3.5 h-3.5 text-[#7ea172]" />
            Desglose por Categoría
          </span>
          <span className="text-[11px] text-slate-400">{sortedCategories.length} categorías</span>
        </div>

        <div className="space-y-2.5 pt-1">
          {sortedCategories.map(([cat, amount]) => {
            const percentage = totalClp > 0 ? (amount / totalClp) * 100 : 0

            return (
              <div key={cat} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-semibold truncate">{cat}</span>
                  <div className="text-right space-x-1.5">
                    <span className="text-slate-100 font-bold">{formatClp(amount)}</span>
                    <span className="text-[10px] text-slate-400 font-mono">({percentage.toFixed(0)}%)</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 rounded-full bg-[#121417] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#7ea172] transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Expense List Filter */}
      <div className="space-y-2.5">
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categoriesList.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all active:scale-95 capitalize ${
                selectedCategory === cat
                  ? 'bg-[#7ea172] text-[#121417] shadow-sm shadow-[#7ea172]/30'
                  : 'bg-[#191c22] text-slate-300 border border-[#272c36] hover:border-slate-500'
              }`}
            >
              {cat === 'todas' ? 'Todos los gastos' : cat}
            </button>
          ))}
        </div>

        {/* Expense cards */}
        {filteredItems.length === 0 ? (
          <div className="p-8 rounded-2xl bg-[#191c22] border border-[#272c36] text-center text-slate-400 text-xs">
            No hay gastos registrados en esta categoría.
          </div>
        ) : (
          <div className="space-y-2">
            {filteredItems.map((item) => {
              const clpValue = convertToClp(item)
              const isEur = (item.moneda || '').toUpperCase() === 'EUR' || (item.moneda || '').includes('€')

              return (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl bg-[#191c22] border border-[#272c36] hover:border-slate-600 transition-all flex items-center justify-between gap-3 shadow-sm"
                >
                  <div className="flex-1 min-w-0">
                    <span className="inline-block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-0.5">
                      {item.categoria || 'Gasto'} {item.fecha ? `· ${item.fecha}` : ''}
                    </span>
                    <h4 className="text-sm font-bold text-slate-100 truncate m-0">
                      {item.concepto}
                    </h4>
                    {isEur && (
                      <span className="text-[11px] text-slate-400 mt-0.5 block">
                        Original: € {item.montoGastado.toLocaleString('de-DE')}
                      </span>
                    )}
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-sm font-black text-[#96bb89]">
                      {formatClp(clpValue)}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
