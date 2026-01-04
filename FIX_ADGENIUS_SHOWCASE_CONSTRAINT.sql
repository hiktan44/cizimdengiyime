-- AdGenius görselleri için showcase_images tablosundaki tip kısıtlamasını güncelle
-- Bu betiği Supabase SQL Editor üzerinde çalıştırın

-- Mevcut kısıtlamayı kaldır
ALTER TABLE showcase_images DROP CONSTRAINT IF EXISTS showcase_images_type_check;

-- Yeni tipleri (adgenius_main, adgenius_collage) içeren kısıtlamayı ekle
ALTER TABLE showcase_images ADD CONSTRAINT showcase_images_type_check 
CHECK (type IN ('sketch', 'product', 'model', 'video', 'adgenius_main', 'adgenius_collage'));

-- Bilgilendirme
COMMENT ON TABLE showcase_images IS 'Showcase görselleri ve AdGenius ana görselleri için tablo';
