'use client'

import { useState } from 'react'
import { Palette as PaletteIcon, Check } from 'lucide-react'
import { palettes, type PaletteId } from '@/lib/palettes'

/**
 * Control flotante para probar distintas paletas de acento en vivo.
 * Muestra un botón que despliega las opciones disponibles; al elegir una,
 * cambia la variable --signal (y derivados) del contenedor con data-palette.
 */
export function PaletteToggle({
  value,
  onChange,
}: {
  value: PaletteId
  onChange: (id: PaletteId) => void
}) {
  const [open, setOpen] = useState(false)
  const current = palettes.find((p) => p.id === value) ?? palettes[0]

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-2">
      {open && (
        <div
          role="listbox"
          aria-label="Paletas disponibles"
          className="w-64 animate-atlas-fade-up overflow-hidden rounded-2xl border border-border bg-popover/95 p-1.5 shadow-2xl backdrop-blur"
        >
          <p className="px-2.5 pb-1.5 pt-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Probar paleta de acento
          </p>
          {palettes.map((p) => {
            const active = p.id === value
            return (
              <button
                key={p.id}
                role="option"
                aria-selected={active}
                onClick={() => {
                  onChange(p.id)
                  setOpen(false)
                }}
                className={`flex w-full items-start gap-3 rounded-xl px-2.5 py-2 text-left transition-colors ${
                  active
                    ? 'bg-signal/10'
                    : 'hover:bg-muted'
                }`}
              >
                <span
                  aria-hidden
                  className="mt-0.5 h-5 w-5 shrink-0 rounded-full ring-2 ring-inset ring-white/10"
                  style={{ backgroundColor: p.swatch }}
                />
                <span className="flex flex-1 flex-col">
                  <span className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                    {p.label}
                    {active && (
                      <Check className="h-3.5 w-3.5 text-signal" aria-hidden />
                    )}
                  </span>
                  <span className="text-pretty text-xs leading-snug text-muted-foreground">
                    {p.hint}
                  </span>
                </span>
              </button>
            )
          })}
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={`Cambiar paleta de acento — actual: ${current.label}`}
        className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-4 py-2.5 text-sm font-medium text-foreground shadow-xl backdrop-blur transition-colors hover:border-signal/40 hover:bg-card"
      >
        <PaletteIcon className="h-4 w-4 text-signal" />
        <span className="hidden sm:inline">Paleta</span>
        <span
          aria-hidden
          className="h-3.5 w-3.5 rounded-full ring-2 ring-inset ring-white/10"
          style={{ backgroundColor: current.swatch }}
        />
      </button>
    </div>
  )
}
