create table if not exists public.investments (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete cascade,
 tier text not null, source text not null check(source in ('cash','crypto')), amount numeric(14,2) not null check(amount>0), crypto_currency text, crypto_amount numeric(24,8), created_at timestamptz not null default now()
);
alter table public.investments add column if not exists crypto_amount numeric(24,8);
alter table public.investments enable row level security;
drop policy if exists "Users view own investments" on public.investments;
drop policy if exists "Admins view investments" on public.investments;
create policy "Users view own investments" on public.investments for select to authenticated using (user_id=auth.uid());
create policy "Admins view investments" on public.investments for select to authenticated using ((auth.jwt()->'app_metadata'->>'role')='admin');
create or replace function public.invest_with_cash(investment_tier text, investment_amount numeric) returns void language plpgsql security definer set search_path=public as $$
declare cap numeric; cash numeric;
begin
 select case investment_tier when 'starter' then 200 when 'growth' then 500 when 'advanced' then 1000 when 'premium' then 5000 when 'elite' then 10000 else null end into cap;
 if cap is null or investment_amount<>cap then raise exception 'This tier requires exactly $%.', cap; end if;
 select available_cash into cash from profiles where id=auth.uid() and status='Verified' for update;
 if cash is null then raise exception 'Your account must be verified before investing.'; end if;
 if cash<investment_amount then raise exception 'Insufficient available cash.'; end if;
 update profiles set available_cash=available_cash-investment_amount where id=auth.uid();
 insert into investments(user_id,tier,source,amount) values(auth.uid(),investment_tier,'cash',investment_amount);
 insert into transactions(user_id,type,amount,note) values(auth.uid(),'Deposit',investment_amount,'Cash investment — ' || investment_tier);
 perform public.create_notification(auth.uid(),auth.uid(),'user','investment','Cash investment created','Your ' || investment_tier || ' investment has been created.','/dashboard/investments');
end; $$;
grant execute on function public.invest_with_cash(text,numeric) to authenticated;

create or replace function public.invest_with_crypto(investment_tier text, investment_crypto text, investment_crypto_amount numeric, investment_usd_amount numeric) returns void language plpgsql security definer set search_path=public as $$
declare cap numeric; holding public.holdings;
begin
 select case investment_tier when 'starter' then 200 when 'growth' then 500 when 'advanced' then 1000 when 'premium' then 5000 when 'elite' then 10000 else null end into cap;
 if cap is null or investment_crypto_amount<=0 or abs(investment_usd_amount-cap)>0.01 then raise exception 'This tier requires exactly $%.', cap; end if;
 if not exists(select 1 from profiles where id=auth.uid() and status='Verified') then raise exception 'Your account must be verified before investing.'; end if;
 select * into holding from holdings where user_id=auth.uid() and crypto_currency=investment_crypto for update;
 if not found or holding.crypto_amount<investment_crypto_amount then raise exception 'Insufficient crypto holding.'; end if;
 update holdings set crypto_amount=crypto_amount-investment_crypto_amount, usd_value=greatest(0,usd_value-investment_usd_amount), updated_at=now() where user_id=auth.uid() and crypto_currency=investment_crypto;
 delete from holdings where user_id=auth.uid() and crypto_currency=investment_crypto and crypto_amount=0;
 insert into investments(user_id,tier,source,amount,crypto_currency,crypto_amount) values(auth.uid(),investment_tier,'crypto',investment_usd_amount,investment_crypto,investment_crypto_amount);
 insert into transactions(user_id,type,amount,note,crypto_currency,crypto_amount) values(auth.uid(),'Deposit',investment_usd_amount,'Crypto investment — ' || investment_tier,investment_crypto,investment_crypto_amount);
 perform public.create_notification(auth.uid(),auth.uid(),'user','investment','Crypto investment created','Your ' || investment_crypto || ' investment has been added to the ' || investment_tier || ' tier.','/dashboard/investments');
end; $$;
grant execute on function public.invest_with_crypto(text,text,numeric,numeric) to authenticated;
