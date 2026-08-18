'use client'

import { useEffect } from 'react'
import {
  X,
  Users,
  TrendingDown,
  RotateCcw,
  Sparkles,
  Play,
  ArrowRight,
} from 'lucide-react'
import {
  type Cluster,
  kpiById,
  severityColor,
  severityLabel,
} from '@/lib/data'

export function ClusterDetail({
  cluster,
  onClose,
}: {
  cluster: Cluster | null
  onClose: () => void
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const open = Boolean(cluster)
  const kpi = cluster ? kpiById(cluster.kpiId) : null
  const color = cluster ? severityColor(cluster.severity) : undefined

  return (
    <>
      {/* Overlay */}
      <div
        aria-hidden={!open}
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-background/70 backdrop-blur-sm transition-opacity duration-300 ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      {/* Panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={cluster ? `Detalle de ${cluster.name}` : 'Detalle'}
        className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col overflow-y-auto border-l border-border bg-card shadow-2xl transition-transform duration-400 ease-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {cluster && kpi && (
          <div className="flex min-h-full flex-col">
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-border bg-card/95 px-6 py-5 backdrop-blur">
              <div className="flex items-start gap-3">
                <span
                  aria-hidden
                  className="mt-1 h-3.5 w-3.5 shrink-0 rounded-full"
                  style={{
                    backgroundColor: color,
                    boxShadow: `0 0 16px ${color}`,
                  }}
                />
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                    Cluster de fricción
                  </p>
                  <h2 className="mt-1 text-lg font-semibold leading-tight text-balance">
                    {cluster.name}
                  </h2>
                </div>
              </div>
              <button
                onClick={onClose}
                aria-label="Cerrar detalle"
                className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex flex-col gap-6 px-6 py-6">
              {/* KPI impacted */}
              <div className="rounded-xl border border-signal/25 bg-signal/5 p-4">
                <p className="font-mono text-[11px] uppercase tracking-widest text-signal">
                  Impacta el evento clave
                </p>
                <div className="mt-2 flex items-center justify-between gap-3">
                  <span className="text-base font-semibold">{kpi.label}</span>
                  <code className="rounded-md bg-signal/10 px-2 py-1 font-mono text-xs text-signal">
                    {kpi.event}
                  </code>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {kpi.blurb}
                </p>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-3">
                <Metric
                  icon={<Users className="h-4 w-4" />}
                  value={cluster.sessions.toLocaleString('es-AR')}
                  label="Sesiones/mes"
                />
                <Metric
                  icon={<TrendingDown className="h-4 w-4" />}
                  value={`${cluster.dropOff}%`}
                  label="Abandono"
                />
                <Metric
                  icon={<RotateCcw className="h-4 w-4" />}
                  value={`${cluster.loops.toFixed(1)}x`}
                  label="Reintentos"
                />
              </div>

              {/* Severity */}
              <div>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Severidad del patrón
                  </span>
                  <span className="font-medium" style={{ color }}>
                    {severityLabel(cluster.severity)}
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.round(cluster.severity * 100)}%`,
                      backgroundColor: color,
                      boxShadow: `0 0 12px ${color}`,
                    }}
                  />
                </div>
              </div>

              {/* Agent insight */}
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-signal" />
                  <h3 className="text-sm font-semibold">
                    Diagnóstico del agente
                  </h3>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {cluster.insight}
                </p>
              </div>

              {/* Representative path */}
              <div>
                <h3 className="mb-3 text-sm font-semibold">
                  Camino representativo reproducido
                </h3>
                <ol className="flex flex-col gap-2">
                  {cluster.path.map((step, i) => (
                    <li
                      key={i}
                      className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 ${
                        step.drop
                          ? 'border-friction/40 bg-friction/5'
                          : 'border-border bg-muted/40'
                      }`}
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-background font-mono text-xs text-muted-foreground">
                        {i + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {step.screen}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {step.action}
                        </p>
                      </div>
                      {step.drop && (
                        <span className="shrink-0 rounded-full bg-friction/15 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-friction">
                          fricción
                        </span>
                      )}
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            {/* Footer CTA */}
            <div className="sticky bottom-0 mt-auto border-t border-border bg-card/95 px-6 py-4 backdrop-blur">
              <button className="group flex w-full items-center justify-center gap-2 rounded-xl bg-signal px-4 py-3 text-sm font-semibold text-signal-foreground transition-transform hover:scale-[1.01] active:scale-[0.99]">
                <Play className="h-4 w-4 fill-current" />
                Ver replay del agente
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          </div>
        )}
      </aside>
    </>
  )
}

function Metric({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode
  value: string
  label: string
}) {
  return (
    <div className="rounded-xl border border-border bg-muted/40 p-3">
      <span className="text-muted-foreground">{icon}</span>
      <p className="mt-2 font-mono text-lg font-semibold leading-none">
        {value}
      </p>
      <p className="mt-1.5 text-[11px] leading-tight text-muted-foreground">
        {label}
      </p>
    </div>
  )
}
