import { GoogleGenAI, Modality } from "@google/genai";
import { fileToGenerativePart, fileToBase64 } from '../utils/fileUtils';
import { colors } from '../components/ColorPicker';

// Vite projelerinde ortam değişkenlerine erişmek için import.meta.env kullanılır.
// .env.local dosyasında VITE_GEMINI_API_KEY olarak tanımlanmalıdır.
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string;

if (!API_KEY) {
    console.error('VITE_GEMINI_API_KEY environment variable is not set!');
    console.error('Please add VITE_GEMINI_API_KEY to your Netlify environment variables.');
}

// Helper function to convert Blob to base64
const blobToBase64 = async (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result as string;
            // Add data URL prefix
            const mimeType = blob.type || 'image/jpeg';
            resolve(`data:${mimeType};base64,${base64.split(',')[1]}`);
        };
        reader.onerror = () => {
            reject(new Error('Blob to base64 conversion failed'));
        };
        reader.readAsDataURL(blob); // ✅ DÜZELTİLDİ: readAsDataURL kullanılıyor (Blob için doğru)
    });
};

// Helper function to convert File to base64
const fileToBase64 = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result as string;
            const mimeType = file.type || 'image/jpeg';
            resolve(`data:${mimeType};base64,${base64.split(',')[1]}`);
        };
        reader.onerror = () => {
            reject(new Error('File to base64 conversion failed'));
        };
        reader.readAsDataURL(file); // ✅ File için readAsDataURL kullanılıyor
    });
};
};

// Helper function to generate stable seed from file
const generateStableSeed = async (file: File): Promise<number> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
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
    
    *** 2. GÖRSEL KALİTE ODAĞI ***:
    1. Kumaş Dokusu: Kumaşın cinsi (pamuk, ipek, yün, denim vb.) fotoğrafta net bir şekilde anlaşılmalı. İplik dokusu ve malzemenin ağırlığı hissedilmeli.
    2. Işıklandırma: Ürünün formunu ortaya çıkaran yumuşak, profesyonel stüdyo aydınlatması. Gerçekçi gölgeler ve ışık yansımaları.
    3. Detaylar: Dikişler, fermuarlar, düğmeler, cepler ve kat yerleri makro detay seviyesinde keskin olmalı.
    4. Sadakat: Çizim üzerindeki her türlü desen, logo eskizi veya baskı detayı ürüne aynen aktarılmalı.
    5. Arka Plan: Temiz, saf beyaz veya çok açık nötr gri.
    
    Sonuç, e-ticaret sitelerinde kullanılan 'High-End' ürün fotoğrafı kalitesinde, 8k çözünürlükte olmalıdır.` + colorClosing;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
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
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const imagePart = await fileToGenerativePart(productFile);

    const prompt = style === 'colored'
        ? `Bu ürün fotoğrafını analiz et ve moda tasarımı üretimi için profesyonel bir 'Renkli Teknik Çizim' (Colored Technical Flat Sketch) oluştur.
    
    Kurallar:
    1. Stil: Siyah kontur çizgileri + Gerçekçi renkler. Ürünün orijinal renklerini koru.
    2. Detay: Dikiş yerleri (topstitching), fermuarlar, cepler, ribana detayları, düğmeler net bir şekilde çizilmeli.
    3. Perspektif: Ürün tamamen önden, düz (flat) ve simetrik bir şekilde çizilmeli.
    4. Sunum: Arka plan saf beyaz olmalı. İnsan figürü veya manken kullanılmamalı.
    5. Kalite: Vektörel çizim hassasiyetinde, keskin ve temiz çizgiler.
    6. Renklendirme: Kumaş renkleri, detay renkleri (düğme, fermuar vb.) gerçekçi olmalı.`
        : `Bu ürün fotoğrafını analiz et ve moda tasarımı üretimi için profesyonel bir 'Teknik Çizim' (Technical Flat Sketch / CAD) oluştur.
    
    Kurallar:
    1. Stil: Sadece siyah kontur çizgileri (clean line art). Gölgelendirme, renk veya doku YOK.
    2. Detay: Dikiş yerleri (topstitching), fermuarlar, cepler, ribana detayları, düğmeler net bir şekilde çizilmeli.
    3. Perspektif: Ürün tamamen önden, düz (flat) ve simetrik bir şekilde çizilmeli.
    4. Sunum: Arka plan saf beyaz olmalı. İnsan figürü veya manken kullanılmamalı.
    5. Kalite: Vektörel çizim hassasiyetinde, keskin ve temiz çizgiler.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
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

    let operation = await ai.models.generateVideos({
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

    console.log('Initial operation response:', operation);

    // Poll for completion with timeout
    let pollCount = 0;
    const maxPolls = 60; // 10 minutes max (60 * 10 seconds)

    while (!operation.done && pollCount < maxPolls) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        pollCount++;
        console.log(`Polling attempt ${pollCount}/${maxPolls}...`);

        try {
            operation = await ai.operations.getVideosOperation({ operation: operation });
            console.log('Operation status:', { done: operation.done, pollCount });
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

    if (operation.response?.generatedVideos?.[0]?.video?.uri) {
        const downloadLink = operation.response.generatedVideos[0].video.uri;
        console.log('Video URI found:', downloadLink);

        // Append API key strictly from the variable
        const videoRes = await fetch(`${downloadLink}&key=${API_KEY}`);

        if (!videoRes.ok) {
            const err = await videoRes.text();
            console.warn("Video download failed:", err);
            throw new Error(`Video indirilemedi: ${err}`);
        }

        const blob = await videoRes.blob();
        return URL.createObjectURL(blob);
    }

    // More detailed error message
    const errorDetails = {
        done: operation.done,
        hasResponse: !!operation.response,
        hasVideos: !!operation.response?.generatedVideos,
        videoCount: operation.response?.generatedVideos?.length || 0,
    };

    console.error('Video generation failed. Operation details:', errorDetails);
    throw new Error(`Video oluşturulamadı. API'den video URI alınamadı. Lütfen tekrar deneyin veya farklı ayarlar kullanın.`);
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
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const imagePart = await fileToGenerativePart(imageFile);

    // Convert inputs to parts array
    const promptParts: any[] = [imagePart];

    // Add second product image if provided (for Alt & Üst kombin)
    if (secondProductFile) {
        const secondPart = await fileToGenerativePart(secondProductFile);
        promptParts.push(secondPart);
        console.log('📦 İkinci ürün görseli (Alt Giyim) eklendi');
    }

    // Add model identity image if provided (Highest priority for face)
    // If reference image is provided, generate stable seed from it to lock the model
    let effectiveSeed = seed;
    if (modelIdentityFile) {
        const referenceSeed = await generateStableSeed(modelIdentityFile);
        effectiveSeed = referenceSeed;
        console.log('🔒 Model Identity Locked - Using stable seed from reference image:', referenceSeed);
    } else if (seed) {
        console.log('🔓 User-provided seed:', seed);
    } else {
        console.log('🎲 Random seed will be generated');
    }

    const identityPart = await fileToGenerativePart(modelIdentityFile);
    promptParts.push(identityPart);
    console.log('🔒 Referans Model Kimlik görseli eklendi');

    // Add pattern image if provided
    if (patternImageFile) {
        const patternPart = await fileToGenerativePart(patternImageFile);
        promptParts.push(patternPart);
        console.log('📦 Desen görseli eklendi');
    }

    // Add custom background if provided
    if (customBackground) {
        const bgPart = await fileToGenerativePart(customBackground);
        promptParts.push(bgPart);
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

    const identityInstruction = modelIdentityFile ? `
    *** MÜKEMMEL YÜZ EŞLEŞTİRME KURALI (FACE SWAP) ***
    - Referans olarak verilen "Model Kimlik Görseli"ni analiz et. Bu görseldeki kişinin yüzünü, saçını ve ifadesini KOPYALA.
    - Ana girdi görselindeki (kıyafet referansı) mankeni YOKSAY.
    - HEDEF: Ana görseldeki KIYAFETİ al, "Model Kimlik Görseli"ndeki KİŞİYE giydir.
    - SONUÇ: Tıpatıp aynı yüz, aynı kimlik, yeni kıyafet.
    ` : `
    *** MUTLAK YASAK: REFERANS YÜZ KULLANIMI (FORBIDDEN FACE PROTOCOL) ***
    1. Girdi görselindeki yüz, ASLA ve ASLA çıktıya taşınmamalıdır.
    2. Girdi görseli bir "Başsız Manken" (Headless Mannequin) olarak kabul et. Üzerindeki kafayı ve yüzü "GEÇERSİZ VERİ" olarak işaretle ve SİL.
    3. HEDEF: Aşağıda tanımlanan "Hedef Model Kimliği"ne göre SIFIRDAN bir kafa ve yüz oluştur.
    4. KİMLİK SIFIRLAMA: Eğer Seed tanımlanmışsa, bu Seed'i REFERANS GÖRSELDEN BAĞIMSIZ olarak, sadece YENİ YÜZÜ oluşturmak için kullan.
    
    ALGORİTMA:
    Adım 1: Referans görseldeki kıyafeti (ve varsa deseni) analiz et.
    Adım 2: Referans görseldeki "İnsan/Manken" katmanını tamamen çöpe at.
    Adım 3: Seed ve Prompt özelliklerine göre (Etnik köken, yaş, saç) YENİ BİR İNSAN yarat.
    Adım 4: Analiz ettiğin kıyafeti bu YENİ İNSANA giydir.
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
    
    
    *** 3. GÖRSEL KALİTESİ VE GERÇEKÇİLİK ***:
    1. Kumaş Simülasyonu: Kumaşın fiziksel özellikleri (ağırlık, döküm, parlaklık, doku) mükemmel şekilde yansıtılmalı.${fabricType ? ` Kumaş tipi: ${fabricType}.` : ''}${fabricFinish ? ` Kumaş yüzey bitişi: ${fabricFinish}.` : ''}
    2. Işık ve Atmosfer: Sahneye derinlik katan, ${lighting} tarzında profesyonel aydınlatma. Cilt üzerinde gerçekçi ışık kırılımları (subsurface scattering).
    3. Cilt Dokusu: Modelin cildi pürüzsüz plastik gibi değil, doğal gözenekli, kusurları ve detayları olan gerçek insan cildi gibi olmalı.
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
    const gen = gender || 'Female';
    const age = ageRange || 'Adult';
    const eth = ethnicity && ethnicity !== 'Genel Dünya Karması' ? ethnicity : 'diverse/international model look';

    prompt += `
    *** MODEL KİMLİĞİ TALİMATI ***
        - Cinsiyet: ${gen === 'Female' ? 'Kadın (Female)' : 'Erkek (Male)'}
- Yaş Grubu: ${age}
- Etnik Köken: ${eth}
- YÜZ ÖZELLİKLERİ: Bu seed('${seed || 'random'}') için benzersiz ve tutarlı bir yüz yapısı oluştur.Referans resimdeki insan yüzünü KESİNLİKLE KOPYALAMA.
    `;

    if (bodyType && bodyType !== 'Standart') {
        prompt += ` Modelin vücut tipi: ${bodyType}.`;
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
            model: 'gemini-2.5-flash-image',
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