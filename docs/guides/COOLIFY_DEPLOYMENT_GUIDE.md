# 🚀 COOLIFY DEPLOYMENT REHBERİ

Bu proje için Coolify üzerinde deployment yapılacak. Frontend (Vite/React) ve Backend (Express.js) iki ayrı servis olarak deploy edilecek.

---

## 📋 İÇİNDEKİLER

1. [Ön Hazırlık](#ön-hazırlık)
2. [Backend Deployment](#backend-deployment-expressjs)
3. [Frontend Deployment](#frontend-deployment-vitereact)
4. [Environment Variables](#environment-variables)
5. [SSL ve Domain Ayarları](#ssl-ve-domain-ayarları)
6. [Troubleshooting](#troubleshooting)

---

## 🔧 ÖN HAZIRLIK

### 1. Coolify'da Yeni Proje Oluştur

1. Coolify Dashboard'a giriş yap
2. **New Project** butonuna tıkla
3. Proje adı: `cizimdengiyime`
4. Projeyi kaydet

### 2. GitHub Repository Bağlantısı

- Coolify, GitHub repository'nizden otomatik deployment yapacak
- Repository'nizin `main` branch'ini kullanacağız

---

## 🔙 BACKEND DEPLOYMENT (Express.js)

### Adım 1: Yeni Servis Ekle

1. Coolify Dashboard'da → **Add Resource** → **New Application**
2. Ayarlar:
   - **Name**: `cizimdengiyime-backend`
   - **Type**: `NodeJS`
   - **Repository**: GitHub repo'nuzu seç
   - **Branch**: `main`
   - **Root Directory**: `/server` ⚠️ ÖNEMLİ!

### Adım 2: Build & Deploy Ayarları

#### Build Pack Settings
```yaml
Type: NodeJS
Node Version: 18.x veya 20.x
Package Manager: npm
```

#### Build Command
```bash
npm install
```

#### Start Command
```bash
npm start
```

#### Port Settings
```
Port: 3001
```

### Adım 3: Environment Variables (Backend)

Coolify Dashboard'da → **Environment Variables** sekmesine git:

```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# PayTR (Backend'de kullanılan)
PAYTR_MERCHANT_KEY=your_merchant_key
PAYTR_MERCHANT_SALT=your_merchant_salt
VITE_PAYTR_MERCHANT_KEY=your_merchant_key
VITE_PAYTR_MERCHANT_SALT=your_merchant_salt
VITE_PAYTR_MERCHANT_ID=your_merchant_id

# Port (Coolify otomatik set eder ama ekleyebilirsiniz)
PORT=3001
```

### Adım 4: Healthcheck Ayarları

```yaml
Health Check Path: /api/health
Health Check Method: GET
Expected Status Code: 200
```

### Adım 5: Deploy

- **Deploy** butonuna tıkla
- Build loglarını izle
- Deployment tamamlandığında backend URL'i göreceksin:
  - Örnek: `https://cizimdengiyime-backend-xxx.coolify.app`

---

## 🎨 FRONTEND DEPLOYMENT (Vite/React)

### Adım 1: Yeni Servis Ekle

1. **Add Resource** → **New Application**
2. Ayarlar:
   - **Name**: `cizimdengiyime-frontend`
   - **Type**: `Static Site`
   - **Repository**: Aynı GitHub repo
   - **Branch**: `main`
   - **Root Directory**: `/` (root klasör)

### Adım 2: Build Settings

#### Build Command
```bash
npm install && npm run build
```

#### Publish Directory
```
dist
```

#### Install Command
```bash
npm install
```

### Adım 3: Environment Variables (Frontend)

```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Google AI (Gemini)
VITE_GOOGLE_AI_API_KEY=AIzaSy...

# PayTR (Frontend'de kullanılan)
VITE_PAYTR_MERCHANT_ID=your_merchant_id
VITE_PAYTR_MERCHANT_KEY=your_merchant_key
VITE_PAYTR_MERCHANT_SALT=your_merchant_salt

# Backend API URL (Coolify'dan aldığın backend URL)
VITE_BACKEND_API_URL=https://cizimdengiyime-backend-xxx.coolify.app
```

### Adım 4: Redirect Kuralları (SPA için)

Vite/React SPA olduğu için 404 redirect ayarı gerekli. Coolify'da **Headers & Redirects** ayarlarına git:

```nginx
/*    /index.html   200
```

Ya da Nginx config:
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

### Adım 5: Deploy

- **Deploy** butonuna tıkla
- Build loglarını izle
- Deployment tamamlandığında frontend URL'i göreceksin:
  - Örnek: `https://cizimdengiyime-xxx.coolify.app`

---

## 🔐 ENVIRONMENT VARIABLES

### Backend (.env örnek)
```env
# Supabase
VITE_SUPABASE_URL=https://uzkcakxqvgniqvtidvpj.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6a2Nha3hxdmduaXF2dGlkdnBqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMzE5MjQ1MCwiZXhwIjoyMDQ4NzY4NDUwfQ.SERVICE_ROLE_KEY

# PayTR
PAYTR_MERCHANT_KEY=xxx
PAYTR_MERCHANT_SALT=xxx
PAYTR_MERCHANT_ID=xxx
VITE_PAYTR_MERCHANT_KEY=xxx
VITE_PAYTR_MERCHANT_SALT=xxx
VITE_PAYTR_MERCHANT_ID=xxx

# Port
PORT=3001
```

### Frontend (.env örnek)
```env
# Supabase
VITE_SUPABASE_URL=https://uzkcakxqvgniqvtidvpj.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ANON_KEY

# Google AI
VITE_GOOGLE_AI_API_KEY=AIzaSyxxxxxxxxxxxxx

# PayTR
VITE_PAYTR_MERCHANT_ID=xxx
VITE_PAYTR_MERCHANT_KEY=xxx
VITE_PAYTR_MERCHANT_SALT=xxx

# Backend API
VITE_BACKEND_API_URL=https://cizimdengiyime-backend-xxx.coolify.app
```

---

## 🌐 SSL VE DOMAIN AYARLARI

### Otomatik SSL (Let's Encrypt)

Coolify otomatik olarak SSL sertifikası sağlar:

1. **Settings** → **Domains** sekmesine git
2. Domain ekle (örnek: `api.yourdomain.com` backend için)
3. **Enable SSL** checkbox'ını aktif et
4. Coolify otomatik Let's Encrypt sertifikası oluşturur

### Custom Domain Ayarları

#### Backend için:
```
Domain: api.yourdomain.com
DNS Record: A record → Coolify server IP
```

#### Frontend için:
```
Domain: yourdomain.com veya app.yourdomain.com
DNS Record: A record → Coolify server IP
```

---

## 🔧 BACKEND'DEN FRONTEND'E BAĞLANTI

### PayTR Callback URL Güncelleme

Backend deploy olduktan sonra PayTR'de callback URL'i güncellemelisin:

1. PayTR Dashboard → Ayarlar → Bildirim URL'leri
2. Callback URL: `https://cizimdengiyime-backend-xxx.coolify.app/api/paytr-callback`

### Frontend'de Backend URL Kullanımı

Frontend kodunda backend URL kullanırken:

```javascript
// lib/paytrService.ts veya ilgili dosyada
const BACKEND_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:3001';
```

---

## 🐛 TROUBLESHOOTING

### Backend Build Hataları

**Problem:** `Cannot find module` hatası
```bash
# Çözüm: package.json'da dependencies kontrol et
cd server
npm install
```

**Problem:** Environment variables yüklenmiyor
```bash
# Çözüm: Coolify'da Environment Variables'ı kontrol et
# Build logs'ta env var kontrollerini incele
```

### Frontend Build Hataları

**Problem:** `Module not found` hatası
```bash
# Çözüm: Root package.json'da dependencies kontrol et
npm install
npm run build
```

**Problem:** API calls 404 veriyor
```bash
# Çözüm: VITE_BACKEND_API_URL'in doğru set edildiğinden emin ol
# Backend'in çalıştığını kontrol et
curl https://cizimdengiyime-backend-xxx.coolify.app/api/health
```

### CORS Hataları

**Problem:** CORS policy hatası

**Çözüm:** Backend'de (`server/index.js`) CORS ayarlarını güncelle:

```javascript
// Frontend URL'ini ekle
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://cizimdengiyime-xxx.coolify.app', // Frontend URL
    'https://yourdomain.com' // Custom domain varsa
  ],
  credentials: true
}));
```

### SSL Sorunları

**Problem:** Mixed content (HTTP/HTTPS) hatası

**Çözüm:** Tüm API çağrılarının HTTPS olduğundan emin ol:
```javascript
// ❌ Yanlış
const apiUrl = 'http://api.yourdomain.com';

// ✅ Doğru
const apiUrl = 'https://api.yourdomain.com';
```

---

## 📊 DEPLOYMENT SONRASI KONTROLLER

### 1. Health Check (Backend)
```bash
curl https://cizimdengiyime-backend-xxx.coolify.app/api/health
# Beklenen: {"status":"OK","message":"Backend is running"}
```

### 2. Frontend Erişim
```bash
# Browser'da aç:
https://cizimdengiyime-xxx.coolify.app
```

### 3. PayTR Callback Test
```bash
# PayTR test ödeme yap
# Backend logs'ta callback'leri izle
# Coolify Dashboard → Logs sekmesi
```

### 4. Supabase Bağlantı Testi
```bash
# Browser console'da:
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
```

---

## 🔄 CONTINUOUS DEPLOYMENT

### Otomatik Deployment

Coolify, GitHub push'larını otomatik algılar:

1. **Settings** → **Automatic Deployments** aktif et
2. Her `git push` sonrası otomatik build başlar
3. Build loglarını **Deployments** sekmesinden izle

### Manual Deployment

```bash
# Coolify Dashboard'da:
1. Application'ı seç
2. "Redeploy" butonuna tıkla
3. Build loglarını izle
```

---

## 📝 NOTLAR

### Backend İçin Önemli
- ✅ Port ayarını `PORT=3001` olarak set et (Coolify otomatik assign edebilir)
- ✅ Health check endpoint mutlaka `/api/health` olmalı
- ✅ CORS ayarlarında frontend URL'ini ekle
- ✅ Environment variables'ı Coolify'da mutlaka set et (`.env` dosyası deploy edilmez)

### Frontend İçin Önemli
- ✅ Build directory: `dist` (Vite default)
- ✅ SPA redirect kuralı ekle (404 → index.html)
- ✅ Backend URL'i environment variable'dan al
- ✅ Tüm API key'leri `VITE_` prefix'i ile başlamalı

### Güvenlik
- 🔐 `SUPABASE_SERVICE_KEY` sadece backend'de kullan (frontend'de asla!)
- 🔐 PayTR merchant key/salt güvenli sakla
- 🔐 Google AI API key'i rate limit'e dikkat et
- 🔐 CORS ayarlarını production URL'lerine göre kısıtla

---

## 🎯 DEPLOYMENT CHECKLIST

### Pre-Deployment
- [ ] GitHub repository hazır
- [ ] Supabase project oluşturuldu
- [ ] PayTR hesabı aktif
- [ ] Google AI API key alındı
- [ ] Environment variables listesi hazır

### Backend Deployment
- [ ] Coolify'da backend application oluşturuldu
- [ ] Root directory: `/server` set edildi
- [ ] Environment variables eklendi
- [ ] Build command: `npm install`
- [ ] Start command: `npm start`
- [ ] Port: `3001` set edildi
- [ ] Health check: `/api/health` eklendi
- [ ] Deploy edildi ve test edildi

### Frontend Deployment
- [ ] Coolify'da frontend application oluşturuldu
- [ ] Root directory: `/` set edildi
- [ ] Build command: `npm install && npm run build`
- [ ] Publish directory: `dist`
- [ ] Environment variables eklendi (Backend URL dahil)
- [ ] SPA redirect kuralı eklendi
- [ ] Deploy edildi ve test edildi

### Post-Deployment
- [ ] Backend health check çalışıyor
- [ ] Frontend erişilebilir
- [ ] Supabase bağlantısı çalışıyor
- [ ] PayTR callback URL güncellendi
- [ ] Test ödeme yapıldı ve başarılı
- [ ] SSL sertifikaları aktif
- [ ] Custom domain bağlandı (varsa)
- [ ] CORS ayarları production için güncellendi

---

## 📞 DESTEK

Sorun yaşarsan:

1. **Coolify Logs**: Application → Logs → Build/Runtime logs
2. **Browser Console**: F12 → Console → Hata mesajları
3. **Network Tab**: F12 → Network → API çağrıları
4. **Supabase Logs**: Supabase Dashboard → Logs

---

## 🚀 SONUÇ

Bu rehberi takip ederek projeniz Coolify'da başarıyla deploy edilecek. İki servis de (frontend + backend) production'da çalışır durumda olacak.

**İyi deploymentlar! 🎉**
