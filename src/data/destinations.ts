import type { CityRef, Currency } from '../types/travel'
import { findWord, norm } from '../lib/text'

export type CountryCode = 'CL' | 'NL' | 'BE' | 'DE' | 'HU' | 'AT' | 'SK' | 'FR' | 'ES'

export interface Country {
  code: CountryCode
  name: string
  flag: string
  currency: Currency
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

export const COUNTRIES: Record<CountryCode, Country> = {
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

/** Primera ciudad del catálogo mencionada en el texto (por posición). */
export function findCity(text: string, exclude: (string | null)[] = []): string | null {
  const n = norm(text)
  let best: { key: string; at: number } | null = null
  for (const c of Object.values(CITIES)) {
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
  return { key, name: key ? CITIES[key].name : raw.trim() }
}

export function countryOf(ref?: CityRef | null): Country | undefined {
  return ref?.key ? COUNTRIES[CITIES[ref.key].country] : undefined
}

export function flagOf(ref?: CityRef | null): string {
  return countryOf(ref)?.flag ?? '📍'
}

export const wikiUrl = (title: string) => `https://es.m.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, '_'))}`
export const voyageUrl = (title: string) => `https://es.m.wikivoyage.org/wiki/${encodeURIComponent(title.replace(/ /g, '_'))}`
export const mapsUrl = (query: string) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
