alter table public.contratos
  add column if not exists assinatura_cliente_nome text,
  add column if not exists assinatura_cliente_email text;

create table if not exists public.contrato_eventos (
  id uuid primary key default gen_random_uuid(),
  contrato_id uuid not null references public.contratos(id) on delete cascade,
  tipo text not null,
  titulo text not null,
  descricao text,
  actor_type text not null default 'system',
  actor_id text,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists contrato_eventos_contrato_id_created_at_idx
  on public.contrato_eventos (contrato_id, created_at desc);

alter table public.contrato_eventos enable row level security;

drop policy if exists "Internal manage contrato_eventos" on public.contrato_eventos;
drop policy if exists "Clientes view own contrato_eventos" on public.contrato_eventos;

create policy "Internal manage contrato_eventos"
on public.contrato_eventos
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Clientes view own contrato_eventos"
on public.contrato_eventos
for select
to authenticated
using (
  exists (
    select 1
    from public.contratos contratos
    where contratos.id = contrato_eventos.contrato_id
      and contratos.cliente_id = public.get_cliente_id()
      and contratos.archived_at is null
      and contratos.status <> 'rascunho'
  )
);

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'contrato_eventos'
  ) then
    execute 'alter publication supabase_realtime add table public.contrato_eventos';
  end if;
end $$;

create or replace function public.mark_contract_viewed(p_contract_id uuid)
returns public.contratos
language plpgsql
security definer
set search_path = public
as $$
declare
  current_cliente_id uuid;
  contract_row public.contratos%rowtype;
  cliente_nome text;
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

    select nome
    into cliente_nome
    from public.clientes
    where id = current_cliente_id;

    insert into public.contrato_eventos (
      contrato_id,
      tipo,
      titulo,
      descricao,
      actor_type,
      actor_id,
      meta
    )
    values (
      contract_row.id,
      'visualizado',
      'Contrato visualizado pelo cliente',
      coalesce(cliente_nome, 'Cliente') || ' abriu o contrato no portal.',
      'cliente',
      current_cliente_id::text,
      jsonb_build_object('status', contract_row.status)
    );

    insert into public.notifications (title, body, url, user_type, user_id)
    values (
      '👀 Contrato visualizado',
      coalesce(cliente_nome, 'Cliente') || ' abriu o contrato "' || contract_row.titulo || '".',
      '/admin/contratos',
      'admin',
      'admin'
    );
  end if;

  return contract_row;
end;
$$;

create or replace function public.request_contract_revision(
  p_contract_id uuid,
  p_message text
)
returns public.contratos
language plpgsql
security definer
set search_path = public
as $$
declare
  current_cliente_id uuid;
  contract_row public.contratos%rowtype;
  cliente_nome text;
  clean_message text;
begin
  current_cliente_id := public.get_cliente_id();
  clean_message := nullif(trim(coalesce(p_message, '')), '');

  if current_cliente_id is null then
    raise exception 'CLIENT_NOT_AUTHORIZED' using errcode = 'P0001';
  end if;

  if clean_message is null then
    raise exception 'REVISION_MESSAGE_REQUIRED' using errcode = 'P0001';
  end if;

  select *
  into contract_row
  from public.contratos
  where id = p_contract_id
    and cliente_id = current_cliente_id
    and archived_at is null
    and status in ('enviado', 'visualizado')
  limit 1;

  if contract_row.id is null then
    raise exception 'CONTRACT_NOT_AVAILABLE' using errcode = 'P0001';
  end if;

  update public.contratos
  set status = case when status = 'enviado' then 'visualizado' else status end,
      data_visualizacao = coalesce(data_visualizacao, now()),
      updated_at = now()
  where id = contract_row.id
  returning * into contract_row;

  select nome
  into cliente_nome
  from public.clientes
  where id = current_cliente_id;

  insert into public.contrato_eventos (
    contrato_id,
    tipo,
    titulo,
    descricao,
    actor_type,
    actor_id,
    meta
  )
  values (
    contract_row.id,
    'ajuste_solicitado',
    'Cliente solicitou ajuste',
    clean_message,
    'cliente',
    current_cliente_id::text,
    jsonb_build_object('status', contract_row.status)
  );

  insert into public.notifications (title, body, url, user_type, user_id)
  values (
    '✏️ Ajuste solicitado no contrato',
    coalesce(cliente_nome, 'Cliente') || ' pediu ajuste em "' || contract_row.titulo || '".',
    '/admin/contratos',
    'admin',
    'admin'
  );

  return contract_row;
end;
$$;

create or replace function public.sign_contract_from_portal(
  p_contract_id uuid,
  p_full_name text
)
returns public.contratos
language plpgsql
security definer
set search_path = public
as $$
declare
  current_cliente_id uuid;
  contract_row public.contratos%rowtype;
  cliente_nome text;
  signer_name text;
  signer_email text;
begin
  current_cliente_id := public.get_cliente_id();
  signer_name := nullif(trim(coalesce(p_full_name, '')), '');

  if current_cliente_id is null then
    raise exception 'CLIENT_NOT_AUTHORIZED' using errcode = 'P0001';
  end if;

  if signer_name is null then
    raise exception 'SIGNER_NAME_REQUIRED' using errcode = 'P0001';
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

  if contract_row.status <> 'assinado' then
    select nome, email
    into cliente_nome, signer_email
    from public.clientes
    where id = current_cliente_id;

    signer_email := coalesce(nullif(trim(coalesce(auth.jwt() ->> 'email', '')), ''), signer_email);

    update public.contratos
    set status = 'assinado',
        data_visualizacao = coalesce(data_visualizacao, now()),
        data_assinatura = coalesce(data_assinatura, now()),
        assinatura_cliente_nome = signer_name,
        assinatura_cliente_email = signer_email,
        updated_at = now()
    where id = contract_row.id
    returning * into contract_row;

    insert into public.contrato_eventos (
      contrato_id,
      tipo,
      titulo,
      descricao,
      actor_type,
      actor_id,
      meta
    )
    values (
      contract_row.id,
      'assinado',
      'Contrato aprovado no portal',
      coalesce(cliente_nome, signer_name) || ' aprovou o contrato no portal.',
      'cliente',
      current_cliente_id::text,
      jsonb_build_object(
        'signer_name', signer_name,
        'signer_email', signer_email,
        'signed_at', contract_row.data_assinatura
      )
    );

    insert into public.notifications (title, body, url, user_type, user_id)
    values (
      '✅ Contrato assinado',
      coalesce(cliente_nome, signer_name) || ' aprovou e assinou "' || contract_row.titulo || '".',
      '/admin/contratos',
      'admin',
      'admin'
    );
  end if;

  return contract_row;
end;
$$;

revoke all on function public.mark_contract_viewed(uuid) from public;
grant execute on function public.mark_contract_viewed(uuid) to authenticated;

revoke all on function public.request_contract_revision(uuid, text) from public;
grant execute on function public.request_contract_revision(uuid, text) to authenticated;

revoke all on function public.sign_contract_from_portal(uuid, text) from public;
grant execute on function public.sign_contract_from_portal(uuid, text) to authenticated;
