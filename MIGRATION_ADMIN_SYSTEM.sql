-- =====================================================
-- ADMIN SYSTEM & CONTENT MANAGEMENT MIGRATION
-- =====================================================
-- Bu migration'ı Supabase SQL Editor'de çalıştırın

-- 1. ADD ADMIN FIELD TO PROFILES
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- 2. UPDATE DEFAULT CREDITS TO 10
ALTER TABLE profiles ALTER COLUMN credits SET DEFAULT 10;

-- 3. UPDATE TRIGGER TO GIVE 10 CREDITS ON SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, credits, is_admin)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    10,  -- Initial credits changed from 0 to 10
    false  -- Default to non-admin
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. HERO VIDEOS TABLE
CREATE TABLE IF NOT EXISTS hero_videos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  video_url TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for hero_videos
ALTER TABLE hero_videos ENABLE ROW LEVEL SECURITY;

-- Anyone can view active hero videos
CREATE POLICY "Anyone can view active hero videos" ON hero_videos
  FOR SELECT USING (is_active = true);

-- Only admins can insert hero videos
CREATE POLICY "Admins can insert hero videos" ON hero_videos
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

-- Only admins can update hero videos
CREATE POLICY "Admins can update hero videos" ON hero_videos
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

-- Only admins can delete hero videos
CREATE POLICY "Admins can delete hero videos" ON hero_videos
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

-- 5. SHOWCASE IMAGES TABLE
CREATE TABLE IF NOT EXISTS showcase_images (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  image_url TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('sketch', 'product', 'model', 'video')),
  order_index INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for showcase_images
ALTER TABLE showcase_images ENABLE ROW LEVEL SECURITY;

-- Anyone can view active showcase images
CREATE POLICY "Anyone can view active showcase images" ON showcase_images
  FOR SELECT USING (is_active = true);

-- Only admins can insert showcase images
CREATE POLICY "Admins can insert showcase images" ON showcase_images
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

-- Only admins can update showcase images
CREATE POLICY "Admins can update showcase images" ON showcase_images
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

-- Only admins can delete showcase images
CREATE POLICY "Admins can delete showcase images" ON showcase_images
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

-- 6. SITE SETTINGS TABLE
CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('string', 'number', 'boolean', 'json')),
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for site_settings
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can view settings (for initial credits, etc.)
CREATE POLICY "Anyone can view settings" ON site_settings
  FOR SELECT USING (true);

-- Only admins can insert settings
CREATE POLICY "Admins can insert settings" ON site_settings
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

-- Only admins can update settings
CREATE POLICY "Admins can update settings" ON site_settings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

-- Insert default settings
INSERT INTO site_settings (key, value, type, description) VALUES
  ('initial_credits', '10', 'number', 'Credits given to new users'),
  ('credit_package_small_credits', '50', 'number', 'Small package credits'),
  ('credit_package_small_price', '250', 'number', 'Small package price (TL)'),
  ('credit_package_medium_credits', '100', 'number', 'Medium package credits'),
  ('credit_package_medium_price', '500', 'number', 'Medium package price (TL)'),
  ('credit_package_large_credits', '200', 'number', 'Large package credits'),
  ('credit_package_large_price', '1000', 'number', 'Large package price (TL)')
ON CONFLICT (key) DO NOTHING;

-- 7. UPDATE TRANSACTIONS TABLE (add payment_method field)
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'paytr';

-- 8. CREATE INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_hero_videos_active_order ON hero_videos(is_active, order_index);
CREATE INDEX IF NOT EXISTS idx_showcase_images_active_type ON showcase_images(is_active, type, order_index);
CREATE INDEX IF NOT EXISTS idx_profiles_admin ON profiles(is_admin);
CREATE INDEX IF NOT EXISTS idx_transactions_user_created ON transactions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_generations_user_created ON generations(user_id, created_at DESC);

-- 9. ADD TRIGGER FOR UPDATED_AT ON NEW TABLES
CREATE TRIGGER update_hero_videos_updated_at
  BEFORE UPDATE ON hero_videos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_showcase_images_updated_at
  BEFORE UPDATE ON showcase_images
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_site_settings_updated_at
  BEFORE UPDATE ON site_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 10. STORAGE BUCKETS (Run these commands separately in Supabase Dashboard > Storage)
-- Create 'hero-videos' bucket (public)
-- Create 'showcase-images' bucket (public)

-- Storage policies for hero-videos bucket
-- Run in SQL Editor after creating bucket:
/*
INSERT INTO storage.buckets (id, name, public) 
VALUES ('hero-videos', 'hero-videos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Admins can upload hero videos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'hero-videos' 
    AND EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Anyone can view hero videos" ON storage.objects
  FOR SELECT USING (bucket_id = 'hero-videos');

CREATE POLICY "Admins can delete hero videos" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'hero-videos' 
    AND EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );
*/

-- Storage policies for showcase-images bucket
-- Run in SQL Editor after creating bucket:
/*
INSERT INTO storage.buckets (id, name, public) 
VALUES ('showcase-images', 'showcase-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Admins can upload showcase images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'showcase-images' 
    AND EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Anyone can view showcase images" ON storage.objects
  FOR SELECT USING (bucket_id = 'showcase-images');

CREATE POLICY "Admins can delete showcase images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'showcase-images' 
    AND EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );
*/

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- Next steps:
-- 1. Run this migration in Supabase SQL Editor
-- 2. Create storage buckets in Supabase Dashboard
-- 3. Set your account as admin: UPDATE profiles SET is_admin = true WHERE email = 'your@email.com';

