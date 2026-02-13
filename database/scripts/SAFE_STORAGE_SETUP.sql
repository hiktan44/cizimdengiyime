-- =====================================================
-- SAFE STORAGE SETUP - Güvenli Kurulum
-- =====================================================
-- Supabase Dashboard > SQL Editor > New Query

-- 1. ÖNCE TÜM DOSYALARI SİL (varsa)
DELETE FROM storage.objects 
WHERE bucket_id IN ('hero-videos', 'showcase-images');

-- 2. ESKİ POLİTİKALARI SİL
DO $$ 
DECLARE
    pol record;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'storage' 
          AND tablename = 'objects'
          AND (
            policyname LIKE '%hero%' 
            OR policyname LIKE '%showcase%'
            OR policyname LIKE '%storage%'
          )
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON storage.objects';
    END LOOP;
END $$;

-- 3. BUCKET'LARI SİL (artık güvenli)
DELETE FROM storage.buckets 
WHERE id IN ('hero-videos', 'showcase-images');

-- 4. YENİ BUCKET'LAR OLUŞTUR (PUBLIC)
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('hero-videos', 'hero-videos', true),
  ('showcase-images', 'showcase-images', true);

-- 5. YENİ RLS POLİTİKALARI (BASİT VE AÇIK)

-- 🌍 HERKES OKUYABİLİR (PUBLIC READ)
CREATE POLICY "Public can read all storage files"
ON storage.objects FOR SELECT
TO public
USING (
  bucket_id IN ('hero-videos', 'showcase-images')
);

-- 🔐 SADECE ADMIN YÜKLEYEBİLİR (ADMIN INSERT)
CREATE POLICY "Admin can upload to storage"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id IN ('hero-videos', 'showcase-images')
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND is_admin = true
  )
);

-- ✏️ SADECE ADMIN GÜNCELLEYEBİLİR (ADMIN UPDATE)
CREATE POLICY "Admin can update storage files"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id IN ('hero-videos', 'showcase-images')
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND is_admin = true
  )
);

-- 🗑️ SADECE ADMIN SİLEBİLİR (ADMIN DELETE)
CREATE POLICY "Admin can delete storage files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id IN ('hero-videos', 'showcase-images')
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND is_admin = true
  )
);

-- 6. KONTROL VE DOĞRULAMA
DO $$
DECLARE
  bucket_count int;
  policy_count int;
BEGIN
  -- Bucket'ları say
  SELECT COUNT(*) INTO bucket_count
  FROM storage.buckets 
  WHERE id IN ('hero-videos', 'showcase-images');
  
  -- Politikaları say
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies 
  WHERE schemaname = 'storage' 
    AND tablename = 'objects'
    AND policyname IN (
      'Public can read all storage files',
      'Admin can upload to storage',
      'Admin can update storage files',
      'Admin can delete storage files'
    );
  
  -- Sonuçları göster
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ KURULUM TAMAMLANDI!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Bucket sayısı: % (Beklenen: 2)', bucket_count;
  RAISE NOTICE 'Policy sayısı: % (Beklenen: 4)', policy_count;
  RAISE NOTICE '========================================';
  
  IF bucket_count = 2 AND policy_count = 4 THEN
    RAISE NOTICE '🎉 HER ŞEY HAZIR! Artık upload yapabilirsiniz.';
  ELSE
    RAISE WARNING '⚠️ Eksik kurulum tespit edildi!';
    IF bucket_count < 2 THEN
      RAISE WARNING 'Bucket sayısı eksik: % (Beklenen: 2)', bucket_count;
    END IF;
    IF policy_count < 4 THEN
      RAISE WARNING 'Policy sayısı eksik: % (Beklenen: 4)', policy_count;
    END IF;
  END IF;
END $$;

-- 7. DETAYLI DURUM RAPORU
SELECT 
  '📦 BUCKET DURUMU' as category,
  id as name,
  CASE WHEN public THEN '✅ PUBLIC' ELSE '❌ PRIVATE' END as status,
  created_at
FROM storage.buckets 
WHERE id IN ('hero-videos', 'showcase-images')

UNION ALL

SELECT 
  '🔐 POLICY DURUMU' as category,
  policyname as name,
  CASE 
    WHEN cmd = 'SELECT' THEN '👁️ READ (Public)'
    WHEN cmd = 'INSERT' THEN '📤 UPLOAD (Admin)'
    WHEN cmd = 'UPDATE' THEN '✏️ UPDATE (Admin)'
    WHEN cmd = 'DELETE' THEN '🗑️ DELETE (Admin)'
  END as status,
  NULL as created_at
FROM pg_policies 
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
  AND policyname IN (
    'Public can read all storage files',
    'Admin can upload to storage',
    'Admin can update storage files',
    'Admin can delete storage files'
  )
ORDER BY category DESC, name;

-- =====================================================
-- 🎯 KURULUM TAMAMLANDI!
-- =====================================================
-- Artık admin panelden güvenle upload yapabilirsiniz.
-- 
-- Test için:
-- 1. Admin Panel > İçerik Yönetimi
-- 2. Bir görsel/video yükle
-- 3. Console'da başarı mesajını bekle
--
-- Sorun olursa:
-- - Browser console (F12) kontrol et
-- - Admin yetkisini kontrol et: 
--   SELECT email, is_admin FROM profiles WHERE email = 'sizin@email.com';

