-- ========================================
-- SUPABASE RLS POLICIES KONTROL VE DÜZELTME
-- ========================================
-- Bu SQL sorgularını Supabase Dashboard > SQL Editor'de çalıştırın

-- 1. MEVCUT POLICIES'İ KONTROL ET
-- ========================================
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'profiles'
ORDER BY cmd, policyname;

-- Beklenen sonuç: SELECT, UPDATE, INSERT için birer policy olmalı


-- 2. PROFILES TABLOSUNU KONTROL ET
-- ========================================
SELECT * FROM public.profiles LIMIT 5;

-- Eğer tabloda veri yoksa, aşağıdaki komutları çalıştırın


-- 3. RLS'İN AKTİF OLDUĞUNU KONTROL ET
-- ========================================
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename = 'profiles';

-- rowsecurity = true olmalı


-- 4. EKSİK POLİCY'LERİ EKLE
-- ========================================

-- A) SELECT Policy (Okuma)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

-- B) INSERT Policy (Oluşturma) - ÇOK ÖNEMLİ!
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- C) UPDATE Policy (Güncelleme)
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);


-- 5. TRIGGER'I KONTROL ET
-- ========================================
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement,
    action_timing
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- Eğer trigger yoksa aşağıdakini çalıştırın:


-- 6. TRİGGER FONKSİYONUNU YENİDEN OLUŞTUR
-- ========================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, credits, subscription_tier)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
        10,
        'free'
    )
    ON CONFLICT (id) DO NOTHING;
    
    RETURN NEW;
END;
$$;

-- 7. TRİGGER'I YENİDEN OLUŞTUR
-- ========================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();


-- 8. MEVCUT KULLANICILAR İÇİN PROFILE OLUŞTUR
-- ========================================
-- Auth'da olan ama profiles'da olmayan kullanıcıları bul
SELECT 
    u.id,
    u.email,
    u.created_at as user_created,
    p.id as profile_id
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL;

-- Eğer yukarıdaki sorgu sonuç döndürürse, manuel profile oluşturun:
INSERT INTO public.profiles (id, email, full_name, credits, subscription_tier)
SELECT 
    u.id,
    u.email,
    COALESCE(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name', ''),
    10,
    'free'
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;


-- 9. BELİRLİ BİR KULLANICI İÇİN PROFILE OLUŞTUR
-- ========================================
-- Email adresinizi yazın:
DO $$
DECLARE
    v_user_id UUID;
    v_email TEXT := 'ozotayfur44@gmail.com'; -- BURAYA EMAİL YAZIN
BEGIN
    -- User ID'yi bul
    SELECT id INTO v_user_id 
    FROM auth.users 
    WHERE email = v_email;
    
    IF v_user_id IS NULL THEN
        RAISE NOTICE 'User not found with email: %', v_email;
    ELSE
        -- Profile oluştur
        INSERT INTO public.profiles (id, email, full_name, credits, subscription_tier)
        SELECT 
            id,
            email,
            COALESCE(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', ''),
            10,
            'free'
        FROM auth.users
        WHERE id = v_user_id
        ON CONFLICT (id) DO UPDATE 
        SET credits = EXCLUDED.credits;
        
        RAISE NOTICE 'Profile created/updated for user: %', v_user_id;
    END IF;
END $$;


-- 10. SONUÇ KONTROLÜ
-- ========================================
-- Tüm kullanıcılar ve profilleri listele
SELECT 
    u.email,
    u.created_at as user_created,
    p.id as has_profile,
    p.credits,
    p.subscription_tier,
    p.created_at as profile_created
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
ORDER BY u.created_at DESC
LIMIT 10;


-- 11. HIZLI DÜZELTME (HEPSİNİ BİR SEFERDE)
-- ========================================
-- Sadece sorun yaşıyorsanız bu bloğu çalıştırın:

BEGIN;

-- RLS'i kapat (geçici)
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Eksik profilleri oluştur
INSERT INTO public.profiles (id, email, full_name, credits, subscription_tier)
SELECT 
    u.id,
    u.email,
    COALESCE(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name', ''),
    10,
    'free'
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- RLS'i tekrar aç
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy'leri yeniden oluştur
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

COMMIT;

-- KONTROL
SELECT 'Policies created:', COUNT(*) FROM pg_policies WHERE tablename = 'profiles';
SELECT 'Profiles count:', COUNT(*) FROM public.profiles;
SELECT 'Users without profile:', COUNT(*) 
FROM auth.users u 
LEFT JOIN public.profiles p ON u.id = p.id 
WHERE p.id IS NULL;

