'use client'

import { useState } from 'react'

type Fuente = { label: string; tag: string; desc: string; key: string }

const RUBROS = [
  'E-commerce',
  'Fintech',
  'Banca',
  'Salud',
  'Educación',
  'Seguros',
]
const TAMANOS = ['1–49', '50–249', '250–999', '1.000+']
const FUENTES: Fuente[] = [
  {
    label: 'Archivo CSV',
    tag: 'CSV',
    desc: 'Subís tus exportes de eventos. Ideal para un primer análisis.',
    key: 'CSV',
  },
  {
    label: 'Google BigQuery',
    tag: 'BQ',
    desc: 'Conexión directa a tu dataset de GA4. Se actualiza solo.',
    key: 'BigQuery',
  },
]

/** Chip de opción (rubro / tamaño). Activo = ink, inactivo = borde suave. */
function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-[18px] py-[11px] text-sm font-medium transition-all hover:border-foreground ${
        active
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border bg-transparent text-foreground'
      }`}
    >
      {children}
    </button>
  )
}

export function Onboarding({ onComplete }: { onComplete: () => void }) {
  const [q, setQ] = useState(0)
  const [rubro, setRubro] = useState<string | null>(null)
  const [tamano, setTamano] = useState<string | null>(null)
  const [fuente, setFuente] = useState<string | null>(null)

  const progress = Math.min(100, (q / 3) * 100)
  const stepLabel = q >= 3 ? 'listo' : `${q + 1} / 3`

  const resumen = [
    { k: 'Rubro', v: rubro || 'E-commerce' },
    { k: 'Equipo', v: `${tamano || '50–249'} personas` },
    { k: 'Fuente de datos', v: fuente || 'Google BigQuery' },
  ]

  return (
    <div className="grid min-h-screen grid-cols-1 bg-background lg:grid-cols-[1fr_44%]">
      {/* Columna izquierda: formulario */}
      <div className="flex flex-col bg-card px-6 py-11 sm:px-16 sm:pb-16">
        {/* Marca */}
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-[26px] w-[26px] items-center justify-center rounded-lg bg-primary">
            <span className="h-2 w-2 rounded-full bg-signal" />
          </span>
          <span className="font-display text-[19px] font-bold tracking-tight text-foreground">
            Eureka
          </span>
        </div>

        <div className="mt-16 w-full max-w-[520px] sm:mt-24">
          {/* Progreso */}
          <div className="mb-9 flex items-center gap-3.5">
            <div className="h-1 flex-1 overflow-hidden rounded-full bg-border">
              <div
                className="h-full rounded-full bg-primary transition-[width] duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="font-mono text-[11px] tracking-wide text-muted-foreground">
              {stepLabel}
            </span>
          </div>

          {/* Q1 — Rubro */}
          {q === 0 && (
            <div className="animate-roce-in">
              <h1 className="mb-3 font-display text-[34px] font-bold leading-[1.1] tracking-tight text-foreground sm:text-[38px]">
                ¿A qué se dedica tu empresa?
              </h1>
              <p className="mb-8 text-[15px] leading-relaxed text-muted-foreground">
                Usamos el rubro para interpretar los flujos críticos y escribir
                los reportes en el vocabulario de tu negocio.
              </p>
              <div className="flex flex-wrap gap-2.5">
                {RUBROS.map((r) => (
                  <Chip
                    key={r}
                    active={rubro === r}
                    onClick={() => {
                      setRubro(r)
                      setQ(1)
                    }}
                  >
                    {r}
                  </Chip>
                ))}
              </div>
            </div>
          )}

          {/* Q2 — Tamaño */}
          {q === 1 && (
            <div className="animate-roce-in">
              <h1 className="mb-3 font-display text-[34px] font-bold leading-[1.1] tracking-tight text-foreground sm:text-[38px]">
                ¿Cuántas personas trabajan con vos?
              </h1>
              <p className="mb-8 text-[15px] leading-relaxed text-muted-foreground">
                Define el volumen de datos que esperamos y cuánto detalle
                técnico incluimos en cada reporte.
              </p>
              <div className="flex flex-wrap gap-2.5">
                {TAMANOS.map((t) => (
                  <Chip
                    key={t}
                    active={tamano === t}
                    onClick={() => {
                      setTamano(t)
                      setQ(2)
                    }}
                  >
                    {t}
                  </Chip>
                ))}
              </div>
            </div>
          )}

          {/* Q3 — Fuente de datos */}
          {q === 2 && (
            <div className="animate-roce-in">
              <h1 className="mb-3 font-display text-[34px] font-bold leading-[1.1] tracking-tight text-foreground sm:text-[38px]">
                ¿De dónde traemos tus datos de navegación?
              </h1>
              <p className="mb-8 text-[15px] leading-relaxed text-muted-foreground">
                Podés cambiarlo después. Los datos se anonimizan antes de
                cualquier análisis.
              </p>
              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                {FUENTES.map((f) => (
                  <button
                    key={f.key}
                    onClick={() => {
                      setFuente(f.key)
                      setQ(3)
                    }}
                    aria-pressed={fuente === f.key}
                    className={`flex flex-col gap-2 rounded-2xl border p-5 text-left transition-all hover:border-foreground ${
                      fuente === f.key
                        ? 'border-primary bg-primary/[0.04]'
                        : 'border-border bg-transparent'
                    }`}
                  >
                    <span className="flex h-[30px] w-[30px] items-center justify-center rounded-[9px] border border-border bg-card font-mono text-[11px] font-medium text-foreground">
                      {f.tag}
                    </span>
                    <span className="font-display text-base font-semibold tracking-tight text-foreground">
                      {f.label}
                    </span>
                    <span className="text-[13px] leading-snug text-muted-foreground">
                      {f.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Estado final */}
          {q >= 3 && (
            <div className="animate-roce-in">
              <span className="mb-[22px] flex h-[38px] w-[38px] items-center justify-center rounded-xl bg-signal font-mono text-[15px] text-signal-foreground">
                ✓
              </span>
              <h1 className="mb-3 font-display text-[34px] font-bold leading-[1.1] tracking-tight text-foreground sm:text-[38px]">
                Listo. Ya estamos escuchando.
              </h1>
              <p className="mb-[30px] max-w-[430px] text-[15px] leading-relaxed text-muted-foreground">
                El primer análisis tarda unas horas. Cuando tengamos suficientes
                sesiones vas a ver tus primeros patrones de fricción.
              </p>
              <div className="mb-9 flex flex-col text-[13.5px]">
                {resumen.map((r) => (
                  <div
                    key={r.k}
                    className="flex justify-between border-b border-border py-3"
                  >
                    <span className="text-muted-foreground">{r.k}</span>
                    <span className="font-medium text-foreground">{r.v}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={onComplete}
                className="rounded-full bg-primary px-6 py-3.5 text-[14.5px] font-medium text-primary-foreground transition-transform hover:scale-[1.02] active:scale-[0.99]"
              >
                Ver mi panorama de fricción
              </button>
            </div>
          )}

          {/* Volver */}
          {q > 0 && q < 3 && (
            <button
              onClick={() => setQ((v) => Math.max(0, v - 1))}
              className="mt-11 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
            >
              ← Volver
            </button>
          )}
        </div>
      </div>

      {/* Columna derecha: arte por paso */}
      <div className="relative hidden items-center justify-center overflow-hidden bg-accent p-16 lg:flex">
        <OnboardingArt step={q} />
      </div>
    </div>
  )
}

/** Ilustraciones abstractas que acompañan cada paso (fiel al Roce original). */
function OnboardingArt({ step }: { step: number }) {
  if (step === 0) {
    const cells = Array.from({ length: 12 }, (_, i) => i === 5 || i === 6)
    return (
      <div className="grid grid-cols-4 gap-3.5">
        {cells.map((hot, i) => (
          <div
            key={i}
            className={`h-[72px] w-[72px] rounded-[14px] border border-border transition-colors duration-500 ${
              hot ? 'bg-signal' : 'bg-card'
            }`}
          />
        ))}
      </div>
    )
  }

  if (step === 1) {
    const rows = [1, 3, 4]
    return (
      <div className="flex flex-col items-center gap-4">
        {rows.map((n, r) => (
          <div
            key={r}
            className="flex gap-3 rounded-2xl border border-border bg-card p-4"
          >
            {Array.from({ length: n }, (_, i) => (
              <div
                key={i}
                className={`h-[46px] w-[46px] rounded-[11px] ${
                  n === 4 && i === 2 ? 'bg-signal' : 'bg-muted'
                }`}
              />
            ))}
          </div>
        ))}
      </div>
    )
  }

  if (step === 2) {
    return (
      <div className="flex flex-col items-center">
        <div className="flex gap-3">
          {['CSV', 'BQ'].map((t) => (
            <div
              key={t}
              className="flex h-16 w-24 items-center justify-center rounded-xl border border-border bg-card font-mono text-[11px] text-muted-foreground"
            >
              {t}
            </div>
          ))}
        </div>
        <div className="h-[46px] w-px bg-border/70" />
        <div className="flex h-[150px] w-[150px] items-center justify-center rounded-3xl bg-primary">
          <div className="h-[26px] w-[26px] rounded-full bg-signal" />
        </div>
        <div className="h-[46px] w-px bg-border/70" />
        <div className="flex gap-3">
          <div className="h-10 w-16 rounded-[10px] bg-muted" />
          <div className="h-10 w-16 rounded-[10px] bg-muted" />
          <div className="h-10 w-16 rounded-[10px] bg-signal" />
        </div>
      </div>
    )
  }

  // Estado final: constelación radial
  return (
    <div className="relative flex h-[280px] w-[280px] items-center justify-center rounded-full border border-border">
      <div className="absolute h-[180px] w-[180px] rounded-full border border-border" />
      <div className="absolute h-20 w-20 rounded-full border border-border" />
      <div className="absolute h-4 w-4 rounded-full bg-primary" />
      <div className="absolute left-[34px] top-24 h-3.5 w-3.5 rounded-full bg-signal" />
      <div className="absolute right-[62px] top-[52px] h-2.5 w-2.5 rounded-full bg-primary" />
      <div className="absolute bottom-12 right-24 h-2 w-2 rounded-full bg-foreground/30" />
    </div>
  )
}
