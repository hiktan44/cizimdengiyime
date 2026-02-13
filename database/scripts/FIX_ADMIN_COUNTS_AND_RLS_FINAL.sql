-- =====================================================
-- FIX ADMIN COUNTS & ACCESS (FINAL VERSION)
-- =====================================================
-- Bu script şunları yapar:
-- 1. Kullanıcı işlem sayılarını düzelten (get_admin_active_users) fonksiyonunu günceller.
-- 2. Adminlerin tüm verilere erişmesini sağlayan RLS (Güvenlik) kurallarını onarır.

-- -----------------------------------------------------
-- 1. FONKSİYON GÜNCELLEME (İşlem Sayıları İçin)
-- -----------------------------------------------------

DROP FUNCTION IF EXISTS get_admin_active_users();

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
SECURITY DEFINER -- Admin yetkisiyle çalışır
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.email,
    p.full_name,
    p.credits,
    (p.subscription_tier = 'admin') as is_admin, -- Kiritik Düzeltme: Yetkiyi subscription_tier'dan al
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

-- -----------------------------------------------------
-- 2. RLS GÜVENLİK DÜZELTMELERİ (Görsel ve Veri Erişimi İçin)
-- -----------------------------------------------------

-- Profiles
DROP POLICY IF EXISTS "profiles_select_all" ON profiles;
DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
CREATE POLICY "profiles_select_all" ON profiles FOR SELECT TO authenticated USING (true);

-- Generations (Admin hepsini görür)
ALTER TABLE generations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "generations_select" ON generations;
DROP POLICY IF EXISTS "generations_select_policy" ON generations;
DROP POLICY IF EXISTS "Admin users can view all generations" ON generations;

CREATE POLICY "generations_select" ON generations FOR SELECT TO authenticated USING (
  user_id = auth.uid() 
  OR 
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.subscription_tier = 'admin')
);

-- Transactions (Admin hepsini görür)
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "transactions_select" ON transactions;
DROP POLICY IF EXISTS "transactions_select_policy" ON transactions;

CREATE POLICY "transactions_select" ON transactions FOR SELECT TO authenticated USING (
  user_id = auth.uid() 
  OR 
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.subscription_tier = 'admin')
);

-- DİĞER GEREKLİ İZİNLER
GRANT EXECUTE ON FUNCTION get_admin_active_users TO authenticated;
GRANT EXECUTE ON FUNCTION get_admin_active_users TO service_role;
