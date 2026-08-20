'use client'

import { useEffect } from 'react'
import { X, Users, CalendarDays, Sparkles } from 'lucide-react'
import { type Cluster, kpiById } from '@/lib/data'

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

  return (
    <>
      <button
        aria-label="Cerrar detalle"
        onClick={onClose}
        className={`fixed inset-0 z-40 cursor-default bg-transparent transition-opacity duration-200 ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      <aside
        role="dialog"
        aria-label={cluster ? `Detalle de ${cluster.name}` : 'Detalle'}
        className={`fixed bottom-4 left-4 right-4 z-50 max-h-[calc(100vh-2rem)] overflow-y-auto rounded-2xl border border-primary/20 bg-card shadow-xl shadow-primary/10 transition-all duration-200 ease-out sm:bottom-auto sm:left-auto sm:right-6 sm:top-24 sm:w-[380px] ${
          open
            ? 'translate-y-0 scale-100 opacity-100'
            : 'pointer-events-none translate-y-3 scale-[.98] opacity-0 sm:translate-x-3 sm:translate-y-0'
        }`}
      >
        {cluster && kpi && (
          <div className="flex flex-col gap-5 p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <span
                  aria-hidden
                  className="mt-1 size-3 shrink-0 rounded-full bg-primary shadow-[0_0_14px] shadow-primary/60"
                />
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
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
                className="-mr-1 -mt-1 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
              <p className="font-mono text-[10px] uppercase tracking-widest text-primary">
                Impacta el evento clave
              </p>
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-semibold">{kpi.label}</span>
                <code className="rounded-md bg-primary/10 px-2 py-1 font-mono text-[11px] text-primary">
                  {kpi.event}
                </code>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Metric
                icon={<Users className="size-4" />}
                value={Math.round(
                  cluster.sessions * (1 - cluster.dropOff / 100),
                ).toLocaleString('es-AR')}
                label="Usuarios"
              />
              <Metric
                icon={<CalendarDays className="size-4" />}
                value={cluster.sessions.toLocaleString('es-AR')}
                label="Sesiones/mes"
              />
            </div>

            <div className="border-t border-border pt-4">
              <div className="mb-2 flex items-center gap-2">
                <Sparkles className="size-4 text-primary" />
                <h3 className="text-sm font-semibold">Diagnóstico del agente</h3>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {cluster.insight}
              </p>
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
