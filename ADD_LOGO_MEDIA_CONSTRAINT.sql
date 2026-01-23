
-- Bu SQL komutunu Supabase Dashboard > SQL Editor kısmında çalıştırın.
-- Bu komut, showcase_images tablosuna 'logo_media' (Logo Animasyonu/Geçişi) tipini ekler.

-- Mevcut kısıtlamayı kaldır
ALTER TABLE showcase_images DROP CONSTRAINT IF EXISTS showcase_images_type_check;

-- Yeni tipleri içeren kısıtlamayı ekle
ALTER TABLE showcase_images ADD CONSTRAINT showcase_images_type_check 
CHECK (type IN ('sketch', 'product', 'model', 'video', 'adgenius_main', 'adgenius_collage', 'logo_media'));

-- İzinleri kontrol et (Gerekirse)
GRANT ALL ON TABLE showcase_images TO service_role;
GRANT ALL ON TABLE showcase_images TO postgres;
GRANT SELECT ON TABLE showcase_images TO anon;
GRANT SELECT ON TABLE showcase_images TO authenticated;
