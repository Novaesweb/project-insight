create or replace function public.bootstrap_client_portal_profile()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_email text := lower(trim(coalesce(auth.jwt() ->> 'email', '')));
  v_match_count integer := 0;
  v_cliente public.clientes%rowtype;
begin
  if v_user_id is null then
    return null;
  end if;

  select *
  into v_cliente
  from public.clientes
  where auth_user_id = v_user_id
    and status = 'ativo'
    and coalesce(bloqueado, false) = false
  limit 1;

  if found then
    return to_jsonb(v_cliente);
  end if;

  if v_email = '' then
    return null;
  end if;

  select count(*)
  into v_match_count
  from public.clientes
  where lower(email) = v_email
    and status = 'ativo'
    and coalesce(bloqueado, false) = false
    and (auth_user_id is null or auth_user_id = v_user_id);

  if v_match_count <> 1 then
    return null;
  end if;

  update public.clientes
  set auth_user_id = v_user_id,
      updated_at = now()
  where lower(email) = v_email
    and status = 'ativo'
    and coalesce(bloqueado, false) = false
    and (auth_user_id is null or auth_user_id = v_user_id)
  returning *
  into v_cliente;

  if not found then
    return null;
  end if;

  return to_jsonb(v_cliente);
end;
$$;

grant execute on function public.bootstrap_client_portal_profile() to authenticated;
