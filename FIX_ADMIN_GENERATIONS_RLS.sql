-- =====================================================
-- FIX: Admin kullanıcıların erişim sorunları
-- DIKKAT: Bu script mevcut hatalı policy'leri düzeltir
-- =====================================================

-- =====================================================
-- ADIM 1: PROFILES TABLOSU - Sonsuz döngüyü düzelt
-- =====================================================

-- Mevcut tüm profiles policy'lerini sil
DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on id" ON profiles;

-- Profiles için basit policy'ler (sonsuz döngü olmadan)
-- SELECT: Herkes authenticated ise görebilir
CREATE POLICY "profiles_select_all"
ON profiles
FOR SELECT
TO authenticated
USING (true);

-- INSERT: Kullanıcı sadece kendi profilini oluşturabilir
CREATE POLICY "profiles_insert_own"
ON profiles
FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

-- UPDATE: Kullanıcı kendi profilini güncelleyebilir
CREATE POLICY "profiles_update_own"
ON profiles
FOR UPDATE
TO authenticated
USING (id = auth.uid());

-- =====================================================
-- ADIM 2: GENERATIONS TABLOSU
-- =====================================================

-- Mevcut policy'leri sil
DROP POLICY IF EXISTS "generations_select_policy" ON generations;
DROP POLICY IF EXISTS "generations_insert_policy" ON generations;
DROP POLICY IF EXISTS "generations_update_policy" ON generations;
DROP POLICY IF EXISTS "Admin users can view all generations" ON generations;
DROP POLICY IF EXISTS "Users can view own generations" ON generations;
DROP POLICY IF EXISTS "Users can view their own generations" ON generations;
DROP POLICY IF EXISTS "Users can insert own generations" ON generations;

-- RLS aktif olduğundan emin ol
ALTER TABLE generations ENABLE ROW LEVEL SECURITY;

-- SELECT: Admin tüm kayıtları, normal kullanıcılar kendi kayıtlarını görebilir
-- (is_admin kontrolü profiles'a JOIN ile yapılıyor - bu güvenli)
CREATE POLICY "generations_select"
ON generations
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  OR
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.is_admin = true
  )
);

-- INSERT: Kullanıcılar sadece kendi kayıtlarını ekleyebilir
CREATE POLICY "generations_insert"
ON generations
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- =====================================================
-- ADIM 3: TRANSACTIONS TABLOSU (bonus)
-- =====================================================

DROP POLICY IF EXISTS "transactions_select_policy" ON transactions;
DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;

-- Transactions için de benzer policy
CREATE POLICY "transactions_select"
ON transactions
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  OR
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.is_admin = true
  )
);

-- =====================================================
-- KONTROL: Policy'lerin doğru eklendiğini kontrol et
-- =====================================================
-- SELECT tablename, policyname FROM pg_policies 
-- WHERE tablename IN ('profiles', 'generations', 'transactions');

-- =====================================================
-- NOT: Bu script'i Supabase Dashboard > SQL Editor'da çalıştırın
-- =====================================================
