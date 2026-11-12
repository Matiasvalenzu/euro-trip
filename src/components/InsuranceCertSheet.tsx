import { ExternalLink, Phone } from 'lucide-react'
import type { Trip } from '../types/travel'
import { TRAVEL_INSURANCE, insuranceInfo } from '../data/resources'
import { CopyButton, Sheet } from './ui'

const tel = (n: string) => `tel:${n.replace(/[^0-9+]/g, '')}`

function driveUrls(url?: string): { previewUrl?: string; viewUrl?: string } {
  if (!url) return {}
  const id =
    url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/)?.[1] ??
    url.match(/drive\.google\.com\/open\?[^#]*\bid=([a-zA-Z0-9_-]+)/)?.[1]
  if (id) {
    return {
      previewUrl: `https://drive.google.com/file/d/${id}/preview`,
      viewUrl: `https://drive.google.com/file/d/${id}/view`,
    }
  }
  return { previewUrl: url, viewUrl: url }
}

/** Visor dentro de la app para el certificado Schengen de Visa / AXA. */
export function InsuranceCertSheet({ open, onClose, trip, online }: { open: boolean; onClose: () => void; trip: Trip | null; online: boolean }) {
  const { doc, number, validFrom, validTo } = insuranceInfo(trip)
  const { previewUrl, viewUrl } = driveUrls(doc?.url)

  return (
    <Sheet open={open} onClose={onClose} label="Certificado de seguro" full z="z-[60]">
      {open && (
        <>
          <div className="flex items-center justify-between gap-2 px-4 pb-2.5 pr-14">
            <div className="min-w-0 truncate text-[16px] font-semibold">Certificado de seguro</div>
            {viewUrl && (
              <a
                href={viewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-line bg-surface px-3 py-1.5 text-[13px] font-semibold text-accent active:scale-95"
              >
                Abrir en Drive
                <ExternalLink className="size-3.5" />
              </a>
            )}
          </div>

          <div className="space-y-2 border-y border-line bg-surface px-4 py-2.5">
            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-[13px] font-semibold tabular-nums">{number}</span>
                <CopyButton text={number} />
              </div>
              <span className="text-[12px] text-ink-2 tabular-nums">
                Vigencia {validFrom}–{validTo}
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {TRAVEL_INSURANCE.phones.map((p) => (
                <a
                  key={p.number}
                  href={tel(p.number)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-surface-2 px-2.5 py-1 text-[12px] font-semibold text-accent active:scale-95"
                >
                  <Phone className="size-3 shrink-0" />
                  <span className="tabular-nums">{p.number}</span>
                  <span className="font-normal text-ink-3">· {p.label}</span>
                </a>
              ))}
            </div>
          </div>

          {!online ? (
            <div className="grid flex-1 place-items-center px-8 text-center text-[15px] text-ink-2">
              La vista previa del PDF necesita conexión a internet. Arriba tienes el número del certificado y los teléfonos de AXA/Visa.
            </div>
          ) : previewUrl ? (
            <iframe src={previewUrl} title="Certificado de seguro Schengen Visa / AXA" className="min-h-0 w-full flex-1 border-0 bg-white" />
          ) : (
            <div className="grid flex-1 place-items-center px-8 text-center text-[15px] text-ink-2">
              No se encontró el enlace del certificado en la columna Documentos de la planilla. Actualiza la planilla para cargarlo.
            </div>
          )}
        </>
      )}
    </Sheet>
  )
}
