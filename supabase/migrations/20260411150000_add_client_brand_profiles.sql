create table if not exists public.client_brand_profiles (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null unique references public.clientes(id) on delete cascade,
  primary_color text null,
  secondary_color text null,
  accent_color text null,
  font_heading text null,
  font_body text null,
  style_tags jsonb not null default '[]'::jsonb,
  references_text text null,
  inspiration_links text null,
  notes text null,
  logo_url text null,
  logo_storage_bucket text not null default 'projeto-arquivos',
  logo_storage_path text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists client_brand_profiles_cliente_idx
  on public.client_brand_profiles (cliente_id);

drop trigger if exists trg_touch_client_brand_profiles_updated_at on public.client_brand_profiles;
create trigger trg_touch_client_brand_profiles_updated_at
before update on public.client_brand_profiles
for each row
execute function public.touch_client_briefing_updated_at();

alter table public.client_brand_profiles enable row level security;
grant select, insert, update, delete on public.client_brand_profiles to authenticated;

drop policy if exists "Internal manage client_brand_profiles" on public.client_brand_profiles;
drop policy if exists "Clientes manage own client_brand_profiles" on public.client_brand_profiles;

create policy "Internal manage client_brand_profiles"
on public.client_brand_profiles
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Clientes manage own client_brand_profiles"
on public.client_brand_profiles
for all
to authenticated
using (cliente_id = public.get_cliente_id())
with check (cliente_id = public.get_cliente_id());

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'client_brand_profiles'
  ) then
    execute 'alter publication supabase_realtime add table public.client_brand_profiles';
  end if;
end
$$;
