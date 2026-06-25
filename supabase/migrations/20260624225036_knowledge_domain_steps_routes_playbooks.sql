-- Dominio de conocimiento (global): Pasos atómicos, rutas, ensamblado, playbooks.
-- Lectura para autenticados; escritura SOLO service role (sin policies de write).

create type canal as enum ('whatsapp', 'instagram');
create type rama as enum ('estandar', 'rehabilitacion', 'verif_alternativa', 'por_bsp');
create type estado_editorial as enum ('borrador', 'propuesto', 'aprobado');
create type tipo_restriccion as enum ('integridad', 'verificacion', 'comportamiento');

create table public.knowledge_steps (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  titulo text not null,
  instruccion text not null,
  nombre_actual_boton text,
  trampa text,
  comportamiento_a_evitar text,
  canal canal not null,
  fecha_ultima_verificacion timestamptz default now() not null,
  reportes_de_desvio_activos int default 0 not null,
  estado_editorial estado_editorial default 'borrador' not null,
  autor uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create table public.routes (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  rama rama not null,
  canal canal not null,
  bsp text,
  created_at timestamptz default now() not null
);

create table public.route_steps (
  id uuid primary key default gen_random_uuid(),
  route_id uuid not null references public.routes(id) on delete cascade,
  step_id uuid not null references public.knowledge_steps(id) on delete cascade,
  orden int not null,
  unique (route_id, orden),
  unique (route_id, step_id)
);

create table public.rescue_playbooks (
  id uuid primary key default gen_random_uuid(),
  tipo_restriccion tipo_restriccion not null,
  diagnostico text not null,
  documentacion_a_presentar text,
  plantilla_apelacion text,
  tiempo_espera text,
  criterio_irrecuperable text,
  created_at timestamptz default now() not null
);

alter table public.knowledge_steps enable row level security;
alter table public.routes enable row level security;
alter table public.route_steps enable row level security;
alter table public.rescue_playbooks enable row level security;

create policy "Conocimiento legible por autenticados"
  on public.knowledge_steps for select to authenticated using (true);
create policy "Rutas legibles por autenticados"
  on public.routes for select to authenticated using (true);
create policy "Route_steps legibles por autenticados"
  on public.route_steps for select to authenticated using (true);
create policy "Playbooks legibles por autenticados"
  on public.rescue_playbooks for select to authenticated using (true);

create index idx_route_steps_route on public.route_steps(route_id, orden);
create index idx_knowledge_steps_canal on public.knowledge_steps(canal);
