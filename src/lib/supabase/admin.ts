import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

/**
 * Cliente admin con SERVICE_ROLE_KEY. Bypassa RLS — USAR SOLO server-side
 * y SOLO tras verificar autorizacion a mano (ver requireEditor).
 * Nunca exponer al cliente.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    throw new Error(
      'Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY para el cliente admin.'
    )
  }

  return createClient<Database>(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
