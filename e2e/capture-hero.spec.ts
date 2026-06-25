import { test } from '@playwright/test'
import path from 'node:path'

// Captura de portada para el README: el wizard mostrando instrucción + trampa +
// comportamiento a evitar (la firma del producto). No es parte de la suite de QA.
const password = 'Test1234!'

test('capture: wizard hero', async ({ page }) => {
  await page.setViewportSize({ width: 1100, height: 1400 })
  const mail = `pista-hero-${Date.now()}@example.com`

  await page.goto('/signup')
  await page.fill('#email', mail)
  await page.fill('#password', password)
  await page.getByRole('button', { name: 'Create Account' }).click()
  await page.waitForURL(/\/(check-email|dashboard)/, { timeout: 15_000 })

  await page.goto('/proyectos/nuevo')
  await page.fill('#cliente_nombre', 'Pizzería Don Pepe')
  await page.fill('#pais', 'Chile')
  await page.fill('#bsp_candidato', 'YCloud')
  await page.getByRole('button', { name: 'Crear proyecto' }).click()
  await page.waitForURL(/\/proyectos\/[0-9a-f-]+$/, { timeout: 15_000 })

  await page.locator('input[name="restriccion_previa"][value="no"]').check()
  await page.locator('input[name="numero_usado"][value="no"]').check()
  await page.locator('input[name="doc_empresarial"][value="si"]').check()
  await page.locator('input[name="historial_automatizacion"][value="no"]').check()
  await page.locator('input[name="antiguedad_cuenta"][value="establecida"]').check()
  await page.getByRole('button', { name: 'Calcular riesgo y generar ruta' }).click()

  await page.getByText('Resultado del diagnóstico').waitFor({ timeout: 15_000 })
  await page.getByText('⚠ La trampa:').first().waitFor({ timeout: 10_000 })
  await page.screenshot({ path: path.join('public', 'pista-wizard.png'), fullPage: true })
})
