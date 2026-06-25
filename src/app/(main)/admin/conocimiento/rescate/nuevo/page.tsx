import Link from 'next/link'
import { requireEditor } from '@/lib/auth/editor'
import { PlaybookForm } from '@/features/conocimiento/components'

export default async function NuevoPlaybookPage() {
  await requireEditor()
  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/admin/conocimiento/rescate" className="text-sm text-gray-500 hover:text-gray-900">← Volver</Link>
      <h1 className="mt-3 mb-6 text-2xl font-bold text-gray-900">Nuevo playbook de rescate</h1>
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <PlaybookForm />
      </div>
    </div>
  )
}
