-- Require paid subscription (paid_at) for dashboard writes; admins bypass.
-- Run after 001–007. Inserts on wedding_cards still allowed for new users (draft card).

create or replace function public.auth_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;

create or replace function public.user_owns_card(card_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.wedding_cards wc
    where wc.id = card_uuid and wc.user_id = auth.uid()
  );
$$;

create or replace function public.user_owns_paid_card(card_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.auth_is_admin()
    or exists (
      select 1 from public.wedding_cards wc
      where wc.id = card_uuid
        and wc.user_id = auth.uid()
        and wc.paid_at is not null
    );
$$;

-- wedding_cards
drop policy if exists "Owner can manage own cards" on public.wedding_cards;

create policy "Owner can read own cards"
  on public.wedding_cards for select
  using (auth.uid() = user_id);

create policy "Owner can insert own cards"
  on public.wedding_cards for insert
  with check (auth.uid() = user_id);

create policy "Owner can update paid cards"
  on public.wedding_cards for update
  using (auth.uid() = user_id and paid_at is not null)
  with check (auth.uid() = user_id);

create policy "Owner can delete paid cards"
  on public.wedding_cards for delete
  using (auth.uid() = user_id and paid_at is not null);

create policy "Admin manages all cards"
  on public.wedding_cards for all
  using (public.auth_is_admin())
  with check (public.auth_is_admin());

-- wedding_photos
drop policy if exists "Owner manages photos" on public.wedding_photos;

create policy "Owner manages photos on paid cards"
  on public.wedding_photos for all
  using (public.user_owns_paid_card(card_id))
  with check (public.user_owns_paid_card(card_id));

-- guests
drop policy if exists "Owner manages guests" on public.guests;

create policy "Owner manages guests on paid cards"
  on public.guests for all
  using (public.user_owns_paid_card(card_id))
  with check (public.user_owns_paid_card(card_id));

-- wishes (owner dashboard; public insert unchanged)
drop policy if exists "Owner manages wishes" on public.wishes;

create policy "Owner manages wishes on paid cards"
  on public.wishes for all
  using (public.user_owns_paid_card(card_id))
  with check (public.user_owns_paid_card(card_id));

-- gift_logs owner writes
drop policy if exists "Owner reads gift logs" on public.gift_logs;
drop policy if exists "Owner inserts gift logs" on public.gift_logs;

create policy "Owner reads gift logs on paid cards"
  on public.gift_logs for select
  using (public.user_owns_paid_card(card_id));

create policy "Owner inserts gift logs on paid cards"
  on public.gift_logs for insert
  with check (public.user_owns_paid_card(card_id));

create policy "Owner updates gift logs on paid cards"
  on public.gift_logs for update
  using (public.user_owns_paid_card(card_id))
  with check (public.user_owns_paid_card(card_id));

create policy "Owner deletes gift logs on paid cards"
  on public.gift_logs for delete
  using (public.user_owns_paid_card(card_id));

-- 004 tables: bride/groom, guest groups, plans, budget, entitlements
drop policy if exists "Owner manages bride_groom_profiles" on public.bride_groom_profiles;
create policy "Owner manages bride_groom_profiles on paid cards"
  on public.bride_groom_profiles for all
  using (public.user_owns_paid_card(card_id))
  with check (public.user_owns_paid_card(card_id));

drop policy if exists "Owner manages guest_groups" on public.guest_groups;
create policy "Owner manages guest_groups on paid cards"
  on public.guest_groups for all
  using (public.user_owns_paid_card(card_id))
  with check (public.user_owns_paid_card(card_id));

drop policy if exists "Owner manages wedding_plans" on public.wedding_plans;
create policy "Owner manages wedding_plans on paid cards"
  on public.wedding_plans for all
  using (public.user_owns_paid_card(card_id))
  with check (public.user_owns_paid_card(card_id));

drop policy if exists "Owner manages plan_task_groups" on public.plan_task_groups;
create policy "Owner manages plan_task_groups on paid cards"
  on public.plan_task_groups for all
  using (
    exists (
      select 1 from public.wedding_plans wp
      where wp.id = plan_id and public.user_owns_paid_card(wp.card_id)
    )
  )
  with check (
    exists (
      select 1 from public.wedding_plans wp
      where wp.id = plan_id and public.user_owns_paid_card(wp.card_id)
    )
  );

drop policy if exists "Owner manages plan_tasks" on public.plan_tasks;
create policy "Owner manages plan_tasks on paid cards"
  on public.plan_tasks for all
  using (
    exists (
      select 1 from public.plan_task_groups ptg
      join public.wedding_plans wp on wp.id = ptg.plan_id
      where ptg.id = group_id and public.user_owns_paid_card(wp.card_id)
    )
  )
  with check (
    exists (
      select 1 from public.plan_task_groups ptg
      join public.wedding_plans wp on wp.id = ptg.plan_id
      where ptg.id = group_id and public.user_owns_paid_card(wp.card_id)
    )
  );

drop policy if exists "Owner manages budget_plans" on public.budget_plans;
create policy "Owner manages budget_plans on paid cards"
  on public.budget_plans for all
  using (public.user_owns_paid_card(card_id))
  with check (public.user_owns_paid_card(card_id));

drop policy if exists "Owner manages budget_categories" on public.budget_categories;
create policy "Owner manages budget_categories on paid cards"
  on public.budget_categories for all
  using (
    exists (
      select 1 from public.budget_plans bp
      where bp.id = plan_id and public.user_owns_paid_card(bp.card_id)
    )
  )
  with check (
    exists (
      select 1 from public.budget_plans bp
      where bp.id = plan_id and public.user_owns_paid_card(bp.card_id)
    )
  );

drop policy if exists "Owner can manage own card feature entitlements" on public.wedding_card_feature_entitlements;
create policy "Owner manages entitlements on paid cards"
  on public.wedding_card_feature_entitlements for all
  using (public.user_owns_paid_card(card_id))
  with check (public.user_owns_paid_card(card_id));

-- Storage: uploads only for paid cards (path: {cardId}/... or covers/{cardId}.ext)
create or replace function public.storage_path_card_id(object_name text)
returns uuid
language plpgsql
immutable
as $$
declare
  part1 text := split_part(object_name, '/', 1);
  part2 text := split_part(object_name, '/', 2);
begin
  if part1 = 'covers' and part2 <> '' then
    return split_part(part2, '.', 1)::uuid;
  end if;
  if part1 <> '' then
    return part1::uuid;
  end if;
  return null;
exception
  when others then
    return null;
end;
$$;

drop policy if exists "Auth upload wedding-photos" on storage.objects;
create policy "Auth upload wedding-photos paid card"
  on storage.objects for insert
  with check (
    bucket_id = 'wedding-photos'
    and auth.role() = 'authenticated'
    and (
      public.auth_is_admin()
      or public.user_owns_paid_card(public.storage_path_card_id(name))
    )
  );

drop policy if exists "Auth update own wedding-photos" on storage.objects;
create policy "Auth update wedding-photos paid card"
  on storage.objects for update
  using (
    bucket_id = 'wedding-photos'
    and auth.role() = 'authenticated'
    and (
      public.auth_is_admin()
      or public.user_owns_paid_card(public.storage_path_card_id(name))
    )
  );

drop policy if exists "Auth delete own wedding-photos" on storage.objects;
create policy "Auth delete wedding-photos paid card"
  on storage.objects for delete
  using (
    bucket_id = 'wedding-photos'
    and auth.role() = 'authenticated'
    and (
      public.auth_is_admin()
      or public.user_owns_paid_card(public.storage_path_card_id(name))
    )
  );
