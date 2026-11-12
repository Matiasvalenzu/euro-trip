import { useState } from 'react'
import { BedDouble, ChevronDown, Clock, Coffee, ExternalLink, Info, MapPin, Phone, Receipt, RotateCcw, Search } from 'lucide-react'
import type { Stay, Trip } from '../../types/travel'
import { countryOf } from '../../data/destinations'
import { fmtShort } from '../../lib/dates'
import { capitalize } from '../../lib/text'
import { Card, Chip, CopyButton, Empty, Eyebrow, LinkButton, PageTitle, Row } from '../ui'

function searchLinks(s: Stay) {
  const q = encodeURIComponent(s.city.name)
  return {
    airbnb: `https://www.airbnb.com/s/${q}/homes?checkin=${s.checkIn}&checkout=${s.checkOut}&adults=2`,
    booking: `https://www.booking.com/searchresults.html?ss=${q}&checkin=${s.checkIn}&checkout=${s.checkOut}&group_adults=2&no_rooms=1`,
  }
}

function StayCard({ stay }: { stay: Stay }) {
  const [showOptions, setShowOptions] = useState(false)
  const l = stay.lodging
  const country = countryOf(stay.city)
  const links = searchLinks(stay)
  const status = l ? (l.confirmed ? { tone: 'ok' as const, text: l.status === 'Confirmado' ? 'Confirmado' : 'Reservado' } : { tone: 'warn' as const, text: l.status }) : { tone: 'danger' as const, text: 'Sin reserva' }

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Eyebrow>
            {country?.flag} {country?.name}
          </Eyebrow>
          <h2 className="mt-0.5 font-display text-[30px] font-semibold leading-tight">{stay.city.name}</h2>
          <p className="mt-0.5 text-[14px] text-ink-2">
            {fmtShort(stay.checkIn)} → {fmtShort(stay.checkOut)} · {stay.nights} {stay.nights === 1 ? 'noche' : 'noches'}
          </p>
        </div>
        <Chip tone={status.tone} className="mt-1 shrink-0">
          {status.text}
        </Chip>
      </div>

      {l ? (
        <>
          <div className="mt-4 text-[17px] font-semibold leading-snug">{l.name}</div>
          <div className="mt-1 divide-y divide-line">
            {l.address && (
              <Row icon={<MapPin className="size-4" />} label="Dirección">
                <span className="flex items-center justify-between gap-2">
                  <span>{l.address}</span>
                  <CopyButton text={l.address} />
                </span>
              </Row>
            )}
            {l.hours && (
              <Row icon={<Clock className="size-4" />} label="Horario">
                {l.hours}
              </Row>
            )}
            {l.phone && (
              <Row icon={<Phone className="size-4" />} label="Contacto anfitrión">
                <span className="flex items-center justify-between gap-2">
                  <a href={`tel:${l.phone.replace(/[^0-9+]/g, '')}`} className="font-semibold text-accent tabular-nums">
                    {l.phone}
                  </a>
                  <CopyButton text={l.phone} />
                </span>
              </Row>
            )}
            {l.price && (
              <Row icon={<Receipt className="size-4" />} label="Total">
                <span className="flex flex-wrap items-center gap-2">
                  {l.price}
                  {l.paid && <Chip tone="ok">Pagado</Chip>}
                </span>
              </Row>
            )}
            {l.code && (
              <Row icon={<BedDouble className="size-4" />} label="Código de reserva">
                <span className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[15px] font-semibold tracking-wide">{l.code}</span>
                  <CopyButton text={l.code} />
                </span>
              </Row>
            )}
            {l.refund && (
              <Row icon={<RotateCcw className="size-4" />} label="Cancelación">
                {l.refund}
              </Row>
            )}
            {l.breakfast && (
              <Row icon={<Coffee className="size-4" />} label="Desayuno">
                {capitalize(l.breakfast.replace(/^desayuno\s*/i, ''))}
              </Row>
            )}
            {stay.notes.filter((n) => !/^misma (reserva|estad[ií]a)/i.test(n)).map((n, i) => (
              <Row key={i} icon={<Info className="size-4" />} label="Nota">
                {n}
              </Row>
            ))}
          </div>
          <div className={`mt-3 grid gap-2 ${l.url && (l.mapsUrl ?? stay.mapsUrl) ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {(l.mapsUrl ?? stay.mapsUrl) && (
              <LinkButton href={(l.mapsUrl ?? stay.mapsUrl)!} primary={!l.url} icon={<MapPin className="size-4" />}>
                Google Maps
              </LinkButton>
            )}
            {l.url && (
              <LinkButton href={l.url} primary>
                Abrir reserva
              </LinkButton>
            )}
          </div>
          {l.options.length > 0 && (
            <div className="mt-3">
              <button type="button" onClick={() => setShowOptions(!showOptions)} aria-expanded={showOptions} className="flex w-full items-center justify-between py-1 text-[14px] font-semibold text-accent">
                Otras opciones revisadas ({l.options.length})
                <ChevronDown className={`size-4 transition-transform ${showOptions ? 'rotate-180' : ''}`} />
              </button>
              {showOptions && (
                <ul className="mt-2 space-y-2">
                  {l.options.map((o, i) => (
                    <li key={i} className="rounded-xl bg-surface-2 p-3">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[15px] font-semibold leading-snug">{o.name}</span>
                        <span className="flex shrink-0 items-center gap-1.5">
                          {o.mapsUrl && (
                            <a href={o.mapsUrl} target="_blank" rel="noopener noreferrer" aria-label={`Ver ${o.name} en Google Maps`} className="p-0.5 text-accent">
                              <MapPin className="size-4" />
                            </a>
                          )}
                          {o.url && (
                            <a href={o.url} target="_blank" rel="noopener noreferrer" aria-label={`Ver ${o.name}`} className="p-0.5 text-accent">
                              <ExternalLink className="size-4" />
                            </a>
                          )}
                        </span>
                      </div>
                      {o.detail && <p className="mt-1 text-[13px] leading-snug text-ink-2 break-words">{o.detail}</p>}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </>
      ) : (
        <>
          <p className="mt-3 text-[14px] text-ink-2">Todavía no hay alojamiento en la planilla para estas noches.</p>
          {stay.notes.length > 0 && (
            <div className="mt-1 divide-y divide-line">
              {stay.notes.map((n, i) => (
                <Row key={i} icon={<Info className="size-4" />} label="Nota">
                  {n}
                </Row>
              ))}
            </div>
          )}
          <div className="mt-3 grid grid-cols-2 gap-2">
            <LinkButton href={links.airbnb} icon={<Search className="size-4" />}>
              Airbnb
            </LinkButton>
            <LinkButton href={links.booking} icon={<Search className="size-4" />}>
              Booking
            </LinkButton>
          </div>
          {stay.mapsUrl && (
            <LinkButton href={stay.mapsUrl} icon={<MapPin className="size-4" />} className="mt-2 w-full">
              Ver zona en Google Maps
            </LinkButton>
          )}
        </>
      )}
    </Card>
  )
}

export function AccommodationView({ trip }: { trip: Trip }) {
  const nights = trip.stays.reduce((a, s) => a + s.nights, 0)
  const confirmed = trip.stays.filter((s) => s.lodging?.confirmed).length
  const transit = trip.days.filter((d) => !d.sleep)

  return (
    <div className="space-y-4">
      <PageTitle
        title="Estadías"
        subtitle={`${nights} noches en ${trip.stays.length} ciudades · ${confirmed} de ${trip.stays.length} reservadas`}
      />
      {trip.stays.length === 0 ? (
        <Empty icon={<BedDouble className="size-6" />} title="Sin estadías" />
      ) : (
        trip.stays.map((s) => <StayCard key={s.id} stay={s} />)
      )}
      {transit.length > 0 && (
        <p className="px-1 text-[13px] text-ink-3">
          Noches en el avión: {transit.map((d) => fmtShort(d.date)).join(' y ')}.
        </p>
      )}
    </div>
  )
}
