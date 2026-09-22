create table if not exists public.manual_deposit_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  amount numeric(14,2) not null check (amount > 0),
  note text,
  approval_code text not null check (approval_code ~ '^[0-9]{6}$'),
  status text not null default 'Pending' check (status in ('Pending', 'Approved', 'Cancelled')),
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  approved_at timestamptz,
  approved_by uuid references public.profiles(id)
);

create index if not exists manual_deposit_requests_user_created_idx on public.manual_deposit_requests (user_id, created_at desc);
alter table public.manual_deposit_requests enable row level security;

drop policy if exists "Users view own manual deposit requests" on public.manual_deposit_requests;
drop policy if exists "Admins view manual deposit requests" on public.manual_deposit_requests;
create policy "Users view own manual deposit requests" on public.manual_deposit_requests for select to authenticated using (user_id = auth.uid());
create policy "Admins view manual deposit requests" on public.manual_deposit_requests for select to authenticated using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create or replace function public.create_manual_deposit_request(
  target_user_id uuid,
  request_amount numeric,
  request_note text default null
) returns void language plpgsql security definer set search_path = public as $$
declare one_time_code text;
begin
  if (auth.jwt() -> 'app_metadata' ->> 'role') is distinct from 'admin' then
    raise exception 'Administrator access is required';
  end if;
  if request_amount is null or request_amount <= 0 then
    raise exception 'A valid deposit amount is required';
  end if;
  if not exists (select 1 from public.profiles where id = target_user_id) then
    raise exception 'User profile not found';
  end if;

  one_time_code := lpad(floor(random() * 1000000)::text, 6, '0');
  insert into public.manual_deposit_requests (user_id, amount, note, approval_code, created_by)
  values (target_user_id, request_amount, nullif(request_note, ''), one_time_code, auth.uid());

  perform public.create_notification(
    target_user_id, target_user_id, 'user', 'deposit-approval', 'Pending deposit request',
    'A manual deposit request for $' || to_char(request_amount, 'FM999,999,999,990.00') || ' is pending approval. Your one-time approval code is ' || one_time_code || '.',
    '/dashboard/notifications'
  );
end;
$$;
grant execute on function public.create_manual_deposit_request(uuid, numeric, text) to authenticated;

create or replace function public.approve_manual_deposit_request(
  request_id uuid,
  submitted_code text
) returns void language plpgsql security definer set search_path = public as $$
declare request_record public.manual_deposit_requests;
begin
  if (auth.jwt() -> 'app_metadata' ->> 'role') is distinct from 'admin' then
    raise exception 'Administrator access is required';
  end if;

  select * into request_record from public.manual_deposit_requests where id = request_id for update;
  if not found then raise exception 'Deposit request not found'; end if;
  if request_record.status <> 'Pending' then raise exception 'This deposit request has already been processed'; end if;
  if submitted_code is distinct from request_record.approval_code then raise exception 'The approval code does not match'; end if;

  update public.profiles set
    portfolio_value = portfolio_value + request_record.amount,
    available_cash = available_cash + request_record.amount
  where id = request_record.user_id;

  insert into public.transactions (user_id, type, amount, note, created_by)
  values (request_record.user_id, 'Deposit', request_record.amount, coalesce(request_record.note, 'Manual deposit approved'), auth.uid());

  update public.manual_deposit_requests set
    status = 'Approved', approved_at = now(), approved_by = auth.uid(), approval_code = '000000'
  where id = request_record.id;
end;
$$;
grant execute on function public.approve_manual_deposit_request(uuid, text) to authenticated;
