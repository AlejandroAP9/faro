'use client'

import { useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { deletePlaybook } from '../services/admin-actions'
import { TIPO_RESTRICCION_LABELS } from '../types'
import type { RescuePlaybook } from '../types'

export function PlaybooksList({ playbooks }: { playbooks: RescuePlaybook[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function onDelete(p: RescuePlaybook) {
    if (!confirm(`¿Eliminar el playbook de ${TIPO_RESTRICCION_LABELS[p.tipo_restriccion]}?`)) return
    startTransition(async () => {
      const res = await deletePlaybook(p.id)
      if (res?.error) alert(res.error)
      else router.refresh()
    })
  }

  if (playbooks.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500">
        Sin playbooks de rescate. Crea uno por cada tipo de restricción de Meta.
      </p>
    )
  }

  return (
    <ul className="space-y-2">
      {playbooks.map((p) => (
        <li key={p.id} className="flex items-center justify-between gap-3 rounded-md border border-gray-200 bg-white px-4 py-3">
          <Link href={`/admin/conocimiento/rescate/${p.id}`} className="min-w-0">
            <div className="text-sm font-medium text-gray-900 hover:text-blue-600">
              Restricción de {TIPO_RESTRICCION_LABELS[p.tipo_restriccion]}
            </div>
            <div className="truncate text-xs text-gray-400">{p.diagnostico}</div>
          </Link>
          <button onClick={() => onDelete(p)} disabled={isPending}
            className="shrink-0 text-xs text-gray-400 hover:text-red-600 disabled:opacity-40">
            Eliminar
          </button>
        </li>
      ))}
    </ul>
  )
}
