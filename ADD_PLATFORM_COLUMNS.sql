-- =========================================
-- Fasheone - Platform Columns Migration
-- =========================================
-- Bu SQL'i Supabase Dashboard → SQL Editor'da çalıştırın.
-- Mobil/Web platform takibi için gerekli kolonları ekler.
-- =========================================

-- 1) transactions tablosuna platform kolonu ekle
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS platform TEXT;

-- 2) Mevcut kayıtları payment_method'a göre güncelle
UPDATE transactions SET platform = 'mobile' WHERE payment_method = 'revenuecat' AND platform IS NULL;
UPDATE transactions SET platform = 'web' WHERE payment_method = 'stripe' AND platform IS NULL;
UPDATE transactions SET platform = 'admin' WHERE payment_method = 'admin_grant' AND platform IS NULL;

-- 3) profiles tablosuna signup_platform kolonu ekle (kayıt platformu)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS signup_platform TEXT;

-- 4) Doğrulama - eklenen kolonları kontrol et
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'transactions' AND column_name = 'platform';

SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name = 'signup_platform';

-- ✅ Tamamlandı!
-- Artık backend'den gelen yeni işlemler otomatik olarak platform bilgisiyle kaydedilecek.
-- Web Admin'de TransactionsPanel'de Mobil/Web/Admin rozetleri görünecek.
-- UserActivityPanel'de kullanıcıların kayıt platformu görünecek.
