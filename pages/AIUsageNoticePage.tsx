import React from 'react';
import { useI18n } from '../lib/i18n';

interface AIUsageNoticePageProps {
    onNavigateHome: () => void;
    theme?: 'light' | 'dark';
}

const tr = {
    backHome: '← Ana Sayfaya Dön',
    title: 'Yapay Zeka Kullanım Bildirimi',
    subtitle: 'AI teknolojilerinin kullanımı, sınırlamaları ve sorumluluklarına ilişkin bilgilendirme.',
    s1Title: '1. AI Teknolojisi Hakkında',
    s1Text: 'Fasheone platformu, görsel üretim ve tasarım önerileri için yapay zeka (AI) teknolojilerini kullanmaktadır. Bu teknolojiler, Google Gemini AI modelleri tarafından desteklenmektedir.',
    s1_1Title: '1.1. Kullanılan AI Teknolojileri',
    s1_1Items: [
        { bold: 'Google Gemini Pro:', text: 'Gelişmiş görsel üretim ve analiz' },
        { bold: 'Google Gemini Flash:', text: 'Hızlı görsel işleme ve ön izleme' },
        { bold: 'Imagen API:', text: 'Yüksek kaliteli görsel sentezi' },
    ],
    s1_2Title: '1.2. AI Kullanım Alanları',
    s1_2Items: [
        'Sanal giyinme (Virtual Try-On) deneyimi',
        'Kumaş deseni ve doku üretimi',
        'Ürün fotoğraf iyileştirme',
        'Teknik paket (Tech Pack) oluşturma',
        'Moda tasarım önerileri',
        'Renk paleti ve trend analizi',
    ],
    s2Title: '2. AI Üretimlerinin Niteliği',
    s2_1Title: '2.1. Önemli Uyarılar',
    s2_1Items: [
        'AI tarafından üretilen görseller, gerçek fotoğraflar değildir',
        'Üretilen görseller, gerçek ürünlerden farklılık gösterebilir',
        'Renk, doku ve ölçü gibi detaylar, gerçek ürünlerle tam olarak eşleşmeyebilir',
        'AI modelleri sürekli iyileştirilmekte olup, sonuçlar zaman içinde değişebilir',
    ],
    s2_2Title: '2.2. Doğruluk ve Güvenilirlik',
    s2_2Text: 'AI üretimleri her zaman %100 doğru olmayabilir. Özellikle:',
    s2_2Items: [
        'Karmaşık kumaş desenleri yanlış yorumlanabilir',
        'İnsan vücudu oranları her zaman doğal görünmeyebilir',
        'Renk tonları monitör ve cihaza göre farklılık gösterebilir',
        'Detaylı işlemeler ve aksesuarlar tam olarak temsil edilemeyebilir',
    ],
    s3Title: '3. Fikri Mülkiyet Hakları',
    s3_1Title: '3.1. AI Üretim Hakları',
    s3_1Items: [
        'Platform üzerinde oluşturduğunuz AI görselleri üzerinde ticari kullanım hakkına sahipsiniz',
        'Üretilen görsellerin münhasır telif hakkı iddia edilemez',
        'Benzer prompt\'larla benzer görseller üretilebilir',
        'AI modelleri, önceden eğitilmiş verilere dayandığı için tam özgünlük garanti edilemez',
    ],
    s3_2Title: '3.2. Yüklenen İçeriklerin Hakları',
    s3_2Items: [
        'Yüklediğiniz görsellerin haklarına sahip olduğunuzu taahhüt edersiniz',
        'Başkalarına ait görselleri izinsiz yüklemek yasaktır',
        'Marka logoları ve tescilli tasarımlar konusunda sorumluluk kullanıcıya aittir',
    ],
    s4Title: '4. Veri İşleme ve Gizlilik',
    s4_1Title: '4.1. AI İçin Veri Kullanımı',
    s4_1Items: [
        'Yüklediğiniz görseller, AI işleme için geçici olarak kullanılır',
        'Görseller, AI model eğitimi için kullanılmaz',
        'İşleme tamamlandıktan sonra orijinal görseller güvenli şekilde saklanır',
        'Verileriniz, Google\'ın AI hizmet şartlarına uygun olarak işlenir',
    ],
    s4_2Title: '4.2. Veri Saklama',
    s4_2Items: [
        { bold: 'Üretilen görseller:', text: 'Hesabınız aktif olduğu sürece saklanır' },
        { bold: 'Orijinal yüklemeler:', text: 'İşlem sonrası belirlenen süre boyunca saklanır' },
        { bold: 'AI işlem logları:', text: 'Hata takibi ve iyileştirme amacıyla 90 gün saklanır' },
    ],
    s5Title: '5. Kullanım Sınırlamaları',
    s5_1Title: '5.1. Yasaklanan Kullanımlar',
    s5_1Text: 'Aşağıdaki amaçlarla AI kullanımı kesinlikle yasaktır:',
    s5_1Items: [
        'Aldatıcı veya yanıltıcı içerik oluşturma',
        'Deepfake veya kimlik hırsızlığı amaçlı görsel üretimi',
        'Nefret söylemi, şiddet veya yasa dışı içerik oluşturma',
        'Çocuk istismarı veya uygunsuz içerik üretimi',
        'Başkalarının itibarını zedeleyici içerik oluşturma',
        'Telif hakkı ihlali amacıyla kullanım',
        'Spam veya otomatik içerik oluşturma araçları ile entegrasyon',
    ],
    s5_2Title: '5.2. Kullanım Limitleri',
    s5_2Items: [
        'Kredi sistemiyle sınırlandırılmıştır',
        'Kötüye kullanım tespit edildiğinde hesap askıya alınabilir',
        'Aşırı kullanım durumunda geçici rate limiting uygulanabilir',
    ],
    s6Title: '6. AI Güvenlik Filtreleri',
    s6Text: 'Platformumuzda AI güvenlik filtreleri aktif olarak çalışmaktadır:',
    s6Items: [
        { bold: 'İçerik Filtreleme:', text: 'Uygunsuz içerik üretimi otomatik olarak engellenir' },
        { bold: 'Güvenlik Skorlaması:', text: 'Her üretim, güvenlik açısından otomatik skorlanır' },
        { bold: 'İnsan Denetimi:', text: 'Şüpheli içerikler manuel incelemeye tabi tutulabilir' },
        { bold: 'Raporlama:', text: 'Kullanıcılar uygunsuz içerikleri raporlayabilir' },
    ],
    s7Title: '7. AI Hata ve Sorumluluk',
    s7_1Title: '7.1. Sorumluluk Sınırlaması',
    s7_1Items: [
        'AI üretimlerindeki hatalar için Fasheone sınırlı sorumluluk taşır',
        'AI sonuçlarına dayalı ticari kararlardan kullanıcı sorumludur',
        'Gerçek ürün tasarımından önce AI sonuçlarının doğrulanması önerilir',
    ],
    s7_2Title: '7.2. Hata Bildirimi',
    s7_2Text: 'AI üretimlerinde hata veya uygunsuz içerik tespit ederseniz:',
    s7_2Items: [
        'İçeriği raporla butonunu kullanabilirsiniz',
        'info@fasheone.com adresine bildirimde bulunabilirsiniz',
        'Bildirilen içerikler 24 saat içinde incelenir',
    ],
    s8Title: '8. AI Şeffaflık Taahhüdü',
    s8Text: 'Fasheone olarak AI kullanımında şeffaflık ilkesini benimsiyoruz:',
    s8Items: [
        'AI tarafından üretilen tüm içerikler açıkça işaretlenir',
        'Kullanıcılar, üretim sürecinde hangi AI modellerinin kullanıldığını görebilir',
        'AI modellerindeki güncellemeler ve değişiklikler hakkında bilgilendirme yapılır',
        'Kullanıcı geri bildirimleri, AI kalitesinin iyileştirilmesinde kullanılır',
    ],
    s9Title: '9. Gelecek Güncellemeler',
    s9Text: 'AI teknolojileri hızla gelişmektedir. Platformumuzda kullanılan AI modelleri ve özellikleri zaman içinde güncellenebilir. Önemli değişiklikler hakkında kullanıcılarımızı bilgilendireceğiz.',
    s10Title: '10. İletişim',
    s10Text: 'AI kullanımı hakkında sorularınız için:',
    disclaimer: 'Bu bildirim, yapay zeka teknolojilerinin sorumlu kullanımını desteklemek amacıyla hazırlanmıştır. AI etiği ve düzenlemelerine ilişkin gelişmelere uygun olarak güncellenecektir.',
};

const en = {
    backHome: '← Back to Home',
    title: 'AI Usage Notice',
    subtitle: 'Information about the use of AI technologies, their limitations, and responsibilities.',
    s1Title: '1. About AI Technology',
    s1Text: 'The Fasheone platform uses artificial intelligence (AI) technologies for visual production and design suggestions. These technologies are powered by Google Gemini AI models.',
    s1_1Title: '1.1. AI Technologies Used',
    s1_1Items: [
        { bold: 'Google Gemini Pro:', text: 'Advanced visual production and analysis' },
        { bold: 'Google Gemini Flash:', text: 'Fast visual processing and previewing' },
        { bold: 'Imagen API:', text: 'High-quality visual synthesis' },
    ],
    s1_2Title: '1.2. AI Use Cases',
    s1_2Items: [
        'Virtual Try-On experience',
        'Fabric pattern and texture generation',
        'Product photo enhancement',
        'Tech Pack creation',
        'Fashion design suggestions',
        'Color palette and trend analysis',
    ],
    s2Title: '2. Nature of AI Productions',
    s2_1Title: '2.1. Important Notices',
    s2_1Items: [
        'Visuals produced by AI are not real photographs',
        'Generated visuals may differ from actual products',
        'Details such as color, texture, and dimensions may not exactly match real products',
        'AI models are continuously improved, and results may change over time',
    ],
    s2_2Title: '2.2. Accuracy and Reliability',
    s2_2Text: 'AI productions may not always be 100% accurate. In particular:',
    s2_2Items: [
        'Complex fabric patterns may be misinterpreted',
        'Human body proportions may not always appear natural',
        'Color tones may vary depending on the monitor and device',
        'Detailed embroidery and accessories may not be fully represented',
    ],
    s3Title: '3. Intellectual Property Rights',
    s3_1Title: '3.1. AI Production Rights',
    s3_1Items: [
        'You have commercial usage rights for AI visuals you create on the platform',
        'Exclusive copyright cannot be claimed for generated visuals',
        'Similar visuals can be produced with similar prompts',
        'Full originality cannot be guaranteed as AI models are based on pre-trained data',
    ],
    s3_2Title: '3.2. Rights of Uploaded Content',
    s3_2Items: [
        'You commit that you own the rights to the visuals you upload',
        'Uploading visuals belonging to others without permission is prohibited',
        'Responsibility for brand logos and registered designs lies with the user',
    ],
    s4Title: '4. Data Processing and Privacy',
    s4_1Title: '4.1. Data Usage for AI',
    s4_1Items: [
        'Visuals you upload are temporarily used for AI processing',
        'Your visuals are not used for AI model training',
        'Original visuals are securely stored after processing is completed',
        'Your data is processed in accordance with Google\'s AI service terms',
    ],
    s4_2Title: '4.2. Data Retention',
    s4_2Items: [
        { bold: 'Generated visuals:', text: 'Stored as long as your account is active' },
        { bold: 'Original uploads:', text: 'Stored for the specified period after processing' },
        { bold: 'AI processing logs:', text: 'Stored for 90 days for error tracking and improvement' },
    ],
    s5Title: '5. Usage Restrictions',
    s5_1Title: '5.1. Prohibited Uses',
    s5_1Text: 'AI usage for the following purposes is strictly prohibited:',
    s5_1Items: [
        'Creating deceptive or misleading content',
        'Deepfake or identity theft visual production',
        'Creating hate speech, violence, or illegal content',
        'Child abuse or inappropriate content production',
        'Creating content that damages others\' reputation',
        'Usage for copyright infringement',
        'Integration with spam or automated content creation tools',
    ],
    s5_2Title: '5.2. Usage Limits',
    s5_2Items: [
        'Limited by the credit system',
        'Accounts may be suspended when abuse is detected',
        'Temporary rate limiting may be applied in case of excessive usage',
    ],
    s6Title: '6. AI Security Filters',
    s6Text: 'AI security filters are actively working on our platform:',
    s6Items: [
        { bold: 'Content Filtering:', text: 'Inappropriate content production is automatically blocked' },
        { bold: 'Safety Scoring:', text: 'Each production is automatically scored for safety' },
        { bold: 'Human Review:', text: 'Suspicious content may be subject to manual review' },
        { bold: 'Reporting:', text: 'Users can report inappropriate content' },
    ],
    s7Title: '7. AI Errors and Liability',
    s7_1Title: '7.1. Limitation of Liability',
    s7_1Items: [
        'Fasheone bears limited liability for errors in AI productions',
        'The user is responsible for commercial decisions based on AI results',
        'It is recommended to verify AI results before actual product design',
    ],
    s7_2Title: '7.2. Error Reporting',
    s7_2Text: 'If you detect errors or inappropriate content in AI productions:',
    s7_2Items: [
        'You can use the Report Content button',
        'You can report to info@fasheone.com',
        'Reported content is reviewed within 24 hours',
    ],
    s8Title: '8. AI Transparency Commitment',
    s8Text: 'At Fasheone, we adopt the principle of transparency in AI usage:',
    s8Items: [
        'All content produced by AI is clearly marked',
        'Users can see which AI models are used in the production process',
        'Updates and changes in AI models are communicated',
        'User feedback is used to improve AI quality',
    ],
    s9Title: '9. Future Updates',
    s9Text: 'AI technologies are rapidly evolving. The AI models and features used on our platform may be updated over time. We will inform our users about important changes.',
    s10Title: '10. Contact',
    s10Text: 'For questions about AI usage:',
    disclaimer: 'This notice has been prepared to support the responsible use of artificial intelligence technologies. It will be updated in accordance with developments in AI ethics and regulations.',
};

const translations = { tr, en };

export const AIUsageNoticePage: React.FC<AIUsageNoticePageProps> = ({ onNavigateHome, theme = 'dark' }) => {
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
                        <div className="mt-4 space-y-4">
                            <div>
                                <h3 className={`text-xl font-semibold ${textClass} mb-2`}>{p.s1_1Title}</h3>
                                <ul className={`list-disc list-inside ${secondaryTextClass} space-y-1`}>
                                    {p.s1_1Items.map((item, i) => <li key={i}><strong>{item.bold}</strong> {item.text}</li>)}
                                </ul>
                            </div>
                            <div>
                                <h3 className={`text-xl font-semibold ${textClass} mb-2`}>{p.s1_2Title}</h3>
                                <ul className={`list-disc list-inside ${secondaryTextClass} space-y-1`}>
                                    {p.s1_2Items.map((item, i) => <li key={i}>{item}</li>)}
                                </ul>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className={`text-2xl font-bold ${textClass} mb-4`}>{p.s2Title}</h2>
                        <div className="space-y-4">
                            <div>
                                <h3 className={`text-xl font-semibold ${textClass} mb-2`}>{p.s2_1Title}</h3>
                                <ul className={`list-disc list-inside ${secondaryTextClass} space-y-1`}>
                                    {p.s2_1Items.map((item, i) => <li key={i}>{item}</li>)}
                                </ul>
                            </div>
                            <div>
                                <h3 className={`text-xl font-semibold ${textClass} mb-2`}>{p.s2_2Title}</h3>
                                <p className={secondaryTextClass}>{p.s2_2Text}</p>
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
                                <ul className={`list-disc list-inside ${secondaryTextClass} space-y-1`}>
                                    {p.s3_1Items.map((item, i) => <li key={i}>{item}</li>)}
                                </ul>
                            </div>
                            <div>
                                <h3 className={`text-xl font-semibold ${textClass} mb-2`}>{p.s3_2Title}</h3>
                                <ul className={`list-disc list-inside ${secondaryTextClass} space-y-1`}>
                                    {p.s3_2Items.map((item, i) => <li key={i}>{item}</li>)}
                                </ul>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className={`text-2xl font-bold ${textClass} mb-4`}>{p.s4Title}</h2>
                        <div className="space-y-4">
                            <div>
                                <h3 className={`text-xl font-semibold ${textClass} mb-2`}>{p.s4_1Title}</h3>
                                <ul className={`list-disc list-inside ${secondaryTextClass} space-y-1`}>
                                    {p.s4_1Items.map((item, i) => <li key={i}>{item}</li>)}
                                </ul>
                            </div>
                            <div>
                                <h3 className={`text-xl font-semibold ${textClass} mb-2`}>{p.s4_2Title}</h3>
                                <ul className={`list-disc list-inside ${secondaryTextClass} space-y-1`}>
                                    {p.s4_2Items.map((item, i) => <li key={i}><strong>{item.bold}</strong> {item.text}</li>)}
                                </ul>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className={`text-2xl font-bold ${textClass} mb-4`}>{p.s5Title}</h2>
                        <div className="space-y-4">
                            <div>
                                <h3 className={`text-xl font-semibold ${textClass} mb-2`}>{p.s5_1Title}</h3>
                                <p className={secondaryTextClass}>{p.s5_1Text}</p>
                                <ul className={`list-disc list-inside ${secondaryTextClass} mt-2 space-y-1`}>
                                    {p.s5_1Items.map((item, i) => <li key={i}>{item}</li>)}
                                </ul>
                            </div>
                            <div>
                                <h3 className={`text-xl font-semibold ${textClass} mb-2`}>{p.s5_2Title}</h3>
                                <ul className={`list-disc list-inside ${secondaryTextClass} space-y-1`}>
                                    {p.s5_2Items.map((item, i) => <li key={i}>{item}</li>)}
                                </ul>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className={`text-2xl font-bold ${textClass} mb-4`}>{p.s6Title}</h2>
                        <p className={secondaryTextClass}>{p.s6Text}</p>
                        <ul className={`list-disc list-inside ${secondaryTextClass} mt-2 space-y-2`}>
                            {p.s6Items.map((item, i) => <li key={i}><strong>{item.bold}</strong> {item.text}</li>)}
                        </ul>
                    </section>

                    <section>
                        <h2 className={`text-2xl font-bold ${textClass} mb-4`}>{p.s7Title}</h2>
                        <div className="space-y-4">
                            <div>
                                <h3 className={`text-xl font-semibold ${textClass} mb-2`}>{p.s7_1Title}</h3>
                                <ul className={`list-disc list-inside ${secondaryTextClass} space-y-1`}>
                                    {p.s7_1Items.map((item, i) => <li key={i}>{item}</li>)}
                                </ul>
                            </div>
                            <div>
                                <h3 className={`text-xl font-semibold ${textClass} mb-2`}>{p.s7_2Title}</h3>
                                <p className={secondaryTextClass}>{p.s7_2Text}</p>
                                <ul className={`list-disc list-inside ${secondaryTextClass} mt-2 space-y-1`}>
                                    {p.s7_2Items.map((item, i) => <li key={i}>{item}</li>)}
                                </ul>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className={`text-2xl font-bold ${textClass} mb-4`}>{p.s8Title}</h2>
                        <p className={secondaryTextClass}>{p.s8Text}</p>
                        <ul className={`list-disc list-inside ${secondaryTextClass} mt-2 space-y-2`}>
                            {p.s8Items.map((item, i) => <li key={i}>{item}</li>)}
                        </ul>
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

                    <section className="mt-8 pt-6 border-t border-slate-700">
                        <p className={`${secondaryTextClass} text-sm italic`}>{p.disclaimer}</p>
                    </section>
                </div>
            </div>
        </div>
    );
};
