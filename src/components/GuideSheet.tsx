import { useEffect, useState } from 'react'
import { BookOpen, ExternalLink, Globe, Info, Navigation, Search, Ticket, WifiOff } from 'lucide-react'
import type { Place } from '../types/travel'
import { getCity, getCountry, mapsUrl, voyageUrl, wikiUrl } from '../data/destinations'
import { cachedSearch, cachedSummary, getSummary, searchTitle, type WikiSummary } from '../services/wiki'
import { currencyLabel } from '../lib/money'
import { WEEKDAY_PLURAL, fmtShort, weekdayOf } from '../lib/dates'
import { Button, Card, Chip, Eyebrow, LinkButton, Sheet } from './ui'

export type GuideTarget =
  | { kind: 'place'; place: Place; date?: string; note?: string }
  | { kind: 'city'; key: string }
  /** Lugar que no está en el catálogo: la guía se busca en Wikipedia. */
  | { kind: 'search'; label: string; query: string; cityKey: string | null; note?: string }

export interface ReaderTarget {
  url: string
  title: string
}

type WikiState = 'idle' | 'loading' | 'offline' | 'none' | 'error'

/** Resumen de Wikipedia por título o, si no hay título, buscando el lugar. */
function useWiki(title?: string, query?: string, label = '') {
  const key = title ?? (query ? `q:${query}` : undefined)
  const [fetched, setFetched] = useState<{ key: string; summary?: WikiSummary; title?: string | null } | null>(null)
  const knownTitle = title ?? (query ? cachedSearch(query) : undefined)
  const cached = knownTitle ? cachedSummary(knownTitle) : undefined
  useEffect(() => {
    if (!key || cached || knownTitle === null || !navigator.onLine) return
    let alive = true
    ;(async () => {
      const t = title ?? (await searchTitle(query!, label))
      const summary = t ? await getSummary(t) : undefined
      if (alive) setFetched({ key, summary, title: t })
    })().catch(() => alive && setFetched({ key }))
    return () => {
      alive = false
    }
    // Solo cuando cambia el lugar.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])
  const mine = fetched?.key === key ? fetched : null
  const summary = cached ?? mine?.summary
  const resolved = knownTitle ?? mine?.title ?? undefined
  const state: WikiState = summary ? 'idle' : knownTitle === null || mine?.title === null ? 'none' : !navigator.onLine ? 'offline' : mine ? 'error' : 'loading'
  return { summary, state, title: resolved ?? undefined }
}

function WikiBlock({ summary, state, title }: ReturnType<typeof useWiki>) {
  return (
    <Card className="p-3.5">
      <Eyebrow>{summary && title ? `Según Wikipedia · ${title}` : 'Según Wikipedia'}</Eyebrow>
      {summary ? (
        <p className="mt-1.5 text-[14px] leading-relaxed text-ink-2">{summary.extract}</p>
      ) : state === 'loading' ? (
        <div className="mt-2 space-y-2" aria-label="Cargando">
          <div className="h-3 w-full animate-pulse rounded bg-surface-2" />
          <div className="h-3 w-5/6 animate-pulse rounded bg-surface-2" />
          <div className="h-3 w-2/3 animate-pulse rounded bg-surface-2" />
        </div>
      ) : state === 'none' ? (
        <p className="mt-1.5 text-[14px] text-ink-3">No hay un artículo de Wikipedia en español para este lugar.</p>
      ) : (
        <p className="mt-1.5 flex items-center gap-2 text-[14px] text-ink-3">
          <WifiOff className="size-4 shrink-0" />
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
  const place = target?.kind === 'place' ? target.place : undefined
  const search = target?.kind === 'search' ? target : undefined
  const city = getCity(place ? place.city : target?.kind === 'city' ? target.key : search?.cityKey)
  const country = getCountry(city?.country)
  const isCity = target?.kind === 'city'
  const name = place?.name ?? search?.label ?? city?.name ?? 'Guía'
  const title = place ? place.wiki : isCity ? city?.wiki : undefined
  const query = title ? undefined : place ? `${place.name} ${city?.name ?? ''}` : search?.query
  const wiki = useWiki(title, query, place?.name ?? search?.label)
  const note = target && target.kind !== 'city' ? target.note : undefined
  const date = target?.kind === 'place' ? target.date : undefined
  const closed = !!(place && date && place.closed?.includes(weekdayOf(date)))
  const where = city ? `${name}, ${city.name}` : name

  return (
    <Sheet open={!!target} onClose={onClose} label={name}>
      {target && (
        <div className="pt-8">
          <Hero src={place?.photo ?? wiki.summary?.thumb} />
          <Eyebrow>
            {country?.flag ?? '📍'} {isCity ? (country?.name ?? '') : [city?.name, country?.name].filter(Boolean).join(' · ')}
          </Eyebrow>
          <h2 className="mt-1 font-display text-[30px] font-semibold leading-tight">{name}</h2>

          {(closed || place?.book) && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {closed && date && (
                <Chip tone="danger">
                  Cierra los {WEEKDAY_PLURAL[weekdayOf(date)]} · ojo el {fmtShort(date)}
                </Chip>
              )}
              {place?.book && <Chip tone="warn">Conviene reservar entrada</Chip>}
            </div>
          )}
          {place && <p className="mt-3 text-[16px] leading-relaxed">{place.blurb}</p>}
          {isCity && country && (
            <p className="mt-2 text-[15px] text-ink-2">
              {[country.currency && `Moneda: ${currencyLabel(country.currency)}`, country.language && `Idioma: ${country.language}`].filter(Boolean).join(' · ')}
            </p>
          )}
          {note && (
            <div className="mt-3 flex gap-2.5 rounded-xl bg-accent-soft px-3 py-2.5 text-[14px] leading-snug">
              <Info className="mt-0.5 size-4 shrink-0 text-accent" />
              <span className="min-w-0 break-words">
                <b className="font-semibold">En la planilla:</b> {note}
              </span>
            </div>
          )}

          <div className="mt-4">
            <WikiBlock {...wiki} />
          </div>

          <div className="mt-4 grid gap-2">
            {isCity && city ? (
              <>
                <Button primary icon={<BookOpen className="size-4" />} onClick={() => onRead({ url: voyageUrl(city.voyage), title: `Guía de ${city.name}` })}>
                  Guía de viaje de {city.name}
                </Button>
                <div className="grid grid-cols-2 gap-2">
                  <LinkButton href={mapsUrl(city.name)} icon={<Navigation className="size-4" />}>
                    Mapa
                  </LinkButton>
                  <LinkButton href={city.tourism ?? wikiUrl(city.wiki)} icon={<Globe className="size-4" />}>
                    {city.tourism ? 'Turismo' : 'Wikipedia'}
                  </LinkButton>
                </div>
              </>
            ) : (
              <>
                {wiki.title ? (
                  <Button primary icon={<BookOpen className="size-4" />} onClick={() => onRead({ url: wikiUrl(wiki.title!), title: name })}>
                    Leer la guía completa aquí
                  </Button>
                ) : (
                  <LinkButton primary href={`https://www.google.com/search?q=${encodeURIComponent(where)}`} icon={<Search className="size-4" />}>
                    Buscar en la web
                  </LinkButton>
                )}
                <div className="grid grid-cols-2 gap-2">
                  <LinkButton href={mapsUrl(where)} icon={<Navigation className="size-4" />}>
                    Cómo llegar
                  </LinkButton>
                  {place?.url ? (
                    <LinkButton href={place.url} icon={<Ticket className="size-4" />}>
                      Sitio oficial
                    </LinkButton>
                  ) : wiki.title ? (
                    <LinkButton href={wikiUrl(wiki.title)} icon={<Globe className="size-4" />}>
                      Wikipedia
                    </LinkButton>
                  ) : (
                    <LinkButton href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(where)}`} icon={<Globe className="size-4" />}>
                      Reseñas
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
