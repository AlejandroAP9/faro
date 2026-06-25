'use client'

import { useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { deleteRoute } from '../services/admin-actions'
import { RAMA_LABELS } from '../types'
import type { Route } from '../types'

export function RoutesList({ routes }: { routes: Route[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function onDelete(r: Route) {
    if (!confirm(`¿Eliminar la ruta "${r.nombre}"? Se quitan sus Pasos asignados (no los Pasos en sí).`)) return
    startTransition(async () => {
      const res = await deleteRoute(r.id)
      if (res?.error) alert(res.error)
      else router.refresh()
    })
  }

  if (routes.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500">
        Sin rutas todavía. Crea una para ensamblar Pasos en una secuencia.
      </p>
    )
  }

  return (
    <ul className="space-y-2">
      {routes.map((r) => (
        <li key={r.id} className="flex items-center justify-between gap-3 rounded-md border border-gray-200 bg-white px-4 py-3">
          <Link href={`/admin/conocimiento/rutas/${r.id}`} className="min-w-0">
            <div className="truncate text-sm font-medium text-gray-900 hover:text-blue-600">{r.nombre}</div>
            <div className="text-xs text-gray-400">
              {RAMA_LABELS[r.rama]} · {r.canal === 'whatsapp' ? 'WhatsApp' : 'Instagram'}
              {r.bsp ? ` · ${r.bsp}` : ''}
            </div>
          </Link>
          <button onClick={() => onDelete(r)} disabled={isPending}
            className="shrink-0 text-xs text-gray-400 hover:text-red-600 disabled:opacity-40">
            Eliminar
          </button>
        </li>
      ))}
    </ul>
  )
}
