-- =====================================================
-- OPTIMIZE ADMIN PANEL & FIX CREDIT LOADING
-- =====================================================
-- Bu SQL dosyasını Supabase Dashboard > SQL Editor kısmında çalıştırın.

-- 1. PERFORMANS SORUNU İÇİN DATABASE FONKSİYONU
-- Tüm kullanıcı aktivitelerini tek sorguda getiren optimize edilmiş fonksiyon
CREATE OR REPLACE FUNCTION get_admin_active_users()
RETURNS TABLE (
  id uuid,
  email text,
  full_name text,
  credits int,
  is_admin boolean,
  total_generations bigint,
  total_credits_used bigint,
  created_at timestamptz,
  last_activity timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER -- RLS'i bypass ederek çalışır (hızlı ve yetki hatası vermez)
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.email,
    p.full_name,
    p.credits,
    p.is_admin,
    COUNT(g.id) as total_generations,
    COALESCE(SUM(g.credits_used), 0) as total_credits_used,
    p.created_at,
    MAX(g.created_at) as last_activity
  FROM profiles p
  LEFT JOIN generations g ON p.id = g.user_id
  GROUP BY p.id
  ORDER BY p.created_at DESC;
END;
$$;

-- 2. KREDİ YÜKLEME SORUNU İÇİN RLS (ROW LEVEL SECURITY) DÜZELTMELERİ

-- Profil Güncelleme İzni (Adminler herkesin kredisini düzenleyebilsin)
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;

CREATE POLICY "Admins can update all profiles"
ON profiles
FOR UPDATE
TO authenticated
USING (
  (SELECT is_admin FROM profiles WHERE id = auth.uid()) = true
);

-- Transaction Ekleme İzni (Adminler başkası adına işlem girebilsin)
DROP POLICY IF EXISTS "Admins can insert transactions" ON transactions;

CREATE POLICY "Admins can insert transactions"
ON transactions
FOR INSERT
TO authenticated
WITH CHECK (
  -- Kendi işlemi veya Admin ise başkası için
  auth.uid() = user_id OR 
  (SELECT is_admin FROM profiles WHERE id = auth.uid()) = true
);

-- Transaction Okuma İzni (Adminler tüm işlemleri görebilsin)
DROP POLICY IF EXISTS "Admins can view all transactions" ON transactions;

CREATE POLICY "Admins can view all transactions"
ON transactions
FOR SELECT
TO authenticated
USING (
  -- Kendi işlemi veya Admin ise hepsi
  auth.uid() = user_id OR 
  (SELECT is_admin FROM profiles WHERE id = auth.uid()) = true
);

-- 3. GENERATIONS TABLOSU İÇİN ADMIN İZİNLERİ
DROP POLICY IF EXISTS "Admins can view all generations" ON generations;

CREATE POLICY "Admins can view all generations"
ON generations
FOR SELECT
TO authenticated
USING (
  -- Kendi üretimi veya Admin ise hepsi
  auth.uid() = user_id OR 
  (SELECT is_admin FROM profiles WHERE id = auth.uid()) = true
);
