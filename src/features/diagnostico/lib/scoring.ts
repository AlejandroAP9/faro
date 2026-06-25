import type { Database } from '@/types/supabase'

type Semaforo = Database['public']['Enums']['semaforo']
type Rama = Database['public']['Enums']['rama']

export type DiagnosticoRespuestas = {
  antiguedad_cuenta: 'nueva' | 'establecida'
  historial_automatizacion: 'si' | 'no'
  restriccion_previa: 'si' | 'no'
  doc_empresarial: 'si' | 'no'
  numero_usado: 'si' | 'no'
}

export type DiagnosticoResultado = {
  semaforo: Semaforo
  rama: Rama
  razones: string[]
}

export const PREGUNTAS: {
  name: keyof DiagnosticoRespuestas
  label: string
  opciones: { value: string; label: string }[]
}[] = [
  {
    name: 'restriccion_previa',
    label: '¿La cuenta o el número tuvieron alguna restricción o bloqueo previo de Meta?',
    opciones: [
      { value: 'no', label: 'No, está limpia' },
      { value: 'si', label: 'Sí, hubo restricción antes' },
    ],
  },
  {
    name: 'numero_usado',
    label: '¿El número que usarán ya estuvo registrado alguna vez en la app de WhatsApp?',
    opciones: [
      { value: 'no', label: 'No, es un número nuevo / sin WhatsApp' },
      { value: 'si', label: 'Sí, ya tuvo WhatsApp' },
    ],
  },
  {
    name: 'doc_empresarial',
    label: '¿El negocio tiene documentación empresarial formal (razón social, inicio de actividades)?',
    opciones: [
      { value: 'si', label: 'Sí, tiene documentación formal' },
      { value: 'no', label: 'No, es unipersonal / informal' },
    ],
  },
  {
    name: 'historial_automatizacion',
    label: '¿La cuenta tiene historial de automatizaciones previas (bots, envíos masivos)?',
    opciones: [
      { value: 'no', label: 'No' },
      { value: 'si', label: 'Sí' },
    ],
  },
  {
    name: 'antiguedad_cuenta',
    label: '¿Qué antigüedad tiene la cuenta de Facebook / Business?',
    opciones: [
      { value: 'establecida', label: 'Establecida (meses o más, con actividad)' },
      { value: 'nueva', label: 'Nueva o recién creada' },
    ],
  },
]

/**
 * Lógica pura de diagnóstico. Decide semáforo y rama desde las respuestas.
 * - restricción previa → rojo + rehabilitación (la cuenta ya está marcada).
 * - sin documentación → verificación alternativa.
 * - cualquier señal de riesgo → amarillo; nada → verde.
 */
export function evaluarDiagnostico(r: DiagnosticoRespuestas): DiagnosticoResultado {
  const razones: string[] = []

  // Rama
  let rama: Rama = 'estandar'
  if (r.restriccion_previa === 'si') {
    rama = 'rehabilitacion'
    razones.push('Hubo una restricción previa: la cuenta entra por el camino de rehabilitación, no el estándar.')
  } else if (r.doc_empresarial === 'no') {
    rama = 'verif_alternativa'
    razones.push('Sin documentación empresarial formal: se usa la ruta de verificación alternativa.')
  }

  // Semáforo
  let semaforo: Semaforo
  if (r.restriccion_previa === 'si') {
    semaforo = 'rojo'
  } else {
    const señales: string[] = []
    if (r.numero_usado === 'si') señales.push('el número ya estuvo en WhatsApp (hay que conseguir uno nuevo)')
    if (r.historial_automatizacion === 'si') señales.push('la cuenta tiene historial de automatización')
    if (r.antiguedad_cuenta === 'nueva') señales.push('la cuenta es nueva')
    if (r.doc_empresarial === 'no') señales.push('falta documentación empresarial')

    if (señales.length > 0) {
      semaforo = 'amarillo'
      razones.push('Riesgo medio por: ' + señales.join('; ') + '.')
    } else {
      semaforo = 'verde'
      razones.push('Sin señales de riesgo detectadas: camino despejado para la activación estándar.')
    }
  }

  return { semaforo, rama, razones }
}
