'use client'

import { Users, TrendingDown, ArrowUpRight } from 'lucide-react'
import {
  clusters as allClusters,
  kpiById,
  severityColor,
  severityLabel,
  type Cluster,
} from '@/lib/data'

export function ListView({
  activeKpi,
  onSelect,
}: {
  activeKpi: string | null
  onSelect: (c: Cluster) => void
}) {
  const ranked = [...allClusters]
    .filter((c) => activeKpi === null || c.kpiId === activeKpi)
    .sort((a, b) => b.severity - a.severity)

  return (
    <div className="overflow-hidden rounded-2xl border border-primary/10 bg-card/80 shadow-sm shadow-primary/5">
      <div className="flex items-center gap-4 border-b border-border px-5 py-3 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
        <span className="w-6">#</span>
        <span className="flex-1">Cluster de fricción</span>
        <span className="hidden w-28 sm:block">Impacta</span>
        <span className="hidden w-24 text-right md:block">Sesiones</span>
        <span className="w-24 text-right">Severidad</span>
      </div>

      <ul>
        {ranked.map((c, i) => {
          const kpi = kpiById(c.kpiId)
          const color = severityColor(c.severity)
          return (
            <li key={c.id}>
              <button
                onClick={() => onSelect(c)}
                className="flex w-full items-center gap-4 border-b border-border/60 px-5 py-4 text-left transition-colors last:border-0 hover:bg-muted/40"
              >
                <span className="w-6 font-mono text-sm text-muted-foreground">
                  {String(i + 1).padStart(2, '0')}
                </span>

                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <span
                    aria-hidden
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: color, boxShadow: `0 0 10px ${color}` }}
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{c.name}</p>
                    <p className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {c.sessions.toLocaleString('es-AR')}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <TrendingDown className="h-3 w-3" />
                        {c.dropOff}%
                      </span>
                    </p>
                  </div>
                </div>

                <span className="hidden w-28 sm:block">
                  <span className="rounded-full border border-signal/25 bg-signal/5 px-2.5 py-1 font-mono text-[11px] text-signal">
                    {kpi.label}
                  </span>
                </span>

                <span className="hidden w-24 text-right font-mono text-sm md:block">
                  {c.sessions.toLocaleString('es-AR')}
                </span>

                <span className="flex w-24 items-center justify-end gap-2">
                  <span className="hidden h-1.5 w-12 overflow-hidden rounded-full bg-muted lg:block">
                    <span
                      className="block h-full rounded-full"
                      style={{
                        width: `${Math.round(c.severity * 100)}%`,
                        backgroundColor: color,
                      }}
                    />
                  </span>
                  <span
                    className="text-xs font-medium tabular-nums"
                    style={{ color }}
                  >
                    {severityLabel(c.severity)}
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
