import { useState } from 'react'
import { ArrowLeftRight, Plus, RefreshCw, Trash, Wallet } from 'lucide-react'
import type { Currency, Expense, Rates, Trip } from '../../types/travel'
import { CURRENCIES, convert, fmtMoney, parseAmount, type Amount } from '../../lib/money'
import { fmtDM, fmtShort, todayIso } from '../../lib/dates'
import { useStored } from '../../hooks/useStored'
import { Button, Card, Chip, SectionTitle, PageTitle } from '../ui'

interface Props {
  trip: Trip
  rates: Rates
  onRefreshRates: () => Promise<void>
  onUpdateRates: (r: Rates) => void
}

const CATEGORIES = ['Comida', 'Transporte', 'Entradas', 'Alojamiento', 'Compras', 'Otros']

const parseNum = (s: string) => parseFloat(s.replace(/\./g, '').replace(',', '.'))

/** Tasas para editar con coma decimal ("1,12"), que es lo que entiende parseNum. */
const draftOf = (r: Rates) => ({
  CLP: String(+r.CLP.toFixed(2)).replace('.', ','),
  PLN: String(+r.PLN.toFixed(4)).replace('.', ','),
  HUF: String(+r.HUF.toFixed(2)).replace('.', ','),
  USD: String(+r.USD.toFixed(4)).replace('.', ','),
})

function Segmented({ value, onChange }: { value: Currency; onChange: (c: Currency) => void }) {
  return (
    <div className="grid grid-cols-5 gap-1 rounded-xl bg-surface-2 p-1">
      {CURRENCIES.map((c) => (
        <button
          key={c}
          type="button"
          aria-pressed={value === c}
          onClick={() => onChange(c)}
          className={`rounded-lg py-1.5 text-[14px] font-semibold ${value === c ? 'bg-surface text-ink shadow-sm' : 'text-ink-2'}`}
        >
          {c}
        </button>
      ))}
    </div>
  )
}

function Converter({ rates, onRefreshRates, onUpdateRates }: Omit<Props, 'trip'>) {
  const [amount, setAmount] = useState('10')
  const [cur, setCur] = useState<Currency>('EUR')
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(() => draftOf(rates))
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const value = parseNum(amount) || 0

  const refresh = async () => {
    setBusy(true)
    setErr('')
    try {
      await onRefreshRates()
    } catch {
      setErr('No se pudo actualizar. Revisa la conexión.')
    } finally {
      setBusy(false)
    }
  }

  const save = () => {
    const r = { CLP: parseNum(draft.CLP), PLN: parseNum(draft.PLN), HUF: parseNum(draft.HUF), USD: parseNum(draft.USD) }
    if (Object.values(r).every((x) => x > 0)) onUpdateRates({ ...rates, ...r, EUR: 1, updated: Date.now() })
    setEditing(false)
  }

  return (
    <Card className="p-4">
      <SectionTitle icon={<ArrowLeftRight className="size-4" />}>Conversor</SectionTitle>
      <input
        inputMode="decimal"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        aria-label="Monto a convertir"
        className="w-full rounded-xl border border-line bg-bg px-3.5 py-3 text-[28px] font-semibold tabular-nums outline-none focus:border-accent"
      />
      <div className="mt-2">
        <Segmented value={cur} onChange={setCur} />
      </div>
      <div className="mt-3 divide-y divide-line">
        {CURRENCIES.filter((c) => c !== cur).map((c) => (
          <div key={c} className="flex items-baseline justify-between py-2">
            <span className="text-[14px] text-ink-2">{c}</span>
            <span className="text-[20px] font-semibold tabular-nums">{fmtMoney(convert(value, cur, c, rates), c)}</span>
          </div>
        ))}
      </div>

      <div className="mt-3 rounded-xl bg-surface-2 p-3 text-[13px] text-ink-2">
        {editing ? (
          <div className="space-y-2">
            {(['CLP', 'PLN', 'HUF', 'USD'] as const).map((c) => (
              <label key={c} className="flex items-center justify-between gap-3">
                <span>€1 =</span>
                <input
                  inputMode="decimal"
                  value={draft[c]}
                  onChange={(e) => setDraft({ ...draft, [c]: e.target.value })}
                  className="w-32 rounded-lg border border-line bg-bg px-2 py-1.5 text-right text-[16px] tabular-nums outline-none focus:border-accent"
                />
                <span className="w-9">{c}</span>
              </label>
            ))}
            <div className="flex justify-end gap-2 pt-1">
              <Button onClick={() => setEditing(false)}>Cancelar</Button>
              <Button primary onClick={save}>
                Guardar
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="tabular-nums">
              €1 = {fmtMoney(rates.CLP, 'CLP')} · {rates.PLN.toFixed(2).replace('.', ',')} zł · {fmtMoney(rates.HUF, 'HUF')} · US${rates.USD.toFixed(2).replace('.', ',')}
            </div>
            <div className="mt-1 flex items-center justify-between gap-2">
              <span className="text-ink-3">{rates.updated ? `Actualizado ${new Date(rates.updated).toLocaleString('es-CL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}` : 'Tasas referenciales'}</span>
              <span className="flex gap-3">
                <button type="button" onClick={refresh} disabled={busy} className="inline-flex items-center gap-1 font-semibold text-accent disabled:opacity-50">
                  <RefreshCw className={`size-3.5 ${busy ? 'animate-spin' : ''}`} />
                  Actualizar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDraft(draftOf(rates))
                    setEditing(true)
                  }}
                  className="font-semibold text-accent"
                >
                  Editar
                </button>
              </span>
            </div>
            {err && <div className="mt-1 text-danger">{err}</div>}
          </>
        )}
      </div>
      <p className="mt-2 text-[11px] text-ink-3">
        Tasas de{' '}
        <a href="https://www.exchangerate-api.com" target="_blank" rel="noopener noreferrer" className="underline">
          ExchangeRate-API
        </a>
        . Tu banco puede cobrar otra tasa.
      </p>
    </Card>
  )
}

function ExpenseLog({ rates }: { rates: Rates }) {
  const [items, setItems] = useStored<Expense[]>('eurotrip_gastos_v1', [])
  const [amount, setAmount] = useState('')
  const [cur, setCur] = useStored<Currency>('eurotrip_gastos_moneda', 'EUR')
  const [concept, setConcept] = useState('')
  const [category, setCategory] = useState('Comida')

  const totalClp = items.reduce((a, e) => a + convert(e.amount, e.currency, 'CLP', rates), 0)
  const add = () => {
    const n = parseNum(amount)
    if (!(n > 0)) return
    setItems((p) => [{ id: `${Date.now()}`, date: todayIso(), concept: concept.trim() || category, amount: n, currency: cur, category }, ...p])
    setAmount('')
    setConcept('')
  }
  const remove = (e: Expense) => {
    if (confirm(`¿Borrar «${e.concept}»?`)) setItems((p) => p.filter((x) => x.id !== e.id))
  }

  return (
    <Card className="p-4">
      <SectionTitle icon={<Wallet className="size-4" />}>Mis gastos</SectionTitle>
      <div className="flex items-end justify-between gap-3 px-1">
        <div>
          <div className="text-[30px] font-semibold leading-none tabular-nums">{fmtMoney(totalClp, 'CLP')}</div>
          <div className="mt-1 text-[14px] text-ink-2 tabular-nums">≈ {fmtMoney(convert(totalClp, 'CLP', 'EUR', rates), 'EUR')}</div>
        </div>
        <span className="text-[13px] text-ink-3">
          {items.length} {items.length === 1 ? 'gasto' : 'gastos'}
        </span>
      </div>

      <div className="mt-4 space-y-2 rounded-xl border border-line p-3">
        <div className="flex gap-2">
          <input
            inputMode="decimal"
            placeholder="Monto"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            aria-label="Monto del gasto"
            className="w-28 rounded-lg border border-line bg-bg px-3 py-2 text-[16px] tabular-nums outline-none focus:border-accent"
          />
          <input
            placeholder="¿En qué? (opcional)"
            value={concept}
            onChange={(e) => setConcept(e.target.value)}
            aria-label="Concepto"
            className="min-w-0 flex-1 rounded-lg border border-line bg-bg px-3 py-2 text-[16px] outline-none focus:border-accent"
          />
        </div>
        <Segmented value={cur} onChange={setCur} />
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={category === c}
              onClick={() => setCategory(c)}
              className={`rounded-full px-3 py-1.5 text-[13px] font-semibold ${category === c ? 'bg-accent text-accent-ink' : 'bg-surface-2 text-ink-2'}`}
            >
              {c}
            </button>
          ))}
        </div>
        <Button primary onClick={add} icon={<Plus className="size-4" />} className="w-full" disabled={!(parseNum(amount) > 0)}>
          Agregar gasto
        </Button>
      </div>

      {items.length > 0 && (
        <ul className="mt-3 divide-y divide-line">
          {items.map((e) => (
            <li key={e.id} className="flex items-center gap-3 py-2.5">
              <div className="min-w-0 flex-1">
                <div className="truncate text-[15px] font-medium">{e.concept}</div>
                <div className="text-[12px] text-ink-3">
                  {e.category} · {fmtDM(e.date)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[15px] font-semibold tabular-nums">{fmtMoney(e.amount, e.currency)}</div>
                {e.currency !== 'CLP' && <div className="text-[12px] text-ink-3 tabular-nums">{fmtMoney(convert(e.amount, e.currency, 'CLP', rates), 'CLP')}</div>}
              </div>
              <button type="button" onClick={() => remove(e)} aria-label={`Borrar ${e.concept}`} className="p-1.5 text-ink-3">
                <Trash className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-2 text-[12px] text-ink-3">Se guardan solo en este teléfono.</p>
    </Card>
  )
}

interface Planned {
  label: string
  date: string
  text: string
  amount: Amount | null
  status?: string
}

function PlannedCosts({ trip, rates }: { trip: Trip; rates: Rates }) {
  const items: Planned[] = [
    ...trip.legs
      .filter((l) => !l.optional && l.cost)
      .map((l) => ({
        label: `${l.mode === 'avion' ? 'Vuelo' : 'Tren'} ${l.from.name} ${l.roundTrip ? '⇄' : '→'} ${l.to.name}`,
        date: l.date,
        text: l.cost!,
        amount: parseAmount(l.cost),
        status: l.status,
      })),
    ...trip.days
      .filter((d) => d.localCost)
      .map((d) => ({ label: `Transporte local · ${d.city.name}`, date: d.date, text: d.localCost!.replace(/\s*\(.*\)\s*$/, ''), amount: parseAmount(d.localCost), status: 'Estimado' })),
    ...trip.stays
      .filter((s) => s.lodging?.price)
      .map((s) => ({
        label: `Alojamiento · ${s.city.name}`,
        date: s.checkIn,
        text: s.lodging!.price!,
        amount: parseAmount(s.lodging!.price),
        status: s.lodging!.paid ? 'Pagado' : s.lodging!.confirmed ? 'Reservado' : s.lodging!.status,
      })),
  ].sort((a, b) => a.date.localeCompare(b.date))

  const min = items.reduce((a, i) => a + (i.amount ? convert(i.amount.min, i.amount.cur, 'CLP', rates) : 0), 0)
  const max = items.reduce((a, i) => a + (i.amount ? convert(i.amount.max, i.amount.cur, 'CLP', rates) : 0), 0)
  const missing = trip.stays.filter((s) => !s.lodging?.price).length

  return (
    <Card className="p-4">
      <SectionTitle>Costos del viaje (planilla)</SectionTitle>
      <div className="px-1">
        <div className="text-[26px] font-semibold leading-tight tabular-nums">
          {fmtMoney(min, 'CLP')}
          {max - min > 1 && <span className="text-ink-2"> – {fmtMoney(max, 'CLP')}</span>}
        </div>
        <p className="mt-1 text-[13px] text-ink-2">
          Total para los dos con lo registrado hasta hoy{missing ? `; faltan ${missing} alojamientos por definir` : ''}.
        </p>
      </div>
      <ul className="mt-3 divide-y divide-line">
        {items.map((i, k) => (
          <li key={k} className="flex items-start gap-3 py-2.5">
            <div className="min-w-0 flex-1">
              <div className="text-[14px] font-medium leading-snug">{i.label}</div>
              <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[12px] text-ink-3">
                {fmtShort(i.date)}
                {i.status && <Chip tone={i.status === 'Pagado' || i.status === 'Incluido' || i.status === 'Reservado' ? 'ok' : 'neutral'}>{i.status}</Chip>}
              </div>
            </div>
            <div className="max-w-[45%] text-right text-[14px] font-semibold leading-snug tabular-nums break-words">{i.text}</div>
          </li>
        ))}
      </ul>
    </Card>
  )
}

export function BudgetView(props: Props) {
  return (
    <div className="space-y-4">
      <PageTitle title="Gastos" subtitle="Conversor, registro diario y costos del viaje" />
      <Converter rates={props.rates} onRefreshRates={props.onRefreshRates} onUpdateRates={props.onUpdateRates} />
      <ExpenseLog rates={props.rates} />
      <PlannedCosts trip={props.trip} rates={props.rates} />
    </div>
  )
}
