import { defineConfig, devices } from '@playwright/test'

// La app dev del usuario corre en 3001 (3000 lo ocupa otro proyecto).
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3001'

export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: BASE_URL,
    headless: true,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
})
