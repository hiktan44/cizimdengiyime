
import React, { useRef } from 'react';
import { Header } from './Header';
import { UploadIconSmall } from './icons/UploadIconSmall';

interface AdminDashboardProps {
    onNavigateHome: () => void;
    isLoggedIn: boolean;
    userRole: 'admin' | 'user' | null;
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
    const { onNavigateHome, ...headerProps } = props;

    return (
        <div className="min-h-screen flex flex-col bg-slate-900 text-slate-200">
            <Header {...headerProps} onHomeClick={onNavigateHome} />
            <main className="flex-grow container mx-auto p-4 md:p-8">
                <h1 className="text-3xl font-extrabold mb-8 text-white">Admin Paneli</h1>
                <p className="text-slate-400 mb-8 max-w-3xl">
                    Bu panelden ana sayfada gösterilen içerikleri yönetebilirsiniz. Değişiklikleriniz tarayıcınızda saklanır. 
                </p>

                {/* Hero Gömülü Videolar Section - 4 Adet */}
                <div className="mb-12">
                    <h2 className="text-2xl font-bold text-white mb-4">🎬 Hero Gömülü Videolar (4 Adet)</h2>
                    <p className="text-slate-400 mb-6">
                        Hero bölümünde arka planda sırayla dönecek 4 videoyu yükleyin. Videolar otomatik olarak geçiş yapacak.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <ContentCard
                            title="Hero Video 1"
                            mediaUrl={props.heroVideoUrl || ''}
                            mediaType="video"
                            onFileSelect={props.onHeroVideoUpload || (() => {})}
                            accept="video/*"
                        />
                        <ContentCard
                            title="Hero Video 2"
                            mediaUrl={props.heroVideo1Url || ''}
                            mediaType="video"
                            onFileSelect={props.onHeroVideo1Upload || (() => {})}
                            accept="video/*"
                        />
                        <ContentCard
                            title="Hero Video 3"
                            mediaUrl={props.heroVideo2Url || ''}
                            mediaType="video"
                            onFileSelect={props.onHeroVideo2Upload || (() => {})}
                            accept="video/*"
                        />
                        <ContentCard
                            title="Hero Video 4"
                            mediaUrl={props.heroVideo3Url || ''}
                            mediaType="video"
                            onFileSelect={props.onHeroVideo3Upload || (() => {})}
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
                        mediaUrl={props.sketchUrl}
                        mediaType="image"
                        onFileSelect={props.onSketchUpload}
                        accept="image/*"
                    />
                    <ContentCard
                        title="2. Ürün (Product)"
                        mediaUrl={props.productUrl}
                        mediaType="image"
                        onFileSelect={props.onProductUpload}
                        accept="image/*"
                    />
                    <ContentCard
                        title="3. Model (Live)"
                        mediaUrl={props.modelUrl}
                        mediaType="image"
                        onFileSelect={props.onModelUpload}
                        accept="image/*"
                    />
                    <ContentCard
                        title="4. Video"
                        mediaUrl={props.videoUrl}
                        mediaType="video"
                        onFileSelect={props.onVideoUpload}
                        accept="video/*"
                    />
                    </div>
                </div>
            </main>
        </div>
    );
};
