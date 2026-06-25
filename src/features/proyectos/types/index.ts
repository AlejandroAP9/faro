import type { Database } from '@/types/supabase'

export type Project = Database['public']['Tables']['projects']['Row']
export type ProjectInsert = Database['public']['Tables']['projects']['Insert']
export type Canal = Database['public']['Enums']['canal']
export type Semaforo = Database['public']['Enums']['semaforo']
export type ProjectEstado = Database['public']['Enums']['project_estado']

export const CANALES: { value: Canal; label: string }[] = [
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'instagram', label: 'Instagram' },
]

export const ESTADO_LABELS: Record<ProjectEstado, string> = {
  diagnostico: 'Diagnóstico',
  en_ruta: 'En ruta',
  rescate: 'Rescate',
  produccion: 'Producción',
  abandonado: 'Abandonado',
}
