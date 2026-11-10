import type { ReactNode } from 'react'
import {
  Banknote, ChevronDown, ChevronRight, Clock, Coins, ExternalLink, FileSpreadsheet, FileText, Info, Languages,
  ListChecks, Map as MapIcon, Phone, Pill, Plug, ShieldAlert, Smartphone, Ticket, TrainFront,
} from 'lucide-react'
import type { Trip } from '../../types/travel'
import { CITIES, COUNTRIES, PLUG_NOTE, type CountryCode } from '../../data/destinations'
import { LINK_GROUPS, tipMeta } from '../../data/resources'
import { Checklist } from '../Checklist'
import { Card, PageTitle, Row, SectionTitle } from '../ui'

const TIP_ICONS: Record<ReturnType<typeof tipMeta>['icon'], ReactNode> = {
  doc: <FileText className="size-4" />,
  shield: <ShieldAlert className="size-4" />,
  pill: <Pill className="size-4" />,
  phone: <Smartphone className="size-4" />,
  clock: <Clock className="size-4" />,
  cash: <Banknote className="size-4" />,
  coins: <Coins className="size-4" />,
  map: <MapIcon className="size-4" />,
  train: <TrainFront className="size-4" />,
  ticket: <Ticket className="size-4" />,
  info: <Info className="size-4" />,
}

export function GuideView({ trip, sheetLink, onCity }: { trip: Trip; sheetLink: string; onCity: (key: string) => void }) {
  const cityKeys: string[] = []
  for (const d of trip.days) {
    for (const ref of [d.city, d.excursion, d.leg?.to]) {
      if (ref?.key && ref.key !== 'santiago' && !cityKeys.includes(ref.key)) cityKeys.push(ref.key)
    }
  }
  const countryCodes = [...new Set(cityKeys.map((k) => CITIES[k].country))] as CountryCode[]

  return (
    <div className="space-y-6">
      <PageTitle title="Guía" subtitle="Pendientes, ciudades, consejos y lo básico de cada país" />

      <Card className="p-4">
        <SectionTitle icon={<ListChecks className="size-4" />}>Antes de viajar</SectionTitle>
        <Checklist trip={trip} />
      </Card>

      <section>
        <SectionTitle>Guías de cada ciudad</SectionTitle>
        <div className="grid grid-cols-2 gap-2">
          {cityKeys.map((k) => {
            const c = CITIES[k]
            return (
              <button key={k} type="button" onClick={() => onCity(k)} className="flex items-center justify-between gap-2 rounded-2xl border border-line bg-surface px-3.5 py-3 text-left active:bg-surface-2">
                <span className="min-w-0">
                  <span className="block text-[12px] text-ink-3">
                    {COUNTRIES[c.country].flag} {COUNTRIES[c.country].name}
                  </span>
                  <span className="block truncate font-display text-[19px] font-semibold">{c.name}</span>
                </span>
                <ChevronRight className="size-4 shrink-0 text-ink-3" />
              </button>
            )
          })}
        </div>
      </section>

      {trip.tips.length > 0 && (
        <section>
          <SectionTitle>Consejos de la planilla</SectionTitle>
          <Card className="divide-y divide-line px-4">
            {trip.tips.map((t, i) => {
              const meta = tipMeta(t)
              return (
                <Row key={i} icon={TIP_ICONS[meta.icon]} label={meta.title}>
                  {t}
                </Row>
              )
            })}
          </Card>
        </section>
      )}

      <section>
        <SectionTitle>Países</SectionTitle>
        <div className="space-y-2">
          {countryCodes.map((code) => {
            const c = COUNTRIES[code]
            const cities = cityKeys.filter((k) => CITIES[k].country === code).map((k) => CITIES[k].name)
            return (
              <details key={code} className="group rounded-2xl border border-line bg-surface">
                <summary className="flex cursor-pointer list-none items-center gap-3 p-4 [&::-webkit-details-marker]:hidden">
                  <span className="text-[26px] leading-none" aria-hidden>
                    {c.flag}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[17px] font-semibold">{c.name}</span>
                    <span className="block truncate text-[13px] text-ink-2">{cities.join(' · ')}</span>
                  </span>
                  <ChevronDown className="size-5 shrink-0 text-ink-3 transition-transform group-open:rotate-180" />
                </summary>
                <div className="border-t border-line px-4 pb-4">
                  <div className="divide-y divide-line">
                    <Row icon={<Coins className="size-4" />} label="Moneda">
                      {c.currency === 'EUR' ? 'Euro (€)' : 'Forinto húngaro (HUF, Ft)'}
                    </Row>
                    <Row icon={<Phone className="size-4" />} label="Emergencias">
                      <span className="flex flex-wrap gap-x-4 gap-y-1">
                        {c.emergency.map((e) => (
                          <a key={e.number} href={`tel:${e.number.replace(/\s/g, '')}`} className={`font-semibold ${e.number === '112' ? 'text-danger' : 'text-accent'}`}>
                            {e.number} · {e.label}
                          </a>
                        ))}
                      </span>
                    </Row>
                    <Row icon={<Plug className="size-4" />} label="Enchufes">
                      {c.plugs}
                      <span className="mt-0.5 block text-[13px] text-ink-2">{PLUG_NOTE}</span>
                    </Row>
                    <Row icon={<Languages className="size-4" />} label={`Idioma: ${c.language}`}>
                      <table className="mt-1 w-full text-[14px]">
                        <tbody>
                          {c.phrases.map(([es, local, pron]) => (
                            <tr key={es} className="align-top">
                              <td className="py-1 pr-3 text-ink-2">{es}</td>
                              <td className="py-1 font-semibold">
                                {local}
                                {pron && <span className="block text-[12px] font-normal text-ink-3">«{pron}»</span>}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </Row>
                  </div>
                  {c.tips.length > 0 && (
                    <ul className="mt-2 space-y-1.5 rounded-xl bg-surface-2 p-3">
                      {c.tips.map((t) => (
                        <li key={t} className="flex gap-2 text-[14px] leading-snug">
                          <span className="text-accent">•</span>
                          <span>{t}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {c.consulate && (
                    <a href={c.consulate.url} target="_blank" rel="noopener noreferrer" className="mt-3 flex items-center justify-between rounded-xl border border-line px-3.5 py-3 text-[14px] font-semibold">
                      {c.consulate.label}
                      <ExternalLink className="size-4 text-ink-3" />
                    </a>
                  )}
                </div>
              </details>
            )
          })}
        </div>
      </section>

      {LINK_GROUPS.map((g) => (
        <section key={g.title}>
          <SectionTitle>{g.title}</SectionTitle>
          <Card className="divide-y divide-line">
            {g.items.map((it) => (
              <a key={it.url} href={it.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-4 py-3 active:bg-surface-2">
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] font-semibold">{it.name}</span>
                  <span className="block text-[13px] leading-snug text-ink-2">{it.note}</span>
                </span>
                <ExternalLink className="size-4 shrink-0 text-ink-3" />
              </a>
            ))}
          </Card>
        </section>
      ))}

      <a href={sheetLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-3.5">
        <FileSpreadsheet className="size-5 text-ok" />
        <span className="min-w-0 flex-1">
          <span className="block text-[15px] font-semibold">Planilla del itinerario</span>
          <span className="block text-[13px] text-ink-2">Los cambios que hagan ahí se ven en la app al actualizar.</span>
        </span>
        <ExternalLink className="size-4 text-ink-3" />
      </a>
    </div>
  )
}
