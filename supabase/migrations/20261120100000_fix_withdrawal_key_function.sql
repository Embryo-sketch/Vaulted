-- Fix output-column ambiguity in the secure withdrawal key functions.
-- Run this after 20261120090000_secure_withdrawal_requests.sql.

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

  select wa.authorization_key, wa.generated_at into generated_key, existing_generated_at
  from public.withdrawal_authorizations wa where wa.user_id = target_user_id;

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
  return query select wa.authorization_key, wa.generated_at
  from public.withdrawal_authorizations wa where wa.user_id = target_user_id;
end;
$$;

revoke all on function public.generate_admin_withdrawal_private_key(uuid) from public;
revoke all on function public.get_admin_withdrawal_private_key(uuid) from public;
grant execute on function public.generate_admin_withdrawal_private_key(uuid) to authenticated;
grant execute on function public.get_admin_withdrawal_private_key(uuid) to authenticated;
