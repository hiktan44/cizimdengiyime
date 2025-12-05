-- =====================================================
-- STORAGE BUCKETS FIX - Basitleştirilmiş Versiyon
-- =====================================================
-- Bu SQL'i Supabase SQL Editor'de çalıştırın
-- Dashboard > SQL Editor > New Query

-- 1. ESKİ BUCKET'LARI SİL (varsa)
DELETE FROM storage.buckets WHERE id IN ('hero-videos', 'showcase-images');

-- 2. YENİ BUCKET'LARI OLUŞTUR (PUBLIC)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES 
  (
    'hero-videos', 
    'hero-videos', 
    true,  -- PUBLIC (herkese açık)
    52428800, -- 50MB
    ARRAY['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo']
  ),
  (
    'showcase-images', 
    'showcase-images', 
    true,  -- PUBLIC (herkese açık)
    10485760, -- 10MB
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm']
  );

-- 3. ESKİ RLS POLİTİKALARINI SİL (varsa)
DROP POLICY IF EXISTS "Admins can upload hero videos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view hero videos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update hero videos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete hero videos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload showcase images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view showcase images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update showcase images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete showcase images" ON storage.objects;

-- 4. YENİ BASİT RLS POLİTİKALARI
-- Hero Videos - ADMIN UPLOAD
CREATE POLICY "Admin can upload hero videos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'hero-videos' 
  AND (storage.foldername(name))[1] = 'hero-videos'
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.is_admin = true
  )
);

-- Hero Videos - PUBLIC VIEW
CREATE POLICY "Public can view hero videos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'hero-videos');

-- Hero Videos - ADMIN UPDATE
CREATE POLICY "Admin can update hero videos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'hero-videos'
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.is_admin = true
  )
);

-- Hero Videos - ADMIN DELETE
CREATE POLICY "Admin can delete hero videos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'hero-videos'
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.is_admin = true
  )
);

-- Showcase Images - ADMIN UPLOAD
CREATE POLICY "Admin can upload showcase images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'showcase-images'
  AND (storage.foldername(name))[1] = 'showcase-images'
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.is_admin = true
  )
);

-- Showcase Images - PUBLIC VIEW
CREATE POLICY "Public can view showcase images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'showcase-images');

-- Showcase Images - ADMIN UPDATE
CREATE POLICY "Admin can update showcase images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'showcase-images'
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.is_admin = true
  )
);

-- Showcase Images - ADMIN DELETE
CREATE POLICY "Admin can delete showcase images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'showcase-images'
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.is_admin = true
  )
);

-- 5. KONTROL ET
SELECT 
  id, 
  name, 
  public, 
  file_size_limit,
  allowed_mime_types
FROM storage.buckets 
WHERE id IN ('hero-videos', 'showcase-images');

-- Beklenen sonuç: 2 bucket görünmeli, her ikisi de public=true

-- 6. POLİTİKALARI KONTROL ET
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename = 'objects' 
  AND policyname LIKE '%hero%' OR policyname LIKE '%showcase%'
ORDER BY policyname;

-- Beklenen sonuç: 8 policy görünmeli (her bucket için 4'er: INSERT, SELECT, UPDATE, DELETE)

-- =====================================================
-- KURULUM TAMAMLANDI! ✅
-- =====================================================
-- Artık admin panelden dosya yükleyebilirsiniz.

