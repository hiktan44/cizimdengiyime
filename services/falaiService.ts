/**
 * Fal.ai Fallback Servisi
 * Gemini 503/UNAVAILABLE hatalarında alternatif AI sunucusu olarak kullanılır.
 * REST API ile çalışır — ek paket gerektirmez.
 */

const FAL_API_KEY = import.meta.env.VITE_FAL_AI_API_KEY as string;
const FAL_BASE_URL = 'https://queue.fal.run';

// Model tanımları
const FAL_MODELS = {
    IMAGE: 'fal-ai/nano-banana-pro',
    IMAGE_EDIT: 'fal-ai/nano-banana-pro/edit',
    VIDEO: 'fal-ai/kling-video/v1/standard',
} as const;

/**
 * Fal.ai API key kontrolü
 */
export const hasFalApiKey = (): boolean => {
    return !!(FAL_API_KEY && FAL_API_KEY !== 'undefined' && FAL_API_KEY !== 'your_fal_ai_api_key_here');
};

/**
 * Fal.ai Queue API - İş gönder ve sonucu bekle
 */
const falQueueRequest = async (model: string, input: Record<string, any>): Promise<any> => {
    if (!hasFalApiKey()) {
        throw new Error('FAL_API_KEY_MISSING');
    }

    // 1. İşi kuyruğa gönder
    const submitRes = await fetch(`${FAL_BASE_URL}/${model}`, {
        method: 'POST',
        headers: {
            'Authorization': `Key ${FAL_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
    });

    if (!submitRes.ok) {
        const errText = await submitRes.text().catch(() => '');
        throw new Error(`Fal.ai submit hatası (${submitRes.status}): ${errText}`);
    }

    const submitData = await submitRes.json();
    const requestId = submitData.request_id;

    if (!requestId) {
        // Senkron yanıt geldiyse direkt döndür
        return submitData;
    }

    // 2. Sonucu bekle (polling)
    const statusUrl = `https://queue.fal.run/${model}/requests/${requestId}/status`;
    const resultUrl = `https://queue.fal.run/${model}/requests/${requestId}`;

    const MAX_POLL = 120; // Max 120 saniye bekle
    for (let i = 0; i < MAX_POLL; i++) {
        await new Promise(r => setTimeout(r, 2000)); // 2 saniye bekle

        const statusRes = await fetch(statusUrl, {
            headers: { 'Authorization': `Key ${FAL_API_KEY}` },
        });

        if (!statusRes.ok) continue;

        const statusData = await statusRes.json();

        if (statusData.status === 'COMPLETED') {
            // Sonucu al
            const resultRes = await fetch(resultUrl, {
                headers: { 'Authorization': `Key ${FAL_API_KEY}` },
            });
            if (!resultRes.ok) throw new Error('Fal.ai sonuç alınamadı');
            return await resultRes.json();
        }

        if (statusData.status === 'FAILED') {
            throw new Error(`Fal.ai işlem başarısız: ${statusData.error || 'Bilinmeyen hata'}`);
        }

        // IN_QUEUE veya IN_PROGRESS — beklemeye devam
    }

    throw new Error('Fal.ai zaman aşımı - işlem çok uzun sürdü');
};

/**
 * Fal.ai ile görsel üretimi (text-to-image)
 * @returns base64 data URL
 */
export const falGenerateImage = async (
    prompt: string,
    options?: {
        imageSize?: string;
        numImages?: number;
        referenceImageUrl?: string;
    }
): Promise<string> => {
    console.log('🎨 Fal.ai Nano Banana Pro ile görsel üretiliyor...');

    const input: Record<string, any> = {
        prompt,
        image_size: options?.imageSize || '1024x1024',
        num_images: options?.numImages || 1,
        output_format: 'png',
    };

    // Referans görsel varsa ekle
    if (options?.referenceImageUrl) {
        input.image_url = options.referenceImageUrl;
    }

    const result = await falQueueRequest(FAL_MODELS.IMAGE, input);

    // Fal.ai yanıtından URL al ve base64'e çevir
    const imageUrl = result?.images?.[0]?.url || result?.image?.url;
    if (!imageUrl) throw new Error('Fal.ai görsel URL bulunamadı');

    // URL'den base64'e çevir
    const imgRes = await fetch(imageUrl);
    const blob = await imgRes.blob();

    return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

/**
 * Fal.ai ile görsel düzenleme (image edit)
 * @returns base64 data URL
 */
export const falEditImage = async (
    prompt: string,
    imageBase64: string,
    options?: {
        imageSize?: string;
    }
): Promise<string> => {
    console.log('✏️ Fal.ai Nano Banana Pro Edit ile görsel düzenleniyor...');

    const input: Record<string, any> = {
        prompt,
        image_url: imageBase64.startsWith('data:') ? imageBase64 : `data:image/png;base64,${imageBase64}`,
        image_size: options?.imageSize || '1024x1024',
        output_format: 'png',
    };

    const result = await falQueueRequest(FAL_MODELS.IMAGE_EDIT, input);

    const imageUrl = result?.images?.[0]?.url || result?.image?.url;
    if (!imageUrl) throw new Error('Fal.ai düzenleme sonucu bulunamadı');

    const imgRes = await fetch(imageUrl);
    const blob = await imgRes.blob();

    return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

/**
 * Fal.ai ile video üretimi
 * @returns video blob URL
 */
export const falGenerateVideo = async (
    prompt: string,
    options?: {
        imageUrl?: string;
        duration?: number;
        aspectRatio?: string;
    }
): Promise<string> => {
    console.log('🎬 Fal.ai Kling Video ile video üretiliyor...');

    const input: Record<string, any> = {
        prompt,
        duration: options?.duration || 5,
        aspect_ratio: options?.aspectRatio || '16:9',
    };

    if (options?.imageUrl) {
        input.image_url = options.imageUrl;
    }

    const result = await falQueueRequest(FAL_MODELS.VIDEO, input);

    const videoUrl = result?.video?.url;
    if (!videoUrl) throw new Error('Fal.ai video URL bulunamadı');

    // Video URL'den blob oluştur
    const videoRes = await fetch(videoUrl);
    const blob = await videoRes.blob();
    return URL.createObjectURL(blob);
};

/**
 * Fallback mesajları (kullanıcıya gösterilecek)
 */
export const FAL_FALLBACK_MESSAGES = {
    tr: {
        switching: '🔄 Ana sunucu yoğun, alternatif AI sunucusuna geçiliyor... Bu işlem biraz daha uzun sürebilir.',
        success: '✅ Alternatif sunucu ile başarıyla tamamlandı.',
        failed: '❌ Alternatif sunucu da yanıt veremedi. Lütfen birkaç dakika sonra tekrar deneyin.',
        noKey: '⚠️ Alternatif sunucu yapılandırılmamış. Lütfen yöneticinize başvurun.',
    },
    en: {
        switching: '🔄 Main server is busy, switching to alternative AI server... This may take a bit longer.',
        success: '✅ Successfully completed with alternative server.',
        failed: '❌ Alternative server also failed to respond. Please try again in a few minutes.',
        noKey: '⚠️ Alternative server is not configured. Please contact your administrator.',
    },
};
