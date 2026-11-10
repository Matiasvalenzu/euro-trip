import { readJson, writeJson } from './storage'

export interface WikiSummary {
  title: string
  extract: string
  thumb?: string
}

const KEY = 'eurotrip_wiki_v1'
let memory: Record<string, WikiSummary> | null = null

function cache(): Record<string, WikiSummary> {
  memory ??= readJson<Record<string, WikiSummary>>(KEY, {})
  return memory
}

export const cachedSummary = (title: string): WikiSummary | undefined => cache()[title]

function cleanExtract(s: string): string {
  return s
    .replace(/​/g, '')
    .replace(/\/[^/\n]*[ˈˌːəɛɪʊʏøœɒʃʒθðŋɲʎɣʁ][^/\n]*\//g, '')
    .replace(/\[[^\]]*\]/g, '')
    .replace(/[;,]?\s*pronunci(?:ado|ación)[^;),]*(?=[;),])/gi, '')
    .replace(/\(\s*[;,]?\s*\)/g, '')
    .replace(/\s+([,.;)])/g, '$1')
    .replace(/\(\s+/g, '(')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

/** Descarga resúmenes de Wikipedia en español (20 por consulta) y los guarda para usar sin conexión. */
export async function fetchSummaries(titles: string[]): Promise<void> {
  const missing = [...new Set(titles)].filter((t) => !cache()[t])
  for (let i = 0; i < missing.length; i += 20) {
    const chunk = missing.slice(i, i + 20)
    const params = new URLSearchParams({
      action: 'query', format: 'json', formatversion: '2', origin: '*', redirects: '1',
      prop: 'extracts|pageimages', exintro: '1', explaintext: '1', exsentences: '5', exlimit: '20',
      piprop: 'thumbnail', pithumbsize: '800', titles: chunk.join('|'),
    })
    const res = await fetch(`https://es.wikipedia.org/w/api.php?${params}`)
    if (!res.ok) throw new Error(`Wikipedia respondió ${res.status}`)
    const data = await res.json()
    const alias = new Map<string, string>()
    for (const r of [...(data.query?.normalized ?? []), ...(data.query?.redirects ?? [])]) alias.set(r.from, r.to)
    const pages = new Map<string, { title: string; extract?: string; thumbnail?: { source: string } }>()
    for (const p of data.query?.pages ?? []) pages.set(p.title, p)
    for (const t of chunk) {
      let final = t
      for (let k = 0; k < 3 && alias.has(final); k++) final = alias.get(final)!
      const p = pages.get(final)
      // Las imágenes .svg suelen ser banderas, escudos o mapas: no sirven como foto.
      const thumb = p?.thumbnail?.source
      if (p?.extract) cache()[t] = { title: p.title, extract: cleanExtract(p.extract), thumb: thumb && !/\.svg/i.test(thumb) ? thumb : undefined }
    }
    writeJson(KEY, cache())
  }
}

// ---------- Búsqueda (lugares fuera del catálogo) ----------

const SEARCH_KEY = 'eurotrip_wiki_search_v1'
let searchMemo: Record<string, string | null> | null = null
const searchCache = () => (searchMemo ??= readJson<Record<string, string | null>>(SEARCH_KEY, {}))

/** undefined = aún no se buscó; null = sin artículo. */
export const cachedSearch = (query: string): string | null | undefined => searchCache()[query]

const GENERIC = new Set(['museo', 'barrio', 'plaza', 'parque', 'calle', 'mercado', 'iglesia', 'palacio', 'castillo', 'catedral', 'puente', 'torre', 'jardin', 'jardines', 'mirador', 'galeria', 'avenida', 'paseo', 'casa'])
const normWord = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

/** Busca el artículo de un lugar. Solo acepta un resultado que comparta una palabra distintiva con `label`. */
export async function searchTitle(query: string, label: string): Promise<string | null> {
  const known = cachedSearch(query)
  if (known !== undefined) return known
  const params = new URLSearchParams({ action: 'query', list: 'search', srsearch: query, srlimit: '3', format: 'json', formatversion: '2', origin: '*' })
  const res = await fetch(`https://es.wikipedia.org/w/api.php?${params}`)
  if (!res.ok) throw new Error(`Wikipedia respondió ${res.status}`)
  const titles: string[] = ((await res.json()).query?.search ?? []).map((r: { title: string }) => r.title)
  const words = normWord(label)
    .split(/[^a-z0-9ñ]+/)
    .filter((w) => w.length >= 4 && !GENERIC.has(w))
  const hit = titles.find((t) => words.some((w) => normWord(t).includes(w))) ?? null
  searchCache()[query] = hit
  writeJson(SEARCH_KEY, searchCache())
  return hit
}

export async function getSummary(title: string): Promise<WikiSummary | undefined> {
  if (!cache()[title]) await fetchSummaries([title])
  return cache()[title]
}

/** Precarga fotos para que el service worker las guarde. */
export async function warmImages(titles: string[], extra: string[] = []): Promise<void> {
  const urls = [...titles.map((t) => cache()[t]?.thumb), ...extra].filter((u): u is string => !!u)
  for (const u of urls) {
    try {
      await fetch(u, { mode: 'no-cors' })
    } catch {
      /* foto no disponible */
    }
  }
}
