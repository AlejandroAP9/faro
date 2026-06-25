import Link from 'next/link'
import { listRoutes } from '@/features/conocimiento/services/admin-actions'
import { RouteForm, RoutesList } from '@/features/conocimiento/components'

export default async function RutasPage() {
  const routes = await listRoutes()
  return (
    <div>
      <div className="mb-1 flex items-center gap-4 text-sm">
        <Link href="/admin/conocimiento" className="text-gray-500 hover:text-gray-900">Pasos</Link>
        <span className="font-semibold text-gray-900">Rutas</span>
        <Link href="/admin/conocimiento/rescate" className="text-gray-500 hover:text-gray-900">Rescate</Link>
      </div>
      <h1 className="mb-6 mt-4 text-2xl font-bold text-gray-900">Rutas de activación</h1>

      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="mb-3 text-sm font-semibold text-gray-700">Rutas existentes</h2>
          <RoutesList routes={routes} />
        </div>
        <div>
          <h2 className="mb-3 text-sm font-semibold text-gray-700">Nueva ruta</h2>
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <RouteForm />
          </div>
        </div>
      </div>
    </div>
  )
}
