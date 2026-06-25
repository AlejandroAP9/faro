'use client'

import { useState } from 'react'
import { deleteProject } from '../services/actions'

export function DeleteProjectButton({ id }: { id: string }) {
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    setLoading(true)
    const result = await deleteProject(id)
    // En éxito hace redirect; solo llegamos aquí si hubo error.
    if (result?.error) {
      setLoading(false)
      setConfirming(false)
    }
  }

  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        className="text-sm text-gray-400 hover:text-red-600"
      >
        Eliminar proyecto
      </button>
    )
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-gray-600">¿Seguro?</span>
      <button onClick={handleDelete} disabled={loading} className="font-medium text-red-600 hover:underline disabled:opacity-50">
        {loading ? 'Eliminando...' : 'Sí, eliminar'}
      </button>
      <button onClick={() => setConfirming(false)} className="text-gray-500 hover:underline">
        Cancelar
      </button>
    </div>
  )
}
