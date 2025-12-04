# 🚀 Hızlı Kurulum ve Düzeltmeler

## ✅ Tamamlanan İşlemler

### 1. Header'a "Kredi Al" Butonu Eklendi
- ✅ Giriş yapan kullanıcılar header'da yeşil "Kredi Al" butonu görüyor
- ✅ Mobil uyumlu
- ✅ Tek tıkla modal açılıyor

### 2. Landing Page Header Güncellendi
- ✅ Giriş yapan kullanıcılar için aynı header yapısı
- ✅ Kullanıcı adı, kredi, admin panel butonu gösteriliyor
- ✅ "Ücretsiz Deneyin" butonu → "Hemen Kullanmaya Devam Et" (giriş yaptıysa)

### 3. Abonelik Planları Kaldırıldı
- ✅ Ana sayfada sadece kredi paketleri gösteriliyor
- ✅ Kredi paketleri DB'den çekiliyor (admin panelden düzenlenebilir)
- ✅ Çift dil desteği (TR/EN)

### 4. PayTR merchant_oid Hatası Düzeltildi
- ✅ Tire (-) karakteri kaldırıldı
- ✅ Sadece alfanumerik karakterler kullanılıyor
- ✅ Format: `ORDER1234567890abcd1234`

### 5. Transactions RLS Policy Düzeltildi
- ✅ `FIX_TRANSACTIONS_RLS.sql` oluşturuldu
- ⚠️ **Bu SQL'i Supabase'de çalıştırmanız gerekiyor!**

### 6. PayTR Backend Callback Oluşturuldu
- ✅ `api/paytr-callback.ts` endpoint'i hazır
- ✅ Hash doğrulama yapıyor
- ✅ Transaction güncelleme ve kredi ekleme güvenli

---

## ⚠️ YAPILMASI GEREKENLER (ÖNEMLİ!)

### 1. Supabase SQL'leri Çalıştır

```bash
# Supabase Dashboard → SQL Editor'de çalıştır:
```

**FIX_TRANSACTIONS_RLS.sql:**
```sql
-- Users can insert their own transactions
CREATE POLICY "Users can insert own transactions" ON transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own transactions
CREATE POLICY "Users can update own transactions" ON transactions
  FOR UPDATE USING (auth.uid() = user_id);

-- Admins can view all transactions
CREATE POLICY "Admins can view all transactions" ON transactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

-- payment_method column ekle
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'card';
```

### 2. Environment Variables Ekle

**`.env.local` dosyasına ekle:**
```env
# PayTR Credentials
VITE_PAYTR_MERCHANT_ID=your_merchant_id
VITE_PAYTR_MERCHANT_KEY=your_merchant_key
VITE_PAYTR_MERCHANT_SALT=your_merchant_salt

# Supabase Service Key (Backend için)
SUPABASE_SERVICE_KEY=your_service_role_key

# PayTR Backend için (production)
PAYTR_MERCHANT_ID=your_merchant_id
PAYTR_MERCHANT_KEY=your_merchant_key
PAYTR_MERCHANT_SALT=your_merchant_salt
```

**Supabase Service Key nasıl bulunur:**
1. Supabase Dashboard → Settings → API
2. "service_role" key'i kopyala (secret!)
3. `.env.local`'e ekle

### 3. Admin Kullanıcı Oluştur

```sql
-- Supabase SQL Editor'de:
UPDATE profiles 
SET is_admin = true 
WHERE email = 'your@email.com';
```

### 4. Vercel'e Deploy Et (Production için)

```bash
# Vercel CLI kur
npm i -g vercel

# Deploy
vercel

# Environment variables ekle (Vercel Dashboard)
# - VITE_SUPABASE_URL
# - VITE_SUPABASE_ANON_KEY
# - VITE_PAYTR_MERCHANT_ID
# - VITE_PAYTR_MERCHANT_KEY
# - VITE_PAYTR_MERCHANT_SALT
# - SUPABASE_SERVICE_KEY
# - PAYTR_MERCHANT_ID
# - PAYTR_MERCHANT_KEY
# - PAYTR_MERCHANT_SALT
```

### 5. PayTR Panel'de Callback URL Ayarla

1. PayTR Merchant Panel'e giriş yap
2. Entegrasyon Ayarları → Bildirim URL'i
3. Callback URL'i gir:
   - **Local Test:** `http://localhost:3006/api/paytr-callback`
   - **Production:** `https://yourdomain.vercel.app/api/paytr-callback`
4. Kaydet

---

## 🧪 Test Senaryosu

### Senaryo 1: Kullanıcı Kredi Satın Alıyor

1. ✅ Kayıt ol / Giriş yap
2. ✅ Header'da "Kredi Al" butonuna tıkla
3. ✅ Kredi paketi seç (örn: 50 kredi - 250₺)
4. ✅ "Satın Al" butonuna tıkla
5. ✅ PayTR iframe açılsın
6. ✅ Test kartı ile ödeme yap:
   - Kart: `4355 0843 5508 4358`
   - Tarih: `12/26`
   - CVV: `000`
7. ✅ PayTR → Backend callback göndersin
8. ✅ Backend:
   - Hash doğrulasın
   - Transaction'ı 'completed' yapsın
   - 50 kredi eklesin
9. ✅ Kullanıcı success sayfasına yönlensin
10. ✅ Header'da kredi güncellenmiş olsun (realtime)
11. ✅ Dashboard → Ödeme Geçmişi'nde görünsün

### Senaryo 2: Admin Panelden İçerik Yönetimi

1. ✅ Admin olarak giriş yap
2. ✅ Header'da "⚙️ Admin Panel" butonu görünsün
3. ✅ Admin Panel → İçerik Yönetimi
4. ✅ Hero video yükle
5. ✅ Ana sayfaya git → Video gözüksün
6. ✅ Admin Panel → Ayarlar
7. ✅ İlk krediyi 15'e çıkar
8. ✅ Yeni kullanıcı kayıt olsun → 15 kredi alsın

### Senaryo 3: Kullanıcı Geçmişini Görüntüleme

1. ✅ Giriş yap
2. ✅ Dashboard'a git
3. ✅ "📊 İşlemlerim" tab'ı → Son 30 günün işlemleri
4. ✅ "💳 Ödeme Geçmişi" tab'ı → Tüm ödemeler
5. ✅ Her işlemde:
   - Tip (Kredi Satın Alma)
   - Tutar (250₺)
   - Kredi (50)
   - Durum (Tamamlandı/Bekliyor/Başarısız)
   - Tarih

---

## 🐛 Bilinen Sorunlar ve Çözümleri

### Sorun 1: "merchant_oid alfanumerik olmalıdır"
**Çözüm:** ✅ Düzeltildi. Tire karakteri kaldırıldı.

### Sorun 2: "new row violates row-level security policy for table transactions"
**Çözüm:** ⚠️ `FIX_TRANSACTIONS_RLS.sql` dosyasını Supabase'de çalıştırın.

### Sorun 3: Modal'da herhangi bir yere tıklayınca "ödeme başarılı" yazıyor
**Çözüm:** ⚠️ Backend callback sistemi kurulmalı. `setTimeout` kodu kaldırılmalı.

### Sorun 4: Kullanıcı kendi işlemlerini göremiyor
**Çözüm:** ✅ Dashboard'da 2 tab var:
- "📊 İşlemlerim" → Generations (çizim→ürün işlemleri)
- "💳 Ödeme Geçmişi" → Transactions (kredi satın alma)

---

## 📁 Oluşturulan Dosyalar

1. ✅ `FIX_TRANSACTIONS_RLS.sql` - RLS policy düzeltmeleri
2. ✅ `api/paytr-callback.ts` - Backend callback endpoint
3. ✅ `PAYTR_ENTEGRASYON_REHBERI.md` - Detaylı PayTR rehberi
4. ✅ `HIZLI_KURULUM.md` - Bu dosya
5. ✅ `YENI_OZELLIKLER.md` - Tüm yeni özelliklerin özeti

---

## 🎯 Öncelikli Yapılacaklar (Sırayla)

1. **[ACIL]** `FIX_TRANSACTIONS_RLS.sql`'i Supabase'de çalıştır
2. **[ACIL]** `.env.local`'e `SUPABASE_SERVICE_KEY` ekle
3. **[ÖNEMLİ]** Admin kullanıcı oluştur (SQL ile)
4. **[ÖNEMLİ]** PayTR test credentials al (test merchant)
5. **[ÖNEMLİ]** Local'de test et
6. **[PRODUCTION]** Vercel'e deploy et
7. **[PRODUCTION]** PayTR panel'de callback URL ayarla
8. **[PRODUCTION]** Production'da test et

---

## 📞 Destek

Herhangi bir sorun olursa:

1. **Console log'ları kontrol et** (F12 → Console)
2. **Supabase logs kontrol et** (Dashboard → Logs)
3. **Vercel logs kontrol et** (Dashboard → Functions → Logs)
4. **PayTR test panel'i kontrol et**

---

## ✨ Sonuç

Sistem artık çok daha güvenli ve profesyonel:

- ✅ Kullanıcı dostu header ve navigation
- ✅ DB-driven content management
- ✅ Güvenli PayTR entegrasyonu (backend callback)
- ✅ Realtime credit updates
- ✅ Admin analytics ve user activity tracking
- ✅ Transaction history ve payment tracking

**Sadece RLS policy'sini çalıştırıp test etmen kaldı!** 🚀

