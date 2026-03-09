-- =============================================
-- TÜM GENERATIONS SORUNLARINI ÇÖZEN BİRLEŞİK SQL
-- Supabase SQL Editor'de çalıştır
-- =============================================

-- =============================================
-- 1. TYPE CHECK CONSTRAINT GÜNCELLE
-- =============================================
ALTER TABLE generations DROP CONSTRAINT IF EXISTS generations_type_check;

ALTER TABLE generations ADD CONSTRAINT generations_type_check
  CHECK (type IN (
    'sketch_to_product',
    'product_to_model',
    'video',
    'video_fast',
    'video_high',
    'tech_sketch',
    'tech_pack',
    'pixshop',
    'fotomatik_transform',
    'fotomatik_describe',
    'adgenius_campaign_image',
    'adgenius_campaign_video',
    'adgenius_ecommerce_image',
    'adgenius_ecommerce_video',
    'collage'
  ));

-- =============================================
-- 2. RLS POLICY DÜZELTMESİ
-- Admin hem is_admin=true hem subscription_tier='admin' ile çalışsın
-- =============================================

-- Eski policy'leri temizle
DROP POLICY IF EXISTS "generations_select" ON generations;
DROP POLICY IF EXISTS "generations_insert" ON generations;
DROP POLICY IF EXISTS "generations_select_policy" ON generations;
DROP POLICY IF EXISTS "generations_insert_policy" ON generations;
DROP POLICY IF EXISTS "Users can view own generations" ON generations;
DROP POLICY IF EXISTS "Users can insert own generations" ON generations;
DROP POLICY IF EXISTS "Admin users can view all generations" ON generations;

-- RLS aktif
ALTER TABLE generations ENABLE ROW LEVEL SECURITY;

-- SELECT: Admin (is_admin=true VEYA subscription_tier='admin') tüm kayıtları görebilir
-- Normal kullanıcılar sadece kendi kayıtlarını görebilir
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
    AND (profiles.is_admin = true OR profiles.subscription_tier = 'admin')
  )
);

-- INSERT: Herkes kendi adına kayıt ekleyebilir
CREATE POLICY "generations_insert"
ON generations
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- =============================================
-- 3. SHOWCASE_IMAGES TYPE CHECK (önceki düzeltme)
-- =============================================
ALTER TABLE showcase_images DROP CONSTRAINT IF EXISTS showcase_images_type_check;

ALTER TABLE showcase_images ADD CONSTRAINT showcase_images_type_check
  CHECK (type IN (
    'sketch', 'product', 'model', 'video',
    'adgenius_main', 'adgenius_collage', 'logo_media',
    'pixshop_retush', 'pixshop_product_placement',
    'adgenius_model', 'adgenius_campaign',
    'adgenius_video', 'adgenius_product_placement'
  ));

-- =============================================
-- 4. BEFORE_AFTER_IMAGES TABLOSU (yoksa oluştur)
-- =============================================
CREATE TABLE IF NOT EXISTS before_after_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  feature_num INTEGER NOT NULL CHECK (feature_num >= 1 AND feature_num <= 9),
  side TEXT NOT NULL CHECK (side IN ('before', 'after')),
  image_url TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(feature_num, side)
);

ALTER TABLE before_after_images ENABLE ROW LEVEL SECURITY;

-- Policy'ler (yoksa oluştur)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'before_after_images' AND policyname = 'ba_public_read') THEN
    CREATE POLICY "ba_public_read" ON before_after_images FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'before_after_images' AND policyname = 'ba_auth_insert') THEN
    CREATE POLICY "ba_auth_insert" ON before_after_images FOR INSERT TO authenticated WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'before_after_images' AND policyname = 'ba_auth_update') THEN
    CREATE POLICY "ba_auth_update" ON before_after_images FOR UPDATE TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'before_after_images' AND policyname = 'ba_auth_delete') THEN
    CREATE POLICY "ba_auth_delete" ON before_after_images FOR DELETE TO authenticated USING (true);
  END IF;
END $$;

-- =============================================
-- TAMAMLANDI ✅
-- =============================================
