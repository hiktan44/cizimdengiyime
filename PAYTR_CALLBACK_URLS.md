# 🔗 PayTR Callback URL'leri

## 📍 Callback Endpoint Adresleri

### Local Development (Test için)
```
http://localhost:3006/api/paytr-callback
```

### Production (Vercel Deploy sonrası)
```
https://SIZIN-DOMAIN.vercel.app/api/paytr-callback
```

**Örnek:**
```
https://cizimdengiyime.vercel.app/api/paytr-callback
```

---

## ⚙️ PayTR Panel Ayarları

### 1. PayTR Merchant Panel'e Giriş Yap
- URL: https://www.paytr.com/magaza
- Test merchant bilgilerinizle giriş yapın

### 2. Entegrasyon Ayarları
1. Sol menüden **"Entegrasyon"** → **"Bildirim Ayarları"** seçin
2. **"Bildirim URL"** (Callback URL) alanına şunu girin:

**Local Test için:**
```
http://localhost:3006/api/paytr-callback
```

**Production için:**
```
https://SIZIN-DOMAIN.vercel.app/api/paytr-callback
```

3. **"Başarılı Ödeme Yönlendirme URL"** (Success URL):
```
https://SIZIN-DOMAIN.vercel.app/?payment=success
```

4. **"Başarısız Ödeme Yönlendirme URL"** (Fail URL):
```
https://SIZIN-DOMAIN.vercel.app/?payment=fail
```

5. **Kaydet** butonuna tıklayın

---

## 🔄 İş Akışı

### PayTR Callback Sistemi Nasıl Çalışır?

```
1. Kullanıcı → "Kredi Al" butonuna tıklar
2. Frontend → PayTR token ister
3. PayTR → iframe URL döner
4. Kullanıcı → PayTR iframe'inde kart bilgilerini girer
5. PayTR → Ödemeyi işler

6. ⭐ PayTR → Backend Callback URL'e POST isteği gönderir
   URL: https://yourdomain.vercel.app/api/paytr-callback
   Method: POST
   Body: {
     merchant_oid: "ORDER1234567890abc",
     status: "success" veya "failed",
     total_amount: "25000", // kuruş cinsinden
     hash: "abc123...",
     ...
   }

7. Backend → Hash doğrular
8. Backend → Transaction'ı günceller
9. Backend → Kullanıcıya kredi ekler
10. Backend → PayTR'ye "OK" cevabı döner

11. PayTR → Kullanıcıyı Success/Fail URL'ine yönlendirir
12. Frontend → Sonucu gösterir
```

---

## 🧪 Local Test İçin Ngrok Kullanımı

PayTR'nin local bilgisayarınıza erişebilmesi için ngrok kullanmalısınız:

### 1. Ngrok Kur
```bash
# Windows
choco install ngrok

# veya
npm install -g ngrok
```

### 2. Ngrok Başlat
```bash
# Önce uygulamanızı başlatın
npm run dev

# Başka bir terminal'de ngrok başlatın
ngrok http 3006
```

### 3. Ngrok URL'ini Kopyala
```
Forwarding: https://abc123.ngrok.io -> http://localhost:3006
```

### 4. PayTR Panel'de Ngrok URL'ini Kullan
```
Callback URL: https://abc123.ngrok.io/api/paytr-callback
Success URL: https://abc123.ngrok.io/?payment=success
Fail URL: https://abc123.ngrok.io/?payment=fail
```

---

## 📝 Callback Endpoint Test Etme

### Manuel Test (Postman/cURL)

```bash
curl -X POST http://localhost:3006/api/paytr-callback \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "merchant_oid=ORDER1234567890abc" \
  -d "status=success" \
  -d "total_amount=25000" \
  -d "hash=YOUR_CALCULATED_HASH" \
  -d "test_mode=1"
```

### Log Kontrolü

**Vercel Logs:**
1. Vercel Dashboard → Your Project
2. Functions → Logs
3. `paytr-callback` fonksiyonunu seç
4. Real-time logs görüntüle

**Console Logs:**
```
📥 PayTR Callback alındı: { merchant_oid: '...', status: 'success', ... }
✅ Hash doğrulandı
📦 Transaction bulundu: abc-123-def
✅ Ödeme başarılı: ORDER1234567890abc
💰 50 kredi eklendi (Toplam: 60)
👤 Kullanıcı: user-id-123
```

---

## 🔐 Güvenlik Kontrol Listesi

- [ ] Callback URL HTTPS mi? (Production'da zorunlu)
- [ ] Hash doğrulama yapılıyor mu?
- [ ] SUPABASE_SERVICE_KEY environment variable'da mı?
- [ ] PayTR merchant_key ve salt backend'de mi? (frontend'de OLMAMALI)
- [ ] Duplicate payment kontrolü var mı?
- [ ] Transaction status sadece callback'ten mi güncelleniyor?

---

## 🚨 Sık Karşılaşılan Hatalar

### Hata 1: "HASH_ERROR"
**Sebep:** Hash doğrulama başarısız
**Çözüm:** 
- Merchant key ve salt doğru mu kontrol et
- Hash hesaplama algoritması doğru mu kontrol et

### Hata 2: "TRANSACTION_NOT_FOUND"
**Sebep:** merchant_oid ile transaction bulunamadı
**Çözüm:**
- merchant_oid doğru kaydediliyor mu kontrol et
- stripe_payment_id field'ına kaydediliyor mu kontrol et

### Hata 3: Callback çalışmıyor
**Sebep:** PayTR callback URL'e erişemiyor
**Çözüm:**
- URL public mu kontrol et
- CORS ayarları doğru mu kontrol et
- Ngrok kullanıyorsan aktif mi kontrol et

---

## 📞 PayTR Destek

- **Dokümantasyon:** https://www.paytr.com/entegrasyon
- **Test Kartları:** https://dev.paytr.com/test-kartlari
- **Destek:** destek@paytr.com

---

## ✅ Özet

**Callback URL'iniz:**
```
Local: http://localhost:3006/api/paytr-callback (ngrok ile)
Production: https://SIZIN-DOMAIN.vercel.app/api/paytr-callback
```

**Bu URL'i PayTR Panel'de ayarlayın:**
1. PayTR Merchant Panel → Entegrasyon → Bildirim Ayarları
2. Bildirim URL alanına callback URL'inizi girin
3. Kaydet

**Test Edin:**
1. Kredi satın almayı deneyin
2. Test kartı ile ödeme yapın
3. Vercel logs'da callback'i görün
4. Kredilerin eklendiğini kontrol edin

🎉 **Başarılı!**

