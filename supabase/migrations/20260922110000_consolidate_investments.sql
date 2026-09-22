alter table public.investments add column if not exists updated_at timestamptz not null default now();
alter table public.investments drop constraint if exists investments_source_check;
alter table public.investments add constraint investments_source_check check (source in ('cash', 'crypto', 'mixed'));

with grouped as (
  select user_id, tier, (array_agg(id order by created_at, id))[1] as keep_id, sum(amount) as total_amount,
    count(distinct source) as source_count, min(source) as only_source,
    count(distinct crypto_currency) filter (where crypto_currency is not null) as crypto_count,
    min(crypto_currency) as only_crypto, sum(crypto_amount) as total_crypto_amount
  from public.investments
  group by user_id, tier
)
update public.investments as investment set
  amount = grouped.total_amount,
  source = case when grouped.source_count = 1 then grouped.only_source else 'mixed' end,
  crypto_currency = case when grouped.source_count = 1 and grouped.only_source = 'crypto' and grouped.crypto_count = 1 then grouped.only_crypto else null end,
  crypto_amount = case when grouped.source_count = 1 and grouped.only_source = 'crypto' and grouped.crypto_count = 1 then grouped.total_crypto_amount else null end,
  updated_at = now()
from grouped where investment.id = grouped.keep_id;

with duplicates as (
  select id, row_number() over (partition by user_id, tier order by created_at, id) as position
  from public.investments
)
delete from public.investments using duplicates where public.investments.id = duplicates.id and duplicates.position > 1;

create unique index if not exists investments_user_tier_unique_idx on public.investments (user_id, tier);

create or replace function public.invest_with_cash(investment_tier text, investment_amount numeric) returns void language plpgsql security definer set search_path=public as $$
declare cap numeric; cash numeric;
begin
  select case investment_tier when 'starter' then 200 when 'growth' then 500 when 'advanced' then 1000 when 'premium' then 5000 when 'elite' then 10000 else null end into cap;
  if cap is null or investment_amount <> cap then raise exception 'This tier requires exactly $%.', cap; end if;
  select available_cash into cash from profiles where id = auth.uid() and status = 'Verified' for update;
  if cash is null then raise exception 'Your account must be verified before investing.'; end if;
  if cash < investment_amount then raise exception 'Insufficient available cash.'; end if;
  update profiles set available_cash = available_cash - investment_amount where id = auth.uid();
  insert into investments (user_id, tier, source, amount) values (auth.uid(), investment_tier, 'cash', investment_amount)
  on conflict (user_id, tier) do update set
    amount = public.investments.amount + excluded.amount,
    source = case when public.investments.source = excluded.source then excluded.source else 'mixed' end,
    crypto_currency = null, crypto_amount = null, updated_at = now();
  insert into transactions (user_id, type, amount, note) values (auth.uid(), 'Deposit', investment_amount, 'Cash investment — ' || investment_tier);
  perform public.create_notification(auth.uid(), auth.uid(), 'user', 'investment', 'Cash investment created', 'Your ' || investment_tier || ' investment has been received.', '/dashboard/investments');
end;
$$;
grant execute on function public.invest_with_cash(text, numeric) to authenticated;

create or replace function public.invest_with_crypto(investment_tier text, investment_crypto text, investment_crypto_amount numeric, investment_usd_amount numeric) returns void language plpgsql security definer set search_path=public as $$
declare cap numeric; holding public.holdings;
begin
  select case investment_tier when 'starter' then 200 when 'growth' then 500 when 'advanced' then 1000 when 'premium' then 5000 when 'elite' then 10000 else null end into cap;
  if cap is null or investment_crypto_amount <= 0 or abs(investment_usd_amount - cap) > 0.01 then raise exception 'This tier requires exactly $%.', cap; end if;
  if not exists (select 1 from profiles where id = auth.uid() and status = 'Verified') then raise exception 'Your account must be verified before investing.'; end if;
  select * into holding from holdings where user_id = auth.uid() and crypto_currency = investment_crypto for update;
  if not found or holding.crypto_amount < investment_crypto_amount then raise exception 'Insufficient crypto holding.'; end if;
  update holdings set crypto_amount = crypto_amount - investment_crypto_amount, usd_value = greatest(0, usd_value - investment_usd_amount), updated_at = now() where user_id = auth.uid() and crypto_currency = investment_crypto;
  delete from holdings where user_id = auth.uid() and crypto_currency = investment_crypto and crypto_amount = 0;
  insert into investments (user_id, tier, source, amount, crypto_currency, crypto_amount) values (auth.uid(), investment_tier, 'crypto', investment_usd_amount, investment_crypto, investment_crypto_amount)
  on conflict (user_id, tier) do update set
    amount = public.investments.amount + excluded.amount,
    source = case when public.investments.source = 'crypto' and public.investments.crypto_currency = excluded.crypto_currency then 'crypto' when public.investments.source = 'crypto' then 'mixed' when public.investments.source = 'mixed' then 'mixed' else 'mixed' end,
    crypto_currency = case when public.investments.source = 'crypto' and public.investments.crypto_currency = excluded.crypto_currency then public.investments.crypto_currency else null end,
    crypto_amount = case when public.investments.source = 'crypto' and public.investments.crypto_currency = excluded.crypto_currency then public.investments.crypto_amount + excluded.crypto_amount else null end,
    updated_at = now();
  insert into transactions (user_id, type, amount, note, crypto_currency, crypto_amount) values (auth.uid(), 'Deposit', investment_usd_amount, 'Crypto investment — ' || investment_tier, investment_crypto, investment_crypto_amount);
  perform public.create_notification(auth.uid(), auth.uid(), 'user', 'investment', 'Crypto investment created', 'Your ' || investment_crypto || ' investment has been received.', '/dashboard/investments');
end;
$$;
grant execute on function public.invest_with_crypto(text, text, numeric, numeric) to authenticated;

create or replace function public.adjust_user_investment_percentage(target_user_id uuid, target_investment_id uuid, adjustment_percentage numeric) returns void language plpgsql security definer set search_path=public as $$
declare current_investment public.investments; adjustment_amount numeric; new_amount numeric;
begin
  if (auth.jwt() -> 'app_metadata' ->> 'role') is distinct from 'admin' then raise exception 'Administrator access is required'; end if;
  if adjustment_percentage is null or adjustment_percentage <= -100 or adjustment_percentage = 0 or adjustment_percentage > 1000 then raise exception 'Enter a percentage greater than -100 and no more than 1000.'; end if;
  select * into current_investment from investments where id = target_investment_id and user_id = target_user_id for update;
  if not found then raise exception 'Investment not found'; end if;
  new_amount := round(current_investment.amount * (1 + adjustment_percentage / 100), 2);
  adjustment_amount := new_amount - current_investment.amount;
  update investments set amount = new_amount, updated_at = now() where id = target_investment_id;
  update profiles set portfolio_value = greatest(0, portfolio_value + adjustment_amount) where id = target_user_id;
  insert into transactions (user_id, type, amount, note, created_by) values (
    target_user_id, case when adjustment_amount > 0 then 'Growth' else 'Withdraw' end, abs(adjustment_amount),
    'Investment adjustment — ' || current_investment.tier || ' ' || case when adjustment_percentage > 0 then '+' else '' end || adjustment_percentage || '%', auth.uid()
  );
end;
$$;
grant execute on function public.adjust_user_investment_percentage(uuid, uuid, numeric) to authenticated;

create or replace function public.notify_user_on_manual_transaction() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.crypto_currency is null and new.created_by is not null then
    perform public.create_notification(new.user_id, new.user_id, 'user',
      case when new.note like 'Investment adjustment%' then 'investment' else 'account' end,
      case when new.note like 'Investment adjustment%' then 'Investment value updated' when new.type = 'Deposit' then 'Cash deposit added' when new.type = 'Growth' then 'Growth added to your account' else 'Withdrawal recorded' end,
      case when new.note like 'Investment adjustment%' then new.note else case when new.type = 'Deposit' then 'A cash deposit was added to your available balance.' when new.type = 'Growth' then 'A growth adjustment was added to your available balance.' else 'A withdrawal was recorded against your available balance.' end end,
      case when new.note like 'Investment adjustment%' then '/dashboard/investments' else '/dashboard/transactions' end
    );
  end if;
  return new;
end;
$$;
