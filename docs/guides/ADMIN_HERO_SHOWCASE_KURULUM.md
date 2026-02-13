# 🎬 Admin Hero Video & Showcase Görselleri Kurulum Rehberi

## 📋 Durum
Admin paneldeki Hero videoları ve Showcase görselleri artık **Supabase'e tam entegre** edildi!

## ✅ Yapılan Değişiklikler

### 1. **App.tsx Güncellemeleri**
- ✅ `uploadHeroVideo` ve `uploadShowcaseImage` fonksiyonları eklendi
- ✅ Admin panelden yüklenen tüm dosyalar artık Supabase Storage'a kaydediliyor
- ✅ Sayfa yüklendiğinde Supabase'den hero videoları ve showcase görselleri çekiliyor
- ✅ localStorage + Supabase senkronizasyonu sağlandı

### 2. **Database Tabloları**
- ✅ `hero_videos` tablosu - Hero bölümündeki 4 video için
- ✅ `showcase_images` tablosu - Çizim, Ürün, Model, Video görselleri için
- ✅ RLS (Row Level Security) politikaları - Adminler yazabilir, herkes okuyabilir

### 3. **Storage Buckets**
- 🔄 `hero-videos` bucket - Hero videoları için (50MB limit)
- 🔄 `showcase-images` bucket - Showcase görselleri için (10MB limit)

## 🚀 Kurulum Adımları

### Adım 1: Database Tablolarını Oluştur
1. Supabase Dashboard'a git: https://supabase.com/dashboard
2. **SQL Editor** > **New Query**
3. `MIGRATION_ADMIN_SYSTEM.sql` dosyasının içeriğini kopyala ve çalıştır
4. ✅ Tabloların oluştuğunu kontrol et: **Table Editor**'de `hero_videos` ve `showcase_images` tablolarını görebilmelisin

### Adım 2: Storage Bucket'ları Oluştur
1. Supabase Dashboard'da **SQL Editor** > **New Query**
2. `STORAGE_BUCKETS_SETUP.sql` dosyasının içeriğini kopyala ve çalıştır
3. ✅ Bucket'ların oluştuğunu kontrol et: **Storage** sekmesinde `hero-videos` ve `showcase-images` bucket'larını görebilmelisin

### Adım 3: Admin Yetkisi Ver
1. **SQL Editor** > **New Query**
2. Kendi email adresinle aşağıdaki komutu çalıştır:
```sql
UPDATE profiles 
SET is_admin = true 
WHERE email = 'sizin@email.com';
```
3. ✅ Admin olduğunu kontrol et: Profil tablosunda `is_admin` sütunu `true` olmalı

### Adım 4: Test Et!
1. Uygulamaya giriş yap
2. Admin Panel'e git (Header'da ⚙️ Admin Panel butonu görünecek)
3. **İçerik Yönetimi** sekmesine tıkla
4. **Hero Video 1-4** ve **Showcase Görselleri**ni yükle
5. Ana sayfaya dön ve yüklediğin içeriklerin göründüğünü kontrol et

## 📸 Admin Panel'de Ne Yapabilirsin?

### Hero Gömülü Videolar (4 Adet)
Ana sayfanın Hero bölümünde arka planda sırayla dönen 4 video:
- **Hero Video 1** → İlk görünen video
- **Hero Video 2** → 8 saniye sonra
- **Hero Video 3** → 16 saniye sonra  
- **Hero Video 4** → 24 saniye sonra

### Showcase Görselleri (4 Adet)
Çizimden gerçeğe dönüşüm örnekleri:
1. **Çizim (Sketch)** → El çizimi veya dijital çizim
2. **Ürün (Product)** → Hayalet manken üzerinde ürün
3. **Model (Live)** → Canlı model üzerinde ürün
4. **Video** → Showcase video (opsiyonel)

## 🔧 Dosya Yapısı

```
.
├── App.tsx                          # ✅ Güncellendi - Supabase entegrasyonu
├── lib/
│   ├── adminService.ts              # ✅ Hazır - Upload/fetch fonksiyonları
│   └── supabase.ts                  # ✅ Mevcut - Supabase client
├── MIGRATION_ADMIN_SYSTEM.sql       # ✅ Mevcut - Database tabloları
├── STORAGE_BUCKETS_SETUP.sql        # ✅ YENİ - Storage bucket'ları
└── ADMIN_HERO_SHOWCASE_KURULUM.md   # ✅ YENİ - Bu dosya
```

## 🎯 Nasıl Çalışıyor?

### 1. **Admin Video/Görsel Yükler:**
```
Admin Panel > Dosya Seç > Yükle
    ↓
1. Dosya base64'e çevrilir (instant preview)
2. Supabase Storage'a upload edilir
3. Public URL alınır
4. Database'e kaydedilir (hero_videos veya showcase_images tablosuna)
5. LocalStorage'a kaydedilir (cache için)
```

### 2. **Ana Sayfa İçeriği Çeker:**
```
Sayfa Yüklenir
    ↓
1. Supabase'den hero_videos tablosu çekilir
2. Supabase'den showcase_images tablosu çekilir
3. URL'ler state'e kaydedilir
4. Hero ve Showcase bölümlerinde gösterilir
```

## ⚠️ Önemli Notlar

1. **Admin Yetkisi Gerekli:**
   - Hero video ve showcase görselleri sadece admin hesaplardan yüklenebilir
   - RLS politikaları bunu garanti eder

2. **Dosya Boyutu Limitleri:**
   - Hero videolar: Maksimum 50MB
   - Showcase görseller: Maksimum 10MB

3. **Desteklenen Formatlar:**
   - **Hero Videos:** mp4, webm, quicktime, avi
   - **Showcase Images:** jpg, png, webp, gif, mp4, webm

4. **Public Erişim:**
   - Tüm yüklenen içerikler public URL'lerle erişilebilir
   - Herkes görüntüleyebilir, sadece adminler değiştirebilir

## 🐛 Sorun Giderme

### "Permission denied for storage" Hatası
```sql
-- Storage bucket'ların public olduğundan emin ol:
UPDATE storage.buckets 
SET public = true 
WHERE id IN ('hero-videos', 'showcase-images');
```

### "RLS policy violation" Hatası
```sql
-- Admin yetkini kontrol et:
SELECT email, is_admin FROM profiles WHERE email = 'sizin@email.com';

-- Admin değilsen:
UPDATE profiles SET is_admin = true WHERE email = 'sizin@email.com';
```

### Video/Görsel Yüklenmiyor
1. Browser console'u aç (F12)
2. Hata mesajını kontrol et
3. Supabase Storage > Bucket > Files bölümünde dosyanın yüklenip yüklenmediğini kontrol et

### Ana Sayfada Görünmüyor
1. Admin Panel > İçerik Yönetimi'nde dosyaların göründüğünü kontrol et
2. Browser console'da Supabase fetch hatası var mı kontrol et
3. Sayfayı yenile (Ctrl+F5)

## 📞 İletişim

Sorularınız için:
- GitHub Issues
- Discord: [Sunucu Linki]
- Email: support@bestfashion.ai

---

**✨ Artık admin panelden profesyonel hero videoları ve showcase görselleri yükleyebilirsiniz!**

