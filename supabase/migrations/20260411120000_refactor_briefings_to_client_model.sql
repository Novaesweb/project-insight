create table if not exists public.briefing_templates (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  section_name text not null default 'Geral',
  label text not null,
  help_text text null,
  field_type text not null default 'short_text',
  required_default boolean not null default false,
  placeholder text null,
  options jsonb not null default '[]'::jsonb,
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint briefing_templates_field_type_check check (
    field_type in ('short_text', 'long_text', 'single_choice', 'multi_choice', 'url', 'file_upload')
  )
);

create table if not exists public.client_briefings (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references public.clientes(id) on delete cascade,
  projeto_id uuid null references public.projetos(id) on delete set null,
  titulo text not null,
  instrucoes text null,
  status text not null default 'em_construcao',
  snapshot_briefing text null,
  snapshot_references text null,
  sent_at timestamptz null,
  started_at timestamptz null,
  submitted_at timestamptz null,
  completed_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint client_briefings_status_check check (
    status in ('em_construcao', 'enviado', 'em_preenchimento', 'respondido', 'concluido')
  )
);

create table if not exists public.client_briefing_fields (
  id uuid primary key default gen_random_uuid(),
  briefing_id uuid not null references public.client_briefings(id) on delete cascade,
  template_id uuid null references public.briefing_templates(id) on delete set null,
  section_name text not null default 'Geral',
  label text not null,
  help_text text null,
  field_type text not null default 'short_text',
  required boolean not null default false,
  placeholder text null,
  options jsonb not null default '[]'::jsonb,
  sort_order integer not null default 0,
  is_custom boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint client_briefing_fields_type_check check (
    field_type in ('short_text', 'long_text', 'single_choice', 'multi_choice', 'url', 'file_upload')
  )
);

create table if not exists public.client_briefing_answers (
  id uuid primary key default gen_random_uuid(),
  briefing_id uuid not null references public.client_briefings(id) on delete cascade,
  field_id uuid not null references public.client_briefing_fields(id) on delete cascade,
  cliente_id uuid not null references public.clientes(id) on delete cascade,
  answer_text text null,
  answer_json jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint client_briefing_answers_unique unique (briefing_id, field_id, cliente_id)
);

create table if not exists public.briefing_attachments (
  id uuid primary key default gen_random_uuid(),
  briefing_id uuid not null references public.client_briefings(id) on delete cascade,
  field_id uuid null references public.client_briefing_fields(id) on delete set null,
  cliente_id uuid not null references public.clientes(id) on delete cascade,
  nome text not null,
  url text not null,
  storage_bucket text not null default 'projeto-arquivos',
  storage_path text not null,
  tipo text null,
  tamanho bigint null,
  enviado_por text not null default 'cliente',
  created_at timestamptz not null default now(),
  constraint briefing_attachments_sender_check check (enviado_por in ('cliente', 'admin'))
);

create index if not exists briefing_templates_active_idx
  on public.briefing_templates (active, section_name, sort_order);

create index if not exists client_briefings_cliente_idx
  on public.client_briefings (cliente_id, updated_at desc);

create unique index if not exists client_briefings_one_active_per_client_idx
  on public.client_briefings (cliente_id)
  where status in ('em_construcao', 'enviado', 'em_preenchimento', 'respondido');

create index if not exists client_briefing_fields_briefing_idx
  on public.client_briefing_fields (briefing_id, sort_order);

create index if not exists client_briefing_answers_briefing_idx
  on public.client_briefing_answers (briefing_id, updated_at desc);

create index if not exists briefing_attachments_briefing_idx
  on public.briefing_attachments (briefing_id, created_at desc);

create or replace function public.touch_client_briefing_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_touch_briefing_templates_updated_at on public.briefing_templates;
create trigger trg_touch_briefing_templates_updated_at
before update on public.briefing_templates
for each row
execute function public.touch_client_briefing_updated_at();

drop trigger if exists trg_touch_client_briefings_updated_at on public.client_briefings;
create trigger trg_touch_client_briefings_updated_at
before update on public.client_briefings
for each row
execute function public.touch_client_briefing_updated_at();

drop trigger if exists trg_touch_client_briefing_fields_updated_at on public.client_briefing_fields;
create trigger trg_touch_client_briefing_fields_updated_at
before update on public.client_briefing_fields
for each row
execute function public.touch_client_briefing_updated_at();

drop trigger if exists trg_touch_client_briefing_answers_updated_at on public.client_briefing_answers;
create trigger trg_touch_client_briefing_answers_updated_at
before update on public.client_briefing_answers
for each row
execute function public.touch_client_briefing_updated_at();

alter table public.briefing_templates enable row level security;
alter table public.client_briefings enable row level security;
alter table public.client_briefing_fields enable row level security;
alter table public.client_briefing_answers enable row level security;
alter table public.briefing_attachments enable row level security;

grant select, insert, update, delete on public.briefing_templates to authenticated;
grant select, insert, update, delete on public.client_briefings to authenticated;
grant select, insert, update, delete on public.client_briefing_fields to authenticated;
grant select, insert, update, delete on public.client_briefing_answers to authenticated;
grant select, insert, update, delete on public.briefing_attachments to authenticated;

drop policy if exists "Internal manage briefing_templates" on public.briefing_templates;
drop policy if exists "Internal manage client_briefings" on public.client_briefings;
drop policy if exists "Clientes view own client_briefings" on public.client_briefings;
drop policy if exists "Clientes update own client_briefings" on public.client_briefings;
drop policy if exists "Internal manage client_briefing_fields" on public.client_briefing_fields;
drop policy if exists "Clientes view own client_briefing_fields" on public.client_briefing_fields;
drop policy if exists "Internal manage client_briefing_answers" on public.client_briefing_answers;
drop policy if exists "Clientes manage own client_briefing_answers" on public.client_briefing_answers;
drop policy if exists "Internal manage briefing_attachments" on public.briefing_attachments;
drop policy if exists "Clientes manage own briefing_attachments" on public.briefing_attachments;

create policy "Internal manage briefing_templates"
on public.briefing_templates
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Internal manage client_briefings"
on public.client_briefings
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Clientes view own client_briefings"
on public.client_briefings
for select
to authenticated
using (cliente_id = public.get_cliente_id());

create policy "Clientes update own client_briefings"
on public.client_briefings
for update
to authenticated
using (cliente_id = public.get_cliente_id())
with check (cliente_id = public.get_cliente_id());

create policy "Internal manage client_briefing_fields"
on public.client_briefing_fields
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Clientes view own client_briefing_fields"
on public.client_briefing_fields
for select
to authenticated
using (
  exists (
    select 1
    from public.client_briefings
    where client_briefings.id = client_briefing_fields.briefing_id
      and client_briefings.cliente_id = public.get_cliente_id()
  )
);

create policy "Internal manage client_briefing_answers"
on public.client_briefing_answers
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Clientes manage own client_briefing_answers"
on public.client_briefing_answers
for all
to authenticated
using (
  cliente_id = public.get_cliente_id()
  and exists (
    select 1
    from public.client_briefings
    where client_briefings.id = client_briefing_answers.briefing_id
      and client_briefings.cliente_id = public.get_cliente_id()
  )
)
with check (
  cliente_id = public.get_cliente_id()
  and exists (
    select 1
    from public.client_briefings
    where client_briefings.id = client_briefing_answers.briefing_id
      and client_briefings.cliente_id = public.get_cliente_id()
  )
);

create policy "Internal manage briefing_attachments"
on public.briefing_attachments
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Clientes manage own briefing_attachments"
on public.briefing_attachments
for all
to authenticated
using (
  cliente_id = public.get_cliente_id()
  and exists (
    select 1
    from public.client_briefings
    where client_briefings.id = briefing_attachments.briefing_id
      and client_briefings.cliente_id = public.get_cliente_id()
  )
)
with check (
  cliente_id = public.get_cliente_id()
  and exists (
    select 1
    from public.client_briefings
    where client_briefings.id = briefing_attachments.briefing_id
      and client_briefings.cliente_id = public.get_cliente_id()
  )
);

insert into public.briefing_templates (
  slug,
  section_name,
  label,
  help_text,
  field_type,
  required_default,
  placeholder,
  options,
  sort_order
) values
  ('empresa-nome', 'Informações Básicas', 'Nome da empresa', '', 'short_text', true, 'Ex: Pizzaria Imperial', '[]'::jsonb, 0),
  ('responsavel-nome', 'Informações Básicas', 'Nome do responsável', '', 'short_text', true, 'Ex: Lucas Novaes', '[]'::jsonb, 1),
  ('whatsapp', 'Informações Básicas', 'WhatsApp', '', 'short_text', true, '(11) 99999-9999', '[]'::jsonb, 2),
  ('instagram', 'Informações Básicas', 'Instagram', 'Pode ser o @ ou o link completo do perfil.', 'url', false, 'https://instagram.com/suaempresa', '[]'::jsonb, 3),
  ('site-atual', 'Informações Básicas', 'Já possui site? Se sim, qual?', '', 'url', false, 'https://seusite.com.br', '[]'::jsonb, 4),

  ('oferta-principal', 'Sobre o Negócio', 'O que você vende ou oferece?', '', 'long_text', true, 'Descreva os produtos ou serviços principais.', '[]'::jsonb, 10),
  ('diferencial', 'Sobre o Negócio', 'Qual seu principal diferencial hoje?', '', 'long_text', false, 'O que faz seu negócio se destacar?', '[]'::jsonb, 11),
  ('motivo-escolha', 'Sobre o Negócio', 'Por que o cliente deve escolher você e não o concorrente?', '', 'long_text', false, 'Explique o valor percebido do seu negócio.', '[]'::jsonb, 12),
  ('concorrentes', 'Sobre o Negócio', 'Quais são seus principais concorrentes?', 'Se não souber todos, cite os mais fortes.', 'long_text', false, 'Liste nomes, perfis ou links.', '[]'::jsonb, 13),

  ('cliente-ideal', 'Público-Alvo', 'Quem é seu cliente ideal?', '', 'long_text', true, 'Descreva perfil, comportamento e necessidades.', '[]'::jsonb, 20),
  ('faixa-etaria', 'Público-Alvo', 'Faixa de idade do seu público', '', 'short_text', false, 'Ex: 25 a 45 anos', '[]'::jsonb, 21),
  ('compra-impulso-ou-necessidade', 'Público-Alvo', 'Seu público compra mais por impulso ou necessidade?', '', 'single_choice', false, '', '[{"label":"Impulso","value":"impulso"},{"label":"Necessidade","value":"necessidade"},{"label":"Misto","value":"misto"}]'::jsonb, 22),
  ('origem-clientes', 'Público-Alvo', 'Seu cliente costuma vir por', 'Marque os canais mais comuns hoje.', 'multi_choice', false, '', '[{"label":"Instagram","value":"instagram"},{"label":"Indicação","value":"indicacao"},{"label":"Rua / local","value":"rua_local"},{"label":"iFood / apps","value":"ifood_apps"},{"label":"Outro","value":"outro"}]'::jsonb, 23),

  ('divulgacao-atual', 'Situação Atual', 'Hoje você faz divulgação? Como?', '', 'long_text', false, 'Explique os canais e a frequência.', '[]'::jsonb, 30),
  ('anuncios-pagos', 'Situação Atual', 'Você já investe em anúncios pagos?', '', 'single_choice', false, '', '[{"label":"Sim","value":"sim"},{"label":"Não","value":"nao"},{"label":"Às vezes","value":"as_vezes"}]'::jsonb, 31),
  ('dificuldade-vender-mais', 'Situação Atual', 'Qual sua maior dificuldade hoje para vender mais?', '', 'long_text', false, 'Ex: tráfego, atendimento, apresentação, processo comercial.', '[]'::jsonb, 32),
  ('perde-clientes-concorrencia', 'Situação Atual', 'Você sente que está perdendo clientes para concorrentes?', '', 'long_text', false, 'Conte o que você percebe no dia a dia.', '[]'::jsonb, 33),

  ('objetivo-site', 'Objetivo com o Projeto', 'O que você mais quer alcançar com o site?', 'Pode marcar mais de uma meta.', 'multi_choice', true, '', '[{"label":"Aumentar vendas","value":"aumentar_vendas"},{"label":"Ter mais pedidos","value":"mais_pedidos"},{"label":"Ter mais clientes recorrentes","value":"clientes_recorrentes"},{"label":"Fortalecer a marca","value":"fortalecer_marca"}]'::jsonb, 40),
  ('resultado-proximos-meses', 'Objetivo com o Projeto', 'Qual resultado você espera nos próximos meses?', '', 'long_text', false, 'Ex: aumentar pedidos, ganhar autoridade, captar contatos.', '[]'::jsonb, 41),

  ('como-faz-pedido-hoje', 'Vendas e Conversão', 'Como o cliente faz pedido hoje?', '', 'long_text', false, 'WhatsApp, app, Instagram, balcão, ligação...', '[]'::jsonb, 50),
  ('facilidade-para-comprar', 'Vendas e Conversão', 'Você acha fácil ou complicado para o cliente comprar de você?', '', 'single_choice', false, '', '[{"label":"Fácil","value":"facil"},{"label":"Complicado","value":"complicado"},{"label":"Mais ou menos","value":"mais_ou_menos"}]'::jsonb, 51),
  ('perde-vendas-por-demora', 'Vendas e Conversão', 'Já perdeu vendas por demora ou dificuldade no atendimento?', '', 'single_choice', false, '', '[{"label":"Sim","value":"sim"},{"label":"Não","value":"nao"},{"label":"Às vezes","value":"as_vezes"}]'::jsonb, 52),
  ('automatizar-pedidos-atendimento', 'Vendas e Conversão', 'Você gostaria de automatizar pedidos ou atendimento?', '', 'single_choice', false, '', '[{"label":"Sim","value":"sim"},{"label":"Não","value":"nao"},{"label":"Talvez","value":"talvez"}]'::jsonb, 53),

  ('depender-menos-apps', 'Estratégia de Crescimento', 'Você quer depender menos de aplicativos como iFood?', '', 'single_choice', false, '', '[{"label":"Sim","value":"sim"},{"label":"Não","value":"nao"},{"label":"Ainda não sei","value":"ainda_nao_sei"}]'::jsonb, 60),
  ('controle-dos-clientes', 'Estratégia de Crescimento', 'Quer ter mais controle dos seus próprios clientes?', '', 'single_choice', false, '', '[{"label":"Sim","value":"sim"},{"label":"Não","value":"nao"}]'::jsonb, 61),
  ('lista-de-clientes', 'Estratégia de Crescimento', 'Gostaria de ter lista de clientes para divulgar promoções?', '', 'single_choice', false, '', '[{"label":"Sim","value":"sim"},{"label":"Não","value":"nao"},{"label":"Talvez","value":"talvez"}]'::jsonb, 62),

  ('faz-promocoes', 'Promoções e Ofertas', 'Você costuma fazer promoções?', '', 'single_choice', false, '', '[{"label":"Sim","value":"sim"},{"label":"Não","value":"nao"},{"label":"Só em datas específicas","value":"datas_especificas"}]'::jsonb, 70),
  ('promocao-mais-funciona', 'Promoções e Ofertas', 'Qual tipo de promoção funciona mais para você?', '', 'long_text', false, 'Ex: combo, desconto, frete, brinde.', '[]'::jsonb, 71),
  ('destacar-promocoes-no-site', 'Promoções e Ofertas', 'Quer destacar promoções no site?', '', 'single_choice', false, '', '[{"label":"Sim","value":"sim"},{"label":"Não","value":"nao"}]'::jsonb, 72),
  ('combos-ofertas', 'Promoções e Ofertas', 'Quer criar combos ou ofertas especiais?', '', 'single_choice', false, '', '[{"label":"Sim","value":"sim"},{"label":"Não","value":"nao"},{"label":"Talvez","value":"talvez"}]'::jsonb, 73),

  ('fotos-produtos', 'Conteúdo e Imagem', 'Você tem fotos boas dos produtos?', '', 'single_choice', false, '', '[{"label":"Sim","value":"sim"},{"label":"Não","value":"nao"},{"label":"Parcialmente","value":"parcialmente"}]'::jsonb, 80),
  ('apresentacao-atrai-clientes', 'Conteúdo e Imagem', 'Você acredita que sua apresentação hoje atrai clientes?', '', 'single_choice', false, '', '[{"label":"Sim","value":"sim"},{"label":"Não","value":"nao"},{"label":"Poderia melhorar","value":"poderia_melhorar"}]'::jsonb, 81),
  ('melhorar-aparencia-online', 'Conteúdo e Imagem', 'Quer melhorar a aparência do seu negócio online?', '', 'single_choice', false, '', '[{"label":"Sim","value":"sim"},{"label":"Não","value":"nao"}]'::jsonb, 82),
  ('enviar-fotos-materiais', 'Conteúdo e Imagem', 'Envie fotos, logos ou materiais que ajudam na apresentação', 'Use este campo para anexar arquivos visuais do negócio.', 'file_upload', false, '', '[]'::jsonb, 83),

  ('posicionamento-marca', 'Posicionamento', 'Você quer que sua marca seja vista como', '', 'single_choice', false, '', '[{"label":"Barata","value":"barata"},{"label":"Premium","value":"premium"},{"label":"Equilibrada","value":"equilibrada"}]'::jsonb, 90),
  ('quantidade-ou-valor', 'Posicionamento', 'Você prefere vender mais quantidade ou mais valor?', '', 'single_choice', false, '', '[{"label":"Mais quantidade","value":"mais_quantidade"},{"label":"Mais valor","value":"mais_valor"},{"label":"Equilíbrio entre os dois","value":"equilibrio"}]'::jsonb, 91),

  ('irrita-clientes', 'Experiência do Cliente', 'O que mais irrita seus clientes hoje?', '', 'long_text', false, 'Liste as principais fricções.', '[]'::jsonb, 100),
  ('melhorar-atendimento', 'Experiência do Cliente', 'O que você acha que poderia melhorar no atendimento?', '', 'long_text', false, 'Descreva o que mais pesa no dia a dia.', '[]'::jsonb, 101),
  ('reclamacoes-frequentes', 'Experiência do Cliente', 'Já recebeu reclamações frequentes? Quais?', '', 'long_text', false, 'Se houver padrões, descreva.', '[]'::jsonb, 102),

  ('botao-whatsapp', 'Funcionalidades', 'Quer botão direto para WhatsApp?', '', 'single_choice', false, '', '[{"label":"Sim","value":"sim"},{"label":"Não","value":"nao"}]'::jsonb, 110),
  ('sistema-pedidos', 'Funcionalidades', 'Quer sistema de pedidos automático?', '', 'single_choice', false, '', '[{"label":"Sim","value":"sim"},{"label":"Não","value":"nao"},{"label":"Talvez","value":"talvez"}]'::jsonb, 111),
  ('pagamento-online', 'Funcionalidades', 'Quer pagamento online?', '', 'single_choice', false, '', '[{"label":"Sim","value":"sim"},{"label":"Não","value":"nao"},{"label":"Talvez","value":"talvez"}]'::jsonb, 112),
  ('painel-gerenciar-pedidos', 'Funcionalidades', 'Quer painel para gerenciar pedidos?', '', 'single_choice', false, '', '[{"label":"Sim","value":"sim"},{"label":"Não","value":"nao"}]'::jsonb, 113),

  ('site-referencia', 'Design', 'Tem algum site que você goste?', 'Pode enviar links de referência visual.', 'url', false, 'https://site-de-referencia.com', '[]'::jsonb, 120),
  ('estilo-site', 'Design', 'Como quer o estilo do seu site?', '', 'long_text', true, 'Ex: moderno, premium, minimalista, agressivo em vendas.', '[]'::jsonb, 121),
  ('cores-desejadas', 'Design', 'Cores que deseja usar', '', 'short_text', false, 'Ex: preto, dourado e vermelho', '[]'::jsonb, 122),

  ('dobrar-clientes', 'Perguntas Estratégicas', 'Se seu negócio dobrasse de clientes hoje, você daria conta?', '', 'single_choice', false, '', '[{"label":"Sim","value":"sim"},{"label":"Não","value":"nao"},{"label":"Parcialmente","value":"parcialmente"}]'::jsonb, 130),
  ('maior-trava-crescimento', 'Perguntas Estratégicas', 'Qual é o maior problema que te impede de crescer hoje?', '', 'long_text', false, 'Ex: equipe, processo, tráfego, posicionamento.', '[]'::jsonb, 131),
  ('site-ou-estrutura-vendas', 'Perguntas Estratégicas', 'Você quer apenas um site ou uma estrutura para vender todos os dias?', '', 'single_choice', true, '', '[{"label":"Apenas um site","value":"apenas_site"},{"label":"Estrutura para vender todos os dias","value":"estrutura_vendas"},{"label":"Ainda estou entendendo","value":"ainda_entendendo"}]'::jsonb, 132),

  ('diferente-de-tudo', 'Final', 'Tem algo que você gostaria que fosse diferente de tudo que já viu?', '', 'long_text', false, 'Compartilhe uma visão, desejo ou referência forte.', '[]'::jsonb, 140),
  ('autoriza-estrategia', 'Final', 'Autoriza a NovaesWeb a criar uma estratégia personalizada para seu negócio?', '', 'single_choice', true, '', '[{"label":"Sim","value":"sim"},{"label":"Não","value":"nao"}]'::jsonb, 141)
on conflict (slug) do update set
  section_name = excluded.section_name,
  label = excluded.label,
  help_text = excluded.help_text,
  field_type = excluded.field_type,
  required_default = excluded.required_default,
  placeholder = excluded.placeholder,
  options = excluded.options,
  sort_order = excluded.sort_order,
  active = true;

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'briefing_templates'
  ) then
    execute 'alter publication supabase_realtime add table public.briefing_templates';
  end if;

  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'client_briefings'
  ) then
    execute 'alter publication supabase_realtime add table public.client_briefings';
  end if;

  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'client_briefing_fields'
  ) then
    execute 'alter publication supabase_realtime add table public.client_briefing_fields';
  end if;

  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'client_briefing_answers'
  ) then
    execute 'alter publication supabase_realtime add table public.client_briefing_answers';
  end if;

  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'briefing_attachments'
  ) then
    execute 'alter publication supabase_realtime add table public.briefing_attachments';
  end if;
end;
$$;
