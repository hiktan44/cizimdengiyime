# 🧪 Admin Panel Upload Test Rehberi

## ✅ Yapılan Güncellemeler (Son)

### 1. **adminService.ts - Akıllı Upload Mekanizması**
- ✅ Her upload öncesi aynı type/order_index kontrolü
- ✅ Eski dosya varsa önce silinir (storage + database)
- ✅ Yeni dosya yüklenir
- ✅ Database'e kayıt eklenir
- ✅ **Sonuç:** Her type için sadece 1 aktif kayıt

### 2. **App.tsx - Upload Feedback**
- ✅ Her upload sonrası başarı/hata mesajı
- ✅ Console log'ları ile debug desteği
- ✅ LocalStorage + Supabase senkronizasyonu

### 3. **LandingPage.tsx - Auto Refresh**
- ✅ Sayfa yüklendiğinde database'den çekme
- ✅ Her 30 saniyede otomatik refresh
- ✅ Console log'ları ile debug desteği

## 🧪 Test Adımları

### ÖN HAZIRLIK

#### 1. Supabase Bucket'ları Oluştur
```bash
# Supabase Dashboard > SQL Editor > New Query
# STORAGE_BUCKETS_SETUP.sql dosyasını çalıştır
```

**Kontrol:**
- Supabase Dashboard > Storage
- `hero-videos` bucket var mı? ✅
- `showcase-images` bucket var mı? ✅

#### 2. Database Tablolarını Kontrol Et
```sql
-- Supabase SQL Editor'de çalıştır:
SELECT * FROM hero_videos;
SELECT * FROM showcase_images;
```

**Beklenen:** Tablolar var ama boş olabilir

#### 3. Admin Yetkisi Ver
```sql
-- Kendi email'inle değiştir:
UPDATE profiles 
SET is_admin = true 
WHERE email = 'sizin@email.com';

-- Kontrol et:
SELECT email, is_admin FROM profiles WHERE email = 'sizin@email.com';
```

**Beklenen:** `is_admin` sütunu `true` olmalı

---

### TEST 1: Hero Video Upload

#### Adımlar:
1. ✅ Uygulamaya admin hesapla giriş yap
2. ✅ Header'da "⚙️ Admin Panel" butonuna tıkla
3. ✅ "İçerik Yönetimi" sekmesinde ol
4. ✅ "Hero Video 1" kartında "Değiştir" butonuna tıkla
5. ✅ Bir video dosyası seç (mp4, webm vb.)
6. ✅ Upload başlasın

#### Beklenilen Sonuç:
```
✅ Görsel önizleme hemen görünsün (base64)
✅ "Hero Video 1 başarıyla yüklendi!" mesajı
✅ Console: "✅ Hero video 1 Supabase'e yüklendi: [URL]"
```

#### Supabase'de Kontrol:
1. **Storage** > `hero-videos` > Video dosyası var mı?
2. **Table Editor** > `hero_videos` > 1 kayıt var mı?
   ```sql
   SELECT * FROM hero_videos WHERE order_index = 0;
   ```
   - `video_url` sütunu dolu mu?
   - `is_active` = true mu?
   - `order_index` = 0 mu?

#### Ana Sayfada Kontrol:
1. Ana sayfaya git (Home)
2. Hero bölümünde video oynatılıyor mu?
3. Console'da:
   ```
   ✅ Hero videolar yüklendi: 1 video
   ```

---

### TEST 2: Showcase Görsel Upload

#### Adımlar:
1. ✅ Admin Panel > İçerik Yönetimi
2. ✅ "1. Çizim (Sketch)" kartında "Değiştir"
3. ✅ Bir görsel dosyası seç (jpg, png vb.)
4. ✅ Upload başlasın

#### Beklenilen Sonuç:
```
✅ Görsel önizleme hemen görünsün
✅ "Çizim görseli başarıyla yüklendi!" mesajı
✅ Console: "✅ sketch görseli Supabase'e yüklendi: [URL]"
```

#### Supabase'de Kontrol:
1. **Storage** > `showcase-images` > Görsel dosyası var mı?
2. **Table Editor** > `showcase_images`:
   ```sql
   SELECT * FROM showcase_images WHERE type = 'sketch';
   ```
   - `image_url` sütunu dolu mu?
   - `type` = 'sketch' mi?
   - `is_active` = true mu?

#### Ana Sayfada Kontrol:
1. Ana sayfaya git
2. "Çizimden Gerçeğe Dönüşüm" bölümüne scroll et
3. "1. Çizim → Ürün" kartında yüklediğin görsel var mı?
4. Console'da:
   ```
   ✅ Showcase görseller yüklendi: 1 görsel
   ```

---

### TEST 3: Aynı Dosyayı Tekrar Yükle (Update Test)

#### Adımlar:
1. ✅ Admin Panel'de aynı karta tekrar dosya yükle
2. ✅ Farklı bir görsel/video seç

#### Beklenilen Sonuç:
```
✅ Eski dosya silinmeli (storage + database)
✅ Yeni dosya yüklenmeli
✅ Database'de sadece 1 kayıt olmalı
```

#### Supabase'de Kontrol:
```sql
-- Aynı order_index için sadece 1 kayıt olmalı:
SELECT COUNT(*) FROM hero_videos WHERE order_index = 0;
-- Sonuç: 1

-- Aynı type için sadece 1 kayıt olmalı:
SELECT COUNT(*) FROM showcase_images WHERE type = 'sketch';
-- Sonuç: 1
```

---

### TEST 4: Tüm 4 Hero Videoyu Yükle

#### Adımlar:
1. ✅ Hero Video 1-4 için 4 farklı video yükle

#### Beklenilen Sonuç:
```sql
SELECT * FROM hero_videos ORDER BY order_index;
```
| id | order_index | video_url | is_active |
|----|-------------|-----------|-----------|
| ... | 0 | https://... | true |
| ... | 1 | https://... | true |
| ... | 2 | https://... | true |
| ... | 3 | https://... | true |

#### Ana Sayfada:
- Hero bölümünde videolar sırayla dönmeli (8 saniyelik geçişlerle)

---

### TEST 5: Tüm Showcase Görselleri Yükle

#### Adımlar:
1. ✅ Sketch, Product, Model, Video görselleri yükle

#### Beklenilen Sonuç:
```sql
SELECT type, COUNT(*) FROM showcase_images GROUP BY type;
```
| type | count |
|------|-------|
| sketch | 1 |
| product | 1 |
| model | 1 |
| video | 1 |

#### Ana Sayfada:
- "Çizimden Gerçeğe Dönüşüm" bölümünde 3 kart dolu olmalı
- Before/After slider'lar çalışmalı

---

## 🐛 Hata Durumları

### HATA 1: "Permission denied for storage"
**Çözüm:**
```sql
-- Storage bucket'ların public olduğundan emin ol:
UPDATE storage.buckets 
SET public = true 
WHERE id IN ('hero-videos', 'showcase-images');

-- RLS politikalarını kontrol et:
SELECT * FROM pg_policies WHERE tablename = 'objects';
```

### HATA 2: "Admin yetkisi yok"
**Çözüm:**
```sql
-- Profile'ını kontrol et:
SELECT email, is_admin FROM profiles WHERE id = auth.uid();

-- Admin yap:
UPDATE profiles SET is_admin = true WHERE email = 'sizin@email.com';
```

### HATA 3: "Bucket bulunamadı"
**Çözüm:**
```sql
-- Bucket'ları oluştur:
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('hero-videos', 'hero-videos', true),
  ('showcase-images', 'showcase-images', true)
ON CONFLICT DO NOTHING;
```

### HATA 4: "Ana sayfada görünmüyor"
**Kontrol:**
1. Console'da hata var mı? (F12)
2. Supabase'de kayıtlar var mı?
   ```sql
   SELECT * FROM hero_videos;
   SELECT * FROM showcase_images;
   ```
3. RLS politikaları doğru mu?
   ```sql
   -- Herkes okuyabilmeli:
   SELECT * FROM hero_videos; -- Bu çalışmalı
   SELECT * FROM showcase_images; -- Bu çalışmalı
   ```

---

## 📊 Debug Console Komutları

### Browser Console'da (F12):
```javascript
// Supabase bağlantısını test et:
const { data, error } = await supabase
  .from('hero_videos')
  .select('*');
console.log('Hero Videos:', data, error);

// Storage'ı test et:
const { data: files } = await supabase
  .storage
  .from('hero-videos')
  .list();
console.log('Storage Files:', files);
```

### Supabase SQL Editor'de:
```sql
-- Tüm hero videoları görüntüle:
SELECT 
  id, 
  order_index, 
  video_url, 
  is_active, 
  created_at 
FROM hero_videos 
ORDER BY order_index;

-- Tüm showcase görselleri görüntüle:
SELECT 
  id, 
  type, 
  image_url, 
  is_active, 
  created_at 
FROM showcase_images 
ORDER BY type;

-- Storage dosyalarını listele:
SELECT 
  name, 
  bucket_id, 
  created_at 
FROM storage.objects 
WHERE bucket_id IN ('hero-videos', 'showcase-images')
ORDER BY created_at DESC;
```

---

## ✅ Başarı Kriterleri

Tüm testler başarılı olmalı:

- [ ] Admin panel'den 4 hero video yükleyebildim
- [ ] Admin panel'den 4 showcase görseli yükleyebildim
- [ ] Supabase Storage'da dosyalar görünüyor
- [ ] Supabase Database'de kayıtlar var
- [ ] Ana sayfada hero videoları görünüyor
- [ ] Ana sayfada showcase görselleri görünüyor
- [ ] Aynı dosyayı tekrar yükleyince güncelleniyor
- [ ] Console'da hata yok

---

## 🎉 Tamamlandı!

Tüm testler başarılıysa, admin panel hero video ve showcase görselleri tam entegre edilmiştir! 🚀

**İletişim:**
- Sorun olursa: GitHub Issues
- Debug için: Console log'ları (F12)

