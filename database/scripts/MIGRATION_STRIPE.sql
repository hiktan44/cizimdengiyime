-- Stripe Ayarları için Migration Dosyası

-- 1. Stripe Modu (test/live)
INSERT INTO public.site_settings (key, value, type, description, updated_at)
VALUES (
  'stripe_mode',
  'test',
  'string',
  'Stripe çalışma modu (test veya live)',
  NOW()
) ON CONFLICT (key) DO UPDATE SET 
  value = EXCLUDED.value,
  updated_at = NOW();

-- 2. Stripe Publishable Key
INSERT INTO public.site_settings (key, value, type, description, updated_at)
VALUES (
  'stripe_publishable_key',
  'pk_test_51QTe4XCr82j1cLP0oC3jWZ3oU23ILHflU3e9ZOJjyXkX4ZcsIDPOw336H3x31igpmR24Lnc7crAKQwQC4WEyYcNK00jQZGWKeL',
  'string',
  'Stripe Publishable Key (İstemci tarafı için)',
  NOW()
) ON CONFLICT (key) DO UPDATE SET 
  value = EXCLUDED.value,
  updated_at = NOW();

-- 3. Stripe Secret Key
INSERT INTO public.site_settings (key, value, type, description, updated_at)
VALUES (
  'stripe_secret_key',
  'sk_test_51QTe4XCr82j1cLP0OQu7FSKXhW9qyOoEvUvFTxJb2FvbHmPrZKhNVk7B1JMrk7i7j79nsBoxmeAa48iSW1PYYbbc00aJWoRdMY',
  'string',
  'Stripe Secret Key (Sunucu tarafı için)',
  NOW()
) ON CONFLICT (key) DO UPDATE SET 
  value = EXCLUDED.value,
  updated_at = NOW();

-- PayTR Ayarlarını Temizle (İsteğe bağlı, eski verileri tutmak isterseniz bu kısmı çalıştırmayın)
-- DELETE FROM public.site_settings WHERE key LIKE 'paytr_%';
