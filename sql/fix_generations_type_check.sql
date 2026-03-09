-- =============================================
-- generations tablosu type CHECK constraint güncelle
-- Yeni işlem tipleri ekleniyor
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
