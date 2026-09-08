-- ═══════════════════════════════════════════════
-- AYAT CLOTHING STORE — COMPLETE DATABASE SCHEMA
-- Run this in your Supabase SQL Editor
-- ═══════════════════════════════════════════════

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── ENUMS ──
CREATE TYPE user_role AS ENUM ('customer', 'admin');
CREATE TYPE gender_type AS ENUM ('men', 'women', 'children', 'unisex');
CREATE TYPE payment_method AS ENUM ('jazzcash', 'easypaisa');
CREATE TYPE payment_status AS ENUM ('pending', 'verified', 'rejected');
CREATE TYPE order_status AS ENUM (
  'pending', 'payment_pending', 'payment_verified', 'confirmed',
  'processing', 'packed', 'shipped', 'out_for_delivery',
  'delivered', 'cancelled', 'return_requested', 'returned'
);

-- ── PROFILES ──
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  whatsapp TEXT,
  role user_role DEFAULT 'customer',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── CATEGORIES ──
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  parent_id UUID REFERENCES categories(id),
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── COLLECTIONS ──
CREATE TABLE collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── PRODUCTS ──
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  short_description TEXT,
  category_id UUID REFERENCES categories(id),
  collection_id UUID REFERENCES collections(id),
  gender gender_type DEFAULT 'unisex',
  fabric TEXT,
  product_type TEXT,
  price NUMERIC(10,2) NOT NULL,
  sale_price NUMERIC(10,2),
  sku TEXT UNIQUE,
  stock_quantity INT DEFAULT 0,
  weight TEXT,
  care_instructions TEXT,
  product_details TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  is_new_arrival BOOLEAN DEFAULT FALSE,
  is_best_seller BOOLEAN DEFAULT FALSE,
  is_on_sale BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  offer_end_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_collection ON products(collection_id);
CREATE INDEX idx_products_gender ON products(gender);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_featured ON products(is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_products_new ON products(is_new_arrival) WHERE is_new_arrival = TRUE;

-- ── PRODUCT IMAGES ──
CREATE TABLE product_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  imagekit_file_id TEXT,
  alt_text TEXT,
  position INT DEFAULT 0,
  image_type TEXT DEFAULT 'gallery',
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_product_images_product ON product_images(product_id);

-- ── PRODUCT VARIANTS ──
CREATE TABLE product_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  color TEXT,
  size TEXT,
  stock_quantity INT DEFAULT 0,
  sku_suffix TEXT,
  price_adjustment NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_product_variants_product ON product_variants(product_id);

-- ── ADDRESSES ──
CREATE TABLE addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  province TEXT NOT NULL,
  postal_code TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── ORDERS ──
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT NOT NULL UNIQUE,
  customer_id UUID REFERENCES auth.users(id),
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  province TEXT NOT NULL,
  postal_code TEXT,
  subtotal NUMERIC(10,2) NOT NULL,
  discount NUMERIC(10,2) DEFAULT 0,
  delivery_fee NUMERIC(10,2) DEFAULT 0,
  total NUMERIC(10,2) NOT NULL,
  payment_method payment_method NOT NULL,
  payment_status payment_status DEFAULT 'pending',
  transaction_id TEXT,
  payment_proof_url TEXT,
  order_status order_status DEFAULT 'pending',
  coupon_code TEXT,
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(order_status);
CREATE INDEX idx_orders_number ON orders(order_number);

-- ── ORDER ITEMS ──
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  product_name TEXT NOT NULL,
  variant_info TEXT,
  quantity INT NOT NULL,
  unit_price NUMERIC(10,2) NOT NULL,
  total NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── CART ITEMS ──
CREATE TABLE cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES product_variants(id),
  quantity INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id, variant_id)
);

-- ── WISHLISTS ──
CREATE TABLE wishlist_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- ── COUPONS ──
CREATE TABLE coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('percentage', 'fixed')),
  value NUMERIC(10,2) NOT NULL,
  min_order NUMERIC(10,2) DEFAULT 0,
  max_discount NUMERIC(10,2),
  usage_limit INT,
  used_count INT DEFAULT 0,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  specific_products UUID[],
  specific_collections UUID[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── COUPON USAGE ──
CREATE TABLE coupon_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coupon_id UUID NOT NULL REFERENCES coupons(id),
  user_id UUID REFERENCES auth.users(id),
  order_id UUID REFERENCES orders(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── REVIEWS ──
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  customer_name TEXT,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  is_verified_purchase BOOLEAN DEFAULT FALSE,
  is_approved BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reviews_product ON reviews(product_id);

-- ── HERO BANNERS ──
CREATE TABLE hero_banners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  heading TEXT,
  subtitle TEXT,
  description TEXT,
  cta_text TEXT,
  cta_url TEXT,
  image_url TEXT,
  mobile_image_url TEXT,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── NEWSLETTER ──
CREATE TABLE newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT TRUE,
  subscribed_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── SIZE GUIDES ──
CREATE TABLE size_guides (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gender gender_type NOT NULL,
  sizes JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── DELIVERY SETTINGS ──
CREATE TABLE delivery_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  standard_rate NUMERIC(10,2) DEFAULT 250,
  free_threshold NUMERIC(10,2) DEFAULT 5000,
  estimated_days TEXT DEFAULT '2 to 5 working days'
);

-- ── SITE SETTINGS ──
CREATE TABLE site_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL
);

-- Insert default site settings
INSERT INTO site_settings (key, value) VALUES
  ('store_name', 'AYAT'),
  ('phone', '03049676311'),
  ('whatsapp', '923049676311'),
  ('email', 'info@ayatclothing.com'),
  ('jazzcash_name', 'Asad Shafique'),
  ('jazzcash_number', '03049676311'),
  ('easypaisa_name', 'Asad Shafique'),
  ('easypaisa_number', '03049676311');

-- Insert default delivery settings
INSERT INTO delivery_settings (standard_rate, free_threshold, estimated_days)
VALUES (250, 5000, '2 to 5 working days');

-- ═══════════════════════════════════════════════
-- ROW LEVEL SECURITY POLICIES
-- ═══════════════════════════════════════════════

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE size_guides ENABLE ROW LEVEL SECURITY;

-- PROFILES
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- PRODUCTS (public read for active)
CREATE POLICY "Anyone can view active products" ON products FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Admins full access products" ON products FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- PRODUCT IMAGES (public read)
CREATE POLICY "Anyone can view product images" ON product_images FOR SELECT USING (TRUE);
CREATE POLICY "Admins full access images" ON product_images FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- PRODUCT VARIANTS (public read)
CREATE POLICY "Anyone can view variants" ON product_variants FOR SELECT USING (TRUE);
CREATE POLICY "Admins full access variants" ON product_variants FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- CATEGORIES (public read active)
CREATE POLICY "Anyone can view active categories" ON categories FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Admins full access categories" ON categories FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- COLLECTIONS (public read active)
CREATE POLICY "Anyone can view active collections" ON collections FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Admins full access collections" ON collections FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ORDERS
CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (customer_id = auth.uid());
CREATE POLICY "Users can create orders" ON orders FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Admins full access orders" ON orders FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ORDER ITEMS
CREATE POLICY "Users can view own order items" ON order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.customer_id = auth.uid())
);
CREATE POLICY "Users can create order items" ON order_items FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Admins full access order items" ON order_items FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ADDRESSES
CREATE POLICY "Users manage own addresses" ON addresses FOR ALL USING (user_id = auth.uid());

-- CART
CREATE POLICY "Users manage own cart" ON cart_items FOR ALL USING (user_id = auth.uid());

-- WISHLIST
CREATE POLICY "Users manage own wishlist" ON wishlist_items FOR ALL USING (user_id = auth.uid());

-- COUPONS (public read active)
CREATE POLICY "Anyone can view active coupons" ON coupons FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Admins full access coupons" ON coupons FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- REVIEWS
CREATE POLICY "Anyone can view approved reviews" ON reviews FOR SELECT USING (is_approved = TRUE);
CREATE POLICY "Users can create reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Admins full access reviews" ON reviews FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- HERO BANNERS (public read active)
CREATE POLICY "Anyone can view active banners" ON hero_banners FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Admins full access banners" ON hero_banners FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- NEWSLETTER
CREATE POLICY "Anyone can subscribe" ON newsletter_subscribers FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Admins can view subscribers" ON newsletter_subscribers FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- SITE SETTINGS (public read)
CREATE POLICY "Anyone can read settings" ON site_settings FOR SELECT USING (TRUE);
CREATE POLICY "Admins full access settings" ON site_settings FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- DELIVERY SETTINGS (public read)
CREATE POLICY "Anyone can read delivery settings" ON delivery_settings FOR SELECT USING (TRUE);
CREATE POLICY "Admins full access delivery" ON delivery_settings FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- SIZE GUIDES (public read)
CREATE POLICY "Anyone can view size guides" ON size_guides FOR SELECT USING (TRUE);
CREATE POLICY "Admins full access size guides" ON size_guides FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ── FUNCTION: Auto-create profile on signup ──
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role_val user_role := 'customer';
BEGIN
  IF NEW.email = 'zubairalltafdev@gmail.com' THEN
    user_role_val := 'admin';
  END IF;

  INSERT INTO public.profiles (id, full_name, role)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', user_role_val);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ── STORAGE BUCKET ──
-- Run these in Supabase Dashboard > Storage
-- 1. Create bucket: "payment-proofs" (Private)
-- 2. Create policy: Allow authenticated users to upload to payment-proofs
-- 3. Create policy: Only admins can read from payment-proofs
