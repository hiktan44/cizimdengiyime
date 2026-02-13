# ✅ COOLIFY DEPLOYMENT CHECKLIST

Coolify'da deployment yapmadan önce bu listeyi takip edin.

---

## 📋 ÖN HAZIRLIK

### GitHub Repository
- [ ] Repository public veya Coolify'da erişim verilmiş
- [ ] `main` branch güncel
- [ ] Tüm değişiklikler commit edilmiş
- [ ] `.gitignore` dosyası `.env` dosyalarını içeriyor

### Supabase Hazırlığı
- [ ] Supabase project oluşturuldu
- [ ] Database tabloları kuruldu (SQL script'ler çalıştırıldı)
- [ ] RLS policies aktif
- [ ] Storage buckets oluşturuldu
- [ ] API keys alındı:
  - [ ] `VITE_SUPABASE_URL`
  - [ ] `VITE_SUPABASE_ANON_KEY`
  - [ ] `SUPABASE_SERVICE_KEY` (sadece backend için!)

### PayTR Hesabı
- [ ] PayTR hesabı oluşturuldu
- [ ] Merchant bilgileri alındı:
  - [ ] `PAYTR_MERCHANT_ID`
  - [ ] `PAYTR_MERCHANT_KEY`
  - [ ] `PAYTR_MERCHANT_SALT`
- [ ] Test mode aktif (production'a geçmeden önce test edin!)

### Google AI
- [ ] Google AI Studio'da proje oluşturuldu
- [ ] API key alındı: `VITE_GOOGLE_AI_API_KEY`
- [ ] API key rate limit'leri kontrol edildi

---

## 🔙 BACKEND DEPLOYMENT

### Coolify Ayarları
- [ ] Yeni application oluşturuldu
- [ ] Application ayarları:
  - [ ] Name: `cizimdengiyime-backend`
  - [ ] Type: `NodeJS`
  - [ ] Repository: GitHub repo seçildi
  - [ ] Branch: `main`
  - [ ] **Root Directory: `/server`** ⚠️ ÇOK ÖNEMLİ!

### Build Ayarları
- [ ] Build Command: `npm install`
- [ ] Start Command: `npm start`
- [ ] Port: `3001`
- [ ] Node Version: `20.x` veya `18.x`

### Health Check
- [ ] Health Check Path: `/api/health`
- [ ] Health Check Method: `GET`
- [ ] Expected Status: `200`

### Environment Variables (Backend)
- [ ] `VITE_SUPABASE_URL` = `https://your-project.supabase.co`
- [ ] `SUPABASE_SERVICE_KEY` = `eyJ...` (service_role key)
- [ ] `PAYTR_MERCHANT_ID` = `your-merchant-id`
- [ ] `PAYTR_MERCHANT_KEY` = `your-merchant-key`
- [ ] `PAYTR_MERCHANT_SALT` = `your-merchant-salt`
- [ ] `VITE_PAYTR_MERCHANT_ID` = `your-merchant-id` (duplicate)
- [ ] `VITE_PAYTR_MERCHANT_KEY` = `your-merchant-key` (duplicate)
- [ ] `VITE_PAYTR_MERCHANT_SALT` = `your-merchant-salt` (duplicate)
- [ ] `PORT` = `3001`
- [ ] `NODE_ENV` = `production`
- [ ] `FRONTEND_URL` = `https://[frontend-url]` (deployment sonrası eklenecek)

### Deployment
- [ ] Deploy butonuna tıklandı
- [ ] Build logs hatasız tamamlandı
- [ ] Application başarıyla çalışıyor
- [ ] Backend URL kopyalandı: `https://cizimdengiyime-backend-xxx.coolify.app`

### Doğrulama
- [ ] Health check çalışıyor:
  ```bash
  curl https://[backend-url]/api/health
  # Beklenen: {"status":"OK","message":"Backend is running"}
  ```
- [ ] Logs'ta hata yok
- [ ] Environment variables yüklendi (logs'ta ✅ işaretleri var)

---

## 🎨 FRONTEND DEPLOYMENT

### Coolify Ayarları
- [ ] Yeni application oluşturuldu
- [ ] Application ayarları:
  - [ ] Name: `cizimdengiyime-frontend`
  - [ ] Type: `Static Site` veya `Static`
  - [ ] Repository: Aynı GitHub repo
  - [ ] Branch: `main`
  - [ ] **Root Directory: `/`** (root klasör)

### Build Ayarları
- [ ] Build Command: `npm install && npm run build`
- [ ] Publish Directory: `dist`
- [ ] Node Version: `20.x` veya `18.x`

### Environment Variables (Frontend)
- [ ] `VITE_SUPABASE_URL` = `https://your-project.supabase.co`
- [ ] `VITE_SUPABASE_ANON_KEY` = `eyJ...` (anon key)
- [ ] `VITE_GOOGLE_AI_API_KEY` = `AIzaSy...`
- [ ] `VITE_PAYTR_MERCHANT_ID` = `your-merchant-id`
- [ ] `VITE_PAYTR_MERCHANT_KEY` = `your-merchant-key`
- [ ] `VITE_PAYTR_MERCHANT_SALT` = `your-merchant-salt`
- [ ] `VITE_BACKEND_API_URL` = `https://[backend-url]` (Backend URL'i buraya)
- [ ] `VITE_PAYTR_TEST_MODE` = `1` (test için) veya `0` (production için)

### SPA Redirect Ayarları
- [ ] Nginx config veya redirect kuralı eklendi:
  ```nginx
  location / {
      try_files $uri $uri/ /index.html;
  }
  ```
  veya
  ```
  /* → /index.html (200)
  ```

### Deployment
- [ ] Deploy butonuna tıklandı
- [ ] Build logs hatasız tamamlandı
- [ ] Application başarıyla çalışıyor
- [ ] Frontend URL alındı: `https://cizimdengiyime-xxx.coolify.app`

### Doğrulama
- [ ] Frontend açılıyor (browser'da erişilebiliyor)
- [ ] Sayfa yükleniyor (white screen yok)
- [ ] Console'da kritik hata yok
- [ ] Supabase bağlantısı çalışıyor (login ekranı açılıyor)

---

## 🔗 ENTEGRASYON KONTROLÜ

### Backend ↔ Frontend Bağlantısı
- [ ] Frontend'den backend'e istek atılabiliyor
- [ ] CORS hatası yok
- [ ] API çağrıları başarılı

### CORS Güncelleme (Backend)
Backend'de frontend URL'i eklendi mi?

`server/index.js` dosyasında:
```javascript
const allowedOrigins = [
  'http://localhost:5173',
  'https://cizimdengiyime-frontend-xxx.coolify.app', // ✅ EKLE
  'https://yourdomain.com', // Custom domain varsa
];
```

### PayTR Entegrasyonu
- [ ] PayTR Dashboard'a gidildi
- [ ] Callback URL güncellendi:
  - Bildirim URL: `https://[backend-url]/api/paytr-callback`
- [ ] Test ödeme yapıldı
- [ ] Callback backend'e ulaştı (logs'tan kontrol edildi)
- [ ] Credits kullanıcıya eklendi
- [ ] Transaction status güncellendi

### Supabase Storage
- [ ] Storage buckets public mi kontrol edildi
- [ ] Upload test edildi
- [ ] Görseller görüntüleniyor

---

## 🔐 GÜVENLİK KONTROLLERI

### API Keys
- [ ] `SUPABASE_SERVICE_KEY` sadece backend'de kullanılıyor
- [ ] `.env` dosyaları `.gitignore`'da
- [ ] Environment variables Coolify'da güvenli şekilde saklanıyor

### HTTPS/SSL
- [ ] Otomatik SSL sertifikası aktif
- [ ] Her iki uygulama da HTTPS ile çalışıyor
- [ ] Mixed content hatası yok

### CORS
- [ ] CORS sadece güvenilir origin'lere açık
- [ ] Production'da localhost kapalı (gerekirse)

---

## 🌐 DOMAIN AYARLARI (Opsiyonel)

### Backend Domain
- [ ] Custom domain: `api.yourdomain.com`
- [ ] DNS A record eklendi (Coolify server IP)
- [ ] SSL sertifikası alındı
- [ ] Domain Coolify'da eklendi

### Frontend Domain
- [ ] Custom domain: `yourdomain.com` veya `app.yourdomain.com`
- [ ] DNS A record eklendi
- [ ] SSL sertifikası alındı
- [ ] Domain Coolify'da eklendi

### PayTR Callback Güncelleme (Domain ile)
- [ ] PayTR'de callback URL güncellendi: `https://api.yourdomain.com/api/paytr-callback`

---

## 🧪 TEST SÜRECİ

### Fonksiyonel Testler
- [ ] Kullanıcı kaydı çalışıyor
- [ ] Kullanıcı girişi çalışıyor
- [ ] Google login çalışıyor
- [ ] Resim upload çalışıyor
- [ ] AI dönüştürme çalışıyor
- [ ] Credits sistemi çalışıyor
- [ ] PayTR ödeme akışı çalışıyor
- [ ] Admin dashboard çalışıyor

### PayTR Test Ödeme
- [ ] Test kartı ile ödeme başlatıldı
- [ ] PayTR iframe açıldı
- [ ] Ödeme tamamlandı
- [ ] Callback backend'e ulaştı
- [ ] Credits kullanıcıya eklendi
- [ ] Transaction tablosunda kayıt oluştu
- [ ] Başarılı ödeme sonrası yönlendirme çalıştı

### Mobil Test
- [ ] Mobil tarayıcıda açıldı
- [ ] Responsive tasarım çalışıyor
- [ ] Tüm özellikler mobilde kullanılabiliyor

---

## 📊 PERFORMANS KONTROLLERI

### Frontend
- [ ] Lighthouse Score > 90
- [ ] First Contentful Paint < 2s
- [ ] Total Bundle Size < 500KB (gzip)
- [ ] Images optimize edilmiş

### Backend
- [ ] Health check response time < 500ms
- [ ] API response time < 1s
- [ ] Memory kullanımı stabil

---

## 🔄 OTOMATİK DEPLOYMENT

### Continuous Deployment
- [ ] Coolify'da "Automatic Deployments" aktif
- [ ] GitHub push sonrası otomatik deploy çalışıyor
- [ ] Webhook ayarları doğru

---

## 📝 DOKÜMANTASYON

### README Güncellemeleri
- [ ] Production URL'ler eklendi
- [ ] Deployment notları yazıldı
- [ ] Environment variables listesi güncellendi

### Team Bilgilendirme
- [ ] Team'e production URL'ler paylaşıldı
- [ ] Deployment süreci dokümante edildi
- [ ] Emergency rollback planı oluşturuldu

---

## 🚨 SORUN GİDERME

### Build Hatası
- [ ] Logs okundu
- [ ] Node version kontrol edildi
- [ ] Dependencies yüklendi
- [ ] Environment variables kontrol edildi

### Runtime Hatası
- [ ] Application logs kontrol edildi
- [ ] Health check çalışıyor mu?
- [ ] Port ayarları doğru mu?
- [ ] Environment variables yüklendi mi?

### API Hatası
- [ ] CORS ayarları kontrol edildi
- [ ] Backend çalışıyor mu?
- [ ] Network tab'da request kontrol edildi
- [ ] Backend logs'ta hata var mı?

---

## 🎉 DEPLOYMENT TAMAMLANDI!

Tüm checklistler işaretlendiyse projeniz başarıyla deploy edilmiştir! 🚀

### Son Adımlar:
1. ✅ PayTR'yi production mode'a al (test başarılıysa)
2. ✅ Google AI API rate limit'lerini izle
3. ✅ Monitoring/alerting kur (Coolify built-in monitoring)
4. ✅ Backup stratejisi belirle (Supabase otomatik backup yapıyor)
5. ✅ User feedback topla ve optimize et

---

**🔗 Faydalı Linkler:**

- 📖 Detaylı Deployment Rehberi: `COOLIFY_DEPLOYMENT_GUIDE.md`
- ⚡ Hızlı Başlatma: `COOLIFY_HIZLI_BASLATMA.md`
- 🐛 Troubleshooting: `COOLIFY_DEPLOYMENT_GUIDE.md#troubleshooting`

**İyi deploymentlar! 🎊**
