export const DEFAULT_SHEET_ID = '1fh_OpTMr-9Ygw51FMm5CZSXFAEWVRmpxCq79XckHf2I'

const KEY_ROWS = 'eurotrip_rows_v2'
const KEY_SHEET_ID = 'eurotrip_sheet_id'

export interface CachedRows {
  rows: string[][]
  updated: number
}

export function getSheetId(): string {
  try {
    return localStorage.getItem(KEY_SHEET_ID) || DEFAULT_SHEET_ID
  } catch {
    return DEFAULT_SHEET_ID
  }
}

/** Acepta el ID o el enlace completo de Google Sheets. */
export function setSheetId(input: string): string {
  const id = input.match(/\/d\/([a-zA-Z0-9_-]+)/)?.[1] ?? input.trim()
  try {
    localStorage.setItem(KEY_SHEET_ID, id)
  } catch {
    /* sin almacenamiento disponible */
  }
  return id
}

export const sheetUrl = (id: string) => `https://docs.google.com/spreadsheets/d/${id}/edit`

export function loadCachedRows(): CachedRows | null {
  try {
    const raw = localStorage.getItem(KEY_ROWS)
    return raw ? (JSON.parse(raw) as CachedRows) : null
  } catch {
    return null
  }
}

function saveCachedRows(data: CachedRows) {
  try {
    localStorage.setItem(KEY_ROWS, JSON.stringify(data))
    // Limpia la caché del formato anterior de la app.
    localStorage.removeItem('eurotrip_data_v1')
    localStorage.removeItem('eurotrip_force_mock')
  } catch {
    /* sin almacenamiento disponible */
  }
}

export function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let quoted = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') {
        field += '"'
        i++
      } else if (c === '"') quoted = false
      else field += c
    } else if (c === '"') quoted = true
    else if (c === ',') {
      row.push(field)
      field = ''
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else field += c
  }
  if (field || row.length) {
    row.push(field)
    rows.push(row)
  }
  return rows
}

/** Lee la primera pestaña de la planilla (debe estar compartida como "Cualquier persona con el enlace"). */
export async function fetchRows(sheetId: string): Promise<CachedRows> {
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&headers=1`
  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) throw new Error(`Google Sheets respondió con error ${res.status}.`)
  const text = await res.text()
  if (/<!doctype html|accounts\.google\.com/i.test(text.slice(0, 500))) {
    throw new Error('La planilla no es pública. En Google Sheets: Compartir → "Cualquier persona con el enlace" → Lector.')
  }
  const rows = parseCsv(text)
  if (rows.length < 2) throw new Error('La planilla está vacía.')
  const data = { rows, updated: Date.now() }
  saveCachedRows(data)
  return data
}
