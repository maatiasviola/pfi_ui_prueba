// Modelo de datos del Atlas de Fricción.
// En producción estos clusters vienen del motor de ML no supervisado que agrupa
// secuencias de navegación. Acá usamos datos de ejemplo representativos.

export type Kpi = {
  id: string
  label: string
  /** Evento clave tal como se emite en el stream de navegación */
  event: string
  /** Descripción corta del valor de negocio */
  blurb: string
  /** Orden dentro del journey del usuario (0 = primer contacto) */
  stage: number
  /** Ancla del KPI en el mapa (0..1). Sigue el journey de arriba-izq a abajo-der. */
  x: number
  y: number
}

export type PathStep = {
  screen: string
  action: string
  /** true si el usuario abandona o retrocede acá */
  drop?: boolean
}

export type Cluster = {
  id: string
  name: string
  kpiId: string
  /** Severidad normalizada 0..1 (impacto en el KPI) */
  severity: number
  /** Sesiones afectadas por mes */
  sessions: number
  /** % de esas sesiones que abandonan el flujo */
  dropOff: number
  /** Cuántos usuarios repiten el patrón (frustración) */
  loops: number
  /** Resumen del comportamiento detectado */
  summary: string
  /** Diagnóstico en lenguaje natural generado por el agente */
  insight: string
  /** Camino representativo reproducido por el agente */
  path: PathStep[]
  /** Posición relativa (0..1) para la vista Constelación */
  x: number
  y: number
}

// Los KPIs se ubican en el mapa siguiendo el journey del usuario: desde el
// primer contacto (apertura de cuenta, arriba-izquierda) hasta la conversión de
// valor recurrente (compra, abajo-derecha). La cercanía entre KPIs refleja qué
// tan seguidos ocurren en el recorrido real, no una posición arbitraria.
export const kpis: Kpi[] = [
  {
    id: 'apertura',
    label: 'Apertura de cuenta',
    event: 'account_opened',
    blurb: 'Alta de un nuevo usuario verificado.',
    stage: 0,
    x: 0.22,
    y: 0.26,
  },
  {
    id: 'deposito',
    label: 'Depósito',
    event: 'deposit_confirmed',
    blurb: 'Ingreso de dinero a la cuenta del usuario.',
    stage: 1,
    x: 0.44,
    y: 0.62,
  },
  {
    id: 'transferencia',
    label: 'Transferencia',
    event: 'transfer_sent',
    blurb: 'Envío de dinero entre cuentas.',
    stage: 2,
    x: 0.68,
    y: 0.34,
  },
  {
    id: 'compra',
    label: 'Compra',
    event: 'checkout_completed',
    blurb: 'Conversión de carrito a pago confirmado.',
    stage: 3,
    x: 0.82,
    y: 0.7,
  },
]

export const clusters: Cluster[] = [
  {
    id: 'c1',
    name: 'Loop en verificación de identidad',
    kpiId: 'apertura',
    severity: 0.94,
    sessions: 4820,
    dropOff: 61,
    loops: 3.4,
    summary:
      'Los usuarios reintentan la foto del documento una y otra vez sin recibir feedback claro del error.',
    insight:
      'El agente reprodujo el flujo y detectó que el mensaje de error de la cámara aparece por debajo del botón, fuera del área visible en móviles. El usuario no entiende por qué falla y reintenta hasta abandonar.',
    path: [
      { screen: 'Registro', action: 'Ingresa datos personales' },
      { screen: 'Verificación', action: 'Sube foto del documento' },
      { screen: 'Verificación', action: 'Error no visible', drop: true },
      { screen: 'Verificación', action: 'Reintenta foto (x3)' },
    ],
    x: 0.14,
    y: 0.14,
  },
  {
    id: 'c2',
    name: 'Duda en el monto mínimo',
    kpiId: 'deposito',
    severity: 0.78,
    sessions: 3110,
    dropOff: 44,
    loops: 2.1,
    summary:
      'Vuelven al home a buscar cuál es el monto mínimo antes de completar el depósito.',
    insight:
      'La pantalla de depósito no muestra el monto mínimo hasta que el usuario intenta confirmar. Muchos abandonan para "averiguar" y no vuelven.',
    path: [
      { screen: 'Home', action: 'Toca "Depositar"' },
      { screen: 'Depósito', action: 'Ingresa monto' },
      { screen: 'Depósito', action: 'Error de monto mínimo', drop: true },
      { screen: 'Home', action: 'Vuelve a buscar info' },
    ],
    x: 0.34,
    y: 0.72,
  },
  {
    id: 'c3',
    name: 'Selección de medio de pago confusa',
    kpiId: 'compra',
    severity: 0.71,
    sessions: 5240,
    dropOff: 38,
    loops: 1.8,
    summary:
      'Alternan entre tarjetas guardadas sin saber cuál quedó seleccionada.',
    insight:
      'El estado seleccionado de la tarjeta tiene muy poco contraste. El agente confundió cuál estaba activa en 4 de 5 intentos, igual que los usuarios reales.',
    path: [
      { screen: 'Carrito', action: 'Confirma productos' },
      { screen: 'Pago', action: 'Elige tarjeta' },
      { screen: 'Pago', action: 'No distingue selección', drop: true },
      { screen: 'Pago', action: 'Cambia de tarjeta (x2)' },
    ],
    x: 0.74,
    y: 0.82,
  },
  {
    id: 'c4',
    name: 'Búsqueda de contacto fallida',
    kpiId: 'transferencia',
    severity: 0.66,
    sessions: 2870,
    dropOff: 35,
    loops: 2.6,
    summary:
      'Buscan al destinatario por nombre pero el sistema solo acepta alias o CBU.',
    insight:
      'El campo de búsqueda no aclara qué acepta. Los usuarios tipean el nombre, no obtienen resultados y asumen que el contacto no existe.',
    path: [
      { screen: 'Home', action: 'Toca "Transferir"' },
      { screen: 'Destinatario', action: 'Busca por nombre' },
      { screen: 'Destinatario', action: 'Sin resultados', drop: true },
      { screen: 'Destinatario', action: 'Reintenta búsqueda' },
    ],
    x: 0.6,
    y: 0.22,
  },
  {
    id: 'c5',
    name: 'Cupón que no aplica',
    kpiId: 'compra',
    severity: 0.58,
    sessions: 3990,
    dropOff: 29,
    loops: 1.5,
    summary:
      'Ingresan un cupón, no ven reflejado el descuento y dudan antes de pagar.',
    insight:
      'El total no se actualiza visiblemente al aplicar el cupón. Falta un feedback de "descuento aplicado" cerca del precio final.',
    path: [
      { screen: 'Carrito', action: 'Ingresa cupón' },
      { screen: 'Carrito', action: 'Total sin cambios aparentes', drop: true },
      { screen: 'Carrito', action: 'Reingresa cupón' },
    ],
    x: 0.9,
    y: 0.56,
  },
  {
    id: 'c6',
    name: 'Timeout en confirmación de depósito',
    kpiId: 'deposito',
    severity: 0.52,
    sessions: 1740,
    dropOff: 41,
    loops: 1.2,
    summary:
      'La pantalla de "procesando" se queda sin respuesta y cierran la app.',
    insight:
      'No hay estado intermedio ni reintento. Ante la espera larga el usuario asume que falló y sale, aunque el depósito estaba en curso.',
    path: [
      { screen: 'Depósito', action: 'Confirma depósito' },
      { screen: 'Procesando', action: 'Espera prolongada', drop: true },
      { screen: 'Procesando', action: 'Cierra la app' },
    ],
    x: 0.52,
    y: 0.5,
  },
  {
    id: 'c7',
    name: 'Formulario de alta demasiado largo',
    kpiId: 'apertura',
    severity: 0.47,
    sessions: 2210,
    dropOff: 33,
    loops: 1.1,
    summary:
      'Abandonan a mitad del formulario de registro, sobre todo en el paso de domicilio.',
    insight:
      'El formulario pide todo en una sola pantalla sin indicador de progreso. La percepción de esfuerzo es alta y no hay guardado parcial.',
    path: [
      { screen: 'Registro', action: 'Completa datos básicos' },
      { screen: 'Registro', action: 'Paso de domicilio', drop: true },
      { screen: 'Registro', action: 'Abandona' },
    ],
    x: 0.3,
    y: 0.36,
  },
  {
    id: 'c8',
    name: 'Confirmación de transferencia ambigua',
    kpiId: 'transferencia',
    severity: 0.4,
    sessions: 1560,
    dropOff: 22,
    loops: 1.3,
    summary:
      'No queda claro si la transferencia se envió; algunos la repiten.',
    insight:
      'La pantalla de éxito es muy parecida a la de confirmación previa. El usuario duda y vuelve atrás, generando envíos duplicados.',
    path: [
      { screen: 'Transferencia', action: 'Confirma monto' },
      { screen: 'Éxito', action: 'Pantalla ambigua', drop: true },
      { screen: 'Transferencia', action: 'Reintenta envío' },
    ],
    x: 0.78,
    y: 0.44,
  },
  {
    id: 'c9',
    name: 'Reintento de código SMS',
    kpiId: 'apertura',
    severity: 0.6,
    sessions: 2640,
    dropOff: 37,
    loops: 2.2,
    summary:
      'El código de verificación tarda en llegar y los usuarios piden reenvíos repetidos.',
    insight:
      'El botón de "reenviar código" se habilita recién a los 60 segundos, pero no hay contador visible. El usuario lo toca sin efecto y se frustra antes de recibir el SMS.',
    path: [
      { screen: 'Registro', action: 'Ingresa teléfono' },
      { screen: 'Verificación', action: 'Espera el SMS', drop: true },
      { screen: 'Verificación', action: 'Toca "Reenviar" (x3)' },
    ],
    x: 0.24,
    y: 0.44,
  },
  {
    id: 'c10',
    name: 'Alias sin confirmación visible',
    kpiId: 'transferencia',
    severity: 0.55,
    sessions: 2050,
    dropOff: 27,
    loops: 1.6,
    summary:
      'Pegan el alias del destinatario pero no ven el nombre asociado antes de enviar.',
    insight:
      'El sistema valida el alias pero no muestra el titular de la cuenta hasta la pantalla siguiente. La falta de confirmación genera dudas y abandonos por miedo a equivocarse.',
    path: [
      { screen: 'Transferencia', action: 'Pega alias' },
      { screen: 'Destinatario', action: 'Sin nombre visible', drop: true },
      { screen: 'Destinatario', action: 'Revisa dos veces' },
    ],
    x: 0.66,
    y: 0.5,
  },
]

export function severityColor(severity: number): string {
  // Interpola de ámbar (baja) a rojo-coral (alta), manteniendo la familia cálida.
  const hue = 70 - severity * 45 // 70 -> 25
  const chroma = 0.12 + severity * 0.08
  const light = 0.78 - severity * 0.08
  return `oklch(${light.toFixed(3)} ${chroma.toFixed(3)} ${hue.toFixed(1)})`
}

/**
 * Color de severidad como RGB (para dibujar en <canvas>, que no entiende oklch).
 * Va de ámbar cálido (baja) a coral-rojo (alta).
 */
export function severityRgb(severity: number): [number, number, number] {
  // Ámbar (245, 190, 90) -> Coral/rojo (240, 90, 70)
  const t = Math.min(1, Math.max(0, severity))
  const r = Math.round(245 - t * 5)
  const g = Math.round(190 - t * 100)
  const b = Math.round(90 - t * 20)
  return [r, g, b]
}

export function severityLabel(severity: number): string {
  if (severity >= 0.75) return 'Crítica'
  if (severity >= 0.55) return 'Alta'
  if (severity >= 0.4) return 'Media'
  return 'Baja'
}

export function kpiById(id: string): Kpi {
  return kpis.find((k) => k.id === id) ?? kpis[0]
}

export function clustersByKpi(kpiId: string): Cluster[] {
  return clusters
    .filter((c) => c.kpiId === kpiId)
    .sort((a, b) => b.severity - a.severity)
}
