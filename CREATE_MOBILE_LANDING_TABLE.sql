-- =========================================
-- Fasheone - Mobile Landing Content Table
-- =========================================
-- Bu SQL'i Supabase Dashboard → SQL Editor'da çalıştırın.
-- Mobil uygulamanın landing page içeriklerini yönetmek için tablo oluşturur.
-- =========================================

-- 1) mobile_landing_content tablosu oluştur
CREATE TABLE IF NOT EXISTS mobile_landing_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('hero_banner', 'feature_card', 'promo_banner', 'app_screenshot')),
  title TEXT NOT NULL,
  subtitle TEXT,
  image_url TEXT NOT NULL,
  link_url TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2) Index'ler
CREATE INDEX IF NOT EXISTS idx_mobile_landing_type ON mobile_landing_content(type);
CREATE INDEX IF NOT EXISTS idx_mobile_landing_active ON mobile_landing_content(is_active);
CREATE INDEX IF NOT EXISTS idx_mobile_landing_order ON mobile_landing_content(type, order_index);

-- 3) RLS (Row Level Security) Politikaları
ALTER TABLE mobile_landing_content ENABLE ROW LEVEL SECURITY;

-- Herkes okuyabilir (mobil uygulama için)
CREATE POLICY "mobile_landing_content_select_all" ON mobile_landing_content
  FOR SELECT USING (true);

-- Sadece admin kullanıcılar değiştirebilir
CREATE POLICY "mobile_landing_content_insert_admin" ON mobile_landing_content
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (is_admin = true OR subscription_tier = 'admin'))
  );

CREATE POLICY "mobile_landing_content_update_admin" ON mobile_landing_content
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (is_admin = true OR subscription_tier = 'admin'))
  );

CREATE POLICY "mobile_landing_content_delete_admin" ON mobile_landing_content
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (is_admin = true OR subscription_tier = 'admin'))
  );

-- 4) Storage Bucket oluştur (Supabase Dashboard → Storage'da da yapılabilir)
INSERT INTO storage.buckets (id, name, public)
VALUES ('mobile-landing', 'mobile-landing', true)
ON CONFLICT (id) DO NOTHING;

-- 5) Storage RLS - Herkes okuyabilir, admin yazabilir
CREATE POLICY "mobile_landing_storage_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'mobile-landing');

CREATE POLICY "mobile_landing_storage_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'mobile-landing' AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (is_admin = true OR subscription_tier = 'admin'))
  );

CREATE POLICY "mobile_landing_storage_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'mobile-landing' AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (is_admin = true OR subscription_tier = 'admin'))
  );

-- 6) Doğrulama
SELECT 'mobile_landing_content tablosu oluşturuldu ✅' AS status;
SELECT count(*) AS policy_count FROM pg_policies WHERE tablename = 'mobile_landing_content';

-- ✅ Tamamlandı!
-- Admin panelde "📱 Mobil Landing" sekmesinden içerik yönetimi yapabilirsiniz.
-- İçerik tipleri:
--   hero_banner    → Mobil uygulamanın üst kısmındaki büyük slider bannerlar
--   feature_card   → Özellik tanıtım kartları
--   promo_banner   → Promosyon/Kampanya bannerları
--   app_screenshot → Uygulama ekran görüntüleri
