create index if not exists idx_notifications_user_type_user_id_created_at_desc
on public.notifications (user_type, user_id, created_at desc);

create index if not exists idx_ticket_mensagens_ticket_id_created_at_desc
on public.ticket_mensagens (ticket_id, created_at desc);

create index if not exists idx_tickets_status_created_at_desc
on public.tickets (status, created_at desc);

create index if not exists idx_financeiro_tipo_status_created_at_desc
on public.financeiro (tipo, status, created_at desc);

create index if not exists idx_projetos_status_data_entrega
on public.projetos (status, data_entrega);

create index if not exists idx_leads_status_created_at_desc
on public.leads (status, created_at desc);

create index if not exists idx_extras_clientes_cliente_id_extra_id
on public.extras_clientes (cliente_id, extra_id);

create or replace function public.get_admin_dashboard_snapshot()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_is_admin boolean;
  v_snapshot jsonb;
begin
  select public.is_admin() into v_is_admin;

  if coalesce(v_is_admin, false) is not true then
    raise exception 'forbidden';
  end if;

  with month_series as (
    select date_trunc('month', gs.month_ref)::date as month_start
    from generate_series(
      date_trunc('month', current_date) - interval '5 months',
      date_trunc('month', current_date),
      interval '1 month'
    ) as gs(month_ref)
  ),
  recent_pedidos as (
    select
      p.id,
      p.cliente_id,
      p.status,
      c.nome as cliente_nome
    from public.pedidos p
    left join public.clientes c on c.id = p.cliente_id
    order by p.created_at desc
    limit 5
  ),
  open_tickets as (
    select
      t.id,
      t.titulo,
      t.status,
      c.nome as cliente_nome
    from public.tickets t
    left join public.clientes c on c.id = t.cliente_id
    where t.status <> 'resolvido'
    order by t.created_at desc
    limit 5
  ),
  monthly_revenue as (
    select
      ms.month_start,
      coalesce(sum(f.valor), 0)::numeric as total
    from month_series ms
    left join public.financeiro f
      on f.tipo = 'entrada'
     and f.status = 'pago'
     and date_trunc('month', f.created_at) = ms.month_start
    group by ms.month_start
    order by ms.month_start
  ),
  top_modules as (
    select
      coalesce(cat.nome, 'Outro') as nome,
      count(*)::int as total
    from public.extras_clientes ec
    left join public.extras_catalogo cat on cat.id = ec.extra_id
    group by coalesce(cat.nome, 'Outro')
    order by count(*) desc, coalesce(cat.nome, 'Outro')
    limit 5
  )
  select jsonb_build_object(
    'stats', jsonb_build_object(
      'clientes', (select count(*)::int from public.clientes where status = 'ativo'),
      'projetos', (select count(*)::int from public.projetos where status = 'em_andamento'),
      'leads', (select count(*)::int from public.leads where status = 'novo'),
      'receita', (
        select coalesce(sum(valor), 0)::numeric
        from public.financeiro
        where tipo = 'entrada' and status = 'pago'
      )
    ),
    'pedidos', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', rp.id,
          'cliente_id', rp.cliente_id,
          'status', rp.status,
          'clientes', jsonb_build_object('nome', rp.cliente_nome)
        )
      )
      from recent_pedidos rp
    ), '[]'::jsonb),
    'tickets', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', ot.id,
          'titulo', ot.titulo,
          'status', ot.status,
          'clientes', jsonb_build_object('nome', ot.cliente_nome)
        )
      )
      from open_tickets ot
    ), '[]'::jsonb),
    'subCount', (select count(*)::int from public.push_subscriptions),
    'monthlyRevenue', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'name', (array['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'])[extract(month from mr.month_start)::int],
          'total', mr.total
        )
        order by mr.month_start
      )
      from monthly_revenue mr
    ), '[]'::jsonb),
    'topModules', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'name', tm.nome,
          'value', tm.total
        )
        order by tm.total desc, tm.nome
      )
      from top_modules tm
    ), '[]'::jsonb),
    'funnelData', jsonb_build_array(
      jsonb_build_object('name', 'Leads', 'value', (select count(*)::int from public.leads)),
      jsonb_build_object('name', 'Clientes', 'value', (select count(*)::int from public.clientes)),
      jsonb_build_object('name', 'Projetos', 'value', (select count(*)::int from public.projetos))
    ),
    'revenue', jsonb_build_object(
      'paid', (select coalesce(sum(valor), 0)::numeric from public.pedidos where status = 'pago'),
      'pending', (select coalesce(sum(valor), 0)::numeric from public.pedidos where status = 'pendente')
    ),
    'pendingInvoices', (select count(*)::int from public.pedidos where status = 'pendente'),
    'newLeads', (select count(*)::int from public.leads where status = 'novo'),
    'lateProjects', (
      select count(*)::int
      from public.projetos
      where status <> 'concluido'
        and data_entrega is not null
        and data_entrega::date < current_date
    )
  ) into v_snapshot;

  return coalesce(v_snapshot, '{}'::jsonb);
end;
$$;

grant execute on function public.get_admin_dashboard_snapshot() to authenticated;

create or replace function public.get_admin_dashboard_activity()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_is_admin boolean;
  v_activity jsonb;
begin
  select public.is_admin() into v_is_admin;

  if coalesce(v_is_admin, false) is not true then
    raise exception 'forbidden';
  end if;

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id', n.id,
        'title', n.title,
        'body', n.body,
        'created_at', n.created_at,
        'url', n.url,
        'read', n.read
      )
    ),
    '[]'::jsonb
  )
  into v_activity
  from (
    select id, title, body, created_at, url, read
    from public.notifications
    where user_type = 'admin'
    order by created_at desc
    limit 20
  ) n;

  return coalesce(v_activity, '[]'::jsonb);
end;
$$;

grant execute on function public.get_admin_dashboard_activity() to authenticated;
