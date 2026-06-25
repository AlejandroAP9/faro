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
