import { test, expect } from '@playwright/test'
import path from 'node:path'

// E2E del flujo del implementador: signup → crear proyecto → diagnóstico →
// wizard completo → producción. Corre contra el dev server real + Supabase real.
// Crea un usuario throwaway por corrida (confirm email está desactivado).

const SHOTS = path.join('.qa-reports', 'pista-e2e', 'screenshots')
const email = `pista-e2e-${Date.now()}@example.com`
const password = 'Test1234!'

test('flujo completo: signup → proyecto → diagnóstico → wizard → producción', async ({ page }) => {
  // 1) Signup
  await page.goto('/signup')
  await page.fill('#email', email)
  await page.fill('#password', password)
  await page.screenshot({ path: path.join(SHOTS, '01-signup.png') })
  await page.getByRole('button', { name: 'Create Account' }).click()

  // Con confirm-email off, la sesión queda creada aunque la acción mande a /check-email.
  await page.waitForURL(/\/(check-email|dashboard)/, { timeout: 15_000 })

  // 2) Dashboard
  await page.goto('/dashboard')
  await expect(page.getByRole('heading', { name: 'Tus proyectos' })).toBeVisible()
  await page.screenshot({ path: path.join(SHOTS, '02-dashboard-vacio.png') })

  // 3) Crear proyecto
  await page.goto('/proyectos/nuevo')
  await page.fill('#cliente_nombre', 'Cliente E2E')
  await page.selectOption('#canal', 'whatsapp')
  await page.fill('#pais', 'Chile')
  await page.getByRole('button', { name: 'Crear proyecto' }).click()
  await page.waitForURL(/\/proyectos\/[0-9a-f-]+$/, { timeout: 15_000 })
  await expect(page.getByRole('heading', { name: 'Cliente E2E' })).toBeVisible()
  await page.screenshot({ path: path.join(SHOTS, '03-proyecto-creado.png') })

  // 4) Diagnóstico: respuestas "todo limpio" → verde + ruta estándar
  await expect(page.getByText('Diagnóstico de riesgo')).toBeVisible()
  await page.locator('input[name="restriccion_previa"][value="no"]').check()
  await page.locator('input[name="numero_usado"][value="no"]').check()
  await page.locator('input[name="doc_empresarial"][value="si"]').check()
  await page.locator('input[name="historial_automatizacion"][value="no"]').check()
  await page.locator('input[name="antiguedad_cuenta"][value="establecida"]').check()
  await page.screenshot({ path: path.join(SHOTS, '04-diagnostico-lleno.png') })
  await page.getByRole('button', { name: 'Calcular riesgo y generar ruta' }).click()

  // 5) Wizard (en_ruta)
  await expect(page.getByText('Resultado del diagnóstico')).toBeVisible({ timeout: 15_000 })
  await expect(page.getByText(/\d+\/6/)).toBeVisible()
  await page.screenshot({ path: path.join(SHOTS, '05-wizard-inicio.png') })

  // 6) Completar los 6 pasos
  for (let i = 0; i < 8; i++) {
    const checkpoint = page.getByText('Checkpoint pre-producción')
    if (await checkpoint.isVisible().catch(() => false)) break
    const btn = page.getByRole('button', { name: 'Marcar como hecho' }).first()
    await expect(btn).toBeVisible({ timeout: 10_000 })
    await btn.click()
    // Esperar el refresh del server component (avanza el progreso).
    await page.waitForTimeout(900)
  }

  // 7) Checkpoint + producción
  await expect(page.getByText('Checkpoint pre-producción')).toBeVisible({ timeout: 15_000 })
  await page.screenshot({ path: path.join(SHOTS, '06-checkpoint.png') })
  await page.getByRole('button', { name: 'Marcar en producción' }).click()

  await expect(page.getByText(/En producción/)).toBeVisible({ timeout: 15_000 })
  await page.screenshot({ path: path.join(SHOTS, '07-produccion.png') })
})

test('rescate: un proyecto bloqueado muestra el playbook del tipo elegido', async ({ page }) => {
  // Reusar sesión nueva + proyecto rápido hasta en_ruta, luego entrar a rescate.
  const mail = `pista-e2e-rescate-${Date.now()}@example.com`
  await page.goto('/signup')
  await page.fill('#email', mail)
  await page.fill('#password', password)
  await page.getByRole('button', { name: 'Create Account' }).click()
  await page.waitForURL(/\/(check-email|dashboard)/, { timeout: 15_000 })

  await page.goto('/proyectos/nuevo')
  await page.fill('#cliente_nombre', 'Cliente Rescate')
  await page.getByRole('button', { name: 'Crear proyecto' }).click()
  await page.waitForURL(/\/proyectos\/[0-9a-f-]+$/, { timeout: 15_000 })

  // Diagnóstico mínimo (todo limpio) para llegar a en_ruta
  await page.locator('input[name="restriccion_previa"][value="no"]').check()
  await page.locator('input[name="numero_usado"][value="no"]').check()
  await page.locator('input[name="doc_empresarial"][value="si"]').check()
  await page.locator('input[name="historial_automatizacion"][value="no"]').check()
  await page.locator('input[name="antiguedad_cuenta"][value="establecida"]').check()
  await page.getByRole('button', { name: 'Calcular riesgo y generar ruta' }).click()
  await expect(page.getByText('Resultado del diagnóstico')).toBeVisible({ timeout: 15_000 })

  // Entrar a rescate
  await page.getByRole('button', { name: /modo rescate/ }).click()
  await expect(page.getByRole('heading', { name: 'Modo rescate' })).toBeVisible({ timeout: 15_000 })

  // Elegir tipo Integridad → debe mostrar el playbook seed
  await page.getByRole('button', { name: 'Integridad' }).click()
  await expect(page.getByText('Cómo redactar la apelación')).toBeVisible({ timeout: 10_000 })
  await page.screenshot({ path: path.join(SHOTS, '08-rescate.png') })
})
