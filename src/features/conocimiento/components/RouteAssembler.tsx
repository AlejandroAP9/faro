'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  addStepToRoute,
  removeStepFromRoute,
  moveStep,
} from '../services/admin-actions'
import type { KnowledgeStep, RouteStepWithStep } from '../types'

export function RouteAssembler({
  routeId,
  routeSteps,
  allSteps,
}: {
  routeId: string
  routeSteps: RouteStepWithStep[]
  allSteps: KnowledgeStep[]
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [picked, setPicked] = useState('')

  const usedStepIds = new Set(routeSteps.map((rs) => rs.step_id))
  const available = allSteps.filter((s) => !usedStepIds.has(s.id))

  function run(fn: () => Promise<{ error?: string }>) {
    startTransition(async () => {
      const r = await fn()
      if (r?.error) alert(r.error)
      else router.refresh()
    })
  }

  return (
    <div className="space-y-6">
      {/* Pasos en la ruta */}
      <div>
        <h3 className="mb-2 text-sm font-semibold text-gray-700">Pasos de la ruta ({routeSteps.length})</h3>
        {routeSteps.length === 0 ? (
          <p className="rounded-md border border-dashed border-gray-300 bg-white p-6 text-center text-sm text-gray-500">
            Ruta vacía. Agrega Pasos abajo.
          </p>
        ) : (
          <ol className="space-y-2">
            {routeSteps.map((rs, i) => (
              <li key={rs.id} className="flex items-center gap-3 rounded-md border border-gray-200 bg-white px-3 py-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-600">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-gray-900">
                    {rs.knowledge_steps?.titulo ?? '(Paso eliminado)'}
                  </div>
                  <div className="truncate text-xs text-gray-400">{rs.knowledge_steps?.slug}</div>
                </div>
                <div className="flex items-center gap-1 text-gray-400">
                  <button onClick={() => run(() => moveStep(rs.id, routeId, 'up'))} disabled={isPending || i === 0}
                    className="px-1.5 hover:text-gray-700 disabled:opacity-30" aria-label="Subir">↑</button>
                  <button onClick={() => run(() => moveStep(rs.id, routeId, 'down'))} disabled={isPending || i === routeSteps.length - 1}
                    className="px-1.5 hover:text-gray-700 disabled:opacity-30" aria-label="Bajar">↓</button>
                  <button onClick={() => run(() => removeStepFromRoute(rs.id, routeId))} disabled={isPending}
                    className="px-1.5 text-gray-400 hover:text-red-600 disabled:opacity-30" aria-label="Quitar">✕</button>
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>

      {/* Agregar Paso */}
      <div className="rounded-md border border-gray-200 bg-gray-50 p-3">
        <h3 className="mb-2 text-sm font-semibold text-gray-700">Agregar un Paso</h3>
        {available.length === 0 ? (
          <p className="text-sm text-gray-500">No quedan Pasos disponibles para agregar.</p>
        ) : (
          <div className="flex items-center gap-2">
            <select value={picked} onChange={(e) => setPicked(e.target.value)}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
              <option value="">Elegir Paso…</option>
              {available.map((s) => (
                <option key={s.id} value={s.id}>{s.titulo} ({s.canal})</option>
              ))}
            </select>
            <button
              onClick={() => { if (picked) { run(() => addStepToRoute(routeId, picked)); setPicked('') } }}
              disabled={isPending || !picked}
              className="shrink-0 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
              Agregar
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
