-- =============================================
-- Widget için feature_num check constraint güncelleme
-- feature_num 1-9 → 1-10 olarak genişletiliyor
-- =============================================

-- 1. Eski constraint'i kaldır
ALTER TABLE before_after_images DROP CONSTRAINT IF EXISTS before_after_images_feature_num_check;

-- 2. Yeni constraint ekle (1-10 arası)
ALTER TABLE before_after_images ADD CONSTRAINT before_after_images_feature_num_check
  CHECK (feature_num >= 1 AND feature_num <= 10);
