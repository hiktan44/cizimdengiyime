import React from 'react';
import { useI18n } from '../lib/i18n';

interface TermsOfServicePageProps {
    onNavigateHome: () => void;
    theme?: 'light' | 'dark';
}

const tr = {
    backHome: '← Ana Sayfaya Dön',
    title: 'FASHEONE HİZMET SÖZLEŞMESİ',
    lastUpdate: 'Son Güncelleme: 31 Ocak 2026',
    scrollUp: 'Yukarı Çık',
    scrollDown: 'Aşağı İn',
    acceptance: 'Bu platformu kullanarak, yukarıdaki kullanım koşullarını okuduğunuzu ve kabul ettiğinizi beyan edersiniz.',
    s1Title: '1. Hizmet Tanımı',
    s1Text: 'Fasheone, yapay zeka destekli görsel üretim ve düzenleme hizmetleri sunan bir SaaS platformudur. Platform aşağıdaki hizmetleri içerir:',
    s1Items: [
        { bold: 'Canlı Model & Video:', text: 'Ürün görsellerinden AI model görselleri ve video oluşturma' },
        { bold: 'Teknik Çizim:', text: 'Ürün görsellerinden teknik çizim üretme' },
        { bold: 'Pixshop:', text: 'AI destekli görsel düzenleme ve iyileştirme' },
        { bold: 'Fotomatik:', text: 'Otomatik görsel analiz ve düzenleme' },
        { bold: 'AdGenius:', text: 'Reklam görseli üretimi' },
        { bold: 'Collage:', text: 'Çoklu görsel kompozisyon oluşturma' },
    ],
    s2Title: '2. Kullanıcı Sorumlulukları',
    s2_1Title: '2.1. Hesap Güvenliği',
    s2_1Items: [
        'Hesap bilgilerinizi güvende tutmakla yükümlüsünüz',
        'Hesabınızda gerçekleşen tüm aktivitelerden siz sorumlusunuz',
        'Şüpheli aktivite durumunda derhal bizimle iletişime geçmelisiniz',
    ],
    s2_2Title: '2.2. İçerik Yükleme',
    s2_2Items: [
        'Yüklediğiniz görseller için gerekli telif haklarına sahip olmalısınız',
        'Yasa dışı, zararlı, tehdit edici, taciz edici içerik yükleyemezsiniz',
        'Başkalarının fikri mülkiyet haklarını ihlal eden içerik yükleyemezsiniz',
    ],
    s2_3Title: '2.3. Kullanım Sınırları',
    s2_3Items: [
        'Platformu yalnızca yasal amaçlarla kullanabilirsiniz',
        'Sistemleri manipüle etmeye veya kötüye kullanmaya çalışamazsınız',
        'Otomatik botlar veya scraper kullanımı yasaktır',
    ],
    s3Title: '3. Yasaklı Kullanımlar',
    s3Text: 'Aşağıdaki kullanımlar kesinlikle yasaktır:',
    s3Items: [
        'Pornografik, müstehcen veya yetişkin içerik üretimi',
        'Şiddet, nefret söylemi veya ayrımcılık içeren içerik',
        'Sahte kimlik, deepfake veya yanıltıcı içerik üretimi',
        'Telif hakkı ihlali veya fikri mülkiyet hırsızlığı',
        'Spam, phishing veya dolandırıcılık amaçlı kullanım',
        'Platformun güvenliğini tehdit edecek aktiviteler',
    ],
    s4Title: '4. Kredi Sistemi',
    s4_1Title: '4.1. Kredi Kullanımı',
    s4_1Items: [
        'Her işlem için belirli miktarda kredi harcanır',
        'Kredi maliyetleri platform üzerinde açıkça belirtilmiştir',
        'Başarısız işlemler için kredi iadesi yapılır',
    ],
    s4_2Title: '4.2. Kredi Satın Alma',
    s4_2Items: [
        'Krediler paket halinde satın alınabilir',
        'Satın alınan kredilerin son kullanma tarihi yoktur',
        'Krediler hesaplar arası transfer edilemez',
    ],
    s5Title: '5. Fikri Mülkiyet Hakları',
    s5_1Title: '5.1. Platform Hakları',
    s5_1Text: 'Fasheone platformu, logosu, tasarımı ve tüm içeriği Fasheone\'nin fikri mülkiyetidir. İzinsiz kullanım, kopyalama veya dağıtım yasaktır.',
    s5_2Title: '5.2. Kullanıcı İçeriği',
    s5_2Text: 'Yüklediğiniz görseller üzerindeki haklar size aittir. Ancak, hizmeti sunabilmemiz için bu içerikleri işleme, depolama ve AI modelleriyle kullanma hakkını bize vermiş olursunuz.',
    s5_3Title: '5.3. Üretilen İçerik',
    s5_3Text: 'AI ile ürettiğiniz görseller üzerindeki ticari kullanım hakları size aittir. Ancak, bu içeriklerin AI tarafından üretildiğini belirtmeniz önerilir.',
    s6Title: '6. Hesap İptali ve Askıya Alma',
    s6Text: 'Aşağıdaki durumlarda hesabınız askıya alınabilir veya iptal edilebilir:',
    s6Items: [
        'Kullanım koşullarının ihlali',
        'Yasaklı içerik üretimi',
        'Ödeme sorunları',
        'Kötüye kullanım veya dolandırıcılık girişimi',
        'Diğer kullanıcılara zarar verici davranışlar',
    ],
    s6Note: 'Hesap iptali durumunda, kalan kredileriniz için iade yapılmaz.',
    s7Title: '7. Sorumluluk Sınırlamaları',
    s7_1Title: '7.1. Hizmet Garantisi',
    s7_1Text: 'Hizmetlerimiz "olduğu gibi" sunulmaktadır. AI teknolojisinin doğası gereği, üretilen içeriklerin kalitesi ve doğruluğu garanti edilemez.',
    s7_2Title: '7.2. Kesinti ve Bakım',
    s7_2Text: 'Platform bakım, güncelleme veya teknik sorunlar nedeniyle geçici olarak kullanılamayabilir. Bu durumlardan dolayı sorumluluk kabul etmiyoruz.',
    s7_3Title: '7.3. Üçüncü Taraf Hizmetleri',
    s7_3Text: 'Platformumuz Google AI, Stripe gibi üçüncü taraf hizmetleri kullanır. Bu hizmetlerin kesintilerinden sorumlu değiliz.',
    s7_4Title: '7.4. İçerik Sorumluluğu',
    s7_4Text: 'Kullanıcılar tarafından üretilen içeriklerden Fasheone sorumlu değildir. Tüm içerik sorumluluğu kullanıcıya aittir.',
    s8Title: '8. Gizlilik ve Veri Koruma',
    s8Text: 'Kişisel verilerinizin işlenmesi hakkında detaylı bilgi için Gizlilik Politikamızı ve KVKK Aydınlatma Metnimizi inceleyiniz.',
    s9Title: '9. Değişiklikler',
    s9Text: 'Bu kullanım koşullarını zaman zaman güncelleme hakkımız saklıdır. Önemli değişiklikler olduğunda, e-posta yoluyla bilgilendirileceksiniz. Değişikliklerden sonra platformu kullanmaya devam etmeniz, yeni koşulları kabul ettiğiniz anlamına gelir.',
    s10Title: '10. Uygulanacak Hukuk ve Uyuşmazlık Çözümü',
    s10Text: 'Bu sözleşme Türkiye Cumhuriyeti kanunlarına tabidir. Sözleşmeden doğacak uyuşmazlıklarda Türkiye mahkemeleri ve icra daireleri yetkilidir.',
    s11Title: '11. İletişim',
    s11Text: 'Kullanım koşulları hakkında sorularınız için:',
};

const en = {
    backHome: '← Back to Home',
    title: 'FASHEONE TERMS OF SERVICE',
    lastUpdate: 'Last Updated: January 31, 2026',
    scrollUp: 'Scroll Up',
    scrollDown: 'Scroll Down',
    acceptance: 'By using this platform, you acknowledge that you have read and accepted the above terms of use.',
    s1Title: '1. Service Description',
    s1Text: 'Fasheone is a SaaS platform offering AI-powered visual production and editing services. The platform includes the following services:',
    s1Items: [
        { bold: 'Live Model & Video:', text: 'Creating AI model visuals and videos from product images' },
        { bold: 'Technical Drawing:', text: 'Generating technical drawings from product images' },
        { bold: 'Pixshop:', text: 'AI-powered image editing and enhancement' },
        { bold: 'Fotomatik:', text: 'Automated image analysis and editing' },
        { bold: 'AdGenius:', text: 'Advertising visual production' },
        { bold: 'Collage:', text: 'Multi-image composition creation' },
    ],
    s2Title: '2. User Responsibilities',
    s2_1Title: '2.1. Account Security',
    s2_1Items: [
        'You are responsible for keeping your account information secure',
        'You are responsible for all activities that occur under your account',
        'You must contact us immediately in case of suspicious activity',
    ],
    s2_2Title: '2.2. Content Upload',
    s2_2Items: [
        'You must have the necessary copyrights for images you upload',
        'You may not upload illegal, harmful, threatening, or harassing content',
        'You may not upload content that infringes on others\' intellectual property rights',
    ],
    s2_3Title: '2.3. Usage Limits',
    s2_3Items: [
        'You may only use the platform for legal purposes',
        'You may not attempt to manipulate or abuse the systems',
        'Use of automated bots or scrapers is prohibited',
    ],
    s3Title: '3. Prohibited Uses',
    s3Text: 'The following uses are strictly prohibited:',
    s3Items: [
        'Pornographic, obscene, or adult content production',
        'Content containing violence, hate speech, or discrimination',
        'Fake identity, deepfake, or misleading content creation',
        'Copyright infringement or intellectual property theft',
        'Spam, phishing, or fraudulent use',
        'Activities that threaten platform security',
    ],
    s4Title: '4. Credit System',
    s4_1Title: '4.1. Credit Usage',
    s4_1Items: [
        'A specific amount of credits is consumed for each operation',
        'Credit costs are clearly stated on the platform',
        'Credit refunds are provided for failed operations',
    ],
    s4_2Title: '4.2. Credit Purchase',
    s4_2Items: [
        'Credits can be purchased in packages',
        'Purchased credits have no expiration date',
        'Credits cannot be transferred between accounts',
    ],
    s5Title: '5. Intellectual Property Rights',
    s5_1Title: '5.1. Platform Rights',
    s5_1Text: 'The Fasheone platform, its logo, design, and all content are the intellectual property of Fasheone. Unauthorized use, copying, or distribution is prohibited.',
    s5_2Title: '5.2. User Content',
    s5_2Text: 'You retain rights to the images you upload. However, you grant us the right to process, store, and use this content with AI models in order to provide our services.',
    s5_3Title: '5.3. Generated Content',
    s5_3Text: 'You own the commercial usage rights to visuals generated with AI. However, it is recommended that you indicate the content was AI-generated.',
    s6Title: '6. Account Cancellation and Suspension',
    s6Text: 'Your account may be suspended or cancelled in the following cases:',
    s6Items: [
        'Violation of terms of use',
        'Prohibited content creation',
        'Payment issues',
        'Abuse or fraud attempts',
        'Behavior harmful to other users',
    ],
    s6Note: 'In case of account cancellation, remaining credits will not be refunded.',
    s7Title: '7. Limitation of Liability',
    s7_1Title: '7.1. Service Warranty',
    s7_1Text: 'Our services are provided "as is". Due to the nature of AI technology, the quality and accuracy of generated content cannot be guaranteed.',
    s7_2Title: '7.2. Interruptions and Maintenance',
    s7_2Text: 'The platform may be temporarily unavailable due to maintenance, updates, or technical issues. We do not accept liability for such situations.',
    s7_3Title: '7.3. Third-Party Services',
    s7_3Text: 'Our platform uses third-party services such as Google AI and Stripe. We are not responsible for interruptions in these services.',
    s7_4Title: '7.4. Content Liability',
    s7_4Text: 'Fasheone is not liable for content produced by users. All content responsibility belongs to the user.',
    s8Title: '8. Privacy and Data Protection',
    s8Text: 'For detailed information about the processing of your personal data, please review our Privacy Policy and KVKK Disclosure.',
    s9Title: '9. Changes',
    s9Text: 'We reserve the right to update these terms of use from time to time. You will be notified via email when significant changes occur. Continuing to use the platform after changes constitutes acceptance of the new terms.',
    s10Title: '10. Applicable Law and Dispute Resolution',
    s10Text: 'This agreement is subject to the laws of the Republic of Turkey. Turkish courts and enforcement offices are authorized for disputes arising from this agreement.',
    s11Title: '11. Contact',
    s11Text: 'For questions about terms of use:',
};

const translations = { tr, en };

export const TermsOfServicePage: React.FC<TermsOfServicePageProps> = ({ onNavigateHome, theme = 'dark' }) => {
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
                        <ul className={`list-disc list-inside ${secondaryTextClass} mt-2 space-y-2`}>
                            {p.s1Items.map((item, i) => (
                                <li key={i}><strong>{item.bold}</strong> {item.text}</li>
                            ))}
                        </ul>
                    </section>

                    <section>
                        <h2 className={`text-2xl font-bold ${textClass} mb-4`}>{p.s2Title}</h2>
                        <div className={`${secondaryTextClass} space-y-4`}>
                            <div>
                                <h3 className="font-semibold text-lg mb-2">{p.s2_1Title}</h3>
                                <ul className="list-disc list-inside space-y-1">
                                    {p.s2_1Items.map((item, i) => <li key={i}>{item}</li>)}
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-2">{p.s2_2Title}</h3>
                                <ul className="list-disc list-inside space-y-1">
                                    {p.s2_2Items.map((item, i) => <li key={i}>{item}</li>)}
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-2">{p.s2_3Title}</h3>
                                <ul className="list-disc list-inside space-y-1">
                                    {p.s2_3Items.map((item, i) => <li key={i}>{item}</li>)}
                                </ul>
                            </div>
                        </div>
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
                        <div className={`${secondaryTextClass} space-y-4`}>
                            <div>
                                <h3 className="font-semibold text-lg mb-2">{p.s4_1Title}</h3>
                                <ul className="list-disc list-inside space-y-1">
                                    {p.s4_1Items.map((item, i) => <li key={i}>{item}</li>)}
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-2">{p.s4_2Title}</h3>
                                <ul className="list-disc list-inside space-y-1">
                                    {p.s4_2Items.map((item, i) => <li key={i}>{item}</li>)}
                                </ul>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className={`text-2xl font-bold ${textClass} mb-4`}>{p.s5Title}</h2>
                        <div className={`${secondaryTextClass} space-y-4`}>
                            <div>
                                <h3 className="font-semibold text-lg mb-2">{p.s5_1Title}</h3>
                                <p>{p.s5_1Text}</p>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-2">{p.s5_2Title}</h3>
                                <p>{p.s5_2Text}</p>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-2">{p.s5_3Title}</h3>
                                <p>{p.s5_3Text}</p>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className={`text-2xl font-bold ${textClass} mb-4`}>{p.s6Title}</h2>
                        <p className={secondaryTextClass}>{p.s6Text}</p>
                        <ul className={`list-disc list-inside ${secondaryTextClass} mt-2 space-y-2`}>
                            {p.s6Items.map((item, i) => <li key={i}>{item}</li>)}
                        </ul>
                        <p className={`${secondaryTextClass} mt-4`}>{p.s6Note}</p>
                    </section>

                    <section>
                        <h2 className={`text-2xl font-bold ${textClass} mb-4`}>{p.s7Title}</h2>
                        <div className={`${secondaryTextClass} space-y-4`}>
                            <div><h3 className="font-semibold text-lg mb-2">{p.s7_1Title}</h3><p>{p.s7_1Text}</p></div>
                            <div><h3 className="font-semibold text-lg mb-2">{p.s7_2Title}</h3><p>{p.s7_2Text}</p></div>
                            <div><h3 className="font-semibold text-lg mb-2">{p.s7_3Title}</h3><p>{p.s7_3Text}</p></div>
                            <div><h3 className="font-semibold text-lg mb-2">{p.s7_4Title}</h3><p>{p.s7_4Text}</p></div>
                        </div>
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
                        <p className={`${secondaryTextClass} text-sm italic`}>{p.acceptance}</p>
                    </section>
                </div>
            </div>

            <div className="fixed bottom-8 right-8 flex flex-col gap-2 z-50">
                <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="p-3 bg-cyan-500 hover:bg-cyan-400 text-white rounded-full shadow-lg transition-colors" title={p.scrollUp}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                </button>
                <button onClick={() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' })} className="p-3 bg-cyan-500 hover:bg-cyan-400 text-white rounded-full shadow-lg transition-colors" title={p.scrollDown}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
                </button>
            </div>
        </div>
    );
};
