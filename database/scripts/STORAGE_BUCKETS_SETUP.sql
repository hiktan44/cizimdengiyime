-- =====================================================
-- STORAGE BUCKETS SETUP - HERO VIDEOS & SHOWCASE IMAGES
-- =====================================================
-- Bu SQL komutlarını Supabase SQL Editor'de çalıştırın
-- Supabase Dashboard > SQL Editor > New Query

-- 1. HERO-VIDEOS BUCKET OLUŞTUR
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
  'hero-videos', 
  'hero-videos', 
  true,
  52428800, -- 50MB limit
  ARRAY['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];

-- Hero-videos bucket için RLS politikaları
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

CREATE POLICY "Admins can update hero videos" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'hero-videos' 
    AND EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can delete hero videos" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'hero-videos' 
    AND EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

-- 2. SHOWCASE-IMAGES BUCKET OLUŞTUR
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
  'showcase-images', 
  'showcase-images', 
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm'];

-- Showcase-images bucket için RLS politikaları
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

CREATE POLICY "Admins can update showcase images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'showcase-images' 
    AND EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can delete showcase images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'showcase-images' 
    AND EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

-- =====================================================
-- SETUP COMPLETE ✅
-- =====================================================
-- Artık admin panelden hero videoları ve showcase görselleri yükleyebilirsiniz!

