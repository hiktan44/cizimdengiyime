# 🔧 Storage Upload Hatası Çözümü

## ❌ Hata
```
sketch görseli Supabase yüklemesi başarısız: 
insert into "objects" - record "new" has no field "level"
```

## 🎯 Sebep
- Storage bucket'ları düzgün oluşturulmamış
- RLS politikaları hatalı veya eksik
- Dosya yolu yapılandırması yanlış

## ✅ Çözüm (3 Adım)

### ADIM 1: Kod Güncellemeleri (✅ Tamamlandı)

Aşağıdaki dosyalar güncellendi:
- ✅ `lib/adminService.ts` - Dosya yolları düzeltildi (`hero-videos/`, `showcase-images/` prefix eklendi)
- ✅ `upsert: true` - Dosya üzerine yazma aktif edildi

### ADIM 2: Supabase Storage Kurulumu

**Seçenek A: Basit Kurulum (Önerilen)** 👈

1. Supabase Dashboard'a git: https://supabase.com/dashboard
2. **SQL Editor** > **New Query**
3. `SIMPLE_STORAGE_SETUP.sql` dosyasını aç
4. Tüm içeriği kopyala ve SQL Editor'e yapıştır
5. **RUN** butonuna tıkla

**Beklenilen Çıktı:**
```
✅ hero-videos bucket created (PUBLIC)
✅ showcase-images bucket created (PUBLIC)
✅ 4 policies created (SELECT, INSERT, UPDATE, DELETE)
```

**Seçenek B: Detaylı Kurulum**

`FIX_STORAGE_BUCKETS.sql` dosyasını kullan (daha fazla kontrol)

### ADIM 3: Admin Yetkisi Kontrol

```sql
-- SQL Editor'de çalıştır:
SELECT email, is_admin FROM profiles WHERE email = 'sizin@email.com';

-- Eğer is_admin = false ise:
UPDATE profiles SET is_admin = true WHERE email = 'sizin@email.com';
```

---

## 🧪 Test Et

### 1. Browser Console Temizle
- F12 > Console > Clear Console
- Sayfayı yenile (Ctrl+F5)

### 2. Admin Panel'den Upload Dene
1. Admin Panel > İçerik Yönetimi
2. Sketch görseli yükle
3. Console'da başarı mesajını bekle:
   ```
   ✅ sketch görseli Supabase'e yüklendi: https://...
   ```

### 3. Supabase'de Kontrol Et
```sql
-- Storage'da dosya var mı?
SELECT name, bucket_id, created_at 
FROM storage.objects 
WHERE bucket_id = 'showcase-images'
ORDER BY created_at DESC
LIMIT 5;

-- Database'de kayıt var mı?
SELECT type, image_url, is_active, created_at 
FROM showcase_images 
WHERE type = 'sketch'
ORDER BY created_at DESC
LIMIT 1;
```

---

## 🔍 Hata Devam Ederse

### Debug Adımları:

**1. Bucket'ları Kontrol Et:**
```sql
SELECT id, name, public FROM storage.buckets;
```
**Beklenen:** `hero-videos` ve `showcase-images` görünmeli, her ikisi de `public = true`

**2. Politikaları Kontrol Et:**
```sql
SELECT policyname, cmd, roles 
FROM pg_policies 
WHERE schemaname = 'storage' 
  AND tablename = 'objects';
```
**Beklenen:** En az 4 policy (SELECT, INSERT, UPDATE, DELETE)

**3. Admin Yetkisini Kontrol Et:**
```sql
SELECT auth.uid() as current_user_id;
SELECT id, email, is_admin FROM profiles WHERE id = auth.uid();
```
**Beklenen:** `is_admin = true`

**4. Browser Console'da Detaylı Hata:**
- F12 > Console
- Upload dene
- Tam hata mesajını kopyala

---

## 🆘 Alternatif Çözüm: Dashboard'dan Manuel Bucket Oluştur

Eğer SQL çalışmazsa:

1. Supabase Dashboard > **Storage**
2. **New bucket** butonuna tıkla
3. **hero-videos** bucket'ı oluştur:
   - Name: `hero-videos`
   - Public bucket: ✅ **AÇIK**
   - File size limit: 50 MB
   - Allowed MIME types: `video/mp4, video/webm`
4. **showcase-images** bucket'ı oluştur:
   - Name: `showcase-images`
   - Public bucket: ✅ **AÇIK**
   - File size limit: 10 MB
   - Allowed MIME types: `image/jpeg, image/png, image/webp`

5. Her bucket için **Policies** sekmesine git:
   - "New Policy" > "For full customization"
   - Aşağıdaki policy'leri ekle:

**Public Read Policy:**
```sql
((bucket_id = 'hero-videos'::text) OR (bucket_id = 'showcase-images'::text))
```

**Admin Write Policy:**
```sql
((bucket_id = 'hero-videos'::text) OR (bucket_id = 'showcase-images'::text)) 
AND (auth.uid() IN ( SELECT profiles.id FROM profiles WHERE (profiles.is_admin = true)))
```

---

## 📊 Başarı Kontrolü

Upload başarılı olduğunda:

✅ Admin Panel'de görsel preview görünür  
✅ Console: `✅ sketch görseli Supabase'e yüklendi: https://...`  
✅ Alert mesajı: "Sketch görseli başarıyla yüklendi!"  
✅ Supabase Storage'da dosya görünür  
✅ Supabase Database'de kayıt var  
✅ Ana sayfada showcase bölümünde görünür  

---

## 💾 Değişiklikleri Kaydet

Kod güncellemeleri yapıldı, şimdi commit/push yapalım:

```bash
git add .
git commit -m "fix: Storage bucket upload error - folder path and RLS policy fixes"
git push origin main
```

---

## 📞 Hala Sorun Varsa

1. Terminal'deki tam hata mesajını paylaş
2. Supabase logs'u kontrol et: Dashboard > Logs > Edge Functions
3. Browser console'daki tüm hata mesajlarını paylaş

**Test için örnek komutlar:**
```sql
-- Tüm storage durumunu göster
SELECT 
  b.id as bucket,
  b.public,
  COUNT(o.id) as file_count
FROM storage.buckets b
LEFT JOIN storage.objects o ON b.id = o.bucket_id
WHERE b.id IN ('hero-videos', 'showcase-images')
GROUP BY b.id, b.public;
```

---

**✨ Bu adımları takip ettikten sonra upload çalışmalı!**

