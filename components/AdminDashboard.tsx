import React, { useState, useRef } from 'react';
import { Header } from './Header';
import { UploadIconSmall } from './icons/UploadIconSmall';
import { SettingsPanel } from './admin/SettingsPanel';
import { UserActivityPanel } from './admin/UserActivityPanel';
import { TransactionsPanel } from './admin/TransactionsPanel';

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
}

const ContentCard: React.FC<{
    title: string;
    mediaUrl: string;
    mediaType: 'image' | 'video';
    onFileSelect: (file: File) => void;
    accept: string;
}> = ({ title, mediaUrl, mediaType, onFileSelect, accept }) => {
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
                Değiştir
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
        ...headerProps 
    } = props;

    const [activeTab, setActiveTab] = useState<'content' | 'settings' | 'users' | 'transactions'>('content');

    const tabs = [
        { id: 'content' as const, label: '📸 İçerik Yönetimi', icon: '📸' },
        { id: 'settings' as const, label: '⚙️ Ayarlar', icon: '⚙️' },
        { id: 'users' as const, label: '👥 Kullanıcı Aktivitesi', icon: '👥' },
        { id: 'transactions' as const, label: '💳 Ödemeler', icon: '💳' },
    ];

    return (
        <div className="min-h-screen flex flex-col bg-slate-900 text-slate-200">
            <Header {...headerProps} onHomeClick={onNavigateHome} />
            <main className="flex-grow container mx-auto p-4 md:p-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-extrabold text-white mb-2">Admin Paneli</h1>
                    <p className="text-slate-400">
                        Sistemin tüm yönetim fonksiyonlarına buradan erişebilirsiniz.
                    </p>
                </div>

                {/* Tab Navigation */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-2 mb-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-4 py-3 rounded-xl font-semibold text-sm md:text-base transition-all ${
                                    activeTab === tab.id
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
                                <h2 className="text-2xl font-bold text-white mb-4">🎬 Hero Gömülü Videolar (4 Adet)</h2>
                                <p className="text-slate-400 mb-6">
                                    Hero bölümünde arka planda sırayla dönecek 4 videoyu yükleyin. Videolar otomatik olarak geçiş yapacak.
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <ContentCard
                                        title="Hero Video 1"
                                        mediaUrl={heroVideoUrl || ''}
                                        mediaType="video"
                                        onFileSelect={onHeroVideoUpload || (() => {})}
                                        accept="video/*"
                                    />
                                    <ContentCard
                                        title="Hero Video 2"
                                        mediaUrl={heroVideo1Url || ''}
                                        mediaType="video"
                                        onFileSelect={onHeroVideo1Upload || (() => {})}
                                        accept="video/*"
                                    />
                                    <ContentCard
                                        title="Hero Video 3"
                                        mediaUrl={heroVideo2Url || ''}
                                        mediaType="video"
                                        onFileSelect={onHeroVideo2Upload || (() => {})}
                                        accept="video/*"
                                    />
                                    <ContentCard
                                        title="Hero Video 4"
                                        mediaUrl={heroVideo3Url || ''}
                                        mediaType="video"
                                        onFileSelect={onHeroVideo3Upload || (() => {})}
                                        accept="video/*"
                                    />
                                </div>
                            </div>

                            {/* Showcase Section */}
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-4">📸 Showcase Görselleri</h2>
                                <p className="text-slate-400 mb-6">
                                    Çizimden gerçeğe dönüşüm örnekleri için görselleri yükleyin.
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <ContentCard
                                        title="1. Çizim (Sketch)"
                                        mediaUrl={sketchUrl}
                                        mediaType="image"
                                        onFileSelect={onSketchUpload}
                                        accept="image/*"
                                    />
                                    <ContentCard
                                        title="2. Ürün (Product)"
                                        mediaUrl={productUrl}
                                        mediaType="image"
                                        onFileSelect={onProductUpload}
                                        accept="image/*"
                                    />
                                    <ContentCard
                                        title="3. Model (Live)"
                                        mediaUrl={modelUrl}
                                        mediaType="image"
                                        onFileSelect={onModelUpload}
                                        accept="image/*"
                                    />
                                    <ContentCard
                                        title="4. Video"
                                        mediaUrl={videoUrl}
                                        mediaType="video"
                                        onFileSelect={onVideoUpload}
                                        accept="video/*"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'settings' && <SettingsPanel />}
                    {activeTab === 'users' && <UserActivityPanel />}
                    {activeTab === 'transactions' && <TransactionsPanel />}
                </div>
            </main>
        </div>
    );
};
