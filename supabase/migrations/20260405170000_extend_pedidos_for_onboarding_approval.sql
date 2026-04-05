alter table public.pedidos
  add column if not exists titulo text,
  add column if not exists descricao text,
  add column if not exists observacoes text;

update public.pedidos
set titulo = coalesce(nullif(btrim(titulo), ''), tipo)
where titulo is null
   or btrim(titulo) = '';
