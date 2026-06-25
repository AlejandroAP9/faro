'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { saveDiagnostico } from '../services/actions'
import { PREGUNTAS } from '../lib/scoring'

export function DiagnosticoForm({ projectId }: { projectId: string }) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    const result = await saveDiagnostico(projectId, formData)
    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }
    router.refresh()
  }

  return (
    <form action={handleSubmit} className="space-y-5 text-left">
      {PREGUNTAS.map((q) => (
        <fieldset key={q.name}>
          <legend className="text-sm font-medium text-gray-800">{q.label}</legend>
          <div className="mt-2 space-y-1.5">
            {q.opciones.map((o) => (
              <label key={o.value} className="flex items-center gap-2 text-sm text-gray-700">
                <input type="radio" name={q.name} value={o.value} required
                  className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500" />
                {o.label}
              </label>
            ))}
          </div>
        </fieldset>
      ))}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button type="submit" disabled={loading}
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
        {loading ? 'Evaluando...' : 'Calcular riesgo y generar ruta'}
      </button>
    </form>
  )
}
