alter table public.contratos
  add column if not exists pedido_id uuid references public.pedidos(id) on delete set null,
  add column if not exists onboarding_started_at timestamptz;

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
    into cliente_nome, cliente_email
    from public.clientes
    where id = current_cliente_id;

    signer_email := coalesce(nullif(trim(coalesce(auth.jwt() ->> 'email', '')), ''), cliente_email);
    plan_id := nullif(trim(coalesce(contract_row.builder_payload ->> 'primaryPlanId', '')), '');

    if contract_row.pedido_id is null then
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
        'Pedido gerado automaticamente após a assinatura do Contrato Mestre.',
        'Pedido vinculado ao contrato ' || contract_row.id::text || ' para iniciar o onboarding operacional.',
        coalesce(contract_row.valor, 0),
        current_cliente_id,
        'pendente',
        current_date
      )
      returning id, codigo into onboarding_pedido_id, onboarding_pedido_codigo;
    else
      onboarding_pedido_id := contract_row.pedido_id;
      select codigo
      into onboarding_pedido_codigo
      from public.pedidos
      where id = onboarding_pedido_id;
    end if;

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

    update public.contratos
    set status = 'assinado',
        data_visualizacao = coalesce(data_visualizacao, now()),
        data_assinatura = coalesce(data_assinatura, now()),
        assinatura_cliente_nome = signer_name,
        assinatura_cliente_email = signer_email,
        pedido_id = coalesce(contract_row.pedido_id, onboarding_pedido_id),
        onboarding_started_at = coalesce(onboarding_started_at, now()),
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
      'onboarding_iniciado',
      'Onboarding iniciado automaticamente',
      'Pedido e estrutura inicial de onboarding foram liberados após a assinatura.',
      'system',
      null,
      jsonb_build_object(
        'pedido_id', onboarding_pedido_id,
        'pedido_codigo', onboarding_pedido_codigo,
        'checklist_created', checklist_count = 0
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

    insert into public.notifications (title, body, url, user_type, user_id)
    values (
      '🚀 Onboarding liberado',
      'Seu contrato foi aprovado. O checklist inicial já está liberado no portal para continuar o projeto.',
      '/cliente/dados',
      'cliente',
      current_cliente_id::text
    );
  end if;

  return contract_row;
end;
$$;

revoke all on function public.sign_contract_from_portal(uuid, text) from public;
grant execute on function public.sign_contract_from_portal(uuid, text) to authenticated;
