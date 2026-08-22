'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="mx-auto flex w-full max-w-[1440px] items-center px-6 py-7 md:px-10 md:py-9">
        <Link href="/landing" aria-label="Eureka, inicio" className="group inline-flex items-center">
          <span className="text-[2.75rem] font-semibold leading-none tracking-[-0.09em] text-primary transition-transform group-hover:scale-[1.02] md:text-[3.4rem]">
            eureka
          </span>
        </Link>
      </header>

      <section className="mx-auto flex min-h-[calc(100vh-126px)] w-full max-w-4xl flex-col items-center justify-center px-6 pb-20 text-center md:px-8 md:pb-28">
        <p className="mb-8 font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground md:mb-10">
          Inteligencia para entender tu producto
        </p>
        <h1 className="max-w-4xl text-balance text-5xl font-semibold leading-[0.98] tracking-[-0.06em] text-foreground md:text-7xl lg:text-[5.9rem]">
          Descubrí lo que tus usuarios no pueden decirte.
        </h1>
        <p className="mt-8 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground md:mt-10 md:text-xl">
          Eureka encuentra los patrones de fricción que atraviesan tu aplicación y los convierte en señales claras para que puedas mejorar cada experiencia.
        </p>
        <Link
          href="/"
          className="mt-10 inline-flex items-center gap-3 rounded-lg bg-primary px-7 py-4 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:mt-12"
        >
          Empezar
          <ArrowRight aria-hidden data-icon="inline-end" />
        </Link>
      </section>
    </main>
  )
}
