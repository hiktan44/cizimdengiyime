import React from 'react';

interface CookiePolicyPageProps {
    onNavigateHome: () => void;
    theme?: 'light' | 'dark';
}

export const CookiePolicyPage: React.FC<CookiePolicyPageProps> = ({ onNavigateHome, theme = 'dark' }) => {
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
                    <h1 className={`text-4xl font-bold ${textClass} mb-4`}>Çerez Politikası</h1>
                    <p className={secondaryTextClass}>Son Güncelleme: 31 Ocak 2026</p>
                </div>

                {/* Content */}
                <div className={`${cardBg} border rounded-2xl p-8 space-y-6`}>
                    <section>
                        <h2 className={`text-2xl font-bold ${textClass} mb-4`}>1. Çerez Nedir?</h2>
                        <p className={secondaryTextClass}>
                            Çerezler (cookies), web sitemizi ziyaret ettiğinizde cihazınıza (bilgisayar, tablet, telefon)
                            kaydedilen küçük metin dosyalarıdır. Çerezler, web sitesinin daha iyi çalışmasını sağlar ve
                            kullanıcı deneyimini iyileştirir.
                        </p>
                    </section>

                    <section>
                        <h2 className={`text-2xl font-bold ${textClass} mb-4`}>2. Çerez Türleri</h2>
                        <div className={`${secondaryTextClass} space-y-4`}>
                            <div>
                                <h3 className="font-semibold text-lg mb-2">2.1. Zorunlu Çerezler</h3>
                                <p className="mb-2">
                                    Web sitesinin temel işlevlerini yerine getirmesi için gereklidir. Bu çerezler olmadan
                                    platform düzgün çalışmaz.
                                </p>
                                <ul className="list-disc list-inside space-y-1">
                                    <li><strong>Oturum Çerezleri:</strong> Giriş yapma durumunuzu korur</li>
                                    <li><strong>Güvenlik Çerezleri:</strong> Güvenlik önlemlerini sağlar</li>
                                    <li><strong>Tercih Çerezleri:</strong> Dil ve tema tercihlerinizi hatırlar</li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="font-semibold text-lg mb-2">2.2. Analitik Çerezler</h3>
                                <p className="mb-2">
                                    Web sitesinin nasıl kullanıldığını anlamamıza yardımcı olur. Bu veriler anonim olarak toplanır.
                                </p>
                                <ul className="list-disc list-inside space-y-1">
                                    <li><strong>Google Analytics:</strong> Ziyaret istatistikleri, sayfa görüntülemeleri</li>
                                    <li><strong>Kullanım Metrikleri:</strong> Hangi özelliklerin kullanıldığı</li>
                                    <li><strong>Performans Verileri:</strong> Sayfa yükleme süreleri</li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="font-semibold text-lg mb-2">2.3. Fonksiyonel Çerezler</h3>
                                <p className="mb-2">
                                    Gelişmiş özellikler ve kişiselleştirme sağlar.
                                </p>
                                <ul className="list-disc list-inside space-y-1">
                                    <li><strong>Kullanıcı Tercihleri:</strong> Kaydettiğiniz ayarlar</li>
                                    <li><strong>Özelleştirme:</strong> Kişiselleştirilmiş içerik gösterimi</li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="font-semibold text-lg mb-2">2.4. Pazarlama Çerezleri (İsteğe Bağlı)</h3>
                                <p className="mb-2">
                                    Size özel reklamlar göstermek için kullanılır. Bu çerezler için açık rızanız gerekir.
                                </p>
                                <ul className="list-disc list-inside space-y-1">
                                    <li><strong>Reklam Çerezleri:</strong> İlgi alanlarınıza göre reklamlar</li>
                                    <li><strong>Sosyal Medya:</strong> Sosyal medya entegrasyonları</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className={`text-2xl font-bold ${textClass} mb-4`}>3. Kullandığımız Çerezler</h2>
                        <div className="overflow-x-auto">
                            <table className={`w-full ${secondaryTextClass} text-sm`}>
                                <thead className="border-b border-slate-700">
                                    <tr>
                                        <th className="text-left py-3 px-2">Çerez Adı</th>
                                        <th className="text-left py-3 px-2">Tür</th>
                                        <th className="text-left py-3 px-2">Süre</th>
                                        <th className="text-left py-3 px-2">Amaç</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700">
                                    <tr>
                                        <td className="py-3 px-2 font-mono text-xs">sb-access-token</td>
                                        <td className="py-3 px-2">Zorunlu</td>
                                        <td className="py-3 px-2">Oturum</td>
                                        <td className="py-3 px-2">Kimlik doğrulama</td>
                                    </tr>
                                    <tr>
                                        <td className="py-3 px-2 font-mono text-xs">sb-refresh-token</td>
                                        <td className="py-3 px-2">Zorunlu</td>
                                        <td className="py-3 px-2">30 gün</td>
                                        <td className="py-3 px-2">Oturum yenileme</td>
                                    </tr>
                                    <tr>
                                        <td className="py-3 px-2 font-mono text-xs">theme</td>
                                        <td className="py-3 px-2">Fonksiyonel</td>
                                        <td className="py-3 px-2">1 yıl</td>
                                        <td className="py-3 px-2">Tema tercihi (açık/koyu)</td>
                                    </tr>
                                    <tr>
                                        <td className="py-3 px-2 font-mono text-xs">_ga</td>
                                        <td className="py-3 px-2">Analitik</td>
                                        <td className="py-3 px-2">2 yıl</td>
                                        <td className="py-3 px-2">Google Analytics</td>
                                    </tr>
                                    <tr>
                                        <td className="py-3 px-2 font-mono text-xs">_gid</td>
                                        <td className="py-3 px-2">Analitik</td>
                                        <td className="py-3 px-2">24 saat</td>
                                        <td className="py-3 px-2">Google Analytics</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </section>

                    <section>
                        <h2 className={`text-2xl font-bold ${textClass} mb-4`}>4. Üçüncü Taraf Çerezleri</h2>
                        <p className={secondaryTextClass}>
                            Platformumuz aşağıdaki üçüncü taraf hizmetlerini kullanır ve bu hizmetler kendi çerezlerini yerleştirebilir:
                        </p>
                        <ul className={`list-disc list-inside ${secondaryTextClass} mt-2 space-y-2`}>
                            <li><strong>Google Analytics:</strong> Web sitesi kullanım istatistikleri</li>
                            <li><strong>Stripe:</strong> Güvenli ödeme işlemleri</li>
                            <li><strong>Supabase:</strong> Kimlik doğrulama ve veri yönetimi</li>
                        </ul>
                        <p className={`${secondaryTextClass} mt-4`}>
                            Bu üçüncü tarafların çerez politikaları için kendi web sitelerini ziyaret edebilirsiniz.
                        </p>
                    </section>

                    <section>
                        <h2 className={`text-2xl font-bold ${textClass} mb-4`}>5. Çerez Tercihlerinizi Yönetme</h2>
                        <div className={`${secondaryTextClass} space-y-4`}>
                            <div>
                                <h3 className="font-semibold text-lg mb-2">5.1. Tarayıcı Ayarları</h3>
                                <p>
                                    Çoğu web tarayıcısı çerezleri otomatik olarak kabul eder, ancak tarayıcı ayarlarınızdan
                                    çerezleri engelleyebilir veya silebilirsiniz:
                                </p>
                                <ul className="list-disc list-inside mt-2 space-y-1">
                                    <li><strong>Chrome:</strong> Ayarlar → Gizlilik ve güvenlik → Çerezler</li>
                                    <li><strong>Firefox:</strong> Ayarlar → Gizlilik ve Güvenlik → Çerezler ve Site Verileri</li>
                                    <li><strong>Safari:</strong> Tercihler → Gizlilik → Çerezleri Yönet</li>
                                    <li><strong>Edge:</strong> Ayarlar → Gizlilik, arama ve hizmetler → Çerezler</li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="font-semibold text-lg mb-2">5.2. Çerez Banner'ı</h3>
                                <p>
                                    İlk ziyaretinizde çerez tercihlerinizi seçebileceğiniz bir banner gösterilir.
                                    Tercihlerinizi istediğiniz zaman değiştirebilirsiniz.
                                </p>
                            </div>

                            <div>
                                <h3 className="font-semibold text-lg mb-2">5.3. Önemli Not</h3>
                                <p className="text-yellow-400">
                                    ⚠️ Zorunlu çerezleri engellerseniz, platformun bazı özellikleri düzgün çalışmayabilir.
                                    Giriş yapamama, tercihlerinizin kaydedilmemesi gibi sorunlar yaşayabilirsiniz.
                                </p>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className={`text-2xl font-bold ${textClass} mb-4`}>6. Çerez Onayı ve KVKK</h2>
                        <p className={secondaryTextClass}>
                            Zorunlu çerezler dışındaki tüm çerezler için açık rızanız alınır. Bu rıza:
                        </p>
                        <ul className={`list-disc list-inside ${secondaryTextClass} mt-2 space-y-2`}>
                            <li>İsteğe bağlıdır - reddetme hakkınız vardır</li>
                            <li>Belirli ve bilgilendirilmiş şekilde alınır</li>
                            <li>İstediğiniz zaman geri çekilebilir</li>
                            <li>KVKK'ya uygun olarak işlenir</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className={`text-2xl font-bold ${textClass} mb-4`}>7. Çocukların Gizliliği</h2>
                        <p className={secondaryTextClass}>
                            Platformumuz 18 yaş altı kullanıcılara yönelik değildir. Bilerek 18 yaş altı kişilerden
                            veri toplamıyoruz. Ebeveyn veya vasi iseniz ve çocuğunuzun bize veri sağladığını
                            düşünüyorsanız, lütfen bizimle iletişime geçin.
                        </p>
                    </section>

                    <section>
                        <h2 className={`text-2xl font-bold ${textClass} mb-4`}>8. Politika Güncellemeleri</h2>
                        <p className={secondaryTextClass}>
                            Bu çerez politikası zaman zaman güncellenebilir. Önemli değişiklikler olduğunda,
                            web sitemizde duyuru yapılacak ve e-posta ile bilgilendirileceksiniz.
                        </p>
                    </section>

                    <section>
                        <h2 className={`text-2xl font-bold ${textClass} mb-4`}>9. İletişim</h2>
                        <p className={secondaryTextClass}>
                            Çerez politikamız hakkında sorularınız için:
                        </p>
                        <ul className={`list-none ${secondaryTextClass} mt-2 space-y-2`}>
                            <li><strong>E-posta:</strong> <a href="mailto:info@fasheone.com" className="text-cyan-500 hover:underline">info@fasheone.com</a></li>
                            <li><strong>Web:</strong> <a href="https://fasheone.com" className="text-cyan-500 hover:underline">fasheone.com</a></li>
                        </ul>
                    </section>

                    <section className="mt-8 pt-6 border-t border-slate-700">
                        <p className={`${secondaryTextClass} text-sm italic`}>
                            Bu çerez politikası, 6698 sayılı Kişisel Verilerin Korunması Kanunu ve
                            Elektronik Ticaretin Düzenlenmesi Hakkında Kanun kapsamında hazırlanmıştır.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
};
