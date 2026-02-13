# 🔄 Node.js Güncelleme Rehberi

## ⚠️ Mevcut Sorun

```
Node.js v14.17.6 (Çok Eski!)
Supabase Gereksinimi: Node.js 20+
```

---

## 🚀 Çözüm 1: NVM ile Güncelleme (Önerilen)

### 1. NVM Kurulu mu Kontrol Et

```bash
nvm --version
```

**Eğer kurulu değilse:**

```bash
# NVM kur
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Terminal'i yeniden başlat veya:
source ~/.bashrc
# veya
source ~/.zshrc
```

### 2. Node.js 20 Kur

```bash
# En son LTS versiyonunu kur
nvm install 20

# Kullan
nvm use 20

# Default yap
nvm alias default 20

# Kontrol et
node -v
# Çıktı: v20.x.x olmalı
```

### 3. Backend'i Yeniden Başlat

```bash
cd /www/wwwroot/fasheone.com/cizimdengiyime/server

# Eski PM2 process'i durdur
pm2 delete cizimdengiyime-api

# Node modules'u yeniden kur
rm -rf node_modules package-lock.json
npm install

# Yeniden başlat
pm2 start index.js --name cizimdengiyime-api
pm2 save
```

---

## 🔧 Çözüm 2: Direkt Node.js Güncelleme

### Ubuntu/Debian

```bash
# NodeSource repository ekle (Node.js 20)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Node.js kur
sudo apt-get install -y nodejs

# Kontrol et
node -v
npm -v
```

### CentOS/RHEL/AlmaLinux

```bash
# NodeSource repository ekle
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -

# Node.js kur
sudo yum install -y nodejs

# Kontrol et
node -v
npm -v
```

---

## 📝 .env Dosyası Kontrolü

`server/.env` dosyasını kontrol edin:

```bash
cd /www/wwwroot/fasheone.com/cizimdengiyime/server
cat .env
```

**Olması gereken:**

```env
PORT=3001

# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# PayTR
PAYTR_MERCHANT_KEY=your-merchant-key
PAYTR_MERCHANT_SALT=your-merchant-salt
```

**Eğer yoksa oluşturun:**

```bash
cd /www/wwwroot/fasheone.com/cizimdengiyime/server
nano .env
```

İçeriği yapıştırın, `Ctrl+X`, `Y`, `Enter` ile kaydedin.

---

## ✅ Test

### 1. Node.js Sürümü

```bash
node -v
# Beklenen: v20.x.x veya üzeri
```

### 2. Backend Başlatma

```bash
cd /www/wwwroot/fasheone.com/cizimdengiyime/server
npm start
```

**Beklenen çıktı:**

```
🔍 Environment Variables Check:
VITE_SUPABASE_URL: ✅ Set
SUPABASE_SERVICE_KEY: ✅ Set
PAYTR_MERCHANT_KEY: ✅ Set
PAYTR_MERCHANT_SALT: ✅ Set
🚀 Backend server running on port 3001
📍 Callback URL: http://localhost:3001/api/paytr-callback
```

**Eğer ❌ Missing görürseniz, `.env` dosyası hatalıdır!**

### 3. Health Check

```bash
curl http://localhost:3001/api/health
```

**Beklenen:**
```json
{"status":"OK","message":"Backend is running"}
```

---

## 🔥 Tam Kurulum (Sıfırdan)

```bash
# 1. Node.js güncelle (NVM ile)
nvm install 20
nvm use 20

# 2. Backend klasörüne git
cd /www/wwwroot/fasheone.com/cizimdengiyime/server

# 3. .env dosyası oluştur
cat > .env << 'EOF'
PORT=3001

# Supabase (kendi değerlerinizi yazın)
VITE_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key

# PayTR (kendi değerlerinizi yazın)
PAYTR_MERCHANT_KEY=your-key
PAYTR_MERCHANT_SALT=your-salt
EOF

# 4. Node modules kur
npm install

# 5. PM2 ile başlat
pm2 start index.js --name cizimdengiyime-api
pm2 save

# 6. Logları kontrol et
pm2 logs cizimdengiyime-api
```

---

## 🐛 Sorun Giderme

### Hata: "supabaseKey is required"

**Sebep:** `.env` dosyası okunmuyor veya `SUPABASE_SERVICE_KEY` yok

**Çözüm:**

```bash
cd /www/wwwroot/fasheone.com/cizimdengiyime/server

# .env dosyası var mı?
ls -la .env

# İçeriği doğru mu?
cat .env

# SUPABASE_SERVICE_KEY var mı kontrol et
grep SUPABASE_SERVICE_KEY .env
```

**Yoksa oluşturun:**

1. Supabase Dashboard → Settings → API
2. "service_role" key'i kopyalayın
3. `server/.env` dosyasına ekleyin:
   ```env
   SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

### Hata: "Node.js 18 and below are deprecated"

**Çözüm:** Node.js 20+ güncelleyin (yukarıdaki adımları takip edin)

### Hata: "Cannot find module"

**Çözüm:**

```bash
cd /www/wwwroot/fasheone.com/cizimdengiyime/server
rm -rf node_modules package-lock.json
npm install
```

---

## 📞 Yardım

Hala sorun yaşıyorsanız:

```bash
# Node.js sürümü
node -v

# NPM sürümü
npm -v

# PM2 durumu
pm2 status

# Backend logları
pm2 logs cizimdengiyime-api --lines 50

# .env kontrolü
cd /www/wwwroot/fasheone.com/cizimdengiyime/server
cat .env
```

Bu bilgileri paylaşın.

---

## ✅ Başarılı Kurulum Kontrolü

```bash
# 1. Node.js güncel mi?
node -v
# ✅ v20.x.x veya üzeri

# 2. Backend çalışıyor mu?
pm2 status
# ✅ cizimdengiyime-api "online" durumunda

# 3. Environment variables yüklendi mi?
pm2 logs cizimdengiyime-api --lines 20
# ✅ "Environment Variables Check" hepsinde ✅

# 4. Health check çalışıyor mu?
curl http://localhost:3001/api/health
# ✅ {"status":"OK",...}
```

Hepsi ✅ ise **başarılı!** 🎉

