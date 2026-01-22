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
    resolution: '720p' | '1080p';
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
            return 'Model, sonsuz fonlu (cyclorama) minimalist ve profesyonel bir stüdyo ortamında durmalıdır.';
        case 'Doğal Mekan':
            return 'Model, gün ışığı alan doğal bir mekanda (orman, sahil, bahçe) durmalıdır.';
        case 'Lüks Mağaza':
            return 'Model, lüks bir moda mağazasının şık ve modern iç mekanında durmalıdır.';
        case 'Podyum':
        default:
            return 'Model, spot ışıkları altında profesyonel bir moda podyumunda durmalıdır.';
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

    const prompt = `Bu moda çizimini (sketches/flat drawing) analiz et ve onu ultra-gerçekçi, yüksek çözünürlüklü bir hayalet manken (ghost mannequin) ürün fotoğrafına dönüştür.${colorInstruction}
    
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
    
    *** 2. GÖRSEL KALİTE VE GERÇEKÇİLİK STANDARDI ***:
    1. Kumaş Dokusu (Texture Fidelity): Kumaşın cinsi (pamuk, ipek, yün, denim vb.) fotoğrafta %100 GERÇEKÇİ görünmeli. Makro çekim kalitesinde iplik detayları görünmeli. " Dijital çizim" hissi KESİNLİKLE olmamalı.
    2. Işıklandırma (Lighting): Ürünün formunu ve drapelerini ortaya çıkaran profesyonel "Softbox" stüdyo aydınlatması. Derinlik katan doğal gölgeler.
    3. Detaylar: Dikişler (stitch lines), fermuar çekme uçları, düğme dokuları, yaka içi etiketleri gibi mikro detaylar keskin ve net olmalı.
    4. Sadakat: Çizim üzerindeki her türlü desen, logo eskizi veya baskı detayı ürüne BİREBİR VE DÜZGÜN BİR ŞEKİLDE (warping olmadan) aktarılmalı.
    5. Ghost Mannequin Etkisi: Ürün dolgun ve 3 boyutlu görünmeli, ancak içinde görünmez bir manken varmış gibi durmalı. Boyun içi kısmı gerçekçi bir şekilde (arka etiket vb.) gösterilmeli.
    6. Arka Plan: Saf beyaz (#FFFFFF) veya çok açık nötr gri (#F5F5F5).
    
    Sonuç, Vogue veya Harper's Bazaar gibi dergilerde veya Lüks E-Ticaret (Farfetch, Net-a-Porter) sitelerinde kullanılacak kalitede, 8K, RAW PHOTO, HİPER-GERÇEKÇİ bir ürün fotoğrafı olmalıdır.` + colorClosing;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-image-preview',
            contents: {
                parts: [
                    imagePart,
                    { text: prompt },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE],
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
    } catch (e) {
        console.error("Ürün Oluşturma Hatası:", e);
        throw e;
    }
};

export const generateSketchFromProduct = async (productFile: File, style: 'colored' | 'blackwhite' = 'blackwhite'): Promise<string> => {
    checkApiKey();
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const imagePart = await fileToGenerativePart(productFile);

    const prompt = style === 'colored'
        ? `Bu ürün fotoğrafını analiz et ve moda tasarımı üretimi için profesyonel bir 'Renkli Teknik Çizim' (Colored Technical Flat Sketch) oluştur.
    
    Kurallar:
    1. Stil: Siyah kontur çizgileri + Gerçekçi renkler. Ürünün orijinal renklerini koru.
    2. Detay: Dikiş yerleri (topstitching), fermuarlar, cepler, ribana detayları, düğmeler net bir şekilde çizilmeli.
    3. Perspektif: Ürün tamamen önden, düz (flat) ve simetrik bir şekilde çizilmeli.
    4. Sunum: Arka plan saf beyaz olmalı. İnsan figürü veya manken kullanılmamalı.
    5. Kalite: 4K çözünürlükte, vektörel çizim hassasiyetinde, keskin ve temiz çizgiler.
    6. Renklendirme: Kumaş renkleri, detay renkleri (düğme, fermuar vb.) fotoğraftaki ile birebir aynı olmalı. Gölge ve ışık oyunlarıyla derinlik katılmalı.
    7. Doku: Kumaşın dokusu (Texture) çizimde hissedilmeli.`
        : `Bu ürün fotoğrafını analiz et ve moda tasarımı üretimi için profesyonel bir 'Teknik Çizim' (Technical Flat Sketch / CAD) oluştur.
    
    Kurallar:
    1. Stil: Sadece siyah kontur çizgileri (clean line art). Gölgelendirme, renk veya doku YOK.
    2. Detay: Dikiş yerleri (topstitching), fermuarlar, cepler, ribana detayları, düğmeler net bir şekilde çizilmeli.
    3. Perspektif: Ürün tamamen önden, düz (flat) ve simetrik bir şekilde çizilmeli.
    4. Sunum: Arka plan saf beyaz olmalı. İnsan figürü veya manken kullanılmamalı.
    5. Kalite: Vektörel çizim hassasiyetinde, keskin ve temiz çizgiler.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-image-preview',
            contents: {
                parts: [
                    imagePart,
                    { text: prompt },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE],
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
    } catch (e) {
        console.error("Teknik Çizim Hatası:", e);
        throw e;
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
        // Invalid format - Detaylı debugging ile
        else {
            console.error('Invalid image format provided!');
            console.error('Full input:', imageInput);
            console.error('Full input length:', imageInput.length);
            console.error('First 200 chars:', imageInput.substring(0, 200));
            console.error('Does it start with data:? :', imageInput.startsWith('data:'));
            console.error('Contains base64?', imageInput.includes('base64'));
            console.error('Contains semicolon?', imageInput.includes(';'));
            console.error('Base64 position:', imageInput.indexOf('base64'));
            throw new Error(`Geçersiz görsel formatı. Lütfen geçerli bir base64 (data:image/xxx;base64,xxx) formatında veya geçerli bir URL (http:// veya https://) kullanın. Görsel boyutu: ${imageInput.length} karakter. İlk 50 karakter: ${imageInput.substring(0, 50)}...`);
        }
    } else {
        throw new Error("Geçersiz görsel girişi. Lütfen File, Base64 string veya URL kullanın.");
    }

    const modelName = settings.quality === 'high' ? 'veo-3.1-generate-preview' : 'veo-3.1-fast-generate-preview';

    console.log('Starting video generation with model:', modelName);

    let operation;

    try {
        operation = await ai.models.generateVideos({
            model: modelName,
            prompt: settings.prompt,
            image: {
                imageBytes: imageBytes,
                mimeType: mimeType,
            },
            config: {
                numberOfVideos: 1,
                resolution: settings.resolution,
                aspectRatio: settings.aspectRatio,
            }
        });
    } catch (e: any) {
        console.error("Video initiation error:", e);
        throw new Error(`Video başlatılamadı: ${e.message}`);
    }

    console.log('Initial operation response:', operation);

    // Poll for completion with timeout
    let pollCount = 0;
    const maxPolls = 60; // 10 minutes max (60 * 10 seconds)

    while (!operation.done && pollCount < maxPolls) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        pollCount++;
        console.log(`Polling attempt ${pollCount}/${maxPolls}...`);

        try {
            const updatedOp = await ai.operations.getVideosOperation({ operation: operation });
            operation = updatedOp;
            console.log('Operation status:', { done: operation.done, pollCount });

            // Check for immediate errors during polling
            if ((operation as any).error) {
                console.error("Operation error detected during polling:", (operation as any).error);
                throw new Error((operation as any).error.message || 'Video işleme sırasında API hatası oluştu.');
            }

        } catch (e: any) {
            // Handle "Requested entity was not found" error during polling (common Veo issue)
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

    console.log('Final operation response:', JSON.stringify(operation, null, 2));

    // Double check error after loop
    if ((operation as any).error) {
        throw new Error(`Video API Hatası: ${(operation as any).error.message}`);
    }

    // Attempt to extract URI with fallback for result property
    // Some SDK versions or API responses might put data in 'result' instead of 'response'
    const responseData = operation.response || (operation as any).result;
    const videoUri = responseData?.generatedVideos?.[0]?.video?.uri;

    if (videoUri) {
        const downloadLink = videoUri;
        console.log('Video URI found:', downloadLink);

        // Append API key strictly from the variable
        try {
            const videoRes = await fetch(`${downloadLink}&key=${API_KEY}`);

            if (!videoRes.ok) {
                const err = await videoRes.text();
                console.warn("Video download failed:", err);
                throw new Error(`Video indirilemedi: ${err}`);
            }

            const blob = await videoRes.blob();
            return URL.createObjectURL(blob);
        } catch (e: any) {
            throw new Error(`Video indirme hatası: ${e.message}`);
        }
    }

    // Check for RAI filters (Safety/Policy blocks)
    if (responseData?.raiMediaFilteredReasons && responseData.raiMediaFilteredReasons.length > 0) {
        const reason = responseData.raiMediaFilteredReasons[0];
        console.warn("Video blocked by RAI filter:", reason);

        if (reason.includes("celebrity") || reason.includes("identity")) {
            throw new Error("Güvenlik Filtresi: Videoda ünlü benzerliği veya kimlik koruması algılandı.");
        }
        if (reason.includes("sexual") || reason.includes("nsfw")) {
            throw new Error("Güvenlik Filtresi: Görsel veya prompt güvenli içerik politikasına takıldı.");
        }
        throw new Error(`Video güvenlik filtresine takıldı: ${reason}`);
    }

    // More detailed error message if we still don't have a URI
    const errorDetails = {
        done: operation.done,
        hasResponse: !!responseData,
        hasVideos: !!responseData?.generatedVideos,
        videoCount: responseData?.generatedVideos?.length || 0,
        fullOp: operation
    };

    console.error('Video generation failed. Operation details:', errorDetails);
    throw new Error(`Video oluşturulamadı. API'den video URI alınamadı. Lütfen görseli veya promptu değiştirip tekrar deneyin.`);
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
    ageRange?: string, // New: Yaş Aralığı (Child, Teen, Adult, Elderly)
    gender?: string,   // New: Cinsiyet
    secondProductFile?: File, // New: İkinci ürün görseli (Alt & Üst kombin için)
    patternImageFile?: File, // New: Desen/Baskı görseli
    seed?: number, // New: Seed for consistency
    modelIdentityFile?: File // New: Previous generation result for identity locking
): Promise<string> => {
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
            console.log('📦 İkinci ürün görseli (Alt Giyim) eklendi');
        } else {
            console.warn('⚠️ İkinci ürün görseli (Alt Giyim) geçersiz format (Blob değil), atlanıyor:', typeof secondProductFile);
        }
    }

    // Add model identity image if provided (Highest priority for face)
    // If reference image is provided, generate stable seed from it to lock the model
    let effectiveSeed = seed;
    if (modelIdentityFile) {
        if (modelIdentityFile instanceof Blob) {
            // 1. Generate Seed (HEAD logic)
            const referenceSeed = await generateStableSeed(modelIdentityFile);
            effectiveSeed = referenceSeed;
            console.log('🔒 Model Identity Locked - Using stable seed from reference image:', referenceSeed);

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
    const eth = ethnicity && ethnicity !== 'Genel Dünya Karması' ? ethnicity : 'diverse international model';

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

    let prompt = colorOpening + kombinInstruction + `Yüksek çözünürlüklü, 8k kalitesinde, 'Award Winning' bir moda fotoğrafı oluştur.
    
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
    - LOGO VE YAZI KORUMASI: Kıyafetin üzerindeki marka isimleri, logolar, grafik baskılar ve metinler PİKSELİ PİKSELİNE KORUNMALIDIR.
    - TASARIM SADAKATİ: Kıyafetin kesimi, dikiş detayları, yaka şekli ve kalıbı referans görselle tıpatıp aynı olmalıdır.
    
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
       
    ${fabricType ? `7. ÖZEL KUMAŞ TALİMATI: Kumaş tipi "${fabricType}". Bu kumaşın ışığı yansıtma ve kırışma özelliklerini tam olarak yansıt.` : ''}
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

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-image-preview',
            contents: {
                parts: promptParts,
            },
            config: {
                responseModalities: [Modality.IMAGE],
                ...(effectiveSeed ? { seed: effectiveSeed } : {}), // Use effectiveSeed (from reference image or user input)
                imageConfig: {
                    aspectRatio: aspectRatio === '16:9' ? '16:9' :
                        aspectRatio === '9:16' ? '9:16' :
                            aspectRatio === '1:1' ? '1:1' :
                                '3:4' // Default/Fallback for others
                }
            },
        });

        const candidate = response.candidates?.[0];

        if (!candidate) {
            throw new Error("API'den boş yanıt alındı.");
        }

        if (candidate.finishReason && candidate.finishReason !== 'STOP') {
            if (!candidate.content?.parts) {
                throw new Error(`Görsel oluşturulamadı.Sebep: ${candidate.finishReason} `);
            }
        }

        const parts = candidate.content?.parts;
        if (!parts) {
            throw new Error("Görsel içeriği bulunamadı.");
        }

        for (const part of parts) {
            if (part.inlineData) {
                const base64ImageBytes: string = part.inlineData.data;
                return `data:${part.inlineData.mimeType}; base64, ${base64ImageBytes} `;
            }
        }
        throw new Error("Görsel yanıtı işlenemedi.");
    } catch (e) {
        console.error("Model Oluşturma Hatası:", e);
        throw e;
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
            model: 'gemini-3-pro-image-preview',
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
- Aspect ratio: ${aspectRatio}`;

        // Add all image parts and the text prompt
        const parts = [...imageParts, { text: fullPrompt }];

        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-image-preview',
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
            model: 'gemini-3-flash-preview',
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
            model: 'gemini-3-pro-image-preview',
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
            model: 'gemini-3-pro-image-preview',
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