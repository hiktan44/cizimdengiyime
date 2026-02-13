import React from 'react';

interface KVKKPageProps {
    onNavigateHome: () => void;
    theme?: 'light' | 'dark';
}

export const KVKKPage: React.FC<KVKKPageProps> = ({ onNavigateHome, theme = 'dark' }) => {
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
                    <h1 className={`text-4xl font-bold ${textClass} mb-4`}>KVKK Aydınlatma Metni</h1>
                    <p className={secondaryTextClass}>6698 Sayılı Kişisel Verilerin Korunması Kanunu Uyarınca</p>
                </div>

                {/* Content */}
                <div className={`${cardBg} border rounded-2xl p-8 space-y-6`}>
                    <section>
                        <h2 className={`text-2xl font-bold ${textClass} mb-4`}>1. Veri Sorumlusu</h2>
                        <p className={secondaryTextClass}>
                            <strong>Veri Sorumlusu:</strong> Fasheone<br />
                            <strong>Adres:</strong> Türkiye<br />
                            <strong>E-posta:</strong> <a href="mailto:info@fasheone.com" className="text-cyan-500 hover:underline">info@fasheone.com</a><br />
                            <strong>Web:</strong> <a href="https://fasheone.com" className="text-cyan-500 hover:underline">fasheone.com</a>
                        </p>
                    </section>

                    <section>
                        <h2 className={`text-2xl font-bold ${textClass} mb-4`}>2. Kişisel Verilerin İşlenme Amacı</h2>
                        <p className={secondaryTextClass}>
                            Kişisel verileriniz aşağıdaki amaçlarla işlenmektedir:
                        </p>
                        <ul className={`list-disc list-inside ${secondaryTextClass} mt-2 space-y-2`}>
                            <li>Kullanıcı hesabı oluşturma ve yönetme</li>
                            <li>AI tabanlı görsel üretim hizmetlerinin sunulması</li>
                            <li>Ödeme işlemlerinin gerçekleştirilmesi</li>
                            <li>Müşteri destek hizmetlerinin sağlanması</li>
                            <li>Hizmet kalitesinin iyileştirilmesi ve kullanıcı deneyiminin geliştirilmesi</li>
                            <li>İstatistiksel analiz ve raporlama</li>
                            <li>Yasal yükümlülüklerin yerine getirilmesi</li>
                            <li>Pazarlama ve iletişim faaliyetleri (açık rıza ile)</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className={`text-2xl font-bold ${textClass} mb-4`}>3. İşlenen Kişisel Veri Kategorileri</h2>
                        <div className={`${secondaryTextClass} space-y-4`}>
                            <div>
                                <h3 className="font-semibold text-lg mb-2">3.1. Kimlik Bilgileri</h3>
                                <p>Ad, soyad, kullanıcı adı</p>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-2">3.2. İletişim Bilgileri</h3>
                                <p>E-posta adresi, telefon numarası (isteğe bağlı)</p>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-2">3.3. Müşteri İşlem Bilgileri</h3>
                                <p>Kredi satın alma işlemleri, kullanım geçmişi, oluşturulan içerikler</p>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-2">3.4. İşlem Güvenliği Bilgileri</h3>
                                <p>IP adresi, tarayıcı bilgisi, cihaz bilgisi, çerez verileri</p>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-2">3.5. Finansal Bilgiler</h3>
                                <p>Ödeme bilgileri (Stripe üzerinden güvenli şekilde işlenir, sistemimizde saklanmaz)</p>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-2">3.6. Görsel ve İçerik Verileri</h3>
                                <p>Yüklediğiniz görseller, AI ile oluşturduğunuz içerikler</p>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className={`text-2xl font-bold ${textClass} mb-4`}>4. Kişisel Verilerin Toplanma Yöntemi</h2>
                        <p className={secondaryTextClass}>
                            Kişisel verileriniz aşağıdaki yöntemlerle toplanmaktadır:
                        </p>
                        <ul className={`list-disc list-inside ${secondaryTextClass} mt-2 space-y-2`}>
                            <li>Web sitesi üzerinden kayıt formları</li>
                            <li>Google OAuth ile giriş</li>
                            <li>Platform kullanımı sırasında otomatik toplanan veriler (çerezler, log kayıtları)</li>
                            <li>Müşteri destek kanalları (e-posta, WhatsApp)</li>
                            <li>Ödeme işlemleri sırasında</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className={`text-2xl font-bold ${textClass} mb-4`}>5. Kişisel Verilerin İşlenme Hukuki Sebepleri</h2>
                        <p className={secondaryTextClass}>
                            Kişisel verileriniz KVKK'nın 5. ve 6. maddelerinde belirtilen aşağıdaki hukuki sebeplere dayanarak işlenmektedir:
                        </p>
                        <ul className={`list-disc list-inside ${secondaryTextClass} mt-2 space-y-2`}>
                            <li><strong>Sözleşmenin kurulması veya ifası:</strong> Hizmet sözleşmesinin yerine getirilmesi</li>
                            <li><strong>Hukuki yükümlülük:</strong> Yasal düzenlemelerin gerektirdiği saklama ve raporlama yükümlülükleri</li>
                            <li><strong>Meşru menfaat:</strong> Hizmet kalitesinin iyileştirilmesi, güvenlik önlemleri</li>
                            <li><strong>Açık rıza:</strong> Pazarlama iletişimi, çerez kullanımı</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className={`text-2xl font-bold ${textClass} mb-4`}>6. Kişisel Verilerin Aktarılması</h2>
                        <p className={secondaryTextClass}>
                            Kişisel verileriniz aşağıdaki alıcı gruplarına aktarılabilir:
                        </p>
                        <div className={`${secondaryTextClass} mt-4 space-y-4`}>
                            <div>
                                <h3 className="font-semibold text-lg mb-2">6.1. Yurt İçi Aktarımlar</h3>
                                <ul className="list-disc list-inside space-y-1">
                                    <li>Yasal yükümlülükler kapsamında kamu kurum ve kuruluşları</li>
                                    <li>Hukuki süreçler için yetkili merciler</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-2">6.2. Yurt Dışı Aktarımlar</h3>
                                <ul className="list-disc list-inside space-y-1">
                                    <li><strong>Stripe (ABD):</strong> Ödeme işlemleri - GDPR uyumlu</li>
                                    <li><strong>Google Cloud (ABD/Avrupa):</strong> AI servisleri ve veri depolama - GDPR uyumlu</li>
                                    <li><strong>Supabase (ABD):</strong> Veritabanı hizmetleri - GDPR uyumlu</li>
                                </ul>
                                <p className="mt-2">
                                    Yurt dışına veri aktarımları, KVKK'nın 9. maddesi ve ilgili mevzuat kapsamında,
                                    yeterli koruma sağlayan veya uygun güvenceler bulunan ülkelere yapılmaktadır.
                                </p>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className={`text-2xl font-bold ${textClass} mb-4`}>7. Kişisel Veri Sahibinin Hakları (KVKK Madde 11)</h2>
                        <p className={secondaryTextClass}>
                            KVKK'nın 11. maddesi uyarınca, veri sahibi olarak aşağıdaki haklara sahipsiniz:
                        </p>
                        <ul className={`list-disc list-inside ${secondaryTextClass} mt-2 space-y-2`}>
                            <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
                            <li>Kişisel verileriniz işlenmişse buna ilişkin bilgi talep etme</li>
                            <li>Kişisel verilerinizin işlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme</li>
                            <li>Yurt içinde veya yurt dışında kişisel verilerinizin aktarıldığı üçüncü kişileri bilme</li>
                            <li>Kişisel verilerinizin eksik veya yanlış işlenmiş olması hâlinde bunların düzeltilmesini isteme</li>
                            <li>KVKK'nın 7. maddesinde öngörülen şartlar çerçevesinde kişisel verilerinizin silinmesini veya yok edilmesini isteme</li>
                            <li>Düzeltme, silme ve yok edilme işlemlerinin, kişisel verilerin aktarıldığı üçüncü kişilere bildirilmesini isteme</li>
                            <li>İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme</li>
                            <li>Kişisel verilerinizin kanuna aykırı olarak işlenmesi sebebiyle zarara uğramanız hâlinde zararın giderilmesini talep etme</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className={`text-2xl font-bold ${textClass} mb-4`}>8. Haklarınızı Kullanma Yöntemi</h2>
                        <p className={secondaryTextClass}>
                            Yukarıda belirtilen haklarınızı kullanmak için aşağıdaki yöntemlerle başvurabilirsiniz:
                        </p>
                        <ul className={`list-disc list-inside ${secondaryTextClass} mt-2 space-y-2`}>
                            <li><strong>E-posta:</strong> <a href="mailto:info@fasheone.com" className="text-cyan-500 hover:underline">info@fasheone.com</a> adresine yazılı başvuru</li>
                            <li><strong>Başvuru Formu:</strong> Web sitemizde yer alan KVKK başvuru formunu doldurarak</li>
                        </ul>
                        <p className={`${secondaryTextClass} mt-4`}>
                            Başvurularınız, talebin niteliğine göre en geç 30 gün içinde ücretsiz olarak sonuçlandırılacaktır.
                            İşlemin ayrıca bir maliyeti gerektirmesi hâlinde, Kişisel Verileri Koruma Kurulu tarafından
                            belirlenen tarifedeki ücret alınabilir.
                        </p>
                    </section>

                    <section>
                        <h2 className={`text-2xl font-bold ${textClass} mb-4`}>9. Veri Saklama Süreleri</h2>
                        <p className={secondaryTextClass}>
                            Kişisel verileriniz, işlenme amacının gerektirdiği süre boyunca ve ilgili mevzuatta öngörülen
                            saklama süreleri dikkate alınarak saklanmaktadır:
                        </p>
                        <ul className={`list-disc list-inside ${secondaryTextClass} mt-2 space-y-2`}>
                            <li><strong>Hesap Bilgileri:</strong> Hesap aktif olduğu sürece + 1 yıl</li>
                            <li><strong>İşlem Kayıtları:</strong> Vergi mevzuatı gereği 10 yıl</li>
                            <li><strong>Oluşturulan İçerikler:</strong> Hesap aktif olduğu sürece (kullanıcı tarafından silinebilir)</li>
                            <li><strong>Log Kayıtları:</strong> 2 yıl</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className={`text-2xl font-bold ${textClass} mb-4`}>10. Veri Güvenliği</h2>
                        <p className={secondaryTextClass}>
                            Kişisel verilerinizin güvenliğini sağlamak için KVKK'nın 12. maddesi uyarınca gerekli
                            teknik ve idari tedbirler alınmıştır:
                        </p>
                        <ul className={`list-disc list-inside ${secondaryTextClass} mt-2 space-y-2`}>
                            <li>SSL/TLS şifreleme ile güvenli veri iletimi</li>
                            <li>Veritabanı şifreleme</li>
                            <li>Erişim kontrolü ve yetkilendirme sistemleri</li>
                            <li>Düzenli güvenlik denetimleri ve güncellemeleri</li>
                            <li>Personel eğitimleri ve gizlilik taahhütleri</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className={`text-2xl font-bold ${textClass} mb-4`}>11. İletişim</h2>
                        <p className={secondaryTextClass}>
                            KVKK kapsamındaki haklarınız ve bu aydınlatma metni hakkında sorularınız için:
                        </p>
                        <ul className={`list-none ${secondaryTextClass} mt-2 space-y-2`}>
                            <li><strong>E-posta:</strong> <a href="mailto:info@fasheone.com" className="text-cyan-500 hover:underline">info@fasheone.com</a></li>
                            <li><strong>Web:</strong> <a href="https://fasheone.com" className="text-cyan-500 hover:underline">fasheone.com</a></li>
                        </ul>
                    </section>

                    <section className="mt-8 pt-6 border-t border-slate-700">
                        <p className={`${secondaryTextClass} text-sm italic`}>
                            Bu aydınlatma metni, 6698 sayılı Kişisel Verilerin Korunması Kanunu'nun 10. maddesi
                            ve Aydınlatma Yükümlülüğünün Yerine Getirilmesinde Uyulacak Usul ve Esaslar Hakkında
                            Tebliğ kapsamında hazırlanmıştır.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
};
