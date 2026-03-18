import { GoogleGenAI, Modality } from "@google/genai";
import { fileToGenerativePart, blobToBase64, base64ToFile, cropImageFromFile, fileToBase64 } from '../utils/fileUtils';
import { colors } from '../components/ColorPicker';

// Vite projelerinde ortam değişkenlerine erişmek için import.meta.env kullanılır.
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string;

const checkApiKey = () => {
    if (!API_KEY || API_KEY === 'undefined' || API_KEY === 'your-gemini-api-key-here') {
        throw new Error('Gemini API anahtarı ayarlanmamış. Lütfen .env.local dosyasını kontrol edin ve VITE_GEMINI_API_KEY değişkeninin doğru olduğundan emin olun.');
    }
};

// Model fallback listesi - 503 hatası durumunda sırayla denenecek
const IMAGE_MODELS = [
    'gemini-3-pro-image-preview',
    'gemini-3.1-flash-image-preview',
    'gemini-3-pro-preview',
    'gemini-2.0-flash-preview-image-generation',
    'imagen-3.0-generate-002'
] as const;

// Birincil model: Pro (2K çıktı)
const LIVE_MODEL_PRIMARY = 'gemini-3-pro-image-preview';

// Retry helper fonksiyonu - 503 hatalarında otomatik yeniden deneme + fal.ai fallback
const withRetry = async <T>(
    fn: (model: string) => Promise<T>,
    maxRetries: number = 3,
    delayMs: number = 2000,
    falFallbackFn?: () => Promise<T>
): Promise<T> => {
    let lastError: Error | null = null;

    for (let modelIndex = 0; modelIndex < IMAGE_MODELS.length; modelIndex++) {
        const model = IMAGE_MODELS[modelIndex];

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                console.log(`🔄 Deneme: ${attempt}/${maxRetries}`);
                return await fn(model);
            } catch (error: any) {
                lastError = error;
                const errorMessage = error?.message || String(error);
                const statusCode = error?.status || (errorMessage.includes('503') ? 503 :
                    errorMessage.includes('429') ? 429 :
                        errorMessage.includes('overloaded') ? 503 : null);

                console.warn(`⚠️ Hata (deneme ${attempt}): ${errorMessage}`);

                // 503 veya 429 hatalarında retry yap
                if (statusCode === 503 || statusCode === 429 || errorMessage.includes('overloaded') || errorMessage.includes('UNAVAILABLE')) {
                    if (attempt < maxRetries) {
                        const waitTime = delayMs * attempt; // Exponential backoff
                        console.log(`⏳ ${waitTime}ms bekleniyor...`);
                        await new Promise(resolve => setTimeout(resolve, waitTime));
                        continue;
                    }
                    // Son deneme de başarısız, sonraki modele geç
                    console.log('🔀 Sonraki model deneniyor...');
                    break;
                }

                // Diğer hatalar için direkt throw
                throw error;
            }
        }
    }

    // 🔄 TÜM GEMİNİ MODELLERİ BAŞARISIZ — FAL.AI FALLBACK
    if (falFallbackFn) {
        try {
            const { hasFalApiKey } = await import('./falaiService');
            if (hasFalApiKey()) {
                console.log('🔀 Fallback devreye giriyor...');
                // Kullanıcıya bildirim gönder (UI'da yakalanacak)
                window.dispatchEvent(new CustomEvent('fal-fallback-active', {
                    detail: { message: '🔄 Ana sunucu yoğun, alternatif AI sunucusuna geçiliyor... Bu işlem biraz daha uzun sürebilir, özür dileriz.' }
                }));
                const result = await falFallbackFn();
                window.dispatchEvent(new CustomEvent('fal-fallback-success', {
                    detail: { message: '✅ Alternatif sunucu ile başarıyla tamamlandı.' }
                }));
                return result;
            }
        } catch (falError: any) {
            console.error('❌ Fallback da başarısız');
            window.dispatchEvent(new CustomEvent('fal-fallback-failed', {
                detail: { message: '❌ Alternatif sunucu da yanıt veremedi. Lütfen birkaç dakika sonra tekrar deneyin.' }
            }));
        }
    }

    // Son hatayı analiz et ve anlaşılır mesaj fırlat
    const lastMsg = lastError?.message || '';
    if (lastMsg.includes('503') || lastMsg.includes('overloaded') || lastMsg.includes('UNAVAILABLE') || lastMsg.includes('high demand')) {
        throw new Error('SERVER_OVERLOADED');
    } else if (lastMsg.includes('429') || lastMsg.includes('rate limit') || lastMsg.includes('RESOURCE_EXHAUSTED')) {
        throw new Error('RATE_LIMITED');
    }
    throw lastError || new Error('ALL_MODELS_FAILED');
};

// *** LOGO & NAKIŞ SADAKATİ BLOĞU — Tüm görsel üretimlerinde kullanılır ***
const LOGO_FIDELITY_BLOCK = `
*** LOGO, NAKIŞ VE MARKA SADAKATİ TALİMATLARI (EN YÜKSEK ÖNCELİK) ***

Bu bölüm KESİNLİKLE uyulması gereken ZORUNLU kurallardır. Logo hataları KABUL EDİLMEZ.

1. GENEL LOGO KORUMA İLKELERİ:
   - Referans görseldeki TÜM logolar, marka isimleri, semboller, amblemler ve grafikler PİKSEL DÜZEYINDE BİREBİR korunmalıdır.
   - Logo oranları (genişlik:yükseklik) KESİNLİKLE değiştirilmemelidir — ne sıkıştır ne uzat.
   - Logo konumu (göğüs sol, göğüs orta, sırt, kol, yaka vb.) referansla AYNI yerde olmalıdır.
   - Logo boyutu referansla orantılı olmalıdır.
   - Logo renkleri (tek renk, çok renkli, degradeli) KESİNLİKLE değiştirilmemeli.

2. NAKIŞLI LOGO DETAYLARI (KRİTİK — EN HASSAS ALAN):
   - Nakış (embroidery) logoları özel bir DOKUNSAL DOKU (tactile texture) içerir. Bu doku MUTLAKA korunmalıdır:
     a) İPLİK YAPISI: Nakış iplikleri tek tek seçilebilir netlikte olmalı. İpliklerin PARALEL sıral dizilimi, saten dikiş (satin stitch) veya dolgu dikişi (fill stitch) yapısı, ve iplik yönü bire bir korunmalı.
     b) KABARTMA EFEKTİ: Nakış logoları kumaş yüzeyinden hafifçe kabarık (raised/3D) görünür. Bu 3 boyutlu kabartma etkisi doğru gölgelendirmeyle TEMSİL EDİLMELİDİR.
     c) İPLİK PARLAKLIĞI: Nakış iplikleri kumaştan farklı bir parlaklığa sahiptir (genellikle rayon/saten iplik kullanılır). Bu IŞIK YANSIMASI farkı korunmalı.
     d) KENAR KESKİNLİĞİ: Nakışın kenarları kumaşla buluştuğu yerde net ve keskin bir geçiş olmalı — bulanık veya kaybolmuş kenarlar YASAKTIR.
     e) RENK DEĞİŞKENLİĞİ: Gerçek nakışlarda ipliklerin yönüne göre renkte hafif ton farklılıkları oluşur. Bu doğal ton varyasyonu dahil edilmeli.
     f) ALT DOKU: Nakışın altındaki kumaş hafifçe çekilmiş/gerilmiş görünür (puckering). Bu gerçekçi detay eklenebilir.

3. BASKI (PRINT) LOGO DETAYLARI:
   - Serigrafi/screen print: Mürekkep tabakası kumaş dokusunun üzerine oturur, hafif kalınlık hissedilir.
   - Dijital transfer print: Kumaşla bütünleşik, kumaş dokusunu takip eder.
   - DTG (Direct to Garment): Kumaş lif aralarına işler, kumaş dokusu üzerinden görünür.
   - Her baskı tekniğine uygun görünüm sağlanmalı.

4. YAZI VE HARF SADAKATİ:
   - Logodaki/üründeki her harf, rakam ve sembol KARAKTER KARAKTER doğru yazılmalı.
   - Font stili (serif/sans-serif/script), kalınlığı (bold/regular/light) ve boyutu referansla AYNI olmalı.
   - Harfler arası boşluk (kerning) ve satır aralığı korunmalı.
   - BÜYÜK/küçük harf ayrımı BİREBİR korunmalı.

5. LOGO FİNAL KONTROL:
   - Her üretimde logonun referansla eşleştiğini DOĞRULA.
   - Logo eksik, bozuk, bulanık, yanlış yazılmış veya yanlış konumda İSE üretimi REDDET ve düzelt.
`;

// Simple hash function (djb2 algorithm)
const hashString = (str: string): number => {
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash;
};

// Helper function to generate stable seed from file
const generateStableSeed = async (file: File): Promise<number> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => { // ✅ DÜZELTİLDİ: onloadend kullanılıyor
            try {
                const base64 = reader.result as string;
                // Base64'dan hash oluştur
                const hash = hashString(base64);
                // Hash'i seed olarak kullan (0-1M aralığı)
                const seed = Math.abs(hash) % 1000000000;
                console.log('🔒 Stable seed generated from image hash:', seed);
                resolve(seed);
            } catch (error) {
                reject(new Error(`Seed generation failed: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`));
            }
        };
        reader.onerror = () => {
            reject(new Error('File reading failed for seed generation'));
        };
        reader.readAsDataURL(file);
    });
};

// Helper function to get hex code from color name
const getColorHex = (colorName: string): string => {
    if (!colorName) return '';

    console.log('getColorHex called with:', colorName);

    // Check if it's a custom color with hex format: "Özel Renk (#XXXXXX)"
    const customColorMatch = colorName.match(/Özel Renk \((#[0-9a-fA-F]{6})\)/);
    if (customColorMatch) {
        console.log('Found custom color hex:', customColorMatch[1]);
        return customColorMatch[1];
    }

    console.log('Available colors:', colors.map(c => c.name));

    const colorObj = colors.find(c => c.name === colorName);

    if (colorObj) {
        console.log('Found color:', colorObj.name, '=', colorObj.value);
    } else {
        console.warn('Color NOT found:', colorName);
    }

    return colorObj?.value || '';
};

// Interface for Video Settings
export interface VideoGenerationSettings {
    prompt: string;
    resolution: '720p' | '1080p' | '4k';
    durationSecs: number;
    aspectRatio: '16:9' | '9:16';
    quality: 'fast' | 'high';
}

const getStylePromptFragment = (style: string): string => {
    switch (style) {
        case 'Sinematik':
            return 'Görüntünün stili sinematik olmalı, dramatik aydınlatma, yüksek kontrast, color grading uygulanmış ve duygusal bir atmosfer içermelidir.';
        case 'Çizgi Film':
            return 'Görüntü, canlı renklere, net çizgilere ve basitleştirilmiş özelliklere sahip, stilize edilmiş bir çizgi film tarzında olmalıdır.';
        case 'Gerçekçi':
        default:
            return 'Görüntü ultra fotogerçekçi, yüksek detaylı ve bir moda dergisi kapağı kalitesinde olmalıdır. Hasselblad veya Phase One kamera ile çekilmiş gibi görünmelidir.';
    }
};

const getLocationPromptFragment = (location: string): string => {
    switch (location) {
        case 'Sokak':
            return 'Model, hareketli, flu arka planlı şık bir şehir sokağında durmalıdır (Urban Chic).';
        case 'Stüdyo':
            return 'Model, sonsuz fonlu (cyclorama) minimalist ve profesyonel bir stüdyo ortamında durmalıdır. Arka plan tamamen temiz, tek renk ve pürüzsüz olmalıdır. Stüdyo ekipmanları (softbox, tripod, ışık standı, reflektör, kablo, C-stand) KESİNLİKLE görünmeyecek. Sadece temiz, sonsuz fon ve yumuşak gölgeler.';
        case 'Doğal Mekan':
            return 'Model, gün ışığı alan doğal bir mekanda (orman, sahil, bahçe) durmalıdır.';
        case 'Lüks Mağaza':
            return 'Model, lüks bir moda mağazasının şık ve modern iç mekanında durmalıdır.';
        case 'Podyum':
        default:
            return 'Model, profesyonel bir stüdyo ortamında doğal bir şekilde hafifçe dönerek ve poz vererek kıyafetini sergilemelidir. Hareketler abartısız, akıcı ve gerçekçi olmalıdır. Arka plan temiz ve sonsuz fonlu olmalıdır. Stüdyo ekipmanları (softbox, tripod, ışık standı, reflektör) KESİNLİKLE görünmeyecek.';
    }
};

export const generateProductFromSketch = async (sketchFile: File, color?: string): Promise<string> => {
    checkApiKey();
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const imagePart = await fileToGenerativePart(sketchFile);

    // Get hex code if color is provided
    const colorHex = color ? getColorHex(color) : '';

    // Debug log
    if (color) {
        console.log('=== ÜRÜN RENK DEBUG ===');
        console.log('Seçilen renk:', color);
        console.log('HEX değer:', colorHex);
        console.log('====================');
    }

    const colorInstruction = color && colorHex ?
        `

*** RENK TALİMATI (EN YÜKSEK ÖNCELİK) ***
Ürün rengi MUTLAKA "${color}" (HEX: ${colorHex}) OLMALIDIR.
Bu RGB/HEX değerini KULLAN: ${colorHex}
Referans çizimdeki rengi YOKSAY ve ${colorHex} rengini uygula.
BAŞKA RENK KULLANMA.` : '';

    const colorClosing = color && colorHex ?
        `\n\n*** FİNAL RENK KONTROLU ***\nTEKRAR EDİYORUM: Ürün rengi ${color} (${colorHex}) olmalidir. Yeşil, mavi, kırmızı gibi BAŞKA RENKLER KULLANILAMAZ. Sadece ve sadece ${colorHex} kullan.` : '';

    const prompt = `Bu moda çizimini (sketches/flat drawing) analiz et ve onu ultra-gerçekçi, 2K çözünürlüklü (2048x2048 piksel) bir hayalet manken (ghost mannequin) ürün fotoğrafına dönüştür.${colorInstruction}
    
    *** 1. RENK KONTROLU - EN YÜKSEK ÖNCELİK (Bu kurala tam uyum ZORUNLUDUR) ***
    ${color && colorHex ? `
    >>> ÜRÜN RENGİ KURALI <<<
    - Ürün rengi KESİNLİKLE "${color}" (HEX: ${colorHex}) OLMALIDIR.
    - Bu RGB/HEX değerini KULLAN: ${colorHex}
    - Referans çizimdeki rengi FARKLI ise, ONU YOKSAY ve ${colorHex} rengine DÖNÜŞTÜR.
    - ${color} rengini TAM OLARAK uygula. Benzer tonlar KABUL EDİLMEZ.
    - Işıklandırma SADECE gölge/parlaklık ekler, ${colorHex} temel rengini DEĞİŞTİRMEZ.
    ` : color ? `
    >>> ÜRÜN RENGİ KURALI <<<
    - Ürün rengi KESİNLİKLE "${color}" OLMALIDIR.
    - Referans çizimi YOKSAY, sadece "${color}" rengini kullan.
    ` : `
    >>> ÜRÜN RENGİ KURALI <<<
    - Referans çizimdeki rengi %100 KORU.
    `}
    
    ${LOGO_FIDELITY_BLOCK}
    
    *** 2. GÖRSEL KALİTE VE GERÇEKÇİLİK STANDARDI ***:
    1. Kumaş Dokusu (Texture Fidelity): Kumaşın cinsi (pamuk, ipek, yün, denim vb.) fotoğrafta %100 GERÇEKÇİ görünmeli. Makro çekim kalitesinde iplik detayları görünmeli. " Dijital çizim" hissi KESİNLİKLE olmamalı.
    2. Işıklandırma (Lighting): Ürünün formunu ve drapelerini ortaya çıkaran profesyonel "Softbox" stüdyo aydınlatması. Derinlik katan doğal gölgeler.
    3. Detaylar: Dikişler (stitch lines), fermuar çekme uçları, düğme dokuları, yaka içi etiketleri gibi mikro detaylar keskin ve net olmalı.
    4. Sadakat: Çizim üzerindeki her türlü desen, logo eskizi veya baskı detayı ürüne BİREBİR VE DÜZGÜN BİR ŞEKİLDE (warping olmadan) aktarılmalı.
    5. Ghost Mannequin Etkisi: Ürün dolgun ve 3 boyutlu görünmeli, ancak içinde görünmez bir manken varmış gibi durmalı. Boyun içi kısmı gerçekçi bir şekilde (arka etiket vb.) gösterilmeli.
    6. Arka Plan: Saf beyaz (#FFFFFF) veya çok açık nötr gri (#F5F5F5).
    
    Sonuç, Vogue veya Harper's Bazaar gibi dergilerde veya Lüks E-Ticaret (Farfetch, Net-a-Porter) sitelerinde kullanılacak kalitede, 2K çözünürlük (en az 2048px), RAW PHOTO, HİPER-GERÇEKÇİ bir ürün fotoğrafı olmalıdır.` + colorClosing;

    try {
        return await withRetry(async (model) => {
            const response = await ai.models.generateContent({
                model: model,
                contents: {
                    parts: [
                        imagePart,
                        { text: prompt },
                    ],
                },
                config: {
                    responseModalities: [Modality.IMAGE],
                    imageConfig: {
                        imageSize: '2K',
                    },
                },
            });

            const candidate = response.candidates?.[0];
            const parts = candidate?.content?.parts;

            if (parts) {
                for (const part of parts) {
                    if (part.inlineData) {
                        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                    }
                }
            }
            throw new Error("Ürün görseli oluşturulamadı.");
        }, 3, 2000, async () => {
            // Fal.ai fallback — nano-banana-pro
            const { falGenerateImage } = await import('./falaiService');
            return await falGenerateImage(prompt, { imageSize: '1024x1024' });
        });
    } catch (e) {
        console.error("Ürün Oluşturma Hatası:", e);
        throw e;
    }
};

export const generateSketchFromProduct = async (productFile: File, style: 'colored' | 'blackwhite' = 'blackwhite', partColors?: Record<string, string>, aspectRatio?: string): Promise<string> => {
    checkApiKey();
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const imagePart = await fileToGenerativePart(productFile);

    // Renk talimatı oluştur
    let colorInstruction = '';
    if (partColors && Object.keys(partColors).length > 0) {
        const colorLines = Object.entries(partColors)
            .filter(([, hex]) => hex && hex !== '')
            .map(([part, hex]) => `- ${part}: HEX ${hex} rengini kullan`)
            .join('\n');
        if (colorLines) {
            colorInstruction = `\n\n*** RENK TALİMATI (ZORUNLU) ***\nAşağıdaki parçalara belirtilen renkleri uygula:\n${colorLines}\nBu renkleri BİREBİR kullan, tonlarını değiştirme.\n`;
        }
    }

    const prompt = style === 'colored'
        ? `Bu ürün fotoğrafını analiz et ve moda tasarımı üretimi için profesyonel bir 'Renkli Teknik Çizim' (Colored Technical Flat Sketch) oluştur.
    
    *** KRİTİK: TAM BOY (FULL BODY) KORUMA ***
    - Fotoğraftaki kıyafetin TAMAMINI çiz. Bel üstü veya kırpma YAPMA.
    - Fotoğrafta alt+üst parça varsa, İKİSİNİ DE tek çizimde göster.
    - Tam boy elbise ise etek ucuna kadar, pantolon ise paça ucuna kadar çiz.
    - Fotoğraftaki ÜRÜN ne ise (üst, alt, elbise, mont, takım elbise) TAMAMINI çiz.
    - Hiçbir parçayı kesme, kırpma veya dışarıda bırakma.
    
    *** PARÇA ANALİZİ ***
    - Fotoğraftaki kıyafeti parçalarına ayır: üst, alt, dış giyim, aksesuar vb.
    - Her parçanın sınırlarını net çizgilerle belirt.
    - Alt ve üst parça varsa, bel çizgisinde ayrımı net göster.
    
    Kurallar:
    1. Stil: Siyah kontur çizgileri + Gerçekçi renkler. Ürünün orijinal renklerini koru.
    2. Detay: Dikiş yerleri (topstitching), fermuarlar, cepler, ribana detayları, düğmeler net bir şekilde çizilmeli.
    3. Perspektif: Ürün tamamen önden, düz (flat) ve simetrik bir şekilde çizilmeli.
    4. Sunum: Arka plan saf beyaz olmalı. İnsan figürü veya manken kullanılmamalı.
    5. Kalite: 2K çözünürlükte (en az 2048px), vektörel çizim hassasiyetinde, keskin ve temiz çizgiler.
    6. Renklendirme: Kumaş renkleri, detay renkleri (düğme, fermuar vb.) fotoğraftaki ile birebir aynı olmalı. Gölge ve ışık oyunlarıyla derinlik katılmalı.
    7. Doku: Kumaşın dokusu (Texture) çizimde hissedilmeli.
    8. Desen: Ürünün kendinden deseni varsa (çizgili, kareli, çiçekli vb.) deseni de birebir çiz.${colorInstruction}`
        : `Bu ürün fotoğrafını analiz et ve moda tasarımı üretimi için profesyonel bir 'Teknik Çizim' (Technical Flat Sketch / CAD) oluştur.
    
    *** KRİTİK: TAM BOY (FULL BODY) KORUMA ***
    - Fotoğraftaki kıyafetin TAMAMINI çiz. Bel üstü veya kırpma YAPMA.
    - Fotoğrafta alt+üst parça varsa, İKİSİNİ DE tek çizimde göster.
    - Tam boy elbise ise etek ucuna kadar, pantolon ise paça ucuna kadar çiz.
    - Fotoğraftaki ÜRÜN ne ise (üst, alt, elbise, mont, takım elbise) TAMAMINI çiz.
    - Hiçbir parçayı kesme, kırpma veya dışarıda bırakma.
    
    *** PARÇA ANALİZİ ***
    - Fotoğraftaki kıyafeti parçalarına ayır: üst, alt, dış giyim, aksesuar vb.
    - Her parçanın sınırlarını net çizgilerle belirt.
    
    Kurallar:
    1. Stil: Sadece siyah kontur çizgileri (clean line art). Gölgelendirme, renk veya doku YOK.
    2. Detay: Dikiş yerleri (topstitching), fermuarlar, cepler, ribana detayları, düğmeler net bir şekilde çizilmeli.
    3. Perspektif: Ürün tamamen önden, düz (flat) ve simetrik bir şekilde çizilmeli.
    4. Sunum: Arka plan saf beyaz olmalı. İnsan figürü veya manken kullanılmamalı.
    5. Kalite: 2K çözünürlükte (en az 2048px), vektörel çizim hassasiyetinde, keskin ve temiz çizgiler.`;

    try {
        return await withRetry(async (model) => {
            const response = await ai.models.generateContent({
                model: model,
                contents: {
                    parts: [
                        imagePart,
                        { text: prompt },
                    ],
                },
                config: {
                    responseModalities: [Modality.IMAGE],
                    imageConfig: {
                        imageSize: '2K',
                        ...(aspectRatio ? { aspectRatio } : {}),
                    },
                },
            });

            const candidate = response.candidates?.[0];
            const parts = candidate?.content?.parts;

            if (parts) {
                for (const part of parts) {
                    if (part.inlineData) {
                        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                    }
                }
            }
            throw new Error("Teknik çizim oluşturulamadı.");
        }, 3, 2000, async () => {
            // Fal.ai fallback — nano-banana-pro
            const { falGenerateImage } = await import('./falaiService');
            return await falGenerateImage(prompt, { imageSize: '1024x1024' });
        });
    } catch (e) {
        console.error("Teknik Çizim Hatası:", e);
        throw e;
    }
};

// Analyze garment parts from image using Gemini
export const analyzeGarmentParts = async (productFile: File): Promise<{ name: string; hasPattern: boolean }[]> => {
    checkApiKey();
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const imagePart = await fileToGenerativePart(productFile);

    const prompt = `Bu moda/kıyafet fotoğrafını analiz et ve kıyafetin kaç parçadan oluştuğunu belirle.

Her parça için JSON formatında yanıt ver. SADECE JSON array döndür, başka metin ekleme.

Parça tipleri: üst giyim (t-shirt, gömlek, kazak, ceket, mont vb.), alt giyim (pantolon, şort, etek vb.), elbise, dış giyim, aksesuar (kemer, atkı vb.)

Her parça için:
- "name": Parçanın Türkçe adı (örn: "Üst - Gömlek", "Alt - Pantolon", "Elbise", "Dış - Ceket")
- "hasPattern": true/false — parçanın kendinden deseni var mı (çizgili, kareli, çiçekli, puantiyeli vb.)

Örnek yanıt:
[{"name":"Üst - Gömlek","hasPattern":false},{"name":"Alt - Pantolon","hasPattern":true}]

ÇOK ÖNEMLİ: Sadece GİYSİ parçalarını say. Ayakkabı, çanta gibi aksesuarları SAYMA. Sadece kıyafet parçaları.`;

    try {
        const models = ['gemini-3.1-flash-image-preview', 'gemini-2.0-flash'];
        for (const model of models) {
            try {
                const response = await ai.models.generateContent({
                    model,
                    contents: { parts: [imagePart, { text: prompt }] },
                });
                const text = response.candidates?.[0]?.content?.parts?.[0]?.text || '';
                const jsonMatch = text.match(/\[[\s\S]*?\]/);
                if (jsonMatch) {
                    return JSON.parse(jsonMatch[0]);
                }
            } catch { continue; }
        }
        // Fallback: tek parça varsay
        return [{ name: 'Kıyafet', hasPattern: false }];
    } catch {
        return [{ name: 'Kıyafet', hasPattern: false }];
    }
};

export const generateVideoFromImage = async (
    imageInput: string | File,
    settings: VideoGenerationSettings
): Promise<string> => {
    // Check for Veo specific API key availability if in a browser context with aistudio
    if (typeof window !== 'undefined' && (window as any).aistudio) {
        const aistudio = (window as any).aistudio;
        try {
            const hasKey = await aistudio.hasSelectedApiKey();
            if (!hasKey) {
                await aistudio.openSelectKey();
            }
        } catch (e) {
            console.warn("AI Studio key selection check failed, proceeding with env key", e);
        }
    }

    // Use the variable defined at the top
    checkApiKey();
    const ai = new GoogleGenAI({ apiKey: API_KEY });

    let imageBytes = '';
    let mimeType = '';

    if (imageInput instanceof File) {
        const part = await fileToGenerativePart(imageInput);
        imageBytes = part.inlineData.data;
        mimeType = part.inlineData.mimeType;
    } else if (typeof imageInput === 'string') {
        // Base64 format control (data:image/xxx;base64,xxx) - Boşluk toleranslı
        const match = imageInput.match(/^data:(.*?);\s*base64,\s*(.*)$/);
        if (match) {
            mimeType = match[1];
            imageBytes = match[2];
            console.log('Valid base64 image detected, MIME type:', mimeType, 'Data size:', imageBytes.length, 'chars');
        }
        // URL format control (http:// or https://)
        else if (imageInput.match(/^https?:\/\//i)) {
            console.log('Converting image URL to base64 for video generation...');
            try {
                const response = await fetch(imageInput);
                if (!response.ok) {
                    throw new Error(`Görsel indirilemedi: ${response.status} ${response.statusText}`);
                }
                const blob = await response.blob();
                mimeType = blob.type || 'image/jpeg';
                imageBytes = await blobToBase64(blob);
                console.log('Image converted to base64 successfully, size:', imageBytes.length, 'chars');
            } catch (error) {
                console.error('Error converting URL to base64:', error);
                throw new Error(`Görsel URL'si base64'e çevrilemedi: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
            }
        }
        // Invalid format
        else {
            console.error('Invalid image format provided!');
            throw new Error(`Geçersiz görsel formatı. Lütfen geçerli bir base64 veya URL kullanın.`);
        }
    } else {
        throw new Error("Geçersiz görsel girişi. Lütfen File, Base64 string veya URL kullanın.");
    }

    // MIME type normalization
    if (mimeType && !mimeType.startsWith('image/')) {
        mimeType = `image/${mimeType}`;
    }
    if (!mimeType) mimeType = 'image/png';

    const modelName = settings.quality === 'high' ? 'veo-3.1-generate-preview' : 'veo-3.1-fast-generate-preview';

    // Validate resolution - 4k only available with veo-3.1-generate-preview
    let effectiveResolution = settings.resolution || '720p';
    if (effectiveResolution === '4k' && settings.quality !== 'high') {
        console.warn('4k resolution requires high quality mode. Downgrading to 1080p.');
        effectiveResolution = '1080p';
    }

    // Validate durationSeconds - Veo API supports 4, 6, 8 (5 artık desteklenmiyor)
    let durationSeconds = settings.durationSecs || 4;
    const validDurations = [4, 6, 8];
    if (!validDurations.includes(durationSeconds)) {
        // 5 → 4, 7 → 8 gibi en yakın geçerli değere yuvarlama
        durationSeconds = validDurations.reduce((prev, curr) =>
            Math.abs(curr - durationSeconds) < Math.abs(prev - durationSeconds) ? curr : prev
        );
        console.warn(`⚠️ durationSeconds ${settings.durationSecs} geçersiz, ${durationSeconds}'e yuvarlandı`);
    }

    // Veo 3.1 API: Image-to-Video 4, 6, 8 saniye destekliyor
    const apiDuration = durationSeconds;

    // Enhanced fashion video prompt
    const enhancedPrompt = settings.prompt + ' Professional fashion photography lighting, magazine quality. Professional fashion video. No audio, no music, no sound effects. Silent video only.';

    // Negative prompt for quality filtering
    const negativePrompt = 'blurry, low quality, distorted, deformed, ugly, amateur, watermark, text overlay, logo, rapid movement, shaky camera, horror, violent, cartoon, drawing';

    console.log(`Video üretimi başlatıldı - Çözünürlük: ${effectiveResolution}, Süre: ${apiDuration}s`);

    const MAX_RETRIES = 2;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            if (attempt > 1) {
                console.log(`Video üretim denemesi ${attempt}/${MAX_RETRIES}...`);
                await new Promise(resolve => setTimeout(resolve, 5000));
            }

            let operation = await ai.models.generateVideos({
                model: modelName,
                prompt: enhancedPrompt,
                image: {
                    imageBytes: imageBytes,
                    mimeType: mimeType,
                },
                config: {
                    numberOfVideos: 1,
                    resolution: effectiveResolution,
                    aspectRatio: settings.aspectRatio,
                    durationSeconds: apiDuration, // ZORUNLU KURAL
                    // personGeneration kaldırıldı — Veo API artık 'allow_all' desteklemiyor
                    negativePrompt: negativePrompt,
                }
            });

            console.log('Initial operation response received');

            // Poll for completion with timeout
            let pollCount = 0;
            const maxPolls = 60; // 10 minutes max
            let consecutiveErrors = 0;
            const maxConsecutiveErrors = 3;

            while (!operation.done && pollCount < maxPolls) {
                await new Promise(resolve => setTimeout(resolve, 10000));
                pollCount++;
                console.log(`Polling attempt ${pollCount}/${maxPolls}...`);

                try {
                    const updatedOp = await ai.operations.getVideosOperation({ operation: operation });
                    operation = updatedOp;
                    consecutiveErrors = 0; // Reset on success
                    console.log('Operation status:', { done: operation.done, pollCount });

                    // Check for immediate errors during polling
                    if ((operation as any).error) {
                        const errMsg = String((operation as any).error.message || 'Video işleme sırasında API hatası oluştu.');
                        console.error("Operation error detected during polling:", errMsg);
                        throw new Error(errMsg);
                    }

                } catch (e: any) {
                    // Distinguish between network/polling errors and API errors
                    if (e.message && (e.message.includes('fetch') || e.message.includes('network') || e.message.includes('timeout'))) {
                        consecutiveErrors++;
                        console.warn(`Polling network error (${consecutiveErrors}/${maxConsecutiveErrors}):`, e.message);
                        if (consecutiveErrors >= maxConsecutiveErrors) {
                            throw new Error('Video durumu kontrol edilirken bağlantı koptu. Lütfen tekrar deneyin.');
                        }
                        continue; // Skip to next poll iteration
                    }

                    // Handle "Requested entity was not found" error (common Veo issue)
                    if (e.message && e.message.includes('404')) {
                        console.warn("Polling 404 received.");
                        throw new Error("Video işlenirken bağlantı koptu (404). Lütfen tekrar deneyin.");
                    }
                    console.error('Polling error:', e);
                    throw e;
                }
            }

            if (pollCount >= maxPolls) {
                throw new Error('Video oluşturma zaman aşımına uğradı. Lütfen daha kısa bir video deneyin veya tekrar deneyin.');
            }

            console.log('Final operation response received');

            // Double check error after loop
            if ((operation as any).error) {
                throw new Error(`Video API Hatası: ${String((operation as any).error.message)}`);
            }

            // Get response data
            const responseData = operation.response || (operation as any).result;

            // Check RAI filters FIRST (before trying to extract URI)
            const raiReasons = responseData?.raiMediaFilteredReasons || responseData?.generatedVideos?.[0]?.raiMediaFilteredReason;
            if (raiReasons) {
                const reasons = Array.isArray(raiReasons) ? raiReasons : [raiReasons];
                if (reasons.length > 0 && reasons[0]) {
                    const reason = String(reasons[0]);
                    console.warn("Video blocked by RAI filter:", reason);

                    if (reason.toLowerCase().includes("celebrity") || reason.toLowerCase().includes("identity")) {
                        throw new Error("Güvenlik Filtresi: Görselde ünlü kişi benzerliği algılandı. Farklı bir görsel deneyin.");
                    }
                    if (reason.toLowerCase().includes("child") || reason.toLowerCase().includes("minor")) {
                        throw new Error("Güvenlik Filtresi: Çocuk içeriği tespit edildi. Sadece yetişkin modeller kullanılabilir.");
                    }
                    if (reason.toLowerCase().includes("sexual") || reason.toLowerCase().includes("nsfw")) {
                        throw new Error("Güvenlik Filtresi: Görsel veya prompt güvenli içerik politikasına takıldı.");
                    }
                    throw new Error(`Video güvenlik filtresine takıldı: ${reason}`);
                }
            }

            // Extract video URI
            const videoUri = responseData?.generatedVideos?.[0]?.video?.uri;

            if (!videoUri) {
                const errorDetails = {
                    done: operation.done,
                    hasResponse: !!responseData,
                    hasVideos: !!responseData?.generatedVideos,
                    videoCount: responseData?.generatedVideos?.length || 0,
                };
                console.error('Video generation failed. Operation details:', errorDetails);
                throw new Error(`Video oluşturulamadı. API'den video URI alınamadı. Lütfen görseli veya promptu değiştirip tekrar deneyin.`);
            }

            console.log('Video URI found:', videoUri);

            // Download video - correctly handle URI with/without query params
            try {
                const separator = videoUri.includes('?') ? '&' : '?';
                const videoUrl = `${videoUri}${separator}key=${API_KEY}`;
                const videoRes = await fetch(videoUrl);

                if (!videoRes.ok) {
                    // Try without API key (pre-signed URL case)
                    console.warn(`Video download with API key failed (${videoRes.status}), trying pre-signed URI...`);
                    const videoResNoKey = await fetch(videoUri);
                    if (!videoResNoKey.ok) {
                        throw new Error(`Video indirilemedi: HTTP ${videoRes.status}`);
                    }
                    const blob = await videoResNoKey.blob();
                    if (blob.size < 1000) {
                        throw new Error('İndirilen video dosyası çok küçük, bozuk olabilir.');
                    }
                    return URL.createObjectURL(blob);
                }

                const blob = await videoRes.blob();
                if (blob.size < 1000) {
                    throw new Error('İndirilen video dosyası çok küçük, bozuk olabilir.');
                }
                return URL.createObjectURL(blob);
            } catch (downloadErr: any) {
                throw new Error(`Video indirme hatası: ${downloadErr.message}`);
            }

        } catch (err: any) {
            lastError = err;
            console.error(`Video üretim hatası (deneme ${attempt}/${MAX_RETRIES}):`, err.message);

            // Don't retry on these specific errors - they won't resolve with retry
            const noRetryPatterns = ['güvenlik filtre', 'ünlü', 'çocuk', 'api key', 'api anahtarı', 'raimedialfiltered', 'nsfw', 'sexual', 'invalid_argument', 'out of bound', 'durationseconds'];
            const lowerMsg = err.message?.toLowerCase() || '';
            if (noRetryPatterns.some((p: string) => lowerMsg.includes(p))) {
                throw err;
            }

            if (attempt === MAX_RETRIES) {
                // 🔄 FAL.AI VIDEO FALLBACK
                const errorMsg = err.message?.toLowerCase() || '';
                const isServerIssue = errorMsg.includes('503') || errorMsg.includes('unavailable') ||
                    errorMsg.includes('overloaded') || errorMsg.includes('high demand') ||
                    errorMsg.includes('429') || errorMsg.includes('zaman aşımı');

                if (isServerIssue) {
                    try {
                        const { falGenerateVideo, hasFalApiKey } = await import('./falaiService');
                        if (hasFalApiKey()) {
                            console.log('🔀 Video fallback devreye giriyor...');
                            window.dispatchEvent(new CustomEvent('fal-fallback-active', {
                                detail: { message: '🔄 Video sunucusu yoğun, alternatif AI sunucusuna geçiliyor... Bu işlem biraz daha uzun sürebilir, özür dileriz.' }
                            }));

                            const imageDataUrl = `data:${mimeType};base64,${imageBytes}`;
                            const result = await falGenerateVideo(enhancedPrompt, {
                                imageUrl: imageDataUrl,
                                duration: durationSeconds,
                                aspectRatio: settings.aspectRatio,
                            });

                            window.dispatchEvent(new CustomEvent('fal-fallback-success', {
                                detail: { message: '✅ Video alternatif sunucu ile başarıyla oluşturuldu.' }
                            }));
                            return result;
                        }
                    } catch (falErr: any) {
                        console.error('❌ Video fallback da başarısız');
                        window.dispatchEvent(new CustomEvent('fal-fallback-failed', {
                            detail: { message: '❌ Alternatif video sunucusu da yanıt veremedi.' }
                        }));
                    }
                }

                throw new Error(`Video oluşturulamadı (${MAX_RETRIES} deneme sonrası): ${err.message}`);
            }
        }
    }

    // Fallback
    throw lastError || new Error('Video oluşturulamadı.');
};

export const generateImage = async (
    imageFile: File,
    clothingType: string,
    color: string,
    secondaryColor: string,
    ethnicity: string,
    style: string,
    location: string,
    bodyType: string,
    pose: string,
    hairColor: string,
    hairStyle: string,
    customPrompt: string,
    lighting: string,
    cameraAngle: string,
    cameraZoom: string,
    aspectRatio: '9:16' | '3:4' | '4:5' | '1:1' | '16:9' = '3:4',
    customBackground?: File,
    customBackgroundPrompt?: string,
    fabricType?: string,
    fabricFinish?: string,
    shoeType?: string,
    shoeColor?: string,
    accessories?: string,
    ageRange?: string, // Yaş Aralığı (Child, Teen, Adult, Elderly)
    gender?: string,   // Cinsiyet
    secondProductFile?: File, // İkinci ürün görseli (Alt & Üst kombin için)
    patternImageFile?: File, // Desen/Baskı görseli
    seed?: number, // Seed for consistency
    modelIdentityFile?: File, // Previous generation result for identity locking
    multiItemFiles?: File[] // Çoklu ürün görselleri (2-6 ürün)
): Promise<string[]> => {
    checkApiKey();
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const imagePart = await fileToGenerativePart(imageFile);

    // Convert inputs to parts array
    const promptParts: any[] = [imagePart];

    // Add second product image if provided (for Alt & Üst kombin)
    if (secondProductFile) {
        if (secondProductFile instanceof Blob) {
            const secondPart = await fileToGenerativePart(secondProductFile);
            promptParts.push(secondPart);
        }
    }

    // Çoklu ürün görselleri ekle (Multi-Item mode)
    if (multiItemFiles && multiItemFiles.length > 0) {
        for (let i = 0; i < multiItemFiles.length; i++) {
            if (multiItemFiles[i] instanceof Blob) {
                const itemPart = await fileToGenerativePart(multiItemFiles[i]);
                promptParts.push(itemPart);
            }
        }
    }

    // Add model identity image if provided (Highest priority for face)
    // If reference image is provided, generate stable seed from it to lock the model
    let effectiveSeed = seed;
    if (modelIdentityFile) {
        if (modelIdentityFile instanceof Blob) {
            // 1. Generate Seed (HEAD logic)
            if (!seed) {
                const referenceSeed = await generateStableSeed(modelIdentityFile);
                effectiveSeed = referenceSeed;
                console.log('🔒 Model Identity Locked - Using stable seed from reference image:', referenceSeed);
            } else {
                console.log('🔒 Model Identity Locked - Using EXPLICIT seed provided by App:', seed);
            }

            // 2. Add to prompt parts (Local fix)
            const identityPart = await fileToGenerativePart(modelIdentityFile);
            promptParts.push(identityPart);
            console.log('🔒 Referans Model Kimlik görseli eklendi');
        } else {
            console.warn('⚠️ Referans Model Kimlik görseli geçersiz format (Blob değil), atlanıyor:', typeof modelIdentityFile);
        }
    } else if (seed) {
        console.log('🔓 User-provided seed:', seed);
    } else {
        console.log('🎲 Random seed will be generated');
    }

    // Add pattern image if provided
    if (patternImageFile) {
        if (patternImageFile instanceof Blob) {
            const patternPart = await fileToGenerativePart(patternImageFile);
            promptParts.push(patternPart);
            console.log('📦 Desen görseli eklendi');
        } else {
            console.warn('⚠️ Desen görseli geçersiz format (Blob değil), atlanıyor:', typeof patternImageFile);
        }
    }
    // Add custom background if provided
    if (customBackground) {
        if (customBackground instanceof Blob) {
            const bgPart = await fileToGenerativePart(customBackground);
            promptParts.push(bgPart);
        } else {
            console.warn('⚠️ Özel arka plan görseli geçersiz format (Blob değil), atlanıyor:', typeof customBackground);
        }
    }

    // Get hex codes for colors
    const colorHex = getColorHex(color);
    const secondaryColorHex = getColorHex(secondaryColor);

    // Debug: Log color information  
    if (color) {
        console.log('=== RENK DEBUG ===');
        console.log('Seçilen renk adı:', color);
        console.log('Renk HEX değeri:', colorHex);
        console.log('==================');
    }

    // Create color-focused prompt opening
    const colorOpening = color && colorHex ?
        `KRITIK RENK TALIMAT: Kiyafet rengi MUTLAKA ${color} (${colorHex}) olmalidir. Bu renk ZORUNLUDUR.\n\n` : '';

    const colorClosing = color && colorHex ?
        `\n\n*** FINAL RENK KONTROLU ***\nTEKRAR EDIYORUM: Kiyafet rengi ${color} (${colorHex}) olmalidir. Yeşil, mavi, kırmızı gibi BAŞKA RENKLER KULLANILAMAZ. Sadece ve sadece ${colorHex} kullan.` : '';

    // Special instruction for Alt & Üst (Kombin) mode with two images
    const isKombinMode = clothingType === 'Alt & Üst' && secondProductFile;
    const kombinInstruction = isKombinMode ? `
    *** KOMBİN MODU - İKİ AYRI GÖRSEL ***
    Bu istekte İKİ AYRI kıyafet görseli verilmiştir:
    - BİRİNCİ GÖRSEL: ÜST GİYİM (gömlek, tişört, ceket vb.)
    - İKİNCİ GÖRSEL: ALT GİYİM (pantolon, etek, şort vb.)
    
    Model, HER İKİ kıyafeti de AYNI ANDA giymelidir:
    - Üst bedene BİRİNCİ görseldeki kıyafeti giydir
    - Alt bedene İKİNCİ görseldeki kıyafeti giydir
    - Her iki kıyafetin de orijinal tasarım detayları KORUNMALIDIR
    ` : '';

    // Enhanced detailed descriptions to force consistency across multiple calls
    const gen = gender || 'Female';
    const age = ageRange || 'Adult';
    const ethRaw = ethnicity && ethnicity !== 'Genel Dünya Karması' ? ethnicity : 'diverse international model';
    // Slav değerini Gemini için açıklayıcı prompt'a çevir
    const eth = ethRaw === 'Slav' ? 'Slavic/Eastern European (Russian, Ukrainian type features - fair skin, light eyes, angular cheekbones)' : ethRaw;

    const isMale = gen === 'Male';

    const consistentModelDesc = isMale
        ? `A handsome 26-year-old male fashion model, 185cm tall, athletic build, sharp symmetrical jawline, specific short dark hair (cleanly tapered sides), deep brown eyes, and a neutral professional high-fashion expression. He has a very specific and consistent facial structure.`
        : `A beautiful 24-year-old female fashion model, 175cm tall, slender and elegant build, long dark brown hair styled in a sleek professional low ponytail, almond-shaped hazel eyes, oval face with high cheekbones, and a sophisticated neutral expression. She has a very specific and consistent facial identity.`;

    const identityInstruction = modelIdentityFile ? `
    *** MÜKEMMEL YÜZ EŞLEŞTİRME VE DEVAMLILIK KURALI (STRICT IDENTITY LOCK) ***
    - Referans olarak verilen "Model Kimlik Görseli"ni (Image 2) analiz et. Bu görseldeki kişinin yüzünü, saç dokusunu, saç rengini, etnik kökenini ve ifadesini %100 KOPYALA.
    - KRİTİK: Aşağıdaki metin bazlı parametreler (etnik köken, saç rengi vb.) Image 2 ile çelişirse, KESİNLİKE Image 2'deki görsel veriyi öncelikli al.
    - Ana girdi görselindeki (Image 1 - kıyafet referansı) mankeni YOKSAY.
    - HEDEF: Image 1'deki KIYAFETİ al, Image 2'deki KİŞİYE giydir.
    - SONUÇ: Tıpatıp aynı yüz, aynı kimlik, yeni kıyafet.
    - Devamlılık: Bu kişinin yüz hatları ve vücut oranları hiçbir şekilde değişmemelidir.
    ` : `
    *** MUTLAK YASAK VE TUTARLI KİMLİK PROTOKOLÜ (FORBIDDEN FACE & CONSISTENCY) ***
    1. Girdi görselindeki yüz, ASLA ve ASLA çıktıya taşınmamalıdır.
    2. Girdi görselini bir "Başsız Manken" (Headless Mannequin) olarak kabul et. Üzerindeki kafayı "GEÇERSİZ VERİ" olarak işaretle ve SİL.
    3. HEDEF: Aşağıda tanımlanan "Hedef Model Kimliği"ne göre SIFIRDAN bir kafa ve yüz oluştur.
    4. KİMLİK SABİTLEME: Seed('${seed || 'random'}') değerini kullanarak her seferinde AYNI YÜZÜ üret.
    
    CHARACTER & CLOTHING CONTINUITY (ABSOLUTE RULES):
    - CHARACTER CONSISTENCY: Render the EXACT SAME PERSON in every generation. Facial features, hair texture, and body proportions must be 100% identical.
    - CLOTHING FIDELITY: The clothing piece from Image 1 must be the EXACT SAME garment. Do not change neckline, seams, buttons, or structural details.
    - NO DRIFT: Do not allow the model's face or the garment's design to drift or vary between different poses or locations.

    ALGORİTMA:
    Adım 1: Referans görseldeki kıyafeti analiz et.
    Adım 2: Referans görseldeki "İnsan/Manken" katmanını tamamen yoksay.
    Adım 3: Seed ve Model Kimliği (Reference: ${consistentModelDesc}) özelliklerine göre sabit bir insan yarat.
    Adım 4: Analiz ettiğin kıyafeti bu sabit insana giydir.
    `;

    let prompt = colorOpening + kombinInstruction + `Yüksek çözünürlüklü, 2K kalitesinde (en az 2048px), 'Award Winning' bir moda fotoğrafı oluştur.
    
    ${identityInstruction}
    
    ${isKombinMode ? 'Girdi olarak verilen İKİ AYRI kıyafet görselini (üst ve alt), gerçekçi bir canlı modele birlikte giydir.' : 'Girdi olarak verilen kıyafet görselini, gerçekçi bir canlı modele giydir.'}
    
    *** 1. RENK KONTROLU - EN YÜKSEK ÖNCELİK (Bu kurala tam uyum ZORUNLUDUR) ***
    ${color && colorHex ? `
    >>> KıYAFET RENGİ KURALI <<<
    - Kıyafet rengi KESİNLİKLE "${color}" (HEX: ${colorHex}) OLMALIDIR.
    - Bu RGB/HEX değerini KULLAN: ${colorHex}
    - Referans görseldeki kıyafet FARKLI renkte olsa bile, ONU YOKSAY ve ${colorHex} rengine DÖNÜŞTÜR.
    - ${color} rengini TAM OLARAK uygula. Benzer tonlar KABUL EDİLMEZ.
    - Işıklandırma SADECE gölge/parlaklık ekler, ${colorHex} temel rengini DEĞİŞTİRMEZ.
    ` : color ? `
    >>> KıYAFET RENGİ KURALI <<<
    - Kıyafet rengi KESİNLİKLE "${color}" OLMALIDIR.
    - Referans görseli YOKSAY, sadece "${color}" rengini kullan.
    ` : `
    >>> KıYAFET RENGİ KURALI <<<
    - Referans görseldeki kıyafet rengini %100 KORU.
    `}
    ${secondaryColor && secondaryColorHex && (clothingType === 'Alt & Üst' || clothingType === 'Takım Elbise') ? `
    >>> İKİNCİ RENK (${clothingType === 'Takım Elbise' ? 'Gömlek/İç' : 'Alt Parça'}) <<<
    - ${clothingType === 'Takım Elbise' ? 'Gömlek/İç' : 'Alt parça'} rengi "${secondaryColor}" (HEX: ${secondaryColorHex}) OLMALIDIR.
    - RGB/HEX: ${secondaryColorHex}
    ` : ''}
    
    *** 2. MARKA VE TASARIM KORUMA TALİMATLARI ***
    - TASARIM SADAKATİ: Kıyafetin kesimi, dikiş detayları, yaka şekli ve kalıbı referans görselle tıpatıp aynı olmalıdır.
    
    ${LOGO_FIDELITY_BLOCK}
    
    *** 3. KRİTİK: MODEL KİMLİĞİ VE YÜZ AYRIMI ***
    - GÖREV: Referans görseldeki KIYAFETİ al, yeni bir insan modele giydir.
    - DİKKAT: Referans görselde bir insan veya manken resmi varsa, onun YÜZÜNÜ ve KİMLİĞİNİ KESİNLİKLE KULLANMA. O sadece bir mankendir.
    - HEDEF: Aşağıdaki fiziksel özelliklere sahip YENİ ve ÖZGÜN bir model oluştur ve kıyafeti ona giydir.
    
    
    *** 3. GÖRSEL KALİTESİ VE HİPER-GERÇEKÇİLİK TALİMATLARI ***:
    1. FOTOĞRAFÇILIK STANDARDI: Bu bir "dijital sanat" veya "CGI" değil, %100 GERÇEK BİR FOTOĞRAF (RAW PHOTO) olmalıdır.
    2. KAMERA VE LENS: Hasselblad X2D 100C veya Sony A7R V ile çekilmiş gibi görünmeli. 85mm f/1.2 portre lensi kullanılmış gibi alan derinliği ve bokeh etkisi yarat.
    3. CİLT DOKUSU (KRİTİK):
       - "AIRBRUSH" VEYA "PLASTİK CİLT" EFEKTİ KESİNLİKLE YASAKTIR.
       - Ciltte doğal gözenekler, mikro kusurlar, ince tüyler, benler ve renk eşitsizlikleri (melanin variation) bulunmalıdır.
       - Işık ciltte "Subsurface Scattering" (SSS) etkisiyle doğal bir şekilde dağılmalı.
    4. KUMAŞ DOKUSU: Kumaşın iplik yapısı (weave), dikişlerdeki gerilim, kumaşın ağırlığı ve yerçekimine tepkisi fiziksel olarak kusursuz olmalı.
    5. IŞIKLANDIRMA: "Studio Softbox" + "Rim Light" setup kullan. Işık patlamalarını önle ama kontrastı koru. Yüzde sert gölgelerden kaçın.
    6. YASAKLI ÖGELER (NEGATIVE PROMPT):
       - Cartoonish, 3D Render, Plastik Görünüm, Aşırı Pürüzsüz Cilt, Yamuk Eller, Fazla Parmaklar, Bulanık Yüz Hatları.
       
    ${fabricType ? `7. ÖZEL KUMAŞ TALİMATI: Kumaş tipi "${fabricType}". ${fabricType === 'Deri'
            ? 'DERİ DOKU DETAYLARI (KRİTİK): Deri yüzeyinde doğal doku çizgileri (grain pattern), hafif parlaklık ve mat alanlar, dikiş detayları NET görünmeli. Işık derinin üzerinde gerçekçi bir şekilde yansımalı. Deri kalınlığı ve ağırlığı hissedilmeli. Yüzeyde doğal kırışıklıklar ve doku varyasyonları olmalı.'
            : fabricType === 'Triko'
                ? 'TRİKO DOKU DETAYLARI (KRİTİK): Örgü yapısı (knit texture) ve iplik detayları AÇIKÇA görünmeli. Her bir örgü ilmeği seçilebilir netlikte olmalı. Trikonun yumuşak, esnek yapısı ve doğal kıvrımları hissedilmeli. Işık örgü dokusunun üzerinde gerçekçi gölgeler oluşturmalı.'
                : `Bu kumaşın ışığı yansıtma ve kırışma özelliklerini tam olarak yansıt.`
            }` : ''}
    ${fabricFinish ? `8. KUMAŞ YÜZEYİ: "${fabricFinish}" bitişi.` : ''}
    
    *** 4. GÖRSEL TUTARLILIK ***:
    - Eller ve parmaklar anatomik olarak %100 doğru olmalı (AI hand artifact'lerinden kaçın).
    - Gözler canlı, nemli ve odaklanmış olmalı (Dead eyes look engellenmeli).
    4. Kamera Tekniği: ${cameraAngle} açısı ile ${cameraZoom === 'Yakın' ? 'yakın çekim (close-up), detaylar net görünmeli' : cameraZoom === 'Uzak' ? 'UZAK ÇEKİM (FULL BODY SHOT) - TÜM VÜCUT: Baştan ayakkabılara kadar tüm vücut görünmeli. Ayaklar ve ayakkabılar MUTLAKA çerçevede olmalı. Model tam boy çekilmeli' : 'orta mesafe çekim (medium shot), bel üstü'}. Arka plan (bokeh) estetik bir şekilde bulanıklaştırılarak odak modelde tutulmalı.
    
    *** 4. KIYAFET YAPILANDIRMASI ***:
    Kıyafet Türü: ${clothingType}
    ${clothingType === 'Genel' && color ? `Kıyafet rengi: ${color}` : ''}

    ${patternImageFile ? `
    *** MUTLAK KURAL: GÖRSEL GÖREV DAĞILIMI (ROLE ASSIGNMENT) ***
    
    BU ISTEKTE EN AZ İKİ FARKLI GÖRSEL VARDIR. GÖREVLERİ KARIŞTIRMA!
    
    GÖRSEL 1 (KIYAFET REFERANSI):
    - ROL: PATRON, KESİM ve TASARIM KAYNAĞI.
    - GÖREV: Modelin giyeceği kıyafetin ŞEKLİ, KALIBI, YAKASI, KOLLARI ve ETEK BOYU %100 BURADAN ALINACAKTIR.
    - KISITLAMA: Bu kıyafetin rengini veya desenini YOKSAY (Desen Görseli baskındır).
    
    GÖRSEL 2 (DESEN GÖRSELİ - SONDAKİ GÖRSEL):
    - ROL: KAPLAMA ve DOKU KAYNAĞI (TEXTURE MATERIAL).
    - GÖREV: Bu görseldeki renkleri ve desenleri al.
    - İŞLEM: Görsel 1'deki kıyafetin şeklini BOZMADAN, bu deseni üzerine YENİ BİR KUMAŞ GİBİ KAPLA.
    - YASAK: Görsel 2'deki kıyafetin ŞEKLİNİ veya KESİMİNİ KOPYALAMA. Sadece desenini al.
    
    SONUÇ: GÖRSEL 1'in ŞEKLİ + GÖRSEL 2'nin DESENİ.
    ` : ''}
    
    ${getStylePromptFragment(style)} `;

    // Çoklu ürün modu - Giyim katmanlama kuralları
    if (multiItemFiles && multiItemFiles.length > 0) {
        const totalImages = 1 + multiItemFiles.length; // Ana ürün + ek ürünler
        prompt += `

*** ÇOKLU ÜRÜN GİYDİRME MODU ***
Bu istekte toplamda ${totalImages} farklı kıyafet/aksesuar görseli verilmiştir.
HER BİR ÜRÜNÜ modelin üzerinde DOĞRU KATMANLAMA SIRASI ile giydirmelisin.

GİYİM KATMANLAMA KURALLARI (İÇTEN DIŞA DOĞRU):
1. İÇ KATMAN: İç çamaşırı, atlet, fanila (görünmez)
2. TEMEL KATMAN: Tişört, gömlek, bluz, body
3. ARA KATMAN: Yelek, süveter, hırka, kazak
4. DIŞ KATMAN: Ceket, mont, kaban, palto, trençkot
5. ALT GİYİM: Pantolon, etek, şort, tayt
6. AYAKKABI: Spor ayakkabı, bot, topuklu, sandalet
7. AKSESUAR: Şapka, şal, çanta, güneş gözlüğü, kolye, saat, kemer

KRİTİK KURALLAR:
- Yelek HER ZAMAN gömleğin/tişörtün ÜSTÜNE giyilir
- Mont/ceket HER ZAMAN yeleğin ÜSTÜNE giyilir
- Pantolon/etek HER ZAMAN ayakkabının ÜSTÜNDE görünür
- Atkı/şal ceketin/montun ÜSTÜNE veya altına giyilebilir
- Kemer pantolonun/eteğin beline takılır
- Her ürünün rengi, deseni ve kumaş dokusu AYNEN korunmalıdır
- Ürünlerin birbirleriyle uyumlu bir stil oluşturması önemlidir
- TÜM ürünler tek bir model üzerinde GİYDİRİLMİŞ olarak gösterilmelidir

Verilen ${totalImages} görselin her birini analiz et ve doğru katmanlama sırasına göre modele giydir.
`;
    }

    // Kullanıcı Özel İsteği (En yüksek öncelik)
    if (customPrompt && customPrompt.trim().length > 0) {
        prompt += ` \nKULLANICI ÖZEL İSTEĞİ(Buna kesinlikle uy): ${customPrompt}.`;
    }

    // Explicit Identity Instruction Block
    // Explicit Identity Instruction Block (Variables already defined above)

    prompt += `
    *** MODEL KİMLİĞİ TALİMATI ***
        - Cinsiyet: ${gen === 'Female' ? 'Kadın (Female)' : 'Erkek (Male)'}
- Yaş Grubu: ${age}
- Etnik Köken: ${eth}
- YÜZ ÖZELLİKLERİ: Bu seed('${seed || 'random'}') için benzersiz ve tutarlı bir yüz yapısı oluştur.Referans resimdeki insan yüzünü KESİNLİKLE KOPYALAMA.
    `;

    if (bodyType && bodyType !== 'Standart') {
        if (bodyType === 'Battal Beden') {
            prompt += ` Modelin vücut tipi: Battal Beden (Extremely Plus Size, Heavy Build, over 130kg). Model çok kilolu ve iri yapılı görünmelidir.`;
        } else {
            prompt += ` Modelin vücut tipi: ${bodyType}.`;
        }
    }

    if (ageRange && ageRange !== 'Adult') {
        prompt += ` Modelin yaş grubu: ${ageRange} (Child: çocuk, Teen: genç, Adult: yetişkin, Elderly: yaşlı). Model kesinlikle bu yaş grubunda görünmelidir.`;
    }

    if (gender && gender !== 'Female') { // Varsayılan genellikle kadın modeldir, belirtilmişse ekle
        prompt += ` Modelin cinsiyeti: ${gender === 'Male' ? 'Erkek' : 'Kadın'}.`;
    }

    if (pose && pose !== 'Rastgele') {
        prompt += ` Modelin pozu: ${pose}. Duruş doğal, anatomik olarak doğru ve estetik olmalıdır.`;
    }

    if (hairColor && hairColor !== 'Doğal') {
        prompt += ` Modelin saç rengi: ${hairColor}. Saç telleri tek tek seçilebilir detayda olmalıdır.`;
    }

    if (hairStyle && hairStyle !== 'Doğal') {
        prompt += ` Modelin saç stili: ${hairStyle}.`;
    }

    // Shoe settings
    if (shoeType && shoeType.trim()) {
        prompt += ` *** AYAKKABI TALİMATI ***: Model ${shoeType} giymelidir.`;
        if (shoeColor && shoeColor.trim()) {
            prompt += ` Ayakkabı rengi: ${shoeColor}.`;
        }
        prompt += ` Ayakkabılar çerçevede NET görünmelidir(tam vücut çekiminde).`;
    }

    // Accessories
    if (accessories && accessories.trim()) {
        prompt += ` *** AKSESUAR TALİMATI ***: Model ${accessories} kullanmalıdır.Aksesuar doğal ve estetik bir şekilde modelin üzerinde / elinde olmalıdır.`;
    }

    if (customBackground) {
        prompt += ` *** ARKA PLAN TALİMATI ***: Modeli, sağlanan İKİNCİ görseldeki(arka plan görseli) mekana yerleştir.Işıklandırmayı bu arka planla uyumlu hale getir.`;
        if (customBackgroundPrompt && customBackgroundPrompt.trim()) {
            prompt += ` Arka plan detayı: ${customBackgroundPrompt}.`;
        }
    } else {
        prompt += ` ${getLocationPromptFragment(location)} `;
        if (customBackgroundPrompt && customBackgroundPrompt.trim()) {
            prompt += ` Arka plan ek detay: ${customBackgroundPrompt}.`;
        }
    }

    prompt += ` Model doğrudan kameraya(veya promptta belirtilen yöne), kendine güvenen, profesyonel bir model ifadesiyle bakmalıdır.`;

    // FINAL CHECKLIST (Recency Bias Leverage)
    prompt += `
    
    *** FİNAL KONTROL LİSTESİ (BUNLARI ONAYLAMADAN ÇİZİME BAŞLAMA) ***
    1. KIYAFET: Şekil, kesim ve dikişler GÖRSEL 1 (Kıyafet) ile AYNI MI? -> EVET.
    ${patternImageFile ? '2. DESEN: Kıyafetin üzerindeki doku GÖRSEL 2 (Desen) ile AYNI MI? -> EVET (Ama şekli görsel 2 den ALMA!)' : ''}
    ${modelIdentityFile ? '3. YÜZ: Yüz hatları, "Kimlik Görseli"ndeki kişiyle AYNI MI? -> EVET (Face Swap Yapıldı).' : '3. YÜZ: Referans resimdeki yüz SİLİNDİ Mİ? -> EVET (Yeni yüz yaratıldı).'}
    4. RENK: İstenilen renk TAM OTURDU MU? -> EVET.
    `;

    // Add final color reminder at the end
    prompt += colorClosing;

    // Add text prompt to parts
    promptParts.push({ text: prompt });

    // 🔥 gemini-3-pro-image-preview ile 2K çıktı üret
    const selectedModel = LIVE_MODEL_PRIMARY;
    const targetAspectRatio = aspectRatio === '16:9' ? '16:9' :
        aspectRatio === '9:16' ? '9:16' :
            aspectRatio === '1:1' ? '1:1' :
                '3:4';

    console.log('🚀 Canlı Model Üretimi başlatıldı - 2K çözünürlük');

    try {
        const response = await ai.models.generateContent({
            model: selectedModel,
            contents: {
                parts: promptParts,
            },
            config: {
                responseModalities: [Modality.IMAGE],
                ...(effectiveSeed ? { seed: effectiveSeed } : {}),
                candidateCount: 1, // Maliyet optimizasyonu: tek sonuç üret
                imageConfig: {
                    imageSize: '2K',
                    aspectRatio: targetAspectRatio,
                }
            },
        });

        // Tüm candidate'lerden görselleri topla
        const results: string[] = [];

        if (response.candidates) {
            for (const candidate of response.candidates) {
                if (candidate.finishReason && candidate.finishReason !== 'STOP' && !candidate.content?.parts) {
                    console.warn(`⚠️ Candidate atlandı, sebep: ${candidate.finishReason}`);
                    continue;
                }
                const parts = candidate.content?.parts;
                if (parts) {
                    for (const part of parts) {
                        if (part.inlineData) {
                            results.push(`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`);
                        }
                    }
                }
            }
        }

        if (results.length === 0) {
            throw new Error("API'den görsel alınamadı.");
        }

        console.log(`✅ ${results.length} sonuç başarıyla üretildi`);
        return results;
    } catch (e: any) {
        console.error('❌ Üretim başarısız:', e.message);

        // Fallback: gemini-3.1-flash-image-preview ile tek sonuç dene
        console.log('🔀 Fallback ile tekli üretim deneniyor...');
        try {
            const fallbackResponse = await ai.models.generateContent({
                model: 'gemini-3.1-flash-image-preview',
                contents: {
                    parts: promptParts,
                },
                config: {
                    responseModalities: [Modality.IMAGE],
                    ...(effectiveSeed ? { seed: effectiveSeed } : {}),
                    imageConfig: {
                        imageSize: '2K',
                        aspectRatio: targetAspectRatio,
                    }
                },
            });

            const candidate = fallbackResponse.candidates?.[0];
            if (candidate?.content?.parts) {
                for (const part of candidate.content.parts) {
                    if (part.inlineData) {
                        console.log('✅ Fallback ile 1 sonuç üretildi');
                        return [`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`];
                    }
                }
            }
            throw new Error("Fallback model de görsel üretemedi.");
        } catch (fallbackError) {
            console.error('❌ Fallback de başarısız');
            throw e; // Orijinal hatayı fırlat
        }
    }
};

export const upscaleImage = async (imageFile: File): Promise<string> => {
    // Check for API key selection for pro models (required for gemini-3-pro-image-preview)
    if (typeof window !== 'undefined' && (window as any).aistudio) {
        const aistudio = (window as any).aistudio;
        try {
            const hasKey = await aistudio.hasSelectedApiKey();
            if (!hasKey) {
                await aistudio.openSelectKey();
            }
        } catch (e) {
            console.warn("AI Studio key selection check failed, proceeding with env key", e);
        }
    }

    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const imagePart = await fileToGenerativePart(imageFile);

    const prompt = `Upscale this image to 4K resolution.Enhance details, sharpness, and textures while strictly preserving the original colors, composition, and identity of the subject.`;

    try {
        const response = await ai.models.generateContent({
            model: LIVE_MODEL_PRIMARY,
            contents: {
                parts: [
                    imagePart,
                    { text: prompt },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE],
                imageConfig: {
                    imageSize: "4K",
                    aspectRatio: "3:4"
                }
            },
        });

        const candidate = response.candidates?.[0];
        const parts = candidate?.content?.parts;

        if (parts) {
            for (const part of parts) {
                if (part.inlineData) {
                    return `data:${part.inlineData.mimeType}; base64, ${part.inlineData.data} `;
                }
            }
        }
        throw new Error("Upscaling failed. No image returned.");
    } catch (e) {
        console.error("Upscale Error:", e);
        throw e;
    }
};

/**
 * Generates a collage from multiple images
 * @param imageFiles Array of 2-6 image files
 * @param prompt User instructions for the composition
 * @param aspectRatio Desired aspect ratio for the output
 * @returns Base64 data URL of the generated collage
 */
export const generateCollage = async (
    imageFiles: File[],
    prompt: string,
    aspectRatio: '1:1' | '16:9' | '9:16' | '3:4' | '4:3' = '16:9'
): Promise<string> => {
    if (imageFiles.length < 2 || imageFiles.length > 6) {
        throw new Error('Lütfen 2-6 arası görsel yükleyin');
    }

    const ai = new GoogleGenAI({ apiKey: API_KEY });

    try {
        // Convert all images to generative parts
        const imageParts = await Promise.all(
            imageFiles.map(file => fileToGenerativePart(file))
        );

        // Build the prompt with clear instructions
        const fullPrompt = `Create a professional collage composition from these ${imageFiles.length} images.

USER INSTRUCTIONS:
${prompt}

COMPOSITION RULES:
1. Arrange all ${imageFiles.length} images in a visually appealing layout
2. Maintain the quality and clarity of each image
3. Create smooth transitions between images
4. Use professional design principles (balance, harmony, contrast)
5. Ensure all images are clearly visible
6. Create a cohesive final composition

OUTPUT REQUIREMENTS:
- High quality, professional result
- Clean and polished appearance
- All images integrated seamlessly
- Aspect ratio: ${aspectRatio}

*** IDENTITY PRESERVATION RULES (ABSOLUTE) ***:
1. DO NOT CHANGE FACES: The identities of any people in the input images must remain 100% IDENTICAL.
2. NO GENERATIVE FACES: Do not generate new faces or "fix" faces unless explicitly asked.
3. PRESERVE LIKENESS: Keep facial features, expressions, and age exactly as they appear in the source.
4. NO BLENDING: Do not blend faces from different images.`;

        // Add all image parts and the text prompt
        const parts = [...imageParts, { text: fullPrompt }];

        const response = await ai.models.generateContent({
            model: LIVE_MODEL_PRIMARY,
            contents: {
                parts: parts,
            },
            config: {
                responseModalities: [Modality.IMAGE],
                imageConfig: {
                    aspectRatio: aspectRatio,
                    imageSize: '2K', // Higher quality output
                }
            },
        });

        const candidate = response.candidates?.[0];
        const responseParts = candidate?.content?.parts;

        if (responseParts) {
            for (const part of responseParts) {
                if (part.inlineData) {
                    return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                }
            }
        }

        throw new Error("Kolaj oluşturulamadı. API'den görsel döndürülmedi.");
    } catch (e) {
        console.error("Collage Generation Error:", e);
        throw e;
    }
};

/**
 * Generates a specialized product collage from multiple products
 * @param products Array of product items with metadata
 * @param background Background style or custom color
 * @param aspectRatio Desired aspect ratio for the output
 * @param customPrompt Optional additional user instructions
 * @returns Base64 data URL of the generated collage
 */
export interface ProductItem {
    id: string;
    file: File | string;
    name: string;
    price?: string;
    description?: string;
    preview?: string; // Base64 preview for UI
}

/**
 * Analyzes an outfit image and returns a list of detected products
 * @param imageFile The main outfit image
 * @returns Array of ProductItem objects
 */
export const analyzeOutfitItems = async (imageInput: File | string): Promise<ProductItem[]> => {
    checkApiKey();
    const ai = new GoogleGenAI({ apiKey: API_KEY });

    let imagePart;
    let originalFile: File;

    if (typeof imageInput === 'string') {
        const file = await base64ToFile(imageInput, 'analysis_input.png');
        originalFile = file;
        imagePart = await fileToGenerativePart(file);
    } else {
        originalFile = imageInput;
        imagePart = await fileToGenerativePart(imageInput);
    }

    const prompt = `Bu moda görselindeki TÜM kıyafetleri, ayakkabıları ve aksesuarları (saat, gözlük, çanta, şapka vb.) tek tek tespit et. 
    
    KURALLAR (KRİTİK):
    1. AYAKKABILAR: Ayakkabıları asla "Sağ Ayakkabı" veya "Sol Ayakkabı" olarak AYIRMA. Her ikisini tek bir box içine alan tek bir "Ayakkabı" (Çift) öğesi döndür.
    2. PARÇALARA AYIR: Kombinleri (örneğin takım elbise) mutlaka parçalarına ayır: "Ceket", "Pantolon", "Gömlek", "Kravat".
    3. box_2d: Ürünü tam kaplayan [üst, sol, alt, sağ] koordinatları (0-1000).
    4. price: Ürün için gerçekçi bir piyasa satış fiyatı tahmini (SADECE rakam ve TL simgesi, örn: "1.299 TL").
    
    SADECE aşağıdaki JSON'u döndür:
    [
      {
        "name": "Ürün Adı (Türkçe)", 
        "description": "Profesyonel moda açıklaması (Türkçe)", 
        "category": "Kategori",
        "price": "Fiyat (TL)",
        "box_2d": [ymin, xmin, ymax, xmax]
      }
    ]
    JSON dışında metin yazma.`;

    try {
        const result = await ai.models.generateContent({
            model: 'gemini-3.1-flash-image-preview',
            contents: {
                parts: [imagePart, { text: prompt }],
            }
        });

        const responseText = result.candidates?.[0]?.content?.parts?.[0]?.text || "";
        if (!responseText) {
            throw new Error("API'den metin yanıtı alınamadı.");
        }

        const jsonMatch = responseText.match(/\[.*\]/s);
        const jsonStr = jsonMatch ? jsonMatch[0] : responseText;
        const detectedItems = JSON.parse(jsonStr);

        // Kırpma işlemlerini paralel yapalım
        const productPromises = detectedItems.map(async (item: any) => {
            let croppedFile: File | string = originalFile;
            let previewUrl = "";

            // Eğer koordinatlar varsa resmi kırpalım
            if (item.box_2d && Array.isArray(item.box_2d) && item.box_2d.length === 4) {
                try {
                    const cropped = await cropImageFromFile(originalFile, item.box_2d as [number, number, number, number]);
                    croppedFile = cropped;
                    previewUrl = await fileToBase64(cropped);
                } catch (err) {
                    console.warn(`Kırpma hatası (${item.name}):`, err);
                }
            }

            // Fallback: Kırpma yapılamadıysa veya koordinat yoksa orijinalden önizleme al
            if (!previewUrl) {
                try {
                    previewUrl = await fileToBase64(originalFile);
                } catch (e) {
                    console.error("Preview fallback failed:", e);
                    previewUrl = ""; // Son çare boş string, ama UI'da kontrol edeceğiz
                }
            }

            return {
                id: Math.random().toString(36).substring(7),
                file: croppedFile,
                name: item.name,
                description: item.description,
                price: item.price || "Fiyat Belirtilmedi",
                preview: previewUrl || undefined
            };
        });

        return await Promise.all(productPromises);
    } catch (e) {
        console.error("Outfit Analysis Error:", e);
        throw new Error("Görseldeki ürünler analiz edilemedi.");
    }
};

/**
 * Generates an automatic product collage from a single outfit/inspiration image
 * @param imageFile The main outfit image
 * @param aspectRatio Desired aspect ratio
 * @returns Base64 data URL of the generated collage
 */
export const generateAutoProductCollage = async (
    imageFile: File,
    aspectRatio: '1:1' | '16:9' | '9:16' | '3:4' | '4:3' = '16:9'
): Promise<string> => {
    checkApiKey();
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const imagePart = await fileToGenerativePart(imageFile);

    const fullPrompt = `GÖREV: PROFESYONEL FLAT LAY MODA EDİTÖRYALİ (DERGİ KONSEPTİ)
    Bu kombin görselini analiz et ve içindeki parçaları bir "Flat Lay" (yukarıdan aşağıya düz serim) moda çekimi estetiğiyle yeniden oluştur.
    
    TASARIM KURALLARI (KRİTİK):
    1. KONSEP VE ARKA PLAN: Ürünler, estetik bir mermer yüzey veya yumuşak dokulu nötr bir keten kumaş (linen) üzerine sanatsal bir şekilde dizilmelidir. (Kullanıcının paylaştığı minimalist ve lüks Flat Lay tarzı).
    2. YERLEŞİM: Ana kombin parçaları (Örn: Üst, Alt) merkeze yakın yerleştirilmeli. Aksesuarlar (Gözlük, Parfüm, Takı, Çanta) çevreye zarifçe serpiştirilmelidir.
    3. REFERANS GÖRSEL: Yüklenen Orijinal Kombin Görselini, tasarımın bir köşesine veya merkezine yakın bir yere, şık bir "İlham Fotoğrafı" (Inspiration Shot) veya "Referans Kare" olarak yerleştir. Bu görsel profesyonel bir çerçeve veya şık bir Polaroid kağıdı üzerinde duruyormuş gibi görünmelidir.
    4. KESİT DEĞİL, ÜRÜN: Diğer ayrıştırılmış ürünler orijinal resimden kırılarak alınmamalıdır. Her biri sanki profesyonel bir ürün çekimindeymiş gibi; TAMAMI GÖRÜNEN, net, ütülü ve temiz birer bağımsız ürün fotoğrafı olarak çizilmelidir.
    5. AYAKKABILAR: Ayakkabılar şık bir çift (sağ ve sol yan yana) olarak sergilenmelidir.
    6. IŞIKLANDIRMA: Yumuşak, doğal gün ışığı (sunlight) efekti. Hafif, gerçekçi yumuşak gölgeler (soft shadows).
    7. ESTETİK: "Vogue" veya "Harper's Bazaar" moda çekimi kalitesinde, minimalist, temiz ve ultra premium bir görünüm.
    8. GERÇEKÇİLİK (ZORUNLU): Bu bir İLLÜSTRASYON DEĞİL, bir FOTOĞRAF olmalıdır. Ürünlerin kırışıklıkları, dikiş izleri ve dokuları %100 görünmelidir. "Dijital Sanat" veya "Vektör" görünümü YASAKTIR.
    
    ÇIKTI:
    Bu sanatsal Flat Lay kompozisyonunun tek bir yüksek çözünürlüklü görselini oluştur.
    Boyut Oranı: ${aspectRatio}`;

    try {
        const response = await ai.models.generateContent({
            model: LIVE_MODEL_PRIMARY,
            contents: {
                parts: [imagePart, { text: fullPrompt }],
            },
            config: {
                responseModalities: [Modality.IMAGE],
                imageConfig: {
                    aspectRatio: aspectRatio,
                    imageSize: '2K',
                }
            },
        });

        const candidate = response.candidates?.[0];
        const responseParts = candidate?.content?.parts;

        if (responseParts) {
            for (const part of responseParts) {
                if (part.inlineData) {
                    return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                }
            }
        }

        throw new Error("Otomatik kolaj oluşturulamadı. API'den görsel döndürülmedi.");
    } catch (e) {
        console.error("Auto Collage Generation Error:", e);
        throw e;
    }
};

export const generateProductCollage = async (
    products: ProductItem[],
    background: string,
    aspectRatio: '1:1' | '16:9' | '9:16' | '3:4' | '4:3' = '16:9',
    customPrompt?: string,
    mainImage?: File
): Promise<string> => {
    if (products.length < 1 || products.length > 6) {
        throw new Error('Lütfen 1-6 arası ürün ekleyin');
    }

    const ai = new GoogleGenAI({ apiKey: API_KEY });

    try {
        // Convert all products to generative parts
        const productParts = await Promise.all(
            products.map(async (p) => {
                if (typeof p.file === 'string') {
                    const file = await base64ToFile(p.file, `product_${p.id}.png`);
                    return fileToGenerativePart(file);
                }
                return fileToGenerativePart(p.file);
            })
        );

        // Add main image if provided
        let mainImagePart = null;
        if (mainImage) {
            mainImagePart = await fileToGenerativePart(mainImage);
        }

        // Build a detailed prompt for product collage
        let backgroundInstruction = '';
        if (background === 'corkboard') {
            backgroundInstruction = 'The background should be a realistic brown corkboard texture.';
        } else if (background === 'white') {
            backgroundInstruction = 'The background should be a clean, minimalist white studio floor or frame.';
        } else if (background === 'black') {
            backgroundInstruction = 'The background should be a sleek black frame or elegant dark surface.';
        } else if (background.startsWith('#')) {
            backgroundInstruction = `The background should be a solid color with hex code ${background}.`;
        } else {
            backgroundInstruction = `The background should be ${background}.`;
        }

        const productDetails = products.map((p, i) =>
            `Product ${i + 1}: "${p.name}"${p.price ? `, Price: ${p.price}` : ''}${p.description ? `, Description: ${p.description}` : ''}`
        ).join('\n');

        const fullPrompt = `${mainImage ? 'GÖREV: PROFESYONEL KOMBİN AYRIŞTIRMA VE KOMPOZİSYON' : 'GÖREV: ÜRÜN KATALOG KOLAJI'}
        
        ARKA PLAN:
        ${backgroundInstruction}

        BİLEŞENLER:
        ${mainImage ? '- ANA MERKEZ GÖRSEL: Sağlanan ilk görsel (kombinin bütünü).' : ''}
        ${productDetails}

        STİL VE YERLEŞİM KURALLARI:
        1. MERKEZİ ODAK: ${mainImage ? 'Ana kombin görselini (ilk görsel) kolajın tam ortasına, diğer parçalardan daha büyük bir polaroid olarak yerleştir.' : 'Ürünleri dengeli bir katalog düzeninde yerleştir.'}
        2. ÜRÜN POLAROIDLERİ: ${mainImage ? 'Diğer ürünleri (kırpılmış parçaları) ana görselin etrafına rastgele ama düzenli bir şekilde saçılmış' : 'Tüm ürünleri'} polaroid fotoğraf tarzında yerleştir.
        3. AYAKKABI KURALI: Ayakkabılar her zaman çift olarak (sağ ve sol yan yana) görünmelidir.
        4. GERÇEKÇİ DETAYLAR: ${background === 'corkboard' ? 'Her polaroidi mantar panoya renkli iğnelerle (pushpins) tuttur. Fotoğrafların altına gerçekçi gölgeler ekle.' : 'Fotoğrafları minimalist bir düzenle yerleştir.'}
        5. ETİKETLEME: Her ürünün altına el yazısı fontuyla Türkçe isimlerini yaz. Örn: "Keten Gömlek", "Deri Ayakkabı".
        6. KALİTE: En üst düzey moda dergisi estetiği, profesyonel ışıklandırma ve netlik.
        ${customPrompt ? `\nEKSTRA TALİMAT: ${customPrompt}` : ''}

        ÇIKTI GEREKSİNİMLERİ:
        - 2K Çözünürlük, Foto-realistik kalite.
        - Boyut Oranı: ${aspectRatio}`;

        const parts = mainImagePart
            ? [mainImagePart, ...productParts, { text: fullPrompt }]
            : [...productParts, { text: fullPrompt }];

        const response = await ai.models.generateContent({
            model: LIVE_MODEL_PRIMARY,
            contents: {
                parts: parts,
            },
            config: {
                responseModalities: [Modality.IMAGE],
                imageConfig: {
                    aspectRatio: aspectRatio,
                    imageSize: '2K',
                }
            },
        });

        const candidate = response.candidates?.[0];
        const responseParts = candidate?.content?.parts;

        if (responseParts) {
            for (const part of responseParts) {
                if (part.inlineData) {
                    return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                }
            }
        }

        throw new Error("Ürün kolajı oluşturulamadı. API'den görsel döndürülmedi.");
    } catch (e) {
        console.error("Product Collage Generation Error:", e);
        throw e;
    }
};

/**
 * Tech Pack Generation - Professional technical drawings with measurements
 */
export const generateTechPack = async (
    productImage: string
): Promise<{
    frontView: string;
    backView: string;
    measurements: string;
    specifications: string;
}> => {
    checkApiKey();

    try {
        const ai = new GoogleGenAI({ apiKey: API_KEY });

        // Extract base64 data
        const base64Data = productImage.split(',')[1];
        const mimeType = productImage.split(';')[0].split(':')[1];

        const imagePart = {
            inlineData: {
                data: base64Data,
                mimeType: mimeType
            }
        };

        // Generate FRONT VIEW technical flat sketch
        const frontPrompt = `Bu ürün fotoğrafını analiz et ve ÖN GÖRÜNÜM için profesyonel bir 'Teknik Çizim' (Technical Flat Sketch) oluştur.

Kurallar:
1. Stil: Sadece siyah kontur çizgileri (clean line art). Gölgelendirme, renk veya doku YOK.
2. Detay: Dikiş yerleri (topstitching), fermuarlar, cepler, ribana detayları, düğmeler, yaka, kol ağzı net bir şekilde çizilmeli.
3. Ölçü Çizgileri: Önemli ölçü noktalarını gösteren dimension lines ekle (göğüs genişliği, omuz genişliği, kol boyu, ürün boyu).
4. Perspektif: Ürün tamamen önden, düz (flat) ve simetrik bir şekilde çizilmeli.
5. Sunum: Arka plan saf beyaz olmalı. İnsan figürü veya manken kullanılmamalı.
6. Kalite: Vektörel çizim hassasiyetinde, keskin ve temiz çizgiler.
7. Etiketler: Önemli detayları etiketle (örn: "Düğme", "Cep", "Fermuar", "Dikiş").`;

        const frontResponse = await ai.models.generateContent({
            model: LIVE_MODEL_PRIMARY,
            contents: {
                parts: [imagePart, { text: frontPrompt }]
            },
            config: {
                responseModalities: [Modality.IMAGE],
                temperature: 0.4,
                imageConfig: {
                    imageSize: '2K',
                },
            }
        });

        const frontParts = frontResponse.candidates?.[0]?.content?.parts;
        let frontView = '';
        if (frontParts) {
            for (const part of frontParts) {
                if (part.inlineData) {
                    frontView = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                    break;
                }
            }
        }

        // Generate BACK VIEW technical flat sketch
        const backPrompt = `Bu ürün fotoğrafını analiz et ve ARKA GÖRÜNÜM için profesyonel bir 'Teknik Çizim' (Technical Flat Sketch) oluştur.

Kurallar:
1. Stil: Sadece siyah kontur çizgileri (clean line art). Gölgelendirme, renk veya doku YOK.
2. Detay: Arka dikiş yerleri, yaka arkası, kol arkası, arka cepler (varsa), arka patleti net bir şekilde çizilmeli.
3. Ölçü Çizgileri: Önemli ölçü noktalarını gösteren dimension lines ekle.
4. Perspektif: Ürün tamamen arkadan, düz (flat) ve simetrik bir şekilde çizilmeli.
5. Sunum: Arka plan saf beyaz olmalı. İnsan figürü veya manken kullanılmamalı.
6. Kalite: Vektörel çizim hassasiyetinde, keskin ve temiz çizgiler.
7. Etiketler: Önemli detayları etiketle (örn: "Arka Dikiş", "Yaka Arkası", "Kol Arkası").`;

        const backResponse = await ai.models.generateContent({
            model: LIVE_MODEL_PRIMARY,
            contents: {
                parts: [imagePart, { text: backPrompt }]
            },
            config: {
                responseModalities: [Modality.IMAGE],
                temperature: 0.4,
                imageConfig: {
                    imageSize: '2K',
                },
            }
        });

        const backParts = backResponse.candidates?.[0]?.content?.parts;
        let backView = '';
        if (backParts) {
            for (const part of backParts) {
                if (part.inlineData) {
                    backView = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                    break;
                }
            }
        }

        // Generate comprehensive technical specifications using TEXT model
        const specsPrompt = `Bu kıyafeti analiz et ve detaylı teknik spesifikasyon hazırla:

1. ÖLÇÜLER (cm cinsinden):
- Göğüs/Beden genişliği: [tahmin et]
- Omuz genişliği: [tahmin et]
- Kol boyu: [tahmin et]
- Ürün boyu: [tahmin et]
- Etek genişliği: [tahmin et]
- Yaka ölçüleri: [varsa]
- Kol ağzı ölçüleri: [varsa]
- Koltuk derinliği: [tahmin et]

2. KUMAŞ VE MALZEME:
- Ana kumaş: [türü ve ağırlığı]
- Astar: [varsa]
- Ara malzeme: [varsa]

3. DİKİŞ DETAYLARI:
- Dikiş türleri: [301, 401, 504 vb.]
- Dikiş payları: [standart veya özel]
- Üst dikiş detayları: [genişlik ve renk]

4. TASARIM ÖZELLİKLERİ:
- Yaka tipi ve yapısı: [detaylı açıklama]
- Kol tipi ve yapısı: [detaylı açıklama]
- Kapama türü: [düğme, fermuar vb.]
- Cep detayları: [tip, yerleşim, yapı]
- Etek bitimi: [tip ve ölçü]
- Kol ağzı bitimi: [varsa]

5. AKSESUAR VE DONANIM:
- Düğme: [tip, boyut, adet]
- Fermuar: [tip ve uzunluk, varsa]
- İplik rengi: [uyumlu veya kontrast]

Profesyonel tech pack formatında sun.`;

        const specsResponse = await ai.models.generateContent({
            model: 'gemini-3-pro-image-preview',
            contents: {
                parts: [imagePart, { text: specsPrompt }]
            },
            config: {
                temperature: 0.3,
            }
        });

        const specsText = specsResponse.text || '';

        // Split measurements and specifications
        const sections = specsText.split(/2\.\s*KUMAŞ VE MALZEME:/i);
        const measurements = sections[0].replace(/1\.\s*ÖLÇÜLER.*?:/i, '').trim();
        const specifications = sections[1] ? '2. KUMAŞ VE MALZEME:' + sections[1] : specsText;

        if (!frontView || !backView) {
            throw new Error('Tech pack görselleri oluşturulamadı');
        }

        return {
            frontView,
            backView,
            measurements,
            specifications
        };

    } catch (error: any) {
        console.error('Tech Pack Generation Error:', error);
        throw new Error(error.message || 'Tech pack oluşturulurken bir hata oluştu');
    }
};

/**
 * Advanced Tech Pack Generation Pro - Strict JSON output with detailed PRD format
 */
export const generateTechPackPro = async (
    frontImageBase64: string,
    backImageBase64: string | null
): Promise<{
    frontSketchBase64: string;
    backSketchBase64: string | null;
    techPackData: any;
}> => {
    checkApiKey();

    try {
        const ai = new GoogleGenAI({ apiKey: API_KEY });

        const frontData = frontImageBase64.split(',')[1];
        const frontMime = frontImageBase64.split(';')[0].split(':')[1];
        const parts: any[] = [{ inlineData: { data: frontData, mimeType: frontMime } }];

        let backPart = null;
        if (backImageBase64) {
            const backData = backImageBase64.split(',')[1];
            const backMime = backImageBase64.split(';')[0].split(':')[1];
            backPart = { inlineData: { data: backData, mimeType: backMime } };
            parts.push(backPart);
        }

        // Generate JSON DATA using Pro Model - 6 Sayfalık Fabrika-Ready Format
        const jsonPrompt = `Bu kıyafet görsellerini (Ön ve opsiyonel Arka) analiz et ve aşağıdaki JSON formatına TAM OLARAK uyarak endüstri standartlarında bir Tech Pack (Teknik Dosya) hazırla.
VERİLECEK YANIT SADECE GEÇERLİ BİR JSON OLMALIDIR. BAŞKACA HİÇBİR BİLGİ/METİN EKLEME.
TÜM DEĞERLERİ TÜRKÇE YAZ. İngilizce kesinlikle kullanma (ISO kodları ve Pantone hariç).
ASLA INCH KULLANMA. Tüm ölçüler kesinlikle CM (santimetre) cinsinden olacak. Dikiş genişlikleri de CM olacak (örn: 0.1 cm, 0.3 cm, 0.5 cm, 1.0 cm).
Kumaş ağırlığı gr/m² (gram/metrekare) cinsinden olacak.
Beden standardı AVRUPA (EU) standardıdır: XS=32-34, S=36-38, M=38-40, L=42-44, XL=46-48, XXL=50-52. Baz beden M'dir.
ÖLÇÜ DOĞRULUĞU KRİTİK: Verdiğin tüm ölçümler (POM, dikiş genişliği, tolerans) gerçek endüstri standartlarına %100 uyumlu olmalıdır. Tahmini veya eksik ölçü VERME. Görseli dikkatle analiz et, kıyafetin türüne göre gerçekçi ölçüler belirle. Tolerans değerlerini her ölçü noktası için mutlaka ver (örn: +/- 0.5 cm, +/- 1.0 cm). Gövde uzunluğu, göğüs genişliği, kol uzunluğu gibi temel ölçüler gerçek üretim verilerine dayanmalıdır.
Renk kodları PANTONE formatında olmalıdır. Dikiş tipleri ISO numarasıyla belirtilmelidir.

{
  "coverPage": {
    "styleCode": "XX-2026-001 formatında üret",
    "styleName": "Ürünün profesyonel adı (Türkçe)",
    "season": "SS26/AW26 gibi üret",
    "category": "Erkek/Kadın - Üst/Alt Giyim",
    "targetSize": "M",
    "sizeRange": "XS-S-M-L-XL-XXL",
    "date": "${new Date().toLocaleDateString('tr-TR')}",
    "description": "Ürünün kısa tasarım vizyonu (1-2 cümle)",
    "fit": "Regular/Slim/Oversize/Relaxed Fit"
  },
  "designFeatures": {
    "collarType": "Yaka tipi (Bisiklet/Polo/V-Yaka/Dik Yaka/Kapüşon vb.) ve bitiriş detayı (ribana, biye vb.)",
    "closure": "Kapama detayı (Düğmeli/Fermuarlı/Yarım pat/Tam boy vb.) ve kapama ile ilgili özel notlar",
    "sleeveType": "Kol yapısı (Uzun/Kısa/Raglankol/Set-inkol/Drop shoulder) ve manşet detayı",
    "knitDetails": "Örgü detayları (varsa): Jersey, Ribana, Jakar, İnterlok vb. ve fashioning marks",
    "hemFinish": "Etek bitimi: Ribana bant genişliği, reçme, kıvrım vb.",
    "specialDetails": "Ekstra tasarım detayları: Cep tipi, yırtmaç, fermuar detayı, biye, şerit vb."
  },
  "construction": {
    "front": [
      {
        "area": "Yaka/Cep/Fermuar/Kol/Düğme Patı vb.",
        "detail": "Kısa teknik talimat",
        "stitchType": "ISO 301/401/504/Remayöz(Linking) vb.",
        "stitchWidth": "0.3 cm / 0.5 cm / 1.0 cm gibi CM cinsinden",
        "seamAllowance": "Dikiş payı CM cinsinden (örn: 1.0 cm, 0.7 cm)"
      }
    ],
    "back": [
      {
        "area": "Omuz/Sırt Paneli/Arka Cep vb.",
        "detail": "Kısa teknik talimat",
        "stitchType": "ISO numarası veya Remayöz",
        "stitchWidth": "CM cinsinden ölçü",
        "seamAllowance": "Dikiş payı CM"
      }
    ],
    "interfacing": "Tela kullanım detayı: Kullanıldığı yerler (yaka, pat, cep ağzı vb.) ve tela tipi (ince şerit tela, dokuma tela, yapışkan tela vb.). Tela yoksa 'Yok' yaz."
  },
  "bom": {
    "fabrics": [
      {
        "description": "Ana Kumaş (Shell) / Astar / Ribana vb.",
        "composition": "%100 Pamuk French Terry / %50 Akrilik %28 Polyester %22 Naylon gibi tam içerik",
        "usage": "Tüm gövde ve kollar / Yaka-etek-kol ribanaları gibi",
        "colorCode": "Pantone XX-XXXX TCX",
        "weight": "gr/m² cinsinden ağırlık",
        "gauge": "Örgü ise gauge (GG) ve örgü tipi (12GG Düz örgü gibi). Dokuma ise 'Dokuma' yaz.",
        "finish": "Yüzey dokusu: Brushed/Şardonlu/Peach/Normal vb."
      }
    ],
    "trims": [
      {
        "description": "Düğme/Fermuar/Kuşgözü/İplik/Tela/Etiket vb.",
        "specification": "Detaylı teknik bilgi: tip (kalp şekli/yuvarlak/kare), malzeme (metal/plastik/polyester), boyut (18L=11.5mm/YKK#5), renk (gümüş/altın/DTM)",
        "usage": "Kullanım yeri ve detay",
        "quantity": "Adet veya -"
      }
    ]
  },
  "pom": [
    {
      "code": "A harfinden başlayarak sıralı (EN AZ 12 ÖLÇÜ NOKTASI ZORUNLU)",
      "measurement": "Ölçü noktası adı: Tam Boy(HPS'den), Göğüs Genişliği(1/2), Omuz Genişliği, Kol Boyu, Pazı Genişliği(1/2), Etek Genişliği(1/2), Yaka Açıklığı, Yaka Düşüklüğü, Kol Ağzı(1/2), Koltuk Derinliği, Ribana Yüksekliği(Yaka), Ribana Yüksekliği(Etek), Ribana Yüksekliği(Kol) gibi tüm kritik noktalar",
      "howToMeasure": "Nasıl ölçüleceğinin kısa açıklaması (örn: HPS noktasından etek ucuna kadar düz ölçüm)",
      "tolerance": "+/- 0.5 cm veya +/- 1.0 cm gibi (HER ÖLÇÜ İÇİN ZORUNLU)",
      "sizes": {
        "XS": "gerçekçi CM ölçü",
        "S": "gerçekçi CM ölçü",
        "M": "gerçekçi CM ölçü (BAZ)",
        "L": "gerçekçi CM ölçü",
        "XL": "gerçekçi CM ölçü",
        "XXL": "gerçekçi CM ölçü"
      }
    }
  ],
  "colorways": [
    {
      "name": "Renk yolu adı (Örn: Bordo/Midnight Black)",
      "pantoneCode": "Pantone 19-4006 TCX",
      "components": {
        "shell": "Ana kumaş renk kodu",
        "lining": "Astar renk kodu (varsa, yoksa '-')",
        "trim": "Aksesuar renk kodu (gümüş/altın/DTM)",
        "thread": "DTM veya kontrast"
      }
    }
  ],
  "artwork": [
    {
      "type": "Baskı/Nakış/Etiket",
      "technique": "Serigrafi/Transfer/Dijital/Dokuma vb.",
      "placement": "Göğüs ortası, yaka dikişinden X cm aşağı gibi",
      "dimensions": "Genişlik x Yükseklik cm",
      "colors": "Kullanılan renk kodları"
    }
  ],
  "labelsAndPackaging": {
    "mainLabel": {
      "placement": "Yerleşim yeri ve ölçüsü (ense ortası vb.)",
      "type": "Dokuma/Baskılı"
    },
    "careLabel": {
      "placement": "Sol iç yan dikiş, etek ucundan X cm yukarı",
      "content": "Yıkama sembolleri açıklaması"
    },
    "sizeLabel": {
      "placement": "Yerleşim",
      "type": "Tip"
    },
    "hangtag": "Askı etiketi açıklaması",
    "folding": "Katlama talimatı",
    "polybag": "Polybag ölçüsü ve barkod konumu",
    "cartonPacking": "Koli bilgileri"
  }
}`;


        console.log("JSON analiz başlatılıyor...");

        // Fallback modelleri: Pro meşgulse Flash'a düş
        const JSON_MODELS = ['gemini-3-pro-image-preview', 'gemini-3.1-flash-image-preview', 'gemini-2.0-flash'];
        let jsonResponse = null;
        let usedModel = '';

        for (const model of JSON_MODELS) {
            try {
                console.log(`📡 JSON analiz deneniyor: ${model}`);
                jsonResponse = await ai.models.generateContent({
                    model,
                    contents: { parts: [...parts, { text: jsonPrompt }] },
                    config: {
                        temperature: 0.1,
                    }
                });
                usedModel = model;
                console.log(`✅ JSON analiz başarılı: ${model}`);
                break;
            } catch (modelError: any) {
                console.warn(`⚠️ ${model} başarısız (${modelError?.message || 'bilinmeyen hata'}), sonraki model deneniyor...`);
                if (model === JSON_MODELS[JSON_MODELS.length - 1]) {
                    throw new Error('Tüm AI modelleri şu anda meşgul. Lütfen birkaç dakika sonra tekrar deneyin.');
                }
            }
        }

        let responseText = jsonResponse?.text || "{}";
        responseText = responseText.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
        let parsedData;
        try {
            parsedData = JSON.parse(responseText);
        } catch (e) {
            console.error("JSON Parse Error:", responseText);
            throw new Error("AI geçerli bir JSON formatı üretemedi.");
        }

        // Generate FRONT SKETCH — TÜRKÇE ETİKETLİ
        const frontPrompt = `Bu ürün fotoğrafını analiz et ve ÖN GÖRÜNÜM için profesyonel bir 'Teknik Düz Çizim' (Technical Flat Sketch) oluştur.

KRİTİK KURALLAR:
- Tüm yazılar, etiketler ve notlar TÜRKÇE olacak.
- Dikiş noktalarını Türkçe etiketle: "Düz Dikiş", "Çift İğne", "Overlok" vb.
- Ölçü referans çizgileri ekle: "Göğüs Genişliği", "Kol Boyu", "Ürün Boyu" gibi Türkçe başlıklar.
- Detayları Türkçe etiketle: "Yaka", "Cep", "Fermuar", "Manşet", "Düğme", "Etek Ucu" vb.
- Gölgelendirme ve renk YOK, sadece siyah-beyaz teknik çizgiler.
- Kalıp (düz çizgi) ve dikiş (kesik çizgi) hatlarını net göster.`;

        console.log("Ön Çizim başlatılıyor...");
        const frontResponse = await ai.models.generateContent({
            model: LIVE_MODEL_PRIMARY,
            contents: { parts: [{ inlineData: { data: frontData, mimeType: frontMime } }, { text: frontPrompt }] },
            config: {
                responseModalities: [Modality.IMAGE],
                temperature: 0.4,
                imageConfig: { imageSize: '2K' },
            }
        });

        const frontParts = frontResponse.candidates?.[0]?.content?.parts;
        let frontSketchBase64 = '';
        if (frontParts) {
            for (const part of frontParts) {
                if (part.inlineData) {
                    frontSketchBase64 = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                    break;
                }
            }
        }

        // Generate BACK SKETCH
        let backSketchBase64 = null;
        if (backPart) {
            const backPrompt = `Bu ürün arka fotoğrafını analiz et ve ARKA GÖRÜNÜM için profesyonel bir 'Teknik Düz Çizim' (Technical Flat Sketch) oluştur.

KRİTİK KURALLAR:
- Tüm yazılar, etiketler ve notlar TÜRKÇE olacak.
- Arka dikiş noktalarını Türkçe etiketle: "Omuz Dikişi", "Sırt Ortası", "Arka Cep" vb.
- Ölçü referans çizgileri ekle: Türkçe başlıklarla.
- Gölgelendirme ve renk YOK, sadece siyah-beyaz teknik çizgiler.`;
            console.log("Arka Çizim başlatılıyor...");
            const backResponse = await ai.models.generateContent({
                model: LIVE_MODEL_PRIMARY,
                contents: { parts: [backPart, { text: backPrompt }] },
                config: {
                    responseModalities: [Modality.IMAGE],
                    temperature: 0.4,
                    imageConfig: { imageSize: '2K' },
                }
            });

            const backPartsRes = backResponse.candidates?.[0]?.content?.parts;
            if (backPartsRes) {
                for (const part of backPartsRes) {
                    if (part.inlineData) {
                        backSketchBase64 = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                        break;
                    }
                }
            }
        }

        if (!frontSketchBase64) {
            throw new Error('Ön teknik çizim oluşturulamadı');
        }

        return {
            frontSketchBase64,
            backSketchBase64,
            techPackData: parsedData,
        };

    } catch (error: any) {
        console.error('Tech Pack Pro Generation Error:', error);
        throw new Error(error.message || 'Gelişmiş Tech Pack oluşturulurken bir hata oluştu');
    }
};