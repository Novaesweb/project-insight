alter table public.contratos
  add column if not exists data_visualizacao timestamptz;

update public.contratos
set status = 'enviado'
where status = 'aguardando';

create or replace function public.mark_contract_viewed(p_contract_id uuid)
returns public.contratos
language plpgsql
security definer
set search_path = public
as $$
declare
  current_cliente_id uuid;
  contract_row public.contratos%rowtype;
begin
  current_cliente_id := public.get_cliente_id();

  if current_cliente_id is null then
    raise exception 'CLIENT_NOT_AUTHORIZED' using errcode = 'P0001';
  end if;

  select *
  into contract_row
  from public.contratos
  where id = p_contract_id
    and cliente_id = current_cliente_id
    and archived_at is null
    and status in ('enviado', 'visualizado', 'assinado')
  limit 1;

  if contract_row.id is null then
    raise exception 'CONTRACT_NOT_AVAILABLE' using errcode = 'P0001';
  end if;

  if contract_row.status = 'enviado' then
    update public.contratos
    set status = 'visualizado',
        data_visualizacao = coalesce(data_visualizacao, now()),
        updated_at = now()
    where id = contract_row.id
    returning * into contract_row;
  end if;

  return contract_row;
end;
$$;

revoke all on function public.mark_contract_viewed(uuid) from public;
grant execute on function public.mark_contract_viewed(uuid) to authenticated;
