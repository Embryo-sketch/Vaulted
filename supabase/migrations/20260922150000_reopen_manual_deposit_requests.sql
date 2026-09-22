create or replace function public.update_manual_deposit_request_status(
  request_id uuid,
  requested_status text,
  requested_rejection_reason text default null
) returns void
language plpgsql security definer set search_path = public as $$
declare request_record public.manual_deposit_requests;
declare clean_reason text := nullif(btrim(coalesce(requested_rejection_reason, '')), '');
declare new_one_time_code text;
declare reason_changed boolean;
begin
  if (auth.jwt() -> 'app_metadata' ->> 'role') is distinct from 'admin' then
    raise exception 'Administrator access is required';
  end if;
  if requested_status not in ('Pending', 'Rejected') then
    raise exception 'A manual deposit request can only be Pending or Rejected';
  end if;

  select * into request_record
  from public.manual_deposit_requests
  where id = request_id
  for update;

  if not found then raise exception 'Deposit request not found'; end if;
  if request_record.status not in ('Pending', 'Rejected') then
    raise exception 'Only pending or rejected deposit requests can be changed';
  end if;

  if requested_status = 'Pending' then
    if request_record.status = 'Pending' then return; end if;
    new_one_time_code := lpad(floor(random() * 1000000)::text, 6, '0');
    update public.manual_deposit_requests set
      status = 'Pending',
      approval_code = new_one_time_code,
      rejection_reason = null,
      rejected_at = null,
      rejected_by = null
    where id = request_record.id;

    perform public.create_notification(
      request_record.user_id, request_record.user_id, 'user', 'deposit-approval',
      'Deposit request pending approval',
      'Your manual deposit request for $' || to_char(request_record.amount, 'FM999,999,999,990.00') || ' is pending approval again. Your new one-time approval code is ' || new_one_time_code || '.',
      '/dashboard/notifications'
    );
    return;
  end if;

  if clean_reason is null then
    raise exception 'A rejection reason is required';
  end if;
  reason_changed := request_record.rejection_reason is distinct from clean_reason;
  if request_record.status = 'Rejected' and not reason_changed then return; end if;

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

revoke all on function public.update_manual_deposit_request_status(uuid, text, text) from public;
grant execute on function public.update_manual_deposit_request_status(uuid, text, text) to authenticated;
