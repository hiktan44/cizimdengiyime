-- Before/After Showcase tablosu oluştur
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

-- RLS etkinleştir
ALTER TABLE before_after_images ENABLE ROW LEVEL SECURITY;

-- Herkes okuyabilir (landing page için)
CREATE POLICY "Public read" ON before_after_images
  FOR SELECT USING (true);

-- Authenticated kullanıcılar (admin) yazabilir
CREATE POLICY "Auth insert" ON before_after_images
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Auth update" ON before_after_images
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Auth delete" ON before_after_images
  FOR DELETE TO authenticated USING (true);

-- Index
CREATE INDEX idx_ba_images_feature ON before_after_images(feature_num, side);
