# 🔐 PayTR Entegrasyon Rehberi

## ⚠️ ÖNEMLİ: Mevcut Sorunlar

### 1. Sahte Ödeme Onayı Sorunu
**Sorun:** Modal içinde herhangi bir yere tıklandığında "ödeme başarılı" mesajı gösteriliyor.

**Neden:** `setTimeout` ile 5 saniye sonra otomatik başarılı sayılıyor. Bu GÜVENLİ DEĞİL!

**Çözüm:** PayTR callback sistemi kurulmalı.

---

## 🎯 Doğru PayTR Entegrasyonu

### PayTR İş Akışı

```
1. Kullanıcı "Kredi Al" butonuna tıklar
2. Frontend → Backend: Ödeme isteği gönderir
3. Backend → PayTR API: Token ister
4. PayTR → Backend: Token döner
5. Backend → Frontend: iframe URL'i döner
6. Frontend: PayTR iframe'ini gösterir
7. Kullanıcı: Kart bilgilerini PayTR'ye girer
8. PayTR: Ödemeyi işler
9. PayTR → Backend Callback URL: Sonucu bildirir ⭐ (ÖNEMLİ)
10. Backend: Transaction'ı günceller, kredi ekler
11. PayTR → Kullanıcı: Success/Fail URL'ine yönlendirir
12. Frontend: Sonucu gösterir
```

### Gerekli URL'ler

#### 1. **Callback URL (merchant_ok_url)**
- PayTR'nin **backend**'inize POST isteği göndereceği URL
- Kullanıcı görmez, sadece PayTR ile backend arasında
- Örnek: `https://yourdomain.com/api/paytr/callback`
- **Bu URL mutlaka PUBLIC olmalı** (PayTR erişebilmeli)

#### 2. **Success URL (merchant_ok_url - kullanıcı yönlendirme)**
- Ödeme başarılı olduğunda kullanıcının yönlendirileceği sayfa
- Örnek: `https://yourdomain.com/payment-success`

#### 3. **Fail URL (merchant_fail_url)**
- Ödeme başarısız olduğunda kullanıcının yönlendirileceği sayfa
- Örnek: `https://yourdomain.com/payment-fail`

---

## 🔧 Backend Callback Endpoint (Gerekli!)

### Neden Backend'de Olmalı?

1. **Güvenlik:** Frontend'den gelen her istek manipüle edilebilir
2. **Hash Doğrulama:** PayTR'nin gönderdiği hash'i doğrulamak gerekir
3. **Kredi Ekleme:** Sadece doğrulanmış ödemeler için kredi eklenmeli

### Örnek Backend Endpoint (Node.js/Express)

```javascript
// api/paytr/callback.js
import crypto from 'crypto';
import { supabase } from './supabase';

const PAYTR_MERCHANT_KEY = process.env.PAYTR_MERCHANT_KEY;
const PAYTR_MERCHANT_SALT = process.env.PAYTR_MERCHANT_SALT;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      merchant_oid,
      status,
      total_amount,
      hash,
      failed_reason_code,
      failed_reason_msg,
      test_mode,
      payment_type,
      currency,
      payment_amount,
    } = req.body;

    // 1. Hash Doğrulama (ÇOK ÖNEMLİ!)
    const hashStr = merchant_oid + PAYTR_MERCHANT_SALT + status + total_amount;
    const calculatedHash = crypto
      .createHmac('sha256', PAYTR_MERCHANT_KEY)
      .update(hashStr)
      .digest('base64');

    if (hash !== calculatedHash) {
      console.error('❌ Hash doğrulama hatası!');
      return res.status(400).send('HASH_ERROR');
    }

    // 2. Transaction'ı bul
    const { data: transaction, error: txError } = await supabase
      .from('transactions')
      .select('*')
      .eq('stripe_payment_id', merchant_oid) // merchant_oid'yi stripe_payment_id'ye kaydettik
      .single();

    if (txError || !transaction) {
      console.error('❌ Transaction bulunamadı:', merchant_oid);
      return res.status(404).send('TRANSACTION_NOT_FOUND');
    }

    // 3. Ödeme Durumuna Göre İşlem Yap
    if (status === 'success') {
      // ✅ BAŞARILI ÖDEME
      
      // Transaction'ı güncelle
      await supabase
        .from('transactions')
        .update({ status: 'completed' })
        .eq('id', transaction.id);

      // Kullanıcıya kredi ekle
      const { data: profile } = await supabase
        .from('profiles')
        .select('credits')
        .eq('id', transaction.user_id)
        .single();

      await supabase
        .from('profiles')
        .update({ credits: (profile?.credits || 0) + transaction.credits })
        .eq('id', transaction.user_id);

      console.log(`✅ Ödeme başarılı: ${merchant_oid}, ${transaction.credits} kredi eklendi`);
      
      return res.status(200).send('OK');
      
    } else {
      // ❌ BAŞARISIZ ÖDEME
      
      await supabase
        .from('transactions')
        .update({ 
          status: 'failed',
          // Failed reason'ı da kaydedebilirsiniz
        })
        .eq('id', transaction.id);

      console.log(`❌ Ödeme başarısız: ${merchant_oid}, Sebep: ${failed_reason_msg}`);
      
      return res.status(200).send('OK');
    }

  } catch (error) {
    console.error('Callback error:', error);
    return res.status(500).send('SERVER_ERROR');
  }
}
```

---

## 📝 Frontend Güncellemeleri

### BuyCreditsModal.tsx Düzeltmeleri

```typescript
// ❌ YANLIŞ (Mevcut)
setTimeout(async () => {
  await updateTransactionStatus(transactionResult.transactionId!, 'completed', orderId);
  await addCreditsToUser(userId, pkg.credits);
  alert('Test ödeme başarılı!');
}, 5000);

// ✅ DOĞRU
// Callback URL'i backend'de ayarla
const paymentResult = await createPaymentToken({
  userId,
  userEmail,
  userName,
  amount: pkg.price,
  credits: pkg.credits,
  orderId,
  // Kullanıcı yönlendirme URL'leri
  successUrl: `${window.location.origin}/payment-success?order=${orderId}`,
  failUrl: `${window.location.origin}/payment-fail?order=${orderId}`,
});

// iframe'i göster
setPaymentIframe(paymentResult.iframeUrl);

// Success/Fail sayfalarında transaction durumunu kontrol et
// Kullanıcı yönlendirildiğinde otomatik yenilenecek
```

### Success/Fail Sayfaları Oluştur

```typescript
// pages/PaymentSuccess.tsx
export const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order');
  const navigate = useNavigate();
  
  useEffect(() => {
    // Transaction durumunu kontrol et
    const checkStatus = async () => {
      const { data } = await supabase
        .from('transactions')
        .select('status, credits')
        .eq('stripe_payment_id', orderId)
        .single();
      
      if (data?.status === 'completed') {
        // Başarılı mesajı göster
        setTimeout(() => navigate('/dashboard'), 3000);
      }
    };
    
    checkStatus();
  }, [orderId]);
  
  return (
    <div className="success-page">
      <h1>✅ Ödeme Başarılı!</h1>
      <p>Kredileriniz hesabınıza eklendi.</p>
      <p>Dashboard'a yönlendiriliyorsunuz...</p>
    </div>
  );
};
```

---

## 🚀 Deployment Gereksinimleri

### 1. Backend Endpoint Deploy Et

**Vercel Functions:**
```javascript
// api/paytr-callback.js
export default async function handler(req, res) {
  // Yukarıdaki callback kodu
}
```

**URL:** `https://yourdomain.vercel.app/api/paytr-callback`

### 2. PayTR Merchant Panel'de Callback URL'i Ayarla

1. PayTR Merchant Panel'e giriş yap
2. Entegrasyon Ayarları → Bildirim URL'i
3. Callback URL'inizi girin: `https://yourdomain.vercel.app/api/paytr-callback`
4. Kaydet

### 3. Environment Variables

```env
# .env.local
VITE_PAYTR_MERCHANT_ID=your_merchant_id
VITE_PAYTR_MERCHANT_KEY=your_merchant_key
VITE_PAYTR_MERCHANT_SALT=your_merchant_salt

# Backend için
PAYTR_MERCHANT_ID=your_merchant_id
PAYTR_MERCHANT_KEY=your_merchant_key
PAYTR_MERCHANT_SALT=your_merchant_salt
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_key  # RLS bypass için
```

---

## 🧪 Test Senaryoları

### Test Kartları

```
✅ Başarılı:
Kart: 4355 0843 5508 4358
Tarih: 12/26
CVV: 000

❌ Yetersiz Bakiye:
Kart: 4355 0843 5508 4333
Tarih: 12/26
CVV: 000
```

### Test Adımları

1. ✅ Kredi satın al butonuna tıkla
2. ✅ Paket seç
3. ✅ PayTR iframe açılsın
4. ✅ Test kartı ile ödeme yap
5. ✅ Backend callback çalışsın (log kontrol)
6. ✅ Transaction 'completed' olsun
7. ✅ Kredi eklensin
8. ✅ Success sayfasına yönlensin
9. ✅ Dashboard'da kredi güncellenmiş olsun

---

## 📊 Database Schema Güncellemeleri

```sql
-- transactions tablosuna payment_method ekle
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'card';

-- merchant_oid için index (hızlı arama)
CREATE INDEX IF NOT EXISTS idx_transactions_merchant_oid 
ON transactions(stripe_payment_id);

-- RLS policies (zaten var ama kontrol edin)
-- Users can insert own transactions
CREATE POLICY "Users can insert own transactions" ON transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

---

## 🔒 Güvenlik Kontrol Listesi

- [ ] Hash doğrulama yapılıyor mu?
- [ ] Callback endpoint public mu?
- [ ] Merchant key/salt backend'de mi? (frontend'de OLMAMALI)
- [ ] Transaction status sadece backend'den mi güncelleniyor?
- [ ] Kredi ekleme sadece callback'ten mi yapılıyor?
- [ ] Duplicate payment kontrolü var mı?
- [ ] RLS policies doğru mu?

---

## 📞 PayTR Destek

- Dokümantasyon: https://www.paytr.com/entegrasyon
- Test Merchant: Test modunda çalışırken gerçek ödeme alınmaz
- Canlı Geçiş: Test başarılı olduktan sonra `test_mode: '0'` yapın

---

## ✅ Yapılacaklar (Öncelik Sırası)

1. **Backend callback endpoint oluştur** (Vercel Functions)
2. **Hash doğrulama ekle**
3. **Transaction güncelleme ve kredi ekleme backend'e taşı**
4. **Success/Fail sayfaları oluştur**
5. **setTimeout() kodunu kaldır**
6. **PayTR panel'de callback URL'i ayarla**
7. **Test et**
8. **Production'a geç**

---

## 🎬 Sonuç

Mevcut sistem **GÜVENLİ DEĞİL** çünkü:
- ❌ Frontend'den kredi ekleniyor
- ❌ Gerçek ödeme doğrulaması yok
- ❌ Herhangi bir tıklama ödemeyi başarılı sayıyor

Doğru sistem:
- ✅ PayTR → Backend callback
- ✅ Backend hash doğrulaması
- ✅ Backend kredi ekleme
- ✅ Frontend sadece sonucu gösterir

**Acil olarak backend callback endpoint'i kurulmalı!**

