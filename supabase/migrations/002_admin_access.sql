-- Helper to check current user's email against admin_allowlist (case-insensitive).
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists(
    select 1
    from public.admin_allowlist
    where lower(email) = lower(auth.jwt() ->> 'email')
  );
$$;

-- Write policies on bulletins.
create policy "allowlisted users can write bulletins"
  on public.bulletins for insert
  with check (public.is_admin());

create policy "allowlisted users can update bulletins"
  on public.bulletins for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "allowlisted users can delete bulletins"
  on public.bulletins for delete
  using (public.is_admin());

-- Write policies on bulletin_config.
create policy "allowlisted users can write bulletin_config"
  on public.bulletin_config for insert
  with check (public.is_admin());

create policy "allowlisted users can update bulletin_config"
  on public.bulletin_config for update
  using (public.is_admin())
  with check (public.is_admin());

-- Allowlist management policies.
create policy "allowlisted users can read admin_allowlist"
  on public.admin_allowlist for select
  using (public.is_admin());

create policy "allowlisted users can add to admin_allowlist"
  on public.admin_allowlist for insert
  with check (public.is_admin());

create policy "allowlisted users can remove from admin_allowlist"
  on public.admin_allowlist for delete
  using (public.is_admin());

-- Before User Created hook function — rejects OAuth signups whose email
-- isn't in admin_allowlist. Returns Supabase's standard hook envelope.
create or replace function public.check_user_allowlist(event jsonb)
returns jsonb
language plpgsql
security definer
as $$
declare
  user_email text;
  is_allowed boolean;
begin
  user_email := lower(event->'claims'->>'email');
  if user_email is null then
    return jsonb_build_object(
      'decision', 'reject',
      'message', 'No email claim present on signup.'
    );
  end if;
  select exists(
    select 1 from public.admin_allowlist where lower(email) = user_email
  ) into is_allowed;
  if not is_allowed then
    return jsonb_build_object(
      'decision', 'reject',
      'message', 'This email is not authorized to access the admin.'
    );
  end if;
  return jsonb_build_object('decision', 'continue');
end;
$$;

-- Grant the auth admin role permission to call the hook.
grant execute on function public.check_user_allowlist(jsonb) to supabase_auth_admin;
revoke execute on function public.check_user_allowlist(jsonb) from authenticated, anon, public;
