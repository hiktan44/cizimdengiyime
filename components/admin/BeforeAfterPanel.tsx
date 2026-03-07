import React, { useState, useEffect, useRef } from 'react';

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
];

interface BeforeAfterPanelProps {
    language?: string;
}

export const BeforeAfterPanel: React.FC<BeforeAfterPanelProps> = ({ language = 'tr' }) => {
    const [images, setImages] = useState<Record<string, string>>({});

    useEffect(() => {
        const loaded: Record<string, string> = {};
        for (let i = 1; i <= 9; i++) {
            const before = localStorage.getItem(`ba_feature${i}_before`);
            const after = localStorage.getItem(`ba_feature${i}_after`);
            if (before) loaded[`ba_feature${i}_before`] = before;
            if (after) loaded[`ba_feature${i}_after`] = after;
        }
        setImages(loaded);
    }, []);

    const handleUpload = (key: string, file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result as string;
            localStorage.setItem(key, base64);
            setImages(prev => ({ ...prev, [key]: base64 }));
        };
        reader.readAsDataURL(file);
    };

    const handleRemove = (key: string) => {
        localStorage.removeItem(key);
        setImages(prev => {
            const next = { ...prev };
            delete next[key];
            return next;
        });
    };

    return (
        <div className="space-y-6">
            <div className="mb-4">
                <h3 className="text-xl font-bold text-white mb-1">
                    {language === 'tr' ? '📸 Öncesi / Sonrası Görselleri' : '📸 Before / After Images'}
                </h3>
                <p className="text-slate-400 text-sm">
                    {language === 'tr'
                        ? 'Her özellik kutusu için öncesi ve sonrası görsellerini yükleyin. Bu görseller landing sayfasında görünecek.'
                        : 'Upload before and after images for each feature box. These will appear on the landing page.'}
                </p>
            </div>

            <div className="grid gap-6">
                {FEATURE_LABELS_TR.map((label, idx) => {
                    const featureNum = idx + 1;
                    const beforeKey = `ba_feature${featureNum}_before`;
                    const afterKey = `ba_feature${featureNum}_after`;

                    return (
                        <div key={featureNum} className="bg-slate-800/60 rounded-xl p-5 border border-white/5">
                            <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                                <span className="w-7 h-7 bg-cyan-500/20 text-cyan-400 rounded-lg flex items-center justify-center text-xs font-bold">
                                    {featureNum}
                                </span>
                                {label}
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                                <ImageUploadBox
                                    label={language === 'tr' ? 'Öncesi' : 'Before'}
                                    imageUrl={images[beforeKey]}
                                    onUpload={(f) => handleUpload(beforeKey, f)}
                                    onRemove={() => handleRemove(beforeKey)}
                                />
                                <ImageUploadBox
                                    label={language === 'tr' ? 'Sonrası' : 'After'}
                                    imageUrl={images[afterKey]}
                                    onUpload={(f) => handleUpload(afterKey, f)}
                                    onRemove={() => handleRemove(afterKey)}
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
    onUpload: (file: File) => void;
    onRemove: () => void;
}

const ImageUploadBox: React.FC<ImageUploadBoxProps> = ({ label, imageUrl, onUpload, onRemove }) => {
    const inputRef = useRef<HTMLInputElement>(null);

    return (
        <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wide">{label}</span>
            {imageUrl ? (
                <div className="relative group">
                    <img
                        src={imageUrl}
                        alt={label}
                        className="w-full h-32 object-cover rounded-lg border border-white/10"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                        <button
                            onClick={() => inputRef.current?.click()}
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
                    onClick={() => inputRef.current?.click()}
                    className="w-full h-32 border-2 border-dashed border-slate-600 hover:border-cyan-500 rounded-lg flex flex-col items-center justify-center transition-colors cursor-pointer group"
                >
                    <svg className="w-8 h-8 text-slate-500 group-hover:text-cyan-400 transition-colors mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-xs text-slate-500 group-hover:text-cyan-400 transition-colors">+ Görsel Yükle</span>
                </button>
            )}
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) onUpload(file);
                    e.target.value = '';
                }}
            />
        </div>
    );
};
