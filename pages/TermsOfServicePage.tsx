import React from 'react';

interface TermsOfServicePageProps {
    onNavigateHome: () => void;
    theme?: 'light' | 'dark';
}

export const TermsOfServicePage: React.FC<TermsOfServicePageProps> = ({ onNavigateHome, theme = 'dark' }) => {
    const bgClass = theme === 'dark' ? 'bg-slate-900' : 'bg-white';
    const textClass = theme === 'dark' ? 'text-white' : 'text-slate-900';
    const secondaryTextClass = theme === 'dark' ? 'text-slate-300' : 'text-slate-600';
    const cardBg = theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200';

    return (
        <div className={`min-h-screen ${bgClass}`}>
            <div className="container mx-auto px-4 py-12 max-w-4xl">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={onNavigateHome}
                        className="text-cyan-500 hover:text-cyan-400 mb-4 flex items-center gap-2"
                    >
                        ← Ana Sayfaya Dön
                    </button>
                    <h1 className={`text-4xl font-bold ${textClass} mb-4`}>FASHEONE HİZMET SÖZLEŞMESİ</h1>
                    <p className={secondaryTextClass}>Son Güncelleme: 31 Ocak 2026</p>
                </div>

                {/* Content */}
                <div className={`${cardBg} border rounded-2xl p-8 space-y-6`}>
                    <section>
                        <h2 className={`text-2xl font-bold ${textClass} mb-4`}>1. Hizmet Tanımı</h2>
                        <p className={secondaryTextClass}>
                            Fasheone, yapay zeka destekli görsel üretim ve düzenleme hizmetleri sunan bir SaaS platformudur.
                            Platform aşağıdaki hizmetleri içerir:
                        </p>
                        <ul className={`list-disc list-inside ${secondaryTextClass} mt-2 space-y-2`}>
                            <li><strong>Canlı Model & Video:</strong> Ürün görsellerinden AI model görselleri ve video oluşturma</li>
                            <li><strong>Teknik Çizim:</strong> Ürün görsellerinden teknik çizim üretme</li>
                            <li><strong>Pixshop:</strong> AI destekli görsel düzenleme ve iyileştirme</li>
                            <li><strong>Fotomatik:</strong> Otomatik görsel analiz ve düzenleme</li>
                            <li><strong>AdGenius:</strong> Reklam görseli üretimi</li>
                            <li><strong>Collage:</strong> Çoklu görsel kompozisyon oluşturma</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className={`text-2xl font-bold ${textClass} mb-4`}>2. Kullanıcı Sorumlulukları</h2>
                        <div className={`${secondaryTextClass} space-y-4`}>
                            <div>
                                <h3 className="font-semibold text-lg mb-2">2.1. Hesap Güvenliği</h3>
                                <ul className="list-disc list-inside space-y-1">
                                    <li>Hesap bilgilerinizi güvende tutmakla yükümlüsünüz</li>
                                    <li>Hesabınızda gerçekleşen tüm aktivitelerden siz sorumlusunuz</li>
                                    <li>Şüpheli aktivite durumunda derhal bizimle iletişime geçmelisiniz</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-2">2.2. İçerik Yükleme</h3>
                                <ul className="list-disc list-inside space-y-1">
                                    <li>Yüklediğiniz görseller için gerekli telif haklarına sahip olmalısınız</li>
                                    <li>Yasa dışı, zararlı, tehdit edici, taciz edici içerik yükleyemezsiniz</li>
                                    <li>Başkalarının fikri mülkiyet haklarını ihlal eden içerik yükleyemezsiniz</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-2">2.3. Kullanım Sınırları</h3>
                                <ul className="list-disc list-inside space-y-1">
                                    <li>Platformu yalnızca yasal amaçlarla kullanabilirsiniz</li>
                                    <li>Sistemleri manipüle etmeye veya kötüye kullanmaya çalışamazsınız</li>
                                    <li>Otomatik botlar veya scraper kullanımı yasaktır</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className={`text-2xl font-bold ${textClass} mb-4`}>3. Yasaklı Kullanımlar</h2>
                        <p className={secondaryTextClass}>Aşağıdaki kullanımlar kesinlikle yasaktır:</p>
                        <ul className={`list-disc list-inside ${secondaryTextClass} mt-2 space-y-2`}>
                            <li>Pornografik, müstehcen veya yetişkin içerik üretimi</li>
                            <li>Şiddet, nefret söylemi veya ayrımcılık içeren içerik</li>
                            <li>Sahte kimlik, deepfake veya yanıltıcı içerik üretimi</li>
                            <li>Telif hakkı ihlali veya fikri mülkiyet hırsızlığı</li>
                            <li>Spam, phishing veya dolandırıcılık amaçlı kullanım</li>
                            <li>Platformun güvenliğini tehdit edecek aktiviteler</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className={`text-2xl font-bold ${textClass} mb-4`}>4. Kredi Sistemi</h2>
                        <div className={`${secondaryTextClass} space-y-4`}>
                            <div>
                                <h3 className="font-semibold text-lg mb-2">4.1. Kredi Kullanımı</h3>
                                <ul className="list-disc list-inside space-y-1">
                                    <li>Her işlem için belirli miktarda kredi harcanır</li>
                                    <li>Kredi maliyetleri platform üzerinde açıkça belirtilmiştir</li>
                                    <li>Başarısız işlemler için kredi iadesi yapılır</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-2">4.2. Kredi Satın Alma</h3>
                                <ul className="list-disc list-inside space-y-1">
                                    <li>Krediler paket halinde satın alınabilir</li>
                                    <li>Satın alınan kredilerin son kullanma tarihi yoktur</li>
                                    <li>Krediler hesaplar arası transfer edilemez</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className={`text-2xl font-bold ${textClass} mb-4`}>5. Fikri Mülkiyet Hakları</h2>
                        <div className={`${secondaryTextClass} space-y-4`}>
                            <div>
                                <h3 className="font-semibold text-lg mb-2">5.1. Platform Hakları</h3>
                                <p>
                                    Fasheone platformu, logosu, tasarımı ve tüm içeriği Fasheone'nin fikri mülkiyetidir.
                                    İzinsiz kullanım, kopyalama veya dağıtım yasaktır.
                                </p>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-2">5.2. Kullanıcı İçeriği</h3>
                                <p>
                                    Yüklediğiniz görseller üzerindeki haklar size aittir. Ancak, hizmeti sunabilmemiz için
                                    bu içerikleri işleme, depolama ve AI modelleriyle kullanma hakkını bize vermiş olursunuz.
                                </p>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-2">5.3. Üretilen İçerik</h3>
                                <p>
                                    AI ile ürettiğiniz görseller üzerindeki ticari kullanım hakları size aittir.
                                    Ancak, bu içeriklerin AI tarafından üretildiğini belirtmeniz önerilir.
                                </p>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className={`text-2xl font-bold ${textClass} mb-4`}>6. Hesap İptali ve Askıya Alma</h2>
                        <p className={secondaryTextClass}>
                            Aşağıdaki durumlarda hesabınız askıya alınabilir veya iptal edilebilir:
                        </p>
                        <ul className={`list-disc list-inside ${secondaryTextClass} mt-2 space-y-2`}>
                            <li>Kullanım koşullarının ihlali</li>
                            <li>Yasaklı içerik üretimi</li>
                            <li>Ödeme sorunları</li>
                            <li>Kötüye kullanım veya dolandırıcılık girişimi</li>
                            <li>Diğer kullanıcılara zarar verici davranışlar</li>
                        </ul>
                        <p className={`${secondaryTextClass} mt-4`}>
                            Hesap iptali durumunda, kalan kredileriniz için iade yapılmaz.
                        </p>
                    </section>

                    <section>
                        <h2 className={`text-2xl font-bold ${textClass} mb-4`}>7. Sorumluluk Sınırlamaları</h2>
                        <div className={`${secondaryTextClass} space-y-4`}>
                            <div>
                                <h3 className="font-semibold text-lg mb-2">7.1. Hizmet Garantisi</h3>
                                <p>
                                    Hizmetlerimiz "olduğu gibi" sunulmaktadır. AI teknolojisinin doğası gereği,
                                    üretilen içeriklerin kalitesi ve doğruluğu garanti edilemez.
                                </p>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-2">7.2. Kesinti ve Bakım</h3>
                                <p>
                                    Platform bakım, güncelleme veya teknik sorunlar nedeniyle geçici olarak
                                    kullanılamayabilir. Bu durumlardan dolayı sorumluluk kabul etmiyoruz.
                                </p>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-2">7.3. Üçüncü Taraf Hizmetleri</h3>
                                <p>
                                    Platformumuz Google AI, Stripe gibi üçüncü taraf hizmetleri kullanır.
                                    Bu hizmetlerin kesintilerinden sorumlu değiliz.
                                </p>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-2">7.4. İçerik Sorumluluğu</h3>
                                <p>
                                    Kullanıcılar tarafından üretilen içeriklerden Fasheone sorumlu değildir.
                                    Tüm içerik sorumluluğu kullanıcıya aittir.
                                </p>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className={`text-2xl font-bold ${textClass} mb-4`}>8. Gizlilik ve Veri Koruma</h2>
                        <p className={secondaryTextClass}>
                            Kişisel verilerinizin işlenmesi hakkında detaylı bilgi için
                            <a href="#" className="text-cyan-500 hover:underline ml-1">Gizlilik Politikamızı</a> ve
                            <a href="#" className="text-cyan-500 hover:underline ml-1">KVKK Aydınlatma Metnimizi</a> inceleyiniz.
                        </p>
                    </section>

                    <section>
                        <h2 className={`text-2xl font-bold ${textClass} mb-4`}>9. Değişiklikler</h2>
                        <p className={secondaryTextClass}>
                            Bu kullanım koşullarını zaman zaman güncelleme hakkımız saklıdır. Önemli değişiklikler
                            olduğunda, e-posta yoluyla bilgilendirileceksiniz. Değişikliklerden sonra platformu
                            kullanmaya devam etmeniz, yeni koşulları kabul ettiğiniz anlamına gelir.
                        </p>
                    </section>

                    <section>
                        <h2 className={`text-2xl font-bold ${textClass} mb-4`}>10. Uygulanacak Hukuk ve Uyuşmazlık Çözümü</h2>
                        <p className={secondaryTextClass}>
                            Bu sözleşme Türkiye Cumhuriyeti kanunlarına tabidir. Sözleşmeden doğacak uyuşmazlıklarda
                            Türkiye mahkemeleri ve icra daireleri yetkilidir.
                        </p>
                    </section>

                    <section>
                        <h2 className={`text-2xl font-bold ${textClass} mb-4`}>11. İletişim</h2>
                        <p className={secondaryTextClass}>
                            Kullanım koşulları hakkında sorularınız için:
                        </p>
                        <ul className={`list-none ${secondaryTextClass} mt-2 space-y-2`}>
                            <li><strong>E-posta:</strong> <a href="mailto:info@fasheone.com" className="text-cyan-500 hover:underline">info@fasheone.com</a></li>
                            <li><strong>Web:</strong> <a href="https://fasheone.com" className="text-cyan-500 hover:underline">fasheone.com</a></li>
                        </ul>
                    </section>

                    <section className="mt-8 pt-6 border-t border-slate-700">
                        <p className={`${secondaryTextClass} text-sm italic`}>
                            Bu platformu kullanarak, yukarıdaki kullanım koşullarını okuduğunuzu ve kabul ettiğinizi beyan edersiniz.
                        </p>
                    </section>
                </div>
            </div>

            {/* Scroll Buttons */}
            <div className="fixed bottom-8 right-8 flex flex-col gap-2 z-50">
                <button
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="p-3 bg-cyan-500 hover:bg-cyan-400 text-white rounded-full shadow-lg transition-colors"
                    title="Yukarı Çık"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                </button>
                <button
                    onClick={() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' })}
                    className="p-3 bg-cyan-500 hover:bg-cyan-400 text-white rounded-full shadow-lg transition-colors"
                    title="Aşağı İn"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                </button>
            </div>
        </div>
    );
};
