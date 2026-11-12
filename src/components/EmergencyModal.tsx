import { useState } from 'react'
import { BedDouble, ExternalLink, FileText, Landmark, Phone, Plus, ShieldCheck, Trash, UserRound } from 'lucide-react'
import type { Day, Trip } from '../types/travel'
import { countryOf, getCity, getCountry, type CountryCode } from '../data/destinations'
import { TRAVEL_INSURANCE, insuranceInfo } from '../data/resources'
import { useStored } from '../hooks/useStored'
import { Button, Card, CopyButton, Eyebrow, Sheet } from './ui'

interface Contact {
  id: string
  name: string
  phone: string
  note: string
}

const tel = (n: string) => `tel:${n.replace(/[^0-9+]/g, '')}`

export function EmergencySheet({ open, onClose, trip, day, onOpenInsurance }: { open: boolean; onClose: () => void; trip: Trip | null; day?: Day; onOpenInsurance: () => void }) {
  const ref = day && (day.excursion ?? (day.city.key === 'santiago' ? (day.to?.key !== 'santiago' ? day.to : day.from) : day.city))
  const current = countryOf(ref)?.code ?? 'NL'
  const [picked, setPicked] = useState<CountryCode | null>(null)
  const code = picked ?? current
  const country = getCountry(code)!

  const codes = trip
    ? ([...new Set(trip.days.flatMap((d) => [d.city, d.excursion].map((r) => getCity(r?.key)?.country)))].filter((c) => c && c !== 'CL') as CountryCode[])
    : []

  const stay = day && trip?.stays.find((s) => s.dayIndexes.includes(day.index))
  const ins = insuranceInfo(trip)

  const [contacts, setContacts] = useStored<Contact[]>('eurotrip_contactos_v1', [])
  const [form, setForm] = useState({ name: '', phone: '', note: '' })
  const [adding, setAdding] = useState(false)
  const add = () => {
    if (!form.name.trim() || !form.phone.trim()) return
    setContacts((p) => [...p, { id: `${Date.now()}`, name: form.name.trim(), phone: form.phone.trim(), note: form.note.trim() }])
    setForm({ name: '', phone: '', note: '' })
    setAdding(false)
  }

  return (
    <Sheet open={open} onClose={onClose} label="Emergencias">
      <div className="pt-6">
        <h2 className="font-display text-[30px] font-semibold">Emergencias</h2>

        <Card className="mt-3 p-3.5">
          <div className="flex items-center gap-2 text-[15px] font-semibold">
            <ShieldCheck className="size-4 shrink-0 text-accent" />
            <span>{TRAVEL_INSURANCE.title}</span>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[13px] text-ink-2">
            <span className="font-mono font-medium text-ink tabular-nums">{ins.number}</span>
            <CopyButton text={ins.number} />
            <span className="text-[12px] text-ink-3 tabular-nums">· {ins.validFrom}–{ins.validTo}</span>
          </div>
          <Button primary onClick={onOpenInsurance} icon={<FileText className="size-4" />} className="mt-2.5 w-full">
            Ver certificado de seguro
          </Button>
        </Card>

        <a href="tel:112" className="mt-3 flex items-center justify-between gap-4 rounded-3xl bg-danger p-5 text-danger-ink active:scale-[0.99]">
          <div>
            <div className="text-[13px] font-semibold uppercase tracking-[0.1em] opacity-85">Toda la Unión Europea</div>
            <div className="font-display text-[44px] font-semibold leading-none">112</div>
            <div className="mt-1.5 text-[14px] opacity-90">Policía, ambulancia y bomberos. Gratis, sin saldo y en inglés.</div>
          </div>
          <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-white/20">
            <Phone className="size-7" />
          </span>
        </a>

        {codes.length > 0 && (
          <div className="-mx-4 mt-4 flex gap-2 overflow-x-auto px-4 no-scrollbar">
            {codes.map((c) => (
              <button
                key={c}
                type="button"
                aria-pressed={c === code}
                onClick={() => setPicked(c)}
                className={`shrink-0 rounded-full px-3 py-1.5 text-[14px] font-semibold ${c === code ? 'bg-ink text-bg' : 'border border-line bg-surface text-ink-2'}`}
              >
                {getCountry(c)?.flag} {getCountry(c)?.name}
              </button>
            ))}
          </div>
        )}

        <Card className="mt-3 divide-y divide-line">
          {country.emergency
            .filter((e) => e.number !== '112')
            .map((e) => (
              <a key={e.number} href={tel(e.number)} className="flex items-center justify-between px-4 py-3">
                <span className="text-[15px]">{e.label}</span>
                <span className="flex items-center gap-2 text-[18px] font-semibold text-accent tabular-nums">
                  {e.number}
                  <Phone className="size-4" />
                </span>
              </a>
            ))}
          {country.consulate && (
            <a href={country.consulate.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-4 py-3">
              <Landmark className="size-5 shrink-0 text-ink-3" />
              <span className="min-w-0 flex-1 text-[15px]">{country.consulate.label}</span>
              <ExternalLink className="size-4 text-ink-3" />
            </a>
          )}
        </Card>

        {stay && (
          <Card className="mt-3 flex items-start gap-3 p-4">
            <BedDouble className="mt-0.5 size-5 shrink-0 text-ink-3" />
            <div className="min-w-0 flex-1">
              <Eyebrow>Dónde duermen esta noche</Eyebrow>
              <div className="mt-0.5 text-[15px] font-semibold">{stay.lodging?.name ?? `${stay.city.name} (sin reserva registrada)`}</div>
              {stay.lodging?.address && <div className="mt-0.5 text-[13px] text-ink-2">{stay.lodging.address}</div>}
              <div className="mt-1.5 flex flex-wrap gap-3">
                {(stay.lodging?.mapsUrl ?? stay.mapsUrl) && (
                  <a href={(stay.lodging?.mapsUrl ?? stay.mapsUrl)!} target="_blank" rel="noopener noreferrer" className="inline-block text-[14px] font-semibold text-accent">
                    Abrir en Google Maps
                  </a>
                )}
                {stay.lodging?.url && (
                  <a href={stay.lodging.url} target="_blank" rel="noopener noreferrer" className="inline-block text-[14px] font-semibold text-accent">
                    Ver reserva
                  </a>
                )}
                {stay.lodging?.phone && (
                  <a href={tel(stay.lodging.phone)} className="inline-block text-[14px] font-semibold text-accent tabular-nums">
                    Llamar anfitrión ({stay.lodging.phone})
                  </a>
                )}
              </div>
            </div>
          </Card>
        )}

        <div className="mt-5">
          <Eyebrow className="px-1">Mis contactos</Eyebrow>
          <Card className="mt-2 divide-y divide-line">
            {contacts.length === 0 && !adding && (
              <p className="px-4 py-3 text-[14px] text-ink-2">Guarda acá la asistencia del seguro, el número internacional del banco y un contacto familiar.</p>
            )}
            {contacts.map((c) => (
              <div key={c.id} className="flex items-center gap-3 px-4 py-3">
                <UserRound className="size-5 shrink-0 text-ink-3" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[15px] font-semibold">{c.name}</div>
                  <div className="text-[14px] tabular-nums text-ink-2">{c.phone}</div>
                  {c.note && <div className="text-[13px] text-ink-3">{c.note}</div>}
                </div>
                <CopyButton text={c.phone} />
                <a href={tel(c.phone)} aria-label={`Llamar a ${c.name}`} className="grid size-10 place-items-center rounded-full bg-ok-soft text-ok">
                  <Phone className="size-4" />
                </a>
                <button
                  type="button"
                  aria-label={`Borrar ${c.name}`}
                  onClick={() => confirm(`¿Borrar ${c.name}?`) && setContacts((p) => p.filter((x) => x.id !== c.id))}
                  className="p-1 text-ink-3"
                >
                  <Trash className="size-4" />
                </button>
              </div>
            ))}
            {adding && (
              <div className="space-y-2 p-3">
                {(['name', 'phone', 'note'] as const).map((f) => (
                  <input
                    key={f}
                    value={form[f]}
                    onChange={(e) => setForm({ ...form, [f]: e.target.value })}
                    placeholder={f === 'name' ? 'Nombre (ej. Seguro de viaje)' : f === 'phone' ? 'Teléfono con código de país' : 'Nota (n° de póliza, etc.)'}
                    inputMode={f === 'phone' ? 'tel' : undefined}
                    aria-label={f}
                    className="w-full rounded-lg border border-line bg-bg px-3 py-2 text-[16px] outline-none focus:border-accent"
                  />
                ))}
                <div className="flex justify-end gap-2">
                  <Button onClick={() => setAdding(false)}>Cancelar</Button>
                  <Button primary onClick={add}>
                    Guardar
                  </Button>
                </div>
              </div>
            )}
          </Card>
          {!adding && (
            <Button onClick={() => setAdding(true)} icon={<Plus className="size-4" />} className="mt-2 w-full">
              Agregar contacto
            </Button>
          )}
          <p className="mt-1.5 px-1 text-[12px] text-ink-3">Se guardan solo en este teléfono.</p>
        </div>

        <Card className="mt-5 p-4">
          <Eyebrow>Si pierden el pasaporte</Eyebrow>
          <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-[14px] leading-snug">
            <li>Hagan la denuncia en la policía local y pidan una copia.</li>
            <li>Contacten al consulado de Chile del país para el documento de viaje de emergencia.</li>
            <li>Lleven la copia digital del pasaporte y la cédula.</li>
          </ol>
          <Eyebrow className="mt-4">Si roban una tarjeta</Eyebrow>
          <p className="mt-2 text-[14px] leading-snug">Bloquéenla al tiro desde la app del banco y llamen al número internacional del emisor (guárdenlo en Mis contactos).</p>
        </Card>
      </div>
    </Sheet>
  )
}
