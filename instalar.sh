#!/usr/bin/env bash
#
# 🔦 Instalador de Faro
# Automatiza lo que se puede (requisitos, dependencias, .env.local) y te guía,
# paso a paso, en lo que no se puede automatizar (crear el proyecto Supabase,
# cargar el esquema y configurar el login). Seguro de correr varias veces.
#
# Uso:  bash instalar.sh
#
set -euo pipefail

bold=$(printf '\033[1m'); green=$(printf '\033[32m'); yellow=$(printf '\033[33m')
red=$(printf '\033[31m'); blue=$(printf '\033[34m'); reset=$(printf '\033[0m')
ok()   { echo "${green}✓${reset} $1"; }
warn() { echo "${yellow}!${reset} $1"; }
err()  { echo "${red}✗${reset} $1" >&2; }
step() { echo; echo "${bold}${blue}$1${reset}"; }

echo "${bold}🔦 Instalador de Faro${reset}"
echo "Guía: clonar ya lo hiciste. Ahora: requisitos, dependencias, entorno y arranque."

# --- 0. Estamos en el repo correcto? ---
if [ ! -f package.json ] || [ ! -f supabase/schema.sql ]; then
  err "No parece la raíz del repo de Faro (falta package.json o supabase/schema.sql)."
  err "Entra a la carpeta del proyecto y vuelve a correr: cd faro && bash instalar.sh"
  exit 1
fi

# --- 1. Requisitos ---
step "1) Requisitos"
if ! command -v node >/dev/null 2>&1; then
  err "Node.js no está instalado. Instálalo desde https://nodejs.org (v20 o superior)."; exit 1
fi
NODE_MAJOR=$(node -v | sed 's/v\([0-9]*\).*/\1/')
if [ "$NODE_MAJOR" -lt 20 ]; then
  err "Tienes Node $(node -v); Faro necesita v20 o superior."; exit 1
fi
ok "Node $(node -v)"
command -v npm >/dev/null 2>&1 && ok "npm $(npm -v)" || { err "npm no encontrado."; exit 1; }

# --- 2. Dependencias ---
step "2) Instalando dependencias (npm install)"
npm install
ok "Dependencias instaladas"

# --- 3. Variables de entorno ---
step "3) Variables de entorno (.env.local)"
if [ -f .env.local ]; then
  warn ".env.local ya existe."
  read -rp "¿Sobrescribirlo? (s/N): " OW
  [ "${OW:-}" = "s" ] || [ "${OW:-}" = "S" ] || { ok "Lo dejo como está."; SKIP_ENV=1; }
fi

if [ "${SKIP_ENV:-0}" != "1" ]; then
  echo "Pega tus datos de Supabase (Project Settings → API). Enter para dejar en blanco y completarlo después."
  read -rp "  Project URL: " SUPA_URL
  read -rp "  anon public key: " SUPA_ANON
  read -rp "  service_role key (secreta): " SUPA_SERVICE
  read -rp "  Tu email (editor del conocimiento): " EDITOR_EMAIL
  read -rp "  Site URL [http://localhost:3000]: " SITE_URL
  SITE_URL=${SITE_URL:-http://localhost:3000}

  cat > .env.local <<EOF
# Generado por instalar.sh. NO committear (está gitignored).
NEXT_PUBLIC_SUPABASE_URL=${SUPA_URL}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${SUPA_ANON}
SUPABASE_SERVICE_ROLE_KEY=${SUPA_SERVICE}
NEXT_PUBLIC_SITE_URL=${SITE_URL}
FARO_EDITOR_EMAILS=${EDITOR_EMAIL}
EOF
  ok ".env.local creado"
fi

# --- 4. Esquema: ayuda a pegarlo ---
step "4) Cargar el esquema en Supabase (manual, pero te lo dejo listo)"
echo "Tienes que pegar ${bold}supabase/schema.sql${reset} en el SQL Editor de tu proyecto Supabase y darle Run."
if command -v pbcopy >/dev/null 2>&1; then
  read -rp "¿Copio supabase/schema.sql al portapapeles ahora? (S/n): " CP
  if [ "${CP:-S}" != "n" ] && [ "${CP:-S}" != "N" ]; then
    pbcopy < supabase/schema.sql && ok "Copiado. Pégalo en Supabase → SQL Editor → New query → Run."
  fi
elif command -v xclip >/dev/null 2>&1; then
  read -rp "¿Copio supabase/schema.sql al portapapeles ahora? (S/n): " CP
  if [ "${CP:-S}" != "n" ] && [ "${CP:-S}" != "N" ]; then
    xclip -selection clipboard < supabase/schema.sql && ok "Copiado al portapapeles."
  fi
else
  echo "Abre el archivo, copia todo y pégalo en Supabase → SQL Editor."
fi
echo "Opcional: repite con ${bold}supabase/seed.sql${reset} para tener contenido de ejemplo."

# --- 5. Pasos finales que quedan en tu mano ---
step "5) Lo que falta (en el dashboard de Supabase)"
cat <<'EOF'
  a) Crea el proyecto Supabase (si aún no) y pega el schema del paso 4.
  b) Authentication → URL Configuration:
       Site URL:      http://localhost:3000
       Redirect URLs: http://localhost:3000/**
  c) Authentication → Providers → Email: desactiva "Confirm email" (para probar sin SMTP).
  d) Regístrate con el MISMO email que pusiste en FARO_EDITOR_EMAILS para entrar como editor.
EOF

step "Listo 🎉  Para arrancar:"
echo "  ${bold}npm run dev${reset}   →  http://localhost:3000  (o 3001 si el puerto está ocupado)"
echo
echo "¿Cómo funciona Faro? → docs/COMO-FUNCIONA.md  (no usa IA, no se conecta a Meta)."
