import React, { useState, useRef } from 'react';
import { Header } from './Header';
import { UploadIconSmall } from './icons/UploadIconSmall';
import { SettingsPanel } from './admin/SettingsPanel';
import { UserActivityPanel } from './admin/UserActivityPanel';
import { TransactionsPanel } from './admin/TransactionsPanel';
import AffiliateManagement from './admin/AffiliateManagement';
import { CreditReportsPanel } from './admin/CreditReportsPanel';
import { useTranslation, TranslationRecord } from '../lib/i18n';

const trAdmin = {
    title: 'Admin Paneli',
    subtitle: 'Sistemin tüm yönetim fonksiyonlarına buradan erişebilirsiniz.',
    tabs: { content: '📸 İçerik Yönetimi', settings: '⚙️ Ayarlar', users: '👥 Kullanıcı Aktivitesi', transactions: '💳 Ödemeler', adgenius: '🚀 AdGenius Yönetimi', affiliates: '🤝 Ortaklık Yönetimi', creditReports: '📊 Kredi Raporları' },
    heroVideos: { title: '🎬 Hero Gömülü Videolar (4 Adet)', subtitle: 'Hero bölümünde arka planda sırayla dönecek 4 videoyu yükleyin. Videolar otomatik olarak geçiş yapacak.' },
    showcase: { title: '📸 Showcase Görselleri', subtitle: 'Çizimden gerçeğe dönüşüm örnekleri için görselleri yükleyin.', sketch: '1. Çizim (Sketch)', product: '2. Ürün (Product)', model: '3. Model (Live)', video: '4. Video' },
    pixshopBoxes: { title: '🖌️ Pixshop Kutuları', subtitle: 'Landing sayfasındaki Pixshop bölümünün görsellerini yükleyin.', retush: 'Akıllı Rötuş', productPlacement: 'Ürün Ekleme (Product Placement)' },
    adgenius: { title: '🚀 AdGenius Yönetimi', subtitle: 'AdGenius bölümü için tüm kutu görsellerini buradan yönetebilirsiniz.', mainImage: 'Ana Görsel (Büyük Model Çekimi)', collageImage: 'Kolaj Görsel (9\'lu Grid/Varyasyon)', mainTitle: 'AdGenius Ana Görsel', collageTitle: 'AdGenius Kolaj/Grid', modelShoot: 'Mankenli Çekimler', campaign: 'Kampanya Konseptleri', adVideo: 'Reklam Videoları', productPlacement: 'Ürün Yerleştirme' },
    change: 'Değiştir',
};

const adminTranslations: TranslationRecord<typeof trAdmin> = {
    tr: trAdmin,
    en: {
        title: 'Admin Panel',
        subtitle: 'Access all system management functions from here.',
        tabs: { content: '📸 Content Management', settings: '⚙️ Settings', users: '👥 User Activity', transactions: '💳 Payments', adgenius: '🚀 AdGenius Management', affiliates: '🤝 Affiliate Management', creditReports: '📊 Credit Reports' },
        heroVideos: { title: '🎬 Hero Background Videos (4)', subtitle: 'Upload 4 videos to rotate in the hero section background. Videos will transition automatically.' },
        showcase: { title: '📸 Showcase Images', subtitle: 'Upload images for sketch-to-reality transformation examples.', sketch: '1. Sketch', product: '2. Product', model: '3. Model (Live)', video: '4. Video' },
        pixshopBoxes: { title: '🖌️ Pixshop Boxes', subtitle: 'Upload images for the Pixshop section on the landing page.', retush: 'Smart Retouch', productPlacement: 'Product Placement' },
        adgenius: { title: '🚀 AdGenius Management', subtitle: 'Manage all box images for the AdGenius section from here.', mainImage: 'Main Image (Large Model Shoot)', collageImage: 'Collage Image (9-Grid/Variation)', mainTitle: 'AdGenius Main Image', collageTitle: 'AdGenius Collage/Grid', modelShoot: 'Model Shoots', campaign: 'Campaign Concepts', adVideo: 'Ad Videos', productPlacement: 'Product Placement' },
        change: 'Change',
    },
};

interface AdminDashboardProps {
    onNavigateHome: () => void;
    isLoggedIn: boolean;
    userRole: 'admin' | 'user' | null;
    userName?: string | null;
    onLoginClick: () => void;
    onLogoutClick: () => void;
    sketchUrl: string;
    productUrl: string;
    modelUrl: string;
    videoUrl: string;
    heroVideoUrl?: string;
    heroVideo1Url?: string;
    heroVideo2Url?: string;
    heroVideo3Url?: string;
    onSketchUpload: (file: File) => void;
    onProductUpload: (file: File) => void;
    onModelUpload: (file: File) => void;
    onVideoUpload: (file: File) => void;
    onHeroVideoUpload?: (file: File) => void;
    onHeroVideo1Upload?: (file: File) => void;
    onHeroVideo2Upload?: (file: File) => void;
    onHeroVideo3Upload?: (file: File) => void;
    credits?: number;
    adGeniusMainUrl?: string;
    adGeniusCollageUrl?: string;
    onAdGeniusMainUpload?: (file: File) => void;
    onAdGeniusCollageUpload?: (file: File) => void;
    currentUserId?: string;
    onRefreshProfile?: () => void;
    logoMediaUrl?: string;
    onLogoMediaUpload?: (file: File) => void;
    // Pixshop showcase boxes
    pixshopRetushUrl?: string;
    onPixshopRetushUpload?: (file: File) => void;
    pixshopProductPlacementUrl?: string;
    onPixshopProductPlacementUpload?: (file: File) => void;
    // AdGenius showcase boxes
    adGeniusModelUrl?: string;
    onAdGeniusModelUpload?: (file: File) => void;
    adGeniusCampaignUrl?: string;
    onAdGeniusCampaignUpload?: (file: File) => void;
    adGeniusVideoUrl?: string;
    onAdGeniusVideoUpload?: (file: File) => void;
    adGeniusProductPlacementUrl?: string;
    onAdGeniusProductPlacementUpload?: (file: File) => void;
}

const ContentCard: React.FC<{
    title: string;
    mediaUrl: string;
    mediaType: 'image' | 'video';
    onFileSelect: (file: File) => void;
    accept: string;
    changeLabel: string;
}> = ({ title, mediaUrl, mediaType, onFileSelect, accept, changeLabel }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            onFileSelect(file);
        }
    };

    return (
        <div className="bg-slate-800/50 rounded-2xl p-6 flex flex-col h-full">
            <h3 className="text-xl font-bold mb-4 text-white">{title}</h3>
            <div className="aspect-[4/5] bg-slate-700 rounded-lg mb-4 overflow-hidden relative flex-grow">
                {mediaType === 'image' ? (
                    <img src={mediaUrl} alt={title} className="w-full h-full object-cover absolute inset-0" />
                ) : (
                    <video src={mediaUrl} controls loop className="w-full h-full object-cover absolute inset-0" />
                )}
            </div>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept={accept}
                className="hidden"
            />
            <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full bg-slate-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-slate-500 transition-colors flex items-center justify-center gap-2 mt-auto"
            >
                <UploadIconSmall />
                {changeLabel}
            </button>
        </div>
    );
};

export const AdminDashboard: React.FC<AdminDashboardProps> = (props) => {
    const {
        onNavigateHome,
        sketchUrl,
        productUrl,
        modelUrl,
        videoUrl,
        heroVideoUrl,
        heroVideo1Url,
        heroVideo2Url,
        heroVideo3Url,
        onSketchUpload,
        onProductUpload,
        onModelUpload,
        onVideoUpload,
        onHeroVideoUpload,
        onHeroVideo1Upload,
        onHeroVideo2Upload,
        onHeroVideo3Upload,
        adGeniusMainUrl, adGeniusCollageUrl,
        onAdGeniusMainUpload, onAdGeniusCollageUpload,
        ...headerProps
    } = props;

    const [activeTab, setActiveTab] = useState<'content' | 'settings' | 'users' | 'transactions' | 'adgenius' | 'affiliates' | 'creditReports'>('content');
    const t = useTranslation(adminTranslations);



    const tabs = [
        { id: 'content' as const, label: t.tabs.content, icon: '📸' },
        { id: 'adgenius' as const, label: t.tabs.adgenius, icon: '🚀' },
        { id: 'settings' as const, label: t.tabs.settings, icon: '⚙️' },
        { id: 'users' as const, label: t.tabs.users, icon: '👥' },
        { id: 'transactions' as const, label: t.tabs.transactions, icon: '💳' },
        { id: 'affiliates' as const, label: t.tabs.affiliates, icon: '🤝' },
        { id: 'creditReports' as const, label: t.tabs.creditReports, icon: '📊' },
    ];

    return (
        <div className="min-h-screen flex flex-col bg-slate-900 text-slate-200">
            <Header {...headerProps} onHomeClick={onNavigateHome} />
            <main className="flex-grow container mx-auto p-4 md:p-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-extrabold text-white mb-2">{t.title}</h1>
                    <p className="text-slate-400">
                        {t.subtitle}
                    </p>
                </div>

                {/* Tab Navigation */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-2 mb-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-4 py-3 rounded-xl font-semibold text-sm md:text-base transition-all ${activeTab === tab.id
                                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg'
                                    : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700 hover:text-white'
                                    }`}
                            >
                                <span className="hidden md:inline">{tab.label}</span>
                                <span className="md:hidden">{tab.icon}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tab Content */}
                <div className="animate-fade-in">
                    {activeTab === 'content' && (
                        <div className="space-y-12">
                            {/* Hero Gömülü Videolar Section - 4 Adet */}
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-4">{t.heroVideos.title}</h2>
                                <p className="text-slate-400 mb-6">
                                    {t.heroVideos.subtitle}
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <ContentCard
                                        title="Hero Video 1"
                                        mediaUrl={heroVideoUrl || ''}
                                        mediaType="video"
                                        onFileSelect={onHeroVideoUpload || (() => { })}
                                        accept="video/*"
                                        changeLabel={t.change}
                                    />
                                    <ContentCard
                                        title="Hero Video 2"
                                        mediaUrl={heroVideo1Url || ''}
                                        mediaType="video"
                                        onFileSelect={onHeroVideo1Upload || (() => { })}
                                        accept="video/*"
                                        changeLabel={t.change}
                                    />
                                    <ContentCard
                                        title="Hero Video 3"
                                        mediaUrl={heroVideo2Url || ''}
                                        mediaType="video"
                                        onFileSelect={onHeroVideo2Upload || (() => { })}
                                        accept="video/*"
                                        changeLabel={t.change}
                                    />
                                    <ContentCard
                                        title="Hero Video 4"
                                        mediaUrl={heroVideo3Url || ''}
                                        mediaType="video"
                                        onFileSelect={onHeroVideo3Upload || (() => { })}
                                        accept="video/*"
                                        changeLabel={t.change}
                                    />
                                </div>
                            </div>

                            {/* Logo Video/Image Section */}
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-4">🎨 Logo Animasyonu / Geçiş Görseli</h2>
                                <p className="text-slate-400 mb-6">
                                    Hero videolar arasında gösterilecek logo animasyonu veya geçiş görseli. Video veya resim yükleyebilirsiniz.
                                </p>
                                <div className="max-w-md">
                                    <ContentCard
                                        title="Logo Video/Image"
                                        mediaUrl={props.logoMediaUrl || ''}
                                        mediaType={props.logoMediaUrl?.match(/\.(mp4|webm|mov)$/i) ? 'video' : 'image'}
                                        onFileSelect={props.onLogoMediaUpload || (() => { })}
                                        accept="video/*,image/*"
                                        changeLabel={t.change}
                                    />
                                </div>
                            </div>

                            {/* Showcase Section */}
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-4">{t.showcase.title}</h2>
                                <p className="text-slate-400 mb-6">
                                    {t.showcase.subtitle}
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <ContentCard
                                        title={t.showcase.sketch}
                                        mediaUrl={sketchUrl}
                                        mediaType="image"
                                        onFileSelect={onSketchUpload}
                                        accept="image/*"
                                        changeLabel={t.change}
                                    />
                                    <ContentCard
                                        title={t.showcase.product}
                                        mediaUrl={productUrl}
                                        mediaType="image"
                                        onFileSelect={onProductUpload}
                                        accept="image/*"
                                        changeLabel={t.change}
                                    />
                                    <ContentCard
                                        title={t.showcase.model}
                                        mediaUrl={modelUrl}
                                        mediaType="image"
                                        onFileSelect={onModelUpload}
                                        accept="image/*"
                                        changeLabel={t.change}
                                    />
                                    <ContentCard
                                        title={t.showcase.video}
                                        mediaUrl={videoUrl}
                                        mediaType="video"
                                        onFileSelect={onVideoUpload}
                                        accept="video/*"
                                        changeLabel={t.change}
                                    />
                                </div>
                            </div>

                            {/* Pixshop Kutuları Section */}
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-4">{t.pixshopBoxes.title}</h2>
                                <p className="text-slate-400 mb-6">
                                    {t.pixshopBoxes.subtitle}
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <ContentCard
                                        title={`🖌️ ${t.pixshopBoxes.retush}`}
                                        mediaUrl={props.pixshopRetushUrl || ''}
                                        mediaType="image"
                                        onFileSelect={props.onPixshopRetushUpload || (() => { })}
                                        accept="image/*,video/*"
                                        changeLabel={t.change}
                                    />
                                    <ContentCard
                                        title={`📦 ${t.pixshopBoxes.productPlacement}`}
                                        mediaUrl={props.pixshopProductPlacementUrl || ''}
                                        mediaType="image"
                                        onFileSelect={props.onPixshopProductPlacementUpload || (() => { })}
                                        accept="image/*,video/*"
                                        changeLabel={t.change}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'adgenius' && (
                        <div className="space-y-12">
                            {/* AdGenius Section */}
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-4">{t.adgenius.title}</h2>
                                <p className="text-slate-400 mb-6">
                                    {t.adgenius.subtitle}
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                    <ContentCard
                                        title={t.adgenius.mainTitle}
                                        mediaUrl={adGeniusMainUrl || ''}
                                        mediaType="image"
                                        onFileSelect={onAdGeniusMainUpload || (() => { })}
                                        accept="image/*"
                                        changeLabel={t.change}
                                    />
                                    <ContentCard
                                        title={t.adgenius.collageTitle}
                                        mediaUrl={adGeniusCollageUrl || ''}
                                        mediaType="image"
                                        onFileSelect={onAdGeniusCollageUpload || (() => { })}
                                        accept="image/*"
                                        changeLabel={t.change}
                                    />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-4">🎨 Landing Page Kutuları</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <ContentCard
                                        title={`👗 ${t.adgenius.modelShoot}`}
                                        mediaUrl={props.adGeniusModelUrl || ''}
                                        mediaType="image"
                                        onFileSelect={props.onAdGeniusModelUpload || (() => { })}
                                        accept="image/*,video/*"
                                        changeLabel={t.change}
                                    />
                                    <ContentCard
                                        title={`🎬 ${t.adgenius.campaign}`}
                                        mediaUrl={props.adGeniusCampaignUrl || ''}
                                        mediaType="image"
                                        onFileSelect={props.onAdGeniusCampaignUpload || (() => { })}
                                        accept="image/*,video/*"
                                        changeLabel={t.change}
                                    />
                                    <ContentCard
                                        title={`🎥 ${t.adgenius.adVideo}`}
                                        mediaUrl={props.adGeniusVideoUrl || ''}
                                        mediaType="image"
                                        onFileSelect={props.onAdGeniusVideoUpload || (() => { })}
                                        accept="image/*,video/*"
                                        changeLabel={t.change}
                                    />
                                    <ContentCard
                                        title={`📦 ${t.adgenius.productPlacement}`}
                                        mediaUrl={props.adGeniusProductPlacementUrl || ''}
                                        mediaType="image"
                                        onFileSelect={props.onAdGeniusProductPlacementUpload || (() => { })}
                                        accept="image/*,video/*"
                                        changeLabel={t.change}
                                    />
                                </div>
                            </div>
                        </div>
                    )}



                    {activeTab === 'settings' && <SettingsPanel />}
                    {activeTab === 'users' && <UserActivityPanel currentUserId={props.currentUserId} onRefreshProfile={props.onRefreshProfile} />}
                    {activeTab === 'transactions' && <TransactionsPanel />}
                    {activeTab === 'affiliates' && <AffiliateManagement language={(localStorage.getItem('fasheone_language') as 'tr' | 'en') || 'tr'} />}
                    {activeTab === 'creditReports' && <CreditReportsPanel />}
                </div>
            </main>
        </div>
    );
};
