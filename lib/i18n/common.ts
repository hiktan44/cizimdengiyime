/**
 * Ortak çeviriler - Tüm sayfalarda tekrar eden metinler
 * Yeni dil eklerken bu dosyaya da eklemeniz gerekir.
 */

import { TranslationRecord } from './types';

export interface CommonTranslations {
    messages: {
        loginRequired: string;
        insufficientCredits: string;
        processing: string;
        success: string;
        error: string;
        loading: string;
        saving: string;
        deleting: string;
        uploading: string;
        downloading: string;
        confirm: string;
        cancel: string;
        close: string;
        retry: string;
        back: string;
        next: string;
    };
    credits: {
        available: string;
        credits: string;
        perImage: string;
        perVideo: string;
        totalUsed: string;
        buyCredits: string;
        creditCost: string;
    };
    auth: {
        signIn: string;
        signOut: string;
        signUp: string;
        email: string;
        password: string;
        forgotPassword: string;
        continueWith: string;
    };
    actions: {
        download: string;
        upload: string;
        copy: string;
        copied: string;
        delete: string;
        edit: string;
        save: string;
        reset: string;
        clear: string;
        generate: string;
        create: string;
        remove: string;
        select: string;
        preview: string;
        share: string;
        apply: string;
    };
    labels: {
        image: string;
        video: string;
        images: string;
        videos: string;
        result: string;
        results: string;
        settings: string;
        options: string;
        search: string;
        filter: string;
        sort: string;
        name: string;
        description: string;
        price: string;
        date: string;
        status: string;
        type: string;
    };
    time: {
        justNow: string;
        minutesAgo: string;
        hoursAgo: string;
        daysAgo: string;
        today: string;
        yesterday: string;
    };
}

export const commonTranslations: TranslationRecord<CommonTranslations> = {
    tr: {
        messages: {
            loginRequired: 'İşlem yapmak için giriş yapmalısınız.',
            insufficientCredits: 'Yetersiz kredi.',
            processing: 'İşleniyor...',
            success: 'İşlem başarılı!',
            error: 'Bir hata oluştu',
            loading: 'Yükleniyor...',
            saving: 'Kaydediliyor...',
            deleting: 'Siliniyor...',
            uploading: 'Yükleniyor...',
            downloading: 'İndiriliyor...',
            confirm: 'Onayla',
            cancel: 'İptal',
            close: 'Kapat',
            retry: 'Tekrar Dene',
            back: 'Geri',
            next: 'İleri',
        },
        credits: {
            available: 'Mevcut',
            credits: 'kredi',
            perImage: 'Görsel başı',
            perVideo: 'Video başı',
            totalUsed: 'Harcanan Kredi',
            buyCredits: 'Kredi Al',
            creditCost: 'İşlem bedeli',
        },
        auth: {
            signIn: 'Giriş Yap',
            signOut: 'Çıkış',
            signUp: 'Kayıt Ol',
            email: 'E-posta',
            password: 'Şifre',
            forgotPassword: 'Şifremi Unuttum',
            continueWith: 'ile devam et',
        },
        actions: {
            download: 'İndir',
            upload: 'Yükle',
            copy: 'Kopyala',
            copied: 'Kopyalandı!',
            delete: 'Sil',
            edit: 'Düzenle',
            save: 'Kaydet',
            reset: 'Sıfırla',
            clear: 'Temizle',
            generate: 'Oluştur',
            create: 'Oluştur',
            remove: 'Kaldır',
            select: 'Seç',
            preview: 'Önizle',
            share: 'Paylaş',
            apply: 'Uygula',
        },
        labels: {
            image: 'Görsel',
            video: 'Video',
            images: 'Görseller',
            videos: 'Videolar',
            result: 'Sonuç',
            results: 'Sonuçlar',
            settings: 'Ayarlar',
            options: 'Seçenekler',
            search: 'Ara',
            filter: 'Filtre',
            sort: 'Sırala',
            name: 'Ad',
            description: 'Açıklama',
            price: 'Fiyat',
            date: 'Tarih',
            status: 'Durum',
            type: 'Tür',
        },
        time: {
            justNow: 'Şimdi',
            minutesAgo: 'dakika önce',
            hoursAgo: 'saat önce',
            daysAgo: 'gün önce',
            today: 'Bugün',
            yesterday: 'Dün',
        },
    },
    en: {
        messages: {
            loginRequired: 'Please login to perform this action.',
            insufficientCredits: 'Insufficient credits.',
            processing: 'Processing...',
            success: 'Operation successful!',
            error: 'An error occurred',
            loading: 'Loading...',
            saving: 'Saving...',
            deleting: 'Deleting...',
            uploading: 'Uploading...',
            downloading: 'Downloading...',
            confirm: 'Confirm',
            cancel: 'Cancel',
            close: 'Close',
            retry: 'Retry',
            back: 'Back',
            next: 'Next',
        },
        credits: {
            available: 'Available',
            credits: 'credits',
            perImage: 'Per image',
            perVideo: 'Per video',
            totalUsed: 'Credits Used',
            buyCredits: 'Buy Credits',
            creditCost: 'Operation cost',
        },
        auth: {
            signIn: 'Sign In',
            signOut: 'Sign Out',
            signUp: 'Sign Up',
            email: 'Email',
            password: 'Password',
            forgotPassword: 'Forgot Password',
            continueWith: 'Continue with',
        },
        actions: {
            download: 'Download',
            upload: 'Upload',
            copy: 'Copy',
            copied: 'Copied!',
            delete: 'Delete',
            edit: 'Edit',
            save: 'Save',
            reset: 'Reset',
            clear: 'Clear',
            generate: 'Generate',
            create: 'Create',
            remove: 'Remove',
            select: 'Select',
            preview: 'Preview',
            share: 'Share',
            apply: 'Apply',
        },
        labels: {
            image: 'Image',
            video: 'Video',
            images: 'Images',
            videos: 'Videos',
            result: 'Result',
            results: 'Results',
            settings: 'Settings',
            options: 'Options',
            search: 'Search',
            filter: 'Filter',
            sort: 'Sort',
            name: 'Name',
            description: 'Description',
            price: 'Price',
            date: 'Date',
            status: 'Status',
            type: 'Type',
        },
        time: {
            justNow: 'Just now',
            minutesAgo: 'minutes ago',
            hoursAgo: 'hours ago',
            daysAgo: 'days ago',
            today: 'Today',
            yesterday: 'Yesterday',
        },
    },
};
