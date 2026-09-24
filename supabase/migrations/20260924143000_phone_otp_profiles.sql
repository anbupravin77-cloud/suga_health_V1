create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_name text;
  v_first_name text;
  v_last_name text;
begin
  v_name := nullif(trim(coalesce(new.raw_user_meta_data ->> 'full_name', '')), '');
  v_first_name := nullif(trim(coalesce(new.raw_user_meta_data ->> 'first_name', '')), '');
  v_last_name := nullif(trim(coalesce(new.raw_user_meta_data ->> 'last_name', '')), '');

  insert into public.profiles (
    id,
    email,
    phone_number,
    display_name,
    first_name,
    last_name,
    role
  )
  values (
    new.id,
    lower(new.email),
    new.phone,
    v_name,
    v_first_name,
    v_last_name,
    'patient'::public.user_role
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

revoke all on function private.handle_new_user() from public, anon, authenticated;
