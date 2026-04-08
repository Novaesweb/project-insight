alter table public.contratos
add column if not exists archived_at timestamptz,
add column if not exists updated_at timestamptz not null default now();

create or replace function public.touch_contratos_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_touch_contratos_updated_at on public.contratos;

create trigger trg_touch_contratos_updated_at
before update on public.contratos
for each row
execute function public.touch_contratos_updated_at();

create table if not exists public.contrato_versions (
  id uuid primary key default gen_random_uuid(),
  contrato_id uuid not null references public.contratos(id) on delete cascade,
  version_number integer not null,
  titulo text not null,
  descricao text,
  valor numeric not null default 0,
  status text not null default 'rascunho',
  corpo text,
  builder_payload jsonb,
  created_at timestamptz not null default now(),
  unique (contrato_id, version_number)
);

create index if not exists contrato_versions_contrato_id_idx
  on public.contrato_versions (contrato_id, version_number desc);

create index if not exists contratos_archived_at_idx
  on public.contratos (archived_at);

create index if not exists contratos_updated_at_idx
  on public.contratos (updated_at desc);

alter table public.contrato_versions enable row level security;

drop policy if exists "Authenticated can view contrato_versions" on public.contrato_versions;
create policy "Authenticated can view contrato_versions"
on public.contrato_versions
for select
to authenticated
using (true);

drop policy if exists "Authenticated can insert contrato_versions" on public.contrato_versions;
create policy "Authenticated can insert contrato_versions"
on public.contrato_versions
for insert
to authenticated
with check (true);

drop policy if exists "Authenticated can update contrato_versions" on public.contrato_versions;
create policy "Authenticated can update contrato_versions"
on public.contrato_versions
for update
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated can delete contrato_versions" on public.contrato_versions;
create policy "Authenticated can delete contrato_versions"
on public.contrato_versions
for delete
to authenticated
using (true);
