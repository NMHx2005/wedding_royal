-- Full plan tiers (basic + pro + vip) for admin / website_settings

insert into public.website_settings (key, value)
values (
  'plan_config',
  '{
    "basic": {
      "name": "Basic",
      "price": 198000,
      "discount_percent": 49,
      "description": "Gói Basic — thiệp cưới cơ bản",
      "max_cards": 1,
      "max_photos_album": 10,
      "max_photos": 10,
      "public_months": 6,
      "features": {
        "stats": false,
        "auto_approve_wishes": false,
        "photobook": false,
        "remove_branding": false,
        "custom_confetti": false,
        "export_wishes": false,
        "guest_rsvp": true,
        "personalized_invite": false
      }
    },
    "pro": {
      "name": "Gói Pro",
      "price": 199000,
      "discount_percent": 49,
      "description": "Gói Pro — nâng cấp",
      "max_cards": 2,
      "max_photos_album": 40,
      "max_photos": 40,
      "public_months": 24,
      "features": {
        "stats": true,
        "auto_approve_wishes": true,
        "photobook": true,
        "remove_branding": true,
        "custom_confetti": true,
        "export_wishes": true,
        "guest_rsvp": true,
        "personalized_invite": false
      }
    },
    "vip": {
      "name": "Gói VIP",
      "price": 399000,
      "discount_percent": 52,
      "description": "Gói VIP — nâng cấp",
      "max_cards": 3,
      "max_photos_album": 100,
      "max_photos": 100,
      "public_months": null,
      "features": {
        "stats": true,
        "auto_approve_wishes": true,
        "photobook": true,
        "remove_branding": true,
        "custom_confetti": true,
        "export_wishes": true,
        "guest_rsvp": true,
        "personalized_invite": true
      }
    }
  }'::jsonb
)
on conflict (key) do nothing;

-- Default affiliate commission rate (%), applied when auto-commission is implemented
insert into public.website_settings (key, value)
values ('affiliate_settings', '{"commission_rate_percent": 10, "min_withdrawal_vnd": 100000}'::jsonb)
on conflict (key) do nothing;
