'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { evaluarDiagnostico, type DiagnosticoRespuestas } from '../lib/scoring'

const schema = z.object({
  antiguedad_cuenta: z.enum(['nueva', 'establecida']),
  historial_automatizacion: z.enum(['si', 'no']),
  restriccion_previa: z.enum(['si', 'no']),
  doc_empresarial: z.enum(['si', 'no']),
  numero_usado: z.enum(['si', 'no']),
})

type Result = { error?: string }

export async function saveDiagnostico(projectId: string, formData: FormData): Promise<Result> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const parsed = schema.safeParse({
    antiguedad_cuenta: formData.get('antiguedad_cuenta'),
    historial_automatizacion: formData.get('historial_automatizacion'),
    restriccion_previa: formData.get('restriccion_previa'),
    doc_empresarial: formData.get('doc_empresarial'),
    numero_usado: formData.get('numero_usado'),
  })
  if (!parsed.success) return { error: 'Responde todas las preguntas.' }

  const respuestas = parsed.data as DiagnosticoRespuestas
  const { semaforo, rama, razones } = evaluarDiagnostico(respuestas)

  // El proyecto define el canal; verificamos ownership vía RLS (select propio).
  const { data: project } = await supabase
    .from('projects')
    .select('id, canal')
    .eq('id', projectId)
    .maybeSingle()
  if (!project) return { error: 'Proyecto no encontrado' }

  // Buscar una ruta para (rama, canal). Si no hay, caer a la estándar del canal.
  let routeId: string | null = null
  const { data: exact } = await supabase
    .from('routes')
    .select('id')
    .eq('canal', project.canal)
    .eq('rama', rama)
    .limit(1)
    .maybeSingle()
  if (exact) {
    routeId = exact.id
  } else {
    const { data: fallback } = await supabase
      .from('routes')
      .select('id')
      .eq('canal', project.canal)
      .eq('rama', 'estandar')
      .limit(1)
      .maybeSingle()
    routeId = fallback?.id ?? null
  }

  const { error } = await supabase
    .from('projects')
    .update({
      semaforo_riesgo: semaforo,
      diagnostico_respuestas: { ...respuestas, razones, rama_sugerida: rama },
      route_id: routeId,
      estado: 'en_ruta',
      updated_at: new Date().toISOString(),
    })
    .eq('id', projectId)

  if (error) return { error: error.message }

  revalidatePath(`/proyectos/${projectId}`)
  return {}
}
