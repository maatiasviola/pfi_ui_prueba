'use client'

import { useState } from 'react'
import {
  kpis,
  clustersByKpi,
  severityColor,
  type Cluster,
} from '@/lib/data'

export function OrbitView({
  activeKpi,
  onSelect,
}: {
  activeKpi: string | null
  onSelect: (c: Cluster) => void
}) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {kpis.map((kpi) => (
        <OrbitSystem
          key={kpi.id}
          kpi={kpi}
          clusters={clustersByKpi(kpi.id)}
          dimmed={activeKpi !== null && activeKpi !== kpi.id}
          onSelect={onSelect}
        />
      ))}
    </div>
  )
}

function OrbitSystem({
  kpi,
  clusters,
  dimmed,
  onSelect,
}: {
  kpi: (typeof kpis)[number]
  clusters: Cluster[]
  dimmed: boolean
  onSelect: (c: Cluster) => void
}) {
  const [hovered, setHovered] = useState<string | null>(null)
  const totalSessions = clusters.reduce((s, c) => s + c.sessions, 0)

  // Radios de los anillos (px desde el centro).
  const rings = [58, 92, 126]

  return (
    <div
      className="group/system relative flex aspect-square items-center justify-center overflow-hidden rounded-2xl border border-border bg-card/40 transition-opacity duration-300"
      style={{ opacity: dimmed ? 0.35 : 1 }}
    >
      {/* Anillos guía */}
      {rings.map((r) => (
        <span
          key={r}
          aria-hidden
          className="absolute rounded-full border border-border/60"
          style={{ width: r * 2, height: r * 2 }}
        />
      ))}

      {/* Órbita rotante */}
      <div
        className="absolute inset-0 flex items-center justify-center [animation:atlas-spin_60s_linear_infinite] group-hover/system:[animation-play-state:paused]"
        style={{ transformOrigin: 'center' }}
      >
        {clusters.map((c, i) => {
          const angle = (i / Math.max(clusters.length, 1)) * Math.PI * 2 - Math.PI / 2
          // Más severo -> anillo interior (más cerca del KPI).
          const ringIdx = c.severity >= 0.7 ? 0 : c.severity >= 0.5 ? 1 : 2
          const radius = rings[ringIdx]
          const x = Math.cos(angle) * radius
          const y = Math.sin(angle) * radius
          const size = 20 + c.severity * 22
          const color = severityColor(c.severity)
          const isHover = hovered === c.id
          return (
            <button
              key={c.id}
              onClick={() => onSelect(c)}
              onMouseEnter={() => setHovered(c.id)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(c.id)}
              onBlur={() => setHovered(null)}
              aria-label={`${c.name} — ${c.sessions.toLocaleString('es-AR')} sesiones afectadas`}
              className="absolute rounded-full outline-none [animation:atlas-spin_60s_linear_infinite_reverse] focus-visible:ring-2 focus-visible:ring-signal group-hover/system:[animation-play-state:paused]"
              style={{
                left: `calc(50% + ${x}px)`,
                top: `calc(50% + ${y}px)`,
                width: size,
                height: size,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <span
                className="block h-full w-full rounded-full transition-transform duration-200 hover:scale-115"
                style={{
                  background: `radial-gradient(circle at 35% 30%, ${color}, oklch(0.2 0.02 265) 130%)`,
                  boxShadow: `0 0 ${isHover ? 22 : 10}px ${color}`,
                }}
              />
              <span
                className={`pointer-events-none absolute left-1/2 top-full z-30 mt-1.5 w-max max-w-[160px] -translate-x-1/2 whitespace-normal rounded-md border border-border bg-popover px-2 py-1 text-center text-[11px] font-medium leading-tight text-popover-foreground shadow-xl transition-opacity duration-150 ${
                  isHover ? 'opacity-100' : 'opacity-0'
                }`}
              >
                {c.name}
              </span>
            </button>
          )
        })}
      </div>

      {/* Núcleo del KPI */}
      <div className="relative z-10 flex flex-col items-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-signal/15 ring-1 ring-signal/40 backdrop-blur">
          <span className="h-6 w-6 rounded-full bg-signal shadow-[0_0_20px_var(--signal)]" />
        </span>
        <span className="mt-2 text-sm font-semibold">{kpi.label}</span>
        <span className="font-mono text-[11px] text-muted-foreground">
          {clusters.length} clusters · {totalSessions.toLocaleString('es-AR')}
        </span>
      </div>
    </div>
  )
}
