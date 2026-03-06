/**
 * Fasheone i18n Type Definitions
 * İleride yeni diller eklemek için sadece bu dosyayı güncellemeniz yeterli.
 */

// Desteklenen diller - yeni dil eklemek için buraya ekleyin
export const SUPPORTED_LANGUAGES = ['tr', 'en'] as const;

export type Language = (typeof SUPPORTED_LANGUAGES)[number];

// Dil metadata bilgileri
export interface LanguageInfo {
    code: Language;
    name: string;        // Kendi dilindeki adı
    nameEn: string;      // İngilizce adı
    flag: string;        // Emoji bayrak
    dir: 'ltr' | 'rtl';  // Yazı yönü (Arapça vb. için)
    currency: string;    // Para birimi kodu
    currencySymbol: string;
}

export const LANGUAGE_INFO: Record<Language, LanguageInfo> = {
    tr: {
        code: 'tr',
        name: 'Türkçe',
        nameEn: 'Turkish',
        flag: '🇹🇷',
        dir: 'ltr',
        currency: 'TRY',
        currencySymbol: '₺',
    },
    en: {
        code: 'en',
        name: 'English',
        nameEn: 'English',
        flag: '🇬🇧',
        dir: 'ltr',
        currency: 'USD',
        currencySymbol: '$',
    },
    // İleride eklenecek diller:
    // ar: { code: 'ar', name: 'العربية', nameEn: 'Arabic', flag: '🇸🇦', dir: 'rtl', currency: 'SAR', currencySymbol: '﷼' },
    // de: { code: 'de', name: 'Deutsch', nameEn: 'German', flag: '🇩🇪', dir: 'ltr', currency: 'EUR', currencySymbol: '€' },
    // fr: { code: 'fr', name: 'Français', nameEn: 'French', flag: '🇫🇷', dir: 'ltr', currency: 'EUR', currencySymbol: '€' },
    // es: { code: 'es', name: 'Español', nameEn: 'Spanish', flag: '🇪🇸', dir: 'ltr', currency: 'EUR', currencySymbol: '€' },
    // ja: { code: 'ja', name: '日本語', nameEn: 'Japanese', flag: '🇯🇵', dir: 'ltr', currency: 'JPY', currencySymbol: '¥' },
    // zh: { code: 'zh', name: '中文', nameEn: 'Chinese', flag: '🇨🇳', dir: 'ltr', currency: 'CNY', currencySymbol: '¥' },
    // ru: { code: 'ru', name: 'Русский', nameEn: 'Russian', flag: '🇷🇺', dir: 'ltr', currency: 'RUB', currencySymbol: '₽' },
};

// Varsayılan dil
export const DEFAULT_LANGUAGE: Language = 'tr';

// localStorage anahtarı
export const LANGUAGE_STORAGE_KEY = 'fasheone_language';

/**
 * Generic translation record type.
 * Her namespace kendi translation tipini tanımlar, 
 * ancak tüm desteklenen diller için çeviri sağlamalıdır.
 * 
 * Kullanım:
 *   type MyTranslations = TranslationRecord<{ title: string; desc: string }>;
 *   const myTranslations: MyTranslations = { tr: { title: '...', desc: '...' }, en: { title: '...', desc: '...' } };
 */
export type TranslationRecord<T> = Record<Language, T>;
