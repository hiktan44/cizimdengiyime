/**
 * Fasheone i18n React Context
 * Tüm uygulamada dil durumunu yönetir.
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
    Language,
    LanguageInfo,
    SUPPORTED_LANGUAGES,
    LANGUAGE_INFO,
    DEFAULT_LANGUAGE,
    LANGUAGE_STORAGE_KEY,
} from './types';

interface I18nContextValue {
    /** Aktif dil kodu */
    language: Language;
    /** Aktif dil bilgileri (ad, bayrak, para birimi vb.) */
    languageInfo: LanguageInfo;
    /** Dil değiştirme fonksiyonu */
    setLanguage: (lang: Language) => void;
    /** Desteklenen tüm diller */
    supportedLanguages: readonly Language[];
    /** Tüm dil bilgileri */
    allLanguageInfo: Record<Language, LanguageInfo>;
    /** Verilen bir namespace'in çevirilerini al */
    t: <T>(translations: Record<Language, T>) => T;
}

const I18nContext = createContext<I18nContextValue | null>(null);

/**
 * Kayıtlı dili localStorage'dan al
 */
const getSavedLanguage = (): Language => {
    try {
        const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY) as Language;
        if (saved && SUPPORTED_LANGUAGES.includes(saved)) {
            return saved;
        }
    } catch {
        // SSR veya localStorage erişim hatası
    }

    // Browser dilini kontrol et
    try {
        const browserLang = navigator.language.split('-')[0] as Language;
        if (SUPPORTED_LANGUAGES.includes(browserLang)) {
            return browserLang;
        }
    } catch {
        // SSR
    }

    return DEFAULT_LANGUAGE;
};

interface I18nProviderProps {
    children: React.ReactNode;
    /** Başlangıç dili (opsiyonel, localStorage'dan okunur) */
    initialLanguage?: Language;
}

export const I18nProvider: React.FC<I18nProviderProps> = ({ children, initialLanguage }) => {
    const [language, setLanguageState] = useState<Language>(initialLanguage || getSavedLanguage);

    // Dil değiştirme
    const setLanguage = useCallback((lang: Language) => {
        if (!SUPPORTED_LANGUAGES.includes(lang)) {
            console.warn(`Desteklenmeyen dil: ${lang}`);
            return;
        }
        setLanguageState(lang);
        try {
            localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
        } catch {
            // localStorage yazma hatası
        }

        // HTML dir ve lang attribute'larını güncelle
        document.documentElement.lang = lang;
        document.documentElement.dir = LANGUAGE_INFO[lang].dir;
    }, []);

    // İlk yüklemede HTML attribute'larını ayarla
    useEffect(() => {
        document.documentElement.lang = language;
        document.documentElement.dir = LANGUAGE_INFO[language].dir;
    }, [language]);

    // Diğer sekmelerden dil değişikliğini dinle
    useEffect(() => {
        const handleStorage = (e: StorageEvent) => {
            if (e.key === LANGUAGE_STORAGE_KEY && e.newValue) {
                const newLang = e.newValue as Language;
                if (SUPPORTED_LANGUAGES.includes(newLang)) {
                    setLanguageState(newLang);
                }
            }
        };

        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, []);

    // t() helper: verilen translations objesinden aktif dili seç
    const t = useCallback(<T,>(translations: Record<Language, T>): T => {
        return translations[language] || translations[DEFAULT_LANGUAGE];
    }, [language]);

    const value = useMemo<I18nContextValue>(() => ({
        language,
        languageInfo: LANGUAGE_INFO[language],
        setLanguage,
        supportedLanguages: SUPPORTED_LANGUAGES,
        allLanguageInfo: LANGUAGE_INFO,
        t,
    }), [language, setLanguage, t]);

    return (
        <I18nContext.Provider value={value}>
            {children}
        </I18nContext.Provider>
    );
};

/**
 * i18n hook - dil durumuna ve çeviri fonksiyonlarına erişim
 * 
 * Kullanım:
 * ```tsx
 * const { language, t, setLanguage } = useI18n();
 * const text = t(myTranslations); // aktif dile göre çeviriyi döndürür
 * ```
 */
export const useI18n = (): I18nContextValue => {
    const context = useContext(I18nContext);
    if (!context) {
        throw new Error('useI18n must be used within an I18nProvider');
    }
    return context;
};

/**
 * useTranslation hook - belirli bir namespace için çeviri döndürür
 * 
 * Kullanım:
 * ```tsx
 * const t = useTranslation(adgeniusTranslations);
 * // t.title, t.buttons.start vb. şeklinde kullanılır
 * ```
 */
export function useTranslation<T>(translations: Record<Language, T>): T {
    const { language } = useI18n();
    return useMemo(() => translations[language] || translations[DEFAULT_LANGUAGE], [translations, language]);
}
