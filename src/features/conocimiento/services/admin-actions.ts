'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireEditor } from '@/lib/auth/editor'
import type {
  KnowledgeStep,
  Route,
  RescuePlaybook,
  RouteStepWithStep,
} from '../types'

type ActionResult<T = undefined> = { error?: string; data?: T }

function nowIso() {
  return new Date().toISOString()
}

// ============ PASOS (knowledge_steps) ============

const stepSchema = z.object({
  slug: z.string().trim().min(1, 'El slug es obligatorio').max(80)
    .regex(/^[a-z0-9-]+$/, 'Slug: solo minúsculas, números y guiones'),
  titulo: z.string().trim().min(1, 'El título es obligatorio').max(160),
  instruccion: z.string().trim().min(1, 'La instrucción es obligatoria'),
  nombre_actual_boton: z.string().trim().max(160).optional().or(z.literal('')),
  trampa: z.string().trim().optional().or(z.literal('')),
  comportamiento_a_evitar: z.string().trim().optional().or(z.literal('')),
  canal: z.enum(['whatsapp', 'instagram']),
  estado_editorial: z.enum(['borrador', 'propuesto', 'aprobado']),
})

export async function listSteps(): Promise<KnowledgeStep[]> {
  await requireEditor()
  const supabase = createAdminClient()
  // Vista de curaduría: primero los más reportados, luego los más viejos sin verificar.
  const { data } = await supabase
    .from('knowledge_steps')
    .select('*')
    .order('reportes_de_desvio_activos', { ascending: false })
    .order('fecha_ultima_verificacion', { ascending: true })
  return data ?? []
}

export async function getStep(id: string): Promise<KnowledgeStep | null> {
  await requireEditor()
  const supabase = createAdminClient()
  const { data } = await supabase.from('knowledge_steps').select('*').eq('id', id).maybeSingle()
  return data
}

export async function upsertStep(id: string | null, formData: FormData): Promise<ActionResult<{ id: string }>> {
  const { user } = await requireEditor()
  const parsed = stepSchema.safeParse({
    slug: formData.get('slug'),
    titulo: formData.get('titulo'),
    instruccion: formData.get('instruccion'),
    nombre_actual_boton: formData.get('nombre_actual_boton'),
    trampa: formData.get('trampa'),
    comportamiento_a_evitar: formData.get('comportamiento_a_evitar'),
    canal: formData.get('canal'),
    estado_editorial: formData.get('estado_editorial'),
  })
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }

  const v = parsed.data
  const supabase = createAdminClient()
  const payload = {
    slug: v.slug,
    titulo: v.titulo,
    instruccion: v.instruccion,
    nombre_actual_boton: v.nombre_actual_boton || null,
    trampa: v.trampa || null,
    comportamiento_a_evitar: v.comportamiento_a_evitar || null,
    canal: v.canal,
    estado_editorial: v.estado_editorial,
    // Editar = re-verificar: refresca fecha y limpia reportes.
    fecha_ultima_verificacion: nowIso(),
    reportes_de_desvio_activos: 0,
    updated_at: nowIso(),
    autor: user.id,
  }

  if (id) {
    const { error } = await supabase.from('knowledge_steps').update(payload).eq('id', id)
    if (error) return { error: error.message }
    revalidatePath('/admin/conocimiento')
    return { data: { id } }
  }

  const { data, error } = await supabase.from('knowledge_steps').insert(payload).select('id').single()
  if (error) {
    if (error.code === '23505') return { error: 'Ya existe un Paso con ese slug.' }
    return { error: error.message }
  }
  revalidatePath('/admin/conocimiento')
  return { data: { id: data.id } }
}

/** Marca un Paso como verificado hoy sin editar su contenido (limpia reportes). */
export async function verifyStep(id: string): Promise<ActionResult> {
  await requireEditor()
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('knowledge_steps')
    .update({ fecha_ultima_verificacion: nowIso(), reportes_de_desvio_activos: 0 })
    .eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/conocimiento')
  return {}
}

export async function deleteStep(id: string): Promise<ActionResult> {
  await requireEditor()
  const supabase = createAdminClient()
  const { error } = await supabase.from('knowledge_steps').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/conocimiento')
  return {}
}

// ============ RUTAS (routes + route_steps) ============

const routeSchema = z.object({
  nombre: z.string().trim().min(1, 'El nombre es obligatorio').max(120),
  proceso: z.enum(['activacion_numero', 'verificacion_portafolio']),
  rama: z.enum(['estandar', 'rehabilitacion', 'verif_alternativa', 'por_bsp']),
  canal: z.enum(['whatsapp', 'instagram']),
  bsp: z.string().trim().max(80).optional().or(z.literal('')),
  pais: z.string().trim().max(80).optional().or(z.literal('')),
})

export async function listRoutes(): Promise<Route[]> {
  await requireEditor()
  const supabase = createAdminClient()
  const { data } = await supabase.from('routes').select('*').order('created_at', { ascending: true })
  return data ?? []
}

export async function getRoute(id: string): Promise<Route | null> {
  await requireEditor()
  const supabase = createAdminClient()
  const { data } = await supabase.from('routes').select('*').eq('id', id).maybeSingle()
  return data
}

export async function getRouteSteps(routeId: string): Promise<RouteStepWithStep[]> {
  await requireEditor()
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('route_steps')
    .select('*, knowledge_steps(*)')
    .eq('route_id', routeId)
    .order('orden', { ascending: true })
  return (data ?? []) as RouteStepWithStep[]
}

export async function createRoute(formData: FormData): Promise<ActionResult<{ id: string }>> {
  await requireEditor()
  const parsed = routeSchema.safeParse({
    nombre: formData.get('nombre'),
    proceso: formData.get('proceso'),
    rama: formData.get('rama'),
    canal: formData.get('canal'),
    bsp: formData.get('bsp'),
    pais: formData.get('pais'),
  })
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }
  const v = parsed.data
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('routes')
    .insert({ nombre: v.nombre, proceso: v.proceso, rama: v.rama, canal: v.canal, bsp: v.bsp || null, pais: v.pais || null })
    .select('id')
    .single()
  if (error) return { error: error.message }
  revalidatePath('/admin/conocimiento/rutas')
  return { data: { id: data.id } }
}

export async function deleteRoute(id: string): Promise<ActionResult> {
  await requireEditor()
  const supabase = createAdminClient()
  const { error } = await supabase.from('routes').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/conocimiento/rutas')
  return {}
}

/** Agrega un Paso al final de una ruta. */
export async function addStepToRoute(routeId: string, stepId: string): Promise<ActionResult> {
  await requireEditor()
  const supabase = createAdminClient()
  const { data: last } = await supabase
    .from('route_steps')
    .select('orden')
    .eq('route_id', routeId)
    .order('orden', { ascending: false })
    .limit(1)
    .maybeSingle()
  const nextOrden = (last?.orden ?? 0) + 1
  const { error } = await supabase
    .from('route_steps')
    .insert({ route_id: routeId, step_id: stepId, orden: nextOrden })
  if (error) {
    if (error.code === '23505') return { error: 'Ese Paso ya está en la ruta.' }
    return { error: error.message }
  }
  revalidatePath(`/admin/conocimiento/rutas/${routeId}`)
  return {}
}

export async function removeStepFromRoute(routeStepId: string, routeId: string): Promise<ActionResult> {
  await requireEditor()
  const supabase = createAdminClient()
  const { error } = await supabase.from('route_steps').delete().eq('id', routeStepId)
  if (error) return { error: error.message }
  revalidatePath(`/admin/conocimiento/rutas/${routeId}`)
  return {}
}

/** Mueve un Paso arriba/abajo intercambiando su orden con el vecino. */
export async function moveStep(routeStepId: string, routeId: string, dir: 'up' | 'down'): Promise<ActionResult> {
  await requireEditor()
  const supabase = createAdminClient()
  const { data: rows } = await supabase
    .from('route_steps')
    .select('id, orden')
    .eq('route_id', routeId)
    .order('orden', { ascending: true })
  if (!rows) return { error: 'No se pudo leer la ruta.' }

  const idx = rows.findIndex((r) => r.id === routeStepId)
  if (idx === -1) return {}
  const swapIdx = dir === 'up' ? idx - 1 : idx + 1
  if (swapIdx < 0 || swapIdx >= rows.length) return {}

  const a = rows[idx]
  const b = rows[swapIdx]
  // unique(route_id, orden): usar un orden temporal para evitar choque.
  const TEMP = -1
  const e1 = await supabase.from('route_steps').update({ orden: TEMP }).eq('id', a.id)
  if (e1.error) return { error: e1.error.message }
  const e2 = await supabase.from('route_steps').update({ orden: a.orden }).eq('id', b.id)
  if (e2.error) return { error: e2.error.message }
  const e3 = await supabase.from('route_steps').update({ orden: b.orden }).eq('id', a.id)
  if (e3.error) return { error: e3.error.message }

  revalidatePath(`/admin/conocimiento/rutas/${routeId}`)
  return {}
}

// ============ PLAYBOOKS DE RESCATE ============

const playbookSchema = z.object({
  tipo_restriccion: z.enum(['integridad', 'verificacion', 'comportamiento']),
  diagnostico: z.string().trim().min(1, 'El diagnóstico es obligatorio'),
  documentacion_a_presentar: z.string().trim().optional().or(z.literal('')),
  plantilla_apelacion: z.string().trim().optional().or(z.literal('')),
  tiempo_espera: z.string().trim().max(120).optional().or(z.literal('')),
  criterio_irrecuperable: z.string().trim().optional().or(z.literal('')),
})

export async function listPlaybooks(): Promise<RescuePlaybook[]> {
  await requireEditor()
  const supabase = createAdminClient()
  const { data } = await supabase.from('rescue_playbooks').select('*').order('tipo_restriccion')
  return data ?? []
}

export async function getPlaybook(id: string): Promise<RescuePlaybook | null> {
  await requireEditor()
  const supabase = createAdminClient()
  const { data } = await supabase.from('rescue_playbooks').select('*').eq('id', id).maybeSingle()
  return data
}

export async function upsertPlaybook(id: string | null, formData: FormData): Promise<ActionResult<{ id: string }>> {
  await requireEditor()
  const parsed = playbookSchema.safeParse({
    tipo_restriccion: formData.get('tipo_restriccion'),
    diagnostico: formData.get('diagnostico'),
    documentacion_a_presentar: formData.get('documentacion_a_presentar'),
    plantilla_apelacion: formData.get('plantilla_apelacion'),
    tiempo_espera: formData.get('tiempo_espera'),
    criterio_irrecuperable: formData.get('criterio_irrecuperable'),
  })
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }
  const v = parsed.data
  const supabase = createAdminClient()
  const payload = {
    tipo_restriccion: v.tipo_restriccion,
    diagnostico: v.diagnostico,
    documentacion_a_presentar: v.documentacion_a_presentar || null,
    plantilla_apelacion: v.plantilla_apelacion || null,
    tiempo_espera: v.tiempo_espera || null,
    criterio_irrecuperable: v.criterio_irrecuperable || null,
  }
  if (id) {
    const { error } = await supabase.from('rescue_playbooks').update(payload).eq('id', id)
    if (error) return { error: error.message }
    revalidatePath('/admin/conocimiento/rescate')
    return { data: { id } }
  }
  const { data, error } = await supabase.from('rescue_playbooks').insert(payload).select('id').single()
  if (error) return { error: error.message }
  revalidatePath('/admin/conocimiento/rescate')
  return { data: { id: data.id } }
}

export async function deletePlaybook(id: string): Promise<ActionResult> {
  await requireEditor()
  const supabase = createAdminClient()
  const { error } = await supabase.from('rescue_playbooks').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/conocimiento/rescate')
  return {}
}
