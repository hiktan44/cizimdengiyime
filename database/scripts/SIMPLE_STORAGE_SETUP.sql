-- =====================================================
-- SIMPLE STORAGE SETUP - En Basit Hali
-- =====================================================
-- Supabase Dashboard > SQL Editor > New Query

-- 1. ESKİ BUCKET'LARI TEMİZLE
DELETE FROM storage.buckets WHERE id IN ('hero-videos', 'showcase-images');

-- 2. YENİ PUBLIC BUCKET'LAR OLUŞTUR
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('hero-videos', 'hero-videos', true),
  ('showcase-images', 'showcase-images', true);

-- 3. ESKİ POLİTİKALARI SİL
DO $$ 
DECLARE
    pol record;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'storage' 
          AND tablename = 'objects'
          AND (policyname LIKE '%hero%' OR policyname LIKE '%showcase%')
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON storage.objects';
    END LOOP;
END $$;

-- 4. BASİT RLS POLİTİKALARI (SADECE GEREKENLERI)

-- HERKES OKUYABİLİR (PUBLIC READ)
CREATE POLICY "Public read all storage"
ON storage.objects FOR SELECT
USING (bucket_id IN ('hero-videos', 'showcase-images'));

-- SADECE ADMIN YÜKLEYEBİLİR (ADMIN INSERT)
CREATE POLICY "Admin insert storage"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id IN ('hero-videos', 'showcase-images')
  AND auth.uid() IN (
    SELECT id FROM public.profiles WHERE is_admin = true
  )
);

-- SADECE ADMIN GÜNCELLEYEBİLİR (ADMIN UPDATE)
CREATE POLICY "Admin update storage"
ON storage.objects FOR UPDATE
USING (
  bucket_id IN ('hero-videos', 'showcase-images')
  AND auth.uid() IN (
    SELECT id FROM public.profiles WHERE is_admin = true
  )
);

-- SADECE ADMIN SİLEBİLİR (ADMIN DELETE)
CREATE POLICY "Admin delete storage"
ON storage.objects FOR DELETE
USING (
  bucket_id IN ('hero-videos', 'showcase-images')
  AND auth.uid() IN (
    SELECT id FROM public.profiles WHERE is_admin = true
  )
);

-- 5. KONTROL
SELECT 
  id, 
  name, 
  public,
  CASE WHEN public THEN '✅ PUBLIC' ELSE '❌ PRIVATE' END as status
FROM storage.buckets 
WHERE id IN ('hero-videos', 'showcase-images');

-- Politikaları kontrol et
SELECT 
  policyname,
  cmd,
  CASE 
    WHEN cmd = 'SELECT' THEN '👁️ READ'
    WHEN cmd = 'INSERT' THEN '📤 UPLOAD'
    WHEN cmd = 'UPDATE' THEN '✏️ UPDATE'
    WHEN cmd = 'DELETE' THEN '🗑️ DELETE'
  END as action
FROM pg_policies 
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
ORDER BY cmd;

-- =====================================================
-- KURULUM TAMAMLANDI! ✅
-- =====================================================

