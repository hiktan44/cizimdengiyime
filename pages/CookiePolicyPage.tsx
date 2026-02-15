import React from 'react';
import { useI18n } from '../lib/i18n';

interface CookiePolicyPageProps {
    onNavigateHome: () => void;
    theme?: 'light' | 'dark';
}

const tr = {
    backHome: '← Ana Sayfaya Dön',
    title: 'Çerez Politikası',
    subtitle: 'Çerezlerin ne olduğu, nasıl kullanıldığı ve tercihlerinizi nasıl yönetebileceğiniz hakkında bilgi.',
    s1Title: '1. Çerez Nedir?',
    s1Text: 'Çerezler, web sitemizi ziyaret ettiğinizde tarayıcınıza yerleştirilen küçük metin dosyalarıdır. Çerezler, siteyi her ziyaret ettiğinizde sizi tanımamıza, tercihlerinizi hatırlamamıza ve size daha iyi bir deneyim sunmamıza yardımcı olur.',
    s2Title: '2. Kullandığımız Çerez Türleri',
    s2_1Title: '2.1. Zorunlu Çerezler',
    s2_1Text: 'Bu çerezler web sitesinin düzgün çalışması için gereklidir. Bu çerezler olmadan site çalışmaz. Zorunlu çerezler devre dışı bırakılamaz.',
    s2_1Items: [
        { bold: 'Oturum çerezleri:', text: 'Giriş yaptığınızda kimliğinizi doğrulamak için kullanılır' },
        { bold: 'Güvenlik çerezleri:', text: 'CSRF saldırılarını önlemek için kullanılır' },
        { bold: 'Yük dengeleme çerezleri:', text: 'Site performansını optimize etmek için kullanılır' },
    ],
    s2_2Title: '2.2. İşlevsel Çerezler',
    s2_2Text: 'Bu çerezler, site üzerinde kişiselleştirilmiş bir deneyim sunmak için kullanılır.',
    s2_2Items: [
        { bold: 'Dil tercihi:', text: 'Seçtiğiniz dili hatırlamak için (1 yıl)' },
        { bold: 'Tema tercihi:', text: 'Açık/koyu tema seçiminizi hatırlamak için (1 yıl)' },
        { bold: 'Kullanıcı ayarları:', text: 'Kişiselleştirme tercihlerinizi saklamak için (6 ay)' },
    ],
    s2_3Title: '2.3. Analitik Çerezler',
    s2_3Text: 'Bu çerezler, siteyi nasıl kullandığınızı anlamamıza yardımcı olur. Tüm veriler anonim olarak toplanır.',
    s2_3Items: [
        { bold: 'Google Analytics:', text: 'Sayfa görüntüleme, ziyaret süresi, kullanıcı davranışı analizi (2 yıl)' },
        { bold: 'Performans çerezleri:', text: 'Sayfa yükleme süreleri ve hata takibi (1 yıl)' },
    ],
    s2_4Title: '2.4. Pazarlama Çerezleri',
    s2_4Text: 'Bu çerezler, size ilgili reklamlar göstermek ve pazarlama kampanyalarımızın etkinliğini ölçmek için kullanılır. Bu çerezler yalnızca açık rızanız ile kullanılır.',
    s2_4Items: [
        { bold: 'Google Ads:', text: 'Reklam kişiselleştirme ve dönüşüm takibi (90 gün)' },
        { bold: 'Facebook Pixel:', text: 'Sosyal medya reklam optimizasyonu (90 gün)' },
    ],
    s3Title: '3. Üçüncü Taraf Çerezleri',
    s3Text: 'Platformumuzda aşağıdaki üçüncü taraf hizmetler çerez kullanmaktadır:',
    s3Items: [
        { bold: 'Google (Giriş/Analitik):', text: 'OAuth kimlik doğrulama ve site analizi' },
        { bold: 'Stripe (Ödeme):', text: 'Güvenli ödeme işlemleri için dolandırıcılık önleme çerezleri' },
        { bold: 'Supabase (Altyapı):', text: 'Oturum yönetimi ve kimlik doğrulama' },
    ],
    s3Note: 'Bu üçüncü tarafların çerez politikaları hakkında detaylı bilgi için kendi gizlilik politikalarını incelemenizi öneririz.',
    s4Title: '4. Çerez Tercihlerinizi Yönetme',
    s4_1Title: '4.1. Tarayıcı Ayarları',
    s4_1Text: 'Tarayıcınızın ayarlarından çerezleri yönetebilirsiniz:',
    s4_1Items: [
        { bold: 'Chrome:', text: 'Ayarlar → Gizlilik ve Güvenlik → Çerezler' },
        { bold: 'Firefox:', text: 'Ayarlar → Gizlilik ve Güvenlik → Çerezler ve Site Verileri' },
        { bold: 'Safari:', text: 'Tercihler → Gizlilik → Çerezleri ve web sitesi verilerini yönet' },
        { bold: 'Edge:', text: 'Ayarlar → Gizlilik, Arama ve Hizmetler → Çerezler' },
    ],
    s4_2Title: '4.2. Çerez Onay Aracımız',
    s4_2Text: 'Web sitemizi ilk ziyaret ettiğinizde, çerez onay bannerı aracılığıyla tercihlerinizi belirleyebilirsiniz. Bu tercihleri istediğiniz zaman değiştirebilirsiniz.',
    s4_3Title: '4.3. Çerezleri Devre Dışı Bırakmanın Etkileri',
    s4_3Items: [
        'Zorunlu çerezler devre dışı bırakılırsa site düzgün çalışmayabilir',
        'İşlevsel çerezler devre dışı bırakılırsa tercihleriniz kaybolabilir',
        'Analitik çerezler devre dışı bırakılırsa kullanım deneyiminiz etkilenmez',
    ],
    s5Title: '5. Çerez Saklama Süreleri',
    s5Items: [
        { bold: 'Oturum çerezleri:', text: 'Tarayıcı kapatıldığında silinir' },
        { bold: 'Kalıcı çerezler:', text: 'Belirtilen süre sonunda otomatik silinir' },
        { bold: 'Üçüncü taraf çerezleri:', text: 'İlgili hizmet sağlayıcının politikasına göre' },
    ],
    s6Title: '6. Veri Güvenliği',
    s6Text: 'Çerezler aracılığıyla toplanan veriler:',
    s6Items: [
        'SSL/TLS şifreleme ile korunur',
        'Yasal saklama süreleri sonunda otomatik silinir',
        'Sadece yetkili personel tarafından erişilebilir',
        'KVKK ve GDPR uyumlu işlenir',
    ],
    s7Title: '7. Çerez Politikası Güncellemeleri',
    s7Text: 'Bu politikayı zaman zaman güncelleyebiliriz. Önemli değişiklikler olduğunda sizi bilgilendireceğiz. Son güncelleme tarihi sayfanın en üstünde belirtilmektedir.',
    s8Title: '8. İletişim',
    s8Text: 'Çerez politikamız hakkında sorularınız için:',
};

const en = {
    backHome: '← Back to Home',
    title: 'Cookie Policy',
    subtitle: 'Information about what cookies are, how we use them, and how you can manage your preferences.',
    s1Title: '1. What are Cookies?',
    s1Text: 'Cookies are small text files that are placed in your browser when you visit our website. Cookies help us recognize you each time you visit the site, remember your preferences, and provide you with a better experience.',
    s2Title: '2. Types of Cookies We Use',
    s2_1Title: '2.1. Essential Cookies',
    s2_1Text: 'These cookies are necessary for the website to function properly. The site cannot work without these cookies. Essential cookies cannot be disabled.',
    s2_1Items: [
        { bold: 'Session cookies:', text: 'Used to verify your identity when you log in' },
        { bold: 'Security cookies:', text: 'Used to prevent CSRF attacks' },
        { bold: 'Load balancing cookies:', text: 'Used to optimize site performance' },
    ],
    s2_2Title: '2.2. Functional Cookies',
    s2_2Text: 'These cookies are used to provide a personalized experience on the site.',
    s2_2Items: [
        { bold: 'Language preference:', text: 'To remember your selected language (1 year)' },
        { bold: 'Theme preference:', text: 'To remember your light/dark theme selection (1 year)' },
        { bold: 'User settings:', text: 'To store your personalization preferences (6 months)' },
    ],
    s2_3Title: '2.3. Analytics Cookies',
    s2_3Text: 'These cookies help us understand how you use the site. All data is collected anonymously.',
    s2_3Items: [
        { bold: 'Google Analytics:', text: 'Page views, visit duration, user behavior analysis (2 years)' },
        { bold: 'Performance cookies:', text: 'Page load times and error tracking (1 year)' },
    ],
    s2_4Title: '2.4. Marketing Cookies',
    s2_4Text: 'These cookies are used to show you relevant advertisements and measure the effectiveness of our marketing campaigns. These cookies are only used with your explicit consent.',
    s2_4Items: [
        { bold: 'Google Ads:', text: 'Ad personalization and conversion tracking (90 days)' },
        { bold: 'Facebook Pixel:', text: 'Social media ad optimization (90 days)' },
    ],
    s3Title: '3. Third-Party Cookies',
    s3Text: 'The following third-party services use cookies on our platform:',
    s3Items: [
        { bold: 'Google (Login/Analytics):', text: 'OAuth authentication and site analysis' },
        { bold: 'Stripe (Payment):', text: 'Fraud prevention cookies for secure payment processing' },
        { bold: 'Supabase (Infrastructure):', text: 'Session management and authentication' },
    ],
    s3Note: 'We recommend reviewing the privacy policies of these third parties for detailed information about their cookie policies.',
    s4Title: '4. Managing Your Cookie Preferences',
    s4_1Title: '4.1. Browser Settings',
    s4_1Text: 'You can manage cookies from your browser settings:',
    s4_1Items: [
        { bold: 'Chrome:', text: 'Settings → Privacy and Security → Cookies' },
        { bold: 'Firefox:', text: 'Settings → Privacy & Security → Cookies and Site Data' },
        { bold: 'Safari:', text: 'Preferences → Privacy → Manage Website Data' },
        { bold: 'Edge:', text: 'Settings → Privacy, Search, and Services → Cookies' },
    ],
    s4_2Title: '4.2. Our Cookie Consent Tool',
    s4_2Text: 'When you first visit our website, you can set your preferences through the cookie consent banner. You can change these preferences at any time.',
    s4_3Title: '4.3. Effects of Disabling Cookies',
    s4_3Items: [
        'The site may not function properly if essential cookies are disabled',
        'Your preferences may be lost if functional cookies are disabled',
        'Your usage experience will not be affected if analytics cookies are disabled',
    ],
    s5Title: '5. Cookie Retention Periods',
    s5Items: [
        { bold: 'Session cookies:', text: 'Deleted when the browser is closed' },
        { bold: 'Persistent cookies:', text: 'Automatically deleted after the specified period' },
        { bold: 'Third-party cookies:', text: 'According to the relevant service provider\'s policy' },
    ],
    s6Title: '6. Data Security',
    s6Text: 'Data collected through cookies:',
    s6Items: [
        'Protected with SSL/TLS encryption',
        'Automatically deleted at the end of legal retention periods',
        'Accessible only by authorized personnel',
        'Processed in compliance with KVKK and GDPR',
    ],
    s7Title: '7. Cookie Policy Updates',
    s7Text: 'We may update this policy from time to time. We will notify you of important changes. The last update date is indicated at the top of the page.',
    s8Title: '8. Contact',
    s8Text: 'For questions about our cookie policy:',
};

const translations = { tr, en };

export const CookiePolicyPage: React.FC<CookiePolicyPageProps> = ({ onNavigateHome, theme = 'dark' }) => {
    const bgClass = theme === 'dark' ? 'bg-slate-900' : 'bg-white';
    const textClass = theme === 'dark' ? 'text-white' : 'text-slate-900';
    const secondaryTextClass = theme === 'dark' ? 'text-slate-300' : 'text-slate-600';
    const cardBg = theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200';
    const { t } = useI18n();
    const p = t(translations);

    return (
        <div className={`min-h-screen ${bgClass}`}>
            <div className="container mx-auto px-4 py-12 max-w-4xl">
                <div className="mb-8">
                    <button onClick={onNavigateHome} className="text-cyan-500 hover:text-cyan-400 mb-4 flex items-center gap-2">{p.backHome}</button>
                    <h1 className={`text-4xl font-bold ${textClass} mb-4`}>{p.title}</h1>
                    <p className={secondaryTextClass}>{p.subtitle}</p>
                </div>

                <div className={`${cardBg} border rounded-2xl p-8 space-y-6`}>
                    <section>
                        <h2 className={`text-2xl font-bold ${textClass} mb-4`}>{p.s1Title}</h2>
                        <p className={secondaryTextClass}>{p.s1Text}</p>
                    </section>

                    <section>
                        <h2 className={`text-2xl font-bold ${textClass} mb-4`}>{p.s2Title}</h2>
                        <div className="space-y-6">
                            <div>
                                <h3 className={`text-xl font-semibold ${textClass} mb-2`}>{p.s2_1Title}</h3>
                                <p className={secondaryTextClass}>{p.s2_1Text}</p>
                                <ul className={`list-disc list-inside ${secondaryTextClass} mt-2 space-y-1`}>
                                    {p.s2_1Items.map((item, i) => <li key={i}><strong>{item.bold}</strong> {item.text}</li>)}
                                </ul>
                            </div>
                            <div>
                                <h3 className={`text-xl font-semibold ${textClass} mb-2`}>{p.s2_2Title}</h3>
                                <p className={secondaryTextClass}>{p.s2_2Text}</p>
                                <ul className={`list-disc list-inside ${secondaryTextClass} mt-2 space-y-1`}>
                                    {p.s2_2Items.map((item, i) => <li key={i}><strong>{item.bold}</strong> {item.text}</li>)}
                                </ul>
                            </div>
                            <div>
                                <h3 className={`text-xl font-semibold ${textClass} mb-2`}>{p.s2_3Title}</h3>
                                <p className={secondaryTextClass}>{p.s2_3Text}</p>
                                <ul className={`list-disc list-inside ${secondaryTextClass} mt-2 space-y-1`}>
                                    {p.s2_3Items.map((item, i) => <li key={i}><strong>{item.bold}</strong> {item.text}</li>)}
                                </ul>
                            </div>
                            <div>
                                <h3 className={`text-xl font-semibold ${textClass} mb-2`}>{p.s2_4Title}</h3>
                                <p className={secondaryTextClass}>{p.s2_4Text}</p>
                                <ul className={`list-disc list-inside ${secondaryTextClass} mt-2 space-y-1`}>
                                    {p.s2_4Items.map((item, i) => <li key={i}><strong>{item.bold}</strong> {item.text}</li>)}
                                </ul>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className={`text-2xl font-bold ${textClass} mb-4`}>{p.s3Title}</h2>
                        <p className={secondaryTextClass}>{p.s3Text}</p>
                        <ul className={`list-disc list-inside ${secondaryTextClass} mt-2 space-y-2`}>
                            {p.s3Items.map((item, i) => <li key={i}><strong>{item.bold}</strong> {item.text}</li>)}
                        </ul>
                        <p className={`${secondaryTextClass} mt-4`}>{p.s3Note}</p>
                    </section>

                    <section>
                        <h2 className={`text-2xl font-bold ${textClass} mb-4`}>{p.s4Title}</h2>
                        <div className="space-y-4">
                            <div>
                                <h3 className={`text-xl font-semibold ${textClass} mb-2`}>{p.s4_1Title}</h3>
                                <p className={secondaryTextClass}>{p.s4_1Text}</p>
                                <ul className={`list-disc list-inside ${secondaryTextClass} mt-2 space-y-1`}>
                                    {p.s4_1Items.map((item, i) => <li key={i}><strong>{item.bold}</strong> {item.text}</li>)}
                                </ul>
                            </div>
                            <div>
                                <h3 className={`text-xl font-semibold ${textClass} mb-2`}>{p.s4_2Title}</h3>
                                <p className={secondaryTextClass}>{p.s4_2Text}</p>
                            </div>
                            <div>
                                <h3 className={`text-xl font-semibold ${textClass} mb-2`}>{p.s4_3Title}</h3>
                                <ul className={`list-disc list-inside ${secondaryTextClass} mt-2 space-y-1`}>
                                    {p.s4_3Items.map((item, i) => <li key={i}>{item}</li>)}
                                </ul>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className={`text-2xl font-bold ${textClass} mb-4`}>{p.s5Title}</h2>
                        <ul className={`list-disc list-inside ${secondaryTextClass} mt-2 space-y-2`}>
                            {p.s5Items.map((item, i) => <li key={i}><strong>{item.bold}</strong> {item.text}</li>)}
                        </ul>
                    </section>

                    <section>
                        <h2 className={`text-2xl font-bold ${textClass} mb-4`}>{p.s6Title}</h2>
                        <p className={secondaryTextClass}>{p.s6Text}</p>
                        <ul className={`list-disc list-inside ${secondaryTextClass} mt-2 space-y-2`}>
                            {p.s6Items.map((item, i) => <li key={i}>{item}</li>)}
                        </ul>
                    </section>

                    <section>
                        <h2 className={`text-2xl font-bold ${textClass} mb-4`}>{p.s7Title}</h2>
                        <p className={secondaryTextClass}>{p.s7Text}</p>
                    </section>

                    <section>
                        <h2 className={`text-2xl font-bold ${textClass} mb-4`}>{p.s8Title}</h2>
                        <p className={secondaryTextClass}>{p.s8Text}</p>
                        <ul className={`list-none ${secondaryTextClass} mt-2 space-y-2`}>
                            <li><strong>E-mail:</strong> <a href="mailto:info@fasheone.com" className="text-cyan-500 hover:underline">info@fasheone.com</a></li>
                            <li><strong>Web:</strong> <a href="https://fasheone.com" className="text-cyan-500 hover:underline">fasheone.com</a></li>
                        </ul>
                    </section>
                </div>
            </div>
        </div>
    );
};
