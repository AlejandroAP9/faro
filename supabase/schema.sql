-- Esquema completo de Faro (equivale a aplicar todas las migraciones en orden).
-- Pega TODO este archivo en el SQL Editor de Supabase y dale Run.
-- Luego, opcional: pega supabase/seed.sql para tener contenido de ejemplo.

-- ============================================================
-- 20260624224738_create_profiles_with_rls_and_trigger.sql
-- ============================================================
-- Tabla profiles (extiende auth.users) + RLS + trigger de alta automática.

create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  avatar_url text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- 20260624225036_knowledge_domain_steps_routes_playbooks.sql
-- ============================================================
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

-- ============================================================
-- 20260624225059_implementer_domain_projects_progress_reports.sql
-- ============================================================
-- Dominio del implementador (privado por owner) + trigger del contador de reportes.

create type semaforo as enum ('verde', 'amarillo', 'rojo');
create type project_estado as enum ('diagnostico', 'en_ruta', 'rescate', 'produccion', 'abandonado');
create type progress_estado as enum ('pendiente', 'hecho', 'desvio');
create type report_tipo as enum ('cambio', 'no_funciona');

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  cliente_nombre text not null,
  canal canal not null,
  pais text,
  bsp_candidato text,
  tipo_negocio text,
  semaforo_riesgo semaforo,
  diagnostico_respuestas jsonb,
  route_id uuid references public.routes(id) on delete set null,
  estado project_estado default 'diagnostico' not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create table public.project_progress (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  step_id uuid not null references public.knowledge_steps(id) on delete cascade,
  estado progress_estado default 'pendiente' not null,
  marcado_at timestamptz,
  unique (project_id, step_id)
);

create table public.deviation_reports (
  id uuid primary key default gen_random_uuid(),
  step_id uuid not null references public.knowledge_steps(id) on delete cascade,
  reporter_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  tipo report_tipo not null,
  comentario text,
  created_at timestamptz default now() not null
);

alter table public.projects enable row level security;
alter table public.project_progress enable row level security;
alter table public.deviation_reports enable row level security;

create policy "Owner ve sus proyectos"
  on public.projects for select to authenticated using (owner_id = auth.uid());
create policy "Owner crea proyectos"
  on public.projects for insert to authenticated with check (owner_id = auth.uid());
create policy "Owner edita sus proyectos"
  on public.projects for update to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "Owner borra sus proyectos"
  on public.projects for delete to authenticated using (owner_id = auth.uid());

create policy "Owner ve su progreso"
  on public.project_progress for select to authenticated
  using (exists (select 1 from public.projects p where p.id = project_id and p.owner_id = auth.uid()));
create policy "Owner inserta progreso"
  on public.project_progress for insert to authenticated
  with check (exists (select 1 from public.projects p where p.id = project_id and p.owner_id = auth.uid()));
create policy "Owner actualiza progreso"
  on public.project_progress for update to authenticated
  using (exists (select 1 from public.projects p where p.id = project_id and p.owner_id = auth.uid()));

create policy "Autenticado reporta desvio"
  on public.deviation_reports for insert to authenticated with check (reporter_id = auth.uid());
create policy "Reporter ve sus reportes"
  on public.deviation_reports for select to authenticated using (reporter_id = auth.uid());

create or replace function public.bump_deviation_counter()
returns trigger as $$
begin
  update public.knowledge_steps
    set reportes_de_desvio_activos = reportes_de_desvio_activos + 1
    where id = new.step_id;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_deviation_report
  after insert on public.deviation_reports
  for each row execute procedure public.bump_deviation_counter();

create index idx_projects_owner on public.projects(owner_id);
create index idx_progress_project on public.project_progress(project_id);
create index idx_reports_step on public.deviation_reports(step_id);

-- ============================================================
-- 20260624225136_harden_trigger_functions_revoke_execute.sql
-- ============================================================
-- Las funciones de trigger no deben ser invocables como RPC. Revocar EXECUTE.
-- Los triggers siguen disparando (no dependen de EXECUTE del rol que hace el insert).

revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.bump_deviation_counter() from public, anon, authenticated;

-- ============================================================
-- 20260625000659_deviation_reports_unique_per_reporter.sql
-- ============================================================
-- Anti-abuso: un reporte por (Paso, reportante). El contador pasa a reflejar
-- reportantes DISTINTOS, no inserciones crudas (que un solo usuario podía spamear).

alter table public.deviation_reports
  add constraint uq_deviation_step_reporter unique (step_id, reporter_id);

-- ============================================================
-- 20260625030000_add_pais_to_routes.sql
-- ============================================================
-- El conocimiento de activación es país-específico (documentos, organismos,
-- trámites). Una ruta puede aplicar a un país concreto o ser genérica (null).

alter table public.routes add column pais text;

create index idx_routes_match on public.routes(canal, rama, pais);

-- ============================================================
-- 20260625040000_add_proceso_to_routes.sql
-- ============================================================
-- Meta tiene DOS procesos distintos que no deben mezclarse:
--  - activacion_numero: llevar un número de WhatsApp/IG a producción (core de Faro).
--  - verificacion_portafolio: verificar el Business Portfolio (sube límites/badge).

create type proceso_meta as enum ('activacion_numero', 'verificacion_portafolio');

alter table public.routes
  add column proceso proceso_meta not null default 'activacion_numero';

-- La ruta de verificación de negocio es un proceso aparte, no activación.
update public.routes
  set proceso = 'verificacion_portafolio'
  where rama = 'verif_alternativa';

drop index if exists idx_routes_match;
create index idx_routes_match on public.routes(proceso, canal, rama, pais);

