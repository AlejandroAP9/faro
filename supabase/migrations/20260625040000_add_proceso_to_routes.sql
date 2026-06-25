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
