import React from 'react';

interface RefundPolicyPageProps {
    onNavigateHome: () => void;
    theme?: 'light' | 'dark';
}

export const RefundPolicyPage: React.FC<RefundPolicyPageProps> = ({ onNavigateHome, theme = 'dark' }) => {
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
                    <h1 className={`text-4xl font-bold ${textClass} mb-4`}>İade ve İptal Politikası</h1>
                    <p className={secondaryTextClass}>Son Güncelleme: 31 Ocak 2026</p>
                </div>

                {/* Content */}
                <div className={`${cardBg} border rounded-2xl p-8 space-y-6`}>
                    <section>
                        <h2 className={`text-2xl font-bold ${textClass} mb-4`}>1. Genel Bilgiler</h2>
                        <p className={secondaryTextClass}>
                            Fasheone, dijital hizmet ve kredi satışı yapan bir SaaS platformudur. Bu politika,
                            6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği
                            kapsamında hazırlanmıştır.
                        </p>
                        <div className={`mt-4 p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg`}>
                            <p className={`${secondaryTextClass} text-sm`}>
                                <strong>Önemli:</strong> Dijital içerik ve hizmetler için cayma hakkı, hizmetin ifasına
                                başlanmasıyla birlikte sona erer. Kredi satın alımlarında, açık rızanız ile cayma hakkınızdan
                                feragat etmiş olursunuz.
                            </p>
                        </div>
                    </section>

                    <section>
                        <h2 className={`text-2xl font-bold ${textClass} mb-4`}>2. Kredi Satın Alma ve İade</h2>
                        <div className={`${secondaryTextClass} space-y-4`}>
                            <div>
                                <h3 className="font-semibold text-lg mb-2">2.1. Satın Alma Süreci</h3>
                                <ul className="list-disc list-inside space-y-1">
                                    <li>Kredi paketleri Stripe üzerinden güvenli şekilde satın alınır</li>
                                    <li>Ödeme onaylandıktan sonra krediler anında hesabınıza yüklenir</li>
                                    <li>Satın alma işlemi tamamlandığında e-posta ile bilgilendirilirsiniz</li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="font-semibold text-lg mb-2">2.2. İade Koşulları</h3>
                                <p className="mb-2">
                                    Kredi iadesi <strong>yalnızca aşağıdaki durumlarda</strong> yapılabilir:
                                </p>
                                <ul className="list-disc list-inside space-y-2">
                                    <li>
                                        <strong>Teknik Hata:</strong> Ödeme alındı ancak krediler hesaba yüklenmedi
                                        <span className="block text-sm mt-1 ml-6">→ 24 saat içinde tam iade</span>
                                    </li>
                                    <li>
                                        <strong>Çift Ödeme:</strong> Aynı işlem için birden fazla ödeme alındı
                                        <span className="block text-sm mt-1 ml-6">→ Fazla ödenen tutar iade edilir</span>
                                    </li>
                                    <li>
                                        <strong>Yetkisiz İşlem:</strong> Hesabınız çalındı ve izniniz olmadan kredi satın alındı
                                        <span className="block text-sm mt-1 ml-6">→ Kanıt sunulması halinde iade</span>
                                    </li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="font-semibold text-lg mb-2">2.3. İade Yapılamayan Durumlar</h3>
                                <ul className="list-disc list-inside space-y-2">
                                    <li>Krediler kullanılmaya başlandıysa (kısmi veya tam)</li>
                                    <li>"Fikrim değişti" veya "kullanmayacağım" gibi nedenler</li>
                                    <li>Satın alımdan 48 saat sonra yapılan talepler (teknik hata hariç)</li>
                                    <li>Promosyon veya indirimli paketler (özel koşullar geçerlidir)</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className={`text-2xl font-bold ${textClass} mb-4`}>3. Hizmet İptali ve İade</h2>
                        <div className={`${secondaryTextClass} space-y-4`}>
                            <div>
                                <h3 className="font-semibold text-lg mb-2">3.1. Başarısız İşlemler</h3>
                                <p>
                                    AI hizmetlerimizde teknik bir sorun nedeniyle işlem başarısız olursa:
                                </p>
                                <ul className="list-disc list-inside mt-2 space-y-1">
                                    <li>Harcanan krediler otomatik olarak hesabınıza iade edilir</li>
                                    <li>İade işlemi 1-5 dakika içinde tamamlanır</li>
                                    <li>E-posta ile bilgilendirilirsiniz</li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="font-semibold text-lg mb-2">3.2. Kalite Garantisi</h3>
                                <p>
                                    Üretilen görsellerin kalitesi beklentilerinizi karşılamıyorsa:
                                </p>
                                <ul className="list-disc list-inside mt-2 space-y-1">
                                    <li>Farklı ayarlar ve promptlar deneyebilirsiniz (ek kredi harcanmaz)</li>
                                    <li>Teknik destek ekibimizle iletişime geçebilirsiniz</li>
                                    <li>AI teknolojisinin doğası gereği sonuçlar değişkenlik gösterebilir</li>
                                </ul>
                                <p className="mt-2 text-sm italic">
                                    Not: "Beğenmedim" nedeniyle kredi iadesi yapılmaz, ancak teknik sorun varsa
                                    destek ekibimiz yardımcı olur.
                                </p>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className={`text-2xl font-bold ${textClass} mb-4`}>4. İade Talep Süreci</h2>
                        <div className={`${secondaryTextClass} space-y-4`}>
                            <div>
                                <h3 className="font-semibold text-lg mb-2">4.1. Başvuru Yöntemi</h3>
                                <p>İade talebinde bulunmak için:</p>
                                <ol className="list-decimal list-inside mt-2 space-y-2">
                                    <li>
                                        <strong>E-posta gönderin:</strong> info@fasheone.com
                                        <ul className="list-disc list-inside ml-6 mt-1 text-sm">
                                            <li>Konu: "İade Talebi - [Sipariş No]"</li>
                                            <li>İçerik: İade nedeni, sipariş detayları, ekran görüntüleri (varsa)</li>
                                        </ul>
                                    </li>
                                    <li>
                                        <strong>Destek formu:</strong> Web sitemizden destek talebi oluşturun
                                    </li>
                                    <li>
                                        <strong>Hesap paneli:</strong> "Siparişlerim" bölümünden iade talebi açın
                                    </li>
                                </ol>
                            </div>

                            <div>
                                <h3 className="font-semibold text-lg mb-2">4.2. Değerlendirme Süreci</h3>
                                <ul className="list-disc list-inside space-y-1">
                                    <li><strong>İnceleme:</strong> Talebiniz 1-3 iş günü içinde incelenir</li>
                                    <li><strong>Bilgilendirme:</strong> Sonuç e-posta ile bildirilir</li>
                                    <li><strong>Onay:</strong> İade onaylanırsa işlem başlatılır</li>
                                    <li><strong>Red:</strong> Red nedeni detaylı olarak açıklanır</li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="font-semibold text-lg mb-2">4.3. İade Süresi</h3>
                                <p>İade onaylandıktan sonra:</p>
                                <ul className="list-disc list-inside mt-2 space-y-1">
                                    <li><strong>Kredi İadesi:</strong> Anında hesabınıza yüklenir</li>
                                    <li><strong>Para İadesi:</strong> 5-10 iş günü içinde ödeme yönteminize iade edilir</li>
                                    <li><strong>Banka Süreci:</strong> Bankanızın işlem süresine bağlı olarak 2-3 gün daha sürebilir</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className={`text-2xl font-bold ${textClass} mb-4`}>5. Cayma Hakkı (Mesafeli Satış)</h2>
                        <div className={`${secondaryTextClass} space-y-4`}>
                            <div>
                                <h3 className="font-semibold text-lg mb-2">5.1. Dijital İçerik İstisnası</h3>
                                <p>
                                    6502 sayılı Kanun'un 15. maddesi gereği, <strong>dijital içerik ve hizmetler</strong> için
                                    cayma hakkı kullanılamaz. Fasheone hizmetleri bu kapsamdadır çünkü:
                                </p>
                                <ul className="list-disc list-inside mt-2 space-y-1">
                                    <li>Anında teslim edilen dijital hizmetlerdir</li>
                                    <li>Kullanıcı açık rızası ile hizmet ifasına başlanır</li>
                                    <li>Krediler hesaba yüklenir yüklenmez kullanılabilir hale gelir</li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="font-semibold text-lg mb-2">5.2. Açık Rıza Beyanı</h3>
                                <p>
                                    Kredi satın alırken, aşağıdaki beyanı onaylamış olursunuz:
                                </p>
                                <div className="mt-2 p-4 bg-slate-700/30 border border-slate-600 rounded-lg italic">
                                    "Dijital içerik ve hizmet satın aldığımı, cayma hakkımın hizmetin ifasıyla birlikte
                                    sona ereceğini kabul ediyorum. Kredilerin anında hesabıma yüklenmesini ve
                                    kullanılabilir hale gelmesini talep ediyorum."
                                </div>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className={`text-2xl font-bold ${textClass} mb-4`}>6. Özel Durumlar</h2>
                        <div className={`${secondaryTextClass} space-y-4`}>
                            <div>
                                <h3 className="font-semibold text-lg mb-2">6.1. Hesap Kapatma</h3>
                                <p>
                                    Hesabınızı kapatmak isterseniz:
                                </p>
                                <ul className="list-disc list-inside mt-2 space-y-1">
                                    <li>Kullanılmamış kredileriniz için iade yapılmaz</li>
                                    <li>Hesap kapatma talebi geri alınamaz</li>
                                    <li>Tüm verileriniz KVKK uyarınca silinir</li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="font-semibold text-lg mb-2">6.2. Hesap Askıya Alma/İptal</h3>
                                <p>
                                    Hesabınız kullanım koşullarını ihlal nedeniyle askıya alınır veya iptal edilirse:
                                </p>
                                <ul className="list-disc list-inside mt-2 space-y-1">
                                    <li>Kalan krediler için iade yapılmaz</li>
                                    <li>İhlal durumu kanıtlanırsa ödeme iadesi yapılmaz</li>
                                    <li>İtiraz hakkınız saklıdır</li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="font-semibold text-lg mb-2">6.3. Platform Kapatılması</h3>
                                <p>
                                    Fasheone platformu kapatılırsa (olası olmayan bir durum):
                                </p>
                                <ul className="list-disc list-inside mt-2 space-y-1">
                                    <li>Kullanılmamış krediler için tam iade yapılır</li>
                                    <li>En az 30 gün önceden bildirim yapılır</li>
                                    <li>İade işlemleri otomatik başlatılır</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className={`text-2xl font-bold ${textClass} mb-4`}>7. Tüketici Hakları</h2>
                        <p className={secondaryTextClass}>
                            Bu politikaya rağmen yasal haklarınız saklıdır. Şikayetleriniz için:
                        </p>
                        <ul className={`list-disc list-inside ${secondaryTextClass} mt-2 space-y-2`}>
                            <li>
                                <strong>Tüketici Hakem Heyeti:</strong> İl/İlçe Tüketici Hakem Heyetleri
                                <span className="block text-sm mt-1 ml-6">
                                    (Uyuşmazlık değeri 2024 yılı için: 3.000 TL - 30.000 TL arası)
                                </span>
                            </li>
                            <li>
                                <strong>Tüketici Mahkemeleri:</strong> İkamet yeriniz veya işlemin yapıldığı yer mahkemeleri
                            </li>
                            <li>
                                <strong>Tüketici Danışma Hattı:</strong> 175 (Ticaret Bakanlığı)
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h2 className={`text-2xl font-bold ${textClass} mb-4`}>8. İletişim</h2>
                        <p className={secondaryTextClass}>
                            İade ve iptal işlemleri için:
                        </p>
                        <ul className={`list-none ${secondaryTextClass} mt-2 space-y-2`}>
                            <li><strong>E-posta:</strong> <a href="mailto:info@fasheone.com" className="text-cyan-500 hover:underline">info@fasheone.com</a></li>
                            <li><strong>Web:</strong> <a href="https://fasheone.com" className="text-cyan-500 hover:underline">fasheone.com</a></li>
                            <li><strong>Destek:</strong> Hesap panelinizdeki "Destek" bölümü</li>
                        </ul>
                    </section>

                    <section className="mt-8 pt-6 border-t border-slate-700">
                        <p className={`${secondaryTextClass} text-sm italic`}>
                            Bu politika, 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler
                            Yönetmeliği kapsamında hazırlanmıştır. Yasal haklarınız saklıdır.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
};
