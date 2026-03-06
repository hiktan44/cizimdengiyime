# 🎨 Logo & Ürün Ekleme Özelliği - Teknik Prompt

## Genel Bakış
Bir React/TypeScript web uygulamasına, kullanıcıların ana görsele logo veya ürün (aksesuar) ekleyebileceği bir özellik eklemek istiyorum.

## Teknik Gereksinimler

### 1. Backend Servis Fonksiyonu

**Dosya:** `services/pixshopService.ts`

```typescript
/**
 * Adds a logo or product (accessory) to the main image at a specific location.
 * @param originalImage The base image file.
 * @param overlayImage The logo or product image to add (e.g., logo, tie, scarf).
 * @param userPrompt Description of what to add and where.
 * @param hotspot Optional {x, y} coordinates for precise placement.
 * @returns A promise that resolves to the data URL of the composite image.
 */
export const pixshopAddProductOrLogo = async (
    originalImage: File,
    overlayImage: File,
    userPrompt: string,
    hotspot?: { x: number, y: number }
): Promise<string> => {
    console.log('Starting product/logo addition...');
    checkApiKey();
    const ai = new GoogleGenAI({ apiKey: API_KEY });

    const originalImagePart = await fileToPart(originalImage);
    const overlayImagePart = await fileToPart(overlayImage);
    
    const hotspotText = hotspot 
        ? `Focus placement around pixel coordinates (x: ${hotspot.x}, y: ${hotspot.y}).`
        : '';

    const prompt = `Add the second image (logo/product/accessory) to the first image based on this request:
User Request: "${userPrompt}"
${hotspotText}

*** PROFESSIONAL COMPOSITE RULES ***:
1. NATURAL INTEGRATION: The added element must look like it was photographed with the original scene - match lighting, shadows, and perspective.
2. PRESERVE LOGO CLARITY: If adding a logo, it MUST remain sharp, clear, and readable. Do not blur or distort logos.
3. REALISTIC PHYSICS: If adding clothing/accessories (tie, scarf, etc.), they must drape naturally with realistic fabric physics and shadows.
4. PROPER SCALING: Scale the added element appropriately for the scene - logos should be visible but not overwhelming, accessories should fit the person naturally.
5. SEAMLESS BLENDING: Edges must blend perfectly - no harsh cutouts or obvious compositing artifacts.
6. MAINTAIN QUALITY: The final image should look professional and production-ready, suitable for e-commerce or marketing use.`;

    const textPart = { text: prompt };

    console.log('Sending images and composite prompt to the model...');
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: { parts: [originalImagePart, overlayImagePart, textPart] },
        config: { safetySettings },
    });
    console.log('Received response from model for product/logo addition.', response);

    return handleApiResponse(response, 'add_product_logo');
};
```

### 2. Frontend State Yönetimi

**Yeni State'ler:**
```typescript
// Add Product/Logo states
const [overlayImage, setOverlayImage] = useState<File | null>(null);
const [overlayPrompt, setOverlayPrompt] = useState<string>('');
const [overlayImageUrl, setOverlayImageUrl] = useState<string | null>(null);
```

**URL Yönetimi (Memory Leak Koruması):**
```typescript
// Effect for overlay image URL
useEffect(() => {
  if (overlayImage) {
    const url = URL.createObjectURL(overlayImage);
    setOverlayImageUrl(url);
    return () => URL.revokeObjectURL(url);
  } else {
    setOverlayImageUrl(null);
  }
}, [overlayImage]);
```

### 3. Handler Fonksiyonu

```typescript
const handleAddProduct = useCallback(async () => {
  if (!currentImage) {
    setError('Lütfen önce bir ana görsel yükleyin.');
    return;
  }

  if (!overlayImage) {
    setError('Lütfen eklemek istediğiniz logo veya ürün görselini yükleyin.');
    return;
  }

  if (!overlayPrompt.trim()) {
    setError('Lütfen ne eklemek istediğinizi açıklayın.');
    return;
  }

  if (!await checkCredits()) return;

  setIsLoading(true);
  setError(null);

  try {
    const compositeImageUrl = await pixshopAddProductOrLogo(
      currentImage,
      overlayImage,
      overlayPrompt,
      editHotspot || undefined
    );
    const newImageFile = dataURLtoFile(compositeImageUrl, `with-product-${Date.now()}.png`);
    addImageToHistory(newImageFile);
    await saveToHistory(compositeImageUrl);
    setOverlayPrompt('');
    setEditHotspot(null);
    setDisplayHotspot(null);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Bilinmeyen bir hata oluştu.';
    setError(`Ürün/Logo eklenemedi. ${errorMessage}`);
    console.error(err);
  } finally {
    setIsLoading(false);
  }
}, [currentImage, overlayImage, overlayPrompt, editHotspot, addImageToHistory, profile]);
```

### 4. UI Komponenti

**Tab Tanımı:**
```typescript
type Tab = 'upload' | 'retouch' | 'adjust' | 'filters' | 'crop' | 'upscale' | 'addproduct';

const translations = {
  tr: {
    tabs: {
      addproduct: 'Ürün Ekle',
    },
  },
  en: {
    tabs: {
      addproduct: 'Add Product',
    },
  },
};
```

**UI Kodu:**
```tsx
{activeTab === 'addproduct' && (
  <div className="flex flex-col items-center gap-6 animate-fade-in">
    {/* Info Text */}
    <div className="w-full max-w-2xl bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-500/30 rounded-xl p-4">
      <h3 className="text-lg font-bold text-purple-300 mb-2">🎨 Logo & Ürün Ekleme</h3>
      <p className="text-sm text-gray-300 leading-relaxed">
        Ana görselinize logo, marka işareti veya aksesuar (kravat, şal, takı vb.) ekleyin. 
        AI, eklediğiniz öğeyi doğal bir şekilde entegre edecek ve profesyonel bir sonuç üretecektir.
      </p>
    </div>

    {/* Overlay Image Upload */}
    <div className="w-full max-w-2xl">
      <label className="block text-sm font-semibold text-gray-300 mb-3">
        📤 Logo / Ürün Görseli Yükle
      </label>
      <div className="relative">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) setOverlayImage(file);
          }}
          className="hidden"
          id="overlay-upload"
        />
        <label
          htmlFor="overlay-upload"
          className="flex flex-col items-center justify-center w-full h-40 bg-gray-900/50 border-2 border-dashed border-gray-600 rounded-xl cursor-pointer hover:bg-gray-800/50 hover:border-purple-500 transition-all"
        >
          {overlayImageUrl ? (
            <div className="relative w-full h-full p-4">
              <img
                src={overlayImageUrl}
                alt="Overlay Preview"
                className="w-full h-full object-contain rounded-lg"
              />
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setOverlayImage(null);
                }}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ) : (
            <>
              <svg className="w-12 h-12 text-gray-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-sm text-gray-400 font-medium">Logo veya Ürün Görseli Seçin</p>
              <p className="text-xs text-gray-500 mt-1">PNG, JPG, WEBP (Şeffaf arka plan önerilir)</p>
            </>
          )}
        </label>
      </div>
    </div>

    {/* Prompt Input */}
    <div className="w-full max-w-2xl">
      <label className="block text-sm font-semibold text-gray-300 mb-3">
        ✍️ Ne Eklemek İstiyorsunuz?
      </label>
      <textarea
        value={overlayPrompt}
        onChange={(e) => setOverlayPrompt(e.target.value)}
        placeholder="Örnek: 'Bu logoyu sağ üst köşeye ekle' veya 'Bu kravatı kişiye giydir'"
        rows={4}
        className="w-full bg-gray-900/50 border border-gray-700 text-gray-200 rounded-xl p-4 text-base focus:ring-2 focus:ring-purple-500 focus:outline-none transition resize-none"
        disabled={isLoading}
      />
      <p className="text-xs text-gray-500 mt-2">
        💡 İpucu: Resimde bir nokta seçerek hassas konum belirleyebilirsiniz (opsiyonel)
      </p>
    </div>

    {/* Add Button */}
    <button
      onClick={handleAddProduct}
      disabled={isLoading || !overlayImage || !overlayPrompt.trim() || !currentImage}
      className="w-full max-w-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-5 px-10 text-lg rounded-2xl shadow-xl hover:shadow-2xl hover:from-purple-500 hover:to-pink-500 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isLoading ? 'Ekleniyor...' : 'Logo / Ürün Ekle'}
    </button>

    {/* Examples */}
    <div className="w-full max-w-2xl bg-gray-900/30 border border-gray-700/50 rounded-xl p-4">
      <h4 className="text-sm font-bold text-gray-300 mb-3">📋 Örnek Kullanımlar:</h4>
      <ul className="space-y-2 text-sm text-gray-400">
        <li>• <strong>Logo:</strong> "Bu logoyu sağ üst köşeye küçük boyutta ekle"</li>
        <li>• <strong>Kravat:</strong> "Bu kravatı kişiye doğal bir şekilde giydir"</li>
        <li>• <strong>Şal:</strong> "Bu şalı omuzlara zarif bir şekilde yerleştir"</li>
        <li>• <strong>Aksesuar:</strong> "Bu kolye/küpeyi kişiye tak"</li>
      </ul>
    </div>
  </div>
)}
```

## 5. Logo Koruma (4K Upscale için)

**Upscale fonksiyonuna eklenen özel kurallar:**

```typescript
const prompt = `Upscale this image to ${size} resolution. Increase resolution while maintaining fidelity. Sharpen details, reduce noise.
    
*** CRITICAL LOGO/TEXT PRESERVATION RULES ***:
1. PROTECT LOGOS: If there are any logos, brand marks, or text overlays in the image, they MUST remain crystal clear and sharp at ${size} resolution.
2. NO LOGO DISTORTION: Do not blur, warp, or degrade any logos, watermarks, or text elements during upscaling.
3. ENHANCE CLARITY: Logos and text should become SHARPER and MORE READABLE at higher resolution, not blurrier.
4. MAINTAIN POSITIONING: Keep all logos and overlays in their exact original positions and proportions.`;
```

## Kullanım Senaryoları

### 1. Logo Ekleme
```
Ana Görsel: Ürün fotoğrafı
Overlay: Şirket logosu (PNG, şeffaf arka plan)
Prompt: "Bu logoyu sağ üst köşeye küçük boyutta ekle"
```

### 2. Kravat Giydirme
```
Ana Görsel: Kişi portresi
Overlay: Kravat görseli
Prompt: "Bu kravatı kişiye doğal bir şekilde giydir"
```

### 3. Aksesuar Ekleme
```
Ana Görsel: Model fotoğrafı
Overlay: Kolye/küpe görseli
Prompt: "Bu kolyeyi kişiye tak, doğal görünsün"
```

## Önemli Notlar

1. **AI Model:** Gemini 3 Pro Image Preview kullanılıyor
2. **Kredi Sistemi:** Her işlem kredi tüketir
3. **Hotspot:** Opsiyonel hassas konum seçimi
4. **Memory Management:** URL'ler düzgün şekilde revoke ediliyor
5. **Error Handling:** Kapsamlı hata yönetimi mevcut
6. **Professional Output:** E-ticaret ve pazarlama için uygun kalite

## Teknik Detaylar

- **Framework:** React + TypeScript
- **AI Provider:** Google Generative AI
- **Image Processing:** Canvas API
- **State Management:** React Hooks
- **File Handling:** FileReader API
- **URL Management:** createObjectURL/revokeObjectURL

## Başarı Kriterleri

✅ Logo/ürün doğal görünümlü entegre edilmeli
✅ Işık, gölge ve perspektif uyumlu olmalı
✅ Logolar keskin ve net kalmalı
✅ Kumaş fiziği gerçekçi olmalı
✅ Profesyonel, üretim kalitesinde sonuç
✅ Keskin kenarlar, yapay görünüm yok
