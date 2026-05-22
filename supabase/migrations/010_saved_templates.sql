-- Migration 010: Saved block/section templates per user
create table if not exists public.saved_templates (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        references auth.users on delete cascade,
  name        text        not null,
  category    text        not null default 'general',
  content_json jsonb      not null,
  created_at  timestamptz default now()
);

alter table public.saved_templates enable row level security;

create policy "Users can manage own saved templates"
  on public.saved_templates
  for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);
