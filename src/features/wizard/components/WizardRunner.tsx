'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { setStepStatus, reportDeviation, setProjectEstado } from '../services/actions'
import type { RouteStepWithStep } from '@/features/conocimiento/types'
import type { Database } from '@/types/supabase'

type ProgressRow = Database['public']['Tables']['project_progress']['Row']
type Estado = 'pendiente' | 'hecho' | 'desvio'

export function WizardRunner({
  projectId,
  routeSteps,
  progress,
}: {
  projectId: string
  routeSteps: RouteStepWithStep[]
  progress: ProgressRow[]
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const statusOf = (stepId: string): Estado =>
    (progress.find((p) => p.step_id === stepId)?.estado as Estado) ?? 'pendiente'

  function run(fn: () => Promise<{ error?: string }>) {
    startTransition(async () => {
      const r = await fn()
      if (r?.error) alert(r.error)
      else router.refresh()
    })
  }

  const total = routeSteps.length
  const hechos = routeSteps.filter((rs) => statusOf(rs.step_id) === 'hecho').length
  const currentIdx = routeSteps.findIndex((rs) => statusOf(rs.step_id) !== 'hecho')
  const allDone = total > 0 && hechos === total

  if (total === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500">
        La ruta asignada todavía no tiene Pasos. Cárgalos desde el backend de conocimiento.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Progreso */}
      <div className="flex items-center gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
          <div className="h-full bg-blue-600 transition-all" style={{ width: `${(hechos / total) * 100}%` }} />
        </div>
        <span className="text-sm font-medium text-gray-600">{hechos}/{total}</span>
      </div>

      {/* Pasos */}
      <ol className="space-y-3">
        {routeSteps.map((rs, i) => {
          const step = rs.knowledge_steps
          if (!step) return null
          const estado = statusOf(rs.step_id)
          const isCurrent = i === currentIdx
          const done = estado === 'hecho'
          const desvio = estado === 'desvio'

          return (
            <li
              key={rs.id}
              className={`rounded-lg border p-4 ${
                isCurrent ? 'border-blue-300 bg-white ring-1 ring-blue-100'
                : done ? 'border-gray-200 bg-gray-50'
                : 'border-gray-200 bg-white'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                  done ? 'bg-green-100 text-green-700'
                  : desvio ? 'bg-red-100 text-red-700'
                  : isCurrent ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-500'
                }`}>
                  {done ? '✓' : i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className={`text-sm font-semibold ${done ? 'text-gray-500' : 'text-gray-900'}`}>
                    {step.titulo}
                  </h3>

                  {(isCurrent || desvio) && (
                    <div className="mt-2 space-y-3 text-sm">
                      <p className="whitespace-pre-line text-gray-700">{step.instruccion}</p>

                      {step.nombre_actual_boton && (
                        <p className="text-gray-600">
                          <span className="font-medium text-gray-900">Dónde:</span> {step.nombre_actual_boton}
                        </p>
                      )}

                      {step.trampa && (
                        <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-amber-800">
                          <span className="font-semibold">⚠ La trampa:</span> {step.trampa}
                        </div>
                      )}

                      {step.comportamiento_a_evitar && (
                        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-red-800">
                          <span className="font-semibold">⛔ Evita:</span> {step.comportamiento_a_evitar}
                        </div>
                      )}

                      <div className="flex flex-wrap items-center gap-3 pt-1">
                        {!done && (
                          <button onClick={() => run(() => setStepStatus(projectId, rs.step_id, 'hecho'))} disabled={isPending}
                            className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50">
                            Marcar como hecho
                          </button>
                        )}
                        <button onClick={() => run(() => reportDeviation(projectId, rs.step_id, 'cambio'))} disabled={isPending}
                          className="text-xs font-medium text-amber-700 hover:underline disabled:opacity-50">
                          Esto cambió
                        </button>
                        <button onClick={() => run(() => reportDeviation(projectId, rs.step_id, 'no_funciona'))} disabled={isPending}
                          className="text-xs font-medium text-red-700 hover:underline disabled:opacity-50">
                          No funciona
                        </button>
                      </div>

                      {desvio && (
                        <p className="text-xs text-gray-500">
                          Reportaste un desvío en este Paso. Cuando lo resuelvas, márcalo como hecho.
                        </p>
                      )}
                    </div>
                  )}

                  {done && (
                    <button onClick={() => run(() => setStepStatus(projectId, rs.step_id, 'pendiente'))} disabled={isPending}
                      className="mt-1 text-xs text-gray-400 hover:text-gray-700 disabled:opacity-50">
                      Reabrir
                    </button>
                  )}
                </div>
              </div>
            </li>
          )
        })}
      </ol>

      {/* Checkpoint pre-producción */}
      {allDone && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-5">
          <h3 className="text-base font-semibold text-green-900">Checkpoint pre-producción ✓</h3>
          <p className="mt-1 text-sm text-green-800">
            Ruta completa. Antes y durante el primer mensaje, respeta el calentamiento de las primeras 48-72h:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-green-800">
            <li>Volumen bajo y creciente, nunca envíos masivos el día 1.</li>
            <li>Solo conversaciones iniciadas por el usuario al principio.</li>
            <li>Nada que parezca broadcast o lista comprada.</li>
            <li>Vigila la calidad del número en las primeras 24h.</li>
          </ul>
          <button onClick={() => run(() => setProjectEstado(projectId, 'produccion'))} disabled={isPending}
            className="mt-4 rounded-md bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800 disabled:opacity-50">
            Marcar en producción
          </button>
        </div>
      )}

      {/* Entrada a rescate */}
      <div className="border-t border-gray-200 pt-4">
        <button onClick={() => run(() => setProjectEstado(projectId, 'rescate'))} disabled={isPending}
          className="text-sm font-medium text-red-600 hover:underline disabled:opacity-50">
          La cuenta fue bloqueada → ir a modo rescate
        </button>
      </div>
    </div>
  )
}
