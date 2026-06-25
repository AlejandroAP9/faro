import Link from 'next/link'
import { listSteps } from '@/features/conocimiento/services/admin-actions'
import { StepsCurationTable } from '@/features/conocimiento/components'

export default async function ConocimientoPage() {
  const steps = await listSteps()
  const reportados = steps.filter((s) => s.reportes_de_desvio_activos > 0).length

  return (
    <div>
      <div className="mb-1 flex items-center gap-4 text-sm">
        <span className="font-semibold text-gray-900">Pasos</span>
        <Link href="/admin/conocimiento/rutas" className="text-gray-500 hover:text-gray-900">Rutas</Link>
        <Link href="/admin/conocimiento/rescate" className="text-gray-500 hover:text-gray-900">Rescate</Link>
      </div>

      <div className="mb-6 mt-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Curaduría de conocimiento</h1>
          <p className="mt-1 text-sm text-gray-500">
            {steps.length} Pasos · {reportados > 0
              ? <span className="font-medium text-red-600">{reportados} con reportes activos</span>
              : 'sin reportes pendientes'}. Ordenados por urgencia de revisión.
          </p>
        </div>
        <Link href="/admin/conocimiento/nuevo"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          Nuevo Paso
        </Link>
      </div>

      <StepsCurationTable steps={steps} />
    </div>
  )
}
