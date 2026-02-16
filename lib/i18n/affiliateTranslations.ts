/**
 * Fasheone Affiliate Çevirileri (TR / EN)
 */

export const affiliateTranslations = {
    tr: {
        // Portal Genel
        portal: {
            title: 'Ortaklık Paneli',
            subtitle: 'Kazançlarınızı takip edin',
            tabs: {
                dashboard: 'Genel Bakış',
                customers: 'Müşteriler',
                commissions: 'Komisyonlar',
                payouts: 'Ödemeler',
                settings: 'Ayarlar',
            },
        },

        // İstatistik Kartları
        stats: {
            totalEarnings: 'Toplam Kazanç',
            pendingBalance: 'Bekleyen Bakiye',
            totalPaid: 'Toplam Ödenen',
            totalCustomers: 'Toplam Müşteri',
            convertedCustomers: 'Satın Alan Müşteri',
            totalClicks: 'Toplam Tıklama',
            conversionRate: 'Dönüşüm Oranı',
            thisMonth: 'Bu Ay Kazanç',
        },

        // Müşteri Tablosu
        customers: {
            title: 'Yönlendirilen Müşteriler',
            name: 'Müşteri Adı',
            email: 'E-posta',
            status: 'Durum',
            attributedAt: 'Yönlendirme Tarihi',
            firstPurchase: 'İlk Satın Alma',
            amount: 'Tutar',
            noCustomers: 'Henüz müşteri yönlendirmediniz',
            statusLabels: {
                referred: 'Yönlendirildi',
                converted: 'Satın Aldı',
                expired: 'Süresi Doldu',
            },
        },

        // Komisyon Tablosu
        commissions: {
            title: 'Komisyon Detayları',
            customer: 'Müşteri',
            orderAmount: 'Sipariş Tutarı',
            rate: 'Oran',
            commission: 'Komisyon',
            status: 'Durum',
            date: 'Tarih',
            noCommissions: 'Henüz komisyon kazanmadınız',
            statusLabels: {
                pending: 'Beklemede',
                approved: 'Onaylandı',
                paid: 'Ödendi',
                cancelled: 'İptal Edildi',
            },
        },

        // Ödeme Geçmişi
        payouts: {
            title: 'Ödeme Geçmişi',
            amount: 'Tutar',
            method: 'Yöntem',
            reference: 'Referans',
            status: 'Durum',
            period: 'Dönem',
            paidAt: 'Ödeme Tarihi',
            noPayouts: 'Henüz ödeme yapılmadı',
            statusLabels: {
                processing: 'İşleniyor',
                completed: 'Tamamlandı',
                failed: 'Başarısız',
            },
            bankTransfer: 'Banka Transferi',
        },

        // Ayarlar
        settings: {
            title: 'Ortak Bilgileri',
            referralLink: 'Referans Linkiniz',
            copyLink: 'Linki Kopyala',
            copied: 'Kopyalandı!',
            // Kişisel
            sectionPersonal: '👤 Kişisel Bilgiler',
            fullName: 'Ad Soyad',
            email: 'E-posta Adresi',
            phone: 'Telefon Numarası',
            // Banka
            sectionBank: '🏦 Banka Bilgileri',
            iban: 'IBAN',
            bankAccountHolder: 'Hesap Sahibi Adı',
            bankName: 'Banka Adı',
            swiftCode: 'SWIFT Kodu',
            // Firma (opsiyonel)
            sectionCompany: '🏢 Firma Bilgileri (Opsiyonel)',
            companyName: 'Şirket / Ticari Ünvan',
            companyType: 'Şirket Türü',
            companyTypes: {
                individual: 'Bireysel / Şahıs',
                sole_proprietorship: 'Şahıs Şirketi',
                limited: 'Limited Şirketi',
                corporation: 'Anonim Şirketi',
            },
            taxNumber: 'Vergi No / TC Kimlik',
            taxOffice: 'Vergi Dairesi',
            companyAddress: 'Şirket Adresi',
            save: 'Kaydet',
            saved: 'Kaydedildi!',
            contractStatus: 'Sözleşme Durumu',
            contractActive: 'Aktif',
            contractExpires: 'Bitiş Tarihi',
        },

        // Başvuru Formu
        application: {
            title: 'Ortaklık Başvurusu',
            subtitle: 'Fasheone ortaklık programına katılın ve kazanmaya başlayın',
            // Kişisel (zorunlu)
            sectionPersonal: '👤 Kişisel Bilgiler',
            fullName: 'Ad Soyad *',
            email: 'E-posta Adresi *',
            phone: 'Telefon Numarası *',
            // Banka (zorunlu)
            sectionBank: '🏦 Banka / Ödeme Bilgileri',
            iban: 'IBAN Numarası *',
            bankAccountHolder: 'Hesap Sahibi Adı *',
            bankName: 'Banka Adı *',
            swiftCode: 'SWIFT Kodu',
            // Firma (opsiyonel)
            sectionCompany: '🏢 Firma Bilgileri (Opsiyonel)',
            companyName: 'Şirket / Ticari Ünvan',
            companyType: 'Şirket Türü',
            companyTypes: {
                individual: 'Bireysel / Şahıs',
                sole_proprietorship: 'Şahıs Şirketi',
                limited: 'Limited Şirketi',
                corporation: 'Anonim Şirketi',
            },
            taxNumber: 'Vergi No / TC Kimlik',
            taxOffice: 'Vergi Dairesi',
            companyAddress: 'Şirket Adresi',
            requiredFields: '* işaretli alanlar zorunludur',
            submit: 'Başvur',
            submitting: 'Gönderiliyor...',
            success: 'Başvurunuz alındı! En kısa sürede değerlendirilecektir.',
            error: 'Başvuru sırasında bir hata oluştu.',
            alreadyApplied: 'Zaten başvuru yapmışsınız.',
            validationError: 'Lütfen zorunlu alanları doldurun (Ad Soyad, E-posta, Telefon, IBAN, Hesap Sahibi, Banka Adı)',
        },

        // Durum
        status: {
            pending: 'Beklemede',
            active: 'Aktif',
            suspended: 'Askıda',
            terminated: 'Sonlandırıldı',
        },

        // Admin Paneli
        admin: {
            title: 'Ortaklık Yönetimi',
            tabs: {
                overview: 'Genel Bakış',
                affiliates: 'Ortaklar',
                commissions: 'Komisyonlar',
                payouts: 'Ödemeler',
            },
            stats: {
                totalAffiliates: 'Toplam Ortak',
                activeAffiliates: 'Aktif Ortak',
                pendingApplications: 'Bekleyen Başvuru',
                totalCommissions: 'Toplam Komisyon',
                totalPaidOut: 'Toplam Ödenen',
                pendingPayouts: 'Bekleyen Ödeme',
            },
            actions: {
                approve: 'Onayla',
                reject: 'Reddet',
                suspend: 'Askıya Al',
                createPayout: 'Ödeme Oluştur',
                completePayout: 'Ödemeyi Tamamla',
            },
            noAffiliates: 'Henüz ortak yok',
        },

        // Bilgilendirme Sayfası
        infoPage: {
            heroTitle: 'Fasheone ile Kazan',
            heroSubtitle: 'Ortaklık programımıza katılın, müşteri yönlendirin, %25\'e varan komisyon kazanın!',
            ctaButton: 'Hemen Başvur',
            benefits: {
                title: 'Neden Fasheone Ortağı Olmalısınız?',
                items: [
                    { title: 'Kademeli Komisyon', desc: '%15 ile başla, %25\'e kadar yüksel' },
                    { title: 'Koşulsuz Kazanç', desc: '1 yıl boyunca koşulsuz komisyon garantisi' },
                    { title: 'Anlık Takip', desc: 'Gerçek zamanlı kazanç ve müşteri takibi' },
                    { title: 'Kolay Ödeme', desc: 'Aylık banka transferi ile ödeme' },
                ],
            },
            howItWorks: {
                title: 'Nasıl Çalışır?',
                steps: [
                    { title: 'Başvurun', desc: 'Ortaklık formunu doldurun, onay alın' },
                    { title: 'Paylaşın', desc: 'Özel referans linkinizi paylaşın' },
                    { title: 'Kazanın', desc: 'Yönlendirdiğiniz müşterilerden %25\'e varan komisyon alın' },
                ],
            },
            commission: {
                title: 'Kademeli Komisyon Oranları',
                tiers: [
                    { range: '0 - 1.000 Kredi', rate: '%15' },
                    { range: '1.000 - 10.000 Kredi', rate: '%20' },
                    { range: '10.000+ Kredi', rate: '%25' },
                ],
                duration: '1 Yıl',
                durationLabel: 'Komisyon Süresi',
                condition: 'Koşulsuz',
                conditionLabel: 'Kazanç Garantisi',
                tierLabel: 'Kademe',
                rateLabel: 'Komisyon Oranı',
            },
            faq: {
                title: 'Sıkça Sorulan Sorular',
                items: [
                    { q: 'Ortaklık programına kimler katılabilir?', a: 'Herkes katılabilir. Fasheone hesabınızla başvuru yapmanız yeterli.' },
                    { q: 'Komisyon nasıl hesaplanır?', a: 'Kademeli oran sistemi: 1.000 krediye kadar %15, 1.000-10.000 kredi arası %20, 10.000+ kredi %25 komisyon kazanırsınız.' },
                    { q: 'Ödeme ne zaman yapılır?', a: 'Komisyonlar aylık olarak banka transferi ile ödenir.' },
                    { q: 'Komisyon süresi ne kadar?', a: 'Ortaklık sözleşmesi 1 yıl sürelidir. Bu süre boyunca koşulsuz komisyon kazanırsınız.' },
                    { q: 'Birden fazla müşteri yönlendirebilir miyim?', a: 'Evet, sınırsız müşteri yönlendirebilirsiniz.' },
                ],
            },
        },
    },

    en: {
        portal: {
            title: 'Affiliate Portal',
            subtitle: 'Track your earnings',
            tabs: {
                dashboard: 'Overview',
                customers: 'Customers',
                commissions: 'Commissions',
                payouts: 'Payouts',
                settings: 'Settings',
            },
        },

        stats: {
            totalEarnings: 'Total Earnings',
            pendingBalance: 'Pending Balance',
            totalPaid: 'Total Paid',
            totalCustomers: 'Total Customers',
            convertedCustomers: 'Converted Customers',
            totalClicks: 'Total Clicks',
            conversionRate: 'Conversion Rate',
            thisMonth: 'This Month',
        },

        customers: {
            title: 'Referred Customers',
            name: 'Customer Name',
            email: 'Email',
            status: 'Status',
            attributedAt: 'Referral Date',
            firstPurchase: 'First Purchase',
            amount: 'Amount',
            noCustomers: 'No customers referred yet',
            statusLabels: {
                referred: 'Referred',
                converted: 'Converted',
                expired: 'Expired',
            },
        },

        commissions: {
            title: 'Commission Details',
            customer: 'Customer',
            orderAmount: 'Order Amount',
            rate: 'Rate',
            commission: 'Commission',
            status: 'Status',
            date: 'Date',
            noCommissions: 'No commissions earned yet',
            statusLabels: {
                pending: 'Pending',
                approved: 'Approved',
                paid: 'Paid',
                cancelled: 'Cancelled',
            },
        },

        payouts: {
            title: 'Payout History',
            amount: 'Amount',
            method: 'Method',
            reference: 'Reference',
            status: 'Status',
            period: 'Period',
            paidAt: 'Paid At',
            noPayouts: 'No payouts yet',
            statusLabels: {
                processing: 'Processing',
                completed: 'Completed',
                failed: 'Failed',
            },
            bankTransfer: 'Bank Transfer',
        },

        settings: {
            title: 'Affiliate Details',
            referralLink: 'Your Referral Link',
            copyLink: 'Copy Link',
            copied: 'Copied!',
            // Personal
            sectionPersonal: '👤 Personal Information',
            fullName: 'Full Name',
            email: 'Email Address',
            phone: 'Phone Number',
            // Bank
            sectionBank: '🏦 Bank Details',
            iban: 'IBAN',
            bankAccountHolder: 'Account Holder Name',
            bankName: 'Bank Name',
            swiftCode: 'SWIFT Code',
            // Company (optional)
            sectionCompany: '🏢 Company Details (Optional)',
            companyName: 'Company / Trade Name',
            companyType: 'Company Type',
            companyTypes: {
                individual: 'Individual',
                sole_proprietorship: 'Sole Proprietorship',
                limited: 'Limited Company',
                corporation: 'Corporation',
            },
            taxNumber: 'Tax ID',
            taxOffice: 'Tax Office',
            companyAddress: 'Company Address',
            save: 'Save',
            saved: 'Saved!',
            contractStatus: 'Contract Status',
            contractActive: 'Active',
            contractExpires: 'Expires',
        },

        application: {
            title: 'Affiliate Application',
            subtitle: 'Join the Fasheone affiliate program and start earning',
            // Personal (required)
            sectionPersonal: '👤 Personal Information',
            fullName: 'Full Name *',
            email: 'Email Address *',
            phone: 'Phone Number *',
            // Bank (required)
            sectionBank: '🏦 Bank / Payment Details',
            iban: 'IBAN Number *',
            bankAccountHolder: 'Account Holder Name *',
            bankName: 'Bank Name *',
            swiftCode: 'SWIFT Code',
            // Company (optional)
            sectionCompany: '🏢 Company Details (Optional)',
            companyName: 'Company / Trade Name',
            companyType: 'Company Type',
            companyTypes: {
                individual: 'Individual',
                sole_proprietorship: 'Sole Proprietorship',
                limited: 'Limited Company',
                corporation: 'Corporation',
            },
            taxNumber: 'Tax ID',
            taxOffice: 'Tax Office',
            companyAddress: 'Company Address',
            requiredFields: '* Required fields',
            submit: 'Apply',
            submitting: 'Submitting...',
            success: 'Your application has been received! It will be reviewed shortly.',
            error: 'An error occurred during application.',
            alreadyApplied: 'You have already applied.',
            validationError: 'Please fill in required fields (Full Name, Email, Phone, IBAN, Account Holder, Bank Name)',
        },

        status: {
            pending: 'Pending',
            active: 'Active',
            suspended: 'Suspended',
            terminated: 'Terminated',
        },

        admin: {
            title: 'Affiliate Management',
            tabs: {
                overview: 'Overview',
                affiliates: 'Affiliates',
                commissions: 'Commissions',
                payouts: 'Payouts',
            },
            stats: {
                totalAffiliates: 'Total Affiliates',
                activeAffiliates: 'Active Affiliates',
                pendingApplications: 'Pending Applications',
                totalCommissions: 'Total Commissions',
                totalPaidOut: 'Total Paid Out',
                pendingPayouts: 'Pending Payouts',
            },
            actions: {
                approve: 'Approve',
                reject: 'Reject',
                suspend: 'Suspend',
                createPayout: 'Create Payout',
                completePayout: 'Complete Payout',
            },
            noAffiliates: 'No affiliates yet',
        },

        infoPage: {
            heroTitle: 'Earn with Fasheone',
            heroSubtitle: 'Join our affiliate program, refer customers, earn up to 25% commission!',
            ctaButton: 'Apply Now',
            benefits: {
                title: 'Why Become a Fasheone Affiliate?',
                items: [
                    { title: 'Tiered Commission', desc: 'Start at 15%, scale up to 25%' },
                    { title: 'Unconditional Earnings', desc: '1 year unconditional commission guarantee' },
                    { title: 'Real-Time Tracking', desc: 'Track earnings and customers in real-time' },
                    { title: 'Easy Payments', desc: 'Monthly bank transfer payouts' },
                ],
            },
            howItWorks: {
                title: 'How It Works',
                steps: [
                    { title: 'Apply', desc: 'Fill out the affiliate form and get approved' },
                    { title: 'Share', desc: 'Share your unique referral link' },
                    { title: 'Earn', desc: 'Get up to 25% commission from referred customers' },
                ],
            },
            commission: {
                title: 'Tiered Commission Rates',
                tiers: [
                    { range: '0 - 1,000 Credits', rate: '15%' },
                    { range: '1,000 - 10,000 Credits', rate: '20%' },
                    { range: '10,000+ Credits', rate: '25%' },
                ],
                duration: '1 Year',
                durationLabel: 'Commission Duration',
                condition: 'Unconditional',
                conditionLabel: 'Earnings Guarantee',
                tierLabel: 'Tier',
                rateLabel: 'Commission Rate',
            },
            faq: {
                title: 'Frequently Asked Questions',
                items: [
                    { q: 'Who can join the affiliate program?', a: 'Anyone! Simply apply with your Fasheone account.' },
                    { q: 'How is commission calculated?', a: 'Tiered rate system: up to 1,000 credits = 15%, 1,000-10,000 credits = 20%, 10,000+ credits = 25% commission.' },
                    { q: 'When are payments made?', a: 'Commissions are paid monthly via bank transfer.' },
                    { q: 'How long does the commission last?', a: 'The affiliate contract lasts 1 year with unconditional commission.' },
                    { q: 'Can I refer multiple customers?', a: 'Yes, you can refer unlimited customers.' },
                ],
            },
        },
    },
};

export type AffiliateTranslations = typeof affiliateTranslations.tr;
