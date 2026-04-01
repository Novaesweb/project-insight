create table if not exists public.ticket_support_meta (
  ticket_id uuid primary key references public.tickets(id) on delete cascade,
  assigned_to_user_id uuid null references public.usuarios(id) on delete set null,
  sla_hours integer null check (sla_hours is null or sla_hours > 0),
  due_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_ticket_support_meta_assigned_to_user_id
  on public.ticket_support_meta (assigned_to_user_id);

create index if not exists idx_ticket_support_meta_due_at
  on public.ticket_support_meta (due_at);

alter table public.ticket_support_meta enable row level security;

drop policy if exists "Admin read ticket_support_meta" on public.ticket_support_meta;
create policy "Admin read ticket_support_meta"
on public.ticket_support_meta
for select
to authenticated
using (public.is_admin());

drop policy if exists "Admin manage ticket_support_meta" on public.ticket_support_meta;
create policy "Admin manage ticket_support_meta"
on public.ticket_support_meta
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Service role full access ticket_support_meta" on public.ticket_support_meta;
create policy "Service role full access ticket_support_meta"
on public.ticket_support_meta
for all
to service_role
using (true)
with check (true);

insert into public.ticket_support_meta (
  ticket_id,
  assigned_to_user_id,
  sla_hours,
  due_at,
  updated_at
)
select
  entries.key::uuid,
  users.id,
  nullif(entries.value->>'slaHours', '')::integer,
  nullif(entries.value->>'dueAt', '')::timestamptz,
  coalesce(nullif(entries.value->>'updatedAt', '')::timestamptz, now())
from public.app_config config
cross join lateral jsonb_each(config.value::jsonb) as entries(key, value)
left join public.usuarios users
  on users.email = nullif(entries.value->>'assignedToEmail', '')
where config.key = 'support_ticket_meta'
on conflict (ticket_id) do update
set
  assigned_to_user_id = excluded.assigned_to_user_id,
  sla_hours = coalesce(excluded.sla_hours, public.ticket_support_meta.sla_hours),
  due_at = coalesce(excluded.due_at, public.ticket_support_meta.due_at),
  updated_at = greatest(public.ticket_support_meta.updated_at, excluded.updated_at);
