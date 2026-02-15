import React from 'react';
import { useI18n } from '../lib/i18n';

interface RefundPolicyPageProps {
    onNavigateHome: () => void;
    theme?: 'light' | 'dark';
}

const tr = {
    backHome: '← Ana Sayfaya Dön',
    title: 'İade ve İptal Politikası',
    subtitle: 'Kredi satın alma, iade koşulları ve iptal prosedürleri hakkında bilgi.',
    s1Title: '1. Genel Bilgi',
    s1Text: 'Fasheone platformunda satın alınan hizmetler, dijital içerik niteliğinde olup, kredi tabanlı bir sistem üzerinden sunulmaktadır. Bu politika, kredi satın alma işlemlerinin iade ve iptal koşullarını düzenler.',
    s2Title: '2. Kredi Sistemi',
    s2_1Title: '2.1. Kredi Paketleri',
    s2_1Text: 'Platform üzerinde farklı miktarlarda kredi paketleri satın alabilirsiniz. Her AI işlemi belirli miktarda kredi tüketir.',
    s2_2Title: '2.2. Kredi Kullanımı',
    s2_2Items: [
        'Krediler satın alma anında hesabınıza tanımlanır',
        'Her AI görsel üretimi belirli miktarda kredi tüketir',
        'Kullanılan krediler iade edilemez',
        'Kredilerin geçerlilik süresi satın alma tarihinden itibaren 1 yıldır',
    ],
    s3Title: '3. İade Koşulları',
    s3_1Title: '3.1. İade Edilebilir Durumlar',
    s3_1Items: [
        { bold: 'Teknik Arıza:', text: 'Platform kaynaklı teknik sorunlar nedeniyle kredi kaybı yaşandığında' },
        { bold: 'Çift Ödeme:', text: 'Aynı işlem için mükerrer ödeme yapıldığında' },
        { bold: 'Hizmetin Sunulamaması:', text: 'Satın alınan hizmetin platform tarafından sağlanamaması durumunda' },
        { bold: 'Cayma Hakkı:', text: 'Satın alma tarihinden itibaren 14 gün içinde, krediler kullanılmamış ise' },
    ],
    s3_2Title: '3.2. İade Edilemez Durumlar',
    s3_2Items: [
        'Kullanılmış krediler (AI işlemi gerçekleştirilmiş)',
        'Kullanıcı hatası nedeniyle yanlış ürün oluşturulması',
        'Üretilen görsellerden memnun olmama (subjektif nedenler)',
        'Hesap ihlali nedeniyle askıya alınan hesaplardaki krediler',
        'Promosyon veya hediye olarak tanımlanan krediler',
        'İndirimli kampanya ile alınan kredilerin tam fiyat üzerinden iadesi',
    ],
    s4Title: '4. İade Süreci',
    s4Steps: [
        { bold: 'Başvuru:', text: 'info@fasheone.com adresine iade talebi gönderin' },
        { bold: 'Gerekli Bilgiler:', text: 'Hesap e-posta adresi, satın alma tarihi, işlem numarası, iade nedeni' },
        { bold: 'İnceleme:', text: 'Talebiniz 3 iş günü içinde incelenir' },
        { bold: 'Onay/Red:', text: 'Sonuç e-posta ile bildirilir' },
        { bold: 'İade İşlemi:', text: 'Onaylanan iadeler 5-10 iş günü içinde gerçekleştirilir' },
    ],
    s5Title: '5. İade Yöntemleri',
    s5Text: 'İadeler, aşağıdaki yöntemlerden biri ile gerçekleştirilir:',
    s5Items: [
        { bold: 'Orijinal Ödeme Yöntemi:', text: 'Ödemenin yapıldığı kart veya hesaba iade (tercih edilen yöntem)' },
        { bold: 'Platform Kredisi:', text: 'İade tutarının platform kredisi olarak hesaba tanımlanması' },
    ],
    s6Title: '6. Abonelik İptali',
    s6_1Title: '6.1. İptal Koşulları',
    s6_1Items: [
        'Aboneliğinizi istediğiniz zaman iptal edebilirsiniz',
        'İptal işlemi, mevcut fatura döneminin sonunda geçerli olur',
        'İptal sonrası kalan kredileriniz dönem sonuna kadar kullanılabilir',
    ],
    s6_2Title: '6.2. İptal Süreci',
    s6_2Items: [
        'Hesap ayarlarınızdan aboneliğinizi iptal edebilirsiniz',
        'Veya info@fasheone.com adresine iptal talebi gönderebilirsiniz',
        'İptal onayı e-posta ile gönderilecektir',
    ],
    s7Title: '7. Özel Durumlar',
    s7_1Title: '7.1. Platform Kesintileri',
    s7_1Text: 'Planlı bakım dışında yaşanan uzun süreli kesintilerde, etkilenen kullanıcılara kredi iadesi veya ek kredi tanımlaması yapılabilir.',
    s7_2Title: '7.2. Hesap Silme',
    s7_2Items: [
        'Hesabınızı silmeden önce kullanılmamış kredilerinizi tüketmeniz önerilir',
        'Hesap silindikten sonra kalan krediler iade edilemez',
        'Hesap silme talebi 30 gün içinde geri alınabilir',
    ],
    s8Title: '8. Mücbir Sebepler',
    s8Text: 'Doğal afet, savaş, terör, pandemi, devlet müdahalesi veya kontrol dışı diğer durumlar nedeniyle hizmetin sunulamaması halinde, Fasheone makul süre içinde alternatif çözümler sunmaya çalışacaktır.',
    s9Title: '9. Tüketici Hakları',
    s9Text: 'Bu politika, 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve ilgili yönetmelikler çerçevesinde hazırlanmıştır. Tüketici haklarınız saklıdır.',
    s9Items: [
        { bold: 'Tüketici Hakları Derneği:', text: 'www.tuketici.org.tr' },
        { bold: 'Tüketici Şikayet Hattı:', text: '175' },
        { bold: 'e-Devlet Tüketici Şikayeti:', text: 'turkiye.gov.tr' },
    ],
    s10Title: '10. İletişim',
    s10Text: 'İade ve iptal işlemleri hakkında sorularınız için:',
    lastUpdate: 'Son güncelleme: Ocak 2025',
};

const en = {
    backHome: '← Back to Home',
    title: 'Refund and Cancellation Policy',
    subtitle: 'Information about credit purchases, refund conditions, and cancellation procedures.',
    s1Title: '1. General Information',
    s1Text: 'Services purchased on the Fasheone platform are digital content provided through a credit-based system. This policy regulates the refund and cancellation conditions for credit purchase transactions.',
    s2Title: '2. Credit System',
    s2_1Title: '2.1. Credit Packages',
    s2_1Text: 'You can purchase different amounts of credit packages on the platform. Each AI operation consumes a certain amount of credits.',
    s2_2Title: '2.2. Credit Usage',
    s2_2Items: [
        'Credits are assigned to your account at the time of purchase',
        'Each AI image generation consumes a certain amount of credits',
        'Used credits cannot be refunded',
        'Credits are valid for 1 year from the date of purchase',
    ],
    s3Title: '3. Refund Conditions',
    s3_1Title: '3.1. Refundable Cases',
    s3_1Items: [
        { bold: 'Technical Failure:', text: 'When credit loss occurs due to platform-related technical issues' },
        { bold: 'Double Payment:', text: 'When duplicate payment is made for the same transaction' },
        { bold: 'Service Unavailability:', text: 'When the purchased service cannot be provided by the platform' },
        { bold: 'Right of Withdrawal:', text: 'Within 14 days from the date of purchase, if credits have not been used' },
    ],
    s3_2Title: '3.2. Non-Refundable Cases',
    s3_2Items: [
        'Used credits (AI operation has been performed)',
        'Incorrect product creation due to user error',
        'Dissatisfaction with generated visuals (subjective reasons)',
        'Credits in accounts suspended due to account violations',
        'Credits defined as promotional or gifts',
        'Refund of credits purchased at discounted campaign prices at full price',
    ],
    s4Title: '4. Refund Process',
    s4Steps: [
        { bold: 'Application:', text: 'Send a refund request to info@fasheone.com' },
        { bold: 'Required Information:', text: 'Account email address, purchase date, transaction number, reason for refund' },
        { bold: 'Review:', text: 'Your request will be reviewed within 3 business days' },
        { bold: 'Approval/Rejection:', text: 'The result will be communicated via email' },
        { bold: 'Refund Processing:', text: 'Approved refunds will be processed within 5-10 business days' },
    ],
    s5Title: '5. Refund Methods',
    s5Text: 'Refunds are processed through one of the following methods:',
    s5Items: [
        { bold: 'Original Payment Method:', text: 'Refund to the card or account where the payment was made (preferred method)' },
        { bold: 'Platform Credit:', text: 'Defining the refund amount as platform credit to the account' },
    ],
    s6Title: '6. Subscription Cancellation',
    s6_1Title: '6.1. Cancellation Conditions',
    s6_1Items: [
        'You can cancel your subscription at any time',
        'The cancellation takes effect at the end of the current billing period',
        'Your remaining credits can be used until the end of the period after cancellation',
    ],
    s6_2Title: '6.2. Cancellation Process',
    s6_2Items: [
        'You can cancel your subscription from your account settings',
        'Or you can send a cancellation request to info@fasheone.com',
        'Cancellation confirmation will be sent via email',
    ],
    s7Title: '7. Special Cases',
    s7_1Title: '7.1. Platform Outages',
    s7_1Text: 'In case of prolonged outages outside of planned maintenance, affected users may receive credit refunds or additional credit allocations.',
    s7_2Title: '7.2. Account Deletion',
    s7_2Items: [
        'It is recommended to use your unused credits before deleting your account',
        'Remaining credits cannot be refunded after account deletion',
        'Account deletion requests can be reversed within 30 days',
    ],
    s8Title: '8. Force Majeure',
    s8Text: 'In case of inability to provide services due to natural disasters, war, terrorism, pandemic, government intervention, or other circumstances beyond control, Fasheone will endeavor to provide alternative solutions within a reasonable timeframe.',
    s9Title: '9. Consumer Rights',
    s9Text: 'This policy has been prepared in accordance with Consumer Protection Law No. 6502 and related regulations. Your consumer rights are reserved.',
    s9Items: [
        { bold: 'Consumer Rights Association:', text: 'www.tuketici.org.tr' },
        { bold: 'Consumer Complaint Line:', text: '175' },
        { bold: 'e-Government Consumer Complaint:', text: 'turkiye.gov.tr' },
    ],
    s10Title: '10. Contact',
    s10Text: 'For questions about refund and cancellation transactions:',
    lastUpdate: 'Last updated: January 2025',
};

const translations = { tr, en };

export const RefundPolicyPage: React.FC<RefundPolicyPageProps> = ({ onNavigateHome, theme = 'dark' }) => {
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
                        <div className="space-y-4">
                            <div>
                                <h3 className={`text-xl font-semibold ${textClass} mb-2`}>{p.s2_1Title}</h3>
                                <p className={secondaryTextClass}>{p.s2_1Text}</p>
                            </div>
                            <div>
                                <h3 className={`text-xl font-semibold ${textClass} mb-2`}>{p.s2_2Title}</h3>
                                <ul className={`list-disc list-inside ${secondaryTextClass} mt-2 space-y-1`}>
                                    {p.s2_2Items.map((item, i) => <li key={i}>{item}</li>)}
                                </ul>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className={`text-2xl font-bold ${textClass} mb-4`}>{p.s3Title}</h2>
                        <div className="space-y-4">
                            <div>
                                <h3 className={`text-xl font-semibold ${textClass} mb-2`}>{p.s3_1Title}</h3>
                                <ul className={`list-disc list-inside ${secondaryTextClass} mt-2 space-y-2`}>
                                    {p.s3_1Items.map((item, i) => <li key={i}><strong>{item.bold}</strong> {item.text}</li>)}
                                </ul>
                            </div>
                            <div>
                                <h3 className={`text-xl font-semibold ${textClass} mb-2`}>{p.s3_2Title}</h3>
                                <ul className={`list-disc list-inside ${secondaryTextClass} mt-2 space-y-2`}>
                                    {p.s3_2Items.map((item, i) => <li key={i}>{item}</li>)}
                                </ul>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className={`text-2xl font-bold ${textClass} mb-4`}>{p.s4Title}</h2>
                        <ol className={`list-decimal list-inside ${secondaryTextClass} mt-2 space-y-2`}>
                            {p.s4Steps.map((item, i) => <li key={i}><strong>{item.bold}</strong> {item.text}</li>)}
                        </ol>
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
                        <div className="space-y-4">
                            <div>
                                <h3 className={`text-xl font-semibold ${textClass} mb-2`}>{p.s6_1Title}</h3>
                                <ul className={`list-disc list-inside ${secondaryTextClass} mt-2 space-y-1`}>
                                    {p.s6_1Items.map((item, i) => <li key={i}>{item}</li>)}
                                </ul>
                            </div>
                            <div>
                                <h3 className={`text-xl font-semibold ${textClass} mb-2`}>{p.s6_2Title}</h3>
                                <ul className={`list-disc list-inside ${secondaryTextClass} mt-2 space-y-1`}>
                                    {p.s6_2Items.map((item, i) => <li key={i}>{item}</li>)}
                                </ul>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className={`text-2xl font-bold ${textClass} mb-4`}>{p.s7Title}</h2>
                        <div className="space-y-4">
                            <div>
                                <h3 className={`text-xl font-semibold ${textClass} mb-2`}>{p.s7_1Title}</h3>
                                <p className={secondaryTextClass}>{p.s7_1Text}</p>
                            </div>
                            <div>
                                <h3 className={`text-xl font-semibold ${textClass} mb-2`}>{p.s7_2Title}</h3>
                                <ul className={`list-disc list-inside ${secondaryTextClass} mt-2 space-y-1`}>
                                    {p.s7_2Items.map((item, i) => <li key={i}>{item}</li>)}
                                </ul>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className={`text-2xl font-bold ${textClass} mb-4`}>{p.s8Title}</h2>
                        <p className={secondaryTextClass}>{p.s8Text}</p>
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
                        <ul className={`list-none ${secondaryTextClass} mt-2 space-y-2`}>
                            <li><strong>E-mail:</strong> <a href="mailto:info@fasheone.com" className="text-cyan-500 hover:underline">info@fasheone.com</a></li>
                            <li><strong>Web:</strong> <a href="https://fasheone.com" className="text-cyan-500 hover:underline">fasheone.com</a></li>
                        </ul>
                    </section>

                    <section className="mt-8 pt-6 border-t border-slate-700">
                        <p className={`${secondaryTextClass} text-sm italic`}>{p.lastUpdate}</p>
                    </section>
                </div>
            </div>
        </div>
    );
};
