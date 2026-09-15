create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  email text not null,
  status text not null default 'Pending' check (status in ('Verified', 'Pending', 'Suspended')),
  portfolio_value numeric(14, 2) not null default 0 check (portfolio_value >= 0),
  available_cash numeric(14, 2) not null default 0 check (available_cash >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in ('Deposit', 'Growth', 'Withdraw')),
  amount numeric(14, 2) not null check (amount > 0),
  note text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists transactions_user_id_created_at_idx
  on public.transactions (user_id, created_at desc);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.email, '')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

insert into public.profiles (id, full_name, email)
select
  id,
  coalesce(raw_user_meta_data ->> 'full_name', ''),
  coalesce(email, '')
from auth.users
on conflict (id) do nothing;

alter table public.profiles enable row level security;
alter table public.transactions enable row level security;

drop policy if exists "Users view their own profile" on public.profiles;
create policy "Users view their own profile"
on public.profiles for select to authenticated
using ((select auth.uid()) = id);

drop policy if exists "Admins view all profiles" on public.profiles;
create policy "Admins view all profiles"
on public.profiles for select to authenticated
using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "Admins update profiles" on public.profiles;
create policy "Admins update profiles"
on public.profiles for update to authenticated
using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "Users view their own transactions" on public.transactions;
create policy "Users view their own transactions"
on public.transactions for select to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Admins view all transactions" on public.transactions;
create policy "Admins view all transactions"
on public.transactions for select to authenticated
using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create or replace function public.record_admin_transaction(
  target_user_id uuid,
  transaction_type text,
  transaction_amount numeric,
  transaction_note text default null
)
returns public.transactions
language plpgsql
security definer set search_path = public
as $$
declare
  new_transaction public.transactions;
  current_available_cash numeric(14, 2);
begin
  if (auth.jwt() -> 'app_metadata' ->> 'role') is distinct from 'admin' then
    raise exception 'Administrator access is required';
  end if;

  if transaction_type not in ('Deposit', 'Growth', 'Withdraw') or transaction_amount <= 0 then
    raise exception 'Invalid transaction';
  end if;

  select available_cash into current_available_cash
  from public.profiles
  where id = target_user_id
  for update;

  if not found then
    raise exception 'User profile not found';
  end if;

  if transaction_type = 'Withdraw' and current_available_cash < transaction_amount then
    raise exception 'Insufficient funds';
  end if;

  update public.profiles
  set
    portfolio_value = greatest(0, portfolio_value + case when transaction_type = 'Withdraw' then -transaction_amount else transaction_amount end),
    available_cash = greatest(0, available_cash + case when transaction_type = 'Growth' then 0 when transaction_type = 'Withdraw' then -transaction_amount else transaction_amount end)
  where id = target_user_id;

  insert into public.transactions (user_id, type, amount, note, created_by)
  values (target_user_id, transaction_type, transaction_amount, nullif(transaction_note, ''), auth.uid())
  returning * into new_transaction;

  return new_transaction;
end;
$$;

revoke all on function public.record_admin_transaction(uuid, text, numeric, text) from public;
grant execute on function public.record_admin_transaction(uuid, text, numeric, text) to authenticated;