import Link from 'next/link'
import { listPlaybooks } from '@/features/conocimiento/services/admin-actions'
import { PlaybooksList } from '@/features/conocimiento/components'

export default async function RescatePage() {
  const playbooks = await listPlaybooks()
  return (
    <div>
      <div className="mb-1 flex items-center gap-4 text-sm">
        <Link href="/admin/conocimiento" className="text-gray-500 hover:text-gray-900">Pasos</Link>
        <Link href="/admin/conocimiento/rutas" className="text-gray-500 hover:text-gray-900">Rutas</Link>
        <span className="font-semibold text-gray-900">Rescate</span>
      </div>

      <div className="mb-6 mt-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Playbooks de rescate</h1>
          <p className="mt-1 text-sm text-gray-500">Un guion por cada tipo de restricción de Meta.</p>
        </div>
        <Link href="/admin/conocimiento/rescate/nuevo"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          Nuevo playbook
        </Link>
      </div>

      <PlaybooksList playbooks={playbooks} />
    </div>
  )
}
