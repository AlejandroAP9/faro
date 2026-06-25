-- El conocimiento de activación es país-específico (documentos, organismos,
-- trámites). Una ruta puede aplicar a un país concreto o ser genérica (null).

alter table public.routes add column pais text;

create index idx_routes_match on public.routes(canal, rama, pais);
