-- ==========================================
-- RLS POLİCY OPTİMİZASYONU
-- ==========================================
-- Sayfa yenileme sonrası timeout sorununu çözmek için
-- Supabase Dashboard > SQL Editor'de çalıştırın

-- 1. Mevcut policy'leri kontrol et
SELECT policyname, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'profiles';

-- 2. Index'leri kontrol et
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'profiles';

-- 3. Index ekle (yoksa) - Performans için
CREATE INDEX IF NOT EXISTS idx_profiles_id ON public.profiles(id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- 4. Policy'leri yeniden oluştur (daha optimize)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- SELECT policy - Basit ve hızlı
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
USING (id = auth.uid());

-- INSERT policy - Basit ve hızlı
CREATE POLICY "Users can insert own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (id = auth.uid());

-- UPDATE policy - Basit ve hızlı
CREATE POLICY "Users can update own profile" 
ON public.profiles 
FOR UPDATE 
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- 5. Service role policy ekle (arka plan işlemleri için)
-- Bu, trigger'ın sorunsuz çalışmasını sağlar
CREATE POLICY "Service role can manage all profiles" 
ON public.profiles 
FOR ALL 
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- 6. Analyze table (query planner için)
ANALYZE public.profiles;

-- 7. Sonuç kontrolü
SELECT 
    policyname,
    cmd as operation,
    CASE 
        WHEN qual IS NOT NULL THEN 'Has USING clause'
        ELSE 'No USING clause'
    END as using_clause,
    CASE 
        WHEN with_check IS NOT NULL THEN 'Has WITH CHECK'
        ELSE 'No WITH CHECK'
    END as with_check_clause
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY cmd;

-- 8. Test sorgusu (bu hızlı dönmeli)
EXPLAIN ANALYZE
SELECT * FROM public.profiles 
WHERE id = auth.uid()
LIMIT 1;

