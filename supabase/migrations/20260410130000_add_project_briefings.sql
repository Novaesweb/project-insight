create table if not exists public.project_briefings (
  id uuid primary key default gen_random_uuid(),
  projeto_id uuid not null references public.projetos(id) on delete cascade,
  cliente_id uuid not null references public.clientes(id) on delete cascade,
  titulo text not null,
  instrucoes text null,
  status text not null default 'rascunho',
  sent_at timestamptz null,
  started_at timestamptz null,
  submitted_at timestamptz null,
  completed_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint project_briefings_projeto_unique unique (projeto_id),
  constraint project_briefings_status_check check (
    status in ('rascunho', 'enviado', 'em_preenchimento', 'respondido', 'concluido')
  )
);

create table if not exists public.project_briefing_fields (
  id uuid primary key default gen_random_uuid(),
  briefing_id uuid not null references public.project_briefings(id) on delete cascade,
  section_name text not null default 'Geral',
  label text not null,
  help_text text null,
  field_type text not null default 'short_text',
  required boolean not null default false,
  placeholder text null,
  options jsonb not null default '[]'::jsonb,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint project_briefing_fields_type_check check (
    field_type in ('short_text', 'long_text', 'single_choice', 'multi_choice', 'url', 'file_upload')
  )
);

create table if not exists public.project_briefing_answers (
  id uuid primary key default gen_random_uuid(),
  briefing_id uuid not null references public.project_briefings(id) on delete cascade,
  field_id uuid not null references public.project_briefing_fields(id) on delete cascade,
  cliente_id uuid not null references public.clientes(id) on delete cascade,
  answer_text text null,
  answer_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint project_briefing_answers_field_cliente_unique unique (field_id, cliente_id)
);

create index if not exists project_briefings_cliente_id_idx
  on public.project_briefings (cliente_id);

create index if not exists project_briefings_status_idx
  on public.project_briefings (status);

create index if not exists project_briefing_fields_briefing_id_idx
  on public.project_briefing_fields (briefing_id, sort_order);

create index if not exists project_briefing_answers_briefing_id_idx
  on public.project_briefing_answers (briefing_id);

create index if not exists project_briefing_answers_cliente_id_idx
  on public.project_briefing_answers (cliente_id);

create or replace function public.touch_project_briefing_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_touch_project_briefings_updated_at on public.project_briefings;
create trigger trg_touch_project_briefings_updated_at
before update on public.project_briefings
for each row
execute function public.touch_project_briefing_updated_at();

drop trigger if exists trg_touch_project_briefing_fields_updated_at on public.project_briefing_fields;
create trigger trg_touch_project_briefing_fields_updated_at
before update on public.project_briefing_fields
for each row
execute function public.touch_project_briefing_updated_at();

drop trigger if exists trg_touch_project_briefing_answers_updated_at on public.project_briefing_answers;
create trigger trg_touch_project_briefing_answers_updated_at
before update on public.project_briefing_answers
for each row
execute function public.touch_project_briefing_updated_at();

alter table if exists public.projeto_arquivos
  add column if not exists source text not null default 'projeto',
  add column if not exists briefing_field_id uuid null references public.project_briefing_fields(id) on delete set null;

update public.projeto_arquivos
set source = 'projeto'
where source is null;

alter table public.project_briefings enable row level security;
alter table public.project_briefing_fields enable row level security;
alter table public.project_briefing_answers enable row level security;

grant select, insert, update, delete on public.project_briefings to authenticated;
grant select, insert, update, delete on public.project_briefing_fields to authenticated;
grant select, insert, update, delete on public.project_briefing_answers to authenticated;

drop policy if exists "Internal manage project_briefings" on public.project_briefings;
drop policy if exists "Clientes view own project_briefings" on public.project_briefings;
drop policy if exists "Clientes update own project_briefings" on public.project_briefings;

create policy "Internal manage project_briefings"
on public.project_briefings
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Clientes view own project_briefings"
on public.project_briefings
for select
to authenticated
using (cliente_id = public.get_cliente_id());

create policy "Clientes update own project_briefings"
on public.project_briefings
for update
to authenticated
using (cliente_id = public.get_cliente_id())
with check (cliente_id = public.get_cliente_id());

drop policy if exists "Internal manage project_briefing_fields" on public.project_briefing_fields;
drop policy if exists "Clientes view own project_briefing_fields" on public.project_briefing_fields;

create policy "Internal manage project_briefing_fields"
on public.project_briefing_fields
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Clientes view own project_briefing_fields"
on public.project_briefing_fields
for select
to authenticated
using (
  exists (
    select 1
    from public.project_briefings
    where project_briefings.id = project_briefing_fields.briefing_id
      and project_briefings.cliente_id = public.get_cliente_id()
  )
);

drop policy if exists "Internal manage project_briefing_answers" on public.project_briefing_answers;
drop policy if exists "Clientes manage own project_briefing_answers" on public.project_briefing_answers;

create policy "Internal manage project_briefing_answers"
on public.project_briefing_answers
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Clientes manage own project_briefing_answers"
on public.project_briefing_answers
for all
to authenticated
using (
  cliente_id = public.get_cliente_id()
  and exists (
    select 1
    from public.project_briefings
    where project_briefings.id = project_briefing_answers.briefing_id
      and project_briefings.cliente_id = public.get_cliente_id()
  )
)
with check (
  cliente_id = public.get_cliente_id()
  and exists (
    select 1
    from public.project_briefings
    where project_briefings.id = project_briefing_answers.briefing_id
      and project_briefings.cliente_id = public.get_cliente_id()
  )
);

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'project_briefings'
  ) then
    execute 'alter publication supabase_realtime add table public.project_briefings';
  end if;

  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'project_briefing_fields'
  ) then
    execute 'alter publication supabase_realtime add table public.project_briefing_fields';
  end if;

  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'project_briefing_answers'
  ) then
    execute 'alter publication supabase_realtime add table public.project_briefing_answers';
  end if;
end;
$$;
