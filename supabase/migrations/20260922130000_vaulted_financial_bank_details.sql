-- Bank details assigned by Vaulted Financial to an individual user.
-- This table has no direct browser policies: only the guarded admin RPCs below
-- can read or write its values.
create table if not exists public.vaulted_financial_bank_details (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  account_number text not null check (account_number ~ '^[0-9]{4,34}$'),
  routing_number text not null check (routing_number ~ '^[0-9]{9}$'),
  updated_at timestamptz not null default now(),
  updated_by uuid not null references public.profiles(id)
);

alter table public.vaulted_financial_bank_details enable row level security;

create or replace function public.get_admin_user_bank_details(target_user_id uuid)
returns table (account_number text, routing_number text, updated_at timestamptz)
language plpgsql security definer set search_path = public as $$
begin
  if (auth.jwt() -> 'app_metadata' ->> 'role') is distinct from 'admin' then
    raise exception 'Administrator access is required';
  end if;

  return query
    select details.account_number, details.routing_number, details.updated_at
    from public.vaulted_financial_bank_details details
    where details.user_id = target_user_id;
end;
$$;

create or replace function public.save_admin_user_bank_details(
  target_user_id uuid,
  new_account_number text,
  new_routing_number text
) returns void
language plpgsql security definer set search_path = public as $$
declare
  clean_account_number text := regexp_replace(coalesce(new_account_number, ''), '[[:space:]]+', '', 'g');
  clean_routing_number text := regexp_replace(coalesce(new_routing_number, ''), '[[:space:]]+', '', 'g');
  existing_details public.vaulted_financial_bank_details;
  details_changed boolean;
begin
  if (auth.jwt() -> 'app_metadata' ->> 'role') is distinct from 'admin' then
    raise exception 'Administrator access is required';
  end if;
  if not exists (select 1 from public.profiles where id = target_user_id) then
    raise exception 'User profile not found';
  end if;
  if clean_account_number !~ '^[0-9]{4,34}$' then
    raise exception 'Enter an account number containing 4 to 34 digits';
  end if;
  if clean_routing_number !~ '^[0-9]{9}$' then
    raise exception 'Enter a valid 9-digit routing number';
  end if;

  select * into existing_details
  from public.vaulted_financial_bank_details
  where user_id = target_user_id;

  details_changed := not found
    or existing_details.account_number is distinct from clean_account_number
    or existing_details.routing_number is distinct from clean_routing_number;

  insert into public.vaulted_financial_bank_details (user_id, account_number, routing_number, updated_at, updated_by)
  values (target_user_id, clean_account_number, clean_routing_number, now(), auth.uid())
  on conflict (user_id) do update set
    account_number = excluded.account_number,
    routing_number = excluded.routing_number,
    updated_at = excluded.updated_at,
    updated_by = excluded.updated_by;

  if details_changed then
    perform public.create_notification(
      target_user_id, target_user_id, 'user', 'account',
      'Vaulted Financial bank details updated',
      'Your Vaulted Financial account and routing details were updated. You can review them in your profile.',
      '/dashboard/profile'
    );
  end if;
end;
$$;

create or replace function public.get_my_vaulted_financial_bank_details()
returns table (account_number text, routing_number text, updated_at timestamptz)
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then
    raise exception 'Authentication is required';
  end if;

  return query
    select details.account_number, details.routing_number, details.updated_at
    from public.vaulted_financial_bank_details details
    where details.user_id = auth.uid();
end;
$$;

revoke all on function public.get_admin_user_bank_details(uuid) from public;
revoke all on function public.save_admin_user_bank_details(uuid, text, text) from public;
revoke all on function public.get_my_vaulted_financial_bank_details() from public;
grant execute on function public.get_admin_user_bank_details(uuid) to authenticated;
grant execute on function public.save_admin_user_bank_details(uuid, text, text) to authenticated;
grant execute on function public.get_my_vaulted_financial_bank_details() to authenticated;
