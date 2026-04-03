create table if not exists public.lead_submission_log (
  id uuid primary key default gen_random_uuid(),
  fingerprint_hash text not null,
  email_hash text,
  phone_hash text,
  source text,
  origin_path text,
  user_agent text,
  created_at timestamp with time zone not null default now()
);

create index if not exists idx_lead_submission_log_created_at
  on public.lead_submission_log (created_at desc);

create index if not exists idx_lead_submission_log_fingerprint_created_at
  on public.lead_submission_log (fingerprint_hash, created_at desc);

alter table public.lead_submission_log enable row level security;

drop policy if exists "Internal manage lead_submission_log" on public.lead_submission_log;

create policy "Internal manage lead_submission_log"
on public.lead_submission_log
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Anyone can submit leads" on public.leads;

insert into public.app_config (key, value)
values
  ('email', 'contato@novaesweb.site'),
  ('whatsapp_number', '5551991189293')
on conflict (key) do update
set value = excluded.value;
