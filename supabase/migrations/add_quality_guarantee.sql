-- ═══════════════════════════════════════════════
-- ADD QUALITY GUARANTEE TO PRODUCTS
-- Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════════

-- Add the quality_guarantee column with a default of 'standard'
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS quality_guarantee TEXT DEFAULT 'standard';

-- If you already have some products you want to automatically set as premium,
-- you can uncomment and adjust the line below:
-- UPDATE public.products SET quality_guarantee = 'premium' WHERE price > 5000;
