'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { upsertStep } from '../services/admin-actions'
import type { KnowledgeStep } from '../types'

const input =
  'mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
const labelC = 'block text-sm font-medium text-gray-700'

export function StepForm({ step }: { step?: KnowledgeStep }) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const editing = !!step

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    const result = await upsertStep(step?.id ?? null, formData)
    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }
    router.push('/admin/conocimiento')
    router.refresh()
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="slug" className={labelC}>Slug <span className="text-red-500">*</span></label>
          <input id="slug" name="slug" required defaultValue={step?.slug ?? ''}
            placeholder="wa-crear-business-manager" className={input} />
          <p className="mt-1 text-xs text-gray-400">Identificador estable. Minúsculas, números, guiones.</p>
        </div>
        <div>
          <label htmlFor="canal" className={labelC}>Canal <span className="text-red-500">*</span></label>
          <select id="canal" name="canal" defaultValue={step?.canal ?? 'whatsapp'} className={input}>
            <option value="whatsapp">WhatsApp</option>
            <option value="instagram">Instagram</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="titulo" className={labelC}>Título <span className="text-red-500">*</span></label>
        <input id="titulo" name="titulo" required defaultValue={step?.titulo ?? ''}
          placeholder="Crear el Business Manager" className={input} />
      </div>

      <div>
        <label htmlFor="instruccion" className={labelC}>Instrucción <span className="text-red-500">*</span></label>
        <textarea id="instruccion" name="instruccion" required rows={4} defaultValue={step?.instruccion ?? ''}
          placeholder="Qué tiene que hacer el implementador, paso a paso." className={input} />
      </div>

      <div>
        <label htmlFor="nombre_actual_boton" className={labelC}>Nombre actual del botón / opción</label>
        <input id="nombre_actual_boton" name="nombre_actual_boton" defaultValue={step?.nombre_actual_boton ?? ''}
          placeholder='Ej. "Configuración del negocio" (antes "Business Settings")' className={input} />
      </div>

      <div>
        <label htmlFor="trampa" className={labelC}>La trampa</label>
        <textarea id="trampa" name="trampa" rows={2} defaultValue={step?.trampa ?? ''}
          placeholder="El error que casi todos cometen aquí, o el nombre que cambió." className={input} />
      </div>

      <div>
        <label htmlFor="comportamiento_a_evitar" className={labelC}>Comportamiento a evitar</label>
        <textarea id="comportamiento_a_evitar" name="comportamiento_a_evitar" rows={2}
          defaultValue={step?.comportamiento_a_evitar ?? ''}
          placeholder="Qué acción dispara una restricción de Meta en este punto." className={input} />
      </div>

      <div>
        <label htmlFor="estado_editorial" className={labelC}>Estado editorial</label>
        <select id="estado_editorial" name="estado_editorial" defaultValue={step?.estado_editorial ?? 'aprobado'} className={input}>
          <option value="borrador">Borrador</option>
          <option value="propuesto">Propuesto</option>
          <option value="aprobado">Aprobado (visible en rutas)</option>
        </select>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex items-center gap-3 pt-2">
        <button type="submit" disabled={loading}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
          {loading ? 'Guardando...' : editing ? 'Guardar cambios' : 'Crear Paso'}
        </button>
        <button type="button" onClick={() => router.back()}
          className="rounded-md px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100">
          Cancelar
        </button>
      </div>
    </form>
  )
}
