-- =============================================
-- showcase_images CHECK constraint güncelleme
-- Yeni tipler ekleniyor
-- =============================================

-- 1. Eski constraint'i kaldır
ALTER TABLE showcase_images DROP CONSTRAINT IF EXISTS showcase_images_type_check;

-- 2. Yeni, genişletilmiş constraint ekle
ALTER TABLE showcase_images ADD CONSTRAINT showcase_images_type_check
  CHECK (type IN (
    'sketch',
    'product',
    'model',
    'video',
    'adgenius_main',
    'adgenius_collage',
    'logo_media',
    'pixshop_retush',
    'pixshop_product_placement',
    'adgenius_model',
    'adgenius_campaign',
    'adgenius_video',
    'adgenius_product_placement'
  ));

-- =============================================
-- Before/After tablosu (ayrı tablo)
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

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'before_after_images' AND policyname = 'Public read ba') THEN
    CREATE POLICY "Public read ba" ON before_after_images FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'before_after_images' AND policyname = 'Auth insert ba') THEN
    CREATE POLICY "Auth insert ba" ON before_after_images FOR INSERT TO authenticated WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'before_after_images' AND policyname = 'Auth update ba') THEN
    CREATE POLICY "Auth update ba" ON before_after_images FOR UPDATE TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'before_after_images' AND policyname = 'Auth delete ba') THEN
    CREATE POLICY "Auth delete ba" ON before_after_images FOR DELETE TO authenticated USING (true);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_ba_images_feature ON before_after_images(feature_num, side);
