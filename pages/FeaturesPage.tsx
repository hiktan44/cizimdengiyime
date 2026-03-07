/**
 * FeaturesPage - Tüm Özellikler Sayfası
 * Landing page'deki özellikleri ayrı, detaylı bir sayfada gösterir.
 */

import React, { useState } from 'react';
import { useI18n } from '../lib/i18n';
import { Logo } from '../components/Logo';

interface FeaturesPageProps {
    onNavigateHome: () => void;
    onGetStarted: () => void;
    isLoggedIn: boolean;
}

// Özellik veri yapısı
interface FeatureItem {
    key: string;
    icon: React.ReactNode;
    gradient: string;
    shadowColor: string;
    accentColor: string;
    hoverBorder: string;
}

export const FeaturesPage: React.FC<FeaturesPageProps> = ({
    onNavigateHome,
    onGetStarted,
    isLoggedIn,
}) => {
    const { language } = useI18n();
    const [activeFilter, setActiveFilter] = useState<string>('all');

    const t = language === 'tr' ? {
        pageTitle: 'Tüm Özellikler',
        pageSubtitle: 'Fasheone AI ile moda tasarımlarınızı bir üst seviyeye taşıyın',
        backToHome: '← Ana Sayfa',
        getStarted: isLoggedIn ? 'Hemen Kullan' : 'Ücretsiz Deneyin',
        filterAll: 'Tümü',
        filterDesign: 'Tasarım',
        filterAI: 'Yapay Zeka',
        filterMarketing: 'Pazarlama',
        ctaTitle: 'Hemen Başlayın',
        ctaDesc: 'Tüm bu güçlü özellikleri ücretsiz deneyin. Moda tasarımlarınızı AI ile dönüştürün.',
        features: {
            pixshop: {
                title: 'Pixshop (Yapay Zeka Fotoğraf Düzenleme)',
                desc: 'Karmaşık araçlara veda edin. Yapay zeka ile sadece ne istediğinizi söyleyin, Pixshop saniyeler içinde gerçeğe dönüştürsün.',
                features: ['Akıllı Rötuş: Tıkla ve Değiştir', 'Sınırsız Yaratıcı Filtreler', 'Profesyonel Atmosfer Ayarları', 'Kristal Netliğinde Detaylar (Upscale)', 'Yüz Değiştirme (Face Swap)', 'Arka Plan Kaldırma ve SVG Çıktı'],
                category: 'design',
                detailDesc: '⚡ Zaman Kazanın: Saatler süren manuel düzenleme işlemlerini saniyelere indirin. 🎯 Teknik Bilgi Gerektirmez: Photoshop bilmenize gerek yok, sadece yazmanız yeterli. 🎨 Tam Kontrol: Geri al/İleri al özellikleri ve "Karşılaştır" moduyla düzenlemenin her aşamasını kontrol edin. 📱 Esnek Kırpma: Sosyal medya standartlarına (9:16, 1:1, 4:3) uygun akıllı kırpma ve döndürme araçları.',
            },
            adGenius: {
                title: 'AdGenius AI',
                desc: 'Sıradan bir ürün fotoğrafını saniyeler içinde profesyonel bir pazarlama varlığına dönüştüren, uçtan uca bir prodüksiyon çözümü.',
                features: ['Akıllı Ürün Analizi ve İçerik Yazımı (SEO Uyumlu)', 'Profesyonel Mankenli Çekimler (12 Farklı Poz)', 'Sınırsız Kampanya Konseptleri ve Mekan Özgürlüğü', 'Gelişmiş Doku ve Renk Manipülasyonu', 'Sinematik Reklam Videoları', 'Marka ve Metin Entegrasyonu (Logo Yerleştirme)'],
                category: 'marketing',
                detailDesc: `💰 %90'a Varan Maliyet Tasarrufu: Işık, kamera ekipmanı, manken, makyaj artisti, stüdyo kirası ve metin yazarı maliyetlerini ortadan kaldırır. ⚡ "Hemen Yükle, Hemen Sat": Haftalar süren süreç; AdGenius ile ürünün fotoğrafını yüklediğiniz anda görsel + video + başlık + açıklama setine sahip olursunuz.`,
            },
            collage: {
                title: 'Kolaj Stüdyosu',
                desc: 'Birden fazla görseli saniyeler içinde profesyonel kolajlara dönüştürün. AI destekli kompozisyon motoru, görsellerinizi otomatik olarak analiz eder.',
                features: ['Standart Katalog Kolajı (2-6 görsel)', 'Sihirli Kolaj (Profesyonel Flat Lay, Otomatik Ayrıştırma)', 'Ürün Kolajı (Estetik Kompozisyon)', 'Dinamik Sosyal Medya Videolarına (Reels, TikTok) Dönüşüm'],
                category: 'marketing',
                detailDesc: '✅ E-Ticaret Katalogları: Ürün varyasyonlarını tek bir görselde sergileyin. ✅ Sosyal Medya: Instagram grid postları ve Pinterest panoları için profesyonel kolajlar. ✅ Lookbook Hazırlama: Koleksiyon lansmanları için etkileyici sayfalar.',
            },
            fotomatik: {
                title: 'Fotomatik',
                desc: 'Bağlamsal Görsel Dönüşüm, Derinlemesine Görsel Analiz, Akıllı İyileştirme ve Hassas Manuel Editör ile stüdyo kalitesinde düzenleme.',
                features: ['Bağlamsal Görsel Dönüşüm (AI Transform)', 'Derinlemesine Görsel Analiz ve Prompt Mühendisliği', 'Akıllı İyileştirme (AI Auto-Enhance)', 'Hassas Manuel Editör (Kırpma, Yeniden Boyutlandırma)'],
                category: 'ai',
                detailDesc: 'Yüklenen bir resmi sanatsal ve teknik açıdan analiz ederek Midjourney, Stable Diffusion ve Flux gibi platformlar için optimize edilmiş profesyonel istemler (promptlar) üretir. Histogram analizi ile parlaklık, kontrast ve renk dengesini sinematik veya canlı modlarda otomatik optimize eder.',
            },
            techpack: {
                title: 'Teknik Çizim (Tech Pack)',
                desc: 'Üretim sürecinizi hızlandırın. Fotoğraflarınızı saniyeler içinde detaylı teknik çizimlere dönüştürün.',
                features: ['Yüklenen fotoğraftan direkt dikiş korumalı çizim', 'Dikiş ve Kalıp Analizi (Yapay Zeka Algılaması)', 'Üretime Hazır Çıktılar (Karmaşadan uzak saf teknik)', 'Aynı model için Sınırsız Varyasyon oluşturma'],
                category: 'design',
                detailDesc: 'Tedarikçileriniz ve atölyelerinizle paylaşabileceğiniz, karmaşadan uzak, saf teknik çizimler elde edin. Ürün üzerindeki dikiş yollarını ve kalıp parçalarını otomatik olarak algılayarak endüstri standardında net çizgilerle sunar.',
            },
        }
    } : {
        pageTitle: 'All Features',
        pageSubtitle: 'Take your fashion designs to the next level with Fasheone AI',
        backToHome: '← Home',
        getStarted: isLoggedIn ? 'Start Using' : 'Try Free',
        filterAll: 'All',
        filterDesign: 'Design',
        filterAI: 'AI',
        filterMarketing: 'Marketing',
        ctaTitle: 'Get Started Today',
        ctaDesc: 'Try all these powerful features for free. Transform your fashion designs with AI.',
        features: {
            pixshop: {
                title: 'Pixshop (AI Photo Editing)',
                desc: 'Say goodbye to complex tools. Just tell the AI what you want, and Pixshop turns it directly into reality in seconds.',
                features: ['Smart Retouching: Click & Replace', 'Unlimited Creative Filters', 'Professional Atmosphere Adjustments', 'Crystal Clear Enhancement (Upscale)', 'Realistic Face Swap', 'Background Removal & SVG Export'],
                category: 'design',
                detailDesc: '⚡ Save Time: Reduce hours of manual editing to seconds. 🎯 No Technical Skills Needed: No Photoshop knowledge necessary, just type. 🎨 Full Control: Undo/Redo and "Compare" modes for full editing control. 📱 Flexible Cropping: Social media ready aspect ratios.',
            },
            adGenius: {
                title: 'AdGenius AI',
                desc: 'An end-to-end production solution that transforms an ordinary product photo into a professional marketing asset in seconds.',
                features: ['Smart Analysis & Copywriting (SEO)', 'Professional Model Shoots (12 Poses)', 'Unlimited Campaign Concepts & Locations', 'Advanced Texture & Color Manipulation', 'Cinematic Ad Videos', 'Brand & Text Integration (Logo Placement)'],
                category: 'marketing',
                detailDesc: '💰 Save up to 90%: Eliminates costs for lighting, studio, models, makeup, and copywriters. ⚡ "Upload & Sell": Instantly get a full visual + video + title + description set ready to publish the moment you upload your product.',
            },
            collage: {
                title: 'Collage Studio',
                desc: 'Transform multiple visuals into professional collages instantly. The AI composition engine automatically analyzes and arranges.',
                features: ['Standard Catalog Collage (2-6 images)', 'Magic Collage (Professional Flat Lay, Auto Extraction)', 'Product Collage (Aesthetic Composition)', 'Dynamic Social Media Videos (Reels, TikTok)'],
                category: 'marketing',
                detailDesc: '✅ E-Commerce Catalogs: Showcase product variations in one visual. ✅ Social Media Content: Professional grid posts and Pinterest boards. ✅ Lookbook Creation: Stunning catalog pages for your collection launches.',
            },
            fotomatik: {
                title: 'Fotomatik',
                desc: 'Contextual Image Transformation, In-depth Analysis, Smart Enhancement, and Precise Manual Editing.',
                features: ['Contextual AI Transformation', 'Deep Visual Analysis & Prompt Engineering', 'AI Auto-Enhance (Histogram Optimization)', 'Precise Manual Editor (Crop, Resize)'],
                category: 'ai',
                detailDesc: 'Analyzes any uploaded image to generate professional prompts for Midjourney, Stable Diffusion, and Flux. Automatically optimizes brightness, contrast, and color balance to "cinematic" or "vibrant" moods using advanced histogram analysis.',
            },
            techpack: {
                title: 'Technical Drawing (Tech Pack)',
                desc: 'Accelerate your production process. Transform product photos into detailed technical drawings in seconds.',
                features: ['Photo to Tech Pack conversion', 'Stitching & Pattern Analysis (AI Detection)', 'Production-Ready Outputs', 'Unlimited Variations for identical models'],
                category: 'design',
                detailDesc: 'Get clean, production-ready technical drawings to share with suppliers and workshops without any clutter. The AI accurately detects seam paths and pattern blocks to deliver industry standard line-art.',
            },
        }
    };

    // Özellik kartları yapılandırması
    const featureItems: FeatureItem[] = [
        { key: 'pixshop', icon: <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>, gradient: 'from-orange-400 to-red-600', shadowColor: 'hover:shadow-orange-500/50', accentColor: 'text-orange-500', hoverBorder: 'hover:border-orange-500/50' },
        { key: 'adGenius', icon: <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>, gradient: 'from-pink-400 to-rose-600', shadowColor: 'hover:shadow-pink-500/50', accentColor: 'text-pink-500', hoverBorder: 'hover:border-pink-500/50' },
        { key: 'collage', icon: <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z" /></svg>, gradient: 'from-cyan-400 to-blue-600', shadowColor: 'hover:shadow-cyan-500/50', accentColor: 'text-cyan-500', hoverBorder: 'hover:border-cyan-500/50' },
        { key: 'fotomatik', icon: <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" /></svg>, gradient: 'from-teal-400 to-cyan-600', shadowColor: 'hover:shadow-teal-500/50', accentColor: 'text-teal-500', hoverBorder: 'hover:border-teal-500/50' },
        { key: 'techpack', icon: <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>, gradient: 'from-green-400 to-emerald-600', shadowColor: 'hover:shadow-green-500/50', accentColor: 'text-green-500', hoverBorder: 'hover:border-green-500/50' },
    ];

    const featureData = t.features as Record<string, any>;

    const filteredFeatures = activeFilter === 'all'
        ? featureItems
        : featureItems.filter(f => featureData[f.key]?.category === activeFilter);

    const filterCategories = [
        { key: 'all', label: t.filterAll },
        { key: 'design', label: t.filterDesign },
        { key: 'ai', label: t.filterAI },
        { key: 'marketing', label: t.filterMarketing },
    ];

    return (
        <div className="min-h-screen bg-slate-900 text-white">
            {/* Header */}
            <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-900/80 border-b border-white/10">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <button
                        onClick={onNavigateHome}
                        className="text-slate-400 hover:text-white transition-colors font-medium flex items-center gap-2"
                    >
                        {t.backToHome}
                    </button>
                    <div className="flex items-center gap-3">
                        <button onClick={onNavigateHome} className="hover:opacity-80 transition-opacity">
                            <Logo className="h-10" theme="dark" />
                        </button>
                    </div>
                    <button
                        onClick={onGetStarted}
                        className="bg-gradient-to-r from-orange-500 to-pink-600 text-white px-6 py-2 rounded-xl font-semibold text-sm hover:shadow-lg hover:shadow-orange-500/30 transition-all transform hover:scale-105"
                    >
                        {t.getStarted}
                    </button>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative pt-20 pb-12 px-6 overflow-hidden">
                {/* Animated background */}
                <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900" />
                <div className="absolute top-20 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute top-40 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

                <div className="relative max-w-4xl mx-auto text-center">
                    <h1 className="text-5xl md:text-7xl font-black mb-6 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                        {t.pageTitle}
                    </h1>
                    <p className="text-xl md:text-2xl text-slate-400 max-w-2xl mx-auto">
                        {t.pageSubtitle}
                    </p>
                </div>
            </section>

            {/* Filter Tabs */}
            <section className="px-6 pb-8">
                <div className="max-w-7xl mx-auto flex justify-center">
                    <div className="inline-flex bg-slate-800/60 rounded-2xl p-1.5 border border-white/10 gap-1">
                        {filterCategories.map(cat => (
                            <button
                                key={cat.key}
                                onClick={() => setActiveFilter(cat.key)}
                                className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 ${activeFilter === cat.key
                                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="px-6 pb-20">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredFeatures.map((item, idx) => {
                            const data = featureData[item.key];
                            if (!data) return null;

                            return (
                                <div
                                    key={item.key}
                                    className={`group relative rounded-3xl p-8 bg-slate-800/50 backdrop-blur-xl border border-white/10 ${item.hoverBorder} ${item.shadowColor} shadow-xl transition-all duration-500 hover:-translate-y-3 hover:scale-[1.02]`}
                                    style={{ animationDelay: `${idx * 100}ms` }}
                                >
                                    {/* Glow */}
                                    <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />

                                    <div className="relative z-10">
                                        {/* Icon */}
                                        <div className={`w-20 h-20 bg-gradient-to-br ${item.gradient} rounded-3xl flex items-center justify-center mb-6 shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                                            {item.icon}
                                        </div>

                                        {/* Title */}
                                        <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-slate-300 group-hover:bg-clip-text transition-all">
                                            {data.title}
                                        </h3>

                                        {/* Description */}
                                        <p className="text-slate-300 leading-relaxed mb-4 text-sm">
                                            {data.detailDesc || data.desc}
                                        </p>

                                        {/* Features list */}
                                        <ul className="space-y-2.5">
                                            {data.features.map((feature: string, fidx: number) => (
                                                <li key={fidx} className="flex items-start gap-2.5 text-sm">
                                                    <span className={`${item.accentColor} mt-0.5 flex-shrink-0`}>✓</span>
                                                    <span className="text-slate-300">{feature}</span>
                                                </li>
                                            ))}
                                        </ul>

                                        {/* Category badge */}
                                        <div className="mt-6 pt-4 border-t border-white/10">
                                            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-gradient-to-r ${item.gradient} bg-opacity-20 text-white/90`}>
                                                {data.category === 'design' ? '🎨' : data.category === 'ai' ? '🤖' : '📈'}
                                                {data.category === 'design' ? (language === 'tr' ? 'Tasarım' : 'Design') : data.category === 'ai' ? (language === 'tr' ? 'Yapay Zeka' : 'AI') : (language === 'tr' ? 'Pazarlama' : 'Marketing')}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ===== DETAYLI BÖLÜMLER ===== */}

            {/* Pixshop Detailed Section */}
            <section className="px-6 pb-20">
                <div className="max-w-7xl mx-auto">
                    <div className="rounded-3xl overflow-hidden bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 p-8 md:p-12">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-600 rounded-2xl flex items-center justify-center shadow-2xl">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-3xl font-bold text-white">Pixshop</h3>
                                <p className="text-orange-300 text-sm">{language === 'tr' ? 'AI Destekli Fotoğraf Düzenleme' : 'AI-Powered Photo Editing'}</p>
                            </div>
                        </div>
                        <p className="text-slate-300 leading-relaxed mb-8 text-lg max-w-3xl">
                            {language === 'tr'
                                ? 'Karmaşık araçlara veda edin. Yapay zeka ile sadece ne istediğinizi söyleyin, Pixshop saniyeler içinde gerçeğe dönüştürsün. Photoshop bilgisi gerektirmez.'
                                : 'Say goodbye to complex tools. Just tell the AI what you want, and Pixshop transforms it into reality in seconds. No Photoshop knowledge needed.'}
                        </p>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {(language === 'tr'
                                ? ['🎨 Akıllı Rötuş: Tıkla ve Değiştir', '🖼️ Sınırsız Yaratıcı Filtreler', '🌟 Profesyonel Atmosfer Ayarları', '🔍 Kristal Netliğinde Detaylar (2K/4K Upscale)', '👤 Yüz Değiştirme (Face Swap)', '✂️ Arka Plan Kaldırma ve SVG Çıktı']
                                : ['🎨 Smart Retouching: Click & Replace', '🖼️ Unlimited Creative Filters', '🌟 Professional Atmosphere Adjustments', '🔍 Crystal Clear Enhancement (2K/4K Upscale)', '👤 Face Swap', '✂️ Background Removal & SVG Export']
                            ).map((feature, idx) => (
                                <div key={idx} className="bg-slate-800/60 rounded-xl p-4 border border-white/5 hover:border-orange-500/30 transition">
                                    <span className="text-sm text-slate-200">{feature}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* AdGenius Detailed Section */}
            <section className="px-6 pb-20">
                <div className="max-w-7xl mx-auto">
                    <div className="rounded-3xl overflow-hidden bg-gradient-to-br from-pink-500/10 to-rose-500/10 border border-pink-500/20 p-8 md:p-12">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-rose-600 rounded-2xl flex items-center justify-center shadow-2xl">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-3xl font-bold text-white">AdGenius AI</h3>
                                <p className="text-pink-300 text-sm">{language === 'tr' ? 'Reklam & Pazarlama Prodüksiyon Çözümü' : 'Ad & Marketing Production Solution'}</p>
                            </div>
                        </div>
                        <p className="text-slate-300 leading-relaxed mb-8 text-lg max-w-3xl">
                            {language === 'tr'
                                ? 'Sıradan bir ürün fotoğrafını saniyeler içinde profesyonel bir pazarlama varlığına dönüştüren, uçtan uca bir prodüksiyon çözümü. %90\'a varan maliyet tasarrufu sağlayın.'
                                : 'An end-to-end production solution that transforms an ordinary product photo into a professional marketing asset in seconds. Save up to 90% on costs.'}
                        </p>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {(language === 'tr'
                                ? ['📝 Akıllı Ürün Analizi ve SEO İçerik', '👗 12 Farklı Poz ile Mankenli Çekim', '🏖️ Sınırsız Kampanya Konseptleri', '🎨 Gelişmiş Doku ve Renk Manipülasyonu', '🎬 Sinematik Reklam Videoları', '🏷️ Logo ve Metin Entegrasyonu']
                                : ['📝 Smart Product Analysis & SEO Copy', '👗 12-Pose Professional Model Shoots', '🏖️ Unlimited Campaign Concepts', '🎨 Advanced Texture & Color Manipulation', '🎬 Cinematic Ad Videos', '🏷️ Logo & Text Integration']
                            ).map((feature, idx) => (
                                <div key={idx} className="bg-slate-800/60 rounded-xl p-4 border border-white/5 hover:border-pink-500/30 transition">
                                    <span className="text-sm text-slate-200">{feature}</span>
                                </div>
                            ))}
                        </div>
                        <div className="mt-8 grid md:grid-cols-2 gap-6">
                            <div className="bg-slate-800/40 rounded-xl p-6 border border-pink-500/10">
                                <h4 className="text-pink-400 font-bold mb-3">{language === 'tr' ? '💰 Maliyet Avantajı' : '💰 Cost Advantage'}</h4>
                                <p className="text-slate-400 text-sm leading-relaxed">
                                    {language === 'tr'
                                        ? 'Işık, kamera, manken, makyaj artisti, stüdyo kirası ve metin yazarı maliyetlerini ortadan kaldırır.'
                                        : 'Eliminates costs for lighting, cameras, models, makeup artists, studio rental, and copywriters.'}
                                </p>
                            </div>
                            <div className="bg-slate-800/40 rounded-xl p-6 border border-pink-500/10">
                                <h4 className="text-pink-400 font-bold mb-3">{language === 'tr' ? '⚡ Hız Avantajı' : '⚡ Speed Advantage'}</h4>
                                <p className="text-slate-400 text-sm leading-relaxed">
                                    {language === 'tr'
                                        ? 'Haftalar süren süreç yerine, ürün fotoğrafını yüklediğiniz anda görsel + video + başlık + açıklama setine sahip olursunuz.'
                                        : 'Instead of weeks-long processes, get a complete visual + video + title + description set the moment you upload your product photo.'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Techpack Detailed Section */}
            <section className="px-6 pb-20">
                <div className="max-w-7xl mx-auto">
                    <div className="rounded-3xl overflow-hidden bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 p-8 md:p-12">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl flex items-center justify-center shadow-2xl">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-3xl font-bold text-white">{language === 'tr' ? 'Teknik Çizim (Tech Pack)' : 'Technical Drawing (Tech Pack)'}</h3>
                                <p className="text-green-300 text-sm">{language === 'tr' ? 'Üretim Sürecinizi Hızlandırın' : 'Accelerate Your Production Process'}</p>
                            </div>
                        </div>
                        <p className="text-slate-300 leading-relaxed mb-8 text-lg max-w-3xl">
                            {language === 'tr'
                                ? 'Fotoğraflarınızı saniyeler içinde detaylı teknik çizimlere dönüştürün. Tedarikçileriniz ve atölyelerinizle paylaşabileceğiniz, karmaşadan uzak, saf teknik çizimler elde edin.'
                                : 'Transform your photos into detailed technical drawings in seconds. Get clean, production-ready technical drawings to share with suppliers and workshops.'}
                        </p>
                        <div className="grid md:grid-cols-2 gap-6">
                            {(language === 'tr'
                                ? ['📐 Fotoğraftan direkt dikiş korumalı çizim', '🧵 Dikiş ve Kalıp Analizi (AI Algılama)', '📋 Üretime Hazır Çıktılar', '🔄 Aynı model için Sınırsız Varyasyon']
                                : ['📐 Photo to stitch-protected technical drawing', '🧵 Stitching & Pattern Analysis (AI Detection)', '📋 Production-Ready Outputs', '🔄 Unlimited Variations for same model']
                            ).map((feature, idx) => (
                                <div key={idx} className="bg-slate-800/60 rounded-xl p-4 border border-white/5 hover:border-green-500/30 transition">
                                    <span className="text-sm text-slate-200">{feature}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <section className="px-6 pb-20">
                <div className="max-w-4xl mx-auto">
                    <div className="relative rounded-3xl overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600" />
                        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyem0wLTR2Mkgy NHYtMmgxMnptMC00djJIMjR2LTJoMTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
                        <div className="relative p-12 md:p-16 text-center">
                            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
                                {t.ctaTitle}
                            </h2>
                            <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">
                                {t.ctaDesc}
                            </p>
                            <button
                                onClick={onGetStarted}
                                className="bg-white text-slate-900 px-10 py-4 rounded-2xl font-bold text-lg hover:shadow-2xl hover:shadow-white/20 transition-all transform hover:scale-105"
                            >
                                {t.getStarted} →
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};
