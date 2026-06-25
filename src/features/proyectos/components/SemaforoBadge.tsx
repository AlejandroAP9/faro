import type { Semaforo } from '../types'

const STYLES: Record<Semaforo, { dot: string; text: string; label: string }> = {
  verde: { dot: 'bg-green-500', text: 'text-green-700 bg-green-50', label: 'Riesgo bajo' },
  amarillo: { dot: 'bg-yellow-500', text: 'text-yellow-800 bg-yellow-50', label: 'Riesgo medio' },
  rojo: { dot: 'bg-red-500', text: 'text-red-700 bg-red-50', label: 'Riesgo alto' },
}

export function SemaforoBadge({ value }: { value: Semaforo | null }) {
  if (!value) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500">
        <span className="h-2 w-2 rounded-full bg-gray-300" />
        Sin evaluar
      </span>
    )
  }
  const s = STYLES[value]
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${s.text}`}>
      <span className={`h-2 w-2 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  )
}
