import { useEffect, useState } from 'react'
import { BookOpen, ExternalLink, Globe, Navigation, Ticket, WifiOff } from 'lucide-react'
import type { Place } from '../types/travel'
import { CITIES, COUNTRIES, mapsUrl, voyageUrl, wikiUrl } from '../data/destinations'
import { cachedSummary, getSummary, type WikiSummary } from '../services/wiki'
import { WEEKDAY_PLURAL, fmtShort, weekdayOf } from '../lib/dates'
import { Button, Card, Chip, Eyebrow, LinkButton, Sheet } from './ui'

export type GuideTarget = { kind: 'place'; place: Place; date?: string } | { kind: 'city'; key: string }

export interface ReaderTarget {
  url: string
  title: string
}

function useWiki(title?: string) {
  const [fetched, setFetched] = useState<{ title: string; summary?: WikiSummary } | null>(null)
  useEffect(() => {
    if (!title || cachedSummary(title) || !navigator.onLine) return
    let alive = true
    getSummary(title)
      .then((summary) => alive && setFetched({ title, summary }))
      .catch(() => alive && setFetched({ title }))
    return () => {
      alive = false
    }
  }, [title])
  const mine = fetched?.title === title ? fetched : null
  const summary = (title ? cachedSummary(title) : undefined) ?? mine?.summary
  const state: 'idle' | 'loading' | 'offline' | 'error' = summary ? 'idle' : !navigator.onLine ? 'offline' : mine ? 'error' : 'loading'
  return { summary, state }
}

function WikiBlock({ summary, state }: ReturnType<typeof useWiki>) {
  return (
    <Card className="p-3.5">
      <Eyebrow>Según Wikipedia</Eyebrow>
      {summary ? (
        <p className="mt-1.5 text-[14px] leading-relaxed text-ink-2">{summary.extract}</p>
      ) : state === 'loading' ? (
        <div className="mt-2 space-y-2" aria-label="Cargando">
          <div className="h-3 w-full animate-pulse rounded bg-surface-2" />
          <div className="h-3 w-5/6 animate-pulse rounded bg-surface-2" />
          <div className="h-3 w-2/3 animate-pulse rounded bg-surface-2" />
        </div>
      ) : (
        <p className="mt-1.5 flex items-center gap-2 text-[14px] text-ink-3">
          <WifiOff className="size-4" />
          {state === 'offline' ? 'Sin conexión. Descarga las guías en Ajustes para leerlas offline.' : 'No se pudo cargar el resumen.'}
        </p>
      )}
    </Card>
  )
}

function Hero({ src }: { src?: string }) {
  if (!src || /\.svg/i.test(src)) return null
  return <img src={src} alt="" className="mb-4 aspect-[16/10] w-full rounded-2xl bg-surface-2 object-cover" />
}

export function GuideSheet({ target, onClose, onRead }: { target: GuideTarget | null; onClose: () => void; onRead: (r: ReaderTarget) => void }) {
  const city = target ? CITIES[target.kind === 'place' ? target.place.city : target.key] : undefined
  const title = target ? (target.kind === 'place' ? target.place.wiki : city?.wiki) : undefined
  const wiki = useWiki(title)
  const country = city ? COUNTRIES[city.country] : undefined

  return (
    <Sheet open={!!target} onClose={onClose} label={target?.kind === 'place' ? target.place.name : (city?.name ?? 'Guía')}>
      {target && city && country && (
        <div className="pt-8">
          <Hero src={(target.kind === 'place' ? target.place.photo : undefined) ?? wiki.summary?.thumb} />
          <Eyebrow>
            {country.flag} {target.kind === 'place' ? `${city.name} · ${country.name}` : country.name}
          </Eyebrow>
          <h2 className="mt-1 font-display text-[30px] font-semibold leading-tight">{target.kind === 'place' ? target.place.name : city.name}</h2>

          {target.kind === 'place' ? (
            <>
              {(target.place.book || (target.date && target.place.closed?.includes(weekdayOf(target.date)))) && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {target.date && target.place.closed?.includes(weekdayOf(target.date)) && (
                    <Chip tone="danger">
                      Cierra los {WEEKDAY_PLURAL[weekdayOf(target.date)]} · ojo el {fmtShort(target.date)}
                    </Chip>
                  )}
                  {target.place.book && <Chip tone="warn">Conviene reservar entrada</Chip>}
                </div>
              )}
              <p className="mt-3 text-[16px] leading-relaxed">{target.place.blurb}</p>
            </>
          ) : (
            <p className="mt-2 text-[15px] text-ink-2">
              Moneda: {country.currency === 'EUR' ? 'euro (€)' : country.currency === 'HUF' ? 'forinto húngaro (Ft)' : country.currency} · Idioma: {country.language}
            </p>
          )}

          <div className="mt-4">
            <WikiBlock {...wiki} />
          </div>

          <div className="mt-4 grid gap-2">
            {target.kind === 'place' ? (
              <>
                <Button primary icon={<BookOpen className="size-4" />} onClick={() => onRead({ url: wikiUrl(target.place.wiki ?? target.place.name), title: target.place.name })}>
                  Leer la guía completa aquí
                </Button>
                <div className="grid grid-cols-2 gap-2">
                  <LinkButton href={mapsUrl(`${target.place.name}, ${city.name}`)} icon={<Navigation className="size-4" />}>
                    Cómo llegar
                  </LinkButton>
                  {target.place.url ? (
                    <LinkButton href={target.place.url} icon={<Ticket className="size-4" />}>
                      Sitio oficial
                    </LinkButton>
                  ) : (
                    <LinkButton href={wikiUrl(target.place.wiki ?? target.place.name)} icon={<Globe className="size-4" />}>
                      Wikipedia
                    </LinkButton>
                  )}
                </div>
              </>
            ) : (
              <>
                <Button primary icon={<BookOpen className="size-4" />} onClick={() => onRead({ url: voyageUrl(city.voyage), title: `Guía de ${city.name}` })}>
                  Guía de viaje de {city.name}
                </Button>
                <div className="grid grid-cols-2 gap-2">
                  <LinkButton href={mapsUrl(city.name)} icon={<Navigation className="size-4" />}>
                    Ver en el mapa
                  </LinkButton>
                  {city.tourism && (
                    <LinkButton href={city.tourism} icon={<Globe className="size-4" />}>
                      Turismo oficial
                    </LinkButton>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </Sheet>
  )
}

/** Lector a pantalla completa para ver guías sin salir de la app. */
export function ReaderSheet({ reader, onClose }: { reader: ReaderTarget | null; onClose: () => void }) {
  return (
    <Sheet open={!!reader} onClose={onClose} label={reader?.title ?? 'Guía'} full z="z-[60]">
      {reader && (
        <>
          <div className="flex items-center gap-3 px-4 pb-3 pr-14">
            <div className="min-w-0 flex-1 truncate text-[16px] font-semibold">{reader.title}</div>
            <a href={reader.url} target="_blank" rel="noopener noreferrer" className="inline-flex shrink-0 items-center gap-1 text-[13px] font-semibold text-accent">
              Abrir fuera
              <ExternalLink className="size-3.5" />
            </a>
          </div>
          {navigator.onLine ? (
            <iframe src={reader.url} title={reader.title} className="min-h-0 w-full flex-1 border-0 bg-white" referrerPolicy="no-referrer" />
          ) : (
            <div className="grid flex-1 place-items-center px-8 text-center text-[15px] text-ink-2">
              La guía completa necesita conexión. El resumen sí queda guardado en el teléfono.
            </div>
          )}
        </>
      )}
    </Sheet>
  )
}
