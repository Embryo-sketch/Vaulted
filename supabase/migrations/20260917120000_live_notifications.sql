create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid references public.profiles(id) on delete cascade,
  subject_user_id uuid references public.profiles(id) on delete cascade,
  audience text not null check (audience in ('admin', 'user')),
  category text not null,
  title text not null,
  body text not null,
  href text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists notifications_recipient_created_at_idx on public.notifications (recipient_id, created_at desc);
create index if not exists notifications_audience_created_at_idx on public.notifications (audience, created_at desc);

alter table public.notifications enable row level security;
drop policy if exists "Users view their notifications" on public.notifications;
drop policy if exists "Users read their notifications" on public.notifications;
drop policy if exists "Admins view notifications" on public.notifications;
drop policy if exists "Admins read notifications" on public.notifications;
create policy "Users view their notifications" on public.notifications for select to authenticated using (audience = 'user' and recipient_id = (select auth.uid()));
create policy "Users read their notifications" on public.notifications for update to authenticated using (audience = 'user' and recipient_id = (select auth.uid())) with check (audience = 'user' and recipient_id = (select auth.uid()));
create policy "Admins view notifications" on public.notifications for select to authenticated using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
create policy "Admins read notifications" on public.notifications for update to authenticated using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin') with check ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create or replace function public.create_notification(
  notification_recipient_id uuid,
  notification_subject_user_id uuid,
  notification_audience text,
  notification_category text,
  notification_title text,
  notification_body text,
  notification_href text default null
) returns void language plpgsql security definer set search_path = public as $$
begin
  insert into public.notifications (recipient_id, subject_user_id, audience, category, title, body, href)
  values (notification_recipient_id, notification_subject_user_id, notification_audience, notification_category, notification_title, notification_body, notification_href);
end;
$$;
revoke all on function public.create_notification(uuid, uuid, text, text, text, text, text) from public;

create or replace function public.notify_admin_on_signup() returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform public.create_notification(null, new.id, 'admin', 'signup', 'New account created', coalesce(nullif(new.full_name, ''), new.email) || ' created an account.');
  return new;
end;
$$;
drop trigger if exists profiles_notify_admin_on_signup on public.profiles;
create trigger profiles_notify_admin_on_signup after insert on public.profiles for each row execute procedure public.notify_admin_on_signup();

create or replace function public.notify_user_on_status_change() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if old.status is distinct from new.status then
    perform public.create_notification(new.id, new.id, 'user', 'verification',
      case new.status when 'Verified' then 'Account verified' when 'Suspended' then 'Account suspended' else 'Account verification pending' end,
      case new.status when 'Verified' then 'Your account is verified and ready for transactions.' when 'Suspended' then 'Your account has been suspended. Please contact support.' else 'Your account verification is pending review.' end,
      '/dashboard');
  end if;
  return new;
end;
$$;
drop trigger if exists profiles_notify_user_on_status_change on public.profiles;
create trigger profiles_notify_user_on_status_change after update of status on public.profiles for each row execute procedure public.notify_user_on_status_change();

create or replace function public.notify_admin_on_kyc_submission() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' or old.status is distinct from new.status then
    if new.status = 'Submitted' then
      perform public.create_notification(null, new.user_id, 'admin', 'kyc', 'KYC document submitted', 'A customer submitted KYC information for review.');
    elsif new.status = 'Approved' then
      perform public.create_notification(new.user_id, new.user_id, 'user', 'kyc', 'KYC approved', 'Your identity verification information has been approved.', '/dashboard/settings#kyc');
    elsif new.status = 'Rejected' then
      perform public.create_notification(new.user_id, new.user_id, 'user', 'kyc', 'KYC needs attention', 'Your KYC submission was not approved. Please update your information and submit it again.', '/dashboard/settings#kyc');
    end if;
  end if;
  return new;
end;
$$;
drop trigger if exists kyc_notify_admin_on_submission on public.kyc_submissions;
create trigger kyc_notify_admin_on_submission after insert or update on public.kyc_submissions for each row execute procedure public.notify_admin_on_kyc_submission();

create or replace function public.notify_on_deposit_request() returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform public.create_notification(null, new.user_id, 'admin', 'deposit', 'Crypto deposit awaiting review', new.crypto_currency || ' deposit claim needs confirmation.');
  return new;
end;
$$;
drop trigger if exists deposits_notify_admin_on_request on public.deposit_requests;
create trigger deposits_notify_admin_on_request after insert on public.deposit_requests for each row execute procedure public.notify_on_deposit_request();

create or replace function public.notify_user_on_deposit_review() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if old.status is distinct from new.status and new.status in ('Confirmed', 'Rejected') then
    perform public.create_notification(new.user_id, new.user_id, 'user', 'deposit',
      case when new.status = 'Confirmed' then 'Crypto deposit confirmed' else 'Crypto deposit not confirmed' end,
      case when new.status = 'Confirmed' then new.crypto_currency || ' has been added to your holdings.' else 'Your ' || new.crypto_currency || ' deposit claim was not confirmed. Contact support if you need help.' end,
      case when new.status = 'Confirmed' then '/dashboard' else '/dashboard/deposit' end);
  end if;
  return new;
end;
$$;
drop trigger if exists deposits_notify_user_on_review on public.deposit_requests;
create trigger deposits_notify_user_on_review after update of status on public.deposit_requests for each row execute procedure public.notify_user_on_deposit_review();

create or replace function public.notify_on_support_message() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.sender = 'user' then
    perform public.create_notification(null, new.user_id, 'admin', 'support', 'New support message', 'A customer sent a message to support.', '/admin/support');
  else
    perform public.create_notification(new.user_id, new.user_id, 'user', 'support', 'Support replied', 'You have a new message from the Vaulted support team.', null);
  end if;
  return new;
end;
$$;
drop trigger if exists support_notify_on_message on public.support_messages;
create trigger support_notify_on_message after insert on public.support_messages for each row execute procedure public.notify_on_support_message();

create or replace function public.notify_user_on_manual_transaction() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.crypto_currency is null and new.created_by is not null then
    perform public.create_notification(new.user_id, new.user_id, 'user', 'account',
      case new.type when 'Deposit' then 'Cash deposit added' when 'Growth' then 'Growth added to your account' else 'Withdrawal recorded' end,
      case new.type when 'Deposit' then 'A cash deposit was added to your available balance.' when 'Growth' then 'A growth adjustment was added to your available balance.' else 'A withdrawal was recorded against your available balance.' end,
      '/dashboard/transactions');
  end if;
  return new;
end;
$$;
drop trigger if exists transactions_notify_user_on_manual_transaction on public.transactions;
create trigger transactions_notify_user_on_manual_transaction after insert on public.transactions for each row execute procedure public.notify_user_on_manual_transaction();

do $$ begin
  alter publication supabase_realtime add table public.notifications;
exception when duplicate_object then null;
end $$;
