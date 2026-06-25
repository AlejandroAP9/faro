import { redirect } from 'next/navigation'

export default function Home() {
  // El proxy rebota /dashboard a /login si no hay sesión.
  redirect('/dashboard')
}
