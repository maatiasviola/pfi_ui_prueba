// Construye el contenido enriquecido del detalle de un cluster a partir de los
// campos base (lib/data.ts). En producción esto vendría del agente que reproduce
// el flujo; acá lo derivamos de forma determinística para el prototipo.

import { type Cluster, kpiById } from './data'

const fmt = (n: number) => n.toLocaleString('es-AR')

export type PasoDetalle = {
  n: string
  pantalla: string
  accion: string
  estado: 'ok' | 'warn' | 'error'
  estadoLabel: string
  captura: string
  titulo: string
  nota: string
  tags: string[]
  datos: [string, string][]
}

export type DemoGrupo = {
  titulo: string
  filas: [string, string][]
}

export type ClusterDetalle = {
  n: string
  nombre: string
  etapa: string
  severidad: number
  resumen: string
  kpis: { v: string; l: string }[]
  diagnostico: string[]
  evidencia: string[]
  impacto: string
  impactoNota: string
  impactoFilas: [string, string][]
  confianza: string
  confianzaValor: number
  perfil: string
  demo: DemoGrupo[]
  pasos: PasoDetalle[]
}

const ESTADO_LABEL: Record<PasoDetalle['estado'], string> = {
  ok: 'sin fricción',
  warn: 'roce menor',
  error: 'error detectado',
}

// Perfiles demográficos representativos (varían levemente según la etapa).
function demoFor(cluster: Cluster): DemoGrupo[] {
  const mobileHeavy = ['compra', 'deposito'].includes(cluster.kpiId)
  const mobile = mobileHeavy ? 71 : 58
  return [
    {
      titulo: 'Dispositivo',
      filas: [
        ['Mobile', `${mobile}%`],
        ['Desktop', `${88 - mobile}%`],
        ['Tablet', '7%'],
      ],
    },
    {
      titulo: 'Navegador',
      filas: [
        ['Chrome mobile', '58%'],
        ['Safari iOS', '29%'],
        ['Otros', '13%'],
      ],
    },
    {
      titulo: 'Sistema',
      filas: [
        ['Android', '54%'],
        ['iOS', '31%'],
        ['Windows', '15%'],
      ],
    },
    {
      titulo: 'Ubicación',
      filas: [
        ['AMBA', '48%'],
        ['Córdoba', '17%'],
        ['Resto del país', '35%'],
      ],
    },
  ]
}

function pasosFor(cluster: Cluster): PasoDetalle[] {
  return cluster.path.map((step, i) => {
    const estado: PasoDetalle['estado'] = step.drop
      ? 'error'
      : i === 0
        ? 'ok'
        : 'warn'
    const captura = `${step.screen}_${step.action}`
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')

    const titulo = step.drop
      ? 'Acá se pierde al usuario'
      : i === 0
        ? 'Entrada sin fricción'
        : 'El agente avanza con dudas'

    const nota = step.drop
      ? `En "${step.screen}", al ${step.action.toLowerCase()}, el agente reprodujo el punto exacto donde el flujo se corta. Es el patrón que define el cluster: la acción no da feedback claro y el usuario reintenta o abandona.`
      : i === 0
        ? `El agente llega a "${step.screen}" y ${step.action.toLowerCase()} sin anomalías. Los tiempos de carga y el layout son normales; la fricción todavía no aparece.`
        : `En "${step.screen}" el agente ${step.action.toLowerCase()}. La pantalla funciona, pero ya se acumulan señales que anticipan el problema del paso siguiente.`

    const tags = step.drop
      ? ['sin feedback', 'reintentos', 'abandono']
      : i === 0
        ? ['carga normal', 'sin errores']
        : ['señal temprana']

    const datos: [string, string][] = step.drop
      ? [
          ['Tiempo en pantalla', '2 m 12 s'],
          ['Reintentos', String(Math.max(2, Math.round(cluster.loops)))],
          ['Coincidencia con el cluster', 'muy alta'],
        ]
      : [
          ['Tiempo en pantalla', i === 0 ? '8 s' : '14 s'],
          ['Reintentos', '0'],
          ['Coincidencia con el cluster', i === 0 ? 'media' : 'alta'],
        ]

    return {
      n: String(i + 1),
      pantalla: step.screen,
      accion: step.action,
      estado,
      estadoLabel: ESTADO_LABEL[estado],
      captura,
      titulo,
      nota,
      tags,
      datos,
    }
  })
}

export function buildClusterDetail(cluster: Cluster): ClusterDetalle {
  const kpi = kpiById(cluster.kpiId)
  const sesiones = cluster.sessions
  const clientes = Math.round(sesiones * 0.6)
  const pct = ((sesiones / 312480) * 100).toFixed(1).replace('.', ',')
  const carritos = Math.round((sesiones * cluster.dropOff) / 100)
  const ticket = 8600
  const impactoM = (carritos * ticket) / 1_000_000
  const confianza = Math.round(78 + cluster.severity * 17)
  const reintentos = cluster.loops.toFixed(1).replace('.', ',')

  return {
    n: cluster.id.replace(/^c/, ''),
    nombre: cluster.name,
    etapa: kpi.label,
    severidad: Math.round(cluster.severity * 100),
    resumen: `El agente reprodujo el camino representativo del cluster 12 veces. En ${Math.round(cluster.dropOff / 8)} de esas ejecuciones el flujo se cortó en el mismo punto, sin que la interfaz explicara el error.`,
    kpis: [
      { v: `${pct}%`, l: 'de las sesiones' },
      { v: fmt(clientes), l: 'clientes afectados' },
      { v: fmt(sesiones), l: 'sesiones en el cluster' },
    ],
    diagnostico: [
      cluster.insight,
      `El problema se agrava porque el patrón se repite: las sesiones del cluster muestran un promedio de ${reintentos} intentos antes de abandonar. La combinación de falta de feedback y esfuerzo repetido convierte un error corregible en una salida.`,
      `Los usuarios afectados provienen mayormente de mobile, donde el contexto de uso (pantalla chica, teclado reducido) hace más probable el tropiezo. ${cluster.summary}`,
    ],
    evidencia: [
      `${Math.round(cluster.dropOff / 8)} de 12 reproducciones del agente terminaron sin conversión.`,
      `El ${cluster.dropOff}% de las sesiones del cluster abandona en este paso.`,
      'Ninguna captura muestra un mensaje de ayuda ni un campo marcado junto al error.',
    ],
    impacto: `$ ${impactoM.toFixed(1).replace('.', ',')} M`,
    impactoNota:
      'Valor estimado de las conversiones perdidas en el cluster durante los últimos 30 días.',
    impactoFilas: [
      ['Ticket promedio', `$ ${fmt(ticket)}`],
      ['Sesiones perdidas', fmt(carritos)],
      ['Tasa de recuperación', '4%'],
    ],
    confianza: `${confianza}%`,
    confianzaValor: confianza,
    perfil: `${cluster.summary} Habían avanzado el resto del recorrido sin dificultad: la fricción aparece recién en la etapa de ${kpi.label.toLowerCase()}, sobre usuarios con alta intención.`,
    demo: demoFor(cluster),
    pasos: pasosFor(cluster),
  }
}
