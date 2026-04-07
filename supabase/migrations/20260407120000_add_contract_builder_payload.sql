alter table public.contratos
add column if not exists builder_payload jsonb;
