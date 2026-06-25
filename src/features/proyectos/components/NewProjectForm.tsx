'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createProject } from '../services/actions'
import { CANALES } from '../types'

const inputClass =
  'mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'

export function NewProjectForm() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    const result = await createProject(formData)
    // Si createProject hace redirect, no llegamos aquí. Solo manejamos error.
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="cliente_nombre" className="block text-sm font-medium text-gray-700">
          Nombre del cliente <span className="text-red-500">*</span>
        </label>
        <input id="cliente_nombre" name="cliente_nombre" type="text" required maxLength={120}
          placeholder="Ej. Pizzería Don Pepe" className={inputClass} />
      </div>

      <div>
        <label htmlFor="canal" className="block text-sm font-medium text-gray-700">
          Canal <span className="text-red-500">*</span>
        </label>
        <select id="canal" name="canal" required defaultValue="whatsapp" className={inputClass}>
          {CANALES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="pais" className="block text-sm font-medium text-gray-700">País</label>
          <input id="pais" name="pais" type="text" maxLength={80}
            placeholder="Ej. Argentina" className={inputClass} />
        </div>
        <div>
          <label htmlFor="bsp_candidato" className="block text-sm font-medium text-gray-700">BSP candidato</label>
          <input id="bsp_candidato" name="bsp_candidato" type="text" maxLength={80}
            placeholder="Ej. YCloud" className={inputClass} />
        </div>
      </div>

      <div>
        <label htmlFor="tipo_negocio" className="block text-sm font-medium text-gray-700">Tipo de negocio</label>
        <input id="tipo_negocio" name="tipo_negocio" type="text" maxLength={120}
          placeholder="Ej. Restaurante / e-commerce / servicios" className={inputClass} />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex items-center gap-3 pt-2">
        <button type="submit" disabled={loading}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
          {loading ? 'Creando...' : 'Crear proyecto'}
        </button>
        <button type="button" onClick={() => router.back()}
          className="rounded-md px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100">
          Cancelar
        </button>
      </div>
    </form>
  )
}
