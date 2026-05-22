-- Migration 009: Add content_json to templates and wedding_cards for Craft.js visual editor

-- Add content_json to templates table (admin stores template design as JSON node tree)
ALTER TABLE public.templates
  ADD COLUMN IF NOT EXISTS content_json jsonb;

-- Add content_json to wedding_cards table (user's customized card design)
ALTER TABLE public.wedding_cards
  ADD COLUMN IF NOT EXISTS content_json jsonb;

-- Comment for documentation
COMMENT ON COLUMN public.templates.content_json IS 'Craft.js serialized node tree for template design';
COMMENT ON COLUMN public.wedding_cards.content_json IS 'Craft.js serialized node tree for user card design (overrides template_id when present)';
