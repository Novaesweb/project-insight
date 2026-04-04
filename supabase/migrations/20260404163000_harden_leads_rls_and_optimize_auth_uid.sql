create or replace function public.get_cliente_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  with auth_context as (
    select
      (select auth.uid()) as current_uid,
      lower(coalesce(auth.jwt() ->> 'email', '')) as current_email
  )
  select clientes.id
  from public.clientes
  cross join auth_context
  where clientes.status = 'ativo'
    and coalesce(clientes.bloqueado, false) = false
    and (
      clientes.auth_user_id = auth_context.current_uid
      or lower(clientes.email) = auth_context.current_email
    )
  order by case when clientes.auth_user_id = auth_context.current_uid then 0 else 1 end
  limit 1;
$$;

drop policy if exists "Clientes update own profile" on public.clientes;

create policy "Clientes update own profile"
on public.clientes
for update
to authenticated
using (id = public.get_cliente_id())
with check (
  id = public.get_cliente_id()
  and status = 'ativo'
  and coalesce(bloqueado, false) = false
  and (
    auth_user_id = (select auth.uid())
    or lower(email) = (select lower(coalesce(auth.jwt() ->> 'email', '')))
  )
);

drop policy if exists "Anyone can submit leads" on public.leads;
drop policy if exists "Authenticated can view leads" on public.leads;
drop policy if exists "Authenticated can update leads" on public.leads;
drop policy if exists "Authenticated can delete leads" on public.leads;
drop policy if exists "Internal manage leads" on public.leads;

create policy "Internal manage leads"
on public.leads
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());
