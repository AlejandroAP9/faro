import Link from 'next/link'
import Image from 'next/image'
import { signout } from '@/actions/auth'
import { createClient } from '@/lib/supabase/server'
import { isEditorEmail } from '@/lib/auth/editor'

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const editor = isEditorEmail(user?.email)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-gray-900">
              <Image src="/faro-icon.png" alt="Faro" width={28} height={28} className="rounded-md" priority />
              Faro
            </Link>
            {editor && (
              <Link href="/admin/conocimiento" className="text-sm text-gray-500 hover:text-gray-900">
                Conocimiento
              </Link>
            )}
          </div>
          <form action={signout}>
            <button type="submit" className="text-sm text-gray-500 hover:text-gray-900">
              Cerrar sesión
            </button>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
    </div>
  )
}
