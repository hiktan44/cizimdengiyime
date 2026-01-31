import React from 'react';

interface PrivacyPolicyPageProps {
    onNavigateHome: () => void;
    theme?: 'light' | 'dark';
}

export const PrivacyPolicyPage: React.FC<PrivacyPolicyPageProps> = ({ onNavigateHome, theme = 'dark' }) => {
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
                    <h1 className={`text-4xl font-bold ${textClass} mb-4`}>Gizlilik Politikası</h1>
                    <p className={secondaryTextClass}>Son Güncelleme: 31 Ocak 2026</p>
                </div>

                {/* Content */}
                <div className={`${cardBg} border rounded-2xl p-8 space-y-6`}>
                    <section>
                        <h2 className={`text-2xl font-bold ${textClass} mb-4`}>1. Veri Sorumlusu</h2>
                        <p className={secondaryTextClass}>
                            Fasheone olarak, 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") kapsamında veri sorumlusuyuz.
                            Kişisel verileriniz tarafımızca işlenmekte ve korunmaktadır.
                        </p>
                    </section>

                    <section>
                        <h2 className={`text-2xl font-bold ${textClass} mb-4`}>2. Toplanan Kişisel Veriler</h2>
                        <p className={secondaryTextClass}>Platformumuzda aşağıdaki kişisel veriler toplanmaktadır:</p>
                        <ul className={`list-disc list-inside ${secondaryTextClass} mt-2 space-y-2`}>
                            <li><strong>Kimlik Bilgileri:</strong> Ad, soyad, e-posta adresi</li>
                            <li><strong>İletişim Bilgileri:</strong> E-posta adresi, telefon numarası (isteğe bağlı)</li>
                            <li><strong>İşlem Bilgileri:</strong> Ödeme bilgileri (Stripe üzerinden güvenli şekilde işlenir)</li>
                            <li><strong>Kullanım Verileri:</strong> IP adresi, tarayıcı bilgisi, çerez verileri</li>
                            <li><strong>İçerik Verileri:</strong> Yüklediğiniz görseller ve oluşturduğunuz AI içerikleri</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className={`text-2xl font-bold ${textClass} mb-4`}>3. Verilerin İşlenme Amacı</h2>
                        <p className={secondaryTextClass}>Kişisel verileriniz aşağıdaki amaçlarla işlenmektedir:</p>
                        <ul className={`list-disc list-inside ${secondaryTextClass} mt-2 space-y-2`}>
                            <li>Platformumuzun sunduğu AI hizmetlerini sağlamak</li>
                            <li>Kullanıcı hesabınızı yönetmek ve kimlik doğrulaması yapmak</li>
                            <li>Ödeme işlemlerini gerçekleştirmek</li>
                            <li>Müşteri desteği sağlamak</li>
                            <li>Hizmet kalitesini iyileştirmek ve kullanıcı deneyimini geliştirmek</li>
                            <li>Yasal yükümlülüklerimizi yerine getirmek</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className={`text-2xl font-bold ${textClass} mb-4`}>4. Verilerin Paylaşımı</h2>
                        <p className={secondaryTextClass}>Kişisel verileriniz aşağıdaki taraflarla paylaşılabilir:</p>
                        <ul className={`list-disc list-inside ${secondaryTextClass} mt-2 space-y-2`}>
                            <li><strong>Ödeme Altyapısı:</strong> Stripe (ödeme işlemleri için)</li>
                            <li><strong>Cloud Hizmetleri:</strong> Supabase, Google Cloud (veri depolama için)</li>
                            <li><strong>AI Servisleri:</strong> Google AI (görsel ve video işleme için)</li>
                            <li><strong>Analitik Araçları:</strong> Google Analytics (kullanım istatistikleri için)</li>
                        </ul>
                        <p className={`${secondaryTextClass} mt-4`}>
                            Verileriniz, yasal zorunluluklar dışında üçüncü taraflarla paylaşılmaz veya satılmaz.
                        </p>
                    </section>

                    <section>
                        <h2 className={`text-2xl font-bold ${textClass} mb-4`}>5. Veri Saklama Süresi</h2>
                        <p className={secondaryTextClass}>
                            Kişisel verileriniz, işlenme amacının gerektirdiği süre boyunca ve yasal saklama yükümlülüklerimiz
                            kapsamında saklanır. Hesabınızı sildiğinizde, verileriniz 30 gün içinde sistemlerimizden kalıcı olarak silinir.
                        </p>
                    </section>

                    <section>
                        <h2 className={`text-2xl font-bold ${textClass} mb-4`}>6. Veri Güvenliği</h2>
                        <p className={secondaryTextClass}>
                            Kişisel verilerinizin güvenliğini sağlamak için endüstri standardı güvenlik önlemleri alıyoruz:
                        </p>
                        <ul className={`list-disc list-inside ${secondaryTextClass} mt-2 space-y-2`}>
                            <li>SSL/TLS şifreleme ile güvenli veri iletimi</li>
                            <li>Şifrelenmiş veri depolama</li>
                            <li>Düzenli güvenlik denetimleri</li>
                            <li>Erişim kontrolü ve yetkilendirme sistemleri</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className={`text-2xl font-bold ${textClass} mb-4`}>7. Kullanıcı Hakları (KVKK Madde 11)</h2>
                        <p className={secondaryTextClass}>KVKK kapsamında aşağıdaki haklara sahipsiniz:</p>
                        <ul className={`list-disc list-inside ${secondaryTextClass} mt-2 space-y-2`}>
                            <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
                            <li>İşlenmişse buna ilişkin bilgi talep etme</li>
                            <li>İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme</li>
                            <li>Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme</li>
                            <li>Verilerin eksik veya yanlış işlenmiş olması halinde düzeltilmesini isteme</li>
                            <li>Verilerin silinmesini veya yok edilmesini isteme</li>
                            <li>İşlenen verilerin münhasıran otomatik sistemler ile analiz edilmesi nedeniyle aleyhinize bir sonuç doğması halinde itiraz etme</li>
                        </ul>
                        <p className={`${secondaryTextClass} mt-4`}>
                            Bu haklarınızı kullanmak için <a href="mailto:info@fasheone.com" className="text-cyan-500 hover:underline">info@fasheone.com</a> adresinden bizimle iletişime geçebilirsiniz.
                        </p>
                    </section>

                    <section>
                        <h2 className={`text-2xl font-bold ${textClass} mb-4`}>8. Çerezler (Cookies)</h2>
                        <p className={secondaryTextClass}>
                            Platformumuz, kullanıcı deneyimini iyileştirmek için çerezler kullanmaktadır. Detaylı bilgi için
                            Çerez Politikamızı inceleyebilirsiniz.
                        </p>
                    </section>

                    <section>
                        <h2 className={`text-2xl font-bold ${textClass} mb-4`}>9. Değişiklikler</h2>
                        <p className={secondaryTextClass}>
                            Bu Gizlilik Politikası zaman zaman güncellenebilir. Önemli değişiklikler olduğunda, e-posta yoluyla
                            bilgilendirileceksiniz.
                        </p>
                    </section>

                    <section>
                        <h2 className={`text-2xl font-bold ${textClass} mb-4`}>10. İletişim</h2>
                        <p className={secondaryTextClass}>
                            Gizlilik politikamız hakkında sorularınız için:
                        </p>
                        <ul className={`list-none ${secondaryTextClass} mt-2 space-y-2`}>
                            <li><strong>E-posta:</strong> <a href="mailto:info@fasheone.com" className="text-cyan-500 hover:underline">info@fasheone.com</a></li>
                            <li><strong>Web:</strong> <a href="https://fasheone.com" className="text-cyan-500 hover:underline">fasheone.com</a></li>
                        </ul>
                    </section>
                </div>
            </div>
        </div>
    );
};
