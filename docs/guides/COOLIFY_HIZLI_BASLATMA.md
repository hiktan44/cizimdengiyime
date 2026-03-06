# ⚡ COOLIFY HIZLI BAŞLATMA

Bu dosya, projeyi Coolify'da hızlıca deploy etmek için gerekli adımları içerir.

---

## 🎯 1 DAKİKADA DEPLOYMENT

### 1. Coolify'da İki Ayrı Uygulama Oluştur

#### Backend Uygulaması
```
Name: cizimdengiyime-backend
Type: NodeJS
Repository: [GitHub Repo URL]
Branch: main
Root Directory: /server
Build Command: npm install
Start Command: npm start
Port: 3001
Health Check: /api/health
```

#### Frontend Uygulaması
```
Name: cizimdengiyime-frontend
Type: Static Site (Static)
Repository: [GitHub Repo URL]
Branch: main
Root Directory: /
Build Command: npm install && npm run build
Publish Directory: dist
```

---

## 🔑 2. ENVIRONMENT VARIABLES EKLE

### Backend Environment Variables

Coolify → Backend App → Environment sekmesi:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
PAYTR_MERCHANT_KEY=your-merchant-key
PAYTR_MERCHANT_SALT=your-merchant-salt
PAYTR_MERCHANT_ID=your-merchant-id
VITE_PAYTR_MERCHANT_KEY=your-merchant-key
VITE_PAYTR_MERCHANT_SALT=your-merchant-salt
VITE_PAYTR_MERCHANT_ID=your-merchant-id
PORT=3001
NODE_ENV=production
```

### Frontend Environment Variables

Coolify → Frontend App → Environment sekmesi:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_GOOGLE_AI_API_KEY=your-google-ai-key
VITE_PAYTR_MERCHANT_ID=your-merchant-id
VITE_PAYTR_MERCHANT_KEY=your-merchant-key
VITE_PAYTR_MERCHANT_SALT=your-merchant-salt
VITE_BACKEND_API_URL=https://[BACKEND-URL-FROM-COOLIFY]
```

⚠️ **ÖNEMLİ**: `VITE_BACKEND_API_URL` değerini backend deploy olduktan sonra güncellemen gerekiyor!

---

## 🚀 3. DEPLOY ET

### Sıra ile:

1. **Backend'i deploy et** → Deploy butonuna tıkla
2. **Backend URL'i al** → Deployment tamamlandığında URL'i kopyala
   - Örnek: `https://cizimdengiyime-backend-abc123.coolify.app`
3. **Frontend env değişkenini güncelle**:
   - Frontend App → Environment → `VITE_BACKEND_API_URL` değerini backend URL ile güncelle
4. **Frontend'i deploy et** → Deploy butonuna tıkla

---

## ✅ 4. DOĞRULAMA

### Backend Kontrolü
```bash
curl https://[BACKEND-URL]/api/health
# Beklenen: {"status":"OK","message":"Backend is running"}
```

### Frontend Kontrolü
```bash
# Browser'da aç:
https://[FRONTEND-URL]
```

---

## 🔧 5. SPA REDIRECT AYARI (Frontend için)

Coolify'da frontend uygulaması için:

**Settings → Configuration → Nginx sekmesi:**

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

Ya da:

**Settings → Redirects sekmesi:**
```
/* → /index.html (200)
```

---

## 🔄 6. PAYTR CALLBACK URL GÜNCELLEME

PayTR Dashboard → Ayarlar → Bildirim URL'leri:

```
Callback URL: https://[BACKEND-URL]/api/paytr-callback
```

---

## 📝 HIZLI NOTLAR

### Backend
- ✅ Health check mutlaka `/api/health` olmalı
- ✅ Port 3001 (Coolify otomatik assign edebilir ama set et)
- ✅ `SUPABASE_SERVICE_KEY` sadece backend'de (frontend'de asla!)

### Frontend
- ✅ Build directory: `dist`
- ✅ SPA redirect kuralı ekle
- ✅ Backend URL environment variable'dan alınmalı
- ✅ Tüm API key'ler `VITE_` prefix'i ile başlamalı

### CORS (Backend)
Backend'de frontend URL'ini CORS'a ekle:

```javascript
// server/index.js
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://[FRONTEND-URL]', // Coolify'dan alınan URL
    'https://yourdomain.com' // Custom domain varsa
  ],
  credentials: true
}));
```

---

## 🐛 SORUN GİDERME

### Build Başarısız Oldu
```bash
# Logs kontrol et
Coolify Dashboard → Application → Logs → Build Logs
```

### API 404 Veriyor
```bash
# Backend URL'in doğru olduğunu kontrol et
# Frontend env variables kontrol et
# CORS ayarlarını kontrol et
```

### Environment Variables Yüklenmedi
```bash
# Coolify'da Environment Variables'ı kontrol et
# Redeploy yap
```

---

## 🎉 TAMAMLANDI!

Projen artık Coolify'da çalışıyor! 🚀

**Detaylı bilgi için:** `COOLIFY_DEPLOYMENT_GUIDE.md` dosyasını incele.
