-- Migration 004: Full feature tables
-- bride_groom_profiles, guest_groups, wedding_plans, plan_task_groups, plan_tasks,
-- budget_plans, budget_categories, video_orders, video_catalog,
-- referral_codes, referrals, commissions, withdrawal_requests,
-- affiliate_products, website_settings

-- ─── Bride/Groom profiles ────────────────────────────────────────────────────
create table public.bride_groom_profiles (
  id         uuid primary key default gen_random_uuid(),
  card_id    uuid references public.wedding_cards(id) on delete cascade not null,
  role       text not null check (role in ('bride', 'groom')),
  full_name  text,
  email      text,
  phone      text,
  birthday   date,
  hometown   text,
  maps_url   text,
  description text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (card_id, role)
);

-- ─── Guest groups ────────────────────────────────────────────────────────────
create table public.guest_groups (
  id         uuid primary key default gen_random_uuid(),
  card_id    uuid references public.wedding_cards(id) on delete cascade not null,
  name       text not null,
  color      text default '#6366f1',
  created_at timestamptz default now()
);

-- Add group_id to guests
alter table public.guests add column if not exists
  group_id uuid references public.guest_groups(id) on delete set null;

-- Add gift tracking columns to guests
alter table public.guests add column if not exists gift_type  text check (gift_type in ('cash','gold','gift',null));
alter table public.guests add column if not exists gift_amount bigint;
alter table public.guests add column if not exists invite_sent boolean default false;
alter table public.guests add column if not exists attending   boolean;
alter table public.guests add column if not exists num_guests  int default 1;

-- ─── Wedding plans (kế hoạch cưới) ──────────────────────────────────────────
create table public.wedding_plans (
  id         uuid primary key default gen_random_uuid(),
  card_id    uuid references public.wedding_cards(id) on delete cascade not null,
  name       text not null default 'Kế hoạch cưới',
  note       text,
  budget     bigint default 0,
  created_at timestamptz default now()
);

create table public.plan_task_groups (
  id         uuid primary key default gen_random_uuid(),
  plan_id    uuid references public.wedding_plans(id) on delete cascade not null,
  name       text not null,
  sort_order int default 0,
  created_at timestamptz default now()
);

create table public.plan_tasks (
  id         uuid primary key default gen_random_uuid(),
  group_id   uuid references public.plan_task_groups(id) on delete cascade not null,
  title      text not null,
  status     text default 'pending' check (status in ('pending','in_progress','done')),
  due_date   date,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- ─── Budget management ───────────────────────────────────────────────────────
create table public.budget_plans (
  id           uuid primary key default gen_random_uuid(),
  card_id      uuid references public.wedding_cards(id) on delete cascade not null,
  name         text not null default 'Ngân sách đám cưới',
  total_budget bigint default 0,
  note         text,
  created_at   timestamptz default now()
);

create table public.budget_categories (
  id          uuid primary key default gen_random_uuid(),
  plan_id     uuid references public.budget_plans(id) on delete cascade not null,
  name        text not null,
  description text,
  estimated   bigint default 0,
  actual      bigint default 0,
  created_at  timestamptz default now()
);

-- ─── Video catalog & orders ──────────────────────────────────────────────────
create table public.video_catalog (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  description   text,
  price         bigint not null default 0,
  package       text default 'basic' check (package in ('basic','pro','vip')),
  thumbnail_url text,
  is_active     boolean default true,
  sort_order    int default 0,
  created_at    timestamptz default now()
);

create table public.video_orders (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references public.profiles(id) on delete cascade not null,
  card_id       uuid references public.wedding_cards(id) on delete set null,
  catalog_id    uuid references public.video_catalog(id) on delete set null,
  title         text not null,
  package       text default 'basic' check (package in ('basic','pro','vip')),
  status        text default 'created'
    check (status in ('created','pending_payment','paid','in_progress','delivered','completed','canceled')),
  price         bigint default 0,
  note          text,
  delivered_url text,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- ─── Referral system ─────────────────────────────────────────────────────────
create table public.referral_codes (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references public.profiles(id) on delete cascade not null unique,
  code       text unique not null,
  created_at timestamptz default now()
);

create table public.referrals (
  id               uuid primary key default gen_random_uuid(),
  referrer_id      uuid references public.profiles(id) on delete cascade not null,
  referred_user_id uuid references public.profiles(id) on delete cascade not null unique,
  created_at       timestamptz default now()
);

create table public.commissions (
  id          uuid primary key default gen_random_uuid(),
  referral_id uuid references public.referrals(id) on delete cascade not null,
  order_id    uuid references public.orders(id) on delete set null,
  amount      bigint not null default 0,
  status      text default 'pending' check (status in ('pending','available','paid','canceled')),
  paid_at     timestamptz,
  created_at  timestamptz default now()
);

create table public.withdrawal_requests (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid references public.profiles(id) on delete cascade not null,
  amount         bigint not null,
  bank_code      text,
  account_number text,
  account_name   text,
  status         text default 'pending' check (status in ('pending','approved','paid','rejected')),
  note           text,
  created_at     timestamptz default now(),
  updated_at     timestamptz default now()
);

-- ─── Affiliate products ──────────────────────────────────────────────────────
create table public.affiliate_products (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  description   text,
  category      text default 'other',
  price         bigint default 0,
  link_url      text,
  thumbnail_url text,
  is_active     boolean default true,
  sort_order    int default 0,
  created_at    timestamptz default now()
);

-- ─── Website settings ────────────────────────────────────────────────────────
create table public.website_settings (
  key        text primary key,
  value      jsonb not null default '{}',
  updated_at timestamptz default now()
);

-- ─── RLS ─────────────────────────────────────────────────────────────────────
alter table public.bride_groom_profiles enable row level security;
alter table public.guest_groups          enable row level security;
alter table public.wedding_plans         enable row level security;
alter table public.plan_task_groups      enable row level security;
alter table public.plan_tasks            enable row level security;
alter table public.budget_plans          enable row level security;
alter table public.budget_categories     enable row level security;
alter table public.video_catalog         enable row level security;
alter table public.video_orders          enable row level security;
alter table public.referral_codes        enable row level security;
alter table public.referrals             enable row level security;
alter table public.commissions           enable row level security;
alter table public.withdrawal_requests   enable row level security;
alter table public.affiliate_products    enable row level security;
alter table public.website_settings      enable row level security;

-- bride_groom_profiles: owner via card
create policy "Owner manages bride_groom_profiles"
  on public.bride_groom_profiles for all
  using (exists (select 1 from public.wedding_cards wc where wc.id = card_id and wc.user_id = auth.uid()));

-- guest_groups: owner via card
create policy "Owner manages guest_groups"
  on public.guest_groups for all
  using (exists (select 1 from public.wedding_cards wc where wc.id = card_id and wc.user_id = auth.uid()));

-- wedding_plans: owner via card
create policy "Owner manages wedding_plans"
  on public.wedding_plans for all
  using (exists (select 1 from public.wedding_cards wc where wc.id = card_id and wc.user_id = auth.uid()));

-- plan_task_groups: owner via plan → card
create policy "Owner manages plan_task_groups"
  on public.plan_task_groups for all
  using (exists (
    select 1 from public.wedding_plans wp
    join public.wedding_cards wc on wc.id = wp.card_id
    where wp.id = plan_id and wc.user_id = auth.uid()
  ));

-- plan_tasks: owner via group → plan → card
create policy "Owner manages plan_tasks"
  on public.plan_tasks for all
  using (exists (
    select 1 from public.plan_task_groups ptg
    join public.wedding_plans wp on wp.id = ptg.plan_id
    join public.wedding_cards wc on wc.id = wp.card_id
    where ptg.id = group_id and wc.user_id = auth.uid()
  ));

-- budget_plans: owner via card
create policy "Owner manages budget_plans"
  on public.budget_plans for all
  using (exists (select 1 from public.wedding_cards wc where wc.id = card_id and wc.user_id = auth.uid()));

-- budget_categories: owner via plan → card
create policy "Owner manages budget_categories"
  on public.budget_categories for all
  using (exists (
    select 1 from public.budget_plans bp
    join public.wedding_cards wc on wc.id = bp.card_id
    where bp.id = plan_id and wc.user_id = auth.uid()
  ));

-- video_catalog: public read; admin write
create policy "Public reads video_catalog"
  on public.video_catalog for select using (is_active = true);
create policy "Admin manages video_catalog"
  on public.video_catalog for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- video_orders: owner read/insert; admin all
create policy "Owner manages video_orders"
  on public.video_orders for all using (auth.uid() = user_id);
create policy "Admin manages video_orders"
  on public.video_orders for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- referral_codes: owner
create policy "Owner manages referral_codes"
  on public.referral_codes for all using (auth.uid() = user_id);

-- referrals: referrer read; authenticated insert
create policy "Referrer reads referrals"
  on public.referrals for select using (auth.uid() = referrer_id);
create policy "System inserts referrals"
  on public.referrals for insert with check (true);

-- commissions: referrer read; admin all
create policy "Referrer reads commissions"
  on public.commissions for select
  using (exists (select 1 from public.referrals r where r.id = referral_id and r.referrer_id = auth.uid()));
create policy "Admin manages commissions"
  on public.commissions for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- withdrawal_requests: owner
create policy "Owner manages withdrawal_requests"
  on public.withdrawal_requests for all using (auth.uid() = user_id);
create policy "Admin manages withdrawal_requests"
  on public.withdrawal_requests for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- affiliate_products: public read; admin write
create policy "Public reads affiliate_products"
  on public.affiliate_products for select using (is_active = true);
create policy "Admin manages affiliate_products"
  on public.affiliate_products for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- website_settings: public read; admin write
create policy "Public reads website_settings"
  on public.website_settings for select using (true);
create policy "Admin manages website_settings"
  on public.website_settings for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- ─── Triggers ────────────────────────────────────────────────────────────────
create trigger bride_groom_profiles_updated_at
  before update on public.bride_groom_profiles
  for each row execute function public.update_updated_at();

create trigger video_orders_updated_at
  before update on public.video_orders
  for each row execute function public.update_updated_at();

create trigger withdrawal_requests_updated_at
  before update on public.withdrawal_requests
  for each row execute function public.update_updated_at();

-- ─── Seed data ───────────────────────────────────────────────────────────────

-- Video catalog
insert into public.video_catalog (name, description, price, package, sort_order)
values
  ('Gói Basic', 'Video highlight 3-5 phút, nhạc nền, 1 lần chỉnh sửa', 1500000, 'basic', 1),
  ('Gói Pro', 'Video cinematic 8-10 phút, drone shot, 2 lần chỉnh sửa', 3500000, 'pro', 2),
  ('Gói VIP', 'Full film 20+ phút, concept art, unlimited chỉnh sửa, 4K', 7000000, 'vip', 3)
on conflict do nothing;

-- Affiliate products
insert into public.affiliate_products (name, description, category, price, link_url, thumbnail_url, sort_order)
values
  ('Album ảnh cưới cao cấp', 'Album da thật, in màu chất lượng cao, kích thước 30x40cm', 'photography',
   850000, 'https://shopee.vn', 'https://picsum.photos/seed/album/400/300', 1),
  ('Váy cưới thiết kế', 'Váy cưới đính đá Swarovski, đuôi dài 3m, đặt may theo số đo', 'dress',
   15000000, 'https://shopee.vn', 'https://picsum.photos/seed/dress/400/300', 2),
  ('Hoa cưới tươi cao cấp', 'Bó hoa cầm tay, trang trí bàn tiệc, hoa hồng Ecuador', 'flowers',
   2500000, 'https://shopee.vn', 'https://picsum.photos/seed/flowers/400/300', 3),
  ('Nhẫn cưới vàng 18k', 'Nhẫn cưới đôi vàng 18k có khắc tên, thiết kế tối giản', 'jewelry',
   6800000, 'https://shopee.vn', 'https://picsum.photos/seed/ring/400/300', 4),
  ('Xe hoa limousine', 'Thuê xe hoa Limousine 8 chỗ trang trí hoa tươi ngày cưới', 'transport',
   3200000, 'https://shopee.vn', 'https://picsum.photos/seed/limo/400/300', 5),
  ('Nước hoa cô dâu', 'Nước hoa Miss Dior Blooming Bouquet 100ml, hương hoa nhẹ nhàng', 'beauty',
   1890000, 'https://shopee.vn', 'https://picsum.photos/seed/perfume/400/300', 6),
  ('Bánh cưới 5 tầng', 'Bánh fondant 5 tầng, trang trí hoa đường, phục vụ 100 khách', 'cake',
   4500000, 'https://shopee.vn', 'https://picsum.photos/seed/cake/400/300', 7),
  ('Thiệp cưới in letterpress', 'Bộ 100 thiệp in letterpress cao cấp, giấy cotton 400gsm', 'stationery',
   1200000, 'https://shopee.vn', 'https://picsum.photos/seed/card/400/300', 8)
on conflict do nothing;

-- Website settings defaults
insert into public.website_settings (key, value)
values
  ('contact', '{"email":"hello@mewedding.vn","phone":"0282 2222 886","address":"Tầng 5, 77 Nguyễn Huệ, Q.1, TP.HCM","tax_url":"","working_hours":"8:00 - 22:00, Thứ 2 - Chủ Nhật"}'::jsonb),
  ('social', '{"facebook":"https://facebook.com/mewedding","tiktok":"https://tiktok.com/@mewedding","youtube":"https://youtube.com/@mewedding","zalo":"https://zalo.me/mewedding","instagram":""}'::jsonb),
  ('seo', '{"title":"meWedding — Thiệp cưới online đẹp nhất Việt Nam","description":"Tạo thiệp cưới online miễn phí, gửi link mời khách, quản lý RSVP và lời chúc. Hơn 1000 cặp đôi tin dùng.","og_image":""}'::jsonb),
  ('faq', '[{"q":"meWedding có miễn phí không?","a":"Gói Basic hoàn toàn miễn phí với đầy đủ tính năng cơ bản. Gói Pro và VIP có thêm các tính năng cao cấp."},{"q":"Thiệp cưới có hoạt động trên điện thoại không?","a":"Có, thiệp được tối ưu hoàn toàn cho cả điện thoại, máy tính bảng và desktop."},{"q":"Tôi có thể tùy chỉnh thiệp theo ý muốn không?","a":"Hoàn toàn có thể. Bạn có thể thay đổi template, màu sắc, font chữ, thêm nhạc nền và nhiều hơn nữa."},{"q":"Dữ liệu của tôi có an toàn không?","a":"Dữ liệu được lưu trữ an toàn trên hệ thống cloud, mã hóa SSL và backup hàng ngày."}]'::jsonb)
on conflict (key) do nothing;
