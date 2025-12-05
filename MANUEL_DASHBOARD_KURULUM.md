# 🎯 Manuel Dashboard Kurulum - Storage Trigger Hatası Çözümü

## ❌ Sorun
```
record "new" has no field "level"
```
Bu hata Supabase Storage'da eski bir trigger'dan kaynaklanıyor. SQL ile düzeltmek riskli olabilir.

## ✅ Çözüm: Dashboard'dan Manuel Kurulum

### ADIM 1: Eski Bucket'ları Sil

1. Supabase Dashboard'a git: https://supabase.com/dashboard
2. **Storage** sekmesine tıkla
3. **hero-videos** bucket'ını bul
   - Sağ taraftaki **3 nokta (⋮)** > **Delete bucket**
   - Onay ver
4. **showcase-images** bucket'ını bul
   - Sağ taraftaki **3 nokta (⋮)** > **Delete bucket**
   - Onay ver

⚠️ **NOT:** Bucket silinirken hata alırsanız, önce içindeki tüm dosyaları silin.

---

### ADIM 2: Yeni Bucket'ları Oluştur

#### Hero Videos Bucket

1. **Storage** > **New bucket** butonuna tıkla
2. Formu doldur:
   ```
   Name: hero-videos
   Public bucket: ✅ AÇIK (toggle'ı yeşil yapın)
   Allowed MIME types: (boş bırak - tümü kabul edilsin)
   ```
3. **Create bucket** butonuna tıkla

#### Showcase Images Bucket

1. **Storage** > **New bucket** butonuna tıkla
2. Formu doldur:
   ```
   Name: showcase-images
   Public bucket: ✅ AÇIK (toggle'ı yeşil yapın)
   Allowed MIME types: (boş bırak - tümü kabul edilsin)
   ```
3. **Create bucket** butonuna tıkla

---

### ADIM 3: Policies Ayarla (Basit Yöntem)

#### Hero Videos Policies

1. **Storage** > **hero-videos** bucket'ına tıkla
2. **Policies** sekmesine geç
3. **New Policy** > **Get started quickly** > **Allow access to all authenticated users**
4. ✅ **INSERT**, ✅ **SELECT**, ✅ **UPDATE**, ✅ **DELETE** tümünü işaretle
5. **Review** > **Save policy**

#### Showcase Images Policies

1. **Storage** > **showcase-images** bucket'ına tıkla
2. **Policies** sekmesine geç
3. **New Policy** > **Get started quickly** > **Allow access to all authenticated users**
4. ✅ **INSERT**, ✅ **SELECT**, ✅ **UPDATE**, ✅ **DELETE** tümünü işaretle
5. **Review** > **Save policy**

---

### ADIM 4: Admin Yetkisi Kontrol

1. Supabase Dashboard > **SQL Editor**
2. **New Query**
3. Aşağıdaki SQL'i çalıştır (email'i değiştir):

```sql
-- Admin yetkisini kontrol et
SELECT email, is_admin FROM profiles WHERE email = 'sizin@email.com';

-- Admin değilsen:
UPDATE profiles SET is_admin = true WHERE email = 'sizin@email.com';

-- Tekrar kontrol et
SELECT email, is_admin FROM profiles WHERE email = 'sizin@email.com';
```

Sonuç: `is_admin` sütunu `true` olmalı ✅

---

### ADIM 5: Test Et

#### Browser Hazırlığı
1. F12 tuşuna bas (Developer Tools)
2. **Console** sekmesine geç
3. **Clear console** (temizle butonu)
4. Sayfayı yenile: **Ctrl+F5** (hard refresh)

#### Upload Testi
1. Admin Panel > İçerik Yönetimi
2. **Sketch** görseli yükle
3. Console'da log'ları izle:

**Başarılı olursa:**
```
📤 Uploading showcase sketch: sketch-1234567890.jpg
✅ Storage upload successful: { path: "..." }
📍 Public URL: https://...
✅ Database record created
✅ sketch görseli Supabase'e yüklendi: https://...
```

**Başarısız olursa:**
```
❌ Storage upload error: ...
```

---

## 🔍 Hala Çalışmıyorsa

### Kontrol Listesi

#### 1. Bucket'ları Kontrol Et
- **Storage** sekmesinde `hero-videos` ve `showcase-images` görünüyor mu?
- İkisi de **PUBLIC** olarak işaretli mi?

#### 2. Policies Kontrol Et
```sql
-- SQL Editor'de çalıştır:
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd
FROM pg_policies 
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
ORDER BY policyname;
```

En az 2 policy görmelisiniz (her bucket için 1).

#### 3. Storage Logs Kontrol Et
- Dashboard > **Logs** > **Storage**
- Son hataları kontrol edin
- "level" içeren hata var mı?

#### 4. Trigger'ları Kontrol Et (İleri Seviye)
```sql
-- SQL Editor'de çalıştır:
SELECT 
  tgname,
  tgtype,
  tgenabled,
  pg_get_triggerdef(oid) as definition
FROM pg_trigger 
WHERE tgrelid = 'storage.objects'::regclass
  AND tgname NOT LIKE 'pg_%'
ORDER BY tgname;
```

Eğer özel trigger'lar görürseniz, bunları paylaşın.

---

## 🆘 Alternatif: Temiz Proje Kurulumu

Eğer hiçbir şey işe yaramazsa:

### Seçenek A: Storage'ı Devre Dışı Bırak (Geçici)

Sadece localStorage kullanarak test edin:
- Admin panel'de dosya yükleyin
- LocalStorage'a kaydedilir
- Ana sayfada gösterilir
- **Ancak:** Sayfa yenilendiğinde kaybolur

### Seçenek B: Yeni Supabase Projesi

1. Yeni bir Supabase projesi oluşturun
2. Sadece gerekli tabloları migrate edin
3. Storage bucket'ları temiz kurun
4. `.env` dosyasını güncelleyin

---

## 📞 Destek

Eğer sorun devam ederse:

1. **Supabase Support'a bildir:**
   - Dashboard > Help > Submit a ticket
   - Hatayı detaylı açıkla: "record 'new' has no field 'level'"
   - Storage INSERT sırasında oluşuyor

2. **GitHub Issue aç:**
   - https://github.com/supabase/supabase/issues
   - Arama yap: "record new has no field level"
   - Benzer sorunlar varsa takip et

3. **Bana daha fazla bilgi ver:**
   ```sql
   -- Bu SQL'leri çalıştır ve sonuçları paylaş:
   
   -- 1. Trigger'lar
   SELECT tgname, pg_get_triggerdef(oid) 
   FROM pg_trigger 
   WHERE tgrelid = 'storage.objects'::regclass;
   
   -- 2. Functions
   SELECT 
     p.proname,
     pg_get_functiondef(p.oid)
   FROM pg_proc p
   JOIN pg_namespace n ON p.pronamespace = n.oid
   WHERE n.nspname = 'storage'
     AND p.proname LIKE '%level%';
   
   -- 3. Table structure
   SELECT 
     column_name, 
     data_type 
   FROM information_schema.columns 
   WHERE table_schema = 'storage' 
     AND table_name = 'objects';
   ```

---

## ✨ Başarı Durumu

Upload başarılı olunca:

✅ Console'da başarı log'ları  
✅ Alert: "Sketch görseli başarıyla yüklendi!"  
✅ Supabase Storage'da dosya görünür  
✅ Database'de kayıt var  
✅ Ana sayfada showcase bölümünde görünür  

---

**🎯 İlk önce Dashboard'dan manuel kurulumu deneyin. Bu genellikle en güvenli ve kolay yöntemdir!**

