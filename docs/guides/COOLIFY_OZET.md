# 🎯 COOLIFY DEPLOYMENT - HIZLI ÖZET

Projenizi Coolify'da 10 dakikada deploy edin!

---

## 📦 NEYİ DEPLOY EDECEĞİZ?

Bu projede **2 ayrı servis** var:

1. **Backend API** (Express.js) → `server/` klasöründe
   - PayTR callback endpoint'i
   - Port: 3001

2. **Frontend** (Vite/React) → Root klasörde
   - Static site
   - Build output: `dist/`

---

## ⚡ 3 ADIMDA DEPLOYMENT

### 1️⃣ BACKEND DEPLOY (5 dakika)

**Coolify'da yeni app oluştur:**
```
Application Type: NodeJS
Root Directory: /server    ⚠️ ÖNEMLİ!
Build Command: npm install
Start Command: npm start
Port: 3001
Health Check: /api/health
```

**Environment Variables Ekle:**
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=eyJ...service-role-key
PAYTR_MERCHANT_KEY=xxx
PAYTR_MERCHANT_SALT=xxx
PAYTR_MERCHANT_ID=xxx
PORT=3001
NODE_ENV=production
```

**Deploy Et!** 🚀

**Backend URL'i Kopyala:**
```
https://cizimdengiyime-backend-xxx.coolify.app
```

---

### 2️⃣ FRONTEND DEPLOY (5 dakika)

**Coolify'da yeni app oluştur:**
```
Application Type: Static Site
Root Directory: /          ⚠️ Root klasör!
Build Command: npm install && npm run build
Publish Directory: dist
```

**Environment Variables Ekle:**
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...anon-key
VITE_GOOGLE_AI_API_KEY=AIzaSy...
VITE_PAYTR_MERCHANT_ID=xxx
VITE_PAYTR_MERCHANT_KEY=xxx
VITE_PAYTR_MERCHANT_SALT=xxx
VITE_BACKEND_API_URL=https://cizimdengiyime-backend-xxx.coolify.app  ⚠️ Backend URL!
VITE_PAYTR_TEST_MODE=1
```

**SPA Redirect Ekle:**
```nginx
/* → /index.html (200)
```

**Deploy Et!** 🚀

**Frontend URL'i Kopyala:**
```
https://cizimdengiyime-xxx.coolify.app
```

---

### 3️⃣ PAYTR AYARI (2 dakika)

**PayTR Dashboard'a git:**
1. Ayarlar → Bildirim URL'leri
2. Callback URL: `https://[BACKEND-URL]/api/paytr-callback`
3. Kaydet

**Backend'de CORS Güncelle:**

`server/index.js` dosyasında:
```javascript
const allowedOrigins = [
  'http://localhost:5173',
  'https://cizimdengiyime-xxx.coolify.app', // ✅ Frontend URL ekle
];
```

**Backend'i Redeploy Et!**

---

## ✅ TEST ET

### Backend Test:
```bash
curl https://[BACKEND-URL]/api/health
# Beklenen: {"status":"OK","message":"Backend is running"}
```

### Frontend Test:
```
Browser'da aç: https://[FRONTEND-URL]
```

### PayTR Test:
1. Uygulamada "Kredi Satın Al" butonuna tıkla
2. Test kartı ile ödeme yap: `4355084355084358`
3. Ödeme tamamlandıktan sonra kredilerin geldiğini kontrol et

---

## 📋 ENVIRONMENT VARIABLES - HIZLI REFERANS

### Backend Env Variables
```env
VITE_SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=eyJ...service-role
PAYTR_MERCHANT_KEY=xxx
PAYTR_MERCHANT_SALT=xxx
PAYTR_MERCHANT_ID=xxx
VITE_PAYTR_MERCHANT_KEY=xxx
VITE_PAYTR_MERCHANT_SALT=xxx
VITE_PAYTR_MERCHANT_ID=xxx
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://[frontend-url]
```

### Frontend Env Variables
```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...anon
VITE_GOOGLE_AI_API_KEY=AIzaSy...
VITE_PAYTR_MERCHANT_ID=xxx
VITE_PAYTR_MERCHANT_KEY=xxx
VITE_PAYTR_MERCHANT_SALT=xxx
VITE_BACKEND_API_URL=https://[backend-url]
VITE_PAYTR_TEST_MODE=1
```

---

## 🔑 NEREDE BULABİLİRİM?

### Supabase Keys
1. Supabase Dashboard → Settings → API
2. `VITE_SUPABASE_URL`: Project URL
3. `VITE_SUPABASE_ANON_KEY`: anon/public key
4. `SUPABASE_SERVICE_KEY`: service_role key ⚠️ Sadece backend'de kullan!

### Google AI API Key
1. [Google AI Studio](https://aistudio.google.com/)
2. Get API Key → Create Key
3. `VITE_GOOGLE_AI_API_KEY`

### PayTR Keys
1. [PayTR Dashboard](https://www.paytr.com/)
2. Hesabım → Bilgilerim → Mağaza Bilgileri
3. Merchant ID, Key, Salt

---

## 🐛 SORUNLAR VE ÇÖZÜMLER

### Build Hatası
```
❌ Sorun: npm install başarısız
✅ Çözüm: Node version kontrol et (18.x veya 20.x)
```

### API 404 Hatası
```
❌ Sorun: Backend'e erişilemiyor
✅ Çözüm: 
  1. VITE_BACKEND_API_URL doğru mu?
  2. Backend çalışıyor mu? (health check test et)
  3. CORS ayarları doğru mu?
```

### CORS Hatası
```
❌ Sorun: CORS policy error
✅ Çözüm: Backend'de frontend URL'ini allowedOrigins'e ekle
```

### PayTR Callback Çalışmıyor
```
❌ Sorun: Ödeme sonrası krediler gelmiyor
✅ Çözüm:
  1. PayTR'de callback URL doğru mu?
  2. Backend logs'unda callback geldi mi?
  3. PAYTR_MERCHANT_KEY ve SALT doğru mu?
```

### Environment Variables Yüklenmedi
```
❌ Sorun: Env variables undefined
✅ Çözüm: 
  1. Coolify'da Environment Variables ekledin mi?
  2. Frontend env'leri VITE_ prefix'i ile başlıyor mu?
  3. Redeploy yap
```

---

## 📚 DETAYLI DÖKÜMANLARA ERİŞİM

- 📖 **Detaylı Rehber**: [COOLIFY_DEPLOYMENT_GUIDE.md](./COOLIFY_DEPLOYMENT_GUIDE.md)
- ✅ **Checklist**: [COOLIFY_CHECKLIST.md](./COOLIFY_CHECKLIST.md)
- ⚡ **Hızlı Başlangıç**: [COOLIFY_HIZLI_BASLATMA.md](./COOLIFY_HIZLI_BASLATMA.md)
- 🔙 **Backend Docs**: [server/README.md](./server/README.md)
- 💳 **PayTR Entegrasyon**: [PAYTR_ENTEGRASYON_REHBERI.md](./PAYTR_ENTEGRASYON_REHBERI.md)

---

## 🎯 DEPLOYMENT SONRASI

### ✅ Yapılması Gerekenler
- [ ] PayTR'de callback URL güncellendi
- [ ] Backend CORS ayarları güncellendi
- [ ] Test ödeme yapıldı ve başarılı oldu
- [ ] Tüm özellikler test edildi
- [ ] SSL sertifikaları aktif
- [ ] Monitoring kuruldu (Coolify built-in)

### 🚀 Production'a Geçiş İçin
1. PayTR test mode'u kapat: `VITE_PAYTR_TEST_MODE=0`
2. PayTR'de gerçek merchant bilgilerini kullan
3. Domain bağla (opsiyonel)
4. Google Analytics/monitoring ekle
5. Backup stratejisi oluştur

---

## 💡 İPUCLARI

### Hızlı Deployment
```bash
# Her iki servisi de aynı anda deploy etmek için:
# Coolify'da "Automatic Deployments" aktif et
# Git push yaptığında otomatik deploy olur
```

### Logs İzleme
```bash
# Coolify Dashboard:
Application → Logs sekmesi
# Real-time logs görebilirsin
```

### Rollback
```bash
# Coolify Dashboard:
Application → Deployments sekmesi
# Eski deployment'a geri dön
```

---

## 🎉 TAMAMLANDI!

Artık uygulamanız Coolify'da çalışıyor! 🚀

**URL'ler:**
- Frontend: `https://cizimdengiyime-xxx.coolify.app`
- Backend: `https://cizimdengiyime-backend-xxx.coolify.app`

**Sonraki Adımlar:**
1. ✅ Test ödeme yap
2. ✅ Tüm özellikleri test et
3. ✅ Production'a geç (test başarılıysa)
4. ✅ Monitoring kur
5. ✅ Kullanıcılara duyur! 📣

---

**Başarılar! 🎊**

Sorularınız için:
- 📧 Destek: support@yourdomain.com
- 📚 Dökümanlar: README.md
- 🐛 Issues: GitHub Issues
