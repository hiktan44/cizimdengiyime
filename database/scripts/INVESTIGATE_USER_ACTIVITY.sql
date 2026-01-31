
-- 1. Kullanıcıyı bul
SELECT id, email, full_name, credits, created_at, last_sign_in_at 
FROM auth.users 
WHERE email = 'smile.giyim.ai@gmail.com';

-- 2. Profil tablosunu kontrol et
SELECT id, email, full_name, credits, created_at, updated_at
FROM public.profiles
WHERE email = 'smile.giyim.ai@gmail.com';

-- 3. Bugünün tarihini al (Server Time)
SELECT now()::date as server_date, now() as server_timestamp;

-- 4. Bu kullanıcının bugünkü üretimlerini (generations) listele
-- Not: user_id'yi yukarıdaki sorgudan alıp buraya manuel yazmamız gerekebilir veya join yapabiliriz.
SELECT 
    g.id, 
    g.type, 
    g.credits_used, 
    g.created_at, 
    g.input_image_url, 
    g.output_image_url 
FROM public.generations g
JOIN public.profiles p ON g.user_id = p.id
WHERE p.email = 'smile.giyim.ai@gmail.com'
ORDER BY g.created_at DESC
LIMIT 20;

-- 5. Bu kullanıcının tüm üretim sayılarını kontrol et
SELECT count(*) as total_generations 
FROM public.generations g
JOIN public.profiles p ON g.user_id = p.id
WHERE p.email = 'smile.giyim.ai@gmail.com';
