import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getProject } from '@/features/proyectos/services/actions'
import { SemaforoBadge, DeleteProjectButton } from '@/features/proyectos/components'
import { ESTADO_LABELS } from '@/features/proyectos/types'
import { DiagnosticoForm } from '@/features/diagnostico/components'
import { WizardRunner, RescateView } from '@/features/wizard/components'
import { getRouteSteps, getProgress, getPlaybooks } from '@/features/wizard/services/actions'

const CANAL_LABEL = { whatsapp: 'WhatsApp', instagram: 'Instagram' } as const

function razonesDe(respuestas: unknown): string[] {
  if (respuestas && typeof respuestas === 'object' && 'razones' in respuestas) {
    const r = (respuestas as { razones?: unknown }).razones
    if (Array.isArray(r)) return r.filter((x): x is string => typeof x === 'string')
  }
  return []
}

export default async function ProyectoDetallePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const project = await getProject(id)
  if (!project) notFound()

  const razones = razonesDe(project.diagnostico_respuestas)

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-900">← Volver</Link>

      <div className="mt-3 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{project.cliente_nombre}</h1>
          <p className="mt-1 text-sm text-gray-500">
            {CANAL_LABEL[project.canal]}
            {project.pais ? ` · ${project.pais}` : ''}
            {project.bsp_candidato ? ` · BSP: ${project.bsp_candidato}` : ''}
            {project.tipo_negocio ? ` · ${project.tipo_negocio}` : ''}
          </p>
        </div>
        <SemaforoBadge value={project.semaforo_riesgo} />
      </div>

      <div className="mt-2">
        <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
          {ESTADO_LABELS[project.estado]}
        </span>
      </div>

      <div className="mt-8">
        {project.estado === 'diagnostico' && (
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="text-base font-semibold text-gray-900">Diagnóstico de riesgo</h2>
            <p className="mb-4 mt-1 text-sm text-gray-500">
              Responde para evaluar el estado de la cuenta y asignar la ruta de activación.
            </p>
            <DiagnosticoForm projectId={project.id} />
          </div>
        )}

        {(project.estado === 'en_ruta' || project.estado === 'produccion') && (
          <>
            {razones.length > 0 && (
              <div className="mb-5 rounded-lg border border-gray-200 bg-white p-4 text-sm">
                <h2 className="font-semibold text-gray-900">Resultado del diagnóstico</h2>
                <ul className="mt-1 list-disc space-y-0.5 pl-5 text-gray-600">
                  {razones.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
              </div>
            )}

            {project.estado === 'produccion' && (
              <div className="mb-5 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
                <span className="font-semibold text-green-900">En producción ✓</span> — cuenta activada.
                Mantén el calentamiento y vigila la calidad del número los primeros días.
              </div>
            )}

            {project.route_id ? (
              <WizardSection projectId={project.id} routeId={project.route_id} />
            ) : (
              <p className="rounded-lg border border-dashed border-gray-300 bg-white p-6 text-center text-sm text-gray-500">
                No se asignó ninguna ruta (no hay rutas para este canal/rama todavía).
              </p>
            )}
          </>
        )}

        {project.estado === 'rescate' && (
          <RescateView projectId={project.id} playbooks={await getPlaybooks()} />
        )}

        {project.estado === 'abandonado' && (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-500">
            Proyecto marcado como irrecuperable. Empieza un proyecto nuevo con otra cuenta limpia.
          </div>
        )}
      </div>

      <div className="mt-8 border-t border-gray-200 pt-4">
        <DeleteProjectButton id={project.id} />
      </div>
    </div>
  )
}

async function WizardSection({ projectId, routeId }: { projectId: string; routeId: string }) {
  const [routeSteps, progress] = await Promise.all([getRouteSteps(routeId), getProgress(projectId)])
  return <WizardRunner projectId={projectId} routeSteps={routeSteps} progress={progress} />
}
