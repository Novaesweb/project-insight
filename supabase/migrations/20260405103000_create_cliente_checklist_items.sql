create table if not exists public.cliente_checklist_items (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references public.clientes(id) on delete cascade,
  item_key text not null,
  titulo text not null,
  descricao text,
  valor_texto text,
  status text not null default 'pendente' check (status in ('pendente', 'preenchido', 'aprovado')),
  ordem integer not null default 0,
  updated_by text check (updated_by in ('cliente', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (cliente_id, item_key)
);

create index if not exists cliente_checklist_items_cliente_id_idx
  on public.cliente_checklist_items (cliente_id);

create index if not exists cliente_checklist_items_status_idx
  on public.cliente_checklist_items (status);

create or replace function public.touch_cliente_checklist_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_touch_cliente_checklist_updated_at on public.cliente_checklist_items;

create trigger trg_touch_cliente_checklist_updated_at
before update on public.cliente_checklist_items
for each row
execute function public.touch_cliente_checklist_updated_at();

create or replace function public.seed_cliente_checklist_items(target_cliente_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.cliente_checklist_items (
    cliente_id,
    item_key,
    titulo,
    descricao,
    ordem
  )
  select
    target_cliente_id,
    item_key,
    titulo,
    descricao,
    ordem
  from (
    values
      ('logo_empresa', 'Logo da empresa', 'Envie a logo oficial que devemos usar no projeto.', 1),
      ('cores_marca', 'Cores da marca', 'Informe as cores principais e o estilo visual da sua marca.', 2),
      ('descricao_empresa', 'Descrição da empresa', 'Explique quem é sua empresa, o que faz e como quer se apresentar.', 3),
      ('servicos_principais', 'Serviços ou produtos principais', 'Liste os principais serviços, produtos ou categorias do seu negócio.', 4),
      ('horario_atendimento', 'Horário de atendimento', 'Informe os dias e horários de funcionamento ou resposta.', 5),
      ('formas_pagamento', 'Formas de pagamento', 'Diga quais meios de pagamento você quer divulgar ou aceitar.', 6),
      ('google_maps', 'Link do Google Maps', 'Cole o link da localização no Google Maps, se tiver.', 7),
      ('links_referencia', 'Links de referência', 'Envie perfis, sites ou exemplos que representam o estilo que você quer.', 8),
      ('observacoes_importantes', 'Observações importantes', 'Escreva qualquer detalhe importante para começarmos o projeto certo.', 9)
  ) as defaults(item_key, titulo, descricao, ordem)
  on conflict (cliente_id, item_key) do nothing;
end;
$$;

create or replace function public.handle_cliente_checklist_seed()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.seed_cliente_checklist_items(new.id);
  return new;
end;
$$;

drop trigger if exists trg_seed_cliente_checklist_items on public.clientes;

create trigger trg_seed_cliente_checklist_items
after insert on public.clientes
for each row
execute function public.handle_cliente_checklist_seed();

alter table public.cliente_checklist_items enable row level security;

grant select, insert, update, delete on public.cliente_checklist_items to authenticated;

drop policy if exists "Internal manage cliente checklist items" on public.cliente_checklist_items;
drop policy if exists "Clientes view own checklist items" on public.cliente_checklist_items;
drop policy if exists "Clientes update own checklist items" on public.cliente_checklist_items;

create policy "Internal manage cliente checklist items"
on public.cliente_checklist_items
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Clientes view own checklist items"
on public.cliente_checklist_items
for select
to authenticated
using (cliente_id = (select public.get_cliente_id()));

create policy "Clientes update own checklist items"
on public.cliente_checklist_items
for update
to authenticated
using (cliente_id = (select public.get_cliente_id()))
with check (
  cliente_id = (select public.get_cliente_id())
  and status in ('pendente', 'preenchido')
);

select public.seed_cliente_checklist_items(id)
from public.clientes;
