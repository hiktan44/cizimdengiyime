-- =====================================================
-- TÜM ADMIN ERİŞİM SORUNLARINI DÜZELT
-- Tarih: 2026-02-02
-- Açıklama: RLS ve RPC fonksiyonlarını birleştirir
-- =====================================================

-- =====================================================
-- BÖLÜM 1: PROFILES TABLOSU RLS
-- =====================================================

DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on id" ON profiles;
DROP POLICY IF EXISTS "profiles_select_all" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;

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
-- BÖLÜM 2: GENERATIONS TABLOSU RLS
-- =====================================================

DROP POLICY IF EXISTS "generations_select_policy" ON generations;
DROP POLICY IF EXISTS "generations_insert_policy" ON generations;
DROP POLICY IF EXISTS "generations_update_policy" ON generations;
DROP POLICY IF EXISTS "Admin users can view all generations" ON generations;
DROP POLICY IF EXISTS "Users can view own generations" ON generations;
DROP POLICY IF EXISTS "Users can view their own generations" ON generations;
DROP POLICY IF EXISTS "Users can insert own generations" ON generations;
DROP POLICY IF EXISTS "generations_select" ON generations;
DROP POLICY IF EXISTS "generations_insert" ON generations;

ALTER TABLE generations ENABLE ROW LEVEL SECURITY;

-- Admin tüm kayıtları görebilir, normal kullanıcı sadece kendininkini
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
-- BÖLÜM 3: TRANSACTIONS TABLOSU RLS
-- =====================================================

DROP POLICY IF EXISTS "transactions_select_policy" ON transactions;
DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
DROP POLICY IF EXISTS "transactions_select" ON transactions;
DROP POLICY IF EXISTS "transactions_insert" ON transactions;

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

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

CREATE POLICY "transactions_insert"
ON transactions
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- =====================================================
-- BÖLÜM 4: ADMIN RPC FONKSİYONLARI
-- =====================================================

-- Admin için kullanıcı generation'larını getiren RPC
CREATE OR REPLACE FUNCTION get_user_generations_admin(target_user_id uuid)
RETURNS SETOF generations
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NOT EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND subscription_tier = 'admin'
  ) THEN
      RAISE EXCEPTION 'Unauthorized: Access denied.';
  END IF;

  RETURN QUERY
  SELECT * FROM generations
  WHERE user_id = target_user_id
  ORDER BY created_at DESC;
END;
$$;

-- Admin için kullanıcı transaction'larını getiren RPC
CREATE OR REPLACE FUNCTION get_user_transactions_admin(target_user_id uuid)
RETURNS SETOF transactions
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NOT EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND subscription_tier = 'admin'
  ) THEN
      RAISE EXCEPTION 'Unauthorized: Access denied.';
  END IF;

  RETURN QUERY
  SELECT * FROM transactions
  WHERE user_id = target_user_id
  ORDER BY created_at DESC;
END;
$$;

-- Admin için kullanıcı profil bilgisini getiren RPC
CREATE OR REPLACE FUNCTION get_user_profile_admin(target_user_id uuid)
RETURNS SETOF profiles
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NOT EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND subscription_tier = 'admin'
  ) THEN
      RAISE EXCEPTION 'Unauthorized';
  END IF;

  RETURN QUERY
  SELECT * FROM profiles
  WHERE id = target_user_id;
END;
$$;

-- Admin aktif kullanıcılar dashboard fonksiyonu
CREATE OR REPLACE FUNCTION get_admin_active_users()
RETURNS TABLE (
    id uuid,
    email text,
    full_name text,
    phone_number text,
    credits integer,
    is_admin boolean,
    total_generations bigint,
    total_credits_used bigint,
    created_at timestamptz,
    last_activity timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Admin kontrolü
    IF NOT EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.subscription_tier = 'admin'
    ) THEN
        RAISE EXCEPTION 'Unauthorized: Admin access required';
    END IF;

    RETURN QUERY
    SELECT 
        p.id,
        p.email,
        p.full_name,
        p.phone_number,
        p.credits,
        (p.subscription_tier = 'admin') as is_admin,
        COALESCE(g.total_generations, 0)::bigint as total_generations,
        COALESCE(g.total_credits_used, 0)::bigint as total_credits_used,
        p.created_at,
        g.last_activity
    FROM profiles p
    LEFT JOIN (
        SELECT 
            user_id,
            COUNT(*) as total_generations,
            SUM(credits_used) as total_credits_used,
            MAX(created_at) as last_activity
        FROM generations
        GROUP BY user_id
    ) g ON p.id = g.user_id
    ORDER BY p.created_at DESC;
END;
$$;

-- İzinleri Tanımla
GRANT EXECUTE ON FUNCTION get_user_generations_admin TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_transactions_admin TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_profile_admin TO authenticated;
GRANT EXECUTE ON FUNCTION get_admin_active_users TO authenticated;

-- =====================================================
-- TAMAMLANDI!
-- =====================================================
-- Bu scripti çalıştırdıktan sonra admin panelden
-- tüm kullanıcı işlemlerini görebilirsiniz.
-- =====================================================
