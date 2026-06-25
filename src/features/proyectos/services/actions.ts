'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import type { Project } from '../types'

const projectSchema = z.object({
  cliente_nombre: z.string().trim().min(1, 'El nombre del cliente es obligatorio').max(120),
  canal: z.enum(['whatsapp', 'instagram']),
  pais: z.string().trim().max(80).optional().or(z.literal('')),
  bsp_candidato: z.string().trim().max(80).optional().or(z.literal('')),
  tipo_negocio: z.string().trim().max(120).optional().or(z.literal('')),
})

type ActionResult = { error?: string }

// Deriva el usuario de la sesion verificada server-side (nunca del cliente).
async function requireUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  return { supabase, user }
}

export async function getProjects(): Promise<Project[]> {
  const { supabase } = await requireUser()
  const { data } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })
  return data ?? []
}

export async function getProject(id: string): Promise<Project | null> {
  const { supabase } = await requireUser()
  const { data } = await supabase.from('projects').select('*').eq('id', id).maybeSingle()
  return data
}

export async function createProject(formData: FormData): Promise<ActionResult> {
  const { supabase, user } = await requireUser()

  const parsed = projectSchema.safeParse({
    cliente_nombre: formData.get('cliente_nombre'),
    canal: formData.get('canal'),
    pais: formData.get('pais'),
    bsp_candidato: formData.get('bsp_candidato'),
    tipo_negocio: formData.get('tipo_negocio'),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }
  }

  const v = parsed.data
  const { data, error } = await supabase
    .from('projects')
    .insert({
      owner_id: user.id,
      cliente_nombre: v.cliente_nombre,
      canal: v.canal,
      pais: v.pais || null,
      bsp_candidato: v.bsp_candidato || null,
      tipo_negocio: v.tipo_negocio || null,
    })
    .select('id')
    .single()

  if (error) return { error: error.message }

  revalidatePath('/dashboard')
  redirect(`/proyectos/${data.id}`)
}

export async function deleteProject(id: string): Promise<ActionResult> {
  const { supabase } = await requireUser()
  const { error } = await supabase.from('projects').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/dashboard')
  redirect('/dashboard')
}
