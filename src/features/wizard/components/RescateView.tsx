'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { setProjectEstado } from '../services/actions'
import { TIPOS_RESTRICCION, TIPO_RESTRICCION_LABELS } from '@/features/conocimiento/types'
import type { RescuePlaybook, TipoRestriccion } from '@/features/conocimiento/types'

export function RescateView({
  projectId,
  playbooks,
}: {
  projectId: string
  playbooks: RescuePlaybook[]
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [tipo, setTipo] = useState<TipoRestriccion | ''>('')

  const playbook = playbooks.find((p) => p.tipo_restriccion === tipo)

  function run(fn: () => Promise<{ error?: string }>) {
    startTransition(async () => {
      const r = await fn()
      if (r?.error) alert(r.error)
      else router.refresh()
    })
  }

  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <h2 className="text-base font-semibold text-red-900">Modo rescate</h2>
        <p className="mt-1 text-sm text-red-800">
          Identifica el tipo de restricción para ver el guion: qué presentar, cómo apelar y cuánto esperar.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Tipo de restricción</label>
        <div className="mt-2 flex flex-wrap gap-2">
          {TIPOS_RESTRICCION.map((t) => (
            <button key={t.value} onClick={() => setTipo(t.value)}
              className={`rounded-full border px-3 py-1 text-sm ${
                tipo === t.value ? 'border-red-400 bg-red-600 text-white' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
              }`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {tipo && !playbook && (
        <p className="text-sm text-gray-500">
          No hay playbook cargado para {TIPO_RESTRICCION_LABELS[tipo]} todavía.
        </p>
      )}

      {playbook && (
        <div className="space-y-3 rounded-lg border border-gray-200 bg-white p-5 text-sm">
          <Field titulo="Diagnóstico" valor={playbook.diagnostico} />
          <Field titulo="Documentación a presentar" valor={playbook.documentacion_a_presentar} />
          <Field titulo="Cómo redactar la apelación" valor={playbook.plantilla_apelacion} />
          <Field titulo="Tiempo de espera" valor={playbook.tiempo_espera} />
          <Field titulo="Cuándo declarar irrecuperable" valor={playbook.criterio_irrecuperable} />
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 border-t border-gray-200 pt-4">
        <button onClick={() => run(() => setProjectEstado(projectId, 'en_ruta'))} disabled={isPending}
          className="text-sm font-medium text-blue-600 hover:underline disabled:opacity-50">
          ← Volver al wizard
        </button>
        <button onClick={() => run(() => setProjectEstado(projectId, 'produccion'))} disabled={isPending}
          className="text-sm font-medium text-green-700 hover:underline disabled:opacity-50">
          Se recuperó → producción
        </button>
        <button
          onClick={() => { if (confirm('¿Declarar la cuenta irrecuperable?')) run(() => setProjectEstado(projectId, 'abandonado')) }}
          disabled={isPending}
          className="text-sm font-medium text-gray-500 hover:text-red-600 disabled:opacity-50">
          Declarar irrecuperable
        </button>
      </div>
    </div>
  )
}

function Field({ titulo, valor }: { titulo: string; valor: string | null }) {
  if (!valor) return null
  return (
    <div>
      <h4 className="font-semibold text-gray-900">{titulo}</h4>
      <p className="mt-0.5 whitespace-pre-line text-gray-700">{valor}</p>
    </div>
  )
}
