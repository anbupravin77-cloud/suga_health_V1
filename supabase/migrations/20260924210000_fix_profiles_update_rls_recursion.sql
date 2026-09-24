drop policy if exists profiles_update on public.profiles;

create policy profiles_update
on public.profiles
for update
to public
using (
  (select auth.uid()) = id
  or (select public.get_current_role()) = 'admin'::public.user_role
)
with check (
  (select public.get_current_role()) = 'admin'::public.user_role
  or (
    (select auth.uid()) = id
    and role = (select public.get_current_role())
  )
);
