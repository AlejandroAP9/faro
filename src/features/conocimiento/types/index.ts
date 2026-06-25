import type { Database } from '@/types/supabase'

export type KnowledgeStep = Database['public']['Tables']['knowledge_steps']['Row']
export type Route = Database['public']['Tables']['routes']['Row']
export type RouteStep = Database['public']['Tables']['route_steps']['Row']
export type RescuePlaybook = Database['public']['Tables']['rescue_playbooks']['Row']

export type Canal = Database['public']['Enums']['canal']
export type Rama = Database['public']['Enums']['rama']
export type Proceso = Database['public']['Enums']['proceso_meta']

export const PROCESOS: { value: Proceso; label: string }[] = [
  { value: 'activacion_numero', label: 'Activación del número' },
  { value: 'verificacion_portafolio', label: 'Verificación del portafolio' },
]

export const PROCESO_LABELS: Record<Proceso, string> = {
  activacion_numero: 'Activación del número',
  verificacion_portafolio: 'Verificación del portafolio',
}
export type EstadoEditorial = Database['public']['Enums']['estado_editorial']
export type TipoRestriccion = Database['public']['Enums']['tipo_restriccion']

export const RAMAS: { value: Rama; label: string }[] = [
  { value: 'estandar', label: 'Estándar (cuenta nueva)' },
  { value: 'rehabilitacion', label: 'Rehabilitación (restricción previa)' },
  { value: 'verif_alternativa', label: 'Verificación alternativa (unipersonal)' },
  { value: 'por_bsp', label: 'Específica por BSP' },
]

export const RAMA_LABELS: Record<Rama, string> = {
  estandar: 'Estándar',
  rehabilitacion: 'Rehabilitación',
  verif_alternativa: 'Verif. alternativa',
  por_bsp: 'Por BSP',
}

export const ESTADO_EDITORIAL_LABELS: Record<EstadoEditorial, string> = {
  borrador: 'Borrador',
  propuesto: 'Propuesto',
  aprobado: 'Aprobado',
}

export const TIPOS_RESTRICCION: { value: TipoRestriccion; label: string }[] = [
  { value: 'integridad', label: 'Integridad' },
  { value: 'verificacion', label: 'Verificación' },
  { value: 'comportamiento', label: 'Comportamiento' },
]

export const TIPO_RESTRICCION_LABELS: Record<TipoRestriccion, string> = {
  integridad: 'Integridad',
  verificacion: 'Verificación',
  comportamiento: 'Comportamiento',
}

// Un Paso con su orden dentro de una ruta (para la vista de ensamblado).
export type RouteStepWithStep = RouteStep & { knowledge_steps: KnowledgeStep | null }
