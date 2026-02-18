/**
 * BlogPage - Moda AI Blog Sayfası
 * AI destekli moda teknolojileri hakkında bilgilendirici makaleler sunar.
 */

import React, { useState } from 'react';
import { useI18n } from '../lib/i18n';
import { Logo } from '../components/Logo';

interface BlogPageProps {
    onNavigateHome: () => void;
    onNavigateFeatures: () => void;
    onGetStarted: () => void;
    isLoggedIn: boolean;
}

interface BlogPost {
    id: string;
    category: string;
    readTime: string;
    date: string;
    gradient: string;
    icon: string;
}

export const BlogPage: React.FC<BlogPageProps> = ({
    onNavigateHome,
    onNavigateFeatures,
    onGetStarted,
    isLoggedIn,
}) => {
    const { language } = useI18n();
    const [activeCategory, setActiveCategory] = useState<string>('all');

    const t = language === 'tr' ? {
        pageTitle: 'Blog',
        pageSubtitle: 'AI destekli moda teknolojileri hakkında en güncel bilgiler',
        backToHome: '← Ana Sayfa',
        features: 'Özellikler',
        blog: 'Blog',
        getStarted: isLoggedIn ? 'Hemen Kullan' : 'Ücretsiz Deneyin',
        filterAll: 'Tümü',
        filterTech: 'Teknoloji',
        filterFashion: 'Moda',
        filterTutorial: 'Rehber',
        filterNews: 'Haberler',
        readMore: 'Devamını Oku →',
        ctaTitle: 'AI ile Moda Tasarımında Devrim',
        ctaDesc: 'Fasheone AI\'ın sunduğu tüm teknolojileri keşfedin ve tasarımlarınızı dönüştürün.',
        posts: [
            {
                id: '1',
                title: 'AI ile Moda Tasarımı: 2026 Trendleri',
                excerpt: 'Yapay zeka teknolojilerinin moda endüstrisini nasıl dönüştürdüğünü ve 2026\'da bizi nelerin beklediğini keşfedin. Generative AI, sanal deneme odaları ve otomatik tasarım süreçleri.',
                category: 'tech',
                readTime: '5 dk',
                date: '15 Şubat 2026',
                gradient: 'from-cyan-500 to-blue-600',
                icon: '🤖',
            },
            {
                id: '2',
                title: 'E-ticaret İçin Profesyonel Ürün Fotoğrafçılığı',
                excerpt: 'Fiziksel stüdyo olmadan profesyonel ürün fotoğrafları nasıl oluşturulur? AI destekli görsel üretim araçlarıyla maliyetlerinizi %90 düşürün.',
                category: 'tutorial',
                readTime: '8 dk',
                date: '12 Şubat 2026',
                gradient: 'from-orange-500 to-red-600',
                icon: '📸',
            },
            {
                id: '3',
                title: 'Sürdürülebilir Moda ve Teknoloji',
                excerpt: 'Yapay zeka destekli tasarım araçları, numune üretimini azaltarak sürdürülebilir modaya nasıl katkı sağlıyor? Dijital tasarımın çevre üzerindeki olumlu etkileri.',
                category: 'fashion',
                readTime: '6 dk',
                date: '10 Şubat 2026',
                gradient: 'from-green-500 to-emerald-600',
                icon: '🌿',
            },
            {
                id: '4',
                title: 'Teknik Çizimden Üretime: Tech Pack Rehberi',
                excerpt: 'AI ile otomatik teknik çizim oluşturma, ölçü tabloları ve üreticiye gönderilecek profesyonel tech pack hazırlama rehberi.',
                category: 'tutorial',
                readTime: '10 dk',
                date: '8 Şubat 2026',
                gradient: 'from-purple-500 to-pink-600',
                icon: '📐',
            },
            {
                id: '5',
                title: 'Fasheone AI v3.0 Güncelleme Notları',
                excerpt: 'Yeni Gemini 3 Pro entegrasyonu, 2K çözünürlük desteği, geliştirilmiş canlı model özellikleri ve daha fazlası. Tüm yenilikler burada.',
                category: 'news',
                readTime: '4 dk',
                date: '5 Şubat 2026',
                gradient: 'from-indigo-500 to-purple-600',
                icon: '🚀',
            },
            {
                id: '6',
                title: 'Moda Markaları İçin AI Reklam Stratejileri',
                excerpt: 'Facebook, Instagram ve Google Ads için AI ile otomatik reklam görseli oluşturma. A/B test varyasyonları ve dönüşüm optimizasyonu ipuçları.',
                category: 'fashion',
                readTime: '7 dk',
                date: '2 Şubat 2026',
                gradient: 'from-pink-500 to-rose-600',
                icon: '📈',
            },
        ] as (BlogPost & { title: string; excerpt: string })[],
    } : {
        pageTitle: 'Blog',
        pageSubtitle: 'Latest insights on AI-powered fashion technology',
        backToHome: '← Home',
        features: 'Features',
        blog: 'Blog',
        getStarted: isLoggedIn ? 'Start Using' : 'Try Free',
        filterAll: 'All',
        filterTech: 'Technology',
        filterFashion: 'Fashion',
        filterTutorial: 'Tutorial',
        filterNews: 'News',
        readMore: 'Read More →',
        ctaTitle: 'Revolution in Fashion Design with AI',
        ctaDesc: 'Discover all the technologies Fasheone AI offers and transform your designs.',
        posts: [
            {
                id: '1',
                title: 'AI in Fashion Design: 2026 Trends',
                excerpt: 'Discover how AI technologies are transforming the fashion industry and what awaits us in 2026. Generative AI, virtual fitting rooms, and automated design processes.',
                category: 'tech',
                readTime: '5 min',
                date: 'Feb 15, 2026',
                gradient: 'from-cyan-500 to-blue-600',
                icon: '🤖',
            },
            {
                id: '2',
                title: 'Professional Product Photography for E-commerce',
                excerpt: 'How to create professional product photos without a physical studio? Cut your costs by 90% with AI-powered visual generation tools.',
                category: 'tutorial',
                readTime: '8 min',
                date: 'Feb 12, 2026',
                gradient: 'from-orange-500 to-red-600',
                icon: '📸',
            },
            {
                id: '3',
                title: 'Sustainable Fashion and Technology',
                excerpt: 'How AI-powered design tools contribute to sustainable fashion by reducing sample production. The positive environmental impact of digital design.',
                category: 'fashion',
                readTime: '6 min',
                date: 'Feb 10, 2026',
                gradient: 'from-green-500 to-emerald-600',
                icon: '🌿',
            },
            {
                id: '4',
                title: 'From Technical Drawing to Production: Tech Pack Guide',
                excerpt: 'A comprehensive guide to creating automatic technical drawings with AI, measurement tables, and preparing professional tech packs for manufacturers.',
                category: 'tutorial',
                readTime: '10 min',
                date: 'Feb 8, 2026',
                gradient: 'from-purple-500 to-pink-600',
                icon: '📐',
            },
            {
                id: '5',
                title: 'Fasheone AI v3.0 Release Notes',
                excerpt: 'New Gemini 3 Pro integration, 2K resolution support, improved live model features, and more. All the latest updates here.',
                category: 'news',
                readTime: '4 min',
                date: 'Feb 5, 2026',
                gradient: 'from-indigo-500 to-purple-600',
                icon: '🚀',
            },
            {
                id: '6',
                title: 'AI Ad Strategies for Fashion Brands',
                excerpt: 'Creating automated ad visuals with AI for Facebook, Instagram, and Google Ads. A/B test variations and conversion optimization tips.',
                category: 'fashion',
                readTime: '7 min',
                date: 'Feb 2, 2026',
                gradient: 'from-pink-500 to-rose-600',
                icon: '📈',
            },
        ] as (BlogPost & { title: string; excerpt: string })[],
    };

    const filterCategories = [
        { key: 'all', label: t.filterAll },
        { key: 'tech', label: t.filterTech },
        { key: 'fashion', label: t.filterFashion },
        { key: 'tutorial', label: t.filterTutorial },
        { key: 'news', label: t.filterNews },
    ];

    const filteredPosts = activeCategory === 'all'
        ? t.posts
        : t.posts.filter(p => p.category === activeCategory);

    const categoryLabels: Record<string, string> = {
        tech: t.filterTech,
        fashion: t.filterFashion,
        tutorial: t.filterTutorial,
        news: t.filterNews,
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white">
            {/* Header */}
            <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-900/80 border-b border-white/10">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <button
                            onClick={onNavigateHome}
                            className="hover:opacity-80 transition-opacity"
                        >
                            <Logo className="h-10" theme="dark" />
                        </button>

                        {/* Nav Links */}
                        <nav className="hidden md:flex items-center gap-6">
                            <button
                                onClick={onNavigateFeatures}
                                className="text-slate-400 hover:text-white transition-colors text-sm font-medium"
                            >
                                {t.features}
                            </button>
                            <button className="text-white text-sm font-semibold border-b-2 border-cyan-500 pb-0.5">
                                {t.blog}
                            </button>
                        </nav>
                    </div>

                    <button
                        onClick={onGetStarted}
                        className="bg-gradient-to-r from-orange-500 to-pink-600 text-white px-6 py-2 rounded-xl font-semibold text-sm hover:shadow-lg hover:shadow-orange-500/30 transition-all transform hover:scale-105"
                    >
                        {t.getStarted}
                    </button>
                </div>
            </header>

            {/* Hero */}
            <section className="relative pt-20 pb-12 px-6 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900" />
                <div className="absolute top-10 left-1/3 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute top-32 right-1/4 w-80 h-80 bg-cyan-500/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />

                <div className="relative max-w-4xl mx-auto text-center">
                    <h1 className="text-5xl md:text-7xl font-black mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
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
                    <div className="inline-flex bg-slate-800/60 rounded-2xl p-1.5 border border-white/10 gap-1 flex-wrap justify-center">
                        {filterCategories.map(cat => (
                            <button
                                key={cat.key}
                                onClick={() => setActiveCategory(cat.key)}
                                className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 ${activeCategory === cat.key
                                    ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg shadow-purple-500/30'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Blog Grid */}
            <section className="px-6 pb-20">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredPosts.map((post, idx) => (
                            <article
                                key={post.id}
                                className="group relative rounded-3xl overflow-hidden bg-slate-800/50 backdrop-blur-xl border border-white/10 hover:border-white/20 shadow-xl transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl cursor-pointer"
                                style={{ animationDelay: `${idx * 100}ms` }}
                            >
                                {/* Cover Image Area */}
                                <div className={`h-48 bg-gradient-to-br ${post.gradient} relative overflow-hidden`}>
                                    <div className="absolute inset-0 bg-black/20" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-6xl opacity-50 group-hover:opacity-80 group-hover:scale-125 transition-all duration-500">
                                            {post.icon}
                                        </span>
                                    </div>
                                    {/* Category Badge */}
                                    <div className="absolute top-4 left-4">
                                        <span className="bg-white/20 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full">
                                            {categoryLabels[post.category] || post.category}
                                        </span>
                                    </div>
                                    {/* Read Time */}
                                    <div className="absolute top-4 right-4">
                                        <span className="bg-black/30 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1">
                                            ⏱ {post.readTime}
                                        </span>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-6">
                                    <p className="text-slate-500 text-xs mb-3">{post.date}</p>
                                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-slate-300 group-hover:bg-clip-text transition-all leading-tight">
                                        {post.title}
                                    </h3>
                                    <p className="text-slate-400 text-sm leading-relaxed mb-4 line-clamp-3">
                                        {post.excerpt}
                                    </p>
                                    <button className="text-sm font-semibold text-cyan-400 hover:text-cyan-300 transition-colors group-hover:translate-x-1 transform transition-transform">
                                        {t.readMore}
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="px-6 pb-20">
                <div className="max-w-4xl mx-auto">
                    <div className="relative rounded-3xl overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600" />
                        <div className="relative p-12 md:p-16 text-center">
                            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
                                {t.ctaTitle}
                            </h2>
                            <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">
                                {t.ctaDesc}
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <button
                                    onClick={onGetStarted}
                                    className="bg-white text-slate-900 px-10 py-4 rounded-2xl font-bold text-lg hover:shadow-2xl hover:shadow-white/20 transition-all transform hover:scale-105"
                                >
                                    {t.getStarted} →
                                </button>
                                <button
                                    onClick={onNavigateFeatures}
                                    className="border-2 border-white/30 text-white px-10 py-4 rounded-2xl font-bold text-lg hover:bg-white/10 transition-all"
                                >
                                    {t.features}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};
