-- ═══════════════════════════════════════════════
-- FIX: RLS policies for admin access
-- Run this in Supabase SQL Editor
-- The issue: "FOR ALL" policies require WITH CHECK 
-- for INSERT operations. Also fixing self-referencing
-- recursion on profiles table.
-- ═══════════════════════════════════════════════

-- Step 1: Create a SECURITY DEFINER function to check admin role
-- This avoids RLS recursion on the profiles table
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Step 2: Drop and recreate admin policies for ALL tables
-- Using the is_admin() function instead of subquery

-- PRODUCTS
DROP POLICY IF EXISTS "Admins full access products" ON products;
CREATE POLICY "Admins full access products" ON products FOR ALL 
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- PRODUCT IMAGES
DROP POLICY IF EXISTS "Admins full access images" ON product_images;
CREATE POLICY "Admins full access images" ON product_images FOR ALL 
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- PRODUCT VARIANTS
DROP POLICY IF EXISTS "Admins full access variants" ON product_variants;
CREATE POLICY "Admins full access variants" ON product_variants FOR ALL 
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- CATEGORIES
DROP POLICY IF EXISTS "Admins full access categories" ON categories;
CREATE POLICY "Admins full access categories" ON categories FOR ALL 
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- COLLECTIONS
DROP POLICY IF EXISTS "Admins full access collections" ON collections;
CREATE POLICY "Admins full access collections" ON collections FOR ALL 
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ORDERS
DROP POLICY IF EXISTS "Admins full access orders" ON orders;
CREATE POLICY "Admins full access orders" ON orders FOR ALL 
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ORDER ITEMS
DROP POLICY IF EXISTS "Admins full access order items" ON order_items;
CREATE POLICY "Admins full access order items" ON order_items FOR ALL 
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- COUPONS
DROP POLICY IF EXISTS "Admins full access coupons" ON coupons;
CREATE POLICY "Admins full access coupons" ON coupons FOR ALL 
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- REVIEWS
DROP POLICY IF EXISTS "Admins full access reviews" ON reviews;
CREATE POLICY "Admins full access reviews" ON reviews FOR ALL 
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- HERO BANNERS
DROP POLICY IF EXISTS "Admins full access banners" ON hero_banners;
CREATE POLICY "Admins full access banners" ON hero_banners FOR ALL 
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- NEWSLETTER
DROP POLICY IF EXISTS "Admins can view subscribers" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Admins full access newsletter" ON newsletter_subscribers;
CREATE POLICY "Admins full access newsletter" ON newsletter_subscribers FOR ALL 
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- SITE SETTINGS
DROP POLICY IF EXISTS "Admins full access settings" ON site_settings;
CREATE POLICY "Admins full access settings" ON site_settings FOR ALL 
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- DELIVERY SETTINGS
DROP POLICY IF EXISTS "Admins full access delivery" ON delivery_settings;
CREATE POLICY "Admins full access delivery" ON delivery_settings FOR ALL 
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- SIZE GUIDES
DROP POLICY IF EXISTS "Admins full access size guides" ON size_guides;
CREATE POLICY "Admins full access size guides" ON size_guides FOR ALL 
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- PROFILES (admin view all)
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT 
  USING (public.is_admin());

-- Step 3: Also allow admin to view inactive products (the public policy only shows active)
DROP POLICY IF EXISTS "Anyone can view active products" ON products;
CREATE POLICY "Anyone can view active products" ON products FOR SELECT 
  USING (is_active = TRUE OR public.is_admin());

-- Allow admin to view inactive categories/collections
DROP POLICY IF EXISTS "Anyone can view active categories" ON categories;
CREATE POLICY "Anyone can view active categories" ON categories FOR SELECT 
  USING (is_active = TRUE OR public.is_admin());

DROP POLICY IF EXISTS "Anyone can view active collections" ON collections;
CREATE POLICY "Anyone can view active collections" ON collections FOR SELECT 
  USING (is_active = TRUE OR public.is_admin());

DROP POLICY IF EXISTS "Anyone can view active coupons" ON coupons;
CREATE POLICY "Anyone can view active coupons" ON coupons FOR SELECT 
  USING (is_active = TRUE OR public.is_admin());

DROP POLICY IF EXISTS "Anyone can view active banners" ON hero_banners;
CREATE POLICY "Anyone can view active banners" ON hero_banners FOR SELECT 
  USING (is_active = TRUE OR public.is_admin());

DROP POLICY IF EXISTS "Anyone can view approved reviews" ON reviews;
CREATE POLICY "Anyone can view approved reviews" ON reviews FOR SELECT 
  USING (is_approved = TRUE OR public.is_admin());

-- Step 4: Verify your admin profile exists
-- If you see no results, you need to insert your profile manually
-- SELECT * FROM profiles WHERE role = 'admin';
-- 
-- If missing, run:
-- INSERT INTO profiles (id, full_name, role) 
-- VALUES ((SELECT id FROM auth.users WHERE email = 'zubairalltafdev@gmail.com'), 'Admin', 'admin')
-- ON CONFLICT (id) DO UPDATE SET role = 'admin';
