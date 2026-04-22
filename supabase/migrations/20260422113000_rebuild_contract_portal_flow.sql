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
  first_view boolean;
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
    and status in ('enviado', 'em_revisao', 'assinado', 'ativo')
  limit 1;

  if contract_row.id is null then
    raise exception 'CONTRACT_NOT_AVAILABLE' using errcode = 'P0001';
  end if;

  first_view := contract_row.data_visualizacao is null;

  update public.contratos
  set data_visualizacao = coalesce(data_visualizacao, now()),
      updated_at = now()
  where id = contract_row.id
  returning * into contract_row;

  if first_view then
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
    and status not in ('rascunho', 'cancelado', 'encerrado')
  limit 1;

  if contract_row.id is null then
    raise exception 'CONTRACT_NOT_AVAILABLE' using errcode = 'P0001';
  end if;

  update public.contratos
  set status = 'em_revisao',
      data_visualizacao = coalesce(data_visualizacao, now()),
      requer_reassinatura = false,
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
  cliente_email text;
  signer_name text;
  signer_email text;
  checklist_count integer;
  onboarding_pedido_id uuid;
  onboarding_pedido_codigo text;
  plan_id text;
  onboarding_title text;
  had_existing_onboarding boolean;
  next_status text;
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
    and status not in ('rascunho', 'cancelado', 'encerrado')
  limit 1;

  if contract_row.id is null then
    raise exception 'CONTRACT_NOT_AVAILABLE' using errcode = 'P0001';
  end if;

  select nome, email
  into cliente_nome, cliente_email
  from public.clientes
  where id = current_cliente_id;

  signer_email := coalesce(nullif(trim(coalesce(auth.jwt() ->> 'email', '')), ''), cliente_email);
  plan_id := nullif(trim(coalesce(contract_row.builder_payload ->> 'primaryPlanId', '')), '');
  had_existing_onboarding := contract_row.pedido_id is not null or contract_row.onboarding_started_at is not null;

  if not had_existing_onboarding then
    onboarding_pedido_codigo := 'CTR-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));
    onboarding_title := coalesce(nullif(trim(contract_row.titulo), ''), 'Onboarding do Contrato Mestre');

    insert into public.pedidos (
      codigo,
      tipo,
      titulo,
      descricao,
      observacoes,
      valor,
      cliente_id,
      status,
      data
    )
    values (
      onboarding_pedido_codigo,
      case
        when plan_id = 'express' then 'site'
        when plan_id = 'pro' then 'sistema'
        when plan_id = 'sob-medida' then 'outro'
        else 'outro'
      end,
      onboarding_title,
      'Pedido gerado automaticamente após a assinatura do contrato.',
      'Pedido vinculado ao contrato ' || contract_row.id::text || ' para iniciar o onboarding operacional.',
      coalesce(contract_row.valor, 0),
      current_cliente_id,
      'pendente',
      current_date
    )
    returning id, codigo into onboarding_pedido_id, onboarding_pedido_codigo;

    select count(*)
    into checklist_count
    from public.cliente_checklist_items
    where cliente_id = current_cliente_id;

    if checklist_count = 0 then
      insert into public.cliente_checklist_items (
        cliente_id,
        item_key,
        titulo,
        descricao,
        ordem,
        status,
        updated_by
      )
      values
        (current_cliente_id, 'identidade_visual', 'Logo e identidade visual', 'Envie logo, paleta e referências da marca.', 1, 'pendente', 'system'),
        (current_cliente_id, 'dados_comerciais', 'Dados comerciais e contatos', 'Confirme telefones, WhatsApp, endereço e canais de contato que devem aparecer na estrutura.', 2, 'pendente', 'system'),
        (current_cliente_id, 'conteudo_base', 'Textos e posicionamento', 'Envie textos principais, slogan, diferenciais e informações institucionais do negócio.', 3, 'pendente', 'system'),
        (current_cliente_id, 'midias_referencias', 'Fotos, vídeos e referências', 'Suba materiais visuais e links de referência para orientar o layout.', 4, 'pendente', 'system'),
        (current_cliente_id, 'acessos_integracoes', 'Acessos e integrações', 'Compartilhe acessos, credenciais e integrações necessárias para execução.', 5, 'pendente', 'system');
    end if;
  else
    onboarding_pedido_id := contract_row.pedido_id;
  end if;

  next_status := case
    when contract_row.onboarding_started_at is not null then 'ativo'
    else 'assinado'
  end;

  update public.contratos
  set status = next_status,
      data_visualizacao = coalesce(data_visualizacao, now()),
      data_assinatura = now(),
      assinatura_cliente_nome = signer_name,
      assinatura_cliente_email = signer_email,
      pedido_id = coalesce(contract_row.pedido_id, onboarding_pedido_id),
      requer_reassinatura = false,
      reassinatura_motivo = null,
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
    case
      when had_existing_onboarding then 'Contrato atualizado assinado no portal'
      else 'Contrato assinado no portal'
    end,
    case
      when had_existing_onboarding then coalesce(cliente_nome, signer_name) || ' assinou a versão atualizada do contrato.'
      else coalesce(cliente_nome, signer_name) || ' aprovou e assinou o contrato no portal.'
    end,
    'cliente',
    current_cliente_id::text,
    jsonb_build_object(
      'signer_name', signer_name,
      'signer_email', signer_email,
      'signed_at', contract_row.data_assinatura,
      'status', contract_row.status
    )
  );

  insert into public.notifications (title, body, url, user_type, user_id)
  values (
    case
      when had_existing_onboarding then '✅ Contrato atualizado assinado'
      else '✅ Contrato assinado'
    end,
    case
      when had_existing_onboarding then coalesce(cliente_nome, signer_name) || ' assinou a versão atualizada de "' || contract_row.titulo || '".'
      else coalesce(cliente_nome, signer_name) || ' aprovou e assinou "' || contract_row.titulo || '".'
    end,
    '/admin/contratos',
    'admin',
    'admin'
  );

  if not had_existing_onboarding then
    insert into public.notifications (title, body, url, user_type, user_id)
    values (
      '📄 Contrato assinado',
      'Seu contrato foi assinado com sucesso. O próximo passo do onboarding já foi preparado no portal.',
      '/cliente/contratos',
      'cliente',
      current_cliente_id::text
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
