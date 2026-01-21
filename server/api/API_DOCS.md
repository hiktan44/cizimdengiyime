# Fasheone Mobile API v1.0

Mobil uygulamalar için kapsamlı REST API dokümantasyonu.

## Base URL
```
Production: https://api.fasheone.com/api/v1
Development: http://localhost:3002/api/v1
```

## Authentication

Tüm korumalı endpointler için Bearer token gereklidir:
```
Authorization: Bearer <access_token>
```

---

## 🔐 Auth Endpoints

### POST /auth/signup
Yeni kullanıcı kaydı

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "fullName": "Ahmet Yılmaz"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  }
}
```

---

### POST /auth/login
Kullanıcı girişi

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "success": true,
  "session": {
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "v1.MjNiNzI4...",
    "expires_at": 1706000000
  },
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "fullName": "Ahmet Yılmaz",
    "avatarUrl": null
  },
  "profile": {
    "credits": 5,
    "subscriptionTier": "free",
    "isAdmin": false
  }
}
```

---

### POST /auth/refresh
Token yenileme

**Request Body:**
```json
{
  "refreshToken": "v1.MjNiNzI4..."
}
```

---

### GET /auth/google
Google OAuth URL alma

**Query Parameters:**
- `redirectTo`: Callback URL (opsiyonel)

---

## 👤 User Endpoints

### GET /user/profile
🔒 Kullanıcı profili

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "fullName": "Ahmet Yılmaz",
  "avatarUrl": null,
  "credits": 45,
  "subscriptionTier": "pro",
  "subscriptionStart": "2024-01-01",
  "subscriptionEnd": "2024-02-01",
  "isAdmin": false,
  "createdAt": "2024-01-01T00:00:00Z"
}
```

---

### PUT /user/profile
🔒 Profil güncelleme

**Request Body:**
```json
{
  "fullName": "Ahmet Yılmaz",
  "avatarUrl": "https://..."
}
```

---

### GET /user/generations
🔒 Üretim geçmişi

**Query Parameters:**
- `limit`: Sayfa başına kayıt (default: 20)
- `offset`: Başlangıç (default: 0)
- `type`: Filtre (opsiyonel)

---

### GET /user/transactions
🔒 İşlem geçmişi

---

## 🎨 Generation Endpoints

### GET /generation/costs
Kredi maliyetleri

**Response:**
```json
{
  "SKETCH_TO_PRODUCT": 1,
  "PRODUCT_TO_MODEL": 1,
  "VIDEO": 3,
  "TECH_SKETCH": 1,
  "PIXSHOP": 1,
  "FOTOMATIK_TRANSFORM": 1,
  "FOTOMATIK_DESCRIBE": 1,
  "ADGENIUS_IMAGE": 1,
  "ADGENIUS_VIDEO": 2,
  "COLLAGE": 2
}
```

---

### POST /generation/sketch-to-product
🔒 Eskiz → Ürün dönüşümü (1 kredi)

**Request:** `multipart/form-data`
- `image`: Eskiz dosyası (required)
- `color`: Renk (optional)

**Response:**
```json
{
  "success": true,
  "image": "data:image/png;base64,...",
  "creditsRemaining": 44
}
```

---

### POST /generation/product-to-model
🔒 Ürün → Canlı Model (1 kredi)

**Request:** `multipart/form-data`
- `image`: Ürün fotoğrafı (required)
- `clothingType`: Kıyafet tipi
- `color`: Ana renk
- `ethnicity`: Etnik köken
- `bodyType`: Vücut tipi (Standart, İnce, Atletik, vb.)
- `pose`: Poz (Ayakta, Yürürken, Otururken)
- `hairColor`: Saç rengi
- `hairStyle`: Saç stili
- `location`: Mekan (Stüdyo, Sokak, Podyum)
- `lighting`: Işıklandırma
- `cameraAngle`: Kamera açısı
- `gender`: Cinsiyet (Male/Female)
- `ageRange`: Yaş grubu (Child/Teen/Adult/Elderly)
- `aspectRatio`: En boy oranı
- `customPrompt`: Özel istek

---

### POST /generation/video
🔒 Görsel → Video (3 kredi)

**Request:** `multipart/form-data`
- `image`: Kaynak görsel
- `prompt`: Video açıklaması
- `duration`: Süre (saniye)
- `aspectRatio`: 16:9 veya 9:16

---

### POST /generation/tech-sketch
🔒 Ürün → Teknik Çizim (1 kredi)

**Request:** `multipart/form-data`
- `image`: Ürün fotoğrafı
- `style`: blackwhite veya colored

---

### POST /generation/pixshop/edit
🔒 Fotoğraf düzenleme (1 kredi)

**Request:** `multipart/form-data`
- `image`: Düzenlenecek görsel
- `prompt`: Düzenleme talimatı
- `hotspotX`: Odak noktası X
- `hotspotY`: Odak noktası Y

---

### POST /generation/pixshop/remove-bg
🔒 Arka plan kaldırma (1 kredi)

**Request:** `multipart/form-data`
- `image`: Görsel

---

### POST /generation/fotomatik/transform
🔒 Görüntü dönüştürme (1 kredi)

**Request:** `multipart/form-data`
- `image`: Kaynak görsel
- `prompt`: Dönüşüm talimatı
- `aspectRatio`: En boy oranı

---

### POST /generation/fotomatik/describe
🔒 Prompt üretme (1 kredi)

**Request:** `multipart/form-data`
- `image`: Analiz edilecek görsel

**Response:**
```json
{
  "success": true,
  "prompts": {
    "tr": "Türkçe açıklama...",
    "en": "English description...",
    "midjourney": "MJ prompt --ar 16:9...",
    "stableDiffusion": {
      "positive": "...",
      "negative": "...",
      "params": "..."
    },
    "tips": ["Öneri 1", "Öneri 2", "Öneri 3"]
  }
}
```

---

### POST /generation/adgenius/analyze
🔒 Ürün analizi (ÜCRETSİZ)

**Request:** `multipart/form-data`
- `image`: Ürün görseli

**Response:**
```json
{
  "success": true,
  "analysis": {
    "productType": "Elbise",
    "name": "Yazlık Maxi Elbise",
    "description": "...",
    "features": ["Çiçek deseni", "V yaka"],
    "targetAudience": "25-45 yaş kadın",
    "suggestedStyles": ["Lifestyle", "Beach"],
    "colors": ["Beyaz", "Mavi"]
  }
}
```

---

### POST /generation/adgenius/image
🔒 Reklam görseli oluşturma (1 kredi)

**Request:** `multipart/form-data`
- `image`: Ürün görseli
- `prompt`: Reklam açıklaması
- `style`: Stil
- `aspectRatio`: En boy oranı

---

### POST /generation/collage
🔒 Kolaj oluşturma (2 kredi)

**Request:** `multipart/form-data`
- `images`: 2-6 görsel (array)
- `prompt`: Kompozisyon talimatı
- `aspectRatio`: En boy oranı

---

## 💳 Payment Endpoints

### GET /payment/packages
Kredi paketleri

**Response:**
```json
{
  "packages": [
    { "id": "small", "credits": 50, "priceTL": 250 },
    { "id": "medium", "credits": 100, "priceTL": 500 },
    { "id": "large", "credits": 200, "priceTL": 1000 }
  ],
  "subscriptions": [
    { "id": "starter", "name": "Starter", "credits": 100, "priceTL": 500, "monthly": true },
    { "id": "pro", "name": "Pro", "credits": 500, "priceTL": 2250, "monthly": true },
    { "id": "premium", "name": "Premium", "credits": 1000, "priceTL": 4000, "monthly": true }
  ]
}
```

---

### GET /payment/exchange-rate
Güncel döviz kuru

**Response:**
```json
{
  "currency": "EUR",
  "rate": 35.42
}
```

---

### POST /payment/create-intent
🔒 Ödeme başlatma

**Request Body:**
```json
{
  "packageId": "medium",
  "amountTL": 500,
  "credits": 100
}
```

**Response:**
```json
{
  "clientSecret": "pi_..._secret_...",
  "amountEUR": "14.12",
  "rate": 35.42
}
```

---

## 👑 Admin Endpoints

### GET /admin/users
🔒👑 Tüm kullanıcılar

**Query Parameters:**
- `limit`: Sayfa başına (default: 50)
- `offset`: Başlangıç
- `search`: E-posta veya isim araması

---

### GET /admin/transactions
🔒👑 Tüm işlemler

---

### GET /admin/generations
🔒👑 Tüm üretimler

**Query Parameters:**
- `type`: Filtre (opsiyonel)

---

### PUT /admin/users/:userId/credits
🔒👑 Kullanıcı kredisi güncelleme

**Request Body:**
```json
{
  "credits": 100,
  "reason": "Bonus kredi"
}
```

---

### GET /admin/stats
🔒👑 Dashboard istatistikleri

**Response:**
```json
{
  "totalUsers": 1250,
  "todayGenerations": 456,
  "monthlyRevenue": 45000,
  "generationBreakdown": {
    "product_to_model": 180,
    "sketch_to_product": 120,
    "video": 45
  }
}
```

---

## Error Responses

Tüm hatalar aşağıdaki formatta döner:

```json
{
  "error": "Error message description"
}
```

### HTTP Status Codes
- `200` - Başarılı
- `400` - Geçersiz istek
- `401` - Yetkilendirme hatası
- `403` - Erişim reddedildi
- `500` - Sunucu hatası

---

## Rate Limiting

- Anonim: 60 istek/dakika
- Authenticated: 300 istek/dakika
- Admin: 1000 istek/dakika

---

## Mobile SDK Önerileri

### React Native
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.fasheone.com/api/v1',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Token ayarla
api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
```

### Flutter
```dart
final dio = Dio(BaseOptions(
  baseUrl: 'https://api.fasheone.com/api/v1',
  headers: {'Authorization': 'Bearer $token'},
));
```

---

## Changelog

### v1.0.0 (2024-01-21)
- İlk sürüm
- Auth, User, Generation, Payment, Admin endpointleri
- Stripe ödeme entegrasyonu
- Supabase auth entegrasyonu
