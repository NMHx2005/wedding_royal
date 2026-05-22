-- Migration 011: Contact form submissions from marketing site

create table if not exists public.contact_inquiries (
  id         uuid        primary key default gen_random_uuid(),
  name       text        not null,
  phone      text,
  email      text,
  subject    text,
  message    text        not null,
  created_at timestamptz default now()
);

alter table public.contact_inquiries enable row level security;

-- Public may submit only; reads restricted to service role / admin policies elsewhere
create policy "Anyone can submit contact inquiry"
  on public.contact_inquiries
  for insert
  with check (true);

create policy "Admin reads contact inquiries"
  on public.contact_inquiries
  for select
  using (public.auth_is_admin());
