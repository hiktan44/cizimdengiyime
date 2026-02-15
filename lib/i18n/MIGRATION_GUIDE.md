# 🌍 Fasheone i18n Migrasyon Kılavuzu

## Mevcut Durum

10 dosyada `type Language = 'tr' | 'en'` tekrarlanıyor:

### Pages (5)
1. `pages/AdgeniusPage.tsx`
2. `pages/FotomatikPage.tsx`
3. `pages/CollagePage.tsx`
4. `pages/LandingPage.tsx`
5. `pages/PixshopPage.tsx`

### Components (5)
6. `components/AdminDashboard.tsx`
7. `components/VideoSettingsModal.tsx`
8. `components/admin/SettingsPanel.tsx`
9. `components/admin/UserActivityPanel.tsx`
10. `components/admin/TransactionsPanel.tsx`

---

## Yeni Merkezi i18n Yapısı

```
lib/i18n/
├── index.ts         # Barrel export
├── types.ts         # Language tipi, SUPPORTED_LANGUAGES, metadata
├── context.tsx      # I18nProvider, useI18n, useTranslation hooks
└── common.ts        # Ortak çeviriler (mesajlar, butonlar, etiketler)

lib/i18n/locales/    # Sayfa bazlı çeviriler (opsiyonel)
├── adgenius.ts
├── fotomatik.ts
├── collage.ts
├── landing.ts
├── pixshop.ts
├── admin.ts
└── videoSettings.ts
```

---

## Migrasyon Adımları (Her Dosya İçin)

### Adım 1: Eski kodu bulun
```tsx
// ESKİ - SİLİNECEK
type Language = 'tr' | 'en';

const translations = {
  tr: { title: 'Başlık', ... },
  en: { title: 'Title', ... },
};

// Component içinde:
const [language, setLanguage] = useState<Language>(() => {
  const saved = localStorage.getItem('fasheone_language') as Language;
  return saved || 'tr';
});

// Kullanım:
const t = translations[language];
```

### Adım 2: Yeni sisteme geçin

**Seçenek A: Çevirileri dosyada bırak (minimal değişiklik)**
```tsx
// YENİ - Sadece import ve hook değişikliği
import { useI18n, useTranslation, TranslationRecord } from '../lib/i18n';

// Çeviriler dosyada kalabilir ama tip güvenli olur
const translations: TranslationRecord<{ title: string; /* ... */ }> = {
  tr: { title: 'Başlık', ... },
  en: { title: 'Title', ... },
};

// Component içinde:
const t = useTranslation(translations);
// "language" ve "setLanguage" lazımsa:
// const { language, setLanguage } = useI18n();

// Kullanım (aynı kalır):
// t.title, t.buttons.start vb.
```

**Seçenek B: Çevirileri ayrı dosyaya taşı (önerilen)**
```tsx
// lib/i18n/locales/adgenius.ts
import { TranslationRecord } from '../types';

export interface AdgeniusTranslations {
  title: string;
  subtitle: string;
  modes: { /* ... */ };
  buttons: { /* ... */ };
}

export const adgeniusTranslations: TranslationRecord<AdgeniusTranslations> = {
  tr: { title: 'AdGenius', ... },
  en: { title: 'AdGenius', ... },
};

// Sayfa dosyasında:
import { useTranslation } from '../lib/i18n';
import { adgeniusTranslations } from '../lib/i18n/locales/adgenius';

const t = useTranslation(adgeniusTranslations);
```

### Adım 3: Eski kodu temizleyin
```diff
- type Language = 'tr' | 'en';
- 
- const [language, setLanguage] = useState<Language>(() => {
-   const saved = localStorage.getItem('fasheone_language') as Language;
-   return saved || 'tr';
- });
- 
- useEffect(() => {
-   const savedLang = localStorage.getItem('fasheone_language') as Language;
-   if (savedLang) setLanguage(savedLang);
- }, []);
+ // Bunların hiçbiri gerekli değil artık!
+ // useI18n() hook'u tüm yönetimi yapar.
```

---

## Yeni Dil Ekleme (Gelecek)

### 1. `lib/i18n/types.ts` dosyasını güncelleyin:
```typescript
export const SUPPORTED_LANGUAGES = ['tr', 'en', 'de'] as const; // Almanca eklendi

export const LANGUAGE_INFO: Record<Language, LanguageInfo> = {
  // ... mevcut diller
  de: {
    code: 'de',
    name: 'Deutsch',
    nameEn: 'German',
    flag: '🇩🇪',
    dir: 'ltr',
    currency: 'EUR',
    currencySymbol: '€',
  },
};
```

### 2. TypeScript sizi tüm eksik çeviriler için uyaracaktır!
Tüm `TranslationRecord<T>` kullanan dosyalarda `de` anahtarı eksik olduğunda hata alırsınız.

### 3. Her çeviri dosyasına Almanca çevirileri ekleyin.

---

## Öneri: Migrasyon Sırası

1. ✅ **Altyapı hazır** (types.ts, context.tsx, common.ts, index.ts)
2. ✅ **I18nProvider** index.tsx'e eklendi
3. ✅ **LanguageSwitcher** bileşeni oluşturuldu
4. ⬜ **Sayfalarda migrasyon** (kolay → zor sırasıyla):
   - `components/admin/SettingsPanel.tsx` (küçük dosya)
   - `components/admin/UserActivityPanel.tsx` (küçük dosya)
   - `components/admin/TransactionsPanel.tsx` (küçük dosya)
   - `components/VideoSettingsModal.tsx`
   - `components/AdminDashboard.tsx`
   - `pages/CollagePage.tsx`
   - `pages/AdgeniusPage.tsx`
   - `pages/PixshopPage.tsx`
   - `pages/FotomatikPage.tsx`
   - `pages/LandingPage.tsx` (en büyük, en son)
