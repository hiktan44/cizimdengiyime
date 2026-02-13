-- =====================================================
-- FIX RLS POLICIES - Row Level Security Düzeltmesi
-- =====================================================
-- Supabase Dashboard > SQL Editor > New Query

-- 1. TÜM ESKİ STORAGE POLİTİKALARINI SİL
DO $$ 
DECLARE
    pol record;
BEGIN
    RAISE NOTICE '🗑️ Eski storage politikaları siliniyor...';
    
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'storage' 
          AND tablename = 'objects'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', pol.policyname);
        RAISE NOTICE '✅ Silindi: %', pol.policyname;
    END LOOP;
    
    RAISE NOTICE '✅ Tüm eski politikalar temizlendi!';
END $$;

-- 2. HERKES İÇİN OKUMA POLİTİKASI (PUBLIC READ)
CREATE POLICY "allow_public_read"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id IN ('hero-videos', 'showcase-images')
);

-- 3. AUTHENTICATED KULLANICILAR İÇİN TÜM YETKİLER
CREATE POLICY "allow_authenticated_all"
ON storage.objects
FOR ALL
TO authenticated
USING (
  bucket_id IN ('hero-videos', 'showcase-images')
)
WITH CHECK (
  bucket_id IN ('hero-videos', 'showcase-images')
);

-- 4. ADMIN KONTROLÜ (İHTİYARI - Sadece loglamak için)
DO $$
DECLARE
    admin_count int;
    current_user_email text;
BEGIN
    -- Şu anki kullanıcı (eğer authenticated ise)
    SELECT email INTO current_user_email
    FROM auth.users
    WHERE id = auth.uid();
    
    -- Admin sayısı
    SELECT COUNT(*) INTO admin_count
    FROM profiles
    WHERE is_admin = true;
    
    RAISE NOTICE '';
    RAISE NOTICE '👤 KULLANICI BİLGİLERİ';
    RAISE NOTICE '==========================================';
    RAISE NOTICE 'Mevcut Kullanıcı: %', COALESCE(current_user_email, 'Anonim');
    RAISE NOTICE 'Toplam Admin Sayısı: %', admin_count;
    RAISE NOTICE '==========================================';
    RAISE NOTICE '';
    
    IF admin_count = 0 THEN
        RAISE WARNING '⚠️ HİÇ ADMIN YOK! Admin yetkisi vermelisiniz:';
        RAISE WARNING '   UPDATE profiles SET is_admin = true WHERE email = ''sizin@email.com'';';
    END IF;
END $$;

-- 5. POLİTİKA DOĞRULAMA
SELECT 
  '🔐 STORAGE POLİTİKALARI' as info,
  policyname,
  CASE cmd
    WHEN 'SELECT' THEN '👁️ READ (Public)'
    WHEN 'INSERT' THEN '📤 UPLOAD'
    WHEN 'UPDATE' THEN '✏️ UPDATE'
    WHEN 'DELETE' THEN '🗑️ DELETE'
    WHEN 'ALL' THEN '🔓 ALL (Authenticated)'
  END as permission,
  CASE roles[1]
    WHEN 'public' THEN '🌍 Herkes'
    WHEN 'authenticated' THEN '🔐 Giriş Yapanlar'
  END as who_can
FROM pg_policies 
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
ORDER BY cmd;

-- 6. BUCKET DURUMU
SELECT 
  '📦 BUCKET DURUMU' as info,
  id,
  CASE WHEN public THEN '✅ PUBLIC' ELSE '❌ PRIVATE' END as status,
  CASE 
    WHEN id = 'hero-videos' THEN '🎬 Hero Videos'
    WHEN id = 'showcase-images' THEN '🖼️ Showcase Images'
  END as description
FROM storage.buckets 
WHERE id IN ('hero-videos', 'showcase-images');

-- =====================================================
-- ✅ RLS POLİTİKALARI DÜZELTİLDİ!
-- =====================================================
--
-- YENİ POLİTİKALAR:
-- 1. ✅ Public → Herkes okuyabilir (SELECT)
-- 2. ✅ Authenticated → Giriş yapan herkes upload/update/delete yapabilir
--
-- ŞİMDİ:
-- 1. Browser'da giriş yaptığınızdan emin olun
-- 2. Sayfayı yenileyin (Ctrl+F5)
-- 3. Admin Panel > İçerik Yönetimi > Upload deneyin
--
-- EĞER HALA "RLS policy" HATASI ALIYORSANIZ:
-- - Çıkış yapıp tekrar giriş yapın
-- - Browser console'da "auth.uid()" kontrol edin
-- - Admin yetkisini kontrol edin (aşağıdaki SQL)
--
-- =====================================================

-- 7. ADMIN YETKİSİ KONTROL VE DÜZELTME
-- Email adresinizi değiştirin:
DO $$
DECLARE
    user_email text := 'sizin@email.com';  -- ← BURAYA KENDİ EMAİL'İNİZİ YAZIN
    user_record record;
BEGIN
    SELECT * INTO user_record
    FROM profiles
    WHERE email = user_email;
    
    IF FOUND THEN
        IF user_record.is_admin = false THEN
            UPDATE profiles SET is_admin = true WHERE email = user_email;
            RAISE NOTICE '✅ Admin yetkisi verildi: %', user_email;
        ELSE
            RAISE NOTICE '✅ Zaten admin: %', user_email;
        END IF;
        
        RAISE NOTICE '   ID: %', user_record.id;
        RAISE NOTICE '   Email: %', user_record.email;
        RAISE NOTICE '   Admin: %', CASE WHEN user_record.is_admin THEN 'Evet' ELSE 'Hayır' END;
    ELSE
        RAISE WARNING '❌ Kullanıcı bulunamadı: %', user_email;
        RAISE WARNING '   Lütfen doğru email adresini girin!';
    END IF;
END $$;

-- =====================================================
-- 🧪 TEST: Manuel Upload Simülasyonu
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🧪 TEST: RLS politikalarını test ediliyor...';
    RAISE NOTICE '';
    
    BEGIN
        -- Authenticated kullanıcı olarak test
        SET ROLE authenticated;
        
        -- Test insert
        INSERT INTO storage.objects (bucket_id, name, owner, owner_id, version)
        VALUES ('showcase-images', 'test-rls-' || NOW()::text || '.jpg', NULL, auth.uid(), NOW()::text);
        
        RAISE NOTICE '✅ RLS TEST BAŞARILI!';
        RAISE NOTICE '   Authenticated kullanıcılar upload yapabilir.';
        
        -- Temizle
        DELETE FROM storage.objects WHERE name LIKE 'test-rls-%';
        
        RESET ROLE;
        
    EXCEPTION 
        WHEN OTHERS THEN
            RAISE NOTICE '❌ RLS TEST BAŞARISIZ: %', SQLERRM;
            RAISE NOTICE '   Politikalarda hala sorun var olabilir.';
            RESET ROLE;
    END;
END $$;

-- =====================================================
-- 📋 ÖNEMLİ: BROWSER'DA YAPMANIZ GEREKENLER
-- =====================================================
--
-- 1. ÇIKIŞ YAP - GİRİŞ YAP
--    Storage politikaları değişince session yenilenmeli
--
-- 2. HARD REFRESH
--    Ctrl+F5 (Windows) veya Cmd+Shift+R (Mac)
--
-- 3. CONSOLE KONTROL
--    F12 > Console > Şunu çalıştır:
--    ```
--    const { data: { user } } = await supabase.auth.getUser();
--    console.log('User ID:', user?.id);
--    console.log('Email:', user?.email);
--    ```
--
-- 4. UPLOAD DENE
--    Admin Panel > İçerik Yönetimi > Dosya Yükle
--
-- =====================================================

