# AGENTS.md — Faro

Contexto para agentes de IA (Claude Code, Cursor, Codex, etc.) que trabajen en este repo.
Léelo antes de tocar código. Para Claude Code, puedes copiarlo a `CLAUDE.md` localmente.

## Qué es Faro

Onboarding guiado para activar cuentas de WhatsApp/Instagram Business **sin bloqueos de Meta**,
para implementadores de agentes conversacionales (Perfil A: freelance técnico).

No es un constructor de bots: es un **wizard de activación + blindaje + modo rescate**. Convierte
un proceso opaco e irreproducible en uno confiable. El valor es **certeza**, no eficiencia.

## ⚠️ La distinción que NUNCA se mezcla

Meta tiene DOS procesos distintos. Faro los modela con el campo `routes.proceso`:

1. **`activacion_numero`** — llevar un número a producción (portfolio → cuentas → WhatsApp →
   número → BSP → WABA → display name → calentamiento). **Es el core de Faro.** El diagnóstico
   asigna SOLO rutas de este proceso.
2. **`verificacion_portafolio`** — verificar el Business Portfolio (documentos, SII/NIC, etc.).
   Es OPCIONAL, sube límites de mensajería. Proceso **aparte**; no lo asigna el diagnóstico.

Nunca pongas Pasos de verificación bajo una ruta de activación ni viceversa.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind **3.4** · Supabase (Auth + Postgres + RLS) · Zod · Playwright.

> Tailwind es **v3**: `globals.css` usa `@tailwind base/components/utilities`, NO `@import "tailwindcss"` (sintaxis v4).

## Arquitectura

Feature-First en `src/features/`: `auth`, `proyectos`, `conocimiento`, `diagnostico`, `wizard`.
Única dependencia cruzada permitida: `wizard → conocimiento` (consumidor → dominio). Sin ciclos.

### Modelo de datos (dos dominios)

- **Conocimiento (global):** `knowledge_steps` (el Paso atómico reutilizable, con `trampa` y
  `comportamiento_a_evitar`), `routes` (proceso · canal · rama · país · bsp), `route_steps`
  (ensamblado ordenado), `rescue_playbooks`. **Lectura para autenticados; escritura SOLO service role.**
- **Implementador (privado por owner, RLS fail-closed):** `projects`, `project_progress`,
  `deviation_reports` (red colectiva: botón "esto cambió" → contador en el Paso).

### Flujo del producto

`diagnostico` (cuestionario → semáforo verde/amarillo/rojo + asigna ruta de **activación**,
priorizando país+rama vía `pickRoute`) → `wizard` (Paso a paso con la trampa visible, checkpoint,
calentamiento) → `rescate` (playbook por tipo de restricción).

### Backend editorial

`/admin/conocimiento` (solo editores). Gateado por `requireEditor()` (allowlist por email en
`FARO_EDITOR_EMAILS`, **fail-closed**). Usa el cliente admin (`SUPABASE_SERVICE_ROLE_KEY`), que vive
SOLO server-side en `src/lib/supabase/admin.ts` y nunca se importa en componentes cliente.

## Reglas duras (seguridad)

- `SUPABASE_SERVICE_ROLE_KEY` jamás al cliente; solo tras `requireEditor()`.
- Server actions derivan el `user_id` de la sesión verificada, nunca del body.
- RLS activado en toda tabla; el WITH CHECK de `projects` congela `owner_id`.
- Validá toda entrada con Zod.

## Convenciones

- Español neutral tuteado. Sin em dashes en texto de cara al usuario.
- Cada feature: `components/ services/ types/` (y `hooks/ store/` si hace falta).
- Migraciones en `supabase/migrations/`; tipos en `src/types/supabase.ts` (regenerar tras cambios de esquema).
- Contenido de ejemplo en `supabase/seed.sql` (ilustrativo, NO instrucciones verificadas de Meta).

## Cómo correr

```bash
npm install                 # NO npm ci (sharp trae deps opcionales por-plataforma)
npm run dev                 # http://localhost:3000  (en este equipo corre en 3001)
npm run typecheck && npm run build
npx playwright test         # E2E (requiere dev server + Supabase)
```

Env en `.env.local` (ver `.env.example`): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
`SUPABASE_SERVICE_ROLE_KEY` (server-only), `NEXT_PUBLIC_SITE_URL`, `FARO_EDITOR_EMAILS`.

## Gotchas (aprendidos a la mala)

- **`npm ci` falla en CI** por el lockfile cross-platform de sharp → el CI usa `npm install`.
- **`next lint` no existe en Next 16**; el lint quedó como `typecheck` (`tsc --noEmit`).
- El `service role` no se puede leer por MCP; se pega a mano desde el dashboard.
- "Confirm email" se desactiva en Supabase para testing sin SMTP.

## Filosofía de contenido

El conocimiento ES el producto. Cada Paso captura la **trampa** real (nombre de botón que cambió,
documento que no calza, decisión que bloquea). El contenido es **país-específico**: una cuenta
chilena recibe la ruta chilena. La curaduría se mantiene viva con los reportes de la red colectiva.
