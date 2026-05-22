-- Ẩn mẫu React cũ (pre–Craft.js) khỏi kho giao diện marketing; giữ row cho thiệp legacy.

update public.templates
set is_active = false
where id in (
  'premium-save-the-date',
  'classic-white',
  'golden-luxury',
  'minimal-modern',
  'pastel-garden',
  'noir-elegant',
  'han-vibes',
  'forest-boho',
  'art-deco-rose'
);
