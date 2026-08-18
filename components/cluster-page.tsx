'use client'

import { useEffect, useRef, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { type Cluster } from '@/lib/data'
import {
  buildClusterDetail,
  type ClusterDetalle,
  type PasoDetalle,
} from '@/lib/cluster-detail'

type Tab = 'diagnostico' | 'recorrido' | 'segmento'

const TABS: { key: Tab; label: string }[] = [
  { key: 'diagnostico', label: 'Diagnóstico' },
  { key: 'recorrido', label: 'Recorrido del cliente' },
  { key: 'segmento', label: 'Segmento clientes' },
]

export function ClusterPage({
  cluster,
  onBack,
}: {
  cluster: Cluster
  onBack: () => void
}) {
  const d = buildClusterDetail(cluster)
  const [tab, setTab] = useState<Tab>('diagnostico')

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [tab])

  return (
    <div className="theme-roce min-h-screen bg-background font-sans text-foreground">
      <div className="mx-auto max-w-6xl px-6 pb-24 pt-6">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Panorama
        </button>

        {/* Encabezado */}
        <header className="mt-5 flex flex-wrap items-start justify-between gap-8">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2.5">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-signal font-mono text-[11px] font-medium text-signal-foreground">
                {d.n}
              </span>
              <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                {d.etapa} · Severidad {d.severidad}
              </span>
            </div>
            <h1 className="mt-3 font-display text-[32px] font-bold leading-[1.05] tracking-tight text-balance sm:text-[40px]">
              {d.nombre}
            </h1>
            <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
              {d.resumen}
            </p>
          </div>

          <div className="flex gap-8">
            {d.kpis.map((k) => (
              <div key={k.l}>
                <div className="font-display text-2xl font-semibold tracking-tight sm:text-[28px]">
                  {k.v}
                </div>
                <div className="mt-1 max-w-[92px] text-xs leading-snug text-muted-foreground">
                  {k.l}
                </div>
              </div>
            ))}
          </div>
        </header>

        {/* Tabs */}
        <div
          role="tablist"
          aria-label="Secciones del cluster"
          className="mt-8 flex gap-7 border-b border-border"
        >
          {TABS.map((t) => {
            const active = tab === t.key
            return (
              <button
                key={t.key}
                role="tab"
                aria-selected={active}
                onClick={() => setTab(t.key)}
                className={`-mb-px border-b-2 pb-3 text-sm font-medium transition-colors ${
                  active
                    ? 'border-foreground text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {t.label}
              </button>
            )
          })}
        </div>

        <div className="mt-7">
          {tab === 'diagnostico' && <Diagnostico d={d} />}
          {tab === 'recorrido' && <Recorrido pasos={d.pasos} />}
          {tab === 'segmento' && <Segmento d={d} />}
        </div>
      </div>
    </div>
  )
}

/* ------------------------------- Diagnóstico ------------------------------ */

function Diagnostico({ d }: { d: ClusterDetalle }) {
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
      <section className="rounded-2xl border border-border bg-card p-6 sm:p-7">
        <div className="flex items-center gap-2.5">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary">
            <span className="h-2 w-2 rounded-full bg-signal" />
          </span>
          <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            Diagnóstico del agente
          </span>
        </div>

        <div className="mt-5 flex flex-col gap-4 text-[15px] leading-relaxed">
          {d.diagnostico.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        <div className="my-6 h-px bg-border" />

        <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
          Evidencia
        </p>
        <ul className="mt-3 flex flex-col gap-2.5">
          {d.evidencia.map((e, i) => (
            <li key={i} className="flex gap-2.5 text-sm leading-relaxed">
              <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-signal" />
              <span>{e}</span>
            </li>
          ))}
        </ul>
      </section>

      <div className="flex flex-col gap-4">
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            Impacto en el negocio
          </p>
          <div className="mt-2 font-display text-3xl font-semibold tracking-tight">
            {d.impacto}
          </div>
          <p className="mt-2 text-[13px] leading-snug text-muted-foreground">
            {d.impactoNota}
          </p>
          <div className="mt-4 flex flex-col">
            {d.impactoFilas.map(([k, v]) => (
              <div
                key={k}
                className="flex justify-between border-t border-border py-2.5 text-sm"
              >
                <span className="text-muted-foreground">{k}</span>
                <span className="font-medium">{v}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-muted/60 p-5">
          <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            Confianza del cluster
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-3xl font-semibold">
              {d.confianza}
            </span>
            <span className="text-[13px] text-muted-foreground">
              cohesión del cluster
            </span>
          </div>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-border">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${d.confianzaValor}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

/* ---------------------------- Recorrido (scroll) -------------------------- */

function Recorrido({ pasos }: { pasos: PasoDetalle[] }) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)
  const [dir, setDir] = useState(1)
  const prev = useRef(0)

  useEffect(() => {
    function onScroll() {
      const el = wrapRef.current
      if (!el) return
      const total = el.offsetHeight - window.innerHeight
      const scrolled = Math.min(Math.max(-el.getBoundingClientRect().top, 0), total)
      const p = total > 0 ? scrolled / total : 0
      const idx = Math.min(pasos.length - 1, Math.floor(p * pasos.length))
      setActive((cur) => (cur === idx ? cur : idx))
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [pasos.length])

  useEffect(() => {
    setDir(active >= prev.current ? 1 : -1)
    prev.current = active
  }, [active])

  function goTo(i: number) {
    const el = wrapRef.current
    if (!el) return
    const total = el.offsetHeight - window.innerHeight
    const top =
      el.offsetTop + (total * (i + 0.5)) / pasos.length
    window.scrollTo({ top, behavior: 'smooth' })
  }

  const paso = pasos[active]
  const slide = dir > 0 ? 'animate-slide-up' : 'animate-slide-down'

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
          Recorrido reproducido por el agente · {pasos.length} pasos
        </p>
        <p className="hidden font-mono text-[11px] text-muted-foreground sm:block">
          scrolleá para avanzar ↓
        </p>
      </div>

      <div
        ref={wrapRef}
        style={{ height: `${pasos.length * 62}vh` }}
        className="relative"
      >
        <div className="sticky top-6 grid gap-4 lg:grid-cols-[220px_1fr_330px]">
          {/* Panel izquierdo: timeline */}
          <ol className="flex flex-col">
            {pasos.map((p, i) => {
              const on = i === active
              const dot =
                p.estado === 'error'
                  ? 'bg-primary'
                  : p.estado === 'warn'
                    ? 'bg-signal'
                    : 'bg-border'
              return (
                <li key={p.n} className="flex gap-3">
                  {/* Columna del eje */}
                  <div className="flex flex-col items-center">
                    <span
                      className={`mt-1 h-3 w-3 shrink-0 rounded-full ring-4 transition-all ${dot} ${
                        on ? 'ring-signal/25' : 'ring-transparent'
                      }`}
                    />
                    {i < pasos.length - 1 && (
                      <span className="my-1 w-px flex-1 bg-border" />
                    )}
                  </div>
                  {/* Contenido */}
                  <button
                    onClick={() => goTo(i)}
                    className={`mb-2 flex-1 rounded-xl border px-3 py-2.5 text-left transition-all ${
                      on
                        ? 'border-foreground bg-card'
                        : 'border-transparent hover:bg-card/60'
                    }`}
                  >
                    <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      Paso {p.n}
                    </p>
                    <p className="mt-0.5 text-sm font-medium leading-tight">
                      {p.pantalla}
                    </p>
                    <p className="text-xs text-muted-foreground">{p.accion}</p>
                  </button>
                </li>
              )
            })}
          </ol>

          {/* Panel central: captura */}
          <div key={`cap-${active}`} className={slide}>
            <ScreenshotFrame paso={paso} />
          </div>

          {/* Panel derecho: nota del agente */}
          <div
            key={`note-${active}`}
            className={`flex flex-col rounded-2xl border border-border bg-card p-6 ${slide}`}
          >
            <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
              Nota del agente
            </p>
            <h3 className="mt-3 font-display text-xl font-semibold tracking-tight">
              {paso.titulo}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {paso.nota}
            </p>
            <div className="mt-5 flex flex-col">
              {paso.datos.map(([k, v]) => (
                <div
                  key={k}
                  className="flex justify-between border-t border-border py-2.5 text-sm"
                >
                  <span className="text-muted-foreground">{k}</span>
                  <span className="font-medium">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/** Marco oscuro que simula la captura que vio el agente (placeholder estilizado). */
function ScreenshotFrame({ paso }: { paso: PasoDetalle }) {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-[#26292c] bg-[#16181a] text-[#c8ccce]">
      <div className="flex items-center justify-between px-5 py-3.5">
        <span className="font-mono text-[11px] uppercase tracking-widest text-[#8a8f94]">
          Captura del agente · Paso {paso.n}
        </span>
        <span
          className={`rounded-full px-2 py-0.5 font-mono text-[10px] ${
            paso.estado === 'error'
              ? 'bg-signal text-signal-foreground'
              : 'bg-white/10 text-[#c8ccce]'
          }`}
        >
          {paso.estadoLabel}
        </span>
      </div>
      <div className="px-5 pb-5">
        <div
          className="flex aspect-[16/10] items-center justify-center rounded-lg border border-white/10"
          style={{
            backgroundImage:
              'repeating-linear-gradient(45deg, rgba(255,255,255,0.03) 0 10px, transparent 10px 20px)',
          }}
        >
          <div className="text-center">
            <p className="font-mono text-[12px] text-[#8a8f94]">
              captura · {paso.captura}
            </p>
            <p className="mt-1 font-mono text-[10px] text-[#5f6469]">
              1440 × 900
            </p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {paso.tags.map((t) => (
            <span
              key={t}
              className="rounded-full border border-white/12 px-2.5 py-1 font-mono text-[10px] text-[#a2a6aa]"
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ------------------------------- Segmento -------------------------------- */

function Segmento({ d }: { d: ClusterDetalle }) {
  return (
    <div className="flex flex-col gap-5">
      <section className="rounded-2xl border border-border bg-card p-6 sm:p-8">
        <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
          Quiénes son
        </p>
        <p className="mt-4 max-w-3xl text-pretty text-[19px] font-medium leading-relaxed tracking-tight">
          {d.perfil}
        </p>
      </section>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {d.demo.map((g) => (
          <div
            key={g.titulo}
            className="rounded-2xl border border-border bg-card p-5"
          >
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {g.titulo}
            </p>
            <div className="mt-4 flex flex-col gap-3.5">
              {g.filas.map(([label, pct], i) => (
                <div key={label}>
                  <div className="flex items-baseline justify-between text-sm">
                    <span className="font-medium">{label}</span>
                    <span className="text-muted-foreground">{pct}</span>
                  </div>
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-border">
                    <div
                      className={`h-full rounded-full ${
                        i === 0 ? 'bg-primary' : 'bg-foreground/25'
                      }`}
                      style={{ width: pct }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
