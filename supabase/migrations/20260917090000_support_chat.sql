create table if not exists public.support_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  sender text not null check (sender in ('user', 'admin')),
  body text not null check (char_length(trim(body)) between 1 and 2000),
  created_at timestamptz not null default now()
);

create index if not exists support_messages_user_id_created_at_idx
  on public.support_messages (user_id, created_at);

alter table public.support_messages enable row level security;

create policy "Users view their own support messages"
on public.support_messages for select to authenticated
using ((select auth.uid()) = user_id);

create policy "Users send their own support messages"
on public.support_messages for insert to authenticated
with check ((select auth.uid()) = user_id and sender = 'user');

create policy "Admins view all support messages"
on public.support_messages for select to authenticated
using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admins reply to support messages"
on public.support_messages for insert to authenticated
with check ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin' and sender = 'admin');
