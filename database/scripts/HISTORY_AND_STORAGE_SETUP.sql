-- ==============================================================================
-- 1. STORAGE BUCKET KURULUMU (GENERATIONS)
-- ==============================================================================

-- 'generations' bucket'ını oluştur (eğer yoksa)
INSERT INTO storage.buckets (id, name, public)
VALUES ('generations', 'generations', true)
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- 2. STORAGE POLİTİKALARI (RLS)
-- ==============================================================================

-- Önce mevcut politikaları temizleyelim (çakışmayı önlemek için)
DROP POLICY IF EXISTS "Generations Public Read" ON storage.objects;
DROP POLICY IF EXISTS "Generations Authenticated Upload" ON storage.objects;
DROP POLICY IF EXISTS "Generations Owners Delete" ON storage.objects;

-- 1. Herkesin görselleri görüntülemesine izin ver (Public Access)
CREATE POLICY "Generations Public Read"
ON storage.objects FOR SELECT
USING ( bucket_id = 'generations' );

-- 2. Sadece giriş yapmış kullanıcıların yükleme yapmasına izin ver
CREATE POLICY "Generations Authenticated Upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'generations' );

-- 3. Kullanıcıların kendi yükledikleri dosyaları silmesine izin ver
-- Not: Admin temizliği için admin'e özel yetki de gerekebilir, 
-- ancak supabase service_role anahtarı kullanıyorsak bypass eder.
CREATE POLICY "Generations Owners Delete"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'generations' AND (auth.uid() = owner) );

-- ==============================================================================
-- 3. VERİTABANI İYİLEŞTİRMELERİ
-- ==============================================================================

-- Generations tablosunda created_at için indeks oluştur (Sorgu ve silme hızı için)
CREATE INDEX IF NOT EXISTS idx_generations_created_at ON public.generations(created_at);

-- Generations tablosunda user_id için indeks oluştur (Geçmiş listeleme hızı için)
CREATE INDEX IF NOT EXISTS idx_generations_user_id ON public.generations(user_id);

-- ==============================================================================
-- 4. GEÇMİŞ GÖRÜNTÜLEME VE TEMİZLİK İÇİN GEREKLİ RPC FONKSİYONLARI
-- ==============================================================================

-- 5 günden eski görselleri silmek için yardımcı fonksiyon
-- Bu fonksiyonu Admin panelinden çağırabiliriz
CREATE OR REPLACE FUNCTION delete_old_generations()
RETURNS TABLE (deleted_count INT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    items_deleted INT;
BEGIN
    -- 5 günden eski kayıtları sil
    -- Not: Storage'dan dosya silme işlemi uygulama tarafında (App) trigger veya 
    -- cron job ile veya manuel script ile yapılmalıdır. 
    -- SQL tek başına storage dosyalarını fiziksel olarak silmez (file metadata'yı siler).
    -- Ancak Supabase edge functions veya client-side logic gereklidir fiziksel silim için.
    
    WITH deleted_rows AS (
        DELETE FROM public.generations
        WHERE created_at < NOW() - INTERVAL '5 days'
        RETURNING *
    )
    SELECT count(*) INTO items_deleted FROM deleted_rows;
    
    RETURN QUERY SELECT items_deleted;
END;
$$;
