create table if not exists public.holdings (
  user_id uuid not null references public.profiles(id) on delete cascade,
  crypto_currency text not null,
  crypto_amount numeric(24, 8) not null check (crypto_amount > 0),
  usd_value numeric(14, 2) not null check (usd_value >= 0),
  updated_at timestamptz not null default now(),
  primary key (user_id, crypto_currency)
);

alter table public.transactions add column if not exists crypto_currency text;
alter table public.transactions add column if not exists crypto_amount numeric(24, 8);

create table if not exists public.deposit_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  crypto_currency text not null,
  claimed_amount numeric(24, 8) not null check (claimed_amount > 0),
  tx_hash text,
  status text not null default 'Pending' check (status in ('Pending', 'Confirmed', 'Rejected')),
  created_at timestamptz not null default now()
);

alter table public.holdings enable row level security;
alter table public.deposit_requests enable row level security;
drop policy if exists "Users view their own holdings" on public.holdings;
drop policy if exists "Admins view all holdings" on public.holdings;
drop policy if exists "Users view their own deposit requests" on public.deposit_requests;
drop policy if exists "Admins view all deposit requests" on public.deposit_requests;
create policy "Users view their own holdings" on public.holdings for select to authenticated using ((select auth.uid()) = user_id);
create policy "Admins view all holdings" on public.holdings for select to authenticated using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
create policy "Users view their own deposit requests" on public.deposit_requests for select to authenticated using ((select auth.uid()) = user_id);
create policy "Admins view all deposit requests" on public.deposit_requests for select to authenticated using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop function if exists public.review_deposit_request(uuid, text, numeric, text);

create or replace function public.review_deposit_request(
  request_id uuid,
  decision text,
  usd_amount numeric,
  review_note text default null
)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  request_record public.deposit_requests;
begin
  if (auth.jwt() -> 'app_metadata' ->> 'role') is distinct from 'admin' then
    raise exception 'Administrator access is required';
  end if;
  if decision not in ('Confirmed', 'Rejected') then raise exception 'Invalid decision'; end if;

  select * into request_record from public.deposit_requests where id = request_id for update;
  if not found then raise exception 'Deposit request not found'; end if;
  if request_record.status <> 'Pending' then raise exception 'Deposit request has already been reviewed'; end if;
  if decision = 'Confirmed' and (usd_amount is null or usd_amount <= 0) then raise exception 'A valid USD value is required'; end if;

  update public.deposit_requests set status = decision where id = request_id;

  if decision = 'Confirmed' then
    insert into public.holdings (user_id, crypto_currency, crypto_amount, usd_value)
    values (request_record.user_id, request_record.crypto_currency, request_record.claimed_amount, usd_amount)
    on conflict (user_id, crypto_currency) do update set
      crypto_amount = public.holdings.crypto_amount + excluded.crypto_amount,
      usd_value = public.holdings.usd_value + excluded.usd_value,
      updated_at = now();

    update public.profiles set portfolio_value = portfolio_value + usd_amount where id = request_record.user_id;
    insert into public.transactions (user_id, type, amount, note, crypto_currency, crypto_amount, created_by)
    values (request_record.user_id, 'Deposit', usd_amount, nullif(review_note, ''), request_record.crypto_currency, request_record.claimed_amount, auth.uid());
  end if;
end;
$$;

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
declare new_transaction public.transactions; current_available_cash numeric(14, 2);
begin
  if (auth.jwt() -> 'app_metadata' ->> 'role') is distinct from 'admin' then raise exception 'Administrator access is required'; end if;
  if transaction_type not in ('Deposit', 'Growth', 'Withdraw') or transaction_amount <= 0 then raise exception 'Invalid transaction'; end if;
  select available_cash into current_available_cash from public.profiles where id = target_user_id for update;
  if not found then raise exception 'User profile not found'; end if;
  if transaction_type = 'Withdraw' and current_available_cash < transaction_amount then raise exception 'Insufficient funds'; end if;
  update public.profiles set
    portfolio_value = greatest(0, portfolio_value + case when transaction_type = 'Withdraw' then -transaction_amount else transaction_amount end),
    available_cash = greatest(0, available_cash + case when transaction_type = 'Withdraw' then -transaction_amount else transaction_amount end)
  where id = target_user_id;
  insert into public.transactions (user_id, type, amount, note, created_by)
  values (target_user_id, transaction_type, transaction_amount, nullif(transaction_note, ''), auth.uid()) returning * into new_transaction;
  return new_transaction;
end;
$$;
