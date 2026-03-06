# 🔧 Backend Kurulum Rehberi (Nginx + Node.js)

## 📋 Adım Adım Kurulum

### 1️⃣ Backend'i Kur

```bash
cd server
npm install
```

### 2️⃣ Environment Variables Ayarla

`server/.env` dosyası oluştur:

```env
PORT=3001

# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key-here

# PayTR
PAYTR_MERCHANT_KEY=your-merchant-key
PAYTR_MERCHANT_SALT=your-merchant-salt
```

**⚠️ Önemli:** Ana `.env` dosyasına şunu ekle:
```env
VITE_PAYTR_TEST_MODE=0
VITE_REDIRECT_URL=https://yourdomain.com
```

### 3️⃣ PM2 Kur (Production için)

```bash
# PM2'yi global olarak kur
sudo npm install -g pm2

# Backend'i PM2 ile başlat
cd server
pm2 start index.js --name cizimdengiyime-api

# PM2'yi sistem başlangıcına ekle
pm2 startup
pm2 save
```

### 4️⃣ Nginx Yapılandırması Güncelle

Mevcut `nginx.conf` dosyanızı düzenleyin:

```nginx
location /api/ {
    proxy_pass http://localhost:3001;
    
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
    
    # CORS headers
    add_header 'Access-Control-Allow-Origin' '*' always;
    add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
    add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization' always;
    
    # OPTIONS istekleri için
    if ($request_method = 'OPTIONS') {
        return 204;
    }
}
```

### 5️⃣ Nginx'i Yeniden Başlat

```bash
# Yapılandırmayı test et
sudo nginx -t

# Nginx'i yeniden yükle
sudo systemctl reload nginx

# veya
sudo service nginx reload
```

---

## ✅ Test

### 1. Backend Çalışıyor mu?

```bash
curl http://localhost:3001/api/health
```

**Beklenen Çıktı:**
```json
{"status":"OK","message":"Backend is running"}
```

### 2. Nginx Proxy Çalışıyor mu?

```bash
curl https://yourdomain.com/api/health
```

**Beklenen Çıktı:**
```json
{"status":"OK","message":"Backend is running"}
```

### 3. PayTR Callback Test

```bash
curl -X POST https://yourdomain.com/api/paytr-callback \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "merchant_oid=TEST123" \
  -d "status=success" \
  -d "total_amount=25000" \
  -d "hash=dummy"
```

**Not:** Hash yanlış olduğu için "HASH_ERROR" alırsınız, bu normaldir.

---

## 🔗 PayTR Panel Ayarları

### Callback URL

```
https://yourdomain.com/api/paytr-callback
```

### Success URL

```
https://yourdomain.com/?payment=success
```

### Fail URL

```
https://yourdomain.com/?payment=fail
```

---

## 📊 PM2 Komutları

```bash
# Status kontrolü
pm2 status

# Logları görüntüle
pm2 logs cizimdengiyime-api

# Son 100 satır log
pm2 logs cizimdengiyime-api --lines 100

# Restart
pm2 restart cizimdengiyime-api

# Stop
pm2 stop cizimdengiyime-api

# Delete
pm2 delete cizimdengiyime-api
```

---

## 🐛 Sorun Giderme

### Sorun 1: 405 Not Allowed

**Sebep:** Nginx POST isteklerini kabul etmiyor veya proxy_pass yanlış

**Çözüm:**
- Nginx yapılandırmasını kontrol et
- `proxy_pass http://localhost:3001;` doğru mu?
- Nginx'i yeniden yükle: `sudo systemctl reload nginx`

### Sorun 2: Backend çalışmıyor

**Kontrol:**
```bash
pm2 status
pm2 logs cizimdengiyime-api
```

**Çözüm:**
```bash
pm2 restart cizimdengiyime-api
```

### Sorun 3: HASH_ERROR

**Sebep:** Hash doğrulama başarısız

**Kontrol:**
- `server/.env` dosyasında `PAYTR_MERCHANT_KEY` ve `PAYTR_MERCHANT_SALT` doğru mu?
- Ana `.env` dosyasındaki değerlerle aynı mı?

### Sorun 4: TRANSACTION_NOT_FOUND

**Sebep:** merchant_oid ile transaction bulunamadı

**Kontrol:**
- `merchant_oid` alfanumerik mi? (tire yok)
- `stripe_payment_id` field'ına kaydediliyor mu?

### Sorun 5: Port 3001 kullanımda

**Çözüm:**
```bash
# Port'u kullanan process'i bul
sudo lsof -i :3001

# Kill et
sudo kill -9 <PID>

# veya farklı port kullan
PORT=3002 pm2 start index.js --name cizimdengiyime-api
```

---

## 🔒 Güvenlik Kontrol Listesi

- [ ] `SUPABASE_SERVICE_KEY` sadece backend'de
- [ ] `PAYTR_MERCHANT_KEY` sadece backend'de
- [ ] Nginx HTTPS aktif (SSL sertifikası)
- [ ] CORS doğru yapılandırılmış
- [ ] PM2 ile sürekli çalışıyor
- [ ] Firewall ayarları yapıldı
- [ ] Environment variables güvende (.env git'e eklenmiş mi kontrol et)

---

## 📁 Dosya Yapısı

```
project/
├── server/                 # Backend
│   ├── index.js           # Ana backend dosyası
│   ├── package.json
│   ├── .env               # Backend env variables
│   └── README.md
├── nginx.conf             # Nginx yapılandırması
├── .env                   # Frontend env variables
└── ...
```

---

## 🚀 Production Deployment Checklist

1. [ ] Backend kuruldu (`cd server && npm install`)
2. [ ] `server/.env` oluşturuldu
3. [ ] PM2 kuruldu ve başlatıldı
4. [ ] Nginx yapılandırması güncellendi
5. [ ] Nginx yeniden yüklendi
6. [ ] Backend health check çalışıyor
7. [ ] PayTR Panel'de callback URL ayarlandı
8. [ ] Test ödemesi yapıldı
9. [ ] Krediler eklendi
10. [ ] PM2 startup yapılandırıldı

---

## 🎉 Tamamlandı!

Artık PayTR callback sisteminiz çalışıyor!

**Test Et:**
1. Kredi satın al
2. Test kartı ile ödeme yap
3. Backend logs kontrol et: `pm2 logs cizimdengiyime-api`
4. Kredilerin eklendiğini gör

**Logs'da göreceğiniz:**
```
📥 PayTR Callback alındı
✅ Hash doğrulandı
📦 Transaction bulundu: abc-123
✅ Ödeme başarılı: ORDER1234567890
💰 50 kredi eklendi (Toplam: 60)
👤 Kullanıcı: user-id-123
```

🎊 **Başarılar!**

