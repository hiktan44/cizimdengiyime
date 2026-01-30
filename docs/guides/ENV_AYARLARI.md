# 🔐 Environment Variables Ayarları

## 📝 .env.local Dosyası Oluştur

Proje kök dizininde `.env.local` dosyası oluşturun ve aşağıdaki değişkenleri ekleyin:

```env
# ==========================================
# SUPABASE CONFIGURATION
# ==========================================
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# ==========================================
# GEMINI AI API KEY
# ==========================================
VITE_GEMINI_API_KEY=your-gemini-api-key-here

# ==========================================
# PAYTR CONFIGURATION
# ==========================================
VITE_PAYTR_MERCHANT_ID=123456
VITE_PAYTR_MERCHANT_KEY=your-merchant-key
VITE_PAYTR_MERCHANT_SALT=your-merchant-salt

# PayTR Test Mode
# '1' = Test Mode (gerçek ödeme alınmaz, test kartları çalışır)
# '0' = Live Mode (gerçek ödeme alınır, gerçek kartlar çalışır)
VITE_PAYTR_TEST_MODE=1

# ==========================================
# REDIRECT URL (Google OAuth için)
# ==========================================
# Local development
VITE_REDIRECT_URL=http://localhost:3006

# Production (domain'inizi yazın)
# VITE_REDIRECT_URL=https://cizimdengiyime.com

# ==========================================
# BACKEND (Vercel Functions için)
# ==========================================
SUPABASE_SERVICE_KEY=your-service-role-key-here
PAYTR_MERCHANT_ID=123456
PAYTR_MERCHANT_KEY=your-merchant-key
PAYTR_MERCHANT_SALT=your-merchant-salt
```

---

## 🔧 Değişkenlerin Açıklaması

### 1. Supabase

**VITE_SUPABASE_URL:**
- Supabase Dashboard → Settings → API → Project URL
- Örnek: `https://abcdefgh.supabase.co`

**VITE_SUPABASE_ANON_KEY:**
- Supabase Dashboard → Settings → API → Project API keys → `anon` `public`
- Bu key frontend'de kullanılır (güvenli)

**SUPABASE_SERVICE_KEY:**
- Supabase Dashboard → Settings → API → Project API keys → `service_role` `secret`
- ⚠️ Bu key sadece backend'de kullanılır (RLS bypass)
- ⚠️ Asla frontend'e eklemeyin!

### 2. Gemini AI

**VITE_GEMINI_API_KEY:**
- Google AI Studio → https://makersuite.google.com/app/apikey
- "Create API Key" butonuna tıklayın
- Oluşturulan key'i kopyalayın

### 3. PayTR

**VITE_PAYTR_MERCHANT_ID:**
- PayTR Merchant Panel → Entegrasyon → API Bilgileri
- Merchant ID (6 haneli numara)

**VITE_PAYTR_MERCHANT_KEY:**
- PayTR Merchant Panel → Entegrasyon → API Bilgileri
- Merchant Key (uzun string)

**VITE_PAYTR_MERCHANT_SALT:**
- PayTR Merchant Panel → Entegrasyon → API Bilgileri
- Merchant Salt (uzun string)

**VITE_PAYTR_TEST_MODE:**
- `1` = Test Mode
  - Gerçek ödeme alınmaz
  - Test kartları çalışır
  - PayTR'de "BU İŞLEMİ TEST MODUNDA YAPIYORSUNUZ" uyarısı görünür
- `0` = Live Mode (Production)
  - Gerçek ödeme alınır
  - Gerçek kartlar çalışır
  - Müşteriden gerçekten para çekilir

### 4. Redirect URL

**VITE_REDIRECT_URL:**
- Google OAuth sonrası kullanıcının yönlendirileceği URL
- Local: `http://localhost:3006`
- Production: `https://yourdomain.com`

**⚠️ Önemli:** Bu URL'i Supabase'de de ayarlamalısınız:
1. Supabase Dashboard → Authentication → URL Configuration
2. Site URL: `https://yourdomain.com`
3. Redirect URLs: `https://yourdomain.com/**`

---

## 🚀 Production Ayarları

### Vercel Environment Variables

Vercel Dashboard → Your Project → Settings → Environment Variables:

```
VITE_SUPABASE_URL = https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY = your-anon-key
VITE_GEMINI_API_KEY = your-gemini-key
VITE_PAYTR_MERCHANT_ID = 123456
VITE_PAYTR_MERCHANT_KEY = your-key
VITE_PAYTR_MERCHANT_SALT = your-salt
VITE_PAYTR_TEST_MODE = 0  ⬅️ Live mode için
VITE_REDIRECT_URL = https://yourdomain.com
SUPABASE_SERVICE_KEY = your-service-key
PAYTR_MERCHANT_ID = 123456
PAYTR_MERCHANT_KEY = your-key
PAYTR_MERCHANT_SALT = your-salt
```

### Supabase Redirect URLs

Supabase Dashboard → Authentication → URL Configuration:

**Site URL:**
```
https://yourdomain.com
```

**Redirect URLs (her satır ayrı):**
```
http://localhost:3006/**
https://yourdomain.com/**
https://*.vercel.app/**
```

### Google OAuth Redirect URIs

Google Cloud Console → APIs & Services → Credentials → OAuth 2.0 Client IDs:

**Authorized redirect URIs:**
```
https://your-project.supabase.co/auth/v1/callback
```

---

## 🧪 Test vs Live Mode Karşılaştırma

### Test Mode (`VITE_PAYTR_TEST_MODE=1`)

✅ **Avantajlar:**
- Gerçek para çekilmez
- Test kartları ile denemeler yapabilirsiniz
- Hata yapma riski yok

❌ **Dezavantajlar:**
- PayTR'de "TEST MODU" uyarısı görünür
- Gerçek kartlar çalışmaz

**Test Kartları:**
```
Başarılı: 4355 0843 5508 4358 | 12/26 | 000
Başarısız: 4355 0843 5508 4333 | 12/26 | 000
```

### Live Mode (`VITE_PAYTR_TEST_MODE=0`)

✅ **Avantajlar:**
- Gerçek ödemeler alınır
- Profesyonel görünüm
- Test uyarısı yok

❌ **Dezavantajlar:**
- Gerçek para çekilir
- Hatalı işlemler sorun yaratabilir
- Dikkatli olunmalı

---

## 🔄 Test'ten Live'a Geçiş

### 1. .env.local'i Güncelle

```env
# Test Mode'u kapat
VITE_PAYTR_TEST_MODE=0

# Production domain'i ekle
VITE_REDIRECT_URL=https://yourdomain.com
```

### 2. Vercel Environment Variables'ı Güncelle

```
VITE_PAYTR_TEST_MODE = 0
VITE_REDIRECT_URL = https://yourdomain.com
```

### 3. PayTR Panel'de Kontrol Et

- Merchant hesabınız aktif mi?
- Banka bilgileri doğru mu?
- Komisyon oranları onaylandı mı?

### 4. Test Et

1. Küçük bir tutar ile test yapın (örn: 1₺)
2. Gerçek kartınızla ödeme yapın
3. Kredilerin eklendiğini kontrol edin
4. Para çekildiğini banka hesabınızdan kontrol edin

### 5. Canlıya Al

- Her şey çalışıyorsa production'a deploy edin
- Kullanıcılara duyurun

---

## 🐛 Sorun Giderme

### Sorun 1: "BU İŞLEMİ TEST MODUNDA YAPIYORSUNUZ" yazıyor

**Çözüm:**
```env
VITE_PAYTR_TEST_MODE=0
```

### Sorun 2: Google OAuth localhost'a yönlendiriyor

**Çözüm:**
```env
VITE_REDIRECT_URL=https://yourdomain.com
```

Ve Supabase'de:
- Authentication → URL Configuration → Redirect URLs
- `https://yourdomain.com/**` ekle

### Sorun 3: API 404 hatası (Nginx)

**Çözüm:**
- `nginx.conf` dosyasını sunucunuza yükleyin
- `/etc/nginx/sites-available/cizimdengiyime` olarak kaydedin
- Symbolic link oluşturun:
```bash
sudo ln -s /etc/nginx/sites-available/cizimdengiyime /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Sorun 4: Environment variables çalışmıyor

**Çözüm:**
- `.env.local` dosyası proje kök dizininde mi?
- Değişkenler `VITE_` ile mi başlıyor? (Vite için gerekli)
- Sunucuyu yeniden başlattınız mı? (`npm run dev`)

---

## ✅ Kontrol Listesi

Canlıya almadan önce:

- [ ] `.env.local` dosyası oluşturuldu
- [ ] Tüm API key'ler eklendi
- [ ] `VITE_PAYTR_TEST_MODE=0` yapıldı (live için)
- [ ] `VITE_REDIRECT_URL` production domain'e ayarlandı
- [ ] Vercel environment variables eklendi
- [ ] Supabase redirect URLs güncellendi
- [ ] Google OAuth redirect URIs eklendi
- [ ] PayTR panel'de callback URL ayarlandı
- [ ] Nginx yapılandırması yapıldı
- [ ] Test ödemesi yapıldı ve başarılı oldu
- [ ] Krediler doğru eklendi
- [ ] Transaction kayıtları oluştu

---

## 📞 Destek

Sorun yaşarsanız:
1. Console log'ları kontrol edin (F12)
2. Supabase logs kontrol edin
3. Vercel logs kontrol edin
4. Environment variables'ları kontrol edin

🎉 **Başarılar!**

