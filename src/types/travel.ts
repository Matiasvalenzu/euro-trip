export interface ItineraryItem {
  id: string
  fecha: string // YYYY-MM-DD or DD/MM/YYYY
  ciudad: string
  actividad: string
  horaInicio?: string
  horaFin?: string
  costoEstimado?: string
  notas?: string
  linkReserva?: string
}

export interface TransportItem {
  id: string
  fecha: string
  tipo: 'vuelo' | 'tren' | 'FlixBus' | 'metro' | 'bus' | 'ferry' | string
  origen: string
  destino: string
  numeroServicio?: string
  hora?: string
  duracion?: string
  costo?: string
  linkBillete?: string
  codigoConfirmacion?: string
}

export interface AccommodationItem {
  id: string
  ciudad: string
  nombre: string
  direccion: string
  checkIn: string
  checkOut: string
  costoNoche?: string
  linkReserva?: string
  telefono?: string
  notas?: string
}

export interface UsefulLinkItem {
  id: string
  categoria: 'transporte local' | 'emergencias' | 'traductor' | 'clima' | 'mapas' | 'bancos/cajeros' | 'embajada' | 'farmacias' | string
  nombre: string
  url: string
  notas?: string
}

export interface BudgetItem {
  id: string
  concepto: string
  montoGastado: number
  moneda: 'CLP' | 'EUR' | 'USD' | string
  fecha: string
  categoria: string
}

export interface EmergencyItem {
  id: string
  tipo: 'teléfono emergencia' | 'seguro de viaje' | 'contacto familiar' | 'número local' | 'consulado' | string
  valor: string
  notas?: string
  nombre?: string
}

export interface TravelData {
  itinerario: ItineraryItem[]
  transporte: TransportItem[]
  alojamiento: AccommodationItem[]
  enlaces: UsefulLinkItem[]
  presupuesto: BudgetItem[]
  emergencias: EmergencyItem[]
  lastUpdated: number
  isMock?: boolean
}

export type TabType = 'hoy' | 'itinerario' | 'transporte' | 'alojamiento' | 'enlaces' | 'presupuesto'
