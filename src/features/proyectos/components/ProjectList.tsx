import Link from 'next/link'
import type { Project } from '../types'
import { ProjectCard } from './ProjectCard'

export function ProjectList({ projects }: { projects: Project[] }) {
  if (projects.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 bg-white p-12 text-center">
        <h3 className="text-base font-semibold text-gray-900">Sin proyectos todavía</h3>
        <p className="mx-auto mt-1 max-w-sm text-sm text-gray-500">
          Crea tu primer proyecto para diagnosticar el riesgo de la cuenta y generar la ruta de activación.
        </p>
        <Link
          href="/proyectos/nuevo"
          className="mt-4 inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Nuevo proyecto
        </Link>
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((p) => (
        <ProjectCard key={p.id} project={p} />
      ))}
    </div>
  )
}
