/**
 * Merkezi Hata Mesajı Dönüştürücü
 * API'den gelen teknik hataları kullanıcı dostu Türkçe/İngilizce mesajlara çevirir.
 */

interface ErrorMessages {
    serverOverloaded: string;
    rateLimited: string;
    allModelsFailed: string;
    networkError: string;
    authError: string;
    invalidInput: string;
    serverError: string;
    timeoutError: string;
    unknownError: string;
    retryHint: string;
    creditError: string;
    fileTooBig: string;
    unsupportedFormat: string;
    apiKeyMissing: string;
    modelNotAvailable: string;
}

const errorMessages: Record<'tr' | 'en', ErrorMessages> = {
    tr: {
        serverOverloaded: '🔄 Sunucularımız şu an çok yoğun. Lütfen birkaç saniye bekleyip tekrar deneyin.',
        rateLimited: '⏳ Çok fazla istek gönderildi. Lütfen biraz bekleyip tekrar deneyin.',
        allModelsFailed: '😔 Tüm AI modelleri şu an meşgul. Lütfen 1-2 dakika sonra tekrar deneyin.',
        networkError: '🌐 İnternet bağlantınızda bir sorun var. Lütfen bağlantınızı kontrol edip tekrar deneyin.',
        authError: '🔑 Oturum süreniz dolmuş olabilir. Lütfen sayfayı yenileyip tekrar giriş yapın.',
        invalidInput: '⚠️ Gönderilen bilgilerde bir hata var. Lütfen girdilerinizi kontrol edin.',
        serverError: '🛠️ Sunucu tarafında geçici bir sorun oluştu. Lütfen birkaç dakika sonra tekrar deneyin.',
        timeoutError: '⏱️ İstek zaman aşımına uğradı. Lütfen tekrar deneyin.',
        unknownError: '❌ Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin veya destek ekibimize ulaşın.',
        retryHint: '\n\n💡 İpucu: Sorun devam ederse, farklı ayarlarla (farklı mekan, farklı oran) tekrar deneyebilirsiniz.',
        creditError: '💳 Yeterli krediniz bulunmuyor. Lütfen kredi satın alın.',
        fileTooBig: '📦 Dosya boyutu çok büyük. Lütfen daha küçük bir dosya seçin.',
        unsupportedFormat: '📎 Desteklenmeyen dosya formatı. Lütfen PNG, JPG veya WEBP formatında bir dosya seçin.',
        apiKeyMissing: '🔐 API yapılandırması eksik. Lütfen yöneticinize başvurun.',
        modelNotAvailable: '🤖 Seçilen AI modeli şu an kullanıma kapalı. Sistem otomatik olarak alternatif modeli deneyecek.',
    },
    en: {
        serverOverloaded: '🔄 Our servers are currently experiencing high demand. Please wait a few seconds and try again.',
        rateLimited: '⏳ Too many requests sent. Please wait a moment and try again.',
        allModelsFailed: '😔 All AI models are currently busy. Please try again in 1-2 minutes.',
        networkError: '🌐 There seems to be an issue with your internet connection. Please check your connection and try again.',
        authError: '🔑 Your session may have expired. Please refresh the page and log in again.',
        invalidInput: '⚠️ There is an error in the submitted information. Please check your inputs.',
        serverError: '🛠️ A temporary server issue occurred. Please try again in a few minutes.',
        timeoutError: '⏱️ The request timed out. Please try again.',
        unknownError: '❌ An unexpected error occurred. Please try again or contact our support team.',
        retryHint: '\n\n💡 Tip: If the issue persists, try with different settings (different location, different ratio).',
        creditError: '💳 Insufficient credits. Please purchase more credits.',
        fileTooBig: '📦 File size is too large. Please select a smaller file.',
        unsupportedFormat: '📎 Unsupported file format. Please select a PNG, JPG, or WEBP file.',
        apiKeyMissing: '🔐 API configuration is missing. Please contact your administrator.',
        modelNotAvailable: '🤖 The selected AI model is currently unavailable. The system will automatically try an alternative model.',
    },
};

/**
 * API hata mesajını kullanıcı dostu mesaja dönüştürür.
 * Ham JSON hata mesajlarını analiz eder ve uygun Türkçe/İngilizce mesajı döner.
 */
export const getFriendlyErrorMessage = (error: unknown, lang: 'tr' | 'en' = 'tr'): string => {
    const msgs = errorMessages[lang];
    const errorStr = error instanceof Error ? error.message : String(error);
    const lowerError = errorStr.toLowerCase();

    // 503 - Sunucu yoğunluğu
    if (
        lowerError.includes('503') ||
        lowerError.includes('overloaded') ||
        lowerError.includes('high demand') ||
        lowerError.includes('unavailable') ||
        lowerError.includes('service unavailable') ||
        lowerError.includes('currently experiencing')
    ) {
        return msgs.serverOverloaded;
    }

    // 429 - Rate limiting
    if (
        lowerError.includes('429') ||
        lowerError.includes('rate limit') ||
        lowerError.includes('too many requests') ||
        lowerError.includes('quota exceeded') ||
        lowerError.includes('resource exhausted')
    ) {
        return msgs.rateLimited;
    }

    // Tüm modeller başarısız
    if (
        lowerError.includes('tüm modeller') ||
        lowerError.includes('all models') ||
        lowerError.includes('no successful')
    ) {
        return msgs.allModelsFailed + msgs.retryHint;
    }

    // Ağ hataları
    if (
        lowerError.includes('network') ||
        lowerError.includes('fetch') ||
        lowerError.includes('failed to fetch') ||
        lowerError.includes('net::err') ||
        lowerError.includes('econnrefused') ||
        lowerError.includes('enotfound')
    ) {
        return msgs.networkError;
    }

    // Auth hataları
    if (
        lowerError.includes('401') ||
        lowerError.includes('403') ||
        lowerError.includes('unauthorized') ||
        lowerError.includes('forbidden') ||
        lowerError.includes('authentication')
    ) {
        return msgs.authError;
    }

    // Geçersiz girdi
    if (
        lowerError.includes('400') ||
        lowerError.includes('bad request') ||
        lowerError.includes('invalid') ||
        lowerError.includes('validation')
    ) {
        return msgs.invalidInput;
    }

    // Timeout
    if (
        lowerError.includes('timeout') ||
        lowerError.includes('timed out') ||
        lowerError.includes('deadline exceeded')
    ) {
        return msgs.timeoutError;
    }

    // API key eksik
    if (
        lowerError.includes('api key') ||
        lowerError.includes('api_key') ||
        lowerError.includes('apikey')
    ) {
        return msgs.apiKeyMissing;
    }

    // Model kullanılamaz
    if (
        lowerError.includes('model not found') ||
        lowerError.includes('model is not') ||
        lowerError.includes('not supported')
    ) {
        return msgs.modelNotAvailable;
    }

    // Dosya formatı
    if (
        lowerError.includes('geçersiz dosya formatı') ||
        lowerError.includes('unsupported format') ||
        lowerError.includes('invalid format') ||
        lowerError.includes('invalid file') ||
        lowerError.includes('mimetype')
    ) {
        return msgs.unsupportedFormat;
    }

    // Dosya boyutu
    if (
        lowerError.includes('too large') ||
        lowerError.includes('payload too') ||
        lowerError.includes('file size')
    ) {
        return msgs.fileTooBig;
    }

    // 500 hatası
    if (
        lowerError.includes('500') ||
        lowerError.includes('internal server')
    ) {
        return msgs.serverError;
    }

    // Bilinmeyen hata - teknik detay gösterme
    return msgs.unknownError;
};

/**
 * Hata mesajının retry için uygun olup olmadığını döner
 */
export const isRetryableError = (error: unknown): boolean => {
    const errorStr = error instanceof Error ? error.message : String(error);
    const lowerError = errorStr.toLowerCase();

    return (
        lowerError.includes('503') ||
        lowerError.includes('429') ||
        lowerError.includes('overloaded') ||
        lowerError.includes('high demand') ||
        lowerError.includes('unavailable') ||
        lowerError.includes('timeout') ||
        lowerError.includes('timed out') ||
        lowerError.includes('network') ||
        lowerError.includes('fetch') ||
        lowerError.includes('rate limit') ||
        lowerError.includes('resource exhausted')
    );
};
