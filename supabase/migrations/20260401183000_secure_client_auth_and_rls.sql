alter table public.clientes
  add column if not exists auth_user_id uuid;

create unique index if not exists clientes_auth_user_id_unique
  on public.clientes (auth_user_id)
  where auth_user_id is not null;

create index if not exists clientes_email_lower_idx
  on public.clientes (lower(email));

update public.clientes as clientes
set auth_user_id = auth_users.id
from auth.users as auth_users
where clientes.auth_user_id is null
  and lower(clientes.email) = lower(auth_users.email);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.usuarios
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      and status = 'ativo'
      and coalesce(bloqueado, false) = false
  );
$$;

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
    and (
      clientes.auth_user_id = auth.uid()
      or lower(clientes.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    )
  order by case when clientes.auth_user_id = auth.uid() then 0 else 1 end
  limit 1;
$$;

grant execute on function public.is_admin() to authenticated;
grant execute on function public.get_cliente_id() to authenticated;

update public.usuarios
set senha = null
where senha is not null;

update public.clientes
set senha = null
where senha is not null
  and auth_user_id is not null;

drop policy if exists "Authenticated can read app_config" on public.app_config;
drop policy if exists "Anon can read vapid public key" on public.app_config;

create policy "Internal manage app_config"
on public.app_config
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Public read safe app_config"
on public.app_config
for select
to anon
using (
  key in (
    'vapid_public_key',
    'logo',
    'primary_color',
    'nome',
    'whatsapp_number',
    'social_proof_active',
    'urgency_active',
    'urgency_text',
    'urgency_hours',
    'email',
    'telefone'
  )
);

create policy "Authenticated read safe app_config"
on public.app_config
for select
to authenticated
using (
  key in (
    'vapid_public_key',
    'logo',
    'primary_color',
    'nome',
    'whatsapp_number',
    'social_proof_active',
    'urgency_active',
    'urgency_text',
    'urgency_hours',
    'email',
    'telefone'
  )
);

drop policy if exists "Authenticated can manage push_subscriptions" on public.push_subscriptions;
drop policy if exists "Anon can insert push_subscriptions" on public.push_subscriptions;

create policy "Internal manage push_subscriptions"
on public.push_subscriptions
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Clientes manage own push_subscriptions"
on public.push_subscriptions
for all
to authenticated
using (
  user_type = 'cliente'
  and user_id = public.get_cliente_id()::text
)
with check (
  user_type = 'cliente'
  and user_id = public.get_cliente_id()::text
);

drop policy if exists "Authenticated can view notifications" on public.notifications;
drop policy if exists "Authenticated can insert notifications" on public.notifications;
drop policy if exists "Authenticated can update notifications" on public.notifications;
drop policy if exists "Service role full access" on public.notifications;

create policy "Internal manage notifications"
on public.notifications
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Clientes read own notifications"
on public.notifications
for select
to authenticated
using (
  user_type = 'cliente'
  and user_id = public.get_cliente_id()::text
);

create policy "Clientes update own notifications"
on public.notifications
for update
to authenticated
using (
  user_type = 'cliente'
  and user_id = public.get_cliente_id()::text
)
with check (
  user_type = 'cliente'
  and user_id = public.get_cliente_id()::text
);

create policy "Service role full access notifications"
on public.notifications
for all
to service_role
using (true)
with check (true);

drop policy if exists "Authenticated can view leads" on public.leads;
drop policy if exists "Authenticated can update leads" on public.leads;
drop policy if exists "Authenticated can delete leads" on public.leads;

create policy "Internal manage leads"
on public.leads
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Authenticated can view usuarios" on public.usuarios;
drop policy if exists "Authenticated can insert usuarios" on public.usuarios;
drop policy if exists "Authenticated can update usuarios" on public.usuarios;
drop policy if exists "Authenticated can delete usuarios" on public.usuarios;

create policy "Internal manage usuarios"
on public.usuarios
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Authenticated can view clientes" on public.clientes;
drop policy if exists "Authenticated can insert clientes" on public.clientes;
drop policy if exists "Authenticated can update clientes" on public.clientes;
drop policy if exists "Authenticated can delete clientes" on public.clientes;

create policy "Internal manage clientes"
on public.clientes
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

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
  and (
    auth_user_id = auth.uid()
    or lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  )
);

drop policy if exists "Authenticated can view projetos" on public.projetos;
drop policy if exists "Authenticated can insert projetos" on public.projetos;
drop policy if exists "Authenticated can update projetos" on public.projetos;
drop policy if exists "Authenticated can delete projetos" on public.projetos;

create policy "Internal manage projetos"
on public.projetos
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Clientes view own projetos"
on public.projetos
for select
to authenticated
using (cliente_id = public.get_cliente_id());

create policy "Clientes update own projetos"
on public.projetos
for update
to authenticated
using (cliente_id = public.get_cliente_id())
with check (cliente_id = public.get_cliente_id());

drop policy if exists "Authenticated can view pedidos" on public.pedidos;
drop policy if exists "Authenticated can insert pedidos" on public.pedidos;
drop policy if exists "Authenticated can update pedidos" on public.pedidos;
drop policy if exists "Authenticated can delete pedidos" on public.pedidos;

create policy "Internal manage pedidos"
on public.pedidos
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Clientes view own pedidos"
on public.pedidos
for select
to authenticated
using (cliente_id = public.get_cliente_id());

drop policy if exists "Authenticated can view extras_catalogo" on public.extras_catalogo;
drop policy if exists "Authenticated can insert extras_catalogo" on public.extras_catalogo;
drop policy if exists "Authenticated can update extras_catalogo" on public.extras_catalogo;
drop policy if exists "Authenticated can delete extras_catalogo" on public.extras_catalogo;

create policy "Internal manage extras_catalogo"
on public.extras_catalogo
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Authenticated read extras_catalogo"
on public.extras_catalogo
for select
to authenticated
using (true);

drop policy if exists "Authenticated can view extras_clientes" on public.extras_clientes;
drop policy if exists "Authenticated can insert extras_clientes" on public.extras_clientes;
drop policy if exists "Authenticated can update extras_clientes" on public.extras_clientes;
drop policy if exists "Authenticated can delete extras_clientes" on public.extras_clientes;

create policy "Internal manage extras_clientes"
on public.extras_clientes
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Clientes view own extras_clientes"
on public.extras_clientes
for select
to authenticated
using (cliente_id = public.get_cliente_id());

drop policy if exists "Authenticated can view tickets" on public.tickets;
drop policy if exists "Authenticated can insert tickets" on public.tickets;
drop policy if exists "Authenticated can update tickets" on public.tickets;
drop policy if exists "Authenticated can delete tickets" on public.tickets;

create policy "Internal manage tickets"
on public.tickets
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Clientes view own tickets"
on public.tickets
for select
to authenticated
using (cliente_id = public.get_cliente_id());

create policy "Clientes insert own tickets"
on public.tickets
for insert
to authenticated
with check (cliente_id = public.get_cliente_id());

create policy "Clientes update own tickets"
on public.tickets
for update
to authenticated
using (cliente_id = public.get_cliente_id())
with check (cliente_id = public.get_cliente_id());

drop policy if exists "Authenticated can view ticket_mensagens" on public.ticket_mensagens;
drop policy if exists "Authenticated can insert ticket_mensagens" on public.ticket_mensagens;

create policy "Internal manage ticket_mensagens"
on public.ticket_mensagens
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Clientes read own ticket_mensagens"
on public.ticket_mensagens
for select
to authenticated
using (
  exists (
    select 1
    from public.tickets
    where tickets.id = ticket_mensagens.ticket_id
      and tickets.cliente_id = public.get_cliente_id()
  )
);

create policy "Clientes insert own ticket_mensagens"
on public.ticket_mensagens
for insert
to authenticated
with check (
  exists (
    select 1
    from public.tickets
    where tickets.id = ticket_mensagens.ticket_id
      and tickets.cliente_id = public.get_cliente_id()
  )
);

drop policy if exists "Authenticated can view financeiro" on public.financeiro;
drop policy if exists "Authenticated can insert financeiro" on public.financeiro;
drop policy if exists "Authenticated can update financeiro" on public.financeiro;
drop policy if exists "Authenticated can delete financeiro" on public.financeiro;

create policy "Internal manage financeiro"
on public.financeiro
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Clientes view own financeiro"
on public.financeiro
for select
to authenticated
using (cliente_id = public.get_cliente_id());

drop policy if exists "Authenticated can view reunioes" on public.reunioes;
drop policy if exists "Authenticated can insert reunioes" on public.reunioes;
drop policy if exists "Authenticated can update reunioes" on public.reunioes;
drop policy if exists "Authenticated can delete reunioes" on public.reunioes;

create policy "Internal manage reunioes"
on public.reunioes
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Clientes view own reunioes"
on public.reunioes
for select
to authenticated
using (cliente_id = public.get_cliente_id());

drop policy if exists "Authenticated can view contratos" on public.contratos;
drop policy if exists "Authenticated can insert contratos" on public.contratos;
drop policy if exists "Authenticated can update contratos" on public.contratos;
drop policy if exists "Authenticated can delete contratos" on public.contratos;

create policy "Internal manage contratos"
on public.contratos
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Clientes view own contratos"
on public.contratos
for select
to authenticated
using (cliente_id = public.get_cliente_id());

create policy "Clientes update own contratos"
on public.contratos
for update
to authenticated
using (cliente_id = public.get_cliente_id())
with check (cliente_id = public.get_cliente_id());

drop policy if exists "Authenticated can view faturas" on public.faturas;
drop policy if exists "Authenticated can insert faturas" on public.faturas;
drop policy if exists "Authenticated can update faturas" on public.faturas;
drop policy if exists "Authenticated can delete faturas" on public.faturas;

create policy "Internal manage faturas"
on public.faturas
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Clientes view own faturas"
on public.faturas
for select
to authenticated
using (cliente_id = public.get_cliente_id());

drop policy if exists "Authenticated can view projeto_atualizacoes" on public.projeto_atualizacoes;
drop policy if exists "Authenticated can insert projeto_atualizacoes" on public.projeto_atualizacoes;

create policy "Internal manage projeto_atualizacoes"
on public.projeto_atualizacoes
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Clientes view own visible projeto_atualizacoes"
on public.projeto_atualizacoes
for select
to authenticated
using (
  visivel_cliente = true
  and exists (
    select 1
    from public.projetos
    where projetos.id = projeto_atualizacoes.projeto_id
      and projetos.cliente_id = public.get_cliente_id()
  )
);

alter table if exists public.menu_pedidos enable row level security;

drop policy if exists "Internal manage menu_pedidos" on public.menu_pedidos;
drop policy if exists "Clientes manage own menu_pedidos" on public.menu_pedidos;

create policy "Internal manage menu_pedidos"
on public.menu_pedidos
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Clientes view own menu_pedidos"
on public.menu_pedidos
for select
to authenticated
using (cliente_id = public.get_cliente_id());

create policy "Clientes update own menu_pedidos"
on public.menu_pedidos
for update
to authenticated
using (cliente_id = public.get_cliente_id())
with check (cliente_id = public.get_cliente_id());
