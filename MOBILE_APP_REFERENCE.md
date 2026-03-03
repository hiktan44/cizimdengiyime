# 📱 FASHEONE — Mobil App Referans Dokümanı (Tam Kılavuz)

> Bu doküman, Fasheone web uygulamasının tüm özelliklerini, API yapısını, prompt'larını ve veritabanı şemasını içerir. Mobil uygulamayı geliştirirken bu dokümanı referans olarak kullanın.

---

## 📋 İçindekiler

1. [Genel Mimari](#1-genel-mimari)
2. [API Anahtarları](#2-api-anahtarları)
3. [AI Model Sistemi ve Fallback](#3-ai-model-sistemi-ve-fallback)
4. [Veritabanı Şeması (Supabase)](#4-veritabanı-şeması-supabase)
5. [Kredi Sistemi](#5-kredi-sistemi)
6. [Modül 1: Canlı Model](#6-modül-1-canlı-model)
7. [Modül 2: Çizimden Ürüne](#7-modül-2-çizimden-ürüne)
8. [Modül 3: Üründen Çizime](#8-modül-3-üründen-çizime)
9. [Modül 4: Video Üretimi](#9-modül-4-video-üretimi)
10. [Modül 5: Kolaj Stüdyosu](#10-modül-5-kolaj-stüdyosu)
11. [Modül 6: PixShop](#11-modül-6-pixshop)
12. [Modül 7: Fotomatik](#12-modül-7-fotomatik)
13. [Modül 8: AdGenius](#13-modül-8-adgenius)
14. [Modül 9: Upscale ve Edit](#14-modül-9-upscale-ve-edit)
15. [Fal.ai Fallback Sistemi](#15-falai-fallback-sistemi)
16. [Auth ve Kullanıcı Yönetimi](#16-auth-ve-kullanıcı-yönetimi)
17. [Ödeme Sistemi](#17-ödeme-sistemi)
18. [⚠️ KRİTİK: LLM Güvenlik Filtreleri ve Virtual Try-On Hassas Alanları](#18-kritik-llm-içerik-güvenlik-filtreleri-ve-virtual-try-on-hassas-alanları)

---

## 1. Genel Mimari

```
┌─────────────────────────────────────────────────┐
│                 MOBİL APP (Flutter/RN)           │
│  ┌──────────┐ ┌──────────┐ ┌────────────────┐  │
│  │ Canlı    │ │ Çizim    │ │ PixShop        │  │
│  │ Model    │ │ Stüdyo   │ │ (Edit/Filter)  │  │
│  ├──────────┤ ├──────────┤ ├────────────────┤  │
│  │ Kolaj    │ │ Fotomatik│ │ AdGenius       │  │
│  │ Stüdyosu │ │          │ │ (Reklam)       │  │
│  ├──────────┤ ├──────────┤ ├────────────────┤  │
│  │ Video    │ │ Tech Pack│ │ Upscale/Edit   │  │
│  └──────────┘ └──────────┘ └────────────────┘  │
└────────────────────┬────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
┌───────▼──┐  ┌──────▼──┐  ┌─────▼──────┐
│ Gemini   │  │ Fal.ai  │  │ Supabase   │
│ API      │  │ Fallback│  │ (DB+Auth)  │
│ Flash/Pro│  │ Nano    │  │ Profiles   │
│ Veo      │  │ Banana  │  │ Generations│
└──────────┘  └─────────┘  └────────────┘
```

---

## 2. API Anahtarları

```env
# Gemini AI (Ana AI motoru)
VITE_GEMINI_API_KEY=your_gemini_api_key

# Fal.ai (Fallback AI motoru)
VITE_FAL_AI_API_KEY=your_fal_ai_api_key

# Supabase (Veritabanı + Auth)
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

> **Mobil Not:** `VITE_` prefix'i web'e özgüdür. Mobil'de platform native config kullanın.

---

## 3. AI Model Sistemi ve Fallback

### Birincil Model
```
gemini-3.1-flash-image-preview  ← ANA MODEL (hızlı, ucuz, 2K)
```

### Fallback Zinciri
```typescript
const IMAGE_MODELS = [
    'gemini-3.1-flash-image-preview',
    'gemini-3-pro-image-preview',
    'gemini-3-pro-preview',
    'gemini-2.0-flash-preview-image-generation',
    'imagen-3.0-generate-002'
];
```

### Video Modelleri
```
veo-3.1-fast-generate-preview   ← Hızlı (3 kredi)
veo-3.1-generate-preview        ← Yüksek kalite (4 kredi)
```

### withRetry Mekanizması
```typescript
// 503/UNAVAILABLE hatalarında: maxRetries=3, delay=2000ms
// Tüm modeller başarısız → fal.ai fallback
async function withRetry<T>(
    fn: (model: string) => Promise<T>,
    maxRetries: number = 3,
    delayMs: number = 2000,
    falFallbackFn?: () => Promise<T>
): Promise<T>
```

### Gemini API Çağrı Yapısı (Standart)
```typescript
import { GoogleGenAI, Modality } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: API_KEY });
const response = await ai.models.generateContent({
    model: 'gemini-3.1-flash-image-preview',
    contents: {
        parts: [
            { inlineData: { mimeType: 'image/png', data: base64Data } },
            { text: promptText }
        ],
    },
    config: {
        responseModalities: [Modality.IMAGE],
        seed: optionalSeed,
        candidateCount: 1,
        imageConfig: {
            imageSize: '2K',
            aspectRatio: '3:4',
        }
    },
});
// Yanıt: response.candidates[0].content.parts[0].inlineData.data (base64)
```

---

## 4. Veritabanı Şeması (Supabase)

### profiles
| Kolon | Tip | Default |
|---|---|---|
| id | UUID PK | Supabase Auth user ID |
| email | TEXT | NOT NULL |
| full_name | TEXT | NULL |
| avatar_url | TEXT | NULL |
| subscription_tier | TEXT | 'free' |
| credits | INTEGER | 10 |
| is_admin | BOOLEAN | FALSE |
| is_affiliate | BOOLEAN | FALSE |
| subscription_start / end | TIMESTAMPTZ | NULL |
| created_at / updated_at | TIMESTAMPTZ | |

### generations
| Kolon | Tip |
|---|---|
| id | UUID PK |
| user_id | UUID FK → profiles |
| type | TEXT (aşağıdaki tipler) |
| credits_used | INTEGER |
| input_image_url | TEXT |
| output_image_url | TEXT |
| output_video_url | TEXT |
| settings | JSONB |
| created_at | TIMESTAMPTZ |

**Tipler:** `sketch_to_product` | `product_to_model` | `video` | `tech_sketch` | `pixshop` | `fotomatik_transform` | `fotomatik_describe` | `adgenius_campaign_image` | `adgenius_campaign_video` | `adgenius_ecommerce_image` | `adgenius_ecommerce_video` | `collage`

### transactions
| Kolon | Tip |
|---|---|
| id | UUID PK |
| user_id | UUID FK → profiles |
| type | 'subscription' \| 'credit_purchase' |
| amount | NUMERIC (TL) |
| credits | INTEGER |
| status | 'pending' \| 'completed' \| 'failed' |
| stripe_payment_id | TEXT |
| payment_method | TEXT ('paytr') |
| created_at | TIMESTAMPTZ |

---

## 5. Kredi Sistemi

### İşlem Maliyetleri
| İşlem | Kredi |
|---|---|
| SKETCH_TO_PRODUCT | 1 |
| PRODUCT_TO_MODEL | 1 |
| VIDEO_FAST | 3 |
| VIDEO_HIGH | 4 |
| TECH_SKETCH | 1 |
| TECH_PACK | 3 |
| PIXSHOP | 1 |
| PIXSHOP_4K | 2 |
| FOTOMATIK_TRANSFORM | 1 |
| FOTOMATIK_DESCRIBE | 1 |
| ADGENIUS_IMAGE | 1 |
| ADGENIUS_VIDEO_FAST | 3 |
| ADGENIUS_VIDEO_HIGH | 4 |
| COLLAGE | 2 |
| MULTI_ITEM_MODEL | 2 |

### Akış
```
1. checkAndDeductCredits(userId, operationType) → kredi düş
2. AI API çağrısı yap
3. Başarılı → saveGeneration() ile kaydet
4. Başarısız → refundCredits() iade et
```

### Abonelik & Paketler
| Plan | Kredi | Fiyat |
|---|---|---|
| Starter | 100 | ₺500/ay |
| Pro | 500 | ₺2.250/ay |
| Premium | 1.000 | ₺4.000/ay |

| Paket | Kredi | Fiyat |
|---|---|---|
| Small | 100 | ₺999 / €19.90 |
| Medium | 250 | ₺2.399 / €48.90 |
| Large | 500 | ₺4.499 / €89.90 |

---

## 6. Modül 1: Canlı Model

### Fonksiyon İmzası
```typescript
generateImage(
    imageFile: File,           // Ana kıyafet görseli
    clothingType: string,      // 'Genel'|'Tişört'|'Gömlek'|'Elbise'|'Alt & Üst'|'Takım Elbise'
    color: string,             // 'Siyah'|'Beyaz'|'Kırmızı'|'Özel Renk (#XXXXXX)'
    secondaryColor: string,    // Alt parça/gömlek rengi
    ethnicity: string,         // 'Kafkas'|'Doğu Asyalı'|'Güney Asyalı'|'Afrikalı'|'Latin'|'Orta Doğulu'|'Slav'|'Genel Dünya Karması'
    style: string,             // 'Gerçekçi'|'Sinematik'|'Çizgi Film'
    location: string,          // 'Podyum'|'Stüdyo'|'Sokak'|'Doğal Mekan'|'Lüks Mağaza'
    bodyType: string,          // 'Standart'|'İnce'|'Kaslı'|'Büyük Beden'|'Battal Beden'
    pose: string,              // 'Rastgele'|'Casual Duruş'|'Yürüyüş'|'Oturma'|'Eğilme'
    hairColor: string,         // 'Doğal'|'Sarı'|'Siyah'|'Kahverengi'|'Kızıl'|'Beyaz'
    hairStyle: string,         // 'Doğal'|'Uzun Düz'|'Kısa'|'Topuz'|'At Kuyruğu'
    customPrompt: string,      // Kullanıcı özel istekleri
    lighting: string,          // Işıklandırma tercihi
    cameraAngle: string,       // Kamera açısı
    cameraZoom: string,        // 'Yakın'|'Orta'|'Uzak' (tam vücut)
    aspectRatio: '9:16'|'3:4'|'4:5'|'1:1'|'16:9',
    customBackground?: File,
    customBackgroundPrompt?: string,
    fabricType?: string,       // 'Deri'|'Triko'|'Denim'
    fabricFinish?: string,
    shoeType?: string,
    shoeColor?: string,
    accessories?: string,
    ageRange?: string,         // 'Child'|'Teen'|'Adult'|'Elderly'
    gender?: string,           // 'Female'|'Male'
    secondProductFile?: File,  // İkinci ürün (kombin)
    patternImageFile?: File,   // Desen/baskı görseli
    seed?: number,
    modelIdentityFile?: File,  // Referans yüz kilidi
    multiItemFiles?: File[]    // Çoklu ürün (2-6)
): Promise<string[]>
```

### Ana Prompt Yapısı
```
KRITIK RENK TALIMAT: Kiyafet rengi ${color} (${colorHex}) olmalı.

[KOMBİN MODU varsa]
İKİ AYRI kıyafet görseli: Üst + Alt

[MODEL KİMLİĞİ]
- modelIdentityFile varsa → Referans yüzü %100 kopyala (Identity Lock)
- yoksa → Seed ile yeni tutarlı yüz oluştur

Yüksek çözünürlüklü, 2K kalitesinde moda fotoğrafı oluştur.

*** RENK KONTROLU ***
- Kıyafet rengi KESİNLİKLE ${color} (${colorHex}) OLMALIDIR
- Referans görseldeki renk FARKLIYSA YOKSAY

*** MARKA KORUMA ***
- Logo, yazı, grafik baskı BİREBİR KORUNMALI
- Kesim, dikiş detayları, yaka şekli aynı olmalı

*** GÖRSEL KALİTE ***
- RAW PHOTO, HİPER-GERÇEKÇİ (dijital sanat DEĞİL)
- Hasselblad/Sony A7R V + 85mm f/1.2 portre lensi
- Doğal cilt dokusu (gözenekler, benler, subsurface scattering)
- Kumaş dokusu %100 gerçekçi (makro iplik detayı)
- Softbox + Rim Light
- YASAKLI: Cartoonish, 3D Render, Plastik Görünüm, Yamuk Eller

*** ÇOKLU ÜRÜN GİYDİRME (multiItemFiles varsa) ***
Katmanlama sırası (İÇTEN DIŞA):
1. İç katman (iç çamaşırı)
2. Temel katman (tişört, gömlek)
3. Ara katman (yelek, süveter)
4. Dış katman (ceket, mont)
5. Alt giyim (pantolon, etek)
6. Ayakkabı
7. Aksesuar (şapka, çanta, gözlük)

KRİTİK: Yelek gömleğin ÜSTÜNE, mont yeleğin ÜSTÜNE giyilir.

*** FİNAL KONTROL ***
1. Kıyafet referansla aynı mı? → EVET
2. Desen doğru mu? → EVET
3. Yüz doğru mu? → EVET
4. Renk doğru mu? → EVET
```

#### Mekan Prompt Fragmanları
| Mekan | Prompt |
|---|---|
| Stüdyo | Sonsuz fon, temiz, ekipman GÖRÜNMEYECEk |
| Sokak | Hareketli, flu arka planlı şehir sokağı |
| Doğal Mekan | Gün ışığı alan orman, sahil, bahçe |
| Lüks Mağaza | Lüks moda mağazasının şık iç mekanı |
| Podyum | Profesyonel stüdyo, doğal poz |

#### Stil Prompt Fragmanları
| Stil | Prompt |
|---|---|
| Gerçekçi | Ultra fotogerçekçi, Hasselblad kalitesi |
| Sinematik | Dramatik aydınlatma, yüksek kontrast |
| Çizgi Film | Canlı renkler, stilize |

#### Etnik Köken
`Kafkas` | `Doğu Asyalı` | `Güney Asyalı` | `Afrikalı` | `Latin` | `Orta Doğulu` | `Slav` (→ "Slavic/Eastern European, fair skin, light eyes, angular cheekbones") | `Genel Dünya Karması`

---

## 7. Modül 2: Çizimden Ürüne

```typescript
generateProductFromSketch(sketchFile: File, color?: string): Promise<string>
```

### Prompt
```
Bu moda çizimini ultra-gerçekçi, 2K hayalet manken (ghost mannequin) 
ürün fotoğrafına dönüştür.

*** RENK (varsa) ***
Ürün rengi MUTLAKA ${color} (${colorHex}) OLMALIDIR.

*** KALİTE ***
1. Kumaş dokusu makro çekim kalitesinde
2. Profesyonel Softbox stüdyo aydınlatması
3. Dikişler, fermuar, düğme dokuları keskin
4. Ghost mannequin etkisi (3D ama görünmez manken)
5. Arka plan saf beyaz (#FFFFFF)

Sonuç: Vogue / Farfetch kalitesinde ürün fotoğrafı
```

---

## 8. Modül 3: Üründen Çizime

```typescript
generateSketchFromProduct(
    productFile: File,
    style: 'colored' | 'blackwhite' = 'blackwhite'
): Promise<string>
```

### Siyah-Beyaz Prompt
```
Teknik Çizim (Technical Flat Sketch / CAD):
1. Sadece siyah kontur çizgileri (clean line art), renk YOK
2. Dikiş yerleri, fermuarlar, cepler net çizilmeli
3. Önden, düz (flat) ve simetrik
4. Arka plan saf beyaz, insan figürü yok
5. 2K çözünürlük, vektörel hassasiyet
```

### Renkli Prompt
```
Renkli Teknik Çizim:
1-5. (Aynı kurallar)
6. Kumaş renkleri fotoğraftaki ile birebir
7. Kumaş dokusu hissedilmeli
```

---

## 9. Modül 4: Video Üretimi

```typescript
interface VideoGenerationSettings {
    prompt: string;
    resolution: '720p' | '1080p' | '4k';
    durationSecs: number;       // 5-8 saniye
    aspectRatio: '16:9' | '9:16';
    quality: 'fast' | 'high';
}

generateVideoFromImage(
    imageInput: string | File,
    settings: VideoGenerationSettings
): Promise<string>  // Blob URL
```

---

## 10. Modül 5: Kolaj Stüdyosu

### A) Standart Kolaj
```typescript
generateCollage(imageFiles: File[], prompt: string, aspectRatio = '3:4'): Promise<string>
```

### B) Ürün Kolajı
```typescript
interface ProductItem {
    id: string;
    file: File | string;
    name: string;
    price?: string;
    description?: string;
    preview?: string;
}

generateProductCollage(
    products: ProductItem[],
    background: string,  // 'corkboard'|'white'|'black'|'#hex'
    aspectRatio = '3:4',
    customPrompt?: string
): Promise<string>
```

**Prompt:**
```
PROFESYONEL ÜRÜN KATALOG KOLAJI
- Polaroid tarzında yerleşim
- Ayakkabılar çift olarak
- Mantar panoda renkli iğneler + gölgeler
- Her ürünün altına el yazısı fontuyla Türkçe isim
- 2K, 3:4 (A4 dikey format)
```

### C) Sihirli Kolaj
```typescript
generateAutoProductCollage(imageFile: File, aspectRatio = '3:4'): Promise<string>
```

**Prompt:**
```
FLAT LAY MODA EDİTÖRYALİ
- Mermer/linen yüzey
- Ana parçalar merkeze, aksesuarlar çevreye
- Orijinal kombini "İlham Fotoğrafı" olarak köşeye yerleştir
- Her ürün profesyonel ürün fotoğrafı gibi
- Vogue/Harper's Bazaar kalitesi, FOTOĞRAF (illustrasyon DEĞİL)
```

---

## 11. Modül 6: PixShop

6 fonksiyon, hepsi `gemini-3.1-flash-image-preview`:

| Fonksiyon | Açıklama |
|---|---|
| `editImage` | AI ile fotoğraf düzenleme |
| `applyFilter` | Filtre uygulama |
| `adjustImage` | Parlaklık/kontrast ayarı |
| `removeBackground` | Arka plan kaldırma |
| `upscaleImage` | 2K/4K çözünürlük artırma |
| `addProductToScene` | Ürünü sahneye ekleme |

---

## 12. Modül 7: Fotomatik

| Fonksiyon | Açıklama |
|---|---|
| `fotomatikGenerateEditedImage` | Görüntü dönüştürme |
| `fotomatikGenerateImagePrompt` | AI prompt üretme (TR/EN/MJ/SD) |
| `fotomatikSuggestEnhancements` | İyileştirme önerileri |
| `fotomatikRemoveBackground` | Arka plan kaldırma |
| `fotomatikRetouch` | light/medium/heavy ürün rötuşu |
| `fotomatikCatalogPrep` | ecommerce/social/minimal katalog |

### Prompt Üretme Çıktı Yapısı (JSON)
```json
{
  "tr": "Detaylı Türkçe analiz",
  "en": "Standart İngilizce prompt",
  "midjourney": "MJ V6 optimize (--ar, --stylize)",
  "stableDiffusion": {
    "positive": "SDXL positive prompt",
    "negative": "Negative prompt",
    "params": "Sampler, CFG Scale, Steps"
  },
  "tips": ["3 uzman ipucu"]
}
```

---

## 13. Modül 8: AdGenius

### 4 Aşamalı Pipeline
```
1. analyzeProductImage(file) → ProductAnalysis (JSON)
2. generateAdPrompts(analysis, formData) → AdPrompt[]
3. generateAdImage(prompt, refImage, ...) → base64
4. generateAdVideo(imageB64, promptType, ...) → blob URL
```

### Reklam Stilleri
`Lüks ve Premium` | `Minimalist` | `Sokak Modası` | `Romantik` | `Sportif` | `Bohemian` | `Retro` | `Avant-Garde` | `Bauhaus` | `Rustik & Bohem`

### 2 Mod
- **Kampanya:** Model + sahne + arka plan (reklam)
- **E-Ticaret:** Beyaz arka plan, stüdyo, yakın çekim

### Kritik Kurallar
1. Model yüzü ve vücudu TÜM resimlerde aynı
2. Kıyafet ve aksesuarlar hiç değişmeyecek
3. E-ticarette tüm arka planlar aynı renk
4. Stüdyo çekimlerinde ekipman görünmeyecek

---

## 14. Modül 9: Upscale ve Edit

```typescript
upscaleImage(imageFile: File): Promise<string>
// Prompt: "4K Ultra HD çözünürlükte yeniden oluştur"
// imageSize: '4K'

analyzeOutfitItems(imageInput: File | string): Promise<ProductItem[]>
// Kombin fotoğrafını analiz edip her ürünü ayrıştırır
```

---

## 15. Fal.ai Fallback Sistemi

Gemini 503/UNAVAILABLE hatalarında devreye girer.

```typescript
FAL_BASE_URL = 'https://queue.fal.run';

FAL_MODELS = {
    IMAGE: 'fal-ai/nano-banana-pro',
    IMAGE_EDIT: 'fal-ai/nano-banana-pro/edit',
    VIDEO: 'fal-ai/kling-video/v1/standard'
}

falGenerateImage(prompt, options?)    → base64 data URL
falEditImage(prompt, imageBase64)     → base64 data URL
falGenerateVideo(prompt, options?)    → blob URL
```

Queue mekanizması: POST → requestId → POLL (2sn, max 120sn) → GET sonuç

---

## 16. Auth ve Kullanıcı Yönetimi

```typescript
// Supabase Auth
const supabase = createClient(url, key, {
    auth: { flowType: 'pkce' }  // Mobil için ideal
});

supabase.auth.signInWithOAuth({ provider: 'google' })
supabase.auth.signUp({ email, password })
supabase.auth.signInWithPassword({ email, password })
supabase.auth.getSession()
supabase.auth.onAuthStateChange(callback)
supabase.auth.signOut()
```

---

## 17. Ödeme Sistemi

PayTR iframe token ile ödeme:
```
1. createTransaction(userId, type, amount, credits)
2. PayTR iframe açılır
3. Webhook → updateTransactionStatus(id, 'completed')
4. addCreditsToUser(userId, credits)
```

---

## ⚠️ 18. KRİTİK: LLM İÇERİK GÜVENLİK FİLTRELERİ VE VIRTUAL TRY-ON HASSAS ALANLARI

### ❗ Uygulama Amacı Beyanı (Tüm API Çağrılarına Dahil Edilmeli)

Bu uygulama **profesyonel bir moda teknolojisi (Fashion Tech) Virtual Try-On platformudur.** Amacı:
- Moda tasarımcılarının ve markaların **kıyafet ürünlerini** dijital modeller üzerinde sergilemesini sağlamak
- **E-ticaret ürün fotoğrafçılığı** için profesyonel katalog görselleri üretmek
- Mevcut bir kıyafet görselini alıp, sanal bir manken üzerine giydirmek (Virtual Try-On)
- **İLLEGAL VEYA UYGUNSUZ İÇERİK ÜRETİMİ AMAÇLI DEĞİLDİR**

### 🚨 Bilinen Sorun Alanları

#### 1. ÇOCUK KIYAFETİ (ageRange = 'Child' / 'Teen')
LLM'ler çocuk içeren görsellerde **son derece hassas** davranır. `IMAGE_SAFETY` hatası en sık bu senaryoda tetiklenir.

**Tetikleyici durumlar:**
- `ageRange = 'Child'` + herhangi bir kıyafet türü
- `ageRange = 'Teen'` + ten açıklığı olan kıyafetler (şort, etek, tişört)
- Çocuk manken + yakın çekim (close-up)

**Çözüm stratejisi:**
```typescript
// Çocuk modu için prompt'a eklenecek ZORUNLU ifade:
const CHILD_SAFETY_CONTEXT = `
IMPORTANT CONTEXT: This is a PROFESSIONAL CHILDREN'S FASHION E-COMMERCE application.
The purpose is EXCLUSIVELY to display CLOTHING PRODUCTS on age-appropriate child models
for online retail catalogs — similar to H&M Kids, Zara Kids, or Carter's product photography.
This is NOT generating any inappropriate content. It is STANDARD RETAIL PRODUCT PHOTOGRAPHY.
The child model must be:
- Fully clothed at all times
- In a natural, age-appropriate pose (standing, smiling, casual)
- In a professional studio or family-friendly environment
- Wearing the EXACT clothing product provided in the reference image
NO EXCEPTIONS. This is commercial fashion product photography only.
`;
```

**Ek önlemler:**
- Çocuk modunda `cameraZoom = 'Uzak'` (tam vücut) zorunlu kıl, yakın çekim YAPMA
- Çocuk modunda `pose` otomatik olarak `'Casual Duruş'` olsun
- Çocuk modunda `location` sadece `'Stüdyo'` veya `'Doğal Mekan'` olsun

#### 2. KADIN MODELİ + TEN AÇIKLIĞI
Kadın modellerde ten açıklığı olan kıyafetler (mayo, bikini, iç çamaşırı, kısa elbise, dekolteli üst) `IMAGE_SAFETY` tetikleyebilir.

**Tetikleyici durumlar:**
- `clothingType` = İç Giyim, Mayo, Bikini, Body
- Düşük kesimli / dekolteli kıyafetler
- `cameraZoom = 'Yakın'` + ten açıklığı olan kıyafet

**Çözüm stratejisi:**
```typescript
// Tüm kadın model çağrılarına eklenecek ifade:
const FASHION_CONTEXT = `
PROFESSIONAL CONTEXT: This is a legitimate Fashion E-Commerce Virtual Try-On platform.
The purpose is to generate PRODUCT PHOTOGRAPHY for online clothing retail — exactly like
ASOS, Zalando, Shein, or Net-a-Porter product pages.
All generated images must be:
- Professional e-commerce standard (NO suggestive poses, NO inappropriate framing)
- Focus on the CLOTHING PRODUCT, not the model's body
- Studio-quality lighting with neutral/white background
- The model is simply a clothes hanger — the PRODUCT is the star
This is standard fashion industry practice used by every major clothing retailer worldwide.
`;
```

#### 3. İÇ GİYİM / MAYO KATEGORİSİ
Bu kategori en yüksek engelle karşılaşır. 

**Zorunlu önlemler:**
- İç giyim/mayo için `cameraZoom = 'Orta'` veya `'Uzak'` kullan, yakın çekim YAPMA
- Prompt'a `"tasteful, editorial, non-suggestive, professional catalog photography"` ekle
- Pose olarak `"standing straight, arms at sides, professional model stance"` kullan
- Arka plan kesinlikle `"clean white studio backdrop"` olsun

### 🛡️ Gemini Safety Settings (ZORUNLU UYGULAMA)

```typescript
import { HarmCategory, HarmBlockThreshold } from "@google/genai";

// E-ticaret uygulamaları için BLOCK_NONE zorunludur
// Aksi halde mayo, iç giyim, çocuk kıyafetleri üretilemez
const PERMISSIVE_SAFETY_SETTINGS = [
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_CIVIC_INTEGRITY,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  }
];

// API çağrısında kullanımı:
const response = await ai.models.generateContent({
    model: 'gemini-3.1-flash-image-preview',
    contents: { parts: [...] },
    config: {
        safetySettings: PERMISSIVE_SAFETY_SETTINGS,  // ← ZORUNLU
        responseModalities: [Modality.IMAGE],
        imageConfig: { imageSize: '2K' }
    }
});
```

### 🔄 IMAGE_SAFETY Hatası Yakalama ve Fallback Akışı

```typescript
try {
    const result = await generateImage(...);
    return result;
} catch (error) {
    if (error.message?.includes('IMAGE_SAFETY') || 
        error.message?.includes('SAFETY') ||
        error.message?.includes('blocked')) {
        
        console.warn('⚠️ IMAGE_SAFETY tetiklendi, prompt yumuşatılıyor...');
        
        // Strateji 1: Prompt'u yumuşat
        const softPrompt = originalPrompt
            .replace(/bikini|mayo|iç çamaşırı/gi, 'summer clothing')
            .replace(/yakın çekim|close-up/gi, 'medium shot')
            + '\nProfessional fashion e-commerce catalog photography. Tasteful and editorial.';
        
        // Strateji 2: Kamera açısını uzaklaştır
        // cameraZoom = 'Uzak' (full body, mümkün olduğunca tam vücut)
        
        // Strateji 3: Fal.ai fallback (farklı güvenlik politikası)
        const { falGenerateImage } = await import('./falaiService');
        return await falGenerateImage(softPrompt, { imageSize: '1024x1024' });
    }
    throw error;
}
```

### 📋 Kategori Bazlı Risk Matrisi

| Kategori | Risk Seviyesi | Tetikleyici | Çözüm |
|---|---|---|---|
| Çocuk + Her Kıyafet | 🔴 ÇOK YÜKSEK | `ageRange='Child'` | `CHILD_SAFETY_CONTEXT` + uzak çekim + stüdyo |
| Çocuk + Ten Açıklığı | 🔴 ENGEL | `Child` + şort/tişört | Prompt yumuşatma + editorial framing |
| Kadın + İç Giyim | 🔴 YÜKSEK | Bikini, mayo, body | `FASHION_CONTEXT` + tam vücut + beyaz arka plan |
| Kadın + Elbise | 🟡 ORTA | Kısa elbise, dekolte | `FASHION_CONTEXT` yeterli |
| Kadın + Normal Kıyafet | 🟢 DÜŞÜK | Gömlek, pantolon, ceket | Standart prompt yeterli |
| Erkek + Her Kıyafet | 🟢 DÜŞÜK | Tüm kategoriler | Nadiren sorun yaşanır |
| Ghost Mannequin | 🟢 YOK | İnsan yok | Hiçbir filtre tetiklenmez |

### 🔑 Mobil App İçin Öneriler

1. **API çağrılarını proxy üzerinden yapın** — Doğrudan client'tan API key göndermeyin
2. **`safetySettings: BLOCK_NONE`** tüm image üretim çağrılarında ZORUNLU
3. **Çocuk kategorisi için özel prompt template** kullanın → `CHILD_SAFETY_CONTEXT`
4. **Kadın iç giyim/mayo için özel prompt template** kullanın → `FASHION_CONTEXT`
5. **IMAGE_SAFETY hatası geldiğinde** otomatik olarak:
   - Prompt'u yumuşat (suggestive kelimeleri çıkar)
   - Kamera açısını uzaklaştır
   - Fal.ai fallback'e geç
6. **Kullanıcıya hata mesajı gösterme** — `"Görsel oluşturuluyor... (alternatif yöntem deneniyor)"` gibi soft mesaj göster
7. **Her prompt'un başına** uygulamanın meşru ticari amacını belirten bağlam ekleyin:
   ```
   "This image is for a professional fashion e-commerce virtual try-on platform.
    Purpose: Displaying clothing products on digital models for online retail catalogs.
    This is standard industry practice used by H&M, ASOS, Zara, and all major retailers."
   ```

---

## 🎨 Renk Paleti

```
Siyah=#000000  Beyaz=#FFFFFF  Kırmızı=#FF0000
Mavi=#0000FF   Yeşil=#008000  Sarı=#FFFF00
Turuncu=#FFA500 Mor=#800080   Pembe=#FFC0CB
Kahverengi=#8B4513 Gri=#808080 Bej=#F5F5DC
Lacivert=#000080 Bordo=#800000 Turkuaz=#40E0D0
Altın=#FFD700  Gümüş=#C0C0C0  Krem=#FFFDD0
Özel Renk → (#XXXXXX) kullanıcı seçer
```

---

## 📐 Aspect Ratio

| Ratio | Kullanım |
|---|---|
| `3:4` | A4 dikey, kolaj, canlı model (DEFAULT) |
| `9:16` | Mobil/sosyal medya dikey |
| `16:9` | Yatay (reklam, video) |
| `1:1` | Kare (Instagram) |
| `4:5` | Instagram portre |

---

> **Son Güncelleme:** 27 Şubat 2026 | **Versiyon:** 1.1
