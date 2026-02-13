<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# 🎨 Çizimden Resime Videoya - AI Powered Design App

Google AI teknolojisi ile çizimlerinizi gerçekçi resimlere ve videolara dönüştürün! Modern, kullanıcı dostu arayüzü ile profesyonel sonuçlar alın.

[![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646CFF?logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Latest-3ECF8E?logo=supabase)](https://supabase.com/)

---

## 🌟 Özellikler

### 🎯 Ana Özellikler
- ✨ **AI Görsel Dönüştürme**: Gelişmiş AI teknolojisi ile çizimlerinizi gerçekçi görsellere dönüştürün
- 🎬 **Video Oluşturma**: AI destekli video jeneratörü
- 🎨 **Renk Düzenleme**: Gelişmiş renk seçici ve özelleştirme araçları
- 📤 **Kolay Yükleme**: Drag & drop ile resim yükleme
- 🔄 **Before/After Slider**: Sonuçları karşılaştırın
- 💾 **Yüksek Çözünürlük İndirme**: Sonuçlarınızı HD kalitede indirin

### 👤 Kullanıcı Sistemi
- 🔐 **Güvenli Kimlik Doğrulama**: Email & şifre + Google OAuth
- 💳 **Kredi Sistemi**: PayTR entegrasyonu ile güvenli ödeme
- 📊 **Kullanıcı Paneli**: İşlem geçmişi ve kredi takibi
- 👨‍💼 **Admin Dashboard**: Kullanıcı yönetimi, istatistikler, işlem izleme

### 🎨 Modern UI/UX
- 📱 **Fully Responsive**: Mobil, tablet ve masaüstü uyumlu
- 🌓 **Dark/Light Mode**: Göz yormayan modern tasarım
- ⚡ **Hızlı ve Akıcı**: Vite ile optimize edilmiş performans
- 🎭 **Animasyonlar**: Smooth transitions ve interaktif elementler

---

## 🚀 Hızlı Başlangıç

### Gereksinimler
- **Node.js** 18.x veya üzeri
- **npm** veya **yarn**
- **Supabase** hesabı
- **Google AI API** key (Gemini)
- **PayTR** merchant hesabı (ödeme entegrasyonu için)

### Local Development

1. **Repository'yi klonlayın:**
```bash
git clone https://github.com/yourusername/cizimdengiyime.git
cd cizimdengiyime
```

2. **Dependencies'leri yükleyin:**
```bash
# Frontend
npm install

# Backend
cd server
npm install
cd ..
```

3. **Environment variables'ı ayarlayın:**

Root klasörde `.env` dosyası oluşturun:
```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Google AI
VITE_GOOGLE_AI_API_KEY=AIzaSy...

# PayTR
VITE_PAYTR_MERCHANT_ID=your-merchant-id
VITE_PAYTR_MERCHANT_KEY=your-merchant-key
VITE_PAYTR_MERCHANT_SALT=your-merchant-salt
VITE_PAYTR_TEST_MODE=1

# Backend API
VITE_BACKEND_API_URL=http://localhost:3001
```

`server` klasöründe `.env` dosyası oluşturun:
```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key

# PayTR
PAYTR_MERCHANT_KEY=your-merchant-key
PAYTR_MERCHANT_SALT=your-merchant-salt
PAYTR_MERCHANT_ID=your-merchant-id

# Port
PORT=3001
```

4. **Supabase'i kurun:**

Supabase Dashboard'dan SQL Editor'ü açın ve şu dosyaları sırayla çalıştırın:
```bash
1. supabase-setup.sql
2. FIX_RLS_POLICIES.sql
3. SAFE_STORAGE_SETUP.sql
```

5. **Uygulamayı başlatın:**

İki ayrı terminal açın:

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
# Backend: http://localhost:3001
```

**Terminal 2 - Frontend:**
```bash
npm run dev
# Frontend: http://localhost:5173
```

---

## 🐳 Docker ile Çalıştırma

Docker Compose ile tüm uygulamayı tek komutla başlatın:

```bash
# .env dosyasını düzenleyin
cp .env.example .env

# Container'ları başlat
docker-compose up -d

# Frontend: http://localhost
# Backend: http://localhost:3001
```

---

## 🌐 Production Deployment (Coolify)

Coolify ile deployment için detaylı rehberler:

📚 **Deployment Dökümanları:**
- 📖 [COOLIFY_DEPLOYMENT_GUIDE.md](./COOLIFY_DEPLOYMENT_GUIDE.md) - Detaylı deployment rehberi
- ⚡ [COOLIFY_HIZLI_BASLATMA.md](./COOLIFY_HIZLI_BASLATMA.md) - Hızlı başlatma rehberi
- ✅ [COOLIFY_CHECKLIST.md](./COOLIFY_CHECKLIST.md) - Deployment checklist

### Kısa Özet:

1. **Backend Deploy:**
   - Coolify'da NodeJS app oluştur
   - Root Directory: `/server`
   - Build: `npm install`
   - Start: `npm start`
   - Port: `3001`

2. **Frontend Deploy:**
   - Coolify'da Static Site oluştur
   - Root Directory: `/`
   - Build: `npm install && npm run build`
   - Publish: `dist`

3. **Environment Variables:**
   - Backend ve Frontend için ayrı ayrı environment variables ekle
   - Backend URL'i frontend'e ekle: `VITE_BACKEND_API_URL`

4. **PayTR Callback:**
   - PayTR Dashboard'da callback URL'i güncelle
   - URL: `https://[backend-url]/api/paytr-callback`

**Detaylı bilgi için yukarıdaki dökümanları inceleyin!**

---

## 📁 Proje Yapısı

```
cizimdengiyime/
├── components/          # React bileşenleri
│   ├── admin/          # Admin dashboard bileşenleri
│   ├── icons/          # SVG icon bileşenleri
│   ├── Header.tsx      # Ana header
│   ├── Dashboard.tsx   # Kullanıcı dashboard
│   ├── ImageUploader.tsx
│   └── ...
├── pages/              # Sayfa bileşenleri
│   └── LandingPage.tsx
├── lib/                # Utility functions
│   ├── supabase.ts     # Supabase client
│   ├── geminiService.ts # AI service
│   ├── paytrService.ts  # Payment service
│   └── adminService.ts  # Admin operations
├── hooks/              # Custom React hooks
│   └── useAuth.ts      # Authentication hook
├── server/             # Backend API
│   ├── index.js        # Express server
│   ├── package.json
│   └── Dockerfile
├── public/             # Static assets
├── test/               # Test dosyaları
├── Dockerfile          # Frontend Dockerfile
├── docker-compose.yml  # Docker Compose config
├── coolify.yaml        # Coolify config
└── README.md

```

---

## 🛠️ Teknoloji Stack

### Frontend
- **React 19.2** - UI framework
- **TypeScript 5.8** - Type safety
- **Vite 6.2** - Build tool
- **Tailwind CSS 3.4** - Styling
- **Supabase** - Backend as a Service
- **Google AI** - AI image generation

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **Supabase** - Database & auth
- **PayTR** - Payment gateway

### DevOps
- **Docker** - Containerization
- **Coolify** - Deployment platform
- **GitHub Actions** - CI/CD (opsiyonel)

---

## 🧪 Testing

```bash
# Unit tests
npm run test

# UI tests
npm run test:ui

# Coverage
npm run test:coverage
```

Test dökümanları:
- [TEST_GUIDE_TR.md](./TEST_GUIDE_TR.md)
- [TEST_REPORT.md](./TEST_REPORT.md)

---

## 📊 Admin Dashboard

Admin paneline erişim:

1. Supabase Dashboard → Authentication → Users
2. Kullanıcıyı seç → Metadata ekle:
```json
{
  "role": "admin"
}
```
3. Uygulamada `/` adresine git
4. Header'da "Admin" butonu görünecek

**Admin Özellikleri:**
- 📊 Kullanıcı yönetimi ve istatistikler
- 💳 İşlem takibi
- 📈 Gerçek zamanlı aktivite izleme
- ⚙️ Sistem ayarları

---

## 💳 Payment System (PayTR)

PayTR entegrasyonu için:

1. [PayTR](https://www.paytr.com/) hesabı oluştur
2. Merchant bilgilerini al
3. `.env` dosyasına ekle
4. Test kartları ile test et

**Test Kartları:**
- **Başarılı:** 4355084355084358
- **Yetersiz Bakiye:** 4355084355084333
- **Mastercard:** 5400619360964581

**Detaylı bilgi:** [PAYTR_ENTEGRASYON_REHBERI.md](./PAYTR_ENTEGRASYON_REHBERI.md)

---

## 🔐 Güvenlik

- ✅ Supabase Row Level Security (RLS) policies
- ✅ Environment variables güvenli saklama
- ✅ PayTR hash doğrulama
- ✅ CORS protection
- ✅ XSS ve SQL injection koruması
- ✅ HTTPS/SSL enforced (production)

---

## 📝 Önemli Notlar

### Production'a Geçmeden Önce
- [ ] Supabase RLS policies kontrol edildi
- [ ] PayTR test mode kapatıldı (`VITE_PAYTR_TEST_MODE=0`)
- [ ] CORS ayarları production URL'leri ile güncellendi
- [ ] Environment variables güvenli şekilde saklandı
- [ ] SSL sertifikaları aktif
- [ ] Monitoring kuruldu

### Güvenlik Uyarıları
- ⚠️ `SUPABASE_SERVICE_KEY` asla frontend'e göndermeyin
- ⚠️ `.env` dosyalarını `.gitignore`'a ekleyin
- ⚠️ API key'leri public repository'de paylaşmayın
- ⚠️ Production'da debug mode'u kapatın

---

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'Add amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

---

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](./LICENSE) dosyasına bakın.

---

## 📞 İletişim & Destek

Sorun yaşarsanız:
- 🐛 [Issue açın](https://github.com/yourusername/cizimdengiyime/issues)
- 📧 Email: your-email@example.com
- 💬 Discord: [Discord Server](https://discord.gg/yourserver)

---

## 🎉 Teşekkürler

Bu projeyi mümkün kılan harika teknolojilere teşekkürler:
- [Google AI](https://ai.google.dev/)
- [Supabase](https://supabase.com/)
- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [PayTR](https://www.paytr.com/)

---

<div align="center">
Made with ❤️ by Your Name

⭐ Star us on GitHub — it helps!
</div>
