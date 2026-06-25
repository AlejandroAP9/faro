# Instalar Faro

Guía paso a paso para clonar Faro y dejarlo corriendo en tu computador. Toma 10 a 15 minutos.
No necesitas saber de bases de datos: solo copiar, pegar y rellenar.

> ¿Qué es Faro y cómo funciona? Lee [docs/COMO-FUNCIONA.md](docs/COMO-FUNCIONA.md).
> Resumen: no usa IA, no se conecta a Meta, es una guía que tú ejecutas a mano.

## Lo que vas a necesitar

- **Node.js 20 o superior** (comprueba con `node -v`). Descárgalo en https://nodejs.org
- **git**
- Una cuenta **gratis** en https://supabase.com

## 1. Clonar e instalar

```bash
git clone https://github.com/AlejandroAP9/faro.git
cd faro
npm install
```

> Usa `npm install`, no `npm ci`.

## 2. Crear tu proyecto en Supabase

1. Entra a https://supabase.com y crea un proyecto nuevo (plan **Free**).
2. Espera a que termine de crearse (un par de minutos).
3. Ve a **Project Settings → API** y deja a mano estos tres valores:
   - **Project URL**
   - **anon public** key
   - **service_role** key (es secreta, no la compartas)

## 3. Cargar el esquema (crear las tablas)

**Opción A, la fácil (sin instalar nada):**
1. En el dashboard de Supabase, abre **SQL Editor → New query**.
2. Copia TODO el contenido del archivo **`supabase/schema.sql`** del repo y pégalo.
3. Dale **Run**. Listo, quedan creadas las 8 tablas con su seguridad (RLS).
4. *(Opcional)* Repite con **`supabase/seed.sql`** para arrancar con contenido de ejemplo.

**Opción B, con la Supabase CLI:**
```bash
supabase link --project-ref TU_PROJECT_REF
supabase db push
```

## 4. Variables de entorno

```bash
cp .env.example .env.local
```

Abre `.env.local` y rellena con lo que anotaste en el paso 2:

```
NEXT_PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
FARO_EDITOR_EMAILS=tu-correo@ejemplo.com
```

> `FARO_EDITOR_EMAILS` son los correos que pueden **editar el conocimiento** en `/admin`.
> Pon el tuyo ahí para ser editor.

## 5. Configurar el login en Supabase

En el dashboard → **Authentication**:

- **URL Configuration**: Site URL = `http://localhost:3000` · Redirect URLs = `http://localhost:3000/**`
- **Providers → Email**: desactiva **"Confirm email"** (así pruebas sin configurar correos).

## 6. Correr

```bash
npm run dev
```

Abre **http://localhost:3000** (si el puerto 3000 está ocupado, Next usa el 3001; míralo en la consola).

Regístrate con el **mismo correo** que pusiste en `FARO_EDITOR_EMAILS` para entrar como editor y ver `/admin/conocimiento`, donde cargas los Pasos.

## 7. (Opcional) Subir a Vercel

1. Sube tu copia a tu propio GitHub.
2. En https://vercel.com/new importa el repo.
3. Carga las **mismas variables de entorno** del paso 4.
4. Deploy. Después actualiza en Supabase la Site URL y las Redirect URLs con tu dominio de Vercel.

## Problemas comunes

- **El puerto 3000 está ocupado**: Next salta solo al 3001. Revisa la consola para ver la URL.
- **No encuentro la service_role key**: está en Project Settings → API, sección "Project API keys".
- **No veo `/admin`**: tu correo debe estar en `FARO_EDITOR_EMAILS`, y si lo editaste con el server corriendo, reinícialo (`Ctrl+C` y `npm run dev`).
- **`npm ci` falla**: usa `npm install`. Es por dependencias opcionales por-plataforma de `sharp`, no por tu setup.
- **El signup pide confirmar correo**: desactiva "Confirm email" (paso 5) o revisa tu bandeja.
