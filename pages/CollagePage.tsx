/**
 * CollagePage - Çoklu Görsel Kompozisyon Aracı
 * Kullanıcılar 2-6 arası görsel yükleyip, bunları yan yana birleştiren yeni görseller oluşturabilir
 */

import React, { useState, useCallback } from 'react';
import { Profile, CREDIT_COSTS } from '../lib/supabase';
import { checkAndDeductCredits, saveGeneration } from '../lib/database';
import { trackEvent, ANALYTICS_EVENTS } from '../utils/analytics';
import { WhatsAppPanel } from '../components/WhatsAppPanel';
import { VideoSettingsModal } from '../components/VideoSettingsModal';
import { VideoGenerationSettings, generateVideoFromImage } from '../services/geminiService';

interface CollagePageProps {
    profile: Profile | null;
    onRefreshProfile: () => void;
    onShowBuyCredits?: () => void;
}

interface UploadedImage {
    id: string;
    file: File;
    preview: string;
}

type Language = 'tr' | 'en';

const translations = {
    tr: {
        title: '🎨 Kolaj Stüdyosu',
        subtitle: 'Birden fazla görseli yan yana birleştirerek yeni kompozisyonlar oluşturun',
        uploadTitle: 'Görselleri Yükleyin',
        uploadDesc: '2-6 arası görsel yükleyebilirsiniz',
        uploadButton: 'Görsel Ekle',
        promptLabel: 'Kompozisyon Talimatı',
        promptPlaceholder: 'Örn: Bu görselleri yan yana koy, arka planı beyaz yap, profesyonel bir katalog görünümü ver...',
        generateButton: 'Kolaj Oluştur',
        generating: 'Kolaj oluşturuluyor...',
        downloadButton: 'İndir',
        clearButton: 'Temizle',
        removeImage: 'Kaldır',
        imageCount: 'görsel',
        minImages: 'En az 2 görsel yüklemelisiniz',
        maxImages: 'En fazla 6 görsel yükleyebilirsiniz',
        loginRequired: 'İşlem yapmak için giriş yapmalısınız',
        insufficientCredits: 'Yetersiz kredi',
        creditCost: 'kredi',
    },
    en: {
        title: '🎨 Collage Studio',
        subtitle: 'Create new compositions by combining multiple images side by side',
        uploadTitle: 'Upload Images',
        uploadDesc: 'You can upload 2-6 images',
        uploadButton: 'Add Image',
        promptLabel: 'Composition Instructions',
        promptPlaceholder: 'E.g: Place these images side by side, white background, professional catalog look...',
        generateButton: 'Create Collage',
        generating: 'Creating collage...',
        downloadButton: 'Download',
        clearButton: 'Clear',
        removeImage: 'Remove',
        imageCount: 'images',
        minImages: 'Please upload at least 2 images',
        maxImages: 'You can upload maximum 6 images',
        loginRequired: 'Please login to continue',
        insufficientCredits: 'Insufficient credits',
        creditCost: 'credits',
    },
};

const whatsappNumber = '+905326121347';
const whatsappMessage = 'Merhaba, Kolaj Stüdyosu hakkında bilgi almak istiyorum.';
const whatsappSubtitle = 'Sorularınız için bize ulaşın';

export const CollagePage: React.FC<CollagePageProps> = ({ profile, onRefreshProfile, onShowBuyCredits }) => {
    const [language] = useState<Language>(() => {
        const saved = localStorage.getItem('fasheone_language') as Language;
        return saved || 'tr';
    });
    const t = translations[language];

    const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
    const [prompt, setPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Video generation states
    const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
    const [isVideoGenerating, setIsVideoGenerating] = useState(false);
    const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);


    // Convert image to PNG if it's in an unsupported format (like AVIF)
    const convertImageToPNG = async (file: File): Promise<File> => {
        // Supported formats by Gemini API
        const supportedFormats = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

        if (supportedFormats.includes(file.type)) {
            return file; // Already supported, return as is
        }

        console.log(`Converting ${file.type} to PNG...`);

        return new Promise((resolve, reject) => {
            const img = new Image();
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;

                if (!ctx) {
                    reject(new Error('Canvas context not available'));
                    return;
                }

                ctx.drawImage(img, 0, 0);

                canvas.toBlob((blob) => {
                    if (!blob) {
                        reject(new Error('Failed to convert image'));
                        return;
                    }

                    const convertedFile = new File(
                        [blob],
                        file.name.replace(/\.[^/.]+$/, '.png'),
                        { type: 'image/png' }
                    );

                    console.log(`✅ Converted ${file.type} to PNG`);
                    resolve(convertedFile);
                }, 'image/png', 0.95);
            };

            img.onerror = () => {
                reject(new Error('Failed to load image for conversion'));
            };

            img.src = URL.createObjectURL(file);
        });
    };

    const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        const newImages: UploadedImage[] = [];

        for (const file of Array.from(files)) {
            if (uploadedImages.length + newImages.length >= 6) break;

            try {
                // Convert to PNG if needed
                const convertedFile = await convertImageToPNG(file);

                const id = Math.random().toString(36).substring(7);
                const preview = URL.createObjectURL(convertedFile);
                newImages.push({ id, file: convertedFile, preview });
            } catch (error) {
                console.error('Error converting image:', error);
                alert(`Resim yüklenirken hata: ${file.name}`);
            }
        }

        setUploadedImages((prev) => [...prev, ...newImages]);
    }, [uploadedImages.length]);

    const handleRemoveImage = useCallback((id: string) => {
        setUploadedImages((prev) => {
            const image = prev.find((img) => img.id === id);
            if (image) URL.revokeObjectURL(image.preview);
            return prev.filter((img) => img.id !== id);
        });
    }, []);

    const handleClear = useCallback(() => {
        uploadedImages.forEach((img) => URL.revokeObjectURL(img.preview));
        setUploadedImages([]);
        setPrompt('');
        setGeneratedImageUrl(null);
    }, [uploadedImages]);

    const handleGenerate = useCallback(async () => {
        if (!profile) {
            alert(t.loginRequired);
            return;
        }

        if (uploadedImages.length < 2) {
            alert(t.minImages);
            return;
        }

        if (!prompt.trim()) {
            alert('Lütfen kompozisyon talimatı girin');
            return;
        }

        // Check credits
        const result = await checkAndDeductCredits(profile.id, 'collage');
        if (!result.success) {
            alert(t.insufficientCredits);
            if (onShowBuyCredits) onShowBuyCredits();
            return;
        }

        setIsGenerating(true);

        try {
            // Generate collage using Gemini API
            console.log('Generating collage with:', {
                imageCount: uploadedImages.length,
                prompt,
            });

            // Import the generateCollage function
            const { generateCollage } = await import('../services/geminiService');

            // Call the API with the uploaded files
            const result = await generateCollage(
                uploadedImages.map(img => img.file),
                prompt,
                '16:9' // Default aspect ratio, can be made configurable later
            );

            setGeneratedImageUrl(result);

            // Save to database
            await saveGeneration(
                profile.id,
                'collage',
                CREDIT_COSTS.COLLAGE,
                uploadedImages[0].preview,
                result,
                null,
                { prompt, imageCount: uploadedImages.length }
            );

            // Refresh profile
            onRefreshProfile();

            // Track analytics
            trackEvent(ANALYTICS_EVENTS.GENERATE_COLLAGE, {
                imageCount: uploadedImages.length,
                userId: profile.id,
            });
        } catch (error) {
            console.error('Collage generation error:', error);
            alert('Bir hata oluştu: ' + (error instanceof Error ? error.message : String(error)));
        } finally {
            setIsGenerating(false);
        }
    }, [profile, uploadedImages, prompt, onRefreshProfile, onShowBuyCredits, t]);


    const handleDownload = useCallback(async (url: string) => {
        const { downloadFile, generateFilename, getFileExtension } = await import('../utils/downloadHelper');
        const extension = getFileExtension(url);
        const filename = generateFilename('kolaj', extension);
        const success = await downloadFile(url, filename);

        if (success) {
            // Track analytics
            trackEvent(ANALYTICS_EVENTS.DOWNLOAD_CONTENT, {
                filename,
                type: 'collage',
                userId: profile?.id
            });
        } else {
            alert('İndirme başarısız oldu. Lütfen tekrar deneyin.');
        }
    }, [profile]);

    const handleVideoGeneration = useCallback(async (settings: VideoGenerationSettings) => {
        if (!profile) {
            alert(t.loginRequired);
            return;
        }

        if (!generatedImageUrl) {
            alert('Önce bir kolaj oluşturmalısınız!');
            return;
        }

        // Check credits
        const result = await checkAndDeductCredits(profile.id, 'video');
        if (!result.success) {
            alert(t.insufficientCredits);
            if (onShowBuyCredits) onShowBuyCredits();
            return;
        }

        setIsVideoModalOpen(false);
        setIsVideoGenerating(true);

        try {
            const videoUrl = await generateVideoFromImage(generatedImageUrl, settings);
            setGeneratedVideoUrl(videoUrl);

            // Save to database
            await saveGeneration(
                profile.id,
                'video',
                CREDIT_COSTS.VIDEO,
                null,
                null,
                videoUrl,
                { settings, source: 'collage' }
            );

            // Refresh profile
            onRefreshProfile();

            // Track analytics
            trackEvent(ANALYTICS_EVENTS.GENERATE_VIDEO, {
                quality: settings.quality,
                source: 'collage',
                userId: profile.id
            });
        } catch (error) {
            console.error('Video generation error:', error);
            alert('Video oluşturulurken hata: ' + (error instanceof Error ? error.message : String(error)));
        } finally {
            setIsVideoGenerating(false);
        }
    }, [profile, generatedImageUrl, onRefreshProfile, onShowBuyCredits, t]);


    return (
        <div className="min-h-screen bg-slate-900 text-white">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-purple-600 mb-4">
                        {t.title}
                    </h1>
                    <p className="text-slate-400 text-lg">{t.subtitle}</p>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Left Column - Upload & Settings */}
                    <div className="space-y-6">
                        {/* Upload Area */}
                        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
                            <h3 className="text-xl font-bold mb-2">{t.uploadTitle}</h3>
                            <p className="text-slate-400 text-sm mb-4">{t.uploadDesc}</p>

                            {/* Image Grid */}
                            <div className="grid grid-cols-3 gap-4 mb-4">
                                {uploadedImages.map((img) => (
                                    <div key={img.id} className="relative aspect-square rounded-lg overflow-hidden group">
                                        <img src={img.preview} alt="" className="w-full h-full object-cover" />
                                        <button
                                            onClick={() => handleRemoveImage(img.id)}
                                            className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {/* Upload Button */}
                            {uploadedImages.length < 6 && (
                                <label className="block">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleImageUpload}
                                        className="hidden"
                                    />
                                    <div className="border-2 border-dashed border-slate-600 rounded-xl p-6 text-center cursor-pointer hover:border-purple-500 transition-colors">
                                        <svg className="w-12 h-12 mx-auto mb-2 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                        <p className="text-slate-400">{t.uploadButton}</p>
                                        <p className="text-xs text-slate-500 mt-1">
                                            {uploadedImages.length}/6 {t.imageCount}
                                        </p>
                                    </div>
                                </label>
                            )}
                        </div>

                        {/* Prompt Input */}
                        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
                            <label className="block text-sm font-medium mb-2">{t.promptLabel}</label>
                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder={t.promptPlaceholder}
                                rows={4}
                                className="w-full bg-slate-900 border border-slate-600 rounded-xl p-4 text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4">
                            <button
                                onClick={handleGenerate}
                                disabled={isGenerating || uploadedImages.length < 2 || !prompt.trim()}
                                className="flex-1 py-4 bg-gradient-to-r from-pink-600 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isGenerating ? t.generating : `✨ ${t.generateButton}`}
                            </button>
                            <button
                                onClick={handleClear}
                                className="px-6 py-4 bg-slate-700 text-white font-bold rounded-xl hover:bg-slate-600 transition-colors"
                            >
                                {t.clearButton}
                            </button>
                        </div>

                        {/* Credit Info */}
                        <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4 text-center">
                            <span className="text-sm text-slate-300">
                                Kolaj oluşturma: <span className="text-purple-400 font-bold text-lg">{CREDIT_COSTS.COLLAGE} {t.creditCost}</span>
                            </span>
                        </div>
                    </div>

                    {/* Right Column - Result */}
                    <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
                        <h3 className="text-xl font-bold mb-4">Sonuç</h3>
                        <div className="aspect-square bg-slate-900 rounded-xl flex items-center justify-center overflow-hidden">
                            {isGenerating ? (
                                <div className="text-center">
                                    <div className="w-16 h-16 border-4 border-slate-700 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
                                    <p className="text-slate-400">{t.generating}</p>
                                </div>
                            ) : generatedImageUrl ? (
                                <div className="relative w-full h-full group">
                                    <img
                                        src={generatedImageUrl}
                                        alt="Generated collage"
                                        className="w-full h-full object-contain cursor-pointer transition-transform hover:scale-105"
                                        onClick={() => setIsModalOpen(true)}
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors pointer-events-none flex items-center justify-center">
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-purple-600 text-white px-4 py-2 rounded-lg font-medium">
                                            🔍 Detaylı Görüntüle
                                        </div>
                                    </div>
                                    <div className="absolute bottom-4 left-4 right-4 flex gap-2">
                                        <button
                                            onClick={() => setIsVideoModalOpen(true)}
                                            disabled={isVideoGenerating}
                                            className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-3 rounded-xl font-bold transition-colors shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            {isVideoGenerating ? 'Video Oluşturuluyor...' : '🎬 Video Oluştur'}
                                        </button>
                                        <button
                                            onClick={() => handleDownload(generatedImageUrl)}
                                            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-bold transition-colors shadow-lg"
                                        >
                                            📥 {t.downloadButton}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center text-slate-500">
                                    <svg className="w-24 h-24 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <p>Kolaj burada görünecek</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Premium Image Modal */}
            {isModalOpen && generatedImageUrl && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-fadeIn"
                    onClick={() => setIsModalOpen(false)}
                >
                    <div
                        className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close Button */}
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-4 right-4 z-10 bg-slate-800/90 hover:bg-slate-700 text-white p-3 rounded-full transition-all shadow-lg hover:shadow-xl"
                            aria-label="Close"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        {/* Download Button */}
                        <button
                            onClick={() => handleDownload(generatedImageUrl)}
                            className="absolute top-4 left-4 z-10 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            {t.downloadButton}
                        </button>

                        {/* Image Container with Zoom */}
                        <div className="relative w-full h-full flex items-center justify-center">
                            <img
                                src={generatedImageUrl}
                                alt="Generated collage - Full view"
                                className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl transition-transform hover:scale-105 cursor-zoom-in"
                                style={{
                                    animation: 'scaleIn 0.3s ease-out',
                                }}
                            />
                        </div>

                        {/* Info Badge */}
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-slate-800/90 backdrop-blur-sm px-6 py-3 rounded-full text-white text-sm font-medium shadow-lg">
                            🎨 Kolaj Detay Görünümü
                        </div>
                    </div>
                </div>
            )}

            {/* Video Display Section */}
            {generatedVideoUrl && (
                <div className="max-w-7xl mx-auto px-4 pb-8">
                    <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-white">🎬 Oluşturulan Video</h3>
                            <button
                                onClick={async () => {
                                    const { downloadFile, generateFilename } = await import('../utils/downloadHelper');
                                    const filename = generateFilename('kolaj-video', 'mp4');
                                    await downloadFile(generatedVideoUrl, filename);
                                }}
                                className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2 rounded-xl font-bold transition-colors shadow-lg flex items-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Videoyu İndir
                            </button>
                        </div>
                        <div className="aspect-video bg-black rounded-xl overflow-hidden">
                            <video
                                src={generatedVideoUrl}
                                controls
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="w-full h-full"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Video Settings Modal */}
            <VideoSettingsModal
                isOpen={isVideoModalOpen}
                isGenerating={isVideoGenerating}
                onClose={() => setIsVideoModalOpen(false)}
                onGenerate={handleVideoGeneration}
            />

            <WhatsAppPanel
                phoneNumber={whatsappNumber}
                message={whatsappMessage}
                title="WhatsApp"
                subtitle={whatsappSubtitle}
            />
        </div>
    );
};

export default CollagePage;
