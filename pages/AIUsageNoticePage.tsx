import React from 'react';

interface AIUsageNoticePage

Props {
    onNavigateHome: () => void;
    theme ?: 'light' | 'dark';
}

export const AIUsageNoticePage: React.FC<AIUsageNoticePageProps> = ({ onNavigateHome, theme = 'dark' }) => {
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
                    <h1 className={`text-4xl font-bold ${textClass} mb-4`}>
                        🤖 Yapay Zeka Kullanım Bildirimi
                    </h1>
                    <p className={secondaryTextClass}>Son Güncelleme: 31 Ocak 2026</p>
                </div>

                {/* Important Notice */}
                <div className="mb-8 p-6 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 rounded-2xl">
                    <h2 className={`text-xl font-bold ${textClass} mb-3`}>⚠️ Önemli Bilgilendirme</h2>
                    <p className={secondaryTextClass}>
                        Fasheone platformu, <strong>yapay zeka (AI) teknolojileri</strong> kullanarak görsel üretimi ve
                        düzenleme hizmetleri sunmaktadır. Bu sayfa, AI kullanımımız hakkında şeffaf bilgilendirme yapmak
                        ve kullanıcılarımızın bilinçli kararlar almasını sağlamak amacıyla hazırlanmıştır.
                    </p>
                </div>

                {/* Content */}
                <div className={`${cardBg} border rounded-2xl p-8 space-y-6`}>
                    <section>
                        <h2 className={`text-2xl font-bold ${textClass} mb-4`}>1. AI Teknolojisi Kullanımı</h2>
                        <div className={`${secondaryTextClass} space-y-4`}>
                            <p>
                                Fasheone, aşağıdaki hizmetlerinde <strong>Google Gemini AI</strong> teknolojisini kullanmaktadır:
                            </p>
                            <ul className="list-disc list-inside space-y-2">
                                <li>
                                    <strong>Canlı Model & Video:</strong> Ürün görsellerinden AI destekli model görselleri ve video üretimi
                                </li>
                                <li>
                                    <strong>Teknik Çizim:</strong> Ürün görsellerinden otomatik teknik çizim oluşturma
                                </li>
                                <li>
                                    <strong>Pixshop:</strong> Görsel düzenleme, arka plan değiştirme, yüz değiştirme, rötuş
                                </li>
                                <li>
                                    <strong>Fotomatik:</strong> Otomatik görsel analiz ve iyileştirme
                                </li>
                                <li>
                                    <strong>AdGenius:</strong> AI destekli reklam görseli üretimi
                                </li>
                                <li>
                                    <strong>Collage:</strong> Çoklu görsel kompozisyon oluşturma
                                </li>
                            </ul>
                        </div>
                    </section>

                    <section>
                        <h2 className={`text-2xl font-bold ${textClass} mb-4`}>2. AI Modelleri ve Sağlayıcılar</h2>
                        <div className={`${secondaryTextClass} space-y-4`}>
                            <div>
                                <h3 className="font-semibold text-lg mb-2">2.1. Kullanılan AI Modelleri</h3>
                                <ul className="list-disc list-inside space-y-1">
                                    <li><strong>Google Gemini 2.0 Flash Experimental:</strong> Görsel üretimi ve analiz</li>
                                    <li><strong>Imagen 3:</strong> Yüksek kaliteli görsel sentezi</li>
                                    <li><strong>Veo 2:</strong> Video üretimi ve düzenleme</li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="font-semibold text-lg mb-2">2.2. Üçüncü Taraf AI Hizmetleri</h3>
                                <p>
                                    Platformumuz, Google Cloud AI Platform üzerinden AI hizmetlerine erişir.
                                    Verileriniz Google'ın gizlilik politikalarına tabidir.
                                </p>
                                <p className="mt-2">
                                    <a
                                        href="https://policies.google.com/privacy"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-cyan-500 hover:underline"
                                    >
                                        → Google Gizlilik Politikası
                                    </a>
                                </p>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className={`text-2xl font-bold ${textClass} mb-4`}>3. Verilerinizin AI ile İşlenmesi</h2>
                        <div className={`${secondaryTextClass} space-y-4`}>
                            <div>
                                <h3 className="font-semibold text-lg mb-2">3.1. İşlenen Veriler</h3>
                                <p>AI hizmetlerimiz aşağıdaki verileri işler:</p>
                                <ul className="list-disc list-inside mt-2 space-y-1">
                                    <li><strong>Görsel Veriler:</strong> Yüklediğiniz ürün fotoğrafları, model görselleri</li>
                                    <li><strong>Metin Promptları:</strong> Görsel üretimi için verdiğiniz talimatlar</li>
                                    <li><strong>Kullanım Verileri:</strong> Hangi özellikleri kullandığınız, tercihleriniz</li>
                                    <li><strong>Teknik Metadata:</strong> Görsel boyutları, formatlar, işlem parametreleri</li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="font-semibold text-lg mb-2">3.2. Veri Akışı</h3>
                                <div className="mt-2 p-4 bg-slate-700/30 border border-slate-600 rounded-lg">
                                    <ol className="list-decimal list-inside space-y-2">
                                        <li>Görselinizi Fasheone'ye yüklersiniz</li>
                                        <li>Görsel, güvenli bağlantı ile Google Cloud Storage'a aktarılır</li>
                                        <li>Google Gemini AI, görseli işler ve sonuç üretir</li>
                                        <li>Üretilen görsel Fasheone'ye geri gönderilir</li>
                                        <li>Sonuç size sunulur ve Supabase'de saklanır</li>
                                    </ol>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-semibold text-lg mb-2">3.3. Veri Saklama</h3>
                                <ul className="list-disc list-inside space-y-1">
                                    <li><strong>Orijinal Görseller:</strong> Supabase Storage'da şifrelenmiş olarak saklanır</li>
                                    <li><strong>Üretilen Görseller:</strong> Hesabınızda kalıcı olarak saklanır</li>
                                    <li><strong>AI İşleme Verileri:</strong> Google tarafında geçici olarak işlenir, kalıcı saklanmaz</li>
                                    <li><strong>Saklama Süresi:</strong> Hesabınız aktif olduğu sürece veya silme talebinize kadar</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className={`text-2xl font-bold ${textClass} mb-4`}>4. AI Üretiminin Sınırlamaları</h2>
                        <div className={`${secondaryTextClass} space-y-4`}>
                            <div>
                                <h3 className="font-semibold text-lg mb-2">4.1. Doğruluk ve Kalite</h3>
                                <p className="mb-2">AI teknolojisi güçlü olmakla birlikte bazı sınırlamaları vardır:</p>
                                <ul className="list-disc list-inside space-y-2">
                                    <li>
                                        <strong>Değişkenlik:</strong> Aynı prompt ile farklı sonuçlar üretilebilir
                                    </li>
                                    <li>
                                        <strong>Hata Payı:</strong> Üretilen görsellerde beklenmedik detaylar olabilir
                                    </li>
                                    <li>
                                        <strong>Gerçekçilik:</strong> Görseller gerçekçi görünse de %100 doğru olmayabilir
                                    </li>
                                    <li>
                                        <strong>Telif Hakları:</strong> AI, eğitim verilerinden öğrenir ancak kopyalama yapmaz
                                    </li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="font-semibold text-lg mb-2">4.2. Yasaklı İçerik</h3>
                                <p>AI sistemlerimiz aşağıdaki içerikleri üretmez:</p>
                                <ul className="list-disc list-inside mt-2 space-y-1">
                                    <li>Pornografik veya müstehcen içerik</li>
                                    <li>Şiddet, nefret söylemi veya ayrımcılık içeren görseller</li>
                                    <li>Sahte kimlik veya deepfake içerik</li>
                                    <li>Telif hakkı ihlali oluşturan içerik</li>
                                    <li>Yanıltıcı veya zararlı içerik</li>
                                </ul>
                                <p className="mt-2 text-yellow-400">
                                    ⚠️ Bu tür içerik üretmeye çalışan hesaplar otomatik olarak askıya alınır.
                                </p>
                            </div>

                            <div>
                                <h3 className="font-semibold text-lg mb-2">4.3. İnsan Denetimi</h3>
                                <p>
                                    AI üretimlerimiz otomatiktir, ancak:
                                </p>
                                <ul className="list-disc list-inside mt-2 space-y-1">
                                    <li>Şüpheli içerik otomatik olarak işaretlenir</li>
                                    <li>Kullanıcı şikayetleri insan ekibimiz tarafından incelenir</li>
                                    <li>Kalite kontrol için rastgele örneklemeler yapılır</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className={`text-2xl font-bold ${textClass} mb-4`}>5. Fikri Mülkiyet ve Telif Hakları</h2>
                        <div className={`${secondaryTextClass} space-y-4`}>
                            <div>
                                <h3 className="font-semibold text-lg mb-2">5.1. Yüklediğiniz İçerik</h3>
                                <ul className="list-disc list-inside space-y-1">
                                    <li>Yüklediğiniz görseller üzerindeki haklar size aittir</li>
                                    <li>Telif hakkı ihlali yapan içerik yüklememelisiniz</li>
                                    <li>Başkalarının fikri mülkiyet haklarına saygı göstermelisiniz</li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="font-semibold text-lg mb-2">5.2. AI Tarafından Üretilen İçerik</h3>
                                <p className="mb-2">
                                    AI ile ürettiğiniz görseller hakkında:
                                </p>
                                <ul className="list-disc list-inside space-y-2">
                                    <li>
                                        <strong>Ticari Kullanım:</strong> Üretilen görselleri ticari amaçla kullanabilirsiniz
                                    </li>
                                    <li>
                                        <strong>Atıf:</strong> "AI ile üretilmiştir" notu eklemeniz önerilir (zorunlu değil)
                                    </li>
                                    <li>
                                        <strong>Sorumluluk:</strong> Üretilen içeriğin kullanımından siz sorumlusunuz
                                    </li>
                                    <li>
                                        <strong>Benzersizlik:</strong> AI aynı prompt ile benzer görseller üretebilir
                                    </li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="font-semibold text-lg mb-2">5.3. AI Eğitimi</h3>
                                <p className="mb-2 text-cyan-400">
                                    ✅ Verileriniz AI modellerini eğitmek için KULLANILMAZ
                                </p>
                                <p>
                                    Google Gemini API kullanımında, verileriniz model eğitimi için kullanılmaz.
                                    Sadece size hizmet sunmak için işlenir ve geçici olarak saklanır.
                                </p>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className={`text-2xl font-bold ${textClass} mb-4`}>6. Güvenlik ve Gizlilik</h2>
                        <div className={`${secondaryTextClass} space-y-4`}>
                            <div>
                                <h3 className="font-semibold text-lg mb-2">6.1. Veri Güvenliği</h3>
                                <ul className="list-disc list-inside space-y-1">
                                    <li><strong>Şifreleme:</strong> Tüm veriler SSL/TLS ile şifrelenir</li>
                                    <li><strong>Erişim Kontrolü:</strong> Sadece sizin görselerinize erişebilirsiniz</li>
                                    <li><strong>Güvenli Depolama:</strong> Supabase ve Google Cloud güvenlik standartları</li>
                                    <li><strong>Yedekleme:</strong> Düzenli otomatik yedeklemeler</li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="font-semibold text-lg mb-2">6.2. Gizlilik Taahhüdü</h3>
                                <ul className="list-disc list-inside space-y-1">
                                    <li>Görselleriniz üçüncü taraflarla paylaşılmaz</li>
                                    <li>AI işleme dışında kullanılmaz</li>
                                    <li>Pazarlama veya reklam amaçlı kullanılmaz</li>
                                    <li>İzniniz olmadan yayınlanmaz</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className={`text-2xl font-bold ${textClass} mb-4`}>7. Kullanıcı Hakları ve Kontrol</h2>
                        <div className={`${secondaryTextClass} space-y-4`}>
                            <div>
                                <h3 className="font-semibold text-lg mb-2">7.1. Veri Kontrol Haklarınız</h3>
                                <ul className="list-disc list-inside space-y-1">
                                    <li><strong>Erişim:</strong> Tüm verilerinizi görüntüleyebilirsiniz</li>
                                    <li><strong>Silme:</strong> İstediğiniz zaman verilerinizi silebilirsiniz</li>
                                    <li><strong>Dışa Aktarma:</strong> Verilerinizi indirebilirsiniz</li>
                                    <li><strong>Düzeltme:</strong> Hatalı bilgileri düzeltebilirsiniz</li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="font-semibold text-lg mb-2">7.2. AI Kullanımını Reddetme</h3>
                                <p>
                                    AI hizmetlerimiz platformun temel işlevselliğidir. AI kullanımını reddetmek,
                                    platformu kullanamayacağınız anlamına gelir. Ancak:
                                </p>
                                <ul className="list-disc list-inside mt-2 space-y-1">
                                    <li>Hesabınızı istediğiniz zaman kapatabilirsiniz</li>
                                    <li>Verilerinizin silinmesini talep edebilirsiniz</li>
                                    <li>Alternatif hizmetleri tercih edebilirsiniz</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className={`text-2xl font-bold ${textClass} mb-4`}>8. Şeffaflık ve Hesap Verebilirlik</h2>
                        <div className={`${secondaryTextClass} space-y-4`}>
                            <div>
                                <h3 className="font-semibold text-lg mb-2">8.1. AI Kullanımı Bildirimi</h3>
                                <p>
                                    Tüm üretilen görsellerde "AI ile üretilmiştir" etiketi bulunur.
                                    Bu, şeffaflık ve güven için önemlidir.
                                </p>
                            </div>

                            <div>
                                <h3 className="font-semibold text-lg mb-2">8.2. Sorun Bildirimi</h3>
                                <p>
                                    AI üretiminde sorun yaşarsanız veya uygunsuz içerik görürseniz:
                                </p>
                                <ul className="list-disc list-inside mt-2 space-y-1">
                                    <li>Destek ekibimize bildirin: info@fasheone.com</li>
                                    <li>"Rapor Et" butonunu kullanın</li>
                                    <li>Ekran görüntüsü ve detay paylaşın</li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="font-semibold text-lg mb-2">8.3. Sürekli İyileştirme</h3>
                                <p>
                                    AI teknolojimizi sürekli geliştiriyoruz. Geri bildirimleriniz çok değerlidir.
                                    Önerilerinizi bizimle paylaşın.
                                </p>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className={`text-2xl font-bold ${textClass} mb-4`}>9. Yasal Uyumluluk</h2>
                        <div className={`${secondaryTextClass} space-y-4`}>
                            <div>
                                <h3 className="font-semibold text-lg mb-2">9.1. KVKK Uyumluluğu</h3>
                                <p>
                                    AI ile veri işleme faaliyetlerimiz, 6698 sayılı KVKK'ya uygundur.
                                    Detaylı bilgi için <a href="#" className="text-cyan-500 hover:underline">KVKK Aydınlatma Metnimizi</a> inceleyiniz.
                                </p>
                            </div>

                            <div>
                                <h3 className="font-semibold text-lg mb-2">9.2. AB AI Yasası</h3>
                                <p>
                                    Platformumuz, AB Yapay Zeka Yasası (AI Act) prensiplerine uygun olarak tasarlanmıştır:
                                </p>
                                <ul className="list-disc list-inside mt-2 space-y-1">
                                    <li>Şeffaflık ve açıklık</li>
                                    <li>İnsan denetimi ve kontrolü</li>
                                    <li>Güvenlik ve doğruluk</li>
                                    <li>Ayrımcılık yapmama</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className={`text-2xl font-bold ${textClass} mb-4`}>10. Güncellemeler ve İletişim</h2>
                        <div className={`${secondaryTextClass} space-y-4`}>
                            <div>
                                <h3 className="font-semibold text-lg mb-2">10.1. Politika Güncellemeleri</h3>
                                <p>
                                    AI teknolojisi hızla gelişmektedir. Bu bildirimi düzenli olarak güncelliyoruz.
                                    Önemli değişiklikler e-posta ile bildirilir.
                                </p>
                            </div>

                            <div>
                                <h3 className="font-semibold text-lg mb-2">10.2. İletişim</h3>
                                <p>AI kullanımımız hakkında sorularınız için:</p>
                                <ul className="list-none mt-2 space-y-2">
                                    <li><strong>E-posta:</strong> <a href="mailto:info@fasheone.com" className="text-cyan-500 hover:underline">info@fasheone.com</a></li>
                                    <li><strong>Web:</strong> <a href="https://fasheone.com" className="text-cyan-500 hover:underline">fasheone.com</a></li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    <section className="mt-8 pt-6 border-t border-slate-700">
                        <div className="p-6 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 rounded-xl">
                            <h3 className={`text-lg font-bold ${textClass} mb-3`}>💡 Özet</h3>
                            <p className={secondaryTextClass}>
                                Fasheone, Google Gemini AI kullanarak görsel üretimi ve düzenleme hizmetleri sunar.
                                Verileriniz güvenli şekilde işlenir, model eğitimi için kullanılmaz ve size aittir.
                                AI üretimlerinin sınırlamaları vardır ve sonuçlar değişkenlik gösterebilir.
                                Şeffaflık, güvenlik ve kullanıcı kontrolü önceliğimizdir.
                            </p>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};
