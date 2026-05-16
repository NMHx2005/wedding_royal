-- Thêm mẫu thiệp mẫu (idempotent)
insert into public.templates (id, name, description, thumbnail_url, preview_url, plan_required, style_tags, sort_order)
values
  ('pastel-garden', 'Pastel Garden', 'Tông pastel, hoa lá nhẹ nhàng', null, null, 'basic', array['Tự nhiên', 'Tối giản', 'Hàn Quốc'], 4),
  ('noir-elegant', 'Noir Elegant', 'Nền tối, typography vàng đồng', null, null, 'pro', array['Luxury', 'Vintage'], 5),
  ('han-vibes', 'Han Quốc Soft', 'Layout ảnh lớn, tone hồng đào', null, null, 'pro', array['Hàn Quốc', 'Tối giản'], 6),
  ('forest-boho', 'Forest Boho', 'Xanh lá, phong cách rustic ngoài trời', null, null, 'basic', array['Tự nhiên', 'Vintage'], 7),
  ('art-deco-rose', 'Art Deco Rose', 'Khối hình học, rose gold', null, null, 'vip', array['Luxury', 'Vintage'], 8)
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  plan_required = excluded.plan_required,
  style_tags = excluded.style_tags,
  sort_order = excluded.sort_order;
