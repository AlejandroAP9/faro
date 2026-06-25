import Link from 'next/link'
import type { Project } from '../types'
import { ESTADO_LABELS } from '../types'
import { SemaforoBadge } from './SemaforoBadge'

const CANAL_LABEL: Record<Project['canal'], string> = {
  whatsapp: 'WhatsApp',
  instagram: 'Instagram',
}

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      href={`/proyectos/${project.id}`}
      className="block rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition-colors hover:border-gray-300 hover:bg-gray-50"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold text-gray-900">
            {project.cliente_nombre}
          </h3>
          <p className="mt-0.5 text-sm text-gray-500">
            {CANAL_LABEL[project.canal]}
            {project.pais ? ` · ${project.pais}` : ''}
            {project.bsp_candidato ? ` · ${project.bsp_candidato}` : ''}
          </p>
        </div>
        <SemaforoBadge value={project.semaforo_riesgo} />
      </div>
      <div className="mt-4 flex items-center gap-2 text-xs">
        <span className="rounded bg-gray-100 px-2 py-0.5 font-medium text-gray-600">
          {ESTADO_LABELS[project.estado]}
        </span>
      </div>
    </Link>
  )
}
