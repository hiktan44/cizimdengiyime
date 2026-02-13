-- =====================================================
-- FIX: Admin kullanıcıların erişim sorunları (GÜNCELLENMİŞ)
-- DIKKAT: Bu script mevcut hatalı policy'leri düzeltir
-- =====================================================

-- =====================================================
-- ADIM 1: PROFILES TABLOSU - Sonsuz döngüyü düzelt
-- =====================================================

-- Mevcut/Olası tüm profiles policy'lerini temizle
DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on id" ON profiles;

-- Çatışmayı önlemek için oluşturulacak olanları da önce sil
DROP POLICY IF EXISTS "profiles_select_all" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;

-- Profiles için basit policy'ler
CREATE POLICY "profiles_select_all"
ON profiles
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "profiles_insert_own"
ON profiles
FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_update_own"
ON profiles
FOR UPDATE
TO authenticated
USING (id = auth.uid());

-- =====================================================
-- ADIM 2: GENERATIONS TABLOSU
-- =====================================================

-- Mevcut/Olası tüm generations policy'lerini temizle
DROP POLICY IF EXISTS "generations_select_policy" ON generations;
DROP POLICY IF EXISTS "generations_insert_policy" ON generations;
DROP POLICY IF EXISTS "generations_update_policy" ON generations;
DROP POLICY IF EXISTS "Admin users can view all generations" ON generations;
DROP POLICY IF EXISTS "Users can view own generations" ON generations;
DROP POLICY IF EXISTS "Users can view their own generations" ON generations;
DROP POLICY IF EXISTS "Users can insert own generations" ON generations;

-- Çatışmayı önlemek için oluşturulacak olanları da önce sil
DROP POLICY IF EXISTS "generations_select" ON generations;
DROP POLICY IF EXISTS "generations_insert" ON generations;

-- RLS aktif olduğundan emin ol
ALTER TABLE generations ENABLE ROW LEVEL SECURITY;

-- SELECT: Admin (subscription_tier='admin') tüm kayıtları, 
-- normal kullanıcılar sadece kendi kayıtlarını görebilir
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
    AND profiles.subscription_tier = 'admin'
  )
);

CREATE POLICY "generations_insert"
ON generations
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- =====================================================
-- ADIM 3: TRANSACTIONS TABLOSU
-- =====================================================

DROP POLICY IF EXISTS "transactions_select_policy" ON transactions;
DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
DROP POLICY IF EXISTS "transactions_select" ON transactions;

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
    AND profiles.subscription_tier = 'admin'
  )
);

-- =====================================================
-- SONUÇ: İşlem tamamlandı
-- =====================================================
