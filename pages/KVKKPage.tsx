import React from 'react';
import { useI18n } from '../lib/i18n';

interface KVKKPageProps {
    onNavigateHome: () => void;
    theme?: 'light' | 'dark';
}

const tr = {
    backHome: '← Ana Sayfaya Dön',
    title: 'KVKK Aydınlatma Metni',
    subtitle: '6698 Sayılı Kişisel Verilerin Korunması Kanunu Uyarınca',
    s1Title: '1. Veri Sorumlusu',
    s1Controller: 'Veri Sorumlusu:',
    s1Address: 'Adres:',
    s2Title: '2. Kişisel Verilerin İşlenme Amacı',
    s2Text: 'Kişisel verileriniz aşağıdaki amaçlarla işlenmektedir:',
    s2Items: [
        'Kullanıcı hesabı oluşturma ve yönetme',
        'AI tabanlı görsel üretim hizmetlerinin sunulması',
        'Ödeme işlemlerinin gerçekleştirilmesi',
        'Müşteri destek hizmetlerinin sağlanması',
        'Hizmet kalitesinin iyileştirilmesi ve kullanıcı deneyiminin geliştirilmesi',
        'İstatistiksel analiz ve raporlama',
        'Yasal yükümlülüklerin yerine getirilmesi',
        'Pazarlama ve iletişim faaliyetleri (açık rıza ile)',
    ],
    s3Title: '3. İşlenen Kişisel Veri Kategorileri',
    s3_1Title: '3.1. Kimlik Bilgileri',
    s3_1Text: 'Ad, soyad, kullanıcı adı',
    s3_2Title: '3.2. İletişim Bilgileri',
    s3_2Text: 'E-posta adresi, telefon numarası (isteğe bağlı)',
    s3_3Title: '3.3. Müşteri İşlem Bilgileri',
    s3_3Text: 'Kredi satın alma işlemleri, kullanım geçmişi, oluşturulan içerikler',
    s3_4Title: '3.4. İşlem Güvenliği Bilgileri',
    s3_4Text: 'IP adresi, tarayıcı bilgisi, cihaz bilgisi, çerez verileri',
    s3_5Title: '3.5. Finansal Bilgiler',
    s3_5Text: 'Ödeme bilgileri (Stripe üzerinden güvenli şekilde işlenir, sistemimizde saklanmaz)',
    s3_6Title: '3.6. Görsel ve İçerik Verileri',
    s3_6Text: 'Yüklediğiniz görseller, AI ile oluşturduğunuz içerikler',
    s4Title: '4. Kişisel Verilerin Toplanma Yöntemi',
    s4Text: 'Kişisel verileriniz aşağıdaki yöntemlerle toplanmaktadır:',
    s4Items: [
        'Web sitesi üzerinden kayıt formları',
        'Google OAuth ile giriş',
        'Platform kullanımı sırasında otomatik toplanan veriler (çerezler, log kayıtları)',
        'Müşteri destek kanalları (e-posta, WhatsApp)',
        'Ödeme işlemleri sırasında',
    ],
    s5Title: '5. Kişisel Verilerin İşlenme Hukuki Sebepleri',
    s5Text: 'Kişisel verileriniz KVKK\'nın 5. ve 6. maddelerinde belirtilen aşağıdaki hukuki sebeplere dayanarak işlenmektedir:',
    s5Items: [
        { bold: 'Sözleşmenin kurulması veya ifası:', text: 'Hizmet sözleşmesinin yerine getirilmesi' },
        { bold: 'Hukuki yükümlülük:', text: 'Yasal düzenlemelerin gerektirdiği saklama ve raporlama yükümlülükleri' },
        { bold: 'Meşru menfaat:', text: 'Hizmet kalitesinin iyileştirilmesi, güvenlik önlemleri' },
        { bold: 'Açık rıza:', text: 'Pazarlama iletişimi, çerez kullanımı' },
    ],
    s6Title: '6. Kişisel Verilerin Aktarılması',
    s6Text: 'Kişisel verileriniz aşağıdaki alıcı gruplarına aktarılabilir:',
    s6_1Title: '6.1. Yurt İçi Aktarımlar',
    s6_1Items: [
        'Yasal yükümlülükler kapsamında kamu kurum ve kuruluşları',
        'Hukuki süreçler için yetkili merciler',
    ],
    s6_2Title: '6.2. Yurt Dışı Aktarımlar',
    s6_2Items: [
        { bold: 'Stripe (ABD):', text: 'Ödeme işlemleri - GDPR uyumlu' },
        { bold: 'Google Cloud (ABD/Avrupa):', text: 'AI servisleri ve veri depolama - GDPR uyumlu' },
        { bold: 'Supabase (ABD):', text: 'Veritabanı hizmetleri - GDPR uyumlu' },
    ],
    s6_2Note: 'Yurt dışına veri aktarımları, KVKK\'nın 9. maddesi ve ilgili mevzuat kapsamında, yeterli koruma sağlayan veya uygun güvenceler bulunan ülkelere yapılmaktadır.',
    s7Title: '7. Kişisel Veri Sahibinin Hakları (KVKK Madde 11)',
    s7Text: 'KVKK\'nın 11. maddesi uyarınca, veri sahibi olarak aşağıdaki haklara sahipsiniz:',
    s7Items: [
        'Kişisel verilerinizin işlenip işlenmediğini öğrenme',
        'Kişisel verileriniz işlenmişse buna ilişkin bilgi talep etme',
        'Kişisel verilerinizin işlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme',
        'Yurt içinde veya yurt dışında kişisel verilerinizin aktarıldığı üçüncü kişileri bilme',
        'Kişisel verilerinizin eksik veya yanlış işlenmiş olması hâlinde bunların düzeltilmesini isteme',
        'KVKK\'nın 7. maddesinde öngörülen şartlar çerçevesinde kişisel verilerinizin silinmesini veya yok edilmesini isteme',
        'Düzeltme, silme ve yok edilme işlemlerinin, kişisel verilerin aktarıldığı üçüncü kişilere bildirilmesini isteme',
        'İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme',
        'Kişisel verilerinizin kanuna aykırı olarak işlenmesi sebebiyle zarara uğramanız hâlinde zararın giderilmesini talep etme',
    ],
    s8Title: '8. Haklarınızı Kullanma Yöntemi',
    s8Text: 'Yukarıda belirtilen haklarınızı kullanmak için aşağıdaki yöntemlerle başvurabilirsiniz:',
    s8Items: [
        { bold: 'E-posta:', text: 'info@fasheone.com adresine yazılı başvuru' },
        { bold: 'Başvuru Formu:', text: 'Web sitemizde yer alan KVKK başvuru formunu doldurarak' },
    ],
    s8Note: 'Başvurularınız, talebin niteliğine göre en geç 30 gün içinde ücretsiz olarak sonuçlandırılacaktır. İşlemin ayrıca bir maliyeti gerektirmesi hâlinde, Kişisel Verileri Koruma Kurulu tarafından belirlenen tarifedeki ücret alınabilir.',
    s9Title: '9. Veri Saklama Süreleri',
    s9Text: 'Kişisel verileriniz, işlenme amacının gerektirdiği süre boyunca ve ilgili mevzuatta öngörülen saklama süreleri dikkate alınarak saklanmaktadır:',
    s9Items: [
        { bold: 'Hesap Bilgileri:', text: 'Hesap aktif olduğu sürece + 1 yıl' },
        { bold: 'İşlem Kayıtları:', text: 'Vergi mevzuatı gereği 10 yıl' },
        { bold: 'Oluşturulan İçerikler:', text: 'Hesap aktif olduğu sürece (kullanıcı tarafından silinebilir)' },
        { bold: 'Log Kayıtları:', text: '2 yıl' },
    ],
    s10Title: '10. Veri Güvenliği',
    s10Text: 'Kişisel verilerinizin güvenliğini sağlamak için KVKK\'nın 12. maddesi uyarınca gerekli teknik ve idari tedbirler alınmıştır:',
    s10Items: [
        'SSL/TLS şifreleme ile güvenli veri iletimi',
        'Veritabanı şifreleme',
        'Erişim kontrolü ve yetkilendirme sistemleri',
        'Düzenli güvenlik denetimleri ve güncellemeleri',
        'Personel eğitimleri ve gizlilik taahhütleri',
    ],
    s11Title: '11. İletişim',
    s11Text: 'KVKK kapsamındaki haklarınız ve bu aydınlatma metni hakkında sorularınız için:',
    disclaimer: 'Bu aydınlatma metni, 6698 sayılı Kişisel Verilerin Korunması Kanunu\'nun 10. maddesi ve Aydınlatma Yükümlülüğünün Yerine Getirilmesinde Uyulacak Usul ve Esaslar Hakkında Tebliğ kapsamında hazırlanmıştır.',
};

const en = {
    backHome: '← Back to Home',
    title: 'KVKK Disclosure Notice',
    subtitle: 'Under Personal Data Protection Law No. 6698',
    s1Title: '1. Data Controller',
    s1Controller: 'Data Controller:',
    s1Address: 'Address:',
    s2Title: '2. Purpose of Personal Data Processing',
    s2Text: 'Your personal data is processed for the following purposes:',
    s2Items: [
        'Creating and managing user accounts',
        'Providing AI-based visual production services',
        'Processing payment transactions',
        'Providing customer support services',
        'Improving service quality and enhancing user experience',
        'Statistical analysis and reporting',
        'Fulfilling legal obligations',
        'Marketing and communication activities (with explicit consent)',
    ],
    s3Title: '3. Categories of Personal Data Processed',
    s3_1Title: '3.1. Identity Information',
    s3_1Text: 'Name, surname, username',
    s3_2Title: '3.2. Contact Information',
    s3_2Text: 'Email address, phone number (optional)',
    s3_3Title: '3.3. Customer Transaction Information',
    s3_3Text: 'Credit purchase transactions, usage history, created content',
    s3_4Title: '3.4. Transaction Security Information',
    s3_4Text: 'IP address, browser information, device information, cookie data',
    s3_5Title: '3.5. Financial Information',
    s3_5Text: 'Payment information (processed securely through Stripe, not stored in our system)',
    s3_6Title: '3.6. Visual and Content Data',
    s3_6Text: 'Images you upload, content you create with AI',
    s4Title: '4. Method of Collecting Personal Data',
    s4Text: 'Your personal data is collected through the following methods:',
    s4Items: [
        'Registration forms on the website',
        'Google OAuth login',
        'Automatically collected data during platform use (cookies, log records)',
        'Customer support channels (email, WhatsApp)',
        'During payment transactions',
    ],
    s5Title: '5. Legal Basis for Processing Personal Data',
    s5Text: 'Your personal data is processed based on the following legal grounds specified in Articles 5 and 6 of the KVKK:',
    s5Items: [
        { bold: 'Performance of a contract:', text: 'Fulfillment of the service agreement' },
        { bold: 'Legal obligation:', text: 'Storage and reporting obligations required by legal regulations' },
        { bold: 'Legitimate interest:', text: 'Improving service quality, security measures' },
        { bold: 'Explicit consent:', text: 'Marketing communications, cookie usage' },
    ],
    s6Title: '6. Transfer of Personal Data',
    s6Text: 'Your personal data may be transferred to the following recipient groups:',
    s6_1Title: '6.1. Domestic Transfers',
    s6_1Items: [
        'Public institutions and organizations within the scope of legal obligations',
        'Authorized authorities for legal proceedings',
    ],
    s6_2Title: '6.2. International Transfers',
    s6_2Items: [
        { bold: 'Stripe (US):', text: 'Payment processing - GDPR compliant' },
        { bold: 'Google Cloud (US/Europe):', text: 'AI services and data storage - GDPR compliant' },
        { bold: 'Supabase (US):', text: 'Database services - GDPR compliant' },
    ],
    s6_2Note: 'International data transfers are made to countries that provide adequate protection or have appropriate safeguards, in accordance with Article 9 of the KVKK and relevant legislation.',
    s7Title: '7. Rights of Data Subjects (KVKK Article 11)',
    s7Text: 'Pursuant to Article 11 of the KVKK, you have the following rights as a data subject:',
    s7Items: [
        'To learn whether your personal data is being processed',
        'To request information if your personal data has been processed',
        'To learn the purpose of processing and whether it is used appropriately',
        'To know third parties to whom your personal data is transferred domestically or internationally',
        'To request correction if personal data is incomplete or inaccurately processed',
        'To request deletion or destruction of personal data under the conditions stipulated in Article 7 of the KVKK',
        'To request notification of correction, deletion, and destruction to third parties to whom personal data has been transferred',
        'To object if analysis of processed data exclusively through automated systems produces an unfavorable result',
        'To claim compensation for damages arising from unlawful processing of personal data',
    ],
    s8Title: '8. How to Exercise Your Rights',
    s8Text: 'To exercise the rights mentioned above, you may apply through the following methods:',
    s8Items: [
        { bold: 'Email:', text: 'Written application to info@fasheone.com' },
        { bold: 'Application Form:', text: 'By filling out the KVKK application form on our website' },
    ],
    s8Note: 'Your applications will be concluded free of charge within 30 days at the latest, depending on the nature of the request. If the process requires an additional cost, a fee may be charged according to the tariff determined by the Personal Data Protection Board.',
    s9Title: '9. Data Retention Periods',
    s9Text: 'Your personal data is retained for the duration required by the processing purpose and taking into account the retention periods prescribed by relevant legislation:',
    s9Items: [
        { bold: 'Account Information:', text: 'As long as the account is active + 1 year' },
        { bold: 'Transaction Records:', text: '10 years as required by tax legislation' },
        { bold: 'Created Content:', text: 'As long as the account is active (can be deleted by user)' },
        { bold: 'Log Records:', text: '2 years' },
    ],
    s10Title: '10. Data Security',
    s10Text: 'Necessary technical and administrative measures have been taken in accordance with Article 12 of the KVKK to ensure the security of your personal data:',
    s10Items: [
        'Secure data transmission with SSL/TLS encryption',
        'Database encryption',
        'Access control and authorization systems',
        'Regular security audits and updates',
        'Staff training and confidentiality commitments',
    ],
    s11Title: '11. Contact',
    s11Text: 'For questions about your rights under KVKK and this disclosure notice:',
    disclaimer: 'This disclosure notice has been prepared in accordance with Article 10 of the Personal Data Protection Law No. 6698 and the Communiqué on Procedures and Principles to be Followed in Fulfilling the Disclosure Obligation.',
};

const translations = { tr, en };

export const KVKKPage: React.FC<KVKKPageProps> = ({ onNavigateHome, theme = 'dark' }) => {
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
                        <p className={secondaryTextClass}>
                            <strong>{p.s1Controller}</strong> Fasheone<br />
                            <strong>{p.s1Address}</strong> Türkiye<br />
                            <strong>E-mail:</strong> <a href="mailto:info@fasheone.com" className="text-cyan-500 hover:underline">info@fasheone.com</a><br />
                            <strong>Web:</strong> <a href="https://fasheone.com" className="text-cyan-500 hover:underline">fasheone.com</a>
                        </p>
                    </section>

                    <section>
                        <h2 className={`text-2xl font-bold ${textClass} mb-4`}>{p.s2Title}</h2>
                        <p className={secondaryTextClass}>{p.s2Text}</p>
                        <ul className={`list-disc list-inside ${secondaryTextClass} mt-2 space-y-2`}>
                            {p.s2Items.map((item, i) => <li key={i}>{item}</li>)}
                        </ul>
                    </section>

                    <section>
                        <h2 className={`text-2xl font-bold ${textClass} mb-4`}>{p.s3Title}</h2>
                        <div className={`${secondaryTextClass} space-y-4`}>
                            <div><h3 className="font-semibold text-lg mb-2">{p.s3_1Title}</h3><p>{p.s3_1Text}</p></div>
                            <div><h3 className="font-semibold text-lg mb-2">{p.s3_2Title}</h3><p>{p.s3_2Text}</p></div>
                            <div><h3 className="font-semibold text-lg mb-2">{p.s3_3Title}</h3><p>{p.s3_3Text}</p></div>
                            <div><h3 className="font-semibold text-lg mb-2">{p.s3_4Title}</h3><p>{p.s3_4Text}</p></div>
                            <div><h3 className="font-semibold text-lg mb-2">{p.s3_5Title}</h3><p>{p.s3_5Text}</p></div>
                            <div><h3 className="font-semibold text-lg mb-2">{p.s3_6Title}</h3><p>{p.s3_6Text}</p></div>
                        </div>
                    </section>

                    <section>
                        <h2 className={`text-2xl font-bold ${textClass} mb-4`}>{p.s4Title}</h2>
                        <p className={secondaryTextClass}>{p.s4Text}</p>
                        <ul className={`list-disc list-inside ${secondaryTextClass} mt-2 space-y-2`}>
                            {p.s4Items.map((item, i) => <li key={i}>{item}</li>)}
                        </ul>
                    </section>

                    <section>
                        <h2 className={`text-2xl font-bold ${textClass} mb-4`}>{p.s5Title}</h2>
                        <p className={secondaryTextClass}>{p.s5Text}</p>
                        <ul className={`list-disc list-inside ${secondaryTextClass} mt-2 space-y-2`}>
                            {p.s5Items.map((item, i) => <li key={i}><strong>{item.bold}</strong> {item.text}</li>)}
                        </ul>
                    </section>

                    <section>
                        <h2 className={`text-2xl font-bold ${textClass} mb-4`}>{p.s6Title}</h2>
                        <p className={secondaryTextClass}>{p.s6Text}</p>
                        <div className={`${secondaryTextClass} mt-4 space-y-4`}>
                            <div>
                                <h3 className="font-semibold text-lg mb-2">{p.s6_1Title}</h3>
                                <ul className="list-disc list-inside space-y-1">
                                    {p.s6_1Items.map((item, i) => <li key={i}>{item}</li>)}
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-2">{p.s6_2Title}</h3>
                                <ul className="list-disc list-inside space-y-1">
                                    {p.s6_2Items.map((item, i) => <li key={i}><strong>{item.bold}</strong> {item.text}</li>)}
                                </ul>
                                <p className="mt-2">{p.s6_2Note}</p>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className={`text-2xl font-bold ${textClass} mb-4`}>{p.s7Title}</h2>
                        <p className={secondaryTextClass}>{p.s7Text}</p>
                        <ul className={`list-disc list-inside ${secondaryTextClass} mt-2 space-y-2`}>
                            {p.s7Items.map((item, i) => <li key={i}>{item}</li>)}
                        </ul>
                    </section>

                    <section>
                        <h2 className={`text-2xl font-bold ${textClass} mb-4`}>{p.s8Title}</h2>
                        <p className={secondaryTextClass}>{p.s8Text}</p>
                        <ul className={`list-disc list-inside ${secondaryTextClass} mt-2 space-y-2`}>
                            {p.s8Items.map((item, i) => <li key={i}><strong>{item.bold}</strong> {item.text}</li>)}
                        </ul>
                        <p className={`${secondaryTextClass} mt-4`}>{p.s8Note}</p>
                    </section>

                    <section>
                        <h2 className={`text-2xl font-bold ${textClass} mb-4`}>{p.s9Title}</h2>
                        <p className={secondaryTextClass}>{p.s9Text}</p>
                        <ul className={`list-disc list-inside ${secondaryTextClass} mt-2 space-y-2`}>
                            {p.s9Items.map((item, i) => <li key={i}><strong>{item.bold}</strong> {item.text}</li>)}
                        </ul>
                    </section>

                    <section>
                        <h2 className={`text-2xl font-bold ${textClass} mb-4`}>{p.s10Title}</h2>
                        <p className={secondaryTextClass}>{p.s10Text}</p>
                        <ul className={`list-disc list-inside ${secondaryTextClass} mt-2 space-y-2`}>
                            {p.s10Items.map((item, i) => <li key={i}>{item}</li>)}
                        </ul>
                    </section>

                    <section>
                        <h2 className={`text-2xl font-bold ${textClass} mb-4`}>{p.s11Title}</h2>
                        <p className={secondaryTextClass}>{p.s11Text}</p>
                        <ul className={`list-none ${secondaryTextClass} mt-2 space-y-2`}>
                            <li><strong>E-mail:</strong> <a href="mailto:info@fasheone.com" className="text-cyan-500 hover:underline">info@fasheone.com</a></li>
                            <li><strong>Web:</strong> <a href="https://fasheone.com" className="text-cyan-500 hover:underline">fasheone.com</a></li>
                        </ul>
                    </section>

                    <section className="mt-8 pt-6 border-t border-slate-700">
                        <p className={`${secondaryTextClass} text-sm italic`}>{p.disclaimer}</p>
                    </section>
                </div>
            </div>
        </div>
    );
};
