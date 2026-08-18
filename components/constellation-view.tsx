'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Radar, Eraser } from 'lucide-react'
import {
  kpis,
  clustersByKpi,
  kpiById,
  severityColor,
  severityRgb,
  severityLabel,
  type Cluster,
  type Kpi,
} from '@/lib/data'

/**
 * Terreno: un mapa de sensado que arranca vacío. El usuario arrastra un evento
 * clave (KPI) desde la paleta superior y lo suelta en el mapa. Al soltarlo se
 * planta un nodo-sensor y un barrido de radar revela sus clusters de fricción:
 * los más graves aparecen más cerca del sensor, los más leves más lejos.
 */

const DOT_SPACING = 26
const SENSE_RADIUS = 120 // radio de iluminación bajo el cursor
const SWEEP_SPEED = 560 // px/s con que el barrido revela los clusters
const AMBIENT_PERIOD = 5.5 // cada cuánto (s) barre el radar ambiente
const AMBIENT_DUR = 2.4 // duración (s) del barrido ambiente

const SIGNAL_RGB: [number, number, number] = [190, 240, 110] // lima de señal

type PlacedCluster = Cluster & { dx: number; dy: number }
type Placement = {
  kpi: Kpi
  nx: number
  ny: number
  placedAt: number
  clusters: PlacedCluster[]
}

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v))
}

/** Posición en px (con margen) de un cluster dado el origen del sensor. */
function clusterPos(
  originX: number,
  originY: number,
  dx: number,
  dy: number,
  w: number,
  h: number,
) {
  return {
    x: clamp(originX + dx, 16, w - 16),
    y: clamp(originY + dy, 44, h - 40),
  }
}

export function ConstellationView({
  onSelect,
}: {
  onSelect: (c: Cluster) => void
}) {
  const wrapRef = useRef<HTMLDivElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [size, setSize] = useState({ w: 0, h: 0 })

  const [placements, setPlacements] = useState<Placement[]>([])
  const [revealed, setRevealed] = useState<Set<string>>(new Set())
  const [hovered, setHovered] = useState<string | null>(null)
  const [dragging, setDragging] = useState<{
    kpiId: string
    x: number
    y: number
    overMap: boolean
  } | null>(null)

  const mouse = useRef({ x: -9999, y: -9999, inside: false })
  const placementsRef = useRef<Placement[]>(placements)
  const sizeRef = useRef(size)
  const hoveredRef = useRef(hovered)
  const timeouts = useRef<ReturnType<typeof setTimeout>[]>([])
  placementsRef.current = placements
  sizeRef.current = size
  hoveredRef.current = hovered

  const placedIds = useMemo(
    () => new Set(placements.map((p) => p.kpi.id)),
    [placements],
  )

  // Dimensiona el canvas al contenedor.
  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const ro = new ResizeObserver((entries) => {
      const r = entries[0].contentRect
      setSize({ w: Math.round(r.width), h: Math.round(r.height) })
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Limpia timeouts pendientes al desmontar.
  useEffect(() => () => timeouts.current.forEach(clearTimeout), [])

  // Coloca un KPI en el mapa y programa la aparición de sus clusters.
  function placeKpi(kpiId: string, clientX: number, clientY: number) {
    const rect = wrapRef.current?.getBoundingClientRect()
    if (!rect) return
    const kpi = kpiById(kpiId)
    const px = clientX - rect.left
    const py = clientY - rect.top
    const nx = clamp(px / rect.width, 0.1, 0.9)
    const ny = clamp(py / rect.height, 0.14, 0.86)
    const originX = nx * rect.width
    const originY = ny * rect.height

    // Fan de clusters apuntando hacia el interior del mapa.
    const toCenter = Math.atan2(
      rect.height / 2 - originY,
      rect.width / 2 - originX,
    )
    const list = clustersByKpi(kpiId)
    const spread = [-0.72, 0.05, 0.82, 1.5]
    const placedClusters: PlacedCluster[] = list.map((c, i) => {
      // Más grave => más cerca del sensor (mayor "gravedad").
      const dist = 82 + (1 - c.severity) * 118
      const angle = toCenter + (spread[i] ?? i * 0.9)
      return { ...c, dx: Math.cos(angle) * dist, dy: Math.sin(angle) * dist }
    })

    const placement: Placement = {
      kpi,
      nx,
      ny,
      placedAt: performance.now(),
      clusters: placedClusters,
    }

    setPlacements((prev) => [
      ...prev.filter((p) => p.kpi.id !== kpiId),
      placement,
    ])

    // Reinicia el revelado de este KPI y reprograma según el barrido.
    setRevealed((prev) => {
      const n = new Set(prev)
      list.forEach((c) => n.delete(c.id))
      return n
    })
    placedClusters.forEach((pc) => {
      const dist = Math.hypot(pc.dx, pc.dy)
      const delay = 260 + (dist / SWEEP_SPEED) * 1000
      const to = setTimeout(() => {
        setRevealed((prev) => {
          const n = new Set(prev)
          n.add(pc.id)
          return n
        })
      }, delay)
      timeouts.current.push(to)
    })
  }

  function resetMap() {
    timeouts.current.forEach(clearTimeout)
    timeouts.current = []
    setPlacements([])
    setRevealed(new Set())
  }

  // Arrastre por puntero (funciona con mouse y touch).
  useEffect(() => {
    if (!dragging) return
    function inMap(e: PointerEvent) {
      const rect = wrapRef.current?.getBoundingClientRect()
      if (!rect) return false
      return (
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom
      )
    }
    function move(e: PointerEvent) {
      setDragging((d) =>
        d ? { ...d, x: e.clientX, y: e.clientY, overMap: inMap(e) } : d,
      )
    }
    function up(e: PointerEvent) {
      setDragging((d) => {
        if (d && inMap(e)) placeKpi(d.kpiId, e.clientX, e.clientY)
        return null
      })
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dragging?.kpiId])

  // Loop de dibujo del campo de puntos.
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || size.w === 0 || size.h === 0) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = size.w * dpr
    canvas.height = size.h * dpr
    ctx.scale(dpr, dpr)

    const reduce = window.matchMedia?.(
      '(prefers-reduced-motion: reduce)',
    ).matches

    const cols = Math.ceil(size.w / DOT_SPACING) + 1
    const rows = Math.ceil(size.h / DOT_SPACING) + 1
    const dots: { x: number; y: number }[] = []
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        dots.push({ x: c * DOT_SPACING, y: r * DOT_SPACING })
      }
    }

    let raf = 0
    const epoch = performance.now()
    const maxR = Math.hypot(size.w, size.h)

    function frame(now: number) {
      const t = (now - epoch) / 1000
      const w = sizeRef.current.w
      const h = sizeRef.current.h
      ctx.clearRect(0, 0, w, h)

      const places = placementsRef.current
      const m = mouse.current
      const hv = hoveredRef.current

      // Barrido ambiente periódico desde el centro.
      const ambPhase = t % AMBIENT_PERIOD
      const ambProg = ambPhase < AMBIENT_DUR ? ambPhase / AMBIENT_DUR : -1
      const ambR = ambProg * maxR
      const ambCx = w / 2
      const ambCy = h / 2

      // Precalcula posiciones/estado de barrido de cada placement.
      const active = places.map((p) => {
        const ox = p.nx * w
        const oy = p.ny * h
        const elapsed = (now - p.placedAt) / 1000
        const sweepR = elapsed * SWEEP_SPEED
        return { p, ox, oy, sweepR, elapsed }
      })

      for (const d of dots) {
        let alpha = 0.14
        let rr = 150
        let gg = 160
        let bb = 182
        let radius = 1
        let friction = 0

        // Auras de fricción (reveladas por el barrido del sensor).
        for (const a of active) {
          for (const c of a.p.clusters) {
            const cx = clamp(a.ox + c.dx, 16, w - 16)
            const cy = clamp(a.oy + c.dy, 44, h - 40)
            const originDist = Math.hypot(cx - a.ox, cy - a.oy)
            const reveal = clamp((a.sweepR - originDist) / 46, 0, 1)
            if (reveal <= 0) continue
            const dist = Math.hypot(d.x - cx, d.y - cy)
            const auraR = 60 + c.severity * 78
            if (dist < auraR) {
              const infl =
                (1 - dist / auraR) * (0.5 + c.severity * 0.5) * reveal
              if (infl > friction) {
                friction = infl
                const [sr, sg, sb] = severityRgb(c.severity)
                rr = sr
                gg = sg
                bb = sb
              }
            }
          }
        }
        if (friction > 0) {
          const beat = reduce ? 1 : 0.85 + 0.15 * Math.sin(t * 2 + d.x * 0.02)
          alpha = Math.min(0.92, 0.14 + friction * 0.85 * beat)
          radius = 1 + friction * 2.6
        }

        // Cresta del barrido del sensor (lima) mientras se expande.
        if (!reduce) {
          for (const a of active) {
            if (a.elapsed > maxR / SWEEP_SPEED + 0.6) continue
            const dp = Math.hypot(d.x - a.ox, d.y - a.oy)
            const band = Math.abs(dp - a.sweepR)
            if (band < 46) {
              const s = (1 - band / 46) * 0.6
              alpha = Math.min(1, alpha + s)
              if (friction === 0) {
                rr = SIGNAL_RGB[0]
                gg = SIGNAL_RGB[1]
                bb = SIGNAL_RGB[2]
                radius = Math.max(radius, 1.6)
              }
            }
          }
        }

        // Barrido ambiente.
        if (!reduce && ambProg >= 0) {
          const dp = Math.hypot(d.x - ambCx, d.y - ambCy)
          const band = Math.abs(dp - ambR)
          if (band < 36) {
            const s = (1 - band / 36) * (1 - ambProg) * 0.34
            alpha = Math.min(1, alpha + s)
            if (friction === 0) {
              rr = SIGNAL_RGB[0]
              gg = SIGNAL_RGB[1]
              bb = SIGNAL_RGB[2]
            }
          }
        }

        // Sensado bajo el cursor.
        if (m.inside) {
          const dm = Math.hypot(d.x - m.x, d.y - m.y)
          if (dm < SENSE_RADIUS) {
            const s = 1 - dm / SENSE_RADIUS
            alpha = Math.min(1, alpha + s * 0.5)
            radius = Math.max(radius, 1 + s * 2)
            if (friction === 0) {
              rr = SIGNAL_RGB[0]
              gg = SIGNAL_RGB[1]
              bb = SIGNAL_RGB[2]
            }
          }
        }

        ctx.beginPath()
        ctx.fillStyle = `rgba(${rr}, ${gg}, ${bb}, ${alpha})`
        ctx.arc(d.x, d.y, radius, 0, Math.PI * 2)
        ctx.fill()
      }

      // Núcleo brillante de cada cluster revelado.
      for (const a of active) {
        for (const c of a.p.clusters) {
          const pos = clusterPos(a.ox, a.oy, c.dx, c.dy, w, h)
          const originDist = Math.hypot(pos.x - a.ox, pos.y - a.oy)
          const reveal = clamp((a.sweepR - originDist) / 46, 0, 1)
          if (reveal <= 0) continue
          const isHover = hv === c.id
          const [sr, sg, sb] = severityRgb(c.severity)
          const glowR = ((isHover ? 30 : 20) + c.severity * 16) * reveal
          const g = ctx.createRadialGradient(
            pos.x,
            pos.y,
            0,
            pos.x,
            pos.y,
            Math.max(glowR, 0.1),
          )
          g.addColorStop(
            0,
            `rgba(${sr}, ${sg}, ${sb}, ${(isHover ? 0.95 : 0.7) * reveal})`,
          )
          g.addColorStop(1, `rgba(${sr}, ${sg}, ${sb}, 0)`)
          ctx.fillStyle = g
          ctx.beginPath()
          ctx.arc(pos.x, pos.y, Math.max(glowR, 0.1), 0, Math.PI * 2)
          ctx.fill()

          ctx.beginPath()
          ctx.fillStyle = `rgba(${sr}, ${sg}, ${sb}, ${reveal})`
          ctx.arc(pos.x, pos.y, (isHover ? 4.5 : 3) * reveal, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      raf = requestAnimationFrame(frame)
    }

    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [size])

  function handleMove(e: React.PointerEvent) {
    const rect = wrapRef.current?.getBoundingClientRect()
    if (!rect) return
    mouse.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      inside: true,
    }
  }

  const draggingKpi = dragging ? kpiById(dragging.kpiId) : null

  return (
    <div className="flex flex-col gap-4">
      {/* Paleta de eventos detectados: arrastrables al mapa */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card/40 px-3 py-3">
        <span className="mr-1 inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
          <Radar className="h-3.5 w-3.5 text-signal" />
          Eventos detectados
        </span>
        {kpis.map((k) => {
          const placed = placedIds.has(k.id)
          return (
            <button
              key={k.id}
              onPointerDown={(e) => {
                e.preventDefault()
                setDragging({
                  kpiId: k.id,
                  x: e.clientX,
                  y: e.clientY,
                  overMap: false,
                })
              }}
              style={{ touchAction: 'none' }}
              aria-label={`Arrastrar ${k.label} al mapa`}
              className={`group inline-flex cursor-grab items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors active:cursor-grabbing ${
                placed
                  ? 'border-signal/40 bg-signal/10 text-signal'
                  : 'border-border bg-secondary/60 text-foreground hover:border-signal/30 hover:bg-secondary'
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  placed ? 'bg-signal' : 'bg-muted-foreground/60'
                }`}
              />
              {k.label}
              <span className="font-mono text-[10px] text-muted-foreground group-hover:text-signal/70">
                {placed ? 'en mapa' : 'arrastrar'}
              </span>
            </button>
          )
        })}
        {placements.length > 0 && (
          <button
            onClick={resetMap}
            className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-border bg-transparent px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Eraser className="h-3.5 w-3.5" />
            Limpiar mapa
          </button>
        )}
      </div>

      {/* Mapa */}
      <div
        ref={wrapRef}
        onPointerMove={handleMove}
        onPointerLeave={() => (mouse.current.inside = false)}
        className={`relative h-[62vh] min-h-[460px] w-full overflow-hidden rounded-2xl border bg-[radial-gradient(circle_at_50%_40%,oklch(0.2_0.02_265),oklch(0.15_0.015_265))] transition-colors ${
          dragging?.overMap ? 'border-signal/50' : 'border-border'
        }`}
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full"
          style={{ width: size.w, height: size.h }}
          aria-hidden
        />

        {/* Estado vacío */}
        {placements.length === 0 && !dragging && (
          <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 text-center">
            <div className="relative flex h-14 w-14 items-center justify-center">
              <span
                className="atlas-emit-ring absolute left-1/2 top-1/2 h-14 w-14 rounded-full border border-signal/40"
                aria-hidden
              />
              <Radar className="h-7 w-7 text-signal" />
            </div>
            <p className="max-w-xs text-pretty text-sm text-muted-foreground">
              Arrastrá un evento al mapa para sensar su terreno y descubrir sus
              focos de fricción.
            </p>
          </div>
        )}

        {/* Indicador de zona de drop */}
        {dragging?.overMap && (
          <div className="pointer-events-none absolute bottom-4 left-1/2 z-20 -translate-x-1/2 rounded-full border border-signal/40 bg-signal/10 px-3 py-1 font-mono text-[11px] text-signal backdrop-blur">
            Soltá para sensar “{draggingKpi?.label}”
          </div>
        )}

        {/* Nodos-sensor de cada KPI colocado */}
        {placements.map((p) => {
          const left = p.nx * size.w
          const top = p.ny * size.h
          return (
            <div
              key={p.kpi.id}
              className="pointer-events-none absolute z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
              style={{ left, top }}
            >
              <div className="relative flex h-11 w-11 items-center justify-center">
                <span
                  className="atlas-emit-ring absolute left-1/2 top-1/2 h-11 w-11 rounded-full border border-signal/50"
                  aria-hidden
                />
                <span
                  className="atlas-emit-ring absolute left-1/2 top-1/2 h-11 w-11 rounded-full border border-signal/40"
                  style={{ animationDelay: '1.4s' }}
                  aria-hidden
                />
                <span className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full bg-signal/15" />
                <span className="atlas-core relative h-3.5 w-3.5 rounded-full bg-signal" />
              </div>
              <div className="mt-1.5 flex flex-col items-center rounded-lg border border-signal/25 bg-background/80 px-2.5 py-1 backdrop-blur">
                <span className="whitespace-nowrap font-mono text-[10px] font-medium uppercase tracking-widest text-signal">
                  {p.kpi.label}
                </span>
                <span className="whitespace-nowrap font-mono text-[9px] text-muted-foreground">
                  {p.kpi.event}
                </span>
              </div>
            </div>
          )
        })}

        {/* Botones interactivos de clusters revelados */}
        {placements.flatMap((p) => {
          const ox = p.nx * size.w
          const oy = p.ny * size.h
          return p.clusters
            .filter((c) => revealed.has(c.id))
            .map((c) => {
              const pos = clusterPos(ox, oy, c.dx, c.dy, size.w, size.h)
              const isHover = hovered === c.id
              const hit = 30 + c.severity * 22
              return (
                <button
                  key={c.id}
                  onClick={() => onSelect(c)}
                  onPointerEnter={() => setHovered(c.id)}
                  onPointerLeave={() => setHovered(null)}
                  onFocus={() => setHovered(c.id)}
                  onBlur={() => setHovered(null)}
                  aria-label={`${c.name} — severidad ${severityLabel(c.severity)}, ${c.sessions.toLocaleString('es-AR')} sesiones afectadas`}
                  className="absolute z-20 -translate-x-1/2 -translate-y-1/2 rounded-full outline-none animate-atlas-fade-up focus-visible:ring-2 focus-visible:ring-signal focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  style={{ left: pos.x, top: pos.y, width: hit, height: hit }}
                >
                  <span className="sr-only">{c.name}</span>
                  <span
                    className={`pointer-events-none absolute left-1/2 top-full z-30 mt-2 -translate-x-1/2 whitespace-nowrap rounded-lg border border-border bg-popover px-2.5 py-1.5 text-xs font-medium text-popover-foreground shadow-xl transition-all duration-200 ${
                      isHover
                        ? 'translate-y-0 opacity-100'
                        : 'translate-y-1 opacity-0'
                    }`}
                  >
                    {c.name}
                    <span
                      className="ml-2 font-mono"
                      style={{ color: severityColor(c.severity) }}
                    >
                      {severityLabel(c.severity)}
                    </span>
                  </span>
                </button>
              )
            })
        })}

        {/* Ayuda contextual */}
        {placements.length > 0 && (
          <p className="pointer-events-none absolute bottom-4 left-1/2 z-10 -translate-x-1/2 text-center font-mono text-[11px] text-muted-foreground/70">
            Cuanto más cerca del sensor, más grave el foco · movés el cursor para sensar
          </p>
        )}
      </div>

      {/* Fantasma que sigue al cursor mientras se arrastra */}
      {dragging && draggingKpi && (
        <div
          className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-1/2 rounded-full border border-signal/50 bg-signal/15 px-3 py-1.5 text-xs font-medium text-signal shadow-[0_0_20px_rgba(190,240,110,0.25)] backdrop-blur"
          style={{ left: dragging.x, top: dragging.y }}
        >
          {draggingKpi.label}
        </div>
      )}
    </div>
  )
}
