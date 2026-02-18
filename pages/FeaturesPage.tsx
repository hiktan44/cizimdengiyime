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
            feature1: {
                title: 'Çizimden Ürüne',
                desc: 'Moda çizimlerinizi ultra-gerçekçi hayalet manken ürün fotoğraflarına dönüştürün. Basit karakalem veya dijital teknik çizimlerinizi yükleyin, yapay zeka kumaş, dikiş ve detayları algılayarak profesyonel ürün görselleri oluşturun.',
                features: ['Otomatik kumaş doku ve renk analizi', 'Dikiş ve detay korumalı dönüşüm', 'Stüdyo kalitesinde ışıklandırma', 'E-ticaret için optimize edilmiş çıktılar'],
                category: 'design',
                detailDesc: 'El çizimlerinizi veya teknik tasarımlarınızı yüklemeniz yeterli. AI motorumuz kumaş dokusunu, renk tonlarını, fermuarları ve düğmeleri analiz ederek profesyonel stüdyo kalitesinde ürün fotoğrafları oluşturur.',
            },
            feature2: {
                title: 'Canlı Model',
                desc: 'Ürünlerinizi gerçek modeller üzerinde görün. Farklı ten rengi, saç stili ve poz tipleriyle sahip yapay zeka modelleriyle stüdyo çekimi kalitesinde sonuçlar alın.',
                features: ['Çeşitli etnik köken ve vücut tipi seçenekleri', '12+ farklı profesyonel poz', 'Özelleştirilebilir arka plan ve mekan', 'Tutarlı model kullanımı ile marka kimliği'],
                category: 'ai',
                detailDesc: 'Fiziksel model çekimlerinin maliyetinden kurtulun. AI modellerimiz gerçek insan gibi görünen, profesyonel pozlarda ürünlerinizi sergiler. Ten rengi, boy, saç tipi ve poz seçenekleriyle markanıza uygun görseller yaratın.',
            },
            feature3: {
                title: 'Video Oluşturma',
                desc: 'Görsellerinizi 5-10 saniyelik profesyonel videolara dönüştürün. Sinematik kamera hareketleri, yavaş çekim ve sosyal medya formatlarını destekler.',
                features: ['Sinematik kamera hareketleri', 'Yavaş çekim (slow-motion) efektleri', 'Sosyal medya formatları (Reels, TikTok, Shorts)', 'Yüksek çözünürlük 2K/4K çıktı'],
                category: 'marketing',
                detailDesc: 'Tek bir ürün fotoğrafından etkileyici videolar oluşturun. Instagram Reels, TikTok ve YouTube Shorts için optimize edilmiş formatlar. Sinematik kamera açıları ve slow-motion efektleriyle içeriklerinizi profesyonelleştirin.',
            },
            feature4: {
                title: 'Teknik Çizim (Tech Pack)',
                desc: 'Ürün fotoğraflarından profesyonel teknik çizimler oluşturun. Ön ve arka görünüm, ölçü çizgileri ve detay etiketleri.',
                features: ['Ön ve arka görünüm çizimi', 'Detaylı ölçü çizgileri', 'Dikiş ve detay etiketleme', 'Üretim için hazır teknik doküman'],
                category: 'design',
                detailDesc: 'Üreticiye gönderilecek profesyonel teknik çizimler saniyeler içinde hazır. AI motorumuz ürünün ön ve arka görünümünü, tüm dikiş detaylarını ve ölçü noktalarını analiz ederek endüstri standardında tech pack oluşturur.',
            },
            feature5: {
                title: 'Pixshop',
                desc: 'Ürünlerinizi farklı ortamlarda ve mekanlarda sergileyerek profesyonel e-ticaret görselleri oluşturun.',
                features: ['Arka plan değiştirme ve düzenleme', 'Ürün yerleştirme (product placement)', 'Otomatik gölge ve yansıma', 'Toplu görsel işleme'],
                category: 'marketing',
                detailDesc: 'E-ticaret mağazanız için profesyonel ürün görselleri. Ürünlerinizi lüks mağaza vitrini, doğa, stüdyo veya özel mekanlar gibi farklı arka planlarda sergileyin. Otomatik gölge ve yansıma efektleriyle gerçekçi sonuçlar.',
            },
            feature6: {
                title: 'Fotomatik',
                desc: 'Görüntüleri yapay zeka ile düzenleyin, dönüştürün ve iyileştirin. Arka plan kaldırma, rötuş ve katalog hazırlama.',
                features: ['Arka plan kaldırma (one-click)', 'Profesyonel rötuş ve renk düzeltme', 'Katalog formatında çıktı', 'Toplu resim işleme'],
                category: 'ai',
                detailDesc: 'Fotoğraflarınızı profesyonel stüdyo kalitesine yükseltin. Tek tıkla arka plan kaldırma, otomatik renk düzeltme, rötuş ve katalog formatına dönüştürme. Toplu işleme özelliği ile yüzlerce görseli dakikalar içinde düzenleyin.',
            },
            collage: {
                title: 'Kolaj Oluşturma',
                desc: 'Ürün görsellerinizi profesyonel kolajlar halinde birleştirerek etkileyici katalog sayfaları oluşturun.',
                features: ['Otomatik yerleşim düzeni', 'Özelleştirilebilir şablonlar', 'Katalog sayfası formatı', 'Yüksek çözünürlük çıktı'],
                category: 'marketing',
                detailDesc: 'Katalog ve sosyal medya için etkileyici ürün kolajları. AI otomatik olarak en iyi yerleşim düzenini seçer, ürünlerinizi harmonik bir kompozisyonda birleştirir. Marka renklerinize uygun şablonlar kullanılabilir.',
            },
            adMedia: {
                title: 'Reklam Medyası (AdGenius)',
                desc: 'Profesyonel reklam görselleri ve kampanya materyalleri oluşturun. Facebook, Instagram, Google Ads formatları.',
                features: ['Platform bazlı boyut optimizasyonu', 'Logo ve metin yerleştirme', 'A/B test varyasyonları', 'Toplu reklam seti oluşturma'],
                category: 'marketing',
                detailDesc: 'Dijital reklam kampanyalarınız için AI destekli görsel üretim. Facebook, Instagram, Google Ads ve daha fazlası için optimize edilmiş boyutlarda reklam görselleri. Logo, metin ve CTA butonları otomatik yerleştirilir.',
            },
            ecommerce: {
                title: 'E-ticaret Çözümleri',
                desc: 'Trendyol, Hepsiburada ve uluslararası marketplacelar için optimum ürün görselleri oluşturun.',
                features: ['Marketplace uyumlu boyutlar', 'SEO dostu dosya isimlendirme', 'Toplu dışa aktarım', 'API entegrasyonu'],
                category: 'marketing',
                detailDesc: 'Trendyol, Hepsiburada, Amazon ve diğer marketplace\'ler için özel boyut ve formattaki görselleri tek tıkla oluşturun. SEO uyumlu dosya isimleri ve toplu export özelliği ile e-ticaret operasyonlarınızı hızlandırın.',
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
            feature1: {
                title: 'Sketch to Product',
                desc: 'Transform your fashion sketches into ultra-realistic ghost mannequin product photos. Upload simple pencil or digital technical drawings, and AI detects fabric, stitching, and details to create professional product visuals.',
                features: ['Automatic fabric texture & color analysis', 'Stitch and detail-preserving conversion', 'Studio-quality lighting', 'E-commerce optimized outputs'],
                category: 'design',
                detailDesc: 'Simply upload your hand drawings or technical designs. Our AI engine analyzes fabric texture, color tones, zippers, and buttons to create studio-quality product photos.',
            },
            feature2: {
                title: 'Live Model',
                desc: 'See your products on real models. Get studio-quality results with AI models featuring different skin tones, hair styles, and pose types.',
                features: ['Various ethnicity and body type options', '12+ different professional poses', 'Customizable backgrounds & settings', 'Consistent model usage for brand identity'],
                category: 'ai',
                detailDesc: 'Eliminate the cost of physical model shoots. Our AI models showcase your products in professional poses looking like real humans. Choose skin tone, height, hair type, and poses to match your brand.',
            },
            feature3: {
                title: 'Video Generation',
                desc: 'Convert your images into 5-10 second professional videos. Supports cinematic camera movements, slow motion, and social media formats.',
                features: ['Cinematic camera movements', 'Slow-motion effects', 'Social media formats (Reels, TikTok, Shorts)', 'High resolution 2K/4K output'],
                category: 'marketing',
                detailDesc: 'Create stunning videos from a single product photo. Optimized formats for Instagram Reels, TikTok, and YouTube Shorts. Professional cinematic camera angles and slow-motion effects.',
            },
            feature4: {
                title: 'Tech Pack',
                desc: 'Generate professional technical drawings from product photos. Front and back views, dimension lines, and detail labels.',
                features: ['Front & back view drawings', 'Detailed dimension lines', 'Stitch and detail labeling', 'Production-ready technical document'],
                category: 'design',
                detailDesc: 'Professional technical drawings ready to send to manufacturers in seconds. Our AI engine analyzes front and back views, all stitch details, and measurement points to create industry-standard tech packs.',
            },
            feature5: {
                title: 'Pixshop',
                desc: 'Create professional e-commerce visuals by showcasing your products in different environments and settings.',
                features: ['Background removal & editing', 'Product placement', 'Automatic shadows & reflections', 'Batch image processing'],
                category: 'marketing',
                detailDesc: 'Professional product visuals for your e-commerce store. Showcase products in luxury store fronts, nature, studios, or custom environments. Realistic results with automatic shadow and reflection effects.',
            },
            feature6: {
                title: 'Fotomatik',
                desc: 'Edit, transform, and enhance images with AI. Background removal, retouching, and catalog preparation.',
                features: ['One-click background removal', 'Professional retouching & color correction', 'Catalog format output', 'Batch image processing'],
                category: 'ai',
                detailDesc: 'Elevate your photos to professional studio quality. One-click background removal, automatic color correction, retouching, and catalog format conversion. Process hundreds of images in minutes with batch processing.',
            },
            collage: {
                title: 'Collage Generator',
                desc: 'Combine your product visuals into professional collages to create stunning catalog pages.',
                features: ['Automatic layout', 'Customizable templates', 'Catalog page format', 'High resolution output'],
                category: 'marketing',
                detailDesc: 'Stunning product collages for catalogs and social media. AI automatically selects the best layout, combining your products in harmonious compositions. Brand-matched templates available.',
            },
            adMedia: {
                title: 'Ad Media (AdGenius)',
                desc: 'Create professional ad visuals and campaign materials. Supports Facebook, Instagram, and Google Ads formats.',
                features: ['Platform-specific size optimization', 'Logo & text placement', 'A/B test variations', 'Bulk ad set creation'],
                category: 'marketing',
                detailDesc: 'AI-powered visual production for your digital ad campaigns. Ad visuals optimized for Facebook, Instagram, Google Ads, and more. Logos, text, and CTA buttons automatically placed.',
            },
            ecommerce: {
                title: 'E-commerce Solutions',
                desc: 'Create optimized product visuals for Trendyol, Hepsiburada, and international marketplaces.',
                features: ['Marketplace-compatible dimensions', 'SEO-friendly file naming', 'Bulk export', 'API integration'],
                category: 'marketing',
                detailDesc: 'Create marketplace-specific sized visuals with one click for Trendyol, Hepsiburada, Amazon, and more. Speed up e-commerce operations with SEO-friendly filenames and bulk export.',
            },
        }
    };

    // Özellik kartları yapılandırması
    const featureItems: FeatureItem[] = [
        { key: 'feature1', icon: <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>, gradient: 'from-cyan-400 to-blue-600', shadowColor: 'hover:shadow-cyan-500/50', accentColor: 'text-cyan-500', hoverBorder: 'hover:border-cyan-500/50' },
        { key: 'feature2', icon: <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>, gradient: 'from-purple-400 to-pink-600', shadowColor: 'hover:shadow-purple-500/50', accentColor: 'text-purple-500', hoverBorder: 'hover:border-purple-500/50' },
        { key: 'feature3', icon: <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>, gradient: 'from-blue-400 to-indigo-600', shadowColor: 'hover:shadow-blue-500/50', accentColor: 'text-blue-500', hoverBorder: 'hover:border-blue-500/50' },
        { key: 'feature4', icon: <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>, gradient: 'from-green-400 to-emerald-600', shadowColor: 'hover:shadow-green-500/50', accentColor: 'text-green-500', hoverBorder: 'hover:border-green-500/50' },
        { key: 'feature5', icon: <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>, gradient: 'from-orange-400 to-red-600', shadowColor: 'hover:shadow-orange-500/50', accentColor: 'text-orange-500', hoverBorder: 'hover:border-orange-500/50' },
        { key: 'feature6', icon: <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" /></svg>, gradient: 'from-teal-400 to-cyan-600', shadowColor: 'hover:shadow-teal-500/50', accentColor: 'text-teal-500', hoverBorder: 'hover:border-teal-500/50' },
        { key: 'collage', icon: <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z" /></svg>, gradient: 'from-cyan-400 to-blue-600', shadowColor: 'hover:shadow-cyan-500/50', accentColor: 'text-cyan-500', hoverBorder: 'hover:border-cyan-500/50' },
        { key: 'adMedia', icon: <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>, gradient: 'from-pink-400 to-rose-600', shadowColor: 'hover:shadow-pink-500/50', accentColor: 'text-pink-500', hoverBorder: 'hover:border-pink-500/50' },
        { key: 'ecommerce', icon: <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>, gradient: 'from-indigo-400 to-purple-600', shadowColor: 'hover:shadow-indigo-500/50', accentColor: 'text-indigo-500', hoverBorder: 'hover:border-indigo-500/50' },
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

            {/* CTA Section */}
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
