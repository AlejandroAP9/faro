import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

function editorEmails(): string[] {
  return (process.env.PISTA_EDITOR_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
}

/** True si el email pertenece a la allowlist de editores. */
export function isEditorEmail(email: string | null | undefined): boolean {
  if (!email) return false
  return editorEmails().includes(email.toLowerCase())
}

/**
 * Verifica que el usuario logueado sea editor. Si no hay sesion → /login.
 * Si hay sesion pero no es editor → /dashboard. Devuelve el user.
 * Fail-closed: sin PISTA_EDITOR_EMAILS configurado, nadie es editor.
 */
export async function requireEditor() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  if (!isEditorEmail(user.email)) redirect('/dashboard')
  return { user }
}
