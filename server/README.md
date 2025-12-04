# 🚀 Backend API Server

PayTR callback endpoint'i için Node.js/Express backend.

## 📦 Kurulum

```bash
cd server
npm install
```

## 🔧 Yapılandırma

`.env` dosyası oluşturun:

```env
PORT=3001
VITE_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
PAYTR_MERCHANT_KEY=your-merchant-key
PAYTR_MERCHANT_SALT=your-merchant-salt
```

## ▶️ Çalıştırma

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

## 🌐 PM2 ile Production (Önerilen)

### PM2 Kurulumu
```bash
npm install -g pm2
```

### Başlatma
```bash
cd server
pm2 start index.js --name cizimdengiyime-api
pm2 save
pm2 startup
```

### Kontrol
```bash
pm2 status
pm2 logs cizimdengiyime-api
pm2 restart cizimdengiyime-api
```

### Durdurma
```bash
pm2 stop cizimdengiyime-api
pm2 delete cizimdengiyime-api
```

## 📍 Endpoints

### Health Check
```
GET http://localhost:3001/api/health
```

### PayTR Callback
```
POST http://localhost:3001/api/paytr-callback
```

## 🔗 Nginx Yapılandırması

Nginx'te `/api/` path'ini bu backend'e yönlendirin:

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
}
```

## 🧪 Test

### Health Check
```bash
curl http://localhost:3001/api/health
```

### PayTR Callback Test
```bash
curl -X POST http://localhost:3001/api/paytr-callback \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "merchant_oid=ORDER123" \
  -d "status=success" \
  -d "total_amount=25000" \
  -d "hash=YOUR_HASH"
```

## 📊 Logs

PM2 logs:
```bash
pm2 logs cizimdengiyime-api --lines 100
```

## 🔒 Güvenlik

- ✅ Hash doğrulama yapılıyor
- ✅ Supabase Service Key kullanılıyor (RLS bypass)
- ✅ CORS yapılandırılmış
- ✅ Error handling mevcut

## ⚠️ Önemli Notlar

1. **SUPABASE_SERVICE_KEY** mutlaka backend'de olmalı (frontend'de OLMAMALI)
2. Backend sürekli çalışmalı (PM2 kullanın)
3. Nginx proxy_pass doğru yapılandırılmalı
4. PayTR Panel'de callback URL: `https://yourdomain.com/api/paytr-callback`

