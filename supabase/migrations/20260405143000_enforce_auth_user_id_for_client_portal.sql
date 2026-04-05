update public.clientes as clientes
set auth_user_id = auth_users.id
from auth.users as auth_users
where clientes.auth_user_id is null
  and lower(clientes.email) = lower(auth_users.email);

create or replace function public.get_cliente_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select clientes.id
  from public.clientes
  where clientes.status = 'ativo'
    and coalesce(clientes.bloqueado, false) = false
    and clientes.auth_user_id = (select auth.uid())
  limit 1;
$$;

drop policy if exists "Clientes view own profile" on public.clientes;
drop policy if exists "Clientes update own profile" on public.clientes;

create policy "Clientes view own profile"
on public.clientes
for select
to authenticated
using (id = public.get_cliente_id());

create policy "Clientes update own profile"
on public.clientes
for update
to authenticated
using (id = public.get_cliente_id())
with check (
  id = public.get_cliente_id()
  and status = 'ativo'
  and coalesce(bloqueado, false) = false
  and auth_user_id = (select auth.uid())
);
