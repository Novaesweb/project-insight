drop policy if exists "Clientes update own contratos" on public.contratos;
drop policy if exists "Clientes view own contratos" on public.contratos;

create policy "Clientes view own non-builder contratos"
on public.contratos
for select
to authenticated
using (
  cliente_id = public.get_cliente_id()
  and builder_payload is null
);

alter table public.contrato_versions enable row level security;

drop policy if exists "Authenticated can view contrato_versions" on public.contrato_versions;
drop policy if exists "Authenticated can insert contrato_versions" on public.contrato_versions;
drop policy if exists "Authenticated can update contrato_versions" on public.contrato_versions;
drop policy if exists "Authenticated can delete contrato_versions" on public.contrato_versions;
drop policy if exists "Internal manage contrato_versions" on public.contrato_versions;

create policy "Internal manage contrato_versions"
on public.contrato_versions
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());
