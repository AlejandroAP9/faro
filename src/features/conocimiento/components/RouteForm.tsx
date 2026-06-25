'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createRoute } from '../services/admin-actions'
import { RAMAS } from '../types'

const input =
  'mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
const labelC = 'block text-sm font-medium text-gray-700'

export function RouteForm() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    const result = await createRoute(formData)
    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }
    if (result.data) {
      router.push(`/admin/conocimiento/rutas/${result.data.id}`)
      router.refresh()
    }
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="nombre" className={labelC}>Nombre <span className="text-red-500">*</span></label>
        <input id="nombre" name="nombre" required placeholder="WhatsApp · cuenta nueva · estándar" className={input} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="rama" className={labelC}>Rama <span className="text-red-500">*</span></label>
          <select id="rama" name="rama" defaultValue="estandar" className={input}>
            {RAMAS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="canal" className={labelC}>Canal <span className="text-red-500">*</span></label>
          <select id="canal" name="canal" defaultValue="whatsapp" className={input}>
            <option value="whatsapp">WhatsApp</option>
            <option value="instagram">Instagram</option>
          </select>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="pais" className={labelC}>País (vacío = aplica a todos)</label>
          <input id="pais" name="pais" placeholder="Ej. Chile" className={input} />
        </div>
        <div>
          <label htmlFor="bsp" className={labelC}>BSP (solo si la rama es por BSP)</label>
          <input id="bsp" name="bsp" placeholder="Ej. YCloud" className={input} />
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button type="submit" disabled={loading}
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
        {loading ? 'Creando...' : 'Crear ruta'}
      </button>
    </form>
  )
}
