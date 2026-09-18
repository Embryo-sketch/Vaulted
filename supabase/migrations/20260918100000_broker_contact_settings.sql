create table if not exists public.broker_contact_settings (
  id boolean primary key default true check (id),
  broker_name text not null default '',
  broker_email text not null default '',
  broker_phone text not null default '',
  support_hours text not null default '',
  updated_at timestamptz not null default now()
);

insert into public.broker_contact_settings (id) values (true) on conflict (id) do nothing;

alter table public.broker_contact_settings enable row level security;
drop policy if exists "Authenticated users view broker contact settings" on public.broker_contact_settings;
drop policy if exists "Admins update broker contact settings" on public.broker_contact_settings;
create policy "Authenticated users view broker contact settings" on public.broker_contact_settings for select to authenticated using (true);
create policy "Admins update broker contact settings" on public.broker_contact_settings for update to authenticated using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin') with check ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
