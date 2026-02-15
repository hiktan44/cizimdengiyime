import React from 'react';
import { useI18n } from '../lib/i18n';

interface PrivacyPolicyPageProps {
    onNavigateHome: () => void;
    theme?: 'light' | 'dark';
}

const tr = {
    backHome: '← Ana Sayfaya Dön',
    title: 'Gizlilik Politikası',
    lastUpdate: 'Son Güncelleme: 31 Ocak 2026',
    s1Title: '1. Veri Sorumlusu',
    s1Text: 'Fasheone olarak, 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") kapsamında veri sorumlusuyuz. Kişisel verileriniz tarafımızca işlenmekte ve korunmaktadır.',
    s2Title: '2. Toplanan Kişisel Veriler',
    s2Text: 'Platformumuzda aşağıdaki kişisel veriler toplanmaktadır:',
    s2Items: [
        { bold: 'Kimlik Bilgileri:', text: 'Ad, soyad, e-posta adresi' },
        { bold: 'İletişim Bilgileri:', text: 'E-posta adresi, telefon numarası (isteğe bağlı)' },
        { bold: 'İşlem Bilgileri:', text: 'Ödeme bilgileri (Stripe üzerinden güvenli şekilde işlenir)' },
        { bold: 'Kullanım Verileri:', text: 'IP adresi, tarayıcı bilgisi, çerez verileri' },
        { bold: 'İçerik Verileri:', text: 'Yüklediğiniz görseller ve oluşturduğunuz AI içerikleri' },
    ],
    s3Title: '3. Verilerin İşlenme Amacı',
    s3Text: 'Kişisel verileriniz aşağıdaki amaçlarla işlenmektedir:',
    s3Items: [
        'Platformumuzun sunduğu AI hizmetlerini sağlamak',
        'Kullanıcı hesabınızı yönetmek ve kimlik doğrulaması yapmak',
        'Ödeme işlemlerini gerçekleştirmek',
        'Müşteri desteği sağlamak',
        'Hizmet kalitesini iyileştirmek ve kullanıcı deneyimini geliştirmek',
        'Yasal yükümlülüklerimizi yerine getirmek',
    ],
    s4Title: '4. Verilerin Paylaşımı',
    s4Text: 'Kişisel verileriniz aşağıdaki taraflarla paylaşılabilir:',
    s4Items: [
        { bold: 'Ödeme Altyapısı:', text: 'Stripe (ödeme işlemleri için)' },
        { bold: 'Cloud Hizmetleri:', text: 'Supabase, Google Cloud (veri depolama için)' },
        { bold: 'AI Servisleri:', text: 'Google AI (görsel ve video işleme için)' },
        { bold: 'Analitik Araçları:', text: 'Google Analytics (kullanım istatistikleri için)' },
    ],
    s4Note: 'Verileriniz, yasal zorunluluklar dışında üçüncü taraflarla paylaşılmaz veya satılmaz.',
    s5Title: '5. Veri Saklama Süresi',
    s5Text: 'Kişisel verileriniz, işlenme amacının gerektirdiği süre boyunca ve yasal saklama yükümlülüklerimiz kapsamında saklanır. Hesabınızı sildiğinizde, verileriniz 30 gün içinde sistemlerimizden kalıcı olarak silinir.',
    s6Title: '6. Veri Güvenliği',
    s6Text: 'Kişisel verilerinizin güvenliğini sağlamak için endüstri standardı güvenlik önlemleri alıyoruz:',
    s6Items: [
        'SSL/TLS şifreleme ile güvenli veri iletimi',
        'Şifrelenmiş veri depolama',
        'Düzenli güvenlik denetimleri',
        'Erişim kontrolü ve yetkilendirme sistemleri',
    ],
    s7Title: '7. Kullanıcı Hakları (KVKK Madde 11)',
    s7Text: 'KVKK kapsamında aşağıdaki haklara sahipsiniz:',
    s7Items: [
        'Kişisel verilerinizin işlenip işlenmediğini öğrenme',
        'İşlenmişse buna ilişkin bilgi talep etme',
        'İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme',
        'Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme',
        'Verilerin eksik veya yanlış işlenmiş olması halinde düzeltilmesini isteme',
        'Verilerin silinmesini veya yok edilmesini isteme',
        'İşlenen verilerin münhasıran otomatik sistemler ile analiz edilmesi nedeniyle aleyhinize bir sonuç doğması halinde itiraz etme',
    ],
    s7Note: 'Bu haklarınızı kullanmak için',
    s7Contact: 'adresinden bizimle iletişime geçebilirsiniz.',
    s8Title: '8. Çerezler (Cookies)',
    s8Text: 'Platformumuz, kullanıcı deneyimini iyileştirmek için çerezler kullanmaktadır. Detaylı bilgi için Çerez Politikamızı inceleyebilirsiniz.',
    s9Title: '9. Değişiklikler',
    s9Text: 'Bu Gizlilik Politikası zaman zaman güncellenebilir. Önemli değişiklikler olduğunda, e-posta yoluyla bilgilendirileceksiniz.',
    s10Title: '10. İletişim',
    s10Text: 'Gizlilik politikamız hakkında sorularınız için:',
};

const en = {
    backHome: '← Back to Home',
    title: 'Privacy Policy',
    lastUpdate: 'Last Updated: January 31, 2026',
    s1Title: '1. Data Controller',
    s1Text: 'As Fasheone, we are the data controller under the Personal Data Protection Law No. 6698 ("KVKK"). Your personal data is processed and protected by us.',
    s2Title: '2. Personal Data Collected',
    s2Text: 'The following personal data is collected on our platform:',
    s2Items: [
        { bold: 'Identity Information:', text: 'Name, surname, email address' },
        { bold: 'Contact Information:', text: 'Email address, phone number (optional)' },
        { bold: 'Transaction Information:', text: 'Payment details (processed securely through Stripe)' },
        { bold: 'Usage Data:', text: 'IP address, browser information, cookie data' },
        { bold: 'Content Data:', text: 'Images you upload and AI content you create' },
    ],
    s3Title: '3. Purpose of Data Processing',
    s3Text: 'Your personal data is processed for the following purposes:',
    s3Items: [
        'To provide AI services offered by our platform',
        'To manage your user account and perform authentication',
        'To process payment transactions',
        'To provide customer support',
        'To improve service quality and enhance user experience',
        'To fulfill our legal obligations',
    ],
    s4Title: '4. Data Sharing',
    s4Text: 'Your personal data may be shared with the following parties:',
    s4Items: [
        { bold: 'Payment Infrastructure:', text: 'Stripe (for payment processing)' },
        { bold: 'Cloud Services:', text: 'Supabase, Google Cloud (for data storage)' },
        { bold: 'AI Services:', text: 'Google AI (for image and video processing)' },
        { bold: 'Analytics Tools:', text: 'Google Analytics (for usage statistics)' },
    ],
    s4Note: 'Your data will not be shared with or sold to third parties except as required by law.',
    s5Title: '5. Data Retention Period',
    s5Text: 'Your personal data is retained for the duration required by the processing purpose and within the scope of our legal retention obligations. When you delete your account, your data will be permanently deleted from our systems within 30 days.',
    s6Title: '6. Data Security',
    s6Text: 'We implement industry-standard security measures to protect your personal data:',
    s6Items: [
        'Secure data transmission with SSL/TLS encryption',
        'Encrypted data storage',
        'Regular security audits',
        'Access control and authorization systems',
    ],
    s7Title: '7. User Rights (KVKK Article 11)',
    s7Text: 'Under KVKK, you have the following rights:',
    s7Items: [
        'To learn whether your personal data is being processed',
        'To request information if it has been processed',
        'To learn the purpose of processing and whether it is used appropriately',
        'To know the third parties to whom data is transferred domestically or abroad',
        'To request correction if data is incomplete or inaccurately processed',
        'To request deletion or destruction of data',
        'To object if the processing of data exclusively through automated systems results in an unfavorable outcome',
    ],
    s7Note: 'To exercise these rights, contact us at',
    s7Contact: '',
    s8Title: '8. Cookies',
    s8Text: 'Our platform uses cookies to improve user experience. Please review our Cookie Policy for detailed information.',
    s9Title: '9. Changes',
    s9Text: 'This Privacy Policy may be updated from time to time. You will be notified via email when significant changes occur.',
    s10Title: '10. Contact',
    s10Text: 'For questions about our privacy policy:',
};

const translations = { tr, en };

export const PrivacyPolicyPage: React.FC<PrivacyPolicyPageProps> = ({ onNavigateHome, theme = 'dark' }) => {
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
                    <button onClick={onNavigateHome} className="text-cyan-500 hover:text-cyan-400 mb-4 flex items-center gap-2">
                        {p.backHome}
                    </button>
                    <h1 className={`text-4xl font-bold ${textClass} mb-4`}>{p.title}</h1>
                    <p className={secondaryTextClass}>{p.lastUpdate}</p>
                </div>

                <div className={`${cardBg} border rounded-2xl p-8 space-y-6`}>
                    <section>
                        <h2 className={`text-2xl font-bold ${textClass} mb-4`}>{p.s1Title}</h2>
                        <p className={secondaryTextClass}>{p.s1Text}</p>
                    </section>

                    <section>
                        <h2 className={`text-2xl font-bold ${textClass} mb-4`}>{p.s2Title}</h2>
                        <p className={secondaryTextClass}>{p.s2Text}</p>
                        <ul className={`list-disc list-inside ${secondaryTextClass} mt-2 space-y-2`}>
                            {p.s2Items.map((item, i) => (
                                <li key={i}><strong>{item.bold}</strong> {item.text}</li>
                            ))}
                        </ul>
                    </section>

                    <section>
                        <h2 className={`text-2xl font-bold ${textClass} mb-4`}>{p.s3Title}</h2>
                        <p className={secondaryTextClass}>{p.s3Text}</p>
                        <ul className={`list-disc list-inside ${secondaryTextClass} mt-2 space-y-2`}>
                            {p.s3Items.map((item, i) => <li key={i}>{item}</li>)}
                        </ul>
                    </section>

                    <section>
                        <h2 className={`text-2xl font-bold ${textClass} mb-4`}>{p.s4Title}</h2>
                        <p className={secondaryTextClass}>{p.s4Text}</p>
                        <ul className={`list-disc list-inside ${secondaryTextClass} mt-2 space-y-2`}>
                            {p.s4Items.map((item, i) => (
                                <li key={i}><strong>{item.bold}</strong> {item.text}</li>
                            ))}
                        </ul>
                        <p className={`${secondaryTextClass} mt-4`}>{p.s4Note}</p>
                    </section>

                    <section>
                        <h2 className={`text-2xl font-bold ${textClass} mb-4`}>{p.s5Title}</h2>
                        <p className={secondaryTextClass}>{p.s5Text}</p>
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
                        <ul className={`list-disc list-inside ${secondaryTextClass} mt-2 space-y-2`}>
                            {p.s7Items.map((item, i) => <li key={i}>{item}</li>)}
                        </ul>
                        <p className={`${secondaryTextClass} mt-4`}>
                            {p.s7Note} <a href="mailto:info@fasheone.com" className="text-cyan-500 hover:underline">info@fasheone.com</a> {p.s7Contact}
                        </p>
                    </section>

                    <section>
                        <h2 className={`text-2xl font-bold ${textClass} mb-4`}>{p.s8Title}</h2>
                        <p className={secondaryTextClass}>{p.s8Text}</p>
                    </section>

                    <section>
                        <h2 className={`text-2xl font-bold ${textClass} mb-4`}>{p.s9Title}</h2>
                        <p className={secondaryTextClass}>{p.s9Text}</p>
                    </section>

                    <section>
                        <h2 className={`text-2xl font-bold ${textClass} mb-4`}>{p.s10Title}</h2>
                        <p className={secondaryTextClass}>{p.s10Text}</p>
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
