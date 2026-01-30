-- ==========================================
-- ACIL DÜZELTME: ozotayfur44@gmail.com için
-- ==========================================
-- Bu SQL'i Supabase Dashboard > SQL Editor'de çalıştırın

-- ADIM 1: Kullanıcıyı kontrol et
SELECT 
    id, 
    email, 
    created_at,
    raw_user_meta_data
FROM auth.users 
WHERE email = 'ozotayfur44@gmail.com';

-- ADIM 2: Mevcut profile'ı kontrol et (varsa)
SELECT * FROM public.profiles 
WHERE id = 'b9d80e4c-7215-4265-906b-9ba4aaa7004f'::uuid;

-- ADIM 3: Profile oluştur (yoksa)
INSERT INTO public.profiles (id, email, full_name, credits, subscription_tier, created_at, updated_at)
VALUES (
    'b9d80e4c-7215-4265-906b-9ba4aaa7004f'::uuid,
    'ozotayfur44@gmail.com',
    'User',
    10,
    'free',
    NOW(),
    NOW()
)
ON CONFLICT (id) DO UPDATE 
SET 
    credits = 10,
    subscription_tier = 'free',
    updated_at = NOW();

-- ADIM 4: Profile'ın oluşturulduğunu doğrula
SELECT 
    id,
    email,
    full_name,
    credits,
    subscription_tier,
    created_at
FROM public.profiles 
WHERE id = 'b9d80e4c-7215-4265-906b-9ba4aaa7004f'::uuid;

-- ADIM 5: RLS Policy'lerini kontrol et ve düzelt
-- Önce mevcut policy'leri listele
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'profiles';

-- Sonra INSERT policy'sini ekle/düzelt
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- SELECT policy'sini ekle/düzelt
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

-- UPDATE policy'sini ekle/düzelt
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

-- SONUÇ: Tüm policy'leri listele
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd as operation,
    permissive
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY cmd;

