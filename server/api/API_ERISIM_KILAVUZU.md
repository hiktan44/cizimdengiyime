# 🔐 Fasheone API - Erişim Kılavuzu

Bu doküman, mobil uygulama geliştiricilerinin Fasheone API'sine nasıl erişebileceğini açıklar.

---

## 📋 İçindekiler
1. [Hesap Oluşturma](#1-hesap-oluşturma)
2. [Token Alma](#2-token-alma)
3. [API Kullanımı](#3-api-kullanımı)
4. [Token Yenileme](#4-token-yenileme)
5. [Kredi Yönetimi](#5-kredi-yönetimi)

---

## 1. Hesap Oluşturma

### Web Üzerinden
1. [fasheone.com](https://fasheone.com) adresine gidin
2. "Kayıt Ol" butonuna tıklayın
3. Email ve şifrenizi girin
4. Hesabınız oluşturulur ve **5 ücretsiz kredi** verilir

### API Üzerinden
```bash
curl -X POST https://api.fasheone.com/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "developer@example.com",
    "password": "guclu_sifre_123",
    "fullName": "Geliştirici Adı"
  }'
```

**Yanıt:**
```json
{
  "success": true,
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "developer@example.com"
  }
}
```

---

## 2. Token Alma

Kayıt olduktan sonra giriş yaparak **access_token** alın:

```bash
curl -X POST https://api.fasheone.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "developer@example.com",
    "password": "guclu_sifre_123"
  }'
```

**Yanıt:**
```json
{
  "success": true,
  "session": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "v1.MjNiNzI4ZDktYzU5...",
    "expires_at": 1706000000
  },
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "developer@example.com",
    "fullName": "Geliştirici Adı"
  },
  "profile": {
    "credits": 5,
    "subscriptionTier": "free",
    "isAdmin": false
  }
}
```

### ⚠️ Önemli Notlar:
- `access_token` → API isteklerinde kullanılır, **1 saat geçerli**
- `refresh_token` → Token yenilemede kullanılır, **30 gün geçerli**
- Token'ları güvenli bir şekilde saklayın (Keychain, SecureStorage, vb.)

---

## 3. API Kullanımı

Aldığınız `access_token`'ı her istekte `Authorization` header'ına ekleyin:

```bash
curl -X GET https://api.fasheone.com/api/v1/user/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Örnek: Canlı Model Oluşturma

```bash
curl -X POST https://api.fasheone.com/api/v1/generation/product-to-model \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "image=@urun_fotografi.jpg" \
  -F "gender=Female" \
  -F "ethnicity=Türk" \
  -F "bodyType=Standart" \
  -F "location=Stüdyo"
```

**Yanıt:**
```json
{
  "success": true,
  "image": "data:image/png;base64,iVBORw0KGgo...",
  "creditsRemaining": 4
}
```

---

## 4. Token Yenileme

Access token süresi dolduğunda (1 saat), refresh token ile yenileyin:

```bash
curl -X POST https://api.fasheone.com/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "v1.MjNiNzI4ZDktYzU5..."
  }'
```

**Yanıt:**
```json
{
  "success": true,
  "session": {
    "access_token": "yeni_eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "yeni_v1.MjNiNzI4...",
    "expires_at": 1706003600
  }
}
```

### Otomatik Token Yenileme (Önerilen)

```javascript
// React Native / JavaScript örneği
api.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      const { data } = await api.post('/auth/refresh', { refreshToken });
      
      await AsyncStorage.setItem('accessToken', data.session.access_token);
      await AsyncStorage.setItem('refreshToken', data.session.refresh_token);
      
      // Başarısız isteği yeniden dene
      error.config.headers.Authorization = `Bearer ${data.session.access_token}`;
      return api.request(error.config);
    }
    return Promise.reject(error);
  }
);
```

---

## 5. Kredi Yönetimi

### Kredi Maliyetleri

| İşlem | Maliyet |
|-------|---------|
| Eskiz → Ürün | 1 kredi |
| Ürün → Canlı Model | 1 kredi |
| Video Oluşturma | 3 kredi |
| Teknik Çizim | 1 kredi |
| Pixshop Düzenleme | 1 kredi |
| Fotomatik | 1 kredi |
| AdGenius Görsel | 1 kredi |
| Kolaj | 2 kredi |

### Kredi Satın Alma

Web üzerinden veya API üzerinden kredi satın alabilirsiniz:

```bash
# Paketleri görüntüle
curl https://api.fasheone.com/api/v1/payment/packages

# Ödeme başlat
curl -X POST https://api.fasheone.com/api/v1/payment/create-intent \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"packageId": "medium", "amountTL": 500, "credits": 100}'
```

---

## 📱 SDK Entegrasyonu

### React Native
```javascript
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({
  baseURL: 'https://api.fasheone.com/api/v1',
  timeout: 60000
});

api.interceptors.request.use(async config => {
  const token = await AsyncStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
```

### Flutter
```dart
import 'package:dio/dio.dart';

class FasheoneClient {
  final Dio dio = Dio(BaseOptions(
    baseUrl: 'https://api.fasheone.com/api/v1',
    connectTimeout: Duration(seconds: 60),
  ));
  
  void setToken(String token) {
    dio.options.headers['Authorization'] = 'Bearer $token';
  }
}
```

---

## ❓ Sık Sorulan Sorular

### Token sürem doldu, ne yapmalıyım?
Refresh token ile yeni access token alın. Refresh token da dolduysa kullanıcıyı tekrar giriş yaptırın.

### Kredim bitti, nasıl devam edebilirim?
fasheone.com üzerinden veya API üzerinden kredi paketi satın alın.

### API rate limit var mı?
Evet, dakikada 300 istek (authenticated kullanıcılar için).

### Test hesabı alabilir miyim?
Kayıt olduğunuzda 5 ücretsiz kredi ile başlarsınız. Bu kredilerle API'yi test edebilirsiniz.

---

## 📞 Destek

- **Email:** support@fasheone.com
- **Dokümantasyon:** https://api.fasheone.com/api/v1/docs
- **Web:** https://fasheone.com

---

**Fasheone API v1.0** | © 2024 Fasheone
