import Link from 'next/link'
import { NewProjectForm } from '@/features/proyectos/components'

export default function NuevoProyectoPage() {
  return (
    <div className="mx-auto max-w-xl">
      <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-900">
        ← Volver
      </Link>
      <h1 className="mt-3 text-2xl font-bold text-gray-900">Nuevo proyecto</h1>
      <p className="mt-1 mb-6 text-sm text-gray-500">
        Datos del cliente y del canal. Después corremos el diagnóstico de riesgo.
      </p>
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <NewProjectForm />
      </div>
    </div>
  )
}
