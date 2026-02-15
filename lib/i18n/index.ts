/**
 * Fasheone i18n - Merkezi Dil Yönetimi
 * 
 * Kullanım Kılavuzu:
 * 
 * 1. App.tsx'de I18nProvider ile sarmalayın:
 *    <I18nProvider><App /></I18nProvider>
 * 
 * 2. Herhangi bir component'te:
 *    const { language, t, setLanguage } = useI18n();
 *    veya
 *    const text = useTranslation(myTranslations);
 * 
 * 3. Çeviriler oluşturun:
 *    import { TranslationRecord } from '../lib/i18n';
 *    const translations: TranslationRecord<{ title: string }> = {
 *      tr: { title: 'Başlık' },
 *      en: { title: 'Title' },
 *    };
 * 
 * 4. Yeni dil eklemek için:
 *    - lib/i18n/types.ts > SUPPORTED_LANGUAGES dizisine dil kodunu ekleyin
 *    - lib/i18n/types.ts > LANGUAGE_INFO'ya dil metadata'sını ekleyin
 *    - Tüm çeviri dosyalarına yeni dili ekleyin (TypeScript sizi uyaracaktır)
 */

export { I18nProvider, useI18n, useTranslation } from './context';
export {
    SUPPORTED_LANGUAGES,
    LANGUAGE_INFO,
    DEFAULT_LANGUAGE,
    LANGUAGE_STORAGE_KEY,
} from './types';
export type {
    Language,
    LanguageInfo,
    TranslationRecord,
} from './types';
