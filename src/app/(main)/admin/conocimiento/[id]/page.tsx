import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getStep } from '@/features/conocimiento/services/admin-actions'
import { StepForm } from '@/features/conocimiento/components'

export default async function EditarPasoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const step = await getStep(id)
  if (!step) notFound()

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/admin/conocimiento" className="text-sm text-gray-500 hover:text-gray-900">← Volver</Link>
      <h1 className="mt-3 mb-6 text-2xl font-bold text-gray-900">Editar Paso</h1>
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <StepForm step={step} />
      </div>
    </div>
  )
}
