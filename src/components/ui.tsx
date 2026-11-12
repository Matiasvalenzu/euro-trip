import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Bus, Check, Copy, ExternalLink, Plane, Ship, TrainFront, X } from 'lucide-react'
import type { Mode } from '../types/travel'

export function Card({ className = '', children }: { className?: string; children: ReactNode }) {
  return <div className={`rounded-2xl border border-line bg-surface ${className}`}>{children}</div>
}

export function Eyebrow({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`text-[12px] font-semibold uppercase tracking-[0.08em] text-ink-3 ${className}`}>{children}</div>
}

export function SectionTitle({ icon, children, action }: { icon?: ReactNode; children: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 px-1 mb-2.5">
      <h2 className="flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.08em] text-ink-2">
        {icon}
        {children}
      </h2>
      {action}
    </div>
  )
}

export function PageTitle({ title, subtitle }: { title: string; subtitle?: ReactNode }) {
  return (
    <div className="px-1 pt-2 pb-1">
      <h1 className="font-display text-[32px] font-semibold leading-tight tracking-tight">{title}</h1>
      {subtitle && <p className="text-[14px] text-ink-2 mt-1">{subtitle}</p>}
    </div>
  )
}

export type Tone = 'neutral' | 'accent' | 'plane' | 'train' | 'warn' | 'danger' | 'ok'

const TONES: Record<Tone, string> = {
  neutral: 'bg-surface-2 text-ink-2',
  accent: 'bg-accent-soft text-accent',
  plane: 'bg-plane-soft text-plane',
  train: 'bg-train-soft text-train',
  warn: 'bg-warn-soft text-warn',
  danger: 'bg-danger-soft text-danger',
  ok: 'bg-ok-soft text-ok',
}

export function Chip({ tone = 'neutral', icon, children, className = '' }: { tone?: Tone; icon?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[12px] font-semibold leading-5 ${TONES[tone]} ${className}`}>
      {icon}
      {children}
    </span>
  )
}

const modeTone = (m: Mode): Tone => (m === 'avion' ? 'plane' : 'train')

export function ModeChip({ mode, children }: { mode: Mode; children: ReactNode }) {
  return (
    <Chip tone={modeTone(mode)} icon={<ModeIcon mode={mode} className="size-3.5" />}>
      {children}
    </Chip>
  )
}

export function ModeIcon({ mode, className = 'size-4' }: { mode: Mode; className?: string }) {
  const Icon = mode === 'avion' ? Plane : mode === 'bus' ? Bus : mode === 'barco' ? Ship : TrainFront
  return <Icon className={className} aria-hidden />
}

export function ModeBadge({ mode, size = 'md' }: { mode: Mode; size?: 'sm' | 'md' }) {
  const box = size === 'sm' ? 'size-8 rounded-xl' : 'size-10 rounded-2xl'
  return (
    <span className={`${box} grid shrink-0 place-items-center ${TONES[modeTone(mode)]}`}>
      <ModeIcon mode={mode} className={size === 'sm' ? 'size-4' : 'size-5'} />
    </span>
  )
}

export function LinkButton({ href, children, icon, primary = false, className = '' }: { href: string; children: ReactNode; icon?: ReactNode; primary?: boolean; className?: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex min-h-11 min-w-0 items-center justify-center gap-1.5 rounded-xl px-3 text-[14px] font-semibold transition active:scale-[0.98] ${
        primary ? 'bg-accent text-accent-ink' : 'border border-line bg-surface text-ink'
      } ${className}`}
    >
      {icon}
      <span className="min-w-0 truncate">{children}</span>
      <ExternalLink className="size-3.5 shrink-0 opacity-60" aria-hidden />
    </a>
  )
}

export function Button({ onClick, children, icon, primary = false, className = '', disabled }: { onClick: () => void; children: ReactNode; icon?: ReactNode; primary?: boolean; className?: string; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-3.5 text-[14px] font-semibold transition active:scale-[0.98] disabled:opacity-50 ${
        primary ? 'bg-accent text-accent-ink' : 'border border-line bg-surface text-ink'
      } ${className}`}
    >
      {icon}
      {children}
    </button>
  )
}

export function CopyButton({ text, label = 'Copiar' }: { text: string; label?: string }) {
  const [done, setDone] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setDone(true)
      setTimeout(() => setDone(false), 1800)
    } catch {
      /* el navegador no permite copiar */
    }
  }
  return (
    <button
      type="button"
      onClick={copy}
      aria-label={`${label}: ${text}`}
      className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[12px] font-semibold text-accent active:scale-95"
    >
      {done ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
      {done ? 'Copiado' : label}
    </button>
  )
}

export function Row({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-2.5">
      <span className="mt-0.5 text-ink-3">{icon}</span>
      <div className="min-w-0 flex-1">
        <div className="text-[12px] font-semibold uppercase tracking-[0.06em] text-ink-3">{label}</div>
        <div className="mt-0.5 text-[14px] leading-snug text-ink break-words">{children}</div>
      </div>
    </div>
  )
}

export function Empty({ icon, title, children }: { icon: ReactNode; title: string; children?: ReactNode }) {
  return (
    <Card className="p-6 text-center">
      <div className="mx-auto mb-3 grid size-12 place-items-center rounded-2xl bg-surface-2 text-ink-3">{icon}</div>
      <div className="text-[16px] font-semibold">{title}</div>
      {children && <div className="mt-1 text-[14px] text-ink-2">{children}</div>}
    </Card>
  )
}

/** Panel inferior deslizable. */
export function Sheet({ open, onClose, label, children, full = false, z = 'z-50' }: { open: boolean; onClose: () => void; label: string; children: ReactNode; full?: boolean; z?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      const dialogs = document.querySelectorAll('[role="dialog"]')
      if (dialogs[dialogs.length - 1] === ref.current) onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  if (!open) return null
  return (
    <div ref={ref} className={`fixed inset-0 ${z} flex items-end justify-center`} role="dialog" aria-modal="true" aria-label={label}>
      <div className="absolute inset-0 bg-black/50 animate-fade" onClick={onClose} />
      <div className={`relative flex w-full max-w-lg flex-col rounded-t-3xl border-t border-line bg-bg shadow-2xl animate-sheet ${full ? 'h-[94dvh]' : 'max-h-[92dvh]'}`}>
        <div className="flex justify-center pt-2.5 pb-1">
          <span className="h-1 w-10 rounded-full bg-line" />
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute right-3 top-3 z-10 grid size-9 place-items-center rounded-full bg-surface-2 text-ink-2 active:scale-95"
        >
          <X className="size-5" />
        </button>
        <div className={full ? 'flex min-h-0 flex-1 flex-col' : 'overflow-y-auto overscroll-contain px-4 pb-[calc(env(safe-area-inset-bottom)+1.5rem)]'}>{children}</div>
      </div>
    </div>
  )
}
