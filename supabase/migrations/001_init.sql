-- Royal Wedding schema — run in Supabase SQL editor or supabase db push
-- Storage: create public buckets `wedding-photos`, `wedding-music` in Dashboard (public read for invitation URLs)

-- USERS (extend Supabase auth.users)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text,
  phone text,
  role text default 'user' check (role in ('user', 'admin')),
  created_at timestamptz default now()
);

-- WEDDING CARDS
create table public.wedding_cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  slug text unique not null,
  plan text default 'basic' check (plan in ('basic', 'pro', 'vip')),
  status text default 'draft' check (status in ('draft', 'active', 'expired')),

  bride_name text not null,
  bride_parents text,

  groom_name text not null,
  groom_parents text,

  wedding_date timestamptz not null,
  ceremony_time text,
  reception_time text,
  venue_name text,
  venue_address text,
  venue_maps_url text,

  love_story text,
  hashtag text,
  background_music_url text,
  cover_image_url text,

  template_id text not null default 'classic-white',
  primary_color text default '#d4a8b3',
  font_family text default 'Playfair Display',
  confetti_effect text default 'none' check (confetti_effect in ('none', 'hearts', 'snow', 'petals')),

  paid_at timestamptz,
  payment_order_id text,

  show_gift_box boolean default true,
  gift_bank_name text,
  gift_account_number text,
  gift_account_name text,
  gift_qr_url text,

  remove_branding boolean default false,
  custom_domain text,

  view_count bigint not null default 0,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.wedding_photos (
  id uuid primary key default gen_random_uuid(),
  card_id uuid references public.wedding_cards(id) on delete cascade not null,
  url text not null,
  caption text,
  sort_order int default 0,
  created_at timestamptz default now()
);

create table public.guests (
  id uuid primary key default gen_random_uuid(),
  card_id uuid references public.wedding_cards(id) on delete cascade not null,
  name text not null,
  phone text,
  email text,
  group_label text,
  token text unique default encode(gen_random_bytes(12), 'hex'),
  avatar_url text,
  is_vip boolean default false,
  created_at timestamptz default now()
);

create table public.rsvp (
  id uuid primary key default gen_random_uuid(),
  card_id uuid references public.wedding_cards(id) on delete cascade not null,
  guest_id uuid references public.guests(id) on delete set null,
  guest_name text not null,
  attending boolean not null,
  guest_count int default 1,
  note text,
  created_at timestamptz default now()
);

create table public.wishes (
  id uuid primary key default gen_random_uuid(),
  card_id uuid references public.wedding_cards(id) on delete cascade not null,
  guest_name text not null,
  message text not null,
  is_approved boolean default true,
  created_at timestamptz default now()
);

create table public.gift_logs (
  id uuid primary key default gen_random_uuid(),
  card_id uuid references public.wedding_cards(id) on delete cascade not null,
  guest_name text,
  amount bigint,
  note text,
  created_at timestamptz default now()
);

create table public.templates (
  id text primary key,
  name text not null,
  description text,
  thumbnail_url text,
  preview_url text,
  plan_required text default 'basic' check (plan_required in ('basic', 'pro', 'vip')),
  style_tags text[],
  is_active boolean default true,
  sort_order int default 0,
  created_at timestamptz default now()
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) not null,
  card_id uuid references public.wedding_cards(id),
  payos_order_id text unique not null,
  plan text not null,
  amount bigint not null,
  status text default 'pending' check (status in ('pending', 'paid', 'cancelled')),
  created_at timestamptz default now(),
  paid_at timestamptz
);

-- RLS
alter table public.profiles enable row level security;
alter table public.wedding_cards enable row level security;
alter table public.wedding_photos enable row level security;
alter table public.guests enable row level security;
alter table public.rsvp enable row level security;
alter table public.wishes enable row level security;
alter table public.gift_logs enable row level security;
alter table public.orders enable row level security;
alter table public.templates enable row level security;

create policy "Users can manage own profile"
  on public.profiles for all using (auth.uid() = id);

create policy "Owner can manage own cards"
  on public.wedding_cards for all using (auth.uid() = user_id);
create policy "Public can view active cards"
  on public.wedding_cards for select using (status = 'active');

create policy "Owner manages photos"
  on public.wedding_photos for all
  using (exists (select 1 from public.wedding_cards wc where wc.id = card_id and wc.user_id = auth.uid()));
create policy "Public can view photos of active cards"
  on public.wedding_photos for select
  using (exists (select 1 from public.wedding_cards wc where wc.id = card_id and wc.status = 'active'));

create policy "Owner manages guests"
  on public.guests for all
  using (exists (select 1 from public.wedding_cards wc where wc.id = card_id and wc.user_id = auth.uid()));

-- RSVP: insert only for active cards; owner reads all for their cards
create policy "Public can submit RSVP for active cards"
  on public.rsvp for insert
  with check (
    exists (select 1 from public.wedding_cards wc where wc.id = card_id and wc.status = 'active')
  );
create policy "Owner can view RSVPs"
  on public.rsvp for select
  using (exists (select 1 from public.wedding_cards wc where wc.id = card_id and wc.user_id = auth.uid()));

create policy "Public can post wish for active cards"
  on public.wishes for insert
  with check (
    exists (select 1 from public.wedding_cards wc where wc.id = card_id and wc.status = 'active')
  );
create policy "Owner manages wishes"
  on public.wishes for all
  using (exists (select 1 from public.wedding_cards wc where wc.id = card_id and wc.user_id = auth.uid()));
create policy "Public can read approved wishes for active cards"
  on public.wishes for select
  using (
    is_approved = true
    and exists (select 1 from public.wedding_cards wc where wc.id = card_id and wc.status = 'active')
  );

create policy "Public can log gift for active cards"
  on public.gift_logs for insert
  with check (
    exists (select 1 from public.wedding_cards wc where wc.id = card_id and wc.status = 'active')
  );
create policy "Owner reads gift logs"
  on public.gift_logs for select
  using (exists (select 1 from public.wedding_cards wc where wc.id = card_id and wc.user_id = auth.uid()));
create policy "Owner inserts gift logs"
  on public.gift_logs for insert
  with check (exists (select 1 from public.wedding_cards wc where wc.id = card_id and wc.user_id = auth.uid()));

create policy "Owner manages orders"
  on public.orders for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Public can read active templates"
  on public.templates for select using (is_active = true);
create policy "Admin manages templates"
  on public.templates for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- Functions & triggers
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.update_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger wedding_cards_updated_at
  before update on public.wedding_cards
  for each row execute function public.update_updated_at();

-- Seed templates
insert into public.templates (id, name, description, thumbnail_url, preview_url, plan_required, style_tags, sort_order)
values
  ('classic-white', 'Classic White', 'Nền trắng thanh lịch, font serif', null, null, 'basic', array['tối giản', 'Vintage'], 1),
  ('golden-luxury', 'Golden Luxury', 'Kem và vàng sang trọng', null, null, 'pro', array['Luxury', 'Vintage'], 2),
  ('minimal-modern', 'Minimal Modern', 'Tối giản hiện đại, accent tùy chỉnh', null, null, 'pro', array['Tối giản', 'Tự nhiên'], 3)
on conflict (id) do nothing;

-- Storage buckets (public read for invitation assets)
insert into storage.buckets (id, name, public)
values ('wedding-photos', 'wedding-photos', true), ('wedding-music', 'wedding-music', true)
on conflict (id) do update set public = excluded.public;

create policy "Public read wedding-photos"
  on storage.objects for select
  using (bucket_id = 'wedding-photos');

create policy "Auth upload wedding-photos"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'wedding-photos');

create policy "Auth update own wedding-photos"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'wedding-photos');

create policy "Auth delete own wedding-photos"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'wedding-photos');

create policy "Public read wedding-music"
  on storage.objects for select
  using (bucket_id = 'wedding-music');

create policy "Auth upload wedding-music"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'wedding-music');

create policy "Auth update wedding-music"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'wedding-music');

create policy "Auth delete wedding-music"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'wedding-music');
