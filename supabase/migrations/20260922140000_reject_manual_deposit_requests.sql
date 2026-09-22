alter table public.manual_deposit_requests
  add column if not exists rejection_reason text,
  add column if not exists rejected_at timestamptz,
  add column if not exists rejected_by uuid references public.profiles(id);

alter table public.manual_deposit_requests
  drop constraint if exists manual_deposit_requests_status_check;
alter table public.manual_deposit_requests
  add constraint manual_deposit_requests_status_check
  check (status in ('Pending', 'Approved', 'Rejected', 'Cancelled'));

create or replace function public.reject_manual_deposit_request(
  request_id uuid,
  rejection_reason text
) returns void
language plpgsql security definer set search_path = public as $$
declare request_record public.manual_deposit_requests;
declare clean_reason text := nullif(btrim(coalesce(rejection_reason, '')), '');
begin
  if (auth.jwt() -> 'app_metadata' ->> 'role') is distinct from 'admin' then
    raise exception 'Administrator access is required';
  end if;
  if clean_reason is null then
    raise exception 'A rejection reason is required';
  end if;

  select * into request_record
  from public.manual_deposit_requests
  where id = request_id
  for update;

  if not found then raise exception 'Deposit request not found'; end if;
  if request_record.status <> 'Pending' then
    raise exception 'This deposit request has already been processed';
  end if;

  update public.manual_deposit_requests set
    status = 'Rejected',
    rejection_reason = clean_reason,
    rejected_at = now(),
    rejected_by = auth.uid(),
    approval_code = '000000'
  where id = request_record.id;

  perform public.create_notification(
    request_record.user_id, request_record.user_id, 'user', 'deposit-approval',
    'Deposit request rejected',
    'Your manual deposit request for $' || to_char(request_record.amount, 'FM999,999,999,990.00') || ' was not approved. Reason: ' || clean_reason,
    '/dashboard/notifications'
  );
end;
$$;

revoke all on function public.reject_manual_deposit_request(uuid, text) from public;
grant execute on function public.reject_manual_deposit_request(uuid, text) to authenticated;
