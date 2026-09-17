do $$
begin
  if to_regclass('public.deposit_requests') is not null then
    execute 'drop policy if exists "Only verified users submit deposit requests" on public.deposit_requests';
    execute $policy$
      create policy "Only verified users submit deposit requests"
      on public.deposit_requests as restrictive for insert to authenticated
      with check (
        exists (
          select 1 from public.profiles
          where id = auth.uid() and status = 'Verified'
        )
      )
    $policy$;
  end if;
end
$$;
