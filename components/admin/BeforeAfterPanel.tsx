import React, { useState, useEffect, useRef, useCallback } from 'react';
import { uploadBeforeAfterImage, getPublicBeforeAfterImages, deleteBeforeAfterImage } from '../../lib/adminService';

const FEATURE_LABELS_TR = [
    '1. Çizimden Ürüne',
    '2. Canlı Model',
    '3. Video Oluşturma',
    '4. Teknik Çizim',
    '5. Pixshop',
    '6. Fotomatik',
    '7. Kolaj Oluşturma',
    '8. Reklam Medyası',
    '9. E-ticaret Çözümleri',
    '10. 🧩 Widget Sanal Deneme',
];

interface BeforeAfterPanelProps {
    language?: string;
}

export const BeforeAfterPanel: React.FC<BeforeAfterPanelProps> = ({ language = 'tr' }) => {
    const [images, setImages] = useState<Record<string, string>>({});
    const [uploading, setUploading] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Supabase'den mevcut görselleri yükle
    useEffect(() => {
        const load = async () => {
            try {
                const baImages = await getPublicBeforeAfterImages();
                const loaded: Record<string, string> = {};
                for (const item of baImages) {
                    loaded[`ba_feature${item.featureNum}_before`] = item.before;
                    loaded[`ba_feature${item.featureNum}_after`] = item.after;
                }
                setImages(loaded);
            } catch (err) {
                console.error('BA resimler yüklenemedi:', err);
            }
        };
        load();
    }, []);

    const handleUpload = useCallback(async (key: string, file: File) => {
        setUploading(key);
        setError(null);

        // key format: ba_feature{num}_{side}
        const match = key.match(/ba_feature(\d+)_(before|after)/);
        if (!match) {
            setError('Geçersiz anahtar.');
            setUploading(null);
            return;
        }

        const featureNum = parseInt(match[1]);
        const side = match[2] as 'before' | 'after';

        try {
            const result = await uploadBeforeAfterImage(file, featureNum, side);
            if (result.success && result.imageUrl) {
                setImages(prev => ({ ...prev, [key]: result.imageUrl! }));
            } else {
                setError(result.error || 'Yükleme başarısız.');
            }
        } catch (err: any) {
            console.error('Yükleme hatası:', err);
            setError(err.message || 'Yükleme sırasında bir hata oluştu.');
        } finally {
            setUploading(null);
        }
    }, []);

    const handleRemove = useCallback(async (key: string) => {
        const match = key.match(/ba_feature(\d+)_(before|after)/);
        if (!match) return;

        const featureNum = parseInt(match[1]);
        const side = match[2] as 'before' | 'after';

        const success = await deleteBeforeAfterImage(featureNum, side);
        if (success) {
            setImages(prev => {
                const next = { ...prev };
                delete next[key];
                return next;
            });
        }
        setError(null);
    }, []);

    return (
        <div className="space-y-6">
            <div className="mb-4">
                <h3 className="text-xl font-bold text-white mb-1">
                    {language === 'tr' ? '📸 Öncesi / Sonrası Görselleri' : '📸 Before / After Images'}
                </h3>
                <p className="text-slate-400 text-sm">
                    {language === 'tr'
                        ? 'Her özellik kutusu için öncesi ve sonrası görsellerini yükleyin. Görseller Supabase\'e yüklenir ve landing sayfasında tüm ziyaretçilere görünür.'
                        : 'Upload before and after images for each feature. Images are stored in Supabase and visible to all visitors.'}
                </p>
            </div>

            {error && (
                <div className="bg-red-500/20 border border-red-500/30 text-red-300 text-sm p-3 rounded-lg flex items-center gap-2">
                    <span>⚠️</span> {error}
                    <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-300">✕</button>
                </div>
            )}

            <div className="grid gap-6">
                {FEATURE_LABELS_TR.map((label, idx) => {
                    const featureNum = idx + 1;
                    const beforeKey = `ba_feature${featureNum}_before`;
                    const afterKey = `ba_feature${featureNum}_after`;
                    const isWidget = featureNum === 10;
                    const isVideoFeature = featureNum === 3; // Video Oluşturma

                    return (
                        <div key={featureNum} className={`rounded-xl p-5 border ${isWidget ? 'bg-gradient-to-r from-purple-900/30 to-orange-900/30 border-purple-500/30' : 'bg-slate-800/60 border-white/5'}`}>
                            <h4 className="text-white font-semibold mb-1 flex items-center gap-2">
                                <span className={`w-7 h-7 ${isWidget ? 'bg-gradient-to-r from-purple-500/30 to-orange-500/30 text-purple-400' : 'bg-cyan-500/20 text-cyan-400'} rounded-lg flex items-center justify-center text-xs font-bold`}>
                                    {featureNum}
                                </span>
                                {label}
                                {isWidget && (
                                    <span className="ml-auto text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full border border-purple-500/30">Landing Page Widget</span>
                                )}
                                {isVideoFeature && (
                                    <span className="ml-auto text-xs bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full border border-orange-500/30">📹 Video Destekli</span>
                                )}
                            </h4>
                            {isWidget && (
                                <p className="text-xs text-slate-400 mb-3 ml-9">
                                    {language === 'tr'
                                        ? 'Bu görseller landing page\'deki "Sitenize Widget Yerleştirin" bölümünün öncesi/sonrası kutusunda gösterilir.'
                                        : 'These images are shown in the before/after box of the "Add Widget to Your Site" section on the landing page.'}
                                </p>
                            )}
                            <div className={`grid grid-cols-2 gap-4 ${!isWidget ? 'mt-3' : ''}`}>
                                <ImageUploadBox
                                    label={language === 'tr' ? 'Öncesi' : 'Before'}
                                    imageUrl={images[beforeKey]}
                                    isUploading={uploading === beforeKey}
                                    onUpload={(f) => handleUpload(beforeKey, f)}
                                    onRemove={() => handleRemove(beforeKey)}
                                    acceptVideo={isVideoFeature}
                                />
                                <ImageUploadBox
                                    label={language === 'tr' ? 'Sonrası' : 'After'}
                                    imageUrl={images[afterKey]}
                                    isUploading={uploading === afterKey}
                                    onUpload={(f) => handleUpload(afterKey, f)}
                                    onRemove={() => handleRemove(afterKey)}
                                    acceptVideo={isVideoFeature}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

interface ImageUploadBoxProps {
    label: string;
    imageUrl?: string;
    isUploading?: boolean;
    onUpload: (file: File) => void;
    onRemove: () => void;
    acceptVideo?: boolean;
}

const ImageUploadBox: React.FC<ImageUploadBoxProps> = ({ label, imageUrl, isUploading, onUpload, onRemove, acceptVideo }) => {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleClick = () => {
        if (inputRef.current) {
            inputRef.current.value = '';
            inputRef.current.click();
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const maxSize = acceptVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
            if (file.size > maxSize) {
                alert(`Dosya boyutu çok büyük! Maksimum ${acceptVideo ? '50' : '10'}MB.`);
                return;
            }
            onUpload(file);
        }
    };

    const isVideo = imageUrl && /\.(mp4|webm|mov|avi)(\?|$)/i.test(imageUrl);
    const acceptTypes = acceptVideo
        ? 'image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime'
        : 'image/jpeg,image/png,image/webp,image/gif';

    // Video autoplay'i garanti et
    const videoRef = React.useCallback((node: HTMLVideoElement | null) => {
        if (node) {
            node.play().catch(() => { });
        }
    }, []);

    return (
        <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wide">{label}</span>
            {isUploading ? (
                <div className="w-full h-36 border-2 border-dashed border-cyan-500/50 rounded-lg flex flex-col items-center justify-center bg-slate-800/50">
                    <div className="w-6 h-6 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin mb-2" />
                    <span className="text-xs text-cyan-400">Supabase'e yükleniyor...</span>
                </div>
            ) : imageUrl ? (
                <div className="relative group">
                    {isVideo ? (
                        <video
                            ref={videoRef}
                            src={imageUrl}
                            className="w-full h-36 object-cover rounded-lg border border-white/10"
                            autoPlay loop muted playsInline preload="auto"
                        />
                    ) : (
                        <img
                            src={imageUrl}
                            alt={label}
                            className="w-full h-36 object-cover rounded-lg border border-white/10"
                        />
                    )}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                        <button
                            onClick={handleClick}
                            className="bg-cyan-500 hover:bg-cyan-400 text-white text-xs px-3 py-1.5 rounded-lg font-semibold transition"
                        >
                            Değiştir
                        </button>
                        <button
                            onClick={onRemove}
                            className="bg-red-500 hover:bg-red-400 text-white text-xs px-3 py-1.5 rounded-lg font-semibold transition"
                        >
                            Sil
                        </button>
                    </div>
                </div>
            ) : (
                <button
                    onClick={handleClick}
                    className="w-full h-36 border-2 border-dashed border-slate-600 hover:border-cyan-500 rounded-lg flex flex-col items-center justify-center transition-colors cursor-pointer group"
                >
                    {acceptVideo ? (
                        <svg className="w-8 h-8 text-slate-500 group-hover:text-cyan-400 transition-colors mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                    ) : (
                        <svg className="w-8 h-8 text-slate-500 group-hover:text-cyan-400 transition-colors mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    )}
                    <span className="text-xs text-slate-500 group-hover:text-cyan-400 transition-colors">
                        {acceptVideo ? '+ Görsel / Video Yükle' : '+ Görsel Yükle'}
                    </span>
                </button>
            )}
            <input
                ref={inputRef}
                type="file"
                accept={acceptTypes}
                className="hidden"
                onChange={handleChange}
            />
        </div>
    );
};
