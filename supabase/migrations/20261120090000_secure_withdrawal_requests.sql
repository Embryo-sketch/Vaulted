-- A Vaulted-issued authorization key, not a cryptocurrency wallet private key.
create table if not exists public.withdrawal_authorizations (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  authorization_key text not null,
  generated_at timestamptz not null default now(),
  generated_by uuid not null references public.profiles(id),
  access_granted_at timestamptz
);

create table if not exists public.withdrawal_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  amount numeric(14,2) not null check (amount > 0),
  account_holder_name text not null,
  bank_name text not null,
  account_number text,
  routing_number text,
  iban text,
  swift_bic text,
  country text,
  note text,
  status text not null default 'Pending' check (status in ('Pending', 'Approved', 'Rejected', 'Blocked')),
  review_reason text,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles(id)
);

create index if not exists withdrawal_requests_user_created_idx on public.withdrawal_requests (user_id, created_at desc);
create index if not exists withdrawal_requests_status_created_idx on public.withdrawal_requests (status, created_at desc);

alter table public.withdrawal_authorizations enable row level security;
alter table public.withdrawal_requests enable row level security;

drop policy if exists "Users view own withdrawal requests" on public.withdrawal_requests;
drop policy if exists "Admins view withdrawal requests" on public.withdrawal_requests;
create policy "Users view own withdrawal requests" on public.withdrawal_requests for select to authenticated using (user_id = (select auth.uid()));
create policy "Admins view withdrawal requests" on public.withdrawal_requests for select to authenticated using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create or replace function public.generate_admin_withdrawal_private_key(target_user_id uuid)
returns table (private_key text, generated_at timestamptz)
language plpgsql security definer set search_path = public as $$
declare generated_key text;
declare existing_generated_at timestamptz;
begin
  if (auth.jwt() -> 'app_metadata' ->> 'role') is distinct from 'admin' then
    raise exception 'Administrator access is required';
  end if;
  if not exists (select 1 from public.profiles where id = target_user_id) then
    raise exception 'User profile not found';
  end if;

  select authorization_key, generated_at into generated_key, existing_generated_at
  from public.withdrawal_authorizations where user_id = target_user_id;

  if found then
    return query select generated_key, existing_generated_at;
    return;
  end if;

  generated_key := upper(encode(gen_random_bytes(12), 'hex'));
  insert into public.withdrawal_authorizations (user_id, authorization_key, generated_at, generated_by)
  values (target_user_id, generated_key, now(), auth.uid())
  on conflict (user_id) do nothing;

  perform public.create_notification(
    target_user_id, target_user_id, 'user', 'account',
    'Secure withdrawal key available',
    'A Vaulted withdrawal authorization key has been generated. Contact Vaulted Financial to receive it before submitting a withdrawal request.',
    '/dashboard/withdraw'
  );

  return query select generated_key, now();
end;
$$;

create or replace function public.get_admin_withdrawal_private_key(target_user_id uuid)
returns table (private_key text, generated_at timestamptz)
language plpgsql security definer set search_path = public as $$
begin
  if (auth.jwt() -> 'app_metadata' ->> 'role') is distinct from 'admin' then
    raise exception 'Administrator access is required';
  end if;
  return query select authorization_key, generated_at
  from public.withdrawal_authorizations where user_id = target_user_id;
end;
$$;

create or replace function public.verify_withdrawal_private_key(provided_key text)
returns boolean
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'Authentication is required'; end if;
  if not exists (select 1 from public.profiles where id = auth.uid() and status = 'Verified') then
    raise exception 'Your account is not eligible for withdrawals';
  end if;
  if not exists (
    select 1 from public.withdrawal_authorizations
    where user_id = auth.uid()
      and authorization_key = upper(btrim(coalesce(provided_key, '')))
  ) then
    return false;
  end if;

  update public.withdrawal_authorizations
  set access_granted_at = coalesce(access_granted_at, now())
  where user_id = auth.uid();
  return true;
end;
$$;

create or replace function public.get_my_withdrawal_access()
returns boolean
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then return false; end if;
  return exists (
    select 1 from public.withdrawal_authorizations
    where user_id = auth.uid() and access_granted_at is not null
  ) and exists (
    select 1 from public.profiles where id = auth.uid() and status = 'Verified'
  );
end;
$$;

create or replace function public.create_secure_withdrawal_request(
  provided_key text,
  request_amount numeric,
  request_account_holder_name text,
  request_bank_name text,
  request_account_number text default null,
  request_routing_number text default null,
  request_iban text default null,
  request_swift_bic text default null,
  request_country text default null,
  request_note text default null
) returns uuid
language plpgsql security definer set search_path = public as $$
declare new_request_id uuid;
declare clean_iban text := nullif(upper(regexp_replace(coalesce(request_iban, ''), '[[:space:]]+', '', 'g')), '');
begin
  if auth.uid() is null then raise exception 'Authentication is required'; end if;
  if not exists (select 1 from public.profiles where id = auth.uid() and status = 'Verified') then
    raise exception 'Your account is not eligible for withdrawals';
  end if;
  if request_amount is null or request_amount <= 0 then raise exception 'Enter a valid withdrawal amount'; end if;
  if not exists (select 1 from public.profiles where id = auth.uid() and available_cash >= request_amount) then
    raise exception 'Withdrawal amount exceeds your available cash';
  end if;
  if not exists (select 1 from public.withdrawal_authorizations where user_id = auth.uid() and access_granted_at is not null) then
    raise exception 'Enter your withdrawal private key before submitting a request';
  end if;
  if nullif(btrim(coalesce(request_account_holder_name, '')), '') is null or nullif(btrim(coalesce(request_bank_name, '')), '') is null then
    raise exception 'Account holder name and bank name are required';
  end if;
  if clean_iban is null and nullif(btrim(coalesce(request_account_number, '')), '') is null then
    raise exception 'Enter an account number or IBAN';
  end if;

  insert into public.withdrawal_requests (
    user_id, amount, account_holder_name, bank_name, account_number, routing_number, iban, swift_bic, country, note
  ) values (
    auth.uid(), request_amount, btrim(request_account_holder_name), btrim(request_bank_name),
    nullif(btrim(coalesce(request_account_number, '')), ''), nullif(btrim(coalesce(request_routing_number, '')), ''),
    clean_iban, nullif(upper(btrim(coalesce(request_swift_bic, ''))), ''), nullif(btrim(coalesce(request_country, '')), ''), nullif(btrim(coalesce(request_note, '')), '')
  ) returning id into new_request_id;

  perform public.create_notification(
    null, auth.uid(), 'admin', 'withdrawal', 'Secure withdrawal request',
    'A customer submitted a secure withdrawal request for $' || to_char(request_amount, 'FM999,999,999,990.00') || '.',
    '/admin/users/' || auth.uid()::text
  );
  perform public.create_notification(
    auth.uid(), auth.uid(), 'user', 'withdrawal', 'Withdrawal request received',
    'Your secure withdrawal request is pending review by Vaulted Financial.',
    '/dashboard/transactions'
  );
  return new_request_id;
end;
$$;

create or replace function public.review_secure_withdrawal_request(
  request_id uuid,
  review_action text,
  review_reason text default null
) returns void
language plpgsql security definer set search_path = public as $$
declare request_record public.withdrawal_requests;
declare clean_reason text := nullif(btrim(coalesce(review_reason, '')), '');
begin
  if (auth.jwt() -> 'app_metadata' ->> 'role') is distinct from 'admin' then
    raise exception 'Administrator access is required';
  end if;
  if review_action not in ('Approved', 'Rejected', 'Blocked') then raise exception 'Invalid withdrawal review action'; end if;

  select * into request_record from public.withdrawal_requests where id = request_id for update;
  if not found then raise exception 'Withdrawal request not found'; end if;
  if request_record.status <> 'Pending' then raise exception 'This withdrawal request has already been reviewed'; end if;
  if review_action in ('Rejected', 'Blocked') and clean_reason is null then raise exception 'A reason is required'; end if;

  if review_action = 'Approved' then
    update public.profiles set available_cash = available_cash - request_record.amount
    where id = request_record.user_id and available_cash >= request_record.amount;
    if not found then raise exception 'The user no longer has enough available cash'; end if;
    insert into public.transactions (user_id, type, amount, note, created_by)
    values (request_record.user_id, 'Withdraw', request_record.amount, 'Secure withdrawal approved', auth.uid());
  elsif review_action = 'Blocked' then
    update public.profiles set status = 'Suspended' where id = request_record.user_id;
  end if;

  update public.withdrawal_requests set
    status = review_action,
    review_reason = clean_reason,
    reviewed_at = now(),
    reviewed_by = auth.uid()
  where id = request_record.id;

  perform public.create_notification(
    request_record.user_id, request_record.user_id, 'user', 'withdrawal',
    case review_action when 'Approved' then 'Withdrawal request approved' when 'Rejected' then 'Withdrawal request rejected' else 'Account blocked for review' end,
    case review_action
      when 'Approved' then 'Your withdrawal request has been approved and is being processed.'
      when 'Rejected' then 'Your withdrawal request was not approved. Reason: ' || clean_reason
      else 'Your account has been blocked while Vaulted Financial reviews this activity. Reason: ' || clean_reason
    end,
    case when review_action = 'Blocked' then '/dashboard' else '/dashboard/transactions' end
  );
end;
$$;

revoke all on function public.generate_admin_withdrawal_private_key(uuid) from public;
revoke all on function public.get_admin_withdrawal_private_key(uuid) from public;
revoke all on function public.verify_withdrawal_private_key(text) from public;
revoke all on function public.get_my_withdrawal_access() from public;
revoke all on function public.create_secure_withdrawal_request(text, numeric, text, text, text, text, text, text, text, text) from public;
revoke all on function public.review_secure_withdrawal_request(uuid, text, text) from public;
grant execute on function public.generate_admin_withdrawal_private_key(uuid) to authenticated;
grant execute on function public.get_admin_withdrawal_private_key(uuid) to authenticated;
grant execute on function public.verify_withdrawal_private_key(text) to authenticated;
grant execute on function public.get_my_withdrawal_access() to authenticated;
grant execute on function public.create_secure_withdrawal_request(text, numeric, text, text, text, text, text, text, text, text) to authenticated;
grant execute on function public.review_secure_withdrawal_request(uuid, text, text) to authenticated;
