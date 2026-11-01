import type {
  AccommodationItem,
  BudgetItem,
  EmergencyItem,
  ItineraryItem,
  TransportItem,
  TravelData,
  UsefulLinkItem
} from '../types/travel'
import { DEFAULT_MOCK_DATA } from './mockData'

const DEFAULT_SHEET_ID = '1fh_OpTMr-9Ygw51FMm5CZSXFAEWVRmpxCq79XckHf2I'
const STORAGE_KEY_DATA = 'eurotrip_data_v1'
const STORAGE_KEY_SHEET_ID = 'eurotrip_sheet_id'
const STORAGE_KEY_EXCHANGE_RATE = 'eurotrip_eur_clp_rate'
const STORAGE_KEY_FORCE_MOCK = 'eurotrip_force_mock'

export const DEFAULT_EUR_TO_CLP = 1050

export function getStoredSheetId(): string {
  return localStorage.getItem(STORAGE_KEY_SHEET_ID) || DEFAULT_SHEET_ID
}

export function setStoredSheetId(id: string): void {
  const match = id.match(/\/d\/([a-zA-Z0-9_-]+)/)
  const cleanId = match ? match[1] : id.trim()
  localStorage.setItem(STORAGE_KEY_SHEET_ID, cleanId)
}

export function getStoredExchangeRate(): number {
  const stored = localStorage.getItem(STORAGE_KEY_EXCHANGE_RATE)
  if (!stored) return DEFAULT_EUR_TO_CLP
  const num = parseFloat(stored)
  return isNaN(num) || num <= 0 ? DEFAULT_EUR_TO_CLP : num
}

export function setStoredExchangeRate(rate: number): void {
  localStorage.setItem(STORAGE_KEY_EXCHANGE_RATE, rate.toString())
}

export function isForceMock(): boolean {
  return localStorage.getItem(STORAGE_KEY_FORCE_MOCK) === 'true'
}

export function setForceMock(val: boolean): void {
  localStorage.setItem(STORAGE_KEY_FORCE_MOCK, val ? 'true' : 'false')
}

// Helper to normalize header names
function normalizeHeader(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .replace(/[^a-z0-9]/g, '')
}

// Fetch a single sheet tab via Google Visualization API
async function fetchSheetTab(sheetId: string, tabName: string): Promise<Record<string, string>[]> {
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(tabName)}`
  
  const response = await fetch(url, {
    cache: 'no-store'
  })

  if (!response.ok) {
    throw new Error(`Error de red al consultar la pestaña "${tabName}" (HTTP ${response.status})`)
  }

  const text = await response.text()

  // If response contains HTML (Google login redirect), the sheet is private
  if (text.includes('<!DOCTYPE html>') || text.includes('accounts.google.com')) {
    throw new Error(
      `La hoja de cálculo no está compartida públicamente. En Google Sheets ve a: Compartir > "Cualquier persona con el enlace puede ver".`
    )
  }

  // Parse GViz wrapper: /*O_o*/\ngoogle.visualization.Query.setResponse({...});
  const jsonStart = text.indexOf('{')
  const jsonEnd = text.lastIndexOf('}')
  if (jsonStart === -1 || jsonEnd === -1) {
    throw new Error(`Respuesta inválida desde Google Sheets para la pestaña "${tabName}".`)
  }

  const jsonStr = text.substring(jsonStart, jsonEnd + 1)
  const parsed = JSON.parse(jsonStr)

  if (parsed.status === 'error') {
    const errorMsg = parsed.errors?.[0]?.detailed_message || parsed.errors?.[0]?.message || 'Error en la consulta'
    throw new Error(`Error en pestaña "${tabName}": ${errorMsg}`)
  }

  const table = parsed.table
  if (!table || !table.cols || !table.rows) {
    return []
  }

  // Extract column labels
  const colKeys: string[] = table.cols.map((col: { id: string; label: string }, idx: number) => {
    return normalizeHeader(col.label || `col_${idx}`)
  })

  const results: Record<string, string>[] = []

  for (let r = 0; r < table.rows.length; r++) {
    const row = table.rows[r]
    if (!row.c) continue

    const rowObj: Record<string, string> = {}
    let hasAnyData = false

    for (let c = 0; c < table.cols.length; c++) {
      const cell = row.c[c]
      const key = colKeys[c]
      if (!key) continue

      let val = ''
      if (cell !== null && cell !== undefined) {
        if (cell.f !== undefined && cell.f !== null) {
          val = String(cell.f).trim()
        } else if (cell.v !== undefined && cell.v !== null) {
          if (typeof cell.v === 'string' && cell.v.startsWith('Date(')) {
            const dateMatch = cell.v.match(/Date\((\d+),(\d+),(\d+)/)
            if (dateMatch) {
              const y = dateMatch[1]
              const m = String(parseInt(dateMatch[2], 10) + 1).padStart(2, '0')
              const d = String(parseInt(dateMatch[3], 10)).padStart(2, '0')
              val = `${y}-${m}-${d}`
            } else {
              val = cell.v
            }
          } else {
            val = String(cell.v).trim()
          }
        }
      }

      rowObj[key] = val
      if (val) hasAnyData = true
    }

    if (hasAnyData) {
      results.push(rowObj)
    }
  }

  return results
}

function parseItinerario(rows: Record<string, string>[]): ItineraryItem[] {
  return rows.map((r, i) => {
    return {
      id: `it-${i + 1}`,
      fecha: findField(r, ['fecha', 'dia', 'date']),
      ciudad: findField(r, ['ciudad', 'city', 'lugar', 'destino']),
      actividad: findField(r, ['actividaddescripcion', 'actividad', 'descripcion', 'evento', 'visita']),
      horaInicio: findField(r, ['horainicio', 'hora', 'desde', 'inicio']),
      horaFin: findField(r, ['horafin', 'hasta', 'termino', 'fin']),
      costoEstimado: findField(r, ['costoestimadoclpoeur', 'costoestimado', 'costo', 'precio']),
      notas: findField(r, ['notas', 'nota', 'comentarios', 'observaciones', 'tips']),
      linkReserva: findField(r, ['linkdereservaoconfirmacion', 'linkdereserva', 'linkreserva', 'link', 'reserva', 'ticket', 'url'])
    }
  })
}

function parseTransporte(rows: Record<string, string>[]): TransportItem[] {
  return rows.map((r, i) => {
    return {
      id: `tr-${i + 1}`,
      fecha: findField(r, ['fecha', 'dia', 'date']),
      tipo: findField(r, ['tipo', 'mediotransporte', 'transporte', 'type']) || 'transporte',
      origen: findField(r, ['origen', 'desde', 'from', 'partida']),
      destino: findField(r, ['destino', 'hacia', 'to', 'llegada']),
      numeroServicio: findField(r, ['numerodeservicio', 'servicio', 'vuelo', 'tren', 'bus', 'linea']),
      hora: findField(r, ['hora', 'horasalida', 'salida', 'partida']),
      duracion: findField(r, ['duracion', 'tiempo']),
      costo: findField(r, ['costo', 'precio', 'tarifa']),
      linkBillete: findField(r, ['linkdebilleteocheckin', 'linkbillete', 'linkcheckin', 'link', 'billete', 'ticket', 'url']),
      codigoConfirmacion: findField(r, ['codigodeconfirmacion', 'codigoconfirmacion', 'confirmacion', 'localizador', 'pnr', 'codigo'])
    }
  })
}

function parseAlojamiento(rows: Record<string, string>[]): AccommodationItem[] {
  return rows.map((r, i) => {
    return {
      id: `al-${i + 1}`,
      ciudad: findField(r, ['ciudad', 'city', 'lugar']),
      nombre: findField(r, ['nombre', 'alojamiento', 'hotel', 'hostel', 'airbnb']),
      direccion: findField(r, ['direccion', 'ubicacion', 'address']),
      checkIn: findField(r, ['checkin', 'entrada', 'llegada']),
      checkOut: findField(r, ['checkout', 'salida']),
      costoNoche: findField(r, ['costonoche', 'costopornoche', 'precio', 'costo']),
      linkReserva: findField(r, ['linkdereserva', 'linkreserva', 'link', 'url']),
      telefono: findField(r, ['telefono', 'tel', 'contacto', 'whatsapp']),
      notas: findField(r, ['notas', 'nota', 'comentarios', 'clave', 'codigo'])
    }
  })
}

function parseEnlaces(rows: Record<string, string>[]): UsefulLinkItem[] {
  return rows.map((r, i) => {
    return {
      id: `en-${i + 1}`,
      categoria: findField(r, ['categoria', 'tipo', 'rubro']) || 'general',
      nombre: findField(r, ['nombre', 'titulo', 'sitio', 'app']),
      url: findField(r, ['url', 'link', 'enlace', 'pagina']),
      notas: findField(r, ['notas', 'nota', 'descripcion'])
    }
  })
}

function parsePresupuesto(rows: Record<string, string>[]): BudgetItem[] {
  return rows.map((r, i) => {
    const rawMonto = findField(r, ['montogastado', 'monto', 'gasto', 'costo', 'valor'])
    const numClean = rawMonto.replace(/[^0-9.,]/g, '').replace(',', '.')
    const parsedMonto = parseFloat(numClean) || 0

    const rawMoneda = findField(r, ['moneda', 'currency']) || (rawMonto.includes('€') ? 'EUR' : 'CLP')
    const cleanMoneda = rawMoneda.toUpperCase().includes('EUR') || rawMoneda.includes('€') ? 'EUR' : 'CLP'

    return {
      id: `pr-${i + 1}`,
      concepto: findField(r, ['concepto', 'descripcion', 'item', 'detalle']),
      montoGastado: parsedMonto,
      moneda: cleanMoneda,
      fecha: findField(r, ['fecha', 'dia', 'date']),
      categoria: findField(r, ['categoria', 'tipo', 'rubro']) || 'General'
    }
  })
}

function parseEmergencias(rows: Record<string, string>[]): EmergencyItem[] {
  return rows.map((r, i) => {
    return {
      id: `em-${i + 1}`,
      tipo: findField(r, ['tipo', 'categoria']),
      nombre: findField(r, ['nombre', 'contacto', 'entidad', 'servicio']) || findField(r, ['tipo']),
      valor: findField(r, ['valor', 'numero', 'telefono', 'contacto', 'poliza']),
      notas: findField(r, ['notas', 'nota', 'descripcion', 'detalle'])
    }
  })
}

function findField(row: Record<string, string>, possibleKeys: string[]): string {
  for (const k of possibleKeys) {
    const normalized = normalizeHeader(k)
    if (row[normalized] !== undefined && row[normalized] !== '') {
      return row[normalized]
    }
    for (const rowKey in row) {
      if (rowKey.includes(normalized) || normalized.includes(rowKey)) {
        if (row[rowKey]) return row[rowKey]
      }
    }
  }
  return ''
}

export function loadCachedData(): TravelData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DATA)
    if (!raw) return null
    return JSON.parse(raw) as TravelData
  } catch {
    return null
  }
}

export function saveCachedData(data: TravelData): void {
  try {
    localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(data))
  } catch (e) {
    console.warn('No se pudo guardar la caché en localStorage', e)
  }
}

export async function fetchAllTravelData(sheetId: string): Promise<TravelData> {
  if (isForceMock()) {
    return {
      ...DEFAULT_MOCK_DATA,
      lastUpdated: Date.now()
    }
  }

  const [itinerarioRows, transporteRows, alojamientoRows, enlacesRows, presupuestoRows, emergenciasRows] =
    await Promise.all([
      fetchWithFallbackNames(sheetId, ['Itinerario', 'itinerario', 'Itinerary']),
      fetchWithFallbackNames(sheetId, ['Transporte', 'transporte', 'Transportes', 'Transport']),
      fetchWithFallbackNames(sheetId, ['Alojamiento', 'alojamiento', 'Alojamientos', 'Hoteles', 'Accommodation']),
      fetchWithFallbackNames(sheetId, ['Enlaces útiles', 'Enlaces utiles', 'Enlaces', 'Links', 'Useful Links']),
      fetchWithFallbackNames(sheetId, ['Presupuesto', 'presupuesto', 'Gastos', 'Budget']),
      fetchWithFallbackNames(sheetId, ['Emergencias', 'emergencias', 'Emergency', 'Contactos'])
    ])

  const travelData: TravelData = {
    itinerario: parseItinerario(itinerarioRows),
    transporte: parseTransporte(transporteRows),
    alojamiento: parseAlojamiento(alojamientoRows),
    enlaces: parseEnlaces(enlacesRows),
    presupuesto: parsePresupuesto(presupuestoRows),
    emergencias: parseEmergencias(emergenciasRows),
    lastUpdated: Date.now(),
    isMock: false
  }

  saveCachedData(travelData)
  return travelData
}

async function fetchWithFallbackNames(sheetId: string, candidates: string[]): Promise<Record<string, string>[]> {
  let lastError: Error | null = null

  for (const name of candidates) {
    try {
      const rows = await fetchSheetTab(sheetId, name)
      if (rows.length > 0) return rows
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(String(e))
      if (lastError.message.includes('no está compartida públicamente')) {
        throw lastError
      }
    }
  }

  if (lastError) {
    console.warn(`No se pudo leer pestañas ${candidates.join(', ')}:`, lastError.message)
  }
  return []
}
