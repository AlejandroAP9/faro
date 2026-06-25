'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { upsertPlaybook } from '../services/admin-actions'
import { TIPOS_RESTRICCION } from '../types'
import type { RescuePlaybook } from '../types'

const input =
  'mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
const labelC = 'block text-sm font-medium text-gray-700'

export function PlaybookForm({ playbook }: { playbook?: RescuePlaybook }) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const editing = !!playbook

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    const result = await upsertPlaybook(playbook?.id ?? null, formData)
    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }
    router.push('/admin/conocimiento/rescate')
    router.refresh()
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="tipo_restriccion" className={labelC}>Tipo de restricción <span className="text-red-500">*</span></label>
        <select id="tipo_restriccion" name="tipo_restriccion" defaultValue={playbook?.tipo_restriccion ?? 'integridad'} className={input}>
          {TIPOS_RESTRICCION.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor="diagnostico" className={labelC}>Diagnóstico <span className="text-red-500">*</span></label>
        <textarea id="diagnostico" name="diagnostico" required rows={3} defaultValue={playbook?.diagnostico ?? ''}
          placeholder="Cómo identificar que es este tipo de restricción." className={input} />
      </div>
      <div>
        <label htmlFor="documentacion_a_presentar" className={labelC}>Documentación a presentar</label>
        <textarea id="documentacion_a_presentar" name="documentacion_a_presentar" rows={3}
          defaultValue={playbook?.documentacion_a_presentar ?? ''} className={input} />
      </div>
      <div>
        <label htmlFor="plantilla_apelacion" className={labelC}>Plantilla de apelación</label>
        <textarea id="plantilla_apelacion" name="plantilla_apelacion" rows={4}
          defaultValue={playbook?.plantilla_apelacion ?? ''}
          placeholder="Cómo redactar el argumento en la revisión de Meta." className={input} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="tiempo_espera" className={labelC}>Tiempo de espera</label>
          <input id="tiempo_espera" name="tiempo_espera" defaultValue={playbook?.tiempo_espera ?? ''}
            placeholder="Ej. 24-48h antes de reintentar" className={input} />
        </div>
      </div>
      <div>
        <label htmlFor="criterio_irrecuperable" className={labelC}>Criterio de irrecuperable</label>
        <textarea id="criterio_irrecuperable" name="criterio_irrecuperable" rows={2}
          defaultValue={playbook?.criterio_irrecuperable ?? ''}
          placeholder="Cuándo declarar la cuenta perdida y empezar de cero." className={input} />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex items-center gap-3 pt-2">
        <button type="submit" disabled={loading}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
          {loading ? 'Guardando...' : editing ? 'Guardar cambios' : 'Crear playbook'}
        </button>
        <button type="button" onClick={() => router.back()}
          className="rounded-md px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100">
          Cancelar
        </button>
      </div>
    </form>
  )
}
