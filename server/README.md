# 🔙 Backend API - Express.js

PayTR callback endpoint'i için backend API servisi.

---

## 🚀 Hızlı Başlangıç

### Local Development

```bash
# Dependencies'leri yükle
npm install

# .env dosyasını oluştur
cp .env.example .env
# .env dosyasını düzenle ve API key'leri ekle

# Development mode'da çalıştır
npm run dev

# Production mode'da çalıştır
npm start
```

Server `http://localhost:3001` adresinde çalışacak.

---

## 📋 Endpoints

### Health Check
```
GET /api/health
```

**Response:**
```json
{
  "status": "OK",
  "message": "Backend is running"
}
```

### PayTR Callback
```
POST /api/paytr-callback
```

PayTR'den gelen ödeme bildirimleri için webhook endpoint.

**Request Body:**
```javascript
{
  merchant_oid: string,    // Order ID
  status: string,           // "success" veya "failed"
  total_amount: string,     // Toplam tutar (kuruş)
  hash: string,             // PayTR hash (güvenlik)
  failed_reason_code: string,
  failed_reason_msg: string,
  test_mode: string         // "0" veya "1"
}
```

**Response:**
```
OK (200) - İşlem başarılı
HASH_ERROR (400) - Hash doğrulama hatası
TRANSACTION_NOT_FOUND (404) - İşlem bulunamadı
UPDATE_ERROR (500) - Güncelleme hatası
PROFILE_ERROR (500) - Profil hatası
CREDIT_ERROR (500) - Kredi ekleme hatası
SERVER_ERROR (500) - Sunucu hatası
```

---

## 🔧 Environment Variables

`.env` dosyasında şu değişkenler olmalı:

```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key

# PayTR
PAYTR_MERCHANT_ID=your-merchant-id
PAYTR_MERCHANT_KEY=your-merchant-key
PAYTR_MERCHANT_SALT=your-merchant-salt
VITE_PAYTR_MERCHANT_ID=your-merchant-id
VITE_PAYTR_MERCHANT_KEY=your-merchant-key
VITE_PAYTR_MERCHANT_SALT=your-merchant-salt

# Server
PORT=3001
NODE_ENV=production

# CORS (Frontend URL)
FRONTEND_URL=https://your-frontend-url.com
```

---

## 🔐 Güvenlik

### Hash Doğrulama
Her PayTR callback isteği, PayTR tarafından sağlanan hash ile doğrulanır:

```javascript
const hashStr = merchant_oid + PAYTR_MERCHANT_SALT + status + total_amount;
const calculatedHash = crypto
  .createHmac('sha256', PAYTR_MERCHANT_KEY)
  .update(hashStr)
  .digest('base64');
```

Hash eşleşmezse istek reddedilir.

### CORS
Sadece güvenilir origin'lerden gelen isteklere izin verilir:

```javascript
const allowedOrigins = [
  'http://localhost:5173',
  process.env.FRONTEND_URL,
  // Production URL'leri
];
```

### Supabase Service Key
`SUPABASE_SERVICE_KEY` ile RLS (Row Level Security) bypass edilerek işlemler yapılır. Bu key **sadece backend'de** kullanılmalı, asla frontend'e gönderilmemelidir.

---

## 📊 İşlem Akışı

1. Kullanıcı frontend'de ödeme başlatır
2. Frontend PayTR'ye token isteği gönderir
3. PayTR iframe açılır ve kullanıcı ödeme yapar
4. PayTR, backend'deki `/api/paytr-callback` endpoint'ine bildirim gönderir
5. Backend:
   - Hash doğrulama yapar
   - Transaction'ı bulur (merchant_oid ile)
   - Ödeme durumuna göre işlem yapar:
     - **Başarılı**: Transaction status'u `completed` olur, kullanıcıya kredi eklenir
     - **Başarısız**: Transaction status'u `failed` olur
6. PayTR'ye `OK` response döner

---

## 🧪 Test

### Local Test

```bash
# Health check
curl http://localhost:3001/api/health

# Beklenen response:
# {"status":"OK","message":"Backend is running"}
```

### PayTR Callback Test

PayTR test kartları ile ödeme yap ve backend logs'unu izle:

```bash
npm run dev

# Logs'ta şunları göreceksin:
📥 PayTR Callback alındı
✅ Hash doğrulandı
📦 Transaction bulundu: xxx
✅ Ödeme başarılı: xxx
💰 10 kredi eklendi (Toplam: 10)
```

---

## 🐛 Troubleshooting

### "HASH_ERROR" Hatası
- `PAYTR_MERCHANT_KEY` ve `PAYTR_MERCHANT_SALT` doğru mu kontrol et
- PayTR dashboard'da merchant bilgilerini kontrol et

### "TRANSACTION_NOT_FOUND" Hatası
- Transaction'ın `stripe_payment_id` field'ında `merchant_oid` kaydedilmiş mi?
- Supabase'de transaction kaydı var mı?

### "PROFILE_ERROR" Hatası
- Kullanıcının profile kaydı var mı?
- `SUPABASE_SERVICE_KEY` doğru mu?
- Supabase RLS policies doğru yapılandırılmış mı?

### CORS Hatası
- `FRONTEND_URL` environment variable set edildi mi?
- Frontend URL'i `allowedOrigins` array'ine eklendi mi?

---

## 🚀 Deployment (Coolify)

### Coolify Ayarları
```yaml
Name: cizimdengiyime-backend
Type: NodeJS
Repository: GitHub repo
Branch: main
Root Directory: /server  # ⚠️ ÖNEMLİ!
Build Command: npm install
Start Command: npm start
Port: 3001
Health Check: /api/health
```

### Environment Variables (Coolify)
Tüm environment variables'ı Coolify dashboard'dan ekle. `.env` dosyası deploy edilmez!

### Deployment Sonrası
1. Backend URL'i al: `https://cizimdengiyime-backend-xxx.coolify.app`
2. PayTR'de callback URL'i güncelle: `https://[backend-url]/api/paytr-callback`
3. Frontend'de `VITE_BACKEND_API_URL` env variable'ını güncelle
4. Backend'de `FRONTEND_URL` env variable'ını güncelle

**Detaylı bilgi:** Root klasördeki `COOLIFY_DEPLOYMENT_GUIDE.md` dosyasına bak.

---

## 📝 Notlar

- ⚠️ Production'da `test_mode: 0` kullan
- ⚠️ `SUPABASE_SERVICE_KEY` asla frontend'e gönderme
- ⚠️ CORS ayarlarını production URL'lerine göre kısıtla
- ⚠️ PayTR callback URL'ini güncellemeyi unutma

---

## 📞 Destek

Sorun yaşarsan:
1. Logs'u kontrol et: `npm run dev` (local) veya Coolify logs (production)
2. Environment variables'ı kontrol et
3. PayTR dashboard'da callback URL'i kontrol et
4. Supabase logs'u kontrol et

---

**İyi kodlamalar! 🎉**
