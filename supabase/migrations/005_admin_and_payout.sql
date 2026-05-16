-- Payout bank info on profiles + plan prices in website_settings

alter table public.profiles
  add column if not exists payout_bank_code text,
  add column if not exists payout_account_number text,
  add column if not exists payout_account_name text;

insert into public.website_settings (key, value)
values (
  'plan_prices',
  '{
    "pro": {
      "name": "Gói Pro",
      "price": 199000,
      "description": "Thiệp cưới Pro — đầy đủ tính năng mời cưới chuyên nghiệp"
    },
    "vip": {
      "name": "Gói VIP",
      "price": 399000,
      "description": "Thiệp cưới VIP — full tính năng, giao diện độc quyền"
    }
  }'::jsonb
)
on conflict (key) do nothing;

alter table public.orders
  add column if not exists video_order_id uuid references public.video_orders(id) on delete set null;
