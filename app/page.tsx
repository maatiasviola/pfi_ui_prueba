'use client'

import { useState } from 'react'
import { Orbit, Sparkles, List, Radar } from 'lucide-react'
import { ConstellationView } from '@/components/constellation-view'
import { OrbitView } from '@/components/orbit-view'
import { ListView } from '@/components/list-view'
import { ClusterDetail } from '@/components/cluster-detail'
import { clusters, kpis, type Cluster } from '@/lib/data'

type ViewId = 'constelacion' | 'orbita' | 'foco'

const views: { id: ViewId; label: string; icon: typeof Orbit }[] = [
  { id: 'constelacion', label: 'Terreno', icon: Radar },
  { id: 'orbita', label: 'Órbita', icon: Orbit },
  { id: 'foco', label: 'Foco', icon: List },
]

const viewHint: Record<ViewId, string> = {
  constelacion:
    'Sensá el terreno de tu app. Los KPIs se ubican según el journey del usuario y cada foco de fricción emite un aura cálida. Filtrá por un evento clave para ver todos sus patrones.',
  orbita:
    'Cada evento clave en el centro, rodeado por las fricciones que lo orbitan. Cuanto más cerca, más urgente.',
  foco: 'La lista priorizada por impacto, para ir directo a lo que más duele.',
}

export default function Page() {
  const [view, setView] = useState<ViewId>('constelacion')
  const [activeKpi, setActiveKpi] = useState<string | null>(null)
  const [selected, setSelected] = useState<Cluster | null>(null)

  const totalSessions = clusters.reduce((s, c) => s + c.sessions, 0)

  return (
    <main className="relative min-h-screen w-full overflow-hidden">
      {/* Glow ambiental */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-96 w-[80%] -translate-x-1/2 rounded-full bg-signal/10 blur-[120px]"
      />

      <div className="relative mx-auto flex max-w-6xl flex-col gap-8 px-5 py-8 md:px-8 md:py-12">
        {/* Header */}
        <header className="flex flex-col gap-6 animate-atlas-fade-up">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-3 py-1">
                <Sparkles className="h-3.5 w-3.5 text-signal" />
                <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                  Atlas de Fricción
                </span>
              </div>
              <h1 className="max-w-2xl text-3xl font-semibold leading-tight text-balance md:text-4xl">
                Explorá dónde tu producto pierde a sus usuarios
              </h1>
              <p className="mt-3 max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground md:text-base">
                Detectamos los patrones de fricción de tu app de forma automática
                y los conectamos con los eventos clave que ponen en riesgo. Elegí
                una lente y empezá a descubrir.
              </p>
            </div>

            {/* Selector de vistas */}
            <div
              role="tablist"
              aria-label="Modo de exploración"
              className="flex shrink-0 items-center gap-1 rounded-xl border border-border bg-card/60 p-1 backdrop-blur"
            >
              {views.map((v) => {
                const Icon = v.icon
                const active = view === v.id
                return (
                  <button
                    key={v.id}
                    role="tab"
                    aria-selected={active}
                    onClick={() => setView(v.id)}
                    className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      active
                        ? 'bg-signal text-signal-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{v.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Resumen + filtros por KPI */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-card/40 px-4 py-3">
            <div className="flex items-center gap-5 font-mono text-xs text-muted-foreground">
              <Stat value={String(clusters.length)} label="clusters" />
              <span className="h-6 w-px bg-border" />
              <Stat
                value={totalSessions.toLocaleString('es-AR')}
                label="sesiones/mes afectadas"
              />
              <span className="hidden h-6 w-px bg-border sm:block" />
              <span className="hidden sm:block">
                <Stat value={String(kpis.length)} label="eventos clave" />
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <FilterChip
                active={activeKpi === null}
                onClick={() => setActiveKpi(null)}
              >
                Todos
              </FilterChip>
              {kpis.map((k) => (
                <FilterChip
                  key={k.id}
                  active={activeKpi === k.id}
                  onClick={() =>
                    setActiveKpi(activeKpi === k.id ? null : k.id)
                  }
                >
                  {k.label}
                </FilterChip>
              ))}
            </div>
          </div>
        </header>

        {/* Vista activa */}
        <section
          key={view}
          className="animate-atlas-fade-up"
          aria-live="polite"
        >
          <p className="mb-4 max-w-2xl text-sm text-muted-foreground">
            {viewHint[view]}
          </p>

          {view === 'constelacion' && (
            <ConstellationView activeKpi={activeKpi} onSelect={setSelected} />
          )}
          {view === 'orbita' && (
            <OrbitView activeKpi={activeKpi} onSelect={setSelected} />
          )}
          {view === 'foco' && (
            <ListView activeKpi={activeKpi} onSelect={setSelected} />
          )}
        </section>
      </div>

      <ClusterDetail cluster={selected} onClose={() => setSelected(null)} />
    </main>
  )
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <span className="inline-flex items-baseline gap-1.5">
      <span className="text-base font-semibold text-foreground">{value}</span>
      <span>{label}</span>
    </span>
  )
}

function FilterChip({
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
      className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
        active
          ? 'border-signal/40 bg-signal/10 text-signal'
          : 'border-border bg-transparent text-muted-foreground hover:border-border hover:bg-muted hover:text-foreground'
      }`}
    >
      {children}
    </button>
  )
}
