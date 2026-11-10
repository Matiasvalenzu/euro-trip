import type { CityRef } from '../types/travel'
import { findWord, norm } from '../lib/text'
import { readJson, writeJson } from '../services/storage'

/** Código ISO de país ("PL", "FR"…). */
export type CountryCode = string

export interface Country {
  code: CountryCode
  name: string
  flag: string
  currency: string
  language: string
  /** [español, idioma local, pronunciación aproximada] */
  phrases: [string, string, string?][]
  emergency: { label: string; number: string }[]
  plugs: string
  tips: string[]
  consulate?: { label: string; url: string }
  sundayNote?: string
}

export interface City {
  key: string
  name: string
  country: CountryCode
  aliases: string[]
  lat: number
  lon: number
  tz: string
  wiki: string
  voyage: string
  tourism?: string
}

const PLUG_C_F = 'Tipo C/F · 230 V'
const PLUG_C_E = 'Tipo C/E · 230 V'

export const COUNTRIES: Record<string, Country> = {
  CL: {
    code: 'CL', name: 'Chile', flag: '🇨🇱', currency: 'CLP', language: 'Español',
    phrases: [], emergency: [{ label: 'Emergencias', number: '112' }], plugs: 'Tipo C/L · 220 V', tips: [],
  },
  NL: {
    code: 'NL', name: 'Países Bajos', flag: '🇳🇱', currency: 'EUR',
    language: 'Neerlandés (casi todos hablan inglés)',
    phrases: [
      ['Hola', 'Hallo'], ['Gracias', 'Dank je wel', 'dank ye vel'], ['Por favor', 'Alsjeblieft', 'als-ye-blift'],
      ['Perdón', 'Sorry'], ['¿Habla inglés?', 'Spreekt u Engels?'], ['La cuenta, por favor', 'De rekening, alstublieft'],
    ],
    emergency: [{ label: 'Emergencias', number: '112' }, { label: 'Policía (no urgente)', number: '0900 8844' }],
    plugs: PLUG_C_F,
    tips: [
      'Se paga con tarjeta casi en todas partes; algunos locales no aceptan efectivo.',
      'En tranvía y metro pasa la tarjeta sin contacto al subir y al bajar.',
      'Las ciclovías (rojas) son de las bicis: mira antes de cruzar.',
    ],
    consulate: { label: 'Embajada de Chile en Países Bajos', url: 'https://www.chile.gob.cl/paises-bajos' },
  },
  BE: {
    code: 'BE', name: 'Bélgica', flag: '🇧🇪', currency: 'EUR',
    language: 'Francés en Bruselas · neerlandés en Brujas',
    phrases: [
      ['Hola', 'Bonjour', 'bon-yur'], ['Gracias', 'Merci · Dank u (Brujas)'], ['Por favor', "S'il vous plaît"],
      ['Perdón', 'Pardon'], ['¿Habla inglés?', 'Vous parlez anglais ?'], ['La cuenta, por favor', "L'addition, s'il vous plaît"],
    ],
    emergency: [{ label: 'Emergencias', number: '112' }, { label: 'Policía', number: '101' }],
    plugs: PLUG_C_E,
    tips: [
      'Bruselas es mayormente francófona; en Brujas (Flandes) se habla neerlandés.',
      'Prueba gofres, papas fritas en cono y chocolate en las Galerías Saint-Hubert.',
    ],
    consulate: { label: 'Embajada de Chile en Bélgica', url: 'https://www.chile.gob.cl/belgica' },
  },
  DE: {
    code: 'DE', name: 'Alemania', flag: '🇩🇪', currency: 'EUR', language: 'Alemán',
    phrases: [
      ['Hola', 'Hallo'], ['Gracias', 'Danke', 'dan-ke'], ['Por favor', 'Bitte', 'bi-te'],
      ['Perdón', 'Entschuldigung', 'ent-shul-di-gung'], ['¿Habla inglés?', 'Sprechen Sie Englisch?'], ['La cuenta, por favor', 'Die Rechnung, bitte'],
    ],
    emergency: [{ label: 'Emergencias', number: '112' }, { label: 'Policía', number: '110' }],
    plugs: PLUG_C_F,
    tips: [
      'Valida el billete antes de subir al U-Bahn o S-Bahn: no hay torniquetes y las multas son altas.',
      'Lleva algo de efectivo: muchos cafés y puestos de mercado no aceptan tarjeta.',
      'Los domingos casi todo el comercio cierra.',
    ],
    consulate: { label: 'Embajada de Chile en Alemania', url: 'https://www.chile.gob.cl/alemania' },
    sundayNote: 'Domingo: casi todo el comercio está cerrado.',
  },
  PL: {
    code: 'PL', name: 'Polonia', flag: '🇵🇱', currency: 'PLN', language: 'Polaco',
    phrases: [
      ['Hola', 'Dzień dobry · Cześć (informal)', 'yeñ dó-bri · cheshch'], ['Gracias', 'Dziękuję', 'dyen-kú-ye'], ['Por favor', 'Proszę', 'pró-she'],
      ['Perdón', 'Przepraszam', 'pshe-prá-sham'], ['¿Habla inglés?', 'Czy mówi pan po angielsku?'], ['La cuenta, por favor', 'Poproszę rachunek'],
      ['¡Salud!', 'Na zdrowie!', 'na zdró-vie'],
    ],
    emergency: [{ label: 'Emergencias', number: '112' }, { label: 'Policía', number: '997' }, { label: 'Ambulancia', number: '999' }],
    plugs: PLUG_C_E,
    tips: [
      'La moneda es el złoty (PLN), no el euro. Paga en złoty y rechaza la «conversión» a euros o pesos.',
      'Los domingos la mayoría de las tiendas cierra.',
      'En tranvía, bus y metro valida el boleto (bilet) al subir; se compran en máquinas o en la app.',
    ],
    consulate: { label: 'Embajada de Chile en Polonia', url: 'https://www.chile.gob.cl/polonia' },
    sundayNote: 'Domingo en Polonia: la mayoría de las tiendas está cerrada.',
  },
  HU: {
    code: 'HU', name: 'Hungría', flag: '🇭🇺', currency: 'HUF', language: 'Húngaro',
    phrases: [
      ['Hola', 'Szia (informal) · Jó napot', 'sia · yo napot'], ['Gracias', 'Köszönöm', 'kö-sö-nöm'], ['Por favor', 'Kérem', 'ké-rem'],
      ['Perdón', 'Elnézést', 'el-né-zésht'], ['¿Habla inglés?', 'Beszél angolul?'], ['La cuenta, por favor', 'A számlát, kérem'],
      ['¡Salud!', 'Egészségedre!', 'é-gués-she-gued-re'],
    ],
    emergency: [{ label: 'Emergencias', number: '112' }, { label: 'Policía', number: '107' }, { label: 'Ambulancia', number: '104' }],
    plugs: PLUG_C_F,
    tips: [
      'La moneda es el forinto (HUF), no el euro. Paga siempre en HUF.',
      'Rechaza la «conversión» a euros o pesos en cajeros y datáfonos: el tipo de cambio es peor.',
      'Revisa si la cuenta ya incluye servicio («szervízdíj»); si no, deja 10–15 %.',
      'Los pases de transporte de 24 o 72 h se compran en la app BudapestGO.',
    ],
    consulate: { label: 'Embajada de Chile en Hungría', url: 'https://www.chile.gob.cl/hungria' },
  },
  AT: {
    code: 'AT', name: 'Austria', flag: '🇦🇹', currency: 'EUR', language: 'Alemán',
    phrases: [
      ['Hola', 'Grüß Gott · Servus'], ['Gracias', 'Danke'], ['Por favor', 'Bitte'],
      ['Perdón', 'Entschuldigung'], ['La cuenta, por favor', 'Die Rechnung, bitte'],
    ],
    emergency: [{ label: 'Emergencias', number: '112' }, { label: 'Policía', number: '133' }, { label: 'Ambulancia', number: '144' }],
    plugs: PLUG_C_F,
    tips: [
      'Los domingos las tiendas cierran; los mercados navideños sí abren.',
      'En los cafés vieneses el vaso de agua viene con el café y puedes quedarte sin apuro.',
    ],
    consulate: { label: 'Embajada de Chile en Austria', url: 'https://www.chile.gob.cl/austria' },
    sundayNote: 'Domingo en Austria: las tiendas cierran (los mercados navideños sí abren).',
  },
  SK: {
    code: 'SK', name: 'Eslovaquia', flag: '🇸🇰', currency: 'EUR', language: 'Eslovaco',
    phrases: [
      ['Hola', 'Dobrý deň', 'do-bri dyen'], ['Gracias', 'Ďakujem', 'dya-ku-yem'], ['Por favor', 'Prosím'],
      ['Perdón', 'Prepáčte'], ['La cuenta, por favor', 'Účet, prosím'],
    ],
    emergency: [{ label: 'Emergencias', number: '112' }, { label: 'Policía', number: '158' }, { label: 'Ambulancia', number: '155' }],
    plugs: PLUG_C_E,
    tips: ['El casco antiguo de Bratislava es compacto: se recorre a pie en medio día.'],
    consulate: { label: 'Embajada más cercana (Viena)', url: 'https://www.chile.gob.cl/austria' },
  },
  FR: {
    code: 'FR', name: 'Francia', flag: '🇫🇷', currency: 'EUR', language: 'Francés',
    phrases: [
      ['Hola', 'Bonjour', 'bon-yur'], ['Gracias', 'Merci', 'mer-sí'], ['Por favor', "S'il vous plaît", 'sil vu plé'],
      ['Perdón', 'Pardon'], ['¿Habla inglés?', 'Parlez-vous anglais ?'], ['La cuenta, por favor', "L'addition, s'il vous plaît"],
    ],
    emergency: [{ label: 'Emergencias', number: '112' }, { label: 'Policía', number: '17' }, { label: 'Ambulancia (SAMU)', number: '15' }],
    plugs: PLUG_C_E,
    tips: [
      'Saluda con «Bonjour» al entrar a cualquier tienda o café: es casi obligatorio.',
      'En el metro y en Montmartre cuida bolsos y celulares.',
      'El Louvre cierra los martes.',
    ],
    consulate: { label: 'Embajada de Chile en Francia', url: 'https://www.chile.gob.cl/francia' },
  },
  ES: {
    code: 'ES', name: 'España', flag: '🇪🇸', currency: 'EUR', language: 'Español y catalán',
    phrases: [
      ['Buenos días', 'Bon dia (catalán)'], ['Gracias', 'Gràcies'], ['Por favor', 'Si us plau'], ['Perdón', 'Perdó'],
    ],
    emergency: [{ label: 'Emergencias', number: '112' }, { label: 'Policía Nacional', number: '091' }],
    plugs: PLUG_C_F,
    tips: [
      'Cuidado con carteristas en La Rambla, el metro y la Barceloneta.',
      'Se cena tarde: muchos restaurantes abren la cocina a las 20:30 o 21:00.',
    ],
    consulate: { label: 'Consulado de Chile en Barcelona', url: 'https://www.chile.gob.cl/barcelona' },
    sundayNote: 'Domingo en Barcelona: muchas tiendas cierran, salvo en zonas turísticas.',
  },
}

export const PLUG_NOTE =
  'Los cargadores chilenos de dos patas redondas (tipo C) funcionan en toda Europa; los de tres patas en línea (tipo L) necesitan adaptador.'

export const CITIES: Record<string, City> = {
  santiago: { key: 'santiago', name: 'Santiago', country: 'CL', aliases: ['santiago'], lat: -33.4489, lon: -70.6693, tz: 'America/Santiago', wiki: 'Santiago de Chile', voyage: 'Santiago de Chile' },
  amsterdam: { key: 'amsterdam', name: 'Ámsterdam', country: 'NL', aliases: ['amsterdam'], lat: 52.3676, lon: 4.9041, tz: 'Europe/Amsterdam', wiki: 'Ámsterdam', voyage: 'Ámsterdam', tourism: 'https://www.iamsterdam.com' },
  bruselas: { key: 'bruselas', name: 'Bruselas', country: 'BE', aliases: ['bruselas', 'bruxelles', 'brussels', 'brussel'], lat: 50.8467, lon: 4.3525, tz: 'Europe/Brussels', wiki: 'Bruselas', voyage: 'Bruselas', tourism: 'https://www.visit.brussels' },
  brujas: { key: 'brujas', name: 'Brujas', country: 'BE', aliases: ['brujas', 'brugge', 'bruges'], lat: 51.2093, lon: 3.2247, tz: 'Europe/Brussels', wiki: 'Brujas', voyage: 'Brujas', tourism: 'https://www.visitbruges.be' },
  berlin: { key: 'berlin', name: 'Berlín', country: 'DE', aliases: ['berlin'], lat: 52.52, lon: 13.405, tz: 'Europe/Berlin', wiki: 'Berlín', voyage: 'Berlín', tourism: 'https://www.visitberlin.de' },
  varsovia: { key: 'varsovia', name: 'Varsovia', country: 'PL', aliases: ['varsovia', 'warszawa', 'warsaw'], lat: 52.2298, lon: 21.0118, tz: 'Europe/Warsaw', wiki: 'Varsovia', voyage: 'Varsovia', tourism: 'https://warsawtour.pl' },
  budapest: { key: 'budapest', name: 'Budapest', country: 'HU', aliases: ['budapest'], lat: 47.4979, lon: 19.0402, tz: 'Europe/Budapest', wiki: 'Budapest', voyage: 'Budapest', tourism: 'https://www.budapestinfo.hu' },
  viena: { key: 'viena', name: 'Viena', country: 'AT', aliases: ['viena', 'wien', 'vienna'], lat: 48.2082, lon: 16.3738, tz: 'Europe/Vienna', wiki: 'Viena', voyage: 'Viena', tourism: 'https://www.wien.info' },
  bratislava: { key: 'bratislava', name: 'Bratislava', country: 'SK', aliases: ['bratislava'], lat: 48.1486, lon: 17.1077, tz: 'Europe/Bratislava', wiki: 'Bratislava', voyage: 'Bratislava', tourism: 'https://www.visitbratislava.com' },
  paris: { key: 'paris', name: 'París', country: 'FR', aliases: ['paris'], lat: 48.8566, lon: 2.3522, tz: 'Europe/Paris', wiki: 'París', voyage: 'París', tourism: 'https://parisjetaime.com' },
  barcelona: { key: 'barcelona', name: 'Barcelona', country: 'ES', aliases: ['barcelona'], lat: 41.3874, lon: 2.1686, tz: 'Europe/Madrid', wiki: 'Barcelona', voyage: 'Barcelona', tourism: 'https://www.barcelonaturisme.com' },
  sitges: { key: 'sitges', name: 'Sitges', country: 'ES', aliases: ['sitges'], lat: 41.2371, lon: 1.8059, tz: 'Europe/Madrid', wiki: 'Sitges', voyage: 'Sitges', tourism: 'https://www.visitsitges.com' },
}

/** Feriados (mes-día) que caen dentro del viaje. */
export const HOLIDAYS: { md: string; country: CountryCode; text: string }[] = [
  { md: '12-08', country: 'ES', text: 'Feriado nacional en España (Inmaculada Concepción): muchas tiendas y algunos museos cierran o abren con horario reducido.' },
]

// ---------- Ciudades fuera del catálogo ----------
// Si en la planilla aparece una ciudad nueva, se busca una vez en Open-Meteo (país, coordenadas
// y zona horaria) y queda guardada en el teléfono.

const GEO_KEY = 'eurotrip_geo_v1'
let geoMemo: Record<string, City> | null = null
const geoCities = () => (geoMemo ??= readJson<Record<string, City>>(GEO_KEY, {}))

export function getCity(key?: string | null): City | undefined {
  return key ? (CITIES[key] ?? geoCities()[key]) : undefined
}

const allCities = () => [...Object.values(CITIES), ...Object.values(geoCities())]

export async function geocodeCity(raw: string): Promise<City | null> {
  const query = raw.replace(/\([^)]*\)/g, '').trim()
  if (!query || query.split(/\s+/).length > 4) return null
  const params = new URLSearchParams({ name: query, count: '1', language: 'es', format: 'json' })
  const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?${params}`)
  if (!res.ok) return null
  const r = (await res.json()).results?.[0]
  // Solo se acepta si el nombre coincide: evita que un texto cualquiera se convierta en ciudad.
  if (!r?.country_code || !norm(r.name).startsWith(norm(query).slice(0, 4))) return null
  const key = `geo-${norm(r.name).replace(/[^a-z0-9]+/g, '-')}`
  const city: City = {
    key, name: r.name, country: r.country_code, aliases: [...new Set([norm(query), norm(r.name)])],
    lat: r.latitude, lon: r.longitude, tz: r.timezone ?? 'Europe/Paris', wiki: r.name, voyage: r.name,
  }
  geoCities()[key] = city
  writeJson(GEO_KEY, geoCities())
  return city
}

const EURO = new Set('AT BE BG HR CY EE FI FR DE GR IE IT LV LT LU MT NL PT SK SI ES AD MC SM VA ME XK'.split(' '))
const LOCAL_CURRENCY: Record<string, string> = {
  PL: 'PLN', HU: 'HUF', CZ: 'CZK', DK: 'DKK', SE: 'SEK', NO: 'NOK', CH: 'CHF', GB: 'GBP', RO: 'RON', IS: 'ISK', RS: 'RSD', TR: 'TRY', BA: 'BAM', AL: 'ALL', MK: 'MKD', MD: 'MDL', UA: 'UAH', CL: 'CLP',
}
const genericCountries: Record<string, Country> = {}

/** Datos del país: los del catálogo o, si no está, lo básico (nombre, bandera, moneda y 112). */
export function getCountry(code?: string | null): Country | undefined {
  if (!code) return undefined
  if (COUNTRIES[code]) return COUNTRIES[code]
  const cc = code.toUpperCase()
  genericCountries[cc] ??= {
    code: cc,
    name: (() => {
      try {
        return new Intl.DisplayNames(['es'], { type: 'region' }).of(cc) ?? cc
      } catch {
        return cc
      }
    })(),
    flag: String.fromCodePoint(...[...cc].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65)),
    currency: EURO.has(cc) ? 'EUR' : (LOCAL_CURRENCY[cc] ?? ''),
    language: '',
    phrases: [],
    emergency: [{ label: 'Emergencias', number: '112' }],
    plugs: '',
    tips: [],
    consulate: { label: 'Red consular de Chile', url: 'https://www.chile.gob.cl' },
  }
  return genericCountries[cc]
}

/** Primera ciudad conocida mencionada en el texto (por posición). */
export function findCity(text: string, exclude: (string | null)[] = []): string | null {
  const n = norm(text)
  let best: { key: string; at: number } | null = null
  for (const c of allCities()) {
    if (exclude.includes(c.key)) continue
    for (const a of c.aliases) {
      const at = findWord(n, a)
      if (at !== -1 && (!best || at < best.at)) best = { key: c.key, at }
    }
  }
  return best?.key ?? null
}

export function cityRef(raw: string): CityRef {
  const key = findCity(raw)
  return { key, name: key ? getCity(key)!.name : raw.trim() }
}

export function countryOf(ref?: CityRef | null): Country | undefined {
  return getCountry(getCity(ref?.key)?.country)
}

export function flagOf(ref?: CityRef | null): string {
  return countryOf(ref)?.flag ?? '📍'
}

export const wikiUrl = (title: string) => `https://es.m.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, '_'))}`
export const voyageUrl = (title: string) => `https://es.m.wikivoyage.org/wiki/${encodeURIComponent(title.replace(/ /g, '_'))}`
export const mapsUrl = (query: string) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
