'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { verifyStep, deleteStep } from '../services/admin-actions'
import { ESTADO_EDITORIAL_LABELS } from '../types'
import type { KnowledgeStep } from '../types'

function daysSince(iso: string): number {
  const ms = Date.now() - new Date(iso).getTime()
  return Math.floor(ms / (1000 * 60 * 60 * 24))
}

export function StepsCurationTable({ steps }: { steps: KnowledgeStep[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [busyId, setBusyId] = useState<string | null>(null)

  function run(id: string, fn: () => Promise<{ error?: string }>) {
    setBusyId(id)
    startTransition(async () => {
      const r = await fn()
      setBusyId(null)
      if (r?.error) alert(r.error)
      else router.refresh()
    })
  }

  if (steps.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 bg-white p-10 text-center">
        <p className="text-sm text-gray-500">Aún no hay Pasos. Crea el primero para armar las rutas.</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
          <tr>
            <th className="px-4 py-2.5 font-medium">Paso</th>
            <th className="px-4 py-2.5 font-medium">Canal</th>
            <th className="px-4 py-2.5 font-medium">Estado</th>
            <th className="px-4 py-2.5 font-medium">Verificado</th>
            <th className="px-4 py-2.5 font-medium">Reportes</th>
            <th className="px-4 py-2.5" />
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {steps.map((s) => {
            const dias = daysSince(s.fecha_ultima_verificacion)
            const stale = dias >= 30
            const reported = s.reportes_de_desvio_activos > 0
            const busy = busyId === s.id && isPending
            return (
              <tr key={s.id} className={reported ? 'bg-red-50/40' : undefined}>
                <td className="px-4 py-3">
                  <Link href={`/admin/conocimiento/${s.id}`} className="font-medium text-gray-900 hover:text-blue-600">
                    {s.titulo}
                  </Link>
                  <div className="text-xs text-gray-400">{s.slug}</div>
                </td>
                <td className="px-4 py-3 text-gray-600">{s.canal === 'whatsapp' ? 'WhatsApp' : 'Instagram'}</td>
                <td className="px-4 py-3">
                  <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                    {ESTADO_EDITORIAL_LABELS[s.estado_editorial]}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={stale ? 'font-medium text-amber-600' : 'text-gray-500'}>
                    hace {dias}d{stale ? ' ⚠' : ''}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {reported ? (
                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
                      {s.reportes_de_desvio_activos}
                    </span>
                  ) : (
                    <span className="text-gray-300">0</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-3 text-xs">
                    <button onClick={() => run(s.id, () => verifyStep(s.id))} disabled={busy}
                      className="font-medium text-green-700 hover:underline disabled:opacity-40">
                      Verificar hoy
                    </button>
                    <Link href={`/admin/conocimiento/${s.id}`} className="text-gray-500 hover:underline">Editar</Link>
                    <button
                      onClick={() => { if (confirm(`¿Eliminar "${s.titulo}"?`)) run(s.id, () => deleteStep(s.id)) }}
                      disabled={busy}
                      className="text-gray-400 hover:text-red-600 disabled:opacity-40">
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
