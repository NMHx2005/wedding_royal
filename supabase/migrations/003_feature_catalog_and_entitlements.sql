-- Feature catalog + per-card entitlements
-- Admin can adjust price/info by editing `public.feature_catalog`.

-- Extend orders table to support feature purchases
alter table public.orders
  add column if not exists order_type text not null default 'plan',
  add column if not exists feature_keys text[];

-- Catalog of purchasable add-on features
create table if not exists public.feature_catalog (
  key text primary key,
  name text not null,
  description text not null default '',
  price bigint not null,
  thumbnail_url text,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.feature_catalog enable row level security;

create policy "Public can read active feature catalog"
  on public.feature_catalog
  for select
  using (is_active = true);

-- User entitlements per wedding card
create table if not exists public.wedding_card_feature_entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  card_id uuid references public.wedding_cards(id) on delete cascade not null,
  feature_key text not null references public.feature_catalog(key) on delete restrict,
  purchased_at timestamptz not null default now(),
  unique(card_id, feature_key)
);

alter table public.wedding_card_feature_entitlements enable row level security;

create policy "Owner can manage own card feature entitlements"
  on public.wedding_card_feature_entitlements
  for all
  using (
    exists (
      select 1
      from public.wedding_cards wc
      where wc.id = card_id and wc.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.wedding_cards wc
      where wc.id = card_id and wc.user_id = auth.uid()
    )
  );

-- Seed demo add-on features (fake data for now; admin can change later)
insert into public.feature_catalog (key, name, description, price, thumbnail_url, sort_order, is_active) values
  ('countdown_event', 'Đếm ngược thời gian đến sự kiện cưới', 'Đếm ngược thời gian đến ngày cưới trên trang thiệp.', 32400, null, 10, true),
  ('maps_directions', 'Tạo Map dẫn đường', 'Hiển thị bản đồ chỉ dẫn đến nơi diễn ra sự kiện cưới.', 32400, null, 20, true),
  ('stats', 'Thống kê thiệp', 'Thống kê lượt xem, khách mời, lời chúc,...', 54000, null, 30, true),
  ('page_effects', 'Hiệu ứng trang', 'Bổ sung hiệu ứng hiển thị trên trang thiệp.', 32400, null, 40, true),
  ('custom_font', 'Tùy chỉnh Font', 'Tùy chọn font chữ cho thiệp.', 32400, null, 50, true),
  ('custom_layout', 'Tuỳ chỉnh thay đổi, sắp xếp các mục, thiết kế giữa các mẫu với nhau', 'Tùy chỉnh giao diện và bố cục giữa các mẫu.', 86400, null, 60, true),
  ('open_effect', 'Hiệu ứng mở thiệp', 'Hiệu ứng mở thiệp tùy chọn.', 32400, null, 70, true),
  ('photobook', 'Photobook', 'Bổ sung Photobook online.', 86400, null, 80, true),
  ('card_password', 'Cài đặt mật khẩu cho Thiệp', 'Bảo vệ thiệp bằng mật khẩu.', 32400, null, 90, true),
  ('notification_popup', 'Mở khóa thông báo', 'Hiển thị popup thông báo cho người xem thiệp.', 54000, null, 100, true),
  ('page_template', 'Đổi template cho page', 'Thay đổi giao diện template cho trang thiệp.', 32400, null, 110, true),
  ('wishes_manager', 'Quản lý lời chúc', 'Gửi lời chúc và quản lý phản hồi lời chúc.', 86400, null, 120, true),
  ('video_upload', 'Tải lên Video', 'Tải lên video cưới / video khác.', 32400, null, 130, true),
  ('rsvp_advanced', 'Xác nhận tham dự và quản lý khách mời nâng cao', 'Nâng cấp quản lý RSVP và khách mời.', 86400, null, 140, true),
  ('basic_layout_custom', 'Tuỳ chỉnh sắp xếp các mục cơ bản', 'Tùy chỉnh một số mục cơ bản theo ý bạn.', 54000, null, 150, true),
  ('password_favicon', 'Cài đặt mật khẩu/Favicon cho Thiệp', 'Bảo vệ thiệp + favicon riêng.', 54000, null, 160, true),
  ('custom_font_upload', 'Tải Font theo ý', 'Tải font theo nhu cầu cá nhân.', 43200, null, 170, true),
  ('custom_audio_upload', 'Tải âm thanh tùy ý', 'Tải âm thanh nền theo nhu cầu.', 32400, null, 180, true),
  ('custom_page_effect_upload', 'Tải hiệu ứng trang tùy thích', 'Tải hiệu ứng trang bạn chọn.', 32400, null, 190, true),
  ('invite_personalized', 'Tạo và gửi thiệp mời online cho từng khách (cá nhân hoá)', 'Tạo thiệp mời online theo từng khách mời (có cá nhân hoá).', 108000, null, 200, true),
  ('event_add_to_calendar', 'Event - Thêm vào lịch', 'Thêm sự kiện vào lịch cho người xem.', 32400, null, 210, true),
  ('email_schedule', 'Hẹn giờ gửi email', 'Hẹn giờ gửi email nhắc sự kiện.', 54000, null, 220, true),
  ('remove_branding', 'Loại bỏ phần tử branding', 'Gỡ bỏ branding Royal Wedding trên thiệp.', 108000, null, 230, true),
  ('custom_domain', 'Tích hợp tên miền riêng', 'Kết nối tên miền riêng cho thiệp.', 64800, null, 240, true),
  ('custom_qr', 'Tùy chỉnh mã QR', 'Tùy chỉnh mã QR hiển thị.', 32400, null, 250, true),
  ('html_code', 'HTML code', 'Tuỳ chỉnh HTML code theo nhu cầu.', 32400, null, 260, true)
on conflict (key) do update
  set
    name = excluded.name,
    description = excluded.description,
    price = excluded.price,
    thumbnail_url = excluded.thumbnail_url,
    is_active = excluded.is_active,
    sort_order = excluded.sort_order,
    updated_at = now();

