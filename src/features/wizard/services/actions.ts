'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { RouteStepWithStep, RescuePlaybook } from '@/features/conocimiento/types'
import type { Database } from '@/types/supabase'

type ProgressRow = Database['public']['Tables']['project_progress']['Row']
type Result = { error?: string }

async function client() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return { supabase, user }
}

// ---------- Lectura ----------

export async function getRouteSteps(routeId: string): Promise<RouteStepWithStep[]> {
  const { supabase } = await client()
  const { data } = await supabase
    .from('route_steps')
    .select('*, knowledge_steps(*)')
    .eq('route_id', routeId)
    .order('orden', { ascending: true })
  return (data ?? []) as RouteStepWithStep[]
}

export async function getProgress(projectId: string): Promise<ProgressRow[]> {
  const { supabase } = await client()
  const { data } = await supabase.from('project_progress').select('*').eq('project_id', projectId)
  return data ?? []
}

export async function getPlaybooks(): Promise<RescuePlaybook[]> {
  const { supabase } = await client()
  const { data } = await supabase.from('rescue_playbooks').select('*').order('tipo_restriccion')
  return data ?? []
}

// ---------- Mutación ----------

export async function setStepStatus(
  projectId: string,
  stepId: string,
  estado: 'pendiente' | 'hecho' | 'desvio'
): Promise<Result> {
  const { supabase } = await client()
  const { error } = await supabase
    .from('project_progress')
    .upsert(
      {
        project_id: projectId,
        step_id: stepId,
        estado,
        marcado_at: new Date().toISOString(),
      },
      { onConflict: 'project_id,step_id' }
    )
  if (error) return { error: error.message }
  revalidatePath(`/proyectos/${projectId}`)
  return {}
}

export async function reportDeviation(
  projectId: string,
  stepId: string,
  tipo: 'cambio' | 'no_funciona'
): Promise<Result> {
  const { supabase, user } = await client()
  if (!user) return { error: 'No autenticado' }

  const { error: repErr } = await supabase
    .from('deviation_reports')
    .insert({ step_id: stepId, reporter_id: user.id, tipo })
  // 23505 = ya reportó este Paso. No es error: se evita doble conteo y se sigue.
  if (repErr && repErr.code !== '23505') return { error: repErr.message }

  // Marcar el paso como desvío en el progreso del proyecto.
  await supabase
    .from('project_progress')
    .upsert(
      { project_id: projectId, step_id: stepId, estado: 'desvio', marcado_at: new Date().toISOString() },
      { onConflict: 'project_id,step_id' }
    )

  revalidatePath(`/proyectos/${projectId}`)
  return {}
}

export async function setProjectEstado(
  projectId: string,
  estado: Database['public']['Enums']['project_estado']
): Promise<Result> {
  const { supabase } = await client()
  const { error } = await supabase
    .from('projects')
    .update({ estado, updated_at: new Date().toISOString() })
    .eq('id', projectId)
  if (error) return { error: error.message }
  revalidatePath(`/proyectos/${projectId}`)
  return {}
}
