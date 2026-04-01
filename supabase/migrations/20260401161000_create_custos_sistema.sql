create table if not exists public.custos_sistema (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  categoria text not null default 'infraestrutura',
  descricao text null,
  fornecedor text null,
  valor numeric(12, 2) not null check (valor >= 0),
  frequencia text not null default 'mensal'
    check (frequencia in ('mensal', 'anual', 'unico')),
  proxima_cobranca date null,
  dia_vencimento integer null
    check (dia_vencimento is null or dia_vencimento between 1 and 31),
  pagamento_automatico boolean not null default false,
  status text not null default 'ativo'
    check (status in ('ativo', 'pausado', 'cancelado')),
  observacoes text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_custos_sistema_status
  on public.custos_sistema (status);

create index if not exists idx_custos_sistema_proxima_cobranca
  on public.custos_sistema (proxima_cobranca);

create index if not exists idx_custos_sistema_categoria
  on public.custos_sistema (categoria);

alter table public.custos_sistema enable row level security;

drop policy if exists "Admin read custos_sistema" on public.custos_sistema;
create policy "Admin read custos_sistema"
on public.custos_sistema
for select
to authenticated
using (public.is_admin());

drop policy if exists "Admin manage custos_sistema" on public.custos_sistema;
create policy "Admin manage custos_sistema"
on public.custos_sistema
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Service role full access custos_sistema" on public.custos_sistema;
create policy "Service role full access custos_sistema"
on public.custos_sistema
for all
to service_role
using (true)
with check (true);
