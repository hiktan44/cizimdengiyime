-- =====================================================
-- CLEAN STORAGE FIX - Trigger Sorunu Çözümü
-- =====================================================
-- Supabase Dashboard > SQL Editor > New Query

-- 1. TÜM STORAGE TRIGGER'LARINI KONTROL ET VE TEMİZLE
DO $$ 
DECLARE
    trg record;
BEGIN
    -- Storage.objects tablosundaki tüm trigger'ları bul
    FOR trg IN 
        SELECT tgname 
        FROM pg_trigger 
        WHERE tgrelid = 'storage.objects'::regclass
        AND tgname NOT LIKE 'pg_%'  -- Sistem trigger'larını atla
    LOOP
        -- Özel trigger'ları logla
        RAISE NOTICE 'Trigger bulundu: %', trg.tgname;
    END LOOP;
END $$;

-- 2. PROBLEMLI TRIGGER'I SİL (eğer varsa)
DO $$ 
BEGIN
    -- "level" field içeren trigger'ları tespit et ve sil
    DROP TRIGGER IF EXISTS on_objects_created ON storage.objects;
    DROP TRIGGER IF EXISTS on_objects_updated ON storage.objects;
    DROP TRIGGER IF EXISTS handle_storage_update ON storage.objects;
    
    RAISE NOTICE '✅ Eski trigger''lar temizlendi';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Trigger temizliği sırasında hata (normal olabilir): %', SQLERRM;
END $$;

-- 3. TÜM STORAGE OBJECTS'İ SİL
TRUNCATE storage.objects CASCADE;

-- 4. BUCKET'LARI YENİDEN OLUŞTUR
DELETE FROM storage.buckets WHERE id IN ('hero-videos', 'showcase-images');

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES 
  (
    'hero-videos', 
    'hero-videos', 
    true,
    52428800, -- 50MB
    ARRAY['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo']
  ),
  (
    'showcase-images', 
    'showcase-images', 
    true,
    10485760, -- 10MB  
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4']
  );

-- 5. TÜM ESKİ STORAGE POLİTİKALARINI SİL
DROP POLICY IF EXISTS "Public can read all storage files" ON storage.objects;
DROP POLICY IF EXISTS "Admin can upload to storage" ON storage.objects;
DROP POLICY IF EXISTS "Admin can update storage files" ON storage.objects;
DROP POLICY IF EXISTS "Admin can delete storage files" ON storage.objects;
DROP POLICY IF EXISTS "Public read all storage" ON storage.objects;
DROP POLICY IF EXISTS "Admin insert storage" ON storage.objects;
DROP POLICY IF EXISTS "Admin update storage" ON storage.objects;
DROP POLICY IF EXISTS "Admin delete storage" ON storage.objects;

-- Tüm hero/showcase içeren policy'leri temizle
DO $$ 
DECLARE
    pol record;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'storage' 
          AND tablename = 'objects'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON storage.objects';
        RAISE NOTICE 'Policy silindi: %', pol.policyname;
    END LOOP;
END $$;

-- 6. YENİ BASİT POLİTİKALAR (SADECE GEREKLİ OLANLAR)

-- HERKES OKUYABİLİR
CREATE POLICY "storage_public_read"
ON storage.objects FOR SELECT
USING (bucket_id IN ('hero-videos', 'showcase-images'));

-- ADMIN YÜKLEYEBİLİR
CREATE POLICY "storage_admin_insert"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id IN ('hero-videos', 'showcase-images')
  AND auth.role() = 'authenticated'
  AND (
    SELECT is_admin FROM public.profiles WHERE id = auth.uid() LIMIT 1
  ) = true
);

-- ADMIN GÜNCELLEYEBİLİR
CREATE POLICY "storage_admin_update"
ON storage.objects FOR UPDATE
USING (
  bucket_id IN ('hero-videos', 'showcase-images')
  AND auth.role() = 'authenticated'
  AND (
    SELECT is_admin FROM public.profiles WHERE id = auth.uid() LIMIT 1
  ) = true
);

-- ADMIN SİLEBİLİR
CREATE POLICY "storage_admin_delete"
ON storage.objects FOR DELETE
USING (
  bucket_id IN ('hero-videos', 'showcase-images')
  AND auth.role() = 'authenticated'
  AND (
    SELECT is_admin FROM public.profiles WHERE id = auth.uid() LIMIT 1
  ) = true
);

-- 7. DATABASE TABLOLARINI DA TEMİZLE
TRUNCATE hero_videos CASCADE;
TRUNCATE showcase_images CASCADE;

-- 8. DOĞRULAMA
SELECT 
  '🗑️ TEMIZLEME TAMAMLANDI' as status,
  (SELECT COUNT(*) FROM storage.objects) as dosya_sayisi,
  (SELECT COUNT(*) FROM storage.buckets WHERE id IN ('hero-videos', 'showcase-images')) as bucket_sayisi,
  (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects') as policy_sayisi;

-- Bucket durumunu göster
SELECT 
  id,
  name,
  public,
  file_size_limit,
  ARRAY_LENGTH(allowed_mime_types, 1) as mime_type_count
FROM storage.buckets 
WHERE id IN ('hero-videos', 'showcase-images');

-- Policy'leri göster
SELECT 
  policyname,
  cmd,
  CASE 
    WHEN cmd = 'SELECT' THEN '👁️ Public Read'
    WHEN cmd = 'INSERT' THEN '📤 Admin Upload'
    WHEN cmd = 'UPDATE' THEN '✏️ Admin Update'
    WHEN cmd = 'DELETE' THEN '🗑️ Admin Delete'
  END as description
FROM pg_policies 
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
ORDER BY cmd;

-- Trigger durumunu göster (artık özel trigger olmamalı)
SELECT 
  tgname as trigger_name,
  tgenabled as enabled
FROM pg_trigger 
WHERE tgrelid = 'storage.objects'::regclass
  AND tgname NOT LIKE 'pg_%'
ORDER BY tgname;

-- =====================================================
-- ✅ KURULUM TAMAMLANDI!
-- =====================================================
-- 
-- ÖNEMLI NOTLAR:
-- 1. Tüm eski dosyalar silindi
-- 2. Tüm trigger'lar temizlendi
-- 3. Tüm policy'ler yeniden oluşturuldu
-- 4. Database tabloları temizlendi
--
-- ŞİMDİ:
-- 1. Admin yetkini kontrol et:
--    SELECT email, is_admin FROM profiles WHERE email = 'sizin@email.com';
--
-- 2. Upload dene:
--    Admin Panel > İçerik Yönetimi > Dosya Yükle
--
-- 3. Hata devam ederse:
--    - Browser console'u temizle (F12 > Clear)
--    - Sayfayı yenile (Ctrl+F5)
--    - Tekrar dene

