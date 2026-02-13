-- =====================================================
-- FIX: Admin Access via RPC (Bypassing RLS Complexity)
-- =====================================================
-- RLS (Satır Düzeyinde Güvenlik) politikaları karmaşıklaştığında
-- veya performans sorunları yarattığında, SECURITY DEFINER
-- fonksiyonlar kullanmak en kesin çözümdür.

-- 1. Generations Getir (Admin İçin)
CREATE OR REPLACE FUNCTION get_user_generations_admin(target_user_id uuid)
RETURNS SETOF generations
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Çağıran kişinin admin olup olmadığını kontrol et
  -- Bu kontrol profil tablosuna doğrudan erişim gerektirir, SECURITY DEFINER bunu sağlar
  IF NOT EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND subscription_tier = 'admin'
  ) THEN
      -- Güvenlik önlemi: Admin değilse hata fırlat veya boş dön
      RAISE EXCEPTION 'Unauthorized: Access denied.';
  END IF;

  RETURN QUERY
  SELECT * FROM generations
  WHERE user_id = target_user_id
  ORDER BY created_at DESC;
END;
$$;

-- 2. Transactions Getir (Admin İçin)
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

-- İzinleri Tanımla
GRANT EXECUTE ON FUNCTION get_user_generations_admin TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_transactions_admin TO authenticated;

-- Not: Ayrıca Profiles tablosunu okumak için de bir RPC ekleyelim, garanti olsun.
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

GRANT EXECUTE ON FUNCTION get_user_profile_admin TO authenticated;
