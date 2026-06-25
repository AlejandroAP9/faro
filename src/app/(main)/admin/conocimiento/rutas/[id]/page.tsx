import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  getRoute,
  getRouteSteps,
  listSteps,
} from '@/features/conocimiento/services/admin-actions'
import { RouteAssembler } from '@/features/conocimiento/components'
import { RAMA_LABELS } from '@/features/conocimiento/types'

export default async function RutaDetallePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const route = await getRoute(id)
  if (!route) notFound()

  const [routeSteps, allSteps] = await Promise.all([getRouteSteps(id), listSteps()])
  // Solo Pasos aprobados y del mismo canal son candidatos limpios para la ruta.
  const candidatos = allSteps.filter((s) => s.canal === route.canal && s.estado_editorial === 'aprobado')

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/admin/conocimiento/rutas" className="text-sm text-gray-500 hover:text-gray-900">← Volver a rutas</Link>
      <h1 className="mt-3 text-2xl font-bold text-gray-900">{route.nombre}</h1>
      <p className="mb-6 mt-1 text-sm text-gray-500">
        {RAMA_LABELS[route.rama]} · {route.canal === 'whatsapp' ? 'WhatsApp' : 'Instagram'}
        {route.bsp ? ` · ${route.bsp}` : ''}
      </p>

      <RouteAssembler routeId={id} routeSteps={routeSteps} allSteps={candidatos} />
    </div>
  )
}
