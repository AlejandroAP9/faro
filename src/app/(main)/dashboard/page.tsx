import Link from 'next/link'
import { getProjects } from '@/features/proyectos/services/actions'
import { ProjectList } from '@/features/proyectos/components'

export default async function DashboardPage() {
  const projects = await getProjects()

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tus proyectos</h1>
          <p className="mt-1 text-sm text-gray-500">
            Cada proyecto es un cliente que estás llevando a producción sin bloqueos.
          </p>
        </div>
        {projects.length > 0 && (
          <Link
            href="/proyectos/nuevo"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Nuevo proyecto
          </Link>
        )}
      </div>

      <ProjectList projects={projects} />
    </div>
  )
}
