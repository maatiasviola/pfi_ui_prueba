// Paletas de acento conmutables para probar estilos en vivo.
// El id coincide con el selector [data-palette="..."] definido en globals.css.

export type PaletteId = 'lima' | 'violeta' | 'indigo' | 'cian'

export type Palette = {
  id: PaletteId
  label: string
  /** Color de muestra para el selector (mismo valor que --signal). */
  swatch: string
  /** Descripción corta del carácter de la paleta. */
  hint: string
}

export const palettes: Palette[] = [
  {
    id: 'lima',
    label: 'Lima',
    swatch: 'oklch(0.88 0.2 128)',
    hint: 'Energético y de alto contraste sobre el fondo azulado.',
  },
  {
    id: 'violeta',
    label: 'Violeta',
    swatch: 'oklch(0.72 0.19 300)',
    hint: 'Elegante y afín al tono frío del fondo.',
  },
  {
    id: 'indigo',
    label: 'Índigo',
    swatch: 'oklch(0.72 0.16 272)',
    hint: 'Sobrio, se funde con la base sin perder identidad.',
  },
  {
    id: 'cian',
    label: 'Cian',
    swatch: 'oklch(0.82 0.13 205)',
    hint: 'Fresco y tecnológico, muy legible.',
  },
]

export const defaultPalette: PaletteId = 'lima'
