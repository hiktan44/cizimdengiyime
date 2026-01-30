-- =====================================================
-- SAFE TRIGGER FIX - Sadece Custom Trigger'ları Siler
-- =====================================================
-- Supabase Dashboard > SQL Editor > New Query

-- 1. SADECE CUSTOM TRIGGER'LARI BUL VE SİL (Constraint trigger'larını atla)
DO $$ 
DECLARE
    trigger_record record;
    deleted_count int := 0;
BEGIN
    RAISE NOTICE '🔍 Custom trigger''lar aranıyor (constraint trigger''lar atlanacak)...';
    RAISE NOTICE '';
    
    FOR trigger_record IN 
        SELECT 
            tgname,
            pg_get_triggerdef(oid) as definition
        FROM pg_trigger 
        WHERE tgrelid = 'storage.objects'::regclass
        AND tgname NOT LIKE 'pg_%'
        AND tgname NOT LIKE 'RI_ConstraintTrigger%'  -- Constraint trigger'ları atla
        AND tgenabled != 'D'  -- Disabled trigger'ları zaten atla
    LOOP
        RAISE NOTICE '❌ Custom trigger bulundu: %', trigger_record.tgname;
        
        BEGIN
            EXECUTE format('DROP TRIGGER IF EXISTS %I ON storage.objects', trigger_record.tgname);
            deleted_count := deleted_count + 1;
            RAISE NOTICE '✅ Silindi: %', trigger_record.tgname;
        EXCEPTION 
            WHEN OTHERS THEN
                RAISE NOTICE '⚠️ Silinemedi (atlanıyor): % - Hata: %', trigger_record.tgname, SQLERRM;
        END;
        
        RAISE NOTICE '';
    END LOOP;
    
    IF deleted_count = 0 THEN
        RAISE NOTICE '✅ Silinecek custom trigger bulunamadı (bu iyi bir şey!)';
    ELSE
        RAISE NOTICE '✅ Toplam % custom trigger silindi', deleted_count;
    END IF;
END $$;

-- 2. TÜM STORAGE FUNCTION'LARINI LİSTELE (Silme, sadece göster)
SELECT 
  '🔍 STORAGE FUNCTION''LAR' as info,
  p.proname as function_name,
  n.nspname as schema_name,
  CASE 
    WHEN pg_get_functiondef(p.oid) ILIKE '%level%' THEN '⚠️ LEVEL İÇERİYOR'
    ELSE '✅ Normal'
  END as status
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'storage'
ORDER BY status DESC, function_name;

-- 3. STORAGE.OBJECTS TABLOSU YAPISINI KONTROL ET
SELECT 
  '📊 STORAGE.OBJECTS TABLO YAPISI' as info,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'storage' 
  AND table_name = 'objects'
ORDER BY ordinal_position;

-- 4. MEVCUT TRIGGER'LARIN DURUMU
SELECT 
  '🔍 MEVCUT TRIGGER''LAR' as info,
  tgname as trigger_name,
  CASE 
    WHEN tgname LIKE 'RI_ConstraintTrigger%' THEN '🔒 System (Constraint)'
    WHEN tgname LIKE 'pg_%' THEN '🔒 System (PostgreSQL)'
    ELSE '⚙️ Custom'
  END as type,
  CASE tgenabled
    WHEN 'O' THEN '✅ Enabled'
    WHEN 'D' THEN '❌ Disabled'
    WHEN 'R' THEN '🔄 Replica'
    WHEN 'A' THEN '🔄 Always'
  END as status
FROM pg_trigger 
WHERE tgrelid = 'storage.objects'::regclass
ORDER BY type, trigger_name;

-- =====================================================
-- ⚠️ ÖNEMLİ BULGULAR
-- =====================================================
-- 
-- Eğer yukarıdaki sorgularda:
-- 1. "LEVEL İÇERİYOR" function varsa → Supabase Support'a bildir
-- 2. Custom trigger varsa ve silindi → Tekrar upload dene
-- 3. storage.objects tablosunda "level" kolonu yoksa → Normal (olmamalı)
--
-- =====================================================

-- 5. BASIT TEST: MANUEL INSERT DENEYİMİ
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🧪 TEST: Manuel INSERT deneniyor...';
    RAISE NOTICE '';
    
    BEGIN
        -- Test bucket oluştur (varsa atla)
        INSERT INTO storage.buckets (id, name, public) 
        VALUES ('test-bucket', 'test-bucket', true)
        ON CONFLICT (id) DO NOTHING;
        
        -- Test object insert
        INSERT INTO storage.objects (bucket_id, name, owner, owner_id, version)
        VALUES ('test-bucket', 'test-' || NOW()::text || '.txt', NULL, NULL, NOW()::text);
        
        RAISE NOTICE '✅ Manuel INSERT başarılı! Upload sorunu trigger''dan kaynaklanıyor olabilir.';
        
        -- Test objesini temizle
        DELETE FROM storage.objects WHERE bucket_id = 'test-bucket';
        DELETE FROM storage.buckets WHERE id = 'test-bucket';
        
    EXCEPTION 
        WHEN OTHERS THEN
            RAISE NOTICE '❌ Manuel INSERT başarısız: %', SQLERRM;
            RAISE NOTICE '⚠️ Sorun trigger''dan değil, başka bir yerden kaynaklanıyor!';
    END;
END $$;

-- =====================================================
-- 📋 SONRAKI ADIMLAR
-- =====================================================
-- 
-- SENARYO 1: Custom trigger silindi ve test başarılı
--   → Browser'ı kapat/aç, upload dene
--
-- SENARYO 2: Custom trigger yoktu ve test başarılı
--   → Sorun client-side veya Supabase API'de
--   → .env dosyasındaki SUPABASE_URL ve KEY'leri kontrol et
--
-- SENARYO 3: Test başarısız (Manuel INSERT çalışmadı)
--   → CİDDİ SORUN: Database seviyesinde bir problem var
--   → Supabase Support'a acil ticket aç
--
-- SENARYO 4: Yukarıdaki sorgularda "LEVEL" içeren function var
--   → Function adını not al
--   → Supabase Support'a bildir: "Storage function contains 'level' field"
--
-- =====================================================
-- 🆘 SUPABASE SUPPORT'A BİLDİR
-- =====================================================
--
-- Dashboard > Help > Submit a ticket
--
-- Başlık: "Storage INSERT error: record 'new' has no field 'level'"
--
-- Mesaj:
-- """
-- I'm getting this error when trying to upload files to storage:
-- 
-- Error: insert into "objects" - record "new" has no field "level"
-- 
-- This appears to be a trigger or function issue in storage.objects table.
-- 
-- Steps to reproduce:
-- 1. Upload file via Supabase client (upload() method)
-- 2. Error occurs during INSERT into storage.objects
-- 
-- Project: [Proje ID'nizi buraya yazın]
-- Bucket: showcase-images, hero-videos (both public)
-- 
-- Please investigate storage triggers/functions looking for "level" field.
-- """
--
-- =====================================================

