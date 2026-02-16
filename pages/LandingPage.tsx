import React, { useState, useEffect } from 'react';
import { useI18n, TranslationRecord } from '../lib/i18n';
import { Logo } from '../components/Logo';
import { CREDIT_PACKAGES } from '../lib/supabase';
import { getPublicHeroVideos, getPublicShowcaseImages, getSiteSettings } from '../lib/adminService';
import { trackEvent } from '../utils/analytics';

// New modular components
import { GlassNavbar } from '../components/landing/GlassNavbar';
import { HeroSection } from '../components/landing/HeroSection';
import { TrustedBy } from '../components/landing/TrustedBy';
import { FeaturesOverview } from '../components/landing/FeaturesOverview';
import { ShowcaseSection } from '../components/landing/ShowcaseSection';
import { HowItWorksSection } from '../components/landing/HowItWorksSection';
import { PricingPreview } from '../components/landing/PricingPreview';
import { CTABanner } from '../components/landing/CTABanner';

// Import design system
import '../styles/landing.css';

interface LandingPageProps {
    onGetStarted: () => void;
    onSignIn: () => void;
    onNavigate?: (page: string, tab?: string) => void;
    isLoggedIn?: boolean;
    userName?: string | null;
    userRole?: 'admin' | 'user' | null;
    credits?: number;
    onLogout?: () => void;
    onAdminClick?: () => void;
    onAffiliateClick?: () => void;
    onBuyCreditsClick?: () => void;
    sketchUrl?: string;
    productUrl?: string;
    modelUrl?: string;
    videoUrl?: string;
    heroVideoUrl?: string;
    heroVideo1Url?: string;
    heroVideo2Url?: string;
    heroVideo3Url?: string;
    adGeniusMainUrl?: string;
    adGeniusCollageUrl?: string;
    logoMediaUrl?: string;
}

/* ── Translation Objects ──────────────────────────────────── */
const trLanding = {
    header: {
        signIn: 'Giriş Yap',
        start: 'Başla',
        buyCredits: 'Kredi Al',
        signOut: 'Çıkış',
        continueUsing: 'Hemen Kullanmaya Devam Et',
    },
    hero: {
        title: 'Çizimden Gerçeğe,',
        subtitle: 'Saniyeler İçinde',
        description: 'Moda tasarımlarınızı AI ile profesyonel ürün fotoğraflarına ve canlı model görsellerine dönüştürün. Video oluşturun, markanızı büyütün.',
        cta: 'Ücretsiz Deneyin',
    },
    howItWorks: {
        title: 'Nasıl Çalışır?',
        subtitle: '3 Adımda AI ile Profesyonel Görsel',
        step1Title: 'Görseli Yükle',
        step1Desc: 'Ürün çizimini veya fotoğrafını platforma yükle',
        step2Title: 'Detayları Seç',
        step2Desc: 'Hazır şablonlar ve seçeneklerle istediğin stili belirle',
        step3Title: 'Oluştur & İndir',
        step3Desc: 'Profesyonel sonuçları hemen indir ve paylaş',
    },
    features: {
        title: 'Güçlü Özellikler',
        feature1Title: 'Çizimden Ürüne',
        feature1Desc: 'Moda çizimlerinizi ultra-gerçekçi ürün fotoğraflarına dönüştürün.',
        feature2Title: 'Canlı Model',
        feature2Desc: 'Ürünlerinizi gerçek modeller üzerinde görün.',
        feature3Title: 'Video Oluşturma',
        feature3Desc: 'Görsellerinizi profesyonel videolara dönüştürün.',
        feature4Title: 'Teknik Çizim',
        feature4Desc: 'Ürün fotoğraflarınızı üretim için teknik çizimlere dönüştürün.',
        feature5Title: 'Pixshop',
        feature5Desc: 'AI destekli profesyonel fotoğraf düzenleme ve rötuş.',
        feature6Title: 'Fotomatik',
        feature6Desc: 'Toplu görsel işleme ve hızlı katalog hazırlama.',
    },
    showcase: {
        title: 'Çizimden Gerçeğe Dönüşüm',
        subtitle: 'AI teknolojisiyle tasarımlarınız profesyonel görsellere dönüşüyor',
        before: 'ÖNCE',
        after: 'SONRA',
        step1: 'Çizim → Ürün',
        step1Desc: 'Çizimlerinizi gerçekçi ürün fotoğraflarına dönüştürün.',
        step1Before: 'ÇİZİM',
        step1After: 'ÜRÜN',
        step2: 'Ürün → Model',
        step2Desc: 'Ürün fotoğraflarını canlı modeller üzerinde görün.',
        step2Before: 'ÜRÜN',
        step2After: 'MODEL',
        step3: 'Görsel → Video',
    },
    pricing: {
        title: 'Fiyatlandırma',
        subtitle: 'İhtiyacınıza uygun planı seçin.',
        perMonth: '/ay',
        popular: 'Popüler',
        start: 'Başla',
        contactUs: 'İletişime Geç',
    },
    cta: {
        title: 'Hemen Başlayın',
        subtitle: 'İlk tasarımınızı ücretsiz deneyin. Kredi kartı gerekmez.',
        startTrial: 'Ücretsiz Başla',
        contactUs: 'İletişime Geç',
    },
    trustedBy: {
        title: 'Dünya Genelindeki Moda Markalarının Güvendiği Platform',
        designs: 'Oluşturulan Tasarım',
        brands: 'Moda Markası',
        satisfaction: 'Memnuniyet Oranı',
        countries: 'Ülke',
    },
    footer: {
        quickLinks: 'Hızlı Linkler',
        features: 'Özellikler',
        howItWorks: 'Nasıl Çalışır?',
        pricing: 'Fiyatlandırma',
        examples: 'Örnekler',
        faq: 'SSS',
        affiliateProgram: '🤝 Affiliate Programı',
        legal: 'Hukuki',
        privacyPolicy: 'Gizlilik Politikası',
        kvkk: 'KVKK Aydınlatma Metni',
        termsOfService: 'Fasheone Hizmet Sözleşmesi',
        cookiePolicy: 'Çerez Politikası',
        refundPolicy: 'İade ve İptal Koşulları',
        aiUsage: 'AI Kullanım Bildirimi',
        contact: 'İletişim',
        support: '7/24 Destek',
        allRights: '© 2024 Fasheone. Tüm hakları saklıdır.',
    },
};

const landingTranslations: TranslationRecord<typeof trLanding> = {
    tr: trLanding,
    en: {
        header: {
            signIn: 'Sign In',
            start: 'Get Started',
            buyCredits: 'Buy Credits',
            signOut: 'Sign Out',
            continueUsing: 'Continue Using',
        },
        hero: {
            title: 'From Sketch to Reality,',
            subtitle: 'In Seconds',
            description: 'Transform your fashion designs into professional product photos and live model visuals with AI. Create videos, grow your brand.',
            cta: 'Try Free',
        },
        howItWorks: {
            title: 'How It Works?',
            subtitle: '3 Steps to Professional Visuals with AI',
            step1Title: 'Upload Image',
            step1Desc: 'Upload your product sketch or photo to the platform',
            step2Title: 'Select Details',
            step2Desc: 'Choose your style with ready templates and options',
            step3Title: 'Generate & Download',
            step3Desc: 'Download professional results instantly and share',
        },
        features: {
            title: 'Powerful Features',
            feature1Title: 'Sketch to Product',
            feature1Desc: 'Transform fashion sketches into ultra-realistic product photos.',
            feature2Title: 'Live Model',
            feature2Desc: 'See your products on real models.',
            feature3Title: 'Video Generation',
            feature3Desc: 'Transform your visuals into professional videos.',
            feature4Title: 'Technical Drawing',
            feature4Desc: 'Transform product photos into technical drawings for production.',
            feature5Title: 'Pixshop',
            feature5Desc: 'AI-powered professional photo editing and retouch.',
            feature6Title: 'Fotomatik',
            feature6Desc: 'Batch image processing and quick catalog preparation.',
        },
        showcase: {
            title: 'See The Transformation',
            subtitle: 'AI technology transforms your designs into professional visuals',
            before: 'BEFORE',
            after: 'AFTER',
            step1: 'Sketch → Product',
            step1Desc: 'Transform your sketches into realistic product photos.',
            step1Before: 'SKETCH',
            step1After: 'PRODUCT',
            step2: 'Product → Model',
            step2Desc: 'See product photos on live models.',
            step2Before: 'PRODUCT',
            step2After: 'MODEL',
            step3: 'Visual → Video',
        },
        pricing: {
            title: 'Pricing',
            subtitle: 'Choose the plan that fits your needs.',
            perMonth: '/mo',
            popular: 'Most Popular',
            start: 'Get Started',
            contactUs: 'Contact Us',
        },
        cta: {
            title: 'Ready to Transform Your Fashion Business?',
            subtitle: 'Try your first design for free. No credit card required.',
            startTrial: 'Start Free Trial',
            contactUs: 'Contact Us',
        },
        trustedBy: {
            title: 'Trusted by fashion brands worldwide',
            designs: 'Designs Created',
            brands: 'Fashion Brands',
            satisfaction: 'Satisfaction Rate',
            countries: 'Countries',
        },
        footer: {
            quickLinks: 'Quick Links',
            features: 'Features',
            howItWorks: 'How It Works',
            pricing: 'Pricing',
            examples: 'Examples',
            faq: 'FAQ',
            affiliateProgram: '🤝 Affiliate Program',
            legal: 'Legal',
            privacyPolicy: 'Privacy Policy',
            kvkk: 'KVKK Disclosure',
            termsOfService: 'Terms of Service',
            cookiePolicy: 'Cookie Policy',
            refundPolicy: 'Refund & Cancellation Policy',
            aiUsage: 'AI Usage Notice',
            contact: 'Contact',
            support: '24/7 Support',
            allRights: '© 2024 Fasheone. All rights reserved.',
        },
    },
};

/* ── Component ──────────────────────────────────────────── */
export const LandingPage: React.FC<LandingPageProps> = (props) => {
    const {
        onGetStarted, onSignIn, onNavigate,
        isLoggedIn = false, userName, userRole, credits,
        onLogout, onAdminClick, onAffiliateClick, onBuyCreditsClick,
        sketchUrl, productUrl, modelUrl, videoUrl,
    } = props;

    // DB content state
    const [showcaseImages, setShowcaseImages] = useState<{
        sketch?: string; product?: string; model?: string; video?: string;
    }>({});

    const handleGetStarted = () => {
        trackEvent('cta_click', { p_label: 'Get Started', source: 'landing_page' });
        onGetStarted();
    };

    const handleSignIn = () => {
        trackEvent('cta_click', { p_label: 'Sign In', source: 'landing_page' });
        onSignIn();
    };

    // Fetch content from DB
    useEffect(() => {
        const fetchContent = async () => {
            try {
                const images = await getPublicShowcaseImages();
                const imagesByType: any = {};
                images.forEach((img: any) => { imagesByType[img.type] = img.image_url; });
                setShowcaseImages(imagesByType);
            } catch (error) {
                console.error('İçerik yükleme hatası:', error);
            }
        };
        fetchContent();
        const interval = setInterval(fetchContent, 30000);
        return () => clearInterval(interval);
    }, []);

    const demoSketch = showcaseImages.sketch || sketchUrl || 'https://images.unsplash.com/photo-1610824352934-c10d87b700cc?w=600';
    const demoProduct = showcaseImages.product || productUrl || 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600';
    const demoModel = showcaseImages.model || modelUrl || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600';
    const demoVideo = showcaseImages.video || videoUrl;

    const { language, setLanguage } = useI18n();
    const [showScrollTop, setShowScrollTop] = useState(false);

    useEffect(() => {
        const handleScroll = () => setShowScrollTop(window.scrollY > 400);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const t = landingTranslations[language];

    return (
        <div className="landing-page min-h-screen relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0a0a1a 0%, #1a0a2e 30%, #0a1628 70%, #0a0a1a 100%)' }}>
            {/* Background decorative elements */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full opacity-20 animate-float"
                    style={{ background: 'radial-gradient(circle, rgba(108,60,225,0.3), transparent 70%)' }} />
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full opacity-15 animate-float"
                    style={{ background: 'radial-gradient(circle, rgba(255,107,107,0.25), transparent 70%)', animationDelay: '3s' }} />
                <div className="absolute top-[40%] right-[20%] w-[300px] h-[300px] rounded-full opacity-10 animate-float"
                    style={{ background: 'radial-gradient(circle, rgba(212,165,116,0.3), transparent 70%)', animationDelay: '6s' }} />
            </div>

            {/* Glass Navbar */}
            <GlassNavbar
                t={t}
                language={language}
                setLanguage={setLanguage}
                isLoggedIn={isLoggedIn}
                userName={userName}
                userRole={userRole}
                credits={credits}
                onGetStarted={handleGetStarted}
                onSignIn={handleSignIn}
                onLogout={onLogout}
                onAdminClick={onAdminClick}
                onAffiliateClick={onAffiliateClick}
                onBuyCreditsClick={onBuyCreditsClick}
                onNavigate={onNavigate}
            />

            {/* Hero */}
            <HeroSection t={t} onGetStarted={handleGetStarted} />

            {/* Trusted By */}
            <TrustedBy t={t} />

            {/* Features Overview */}
            <FeaturesOverview t={t} onNavigate={onNavigate} />

            {/* Showcase (Before/After) */}
            <ShowcaseSection
                t={t}
                sketchUrl={demoSketch}
                productUrl={demoProduct}
                modelUrl={demoModel}
                videoUrl={demoVideo}
            />

            {/* How It Works */}
            <HowItWorksSection t={t} />

            {/* Pricing Preview */}
            <PricingPreview onGetStarted={handleGetStarted} t={t} />

            {/* CTA Banner */}
            <CTABanner onGetStarted={handleGetStarted} t={t} />

            {/* ── Footer (preserved from original) ──────────────── */}
            <footer className="relative z-10 border-t border-white/10" style={{ background: 'rgba(10,10,26,0.8)', backdropFilter: 'blur(12px)' }}>
                <div className="max-w-6xl mx-auto px-6 py-12">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        {/* Col 1: Brand */}
                        <div className="space-y-4">
                            <Logo size="md" />
                            <p className="text-white/40 text-sm leading-relaxed">
                                AI-powered fashion visual production platform
                            </p>
                            <div className="flex gap-3">
                                <a href="https://instagram.com/fasheone" target="_blank" rel="noopener noreferrer" className="text-white/30 hover:text-pink-400 transition-colors" aria-label="Instagram">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
                                </a>
                                <a href="https://twitter.com/fasheone" target="_blank" rel="noopener noreferrer" className="text-white/30 hover:text-blue-400 transition-colors" aria-label="Twitter">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" /></svg>
                                </a>
                                <a href="https://linkedin.com/company/fasheone" target="_blank" rel="noopener noreferrer" className="text-white/30 hover:text-blue-300 transition-colors" aria-label="LinkedIn">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                                </a>
                            </div>
                        </div>

                        {/* Col 2: Quick Links */}
                        <div className="space-y-4">
                            <h3 className="text-white font-semibold">{t.footer.quickLinks}</h3>
                            <ul className="space-y-2">
                                {[
                                    { label: t.footer.features, id: 'features' },
                                    { label: t.footer.howItWorks, id: 'how-it-works' },
                                    { label: t.footer.pricing, id: 'pricing' },
                                    { label: t.footer.examples, id: 'showcase' },
                                ].map((item) => (
                                    <li key={item.id}>
                                        <button
                                            onClick={() => document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' })}
                                            className="text-white/40 hover:text-purple-400 transition-colors text-sm bg-transparent border-none p-0 cursor-pointer"
                                        >
                                            {item.label}
                                        </button>
                                    </li>
                                ))}
                                <li>
                                    <button
                                        onClick={() => { if (onNavigate) { onNavigate('affiliate-info'); window.scrollTo({ top: 0, behavior: 'smooth' }); } }}
                                        className="text-white/40 hover:text-purple-400 transition-colors text-sm bg-transparent border-none p-0 cursor-pointer"
                                    >
                                        {t.footer.affiliateProgram}
                                    </button>
                                </li>
                            </ul>
                        </div>

                        {/* Col 3: Legal */}
                        <div className="space-y-4">
                            <h3 className="text-white font-semibold">{t.footer.legal}</h3>
                            <ul className="space-y-2">
                                {[
                                    { label: t.footer.privacyPolicy, page: 'privacy-policy' },
                                    { label: t.footer.kvkk, page: 'kvkk' },
                                    { label: t.footer.termsOfService, page: 'terms-of-service' },
                                    { label: t.footer.cookiePolicy, page: 'cookie-policy' },
                                    { label: t.footer.refundPolicy, page: 'refund-policy' },
                                ].map((item) => (
                                    <li key={item.page}>
                                        <button
                                            onClick={() => { if (onNavigate) { onNavigate(item.page); window.scrollTo({ top: 0, behavior: 'smooth' }); } }}
                                            className="text-white/40 hover:text-purple-400 transition-colors text-sm bg-transparent border-none p-0 cursor-pointer"
                                        >
                                            {item.label}
                                        </button>
                                    </li>
                                ))}
                                <li>
                                    <button
                                        onClick={() => { if (onNavigate) { onNavigate('ai-usage-notice'); window.scrollTo({ top: 0, behavior: 'smooth' }); } }}
                                        className="text-white/40 hover:text-purple-400 transition-colors text-sm bg-transparent border-none p-0 cursor-pointer flex items-center gap-1"
                                    >
                                        <span>🤖</span> {t.footer.aiUsage}
                                    </button>
                                </li>
                            </ul>
                        </div>

                        {/* Col 4: Contact */}
                        <div className="space-y-4">
                            <h3 className="text-white font-semibold">{t.footer.contact}</h3>
                            <ul className="space-y-3">
                                <li className="flex items-start gap-2">
                                    <svg className="w-4 h-4 mt-0.5 flex-shrink-0 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    <a href="mailto:info@fasheone.com" className="text-white/40 hover:text-purple-400 transition-colors text-sm">info@fasheone.com</a>
                                </li>
                                <li className="flex items-start gap-2">
                                    <svg className="w-4 h-4 mt-0.5 flex-shrink-0 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                    <a href="tel:+905551234567" className="text-white/40 hover:text-purple-400 transition-colors text-sm">+90 555 123 45 67</a>
                                </li>
                                <li className="flex items-start gap-2">
                                    <svg className="w-4 h-4 mt-0.5 flex-shrink-0 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <span className="text-white/40 text-sm">ZAFER MAH. KUMRULU SK. SARAY İŞ MERKEZİ NO:2 IÇ KAPI NO:18 BAHÇELİEVLER/İSTANBUL-TÜRKİYE</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <svg className="w-4 h-4 mt-0.5 flex-shrink-0 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="text-white/40 text-sm">{t.footer.support}</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Bottom Bar */}
                    <div className="pt-8 mt-8 border-t border-white/10">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                            <p className="text-white/30 text-sm text-center md:text-left">{t.footer.allRights}</p>
                            <p className="text-white/20 text-xs">Made with ❤️ in Turkey</p>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Scroll to Top */}
            <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className={`fixed bottom-28 right-6 z-[130] w-12 h-12 rounded-full shadow-2xl flex items-center justify-center transition-all duration-500 group ${showScrollTop ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-10 pointer-events-none'
                    }`}
                style={{
                    background: 'linear-gradient(135deg, var(--color-deep-violet), var(--color-electric-coral))',
                    boxShadow: '0 4px 24px rgba(108,60,225,0.4)',
                }}
                aria-label="Sayfanın başına dön"
            >
                <svg className="w-5 h-5 text-white group-hover:-translate-y-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                </svg>
            </button>
        </div>
    );
};

export default LandingPage;
