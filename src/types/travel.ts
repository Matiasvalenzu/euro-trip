export type Mode = 'avion' | 'tren' | 'bus' | 'barco'

export type TabType = 'hoy' | 'itinerario' | 'traslados' | 'estadias' | 'gastos' | 'guia'

/** Ciudad tal como aparece en la planilla, enlazada al catálogo si se reconoce. */
export interface CityRef {
  key: string | null
  name: string
}

export interface Place {
  id: string
  city: string
  name: string
  /** Variantes en minúsculas y sin tildes que se buscan en el texto de la planilla. */
  aliases: string[]
  blurb: string
  wiki?: string
  /** Foto propia cuando la de Wikipedia no sirve. */
  photo?: string
  url?: string
  book?: boolean
  /** Días de cierre (0 = domingo). */
  closed?: number[]
}

export interface Activity {
  kind: 'place' | 'flight' | 'train' | 'arrive' | 'rest' | 'other'
  text: string
  place?: Place
  book?: boolean
  optional?: boolean
  /** Uno u otro ("Rijksmuseum o Museo Van Gogh"). */
  choice?: boolean
  closedToday?: string
}

export interface LegLine {
  kind: 'segment' | 'layover' | 'total' | 'note'
  text: string
}

export interface Leg {
  id: string
  dayIndex: number
  date: string
  mode: Mode
  modeLabel: string
  from: CityRef
  to: CityRef
  roundTrip: boolean
  optional: boolean
  duration?: string
  minutes?: number
  depart?: string
  arrive?: string
  nextDay: boolean
  codes: string[]
  carrier?: string
  via?: string
  cost?: string
  costNote?: string
  status?: 'Cotizado' | 'Estimado' | 'Incluido'
  lines: LegLine[]
  altLabel?: string
  alternatives: string[]
}

export interface LodgingOption {
  group: string
  name: string
  detail: string
  url?: string
}

export interface Lodging {
  status: string
  confirmed: boolean
  meta?: string
  name: string
  price?: string
  paid: boolean
  code?: string
  refund?: string
  breakfast?: string
  url?: string
  options: LodgingOption[]
}

export interface Companion {
  label: string
  text: string
  together: boolean
}

export interface Day {
  index: number
  n: number
  date: string
  weekday: number
  stage: string
  kind: 'stay' | 'transfer' | 'excursion'
  /** Ciudad donde se pasa el día (agrupa el itinerario). */
  city: CityRef
  from?: CityRef
  to?: CityRef
  excursion?: CityRef
  /** Ciudad donde se duerme; null = noche en tránsito. */
  sleep: CityRef | null
  summary: string
  activities: Activity[]
  localTransport?: string
  localCost?: string
  leg?: Leg
  weather?: string
  temp?: string
  clothing?: string
  lodgingNote?: string
  companion?: Companion
  alerts: string[]
}

export interface Stay {
  id: string
  city: CityRef
  checkIn: string
  checkOut: string
  nights: number
  dayIndexes: number[]
  lodging?: Lodging
  notes: string[]
}

export interface Block {
  city: CityRef
  days: Day[]
  legIn?: Leg
  label?: string
}

export interface Trip {
  days: Day[]
  legs: Leg[]
  stays: Stay[]
  blocks: Block[]
  tips: string[]
  start: string
  end: string
}

export interface Expense {
  id: string
  date: string
  concept: string
  amount: number
  currency: Currency
  category: string
}

export type Currency = 'EUR' | 'CLP' | 'USD' | 'HUF'

/** Unidades de cada moneda por 1 EUR. */
export type Rates = Record<Currency, number> & { updated?: number }
