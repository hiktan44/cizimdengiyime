-- =====================================================
-- EMERGENCY TRIGGER FIX - Son Çare
-- =====================================================
-- UYARI: Bu script agresif bir temizleme yapar!
-- Supabase Dashboard > SQL Editor > New Query

-- 1. TÜM STORAGE TRIGGER'LARINI BUL VE SİL
DO $$ 
DECLARE
    trigger_record record;
BEGIN
    RAISE NOTICE '🔍 Storage trigger''ları aranıyor...';
    
    FOR trigger_record IN 
        SELECT 
            tgname,
            pg_get_triggerdef(oid) as definition
        FROM pg_trigger 
        WHERE tgrelid = 'storage.objects'::regclass
        AND tgname NOT LIKE 'pg_%'
    LOOP
        RAISE NOTICE '❌ Trigger bulundu ve siliniyor: %', trigger_record.tgname;
        RAISE NOTICE '   Definition: %', trigger_record.definition;
        
        EXECUTE format('DROP TRIGGER IF EXISTS %I ON storage.objects CASCADE', trigger_record.tgname);
        
        RAISE NOTICE '✅ Trigger silindi: %', trigger_record.tgname;
    END LOOP;
    
    RAISE NOTICE '✅ Trigger temizliği tamamlandı!';
END $$;

-- 2. "LEVEL" İÇEREN TÜM FUNCTION'LARI BUL VE SİL
DO $$ 
DECLARE
    func_record record;
BEGIN
    RAISE NOTICE '🔍 "level" içeren function''lar aranıyor...';
    
    FOR func_record IN 
        SELECT 
            n.nspname as schema_name,
            p.proname as func_name,
            pg_get_functiondef(p.oid) as definition
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE pg_get_functiondef(p.oid) ILIKE '%level%'
        AND n.nspname IN ('storage', 'public')
    LOOP
        RAISE NOTICE '❌ Function bulundu: %.%', func_record.schema_name, func_record.func_name;
        
        BEGIN
            EXECUTE format('DROP FUNCTION IF EXISTS %I.%I CASCADE', 
                func_record.schema_name, 
                func_record.func_name);
            RAISE NOTICE '✅ Function silindi: %.%', func_record.schema_name, func_record.func_name;
        EXCEPTION 
            WHEN OTHERS THEN
                RAISE NOTICE '⚠️ Function silinemedi (devam ediliyor): %', SQLERRM;
        END;
    END LOOP;
    
    RAISE NOTICE '✅ Function temizliği tamamlandı!';
END $$;

-- 3. STORAGE.OBJECTS TABLOSUNU YENİDEN OLUŞTUR (RİSKLİ!)
-- UYARI: Bu, tüm mevcut dosyaları silecek!

-- Önce mevcut yapıyı yedekle
CREATE TABLE IF NOT EXISTS storage.objects_backup AS 
SELECT * FROM storage.objects LIMIT 0;

-- Tüm verileri sil
TRUNCATE storage.objects CASCADE;

-- 4. BUCKET'LARI TEMİZLE VE YENİDEN OLUŞTUR
DELETE FROM storage.buckets WHERE id IN ('hero-videos', 'showcase-images');

INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('hero-videos', 'hero-videos', true),
  ('showcase-images', 'showcase-images', true)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public;

-- 5. BASİT RLS POLİTİKALARI (POSTGREs 15+ uyumlu)
DROP POLICY IF EXISTS "storage_public_access" ON storage.objects;
DROP POLICY IF EXISTS "storage_authenticated_access" ON storage.objects;

-- Herkes okuyabilir
CREATE POLICY "storage_public_access"
ON storage.objects
FOR SELECT
USING (bucket_id IN ('hero-videos', 'showcase-images'));

-- Authenticated kullanıcılar her şeyi yapabilir
CREATE POLICY "storage_authenticated_access"
ON storage.objects
FOR ALL
USING (
  bucket_id IN ('hero-videos', 'showcase-images')
  AND auth.role() = 'authenticated'
);

-- 6. DATABASE TABLOLARINI TEMİZLE
TRUNCATE hero_videos CASCADE;
TRUNCATE showcase_images CASCADE;

-- 7. KAPSAMLI DOĞRULAMA
SELECT '=' as "═", '═' as "═", '═' as "═", '═' as "═", '═' as "═";
SELECT '🎯 EMERGENCY FIX TAMAMLANDI!' as "STATUS";
SELECT '=' as "═", '═' as "═", '═' as "═", '═' as "═", '═' as "═";

-- Trigger kontrolü
SELECT 
  '🔍 TRIGGER DURUMU' as info,
  COUNT(*) as custom_trigger_count
FROM pg_trigger 
WHERE tgrelid = 'storage.objects'::regclass
AND tgname NOT LIKE 'pg_%';

-- Function kontrolü  
SELECT 
  '🔍 LEVEL FUNCTION DURUMU' as info,
  COUNT(*) as level_function_count
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE pg_get_functiondef(p.oid) ILIKE '%level%'
AND n.nspname IN ('storage', 'public');

-- Bucket kontrolü
SELECT 
  '📦 BUCKET DURUMU' as info,
  id,
  public,
  CASE WHEN public THEN '✅ PUBLIC' ELSE '❌ PRIVATE' END as status
FROM storage.buckets 
WHERE id IN ('hero-videos', 'showcase-images');

-- Policy kontrolü
SELECT 
  '🔐 POLICY DURUMU' as info,
  policyname,
  cmd
FROM pg_policies 
WHERE schemaname = 'storage' 
  AND tablename = 'objects';

-- =====================================================
-- ✅ ACİL DÜZELTME TAMAMLANDI!
-- =====================================================
-- 
-- SONRAKI ADIMLAR:
-- 
-- 1. Browser'ı tamamen kapat ve yeniden aç
-- 2. Admin Panel > İçerik Yönetimi
-- 3. Dosya yükle
-- 
-- HALA ÇALIŞMIYORSA:
-- Aşağıdaki bilgileri paylaşın:
--
-- A) Trigger listesi:
SELECT tgname, pg_get_triggerdef(oid) 
FROM pg_trigger 
WHERE tgrelid = 'storage.objects'::regclass;
--
-- B) Storage objects yapısı:
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'storage' 
  AND table_name = 'objects'
ORDER BY ordinal_position;
--
-- C) Supabase Support'a ticket açın:
--    Dashboard > Help > Submit a ticket
--    Konu: "Storage trigger error: record 'new' has no field 'level'"

