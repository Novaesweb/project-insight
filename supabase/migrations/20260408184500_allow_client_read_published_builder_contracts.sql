drop policy if exists "Clientes view own non-builder contratos" on public.contratos;
drop policy if exists "Clientes view own published contratos" on public.contratos;

create policy "Clientes view own published contratos"
on public.contratos
for select
to authenticated
using (
  cliente_id = public.get_cliente_id()
  and archived_at is null
  and (
    builder_payload is null
    or status <> 'rascunho'
  )
);
