create table if not exists public.kyc_submissions (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  full_name text not null,
  date_of_birth date not null,
  house_address text not null,
  phone_number text not null,
  id_document_path text not null,
  status text not null default 'Submitted' check (status in ('Submitted', 'Approved', 'Rejected')),
  submitted_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.kyc_submissions enable row level security;

create policy "Users view their own KYC submission"
on public.kyc_submissions for select to authenticated
using ((select auth.uid()) = user_id);

create policy "Users create their own KYC submission"
on public.kyc_submissions for insert to authenticated
with check ((select auth.uid()) = user_id and status = 'Submitted');

create policy "Users update their own KYC submission"
on public.kyc_submissions for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id and status = 'Submitted');

create policy "Admins view all KYC submissions"
on public.kyc_submissions for select to authenticated
using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admins update KYC submissions"
on public.kyc_submissions for update to authenticated
using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

insert into storage.buckets (id, name, public)
values ('kyc-documents', 'kyc-documents', false)
on conflict (id) do nothing;

create policy "Users upload their own KYC documents"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'kyc-documents'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

create policy "Users view their own KYC documents"
on storage.objects for select to authenticated
using (
  bucket_id = 'kyc-documents'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

create policy "Admins view all KYC documents"
on storage.objects for select to authenticated
using (
  bucket_id = 'kyc-documents'
  and (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);
