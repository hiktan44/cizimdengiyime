/**
 * Fotomatik Batch Processor Component
 * Toplu görsel işleme: arka plan kaldırma, retouch, katalog hazırlama
 */

import React, { useState, useCallback } from 'react';
import { FotomatikImageFile } from '../../types/fotomatik';
import { processFile } from './fileUtils';
import {
    fotomatikRemoveBackground,
    fotomatikRetouch,
    fotomatikCatalogPrep,
    BatchOperationType
} from '../../services/fotomatikService';

interface BatchImage {
    id: string;
    file: File;
    previewUrl: string;
    base64: string;
    mimeType: string;
    status: 'pending' | 'processing' | 'completed' | 'error';
    processedUrl?: string;
    error?: string;
}

interface BatchProcessorProps {
    onCreditsRequired: (count: number) => Promise<boolean>;
    onSaveToHistory: (outputUrl: string, settings: Record<string, any>) => Promise<void>;
    creditCost: number;
    userCredits: number;
}

type RetouchLevel = 'light' | 'medium' | 'heavy';
type CatalogStyle = 'ecommerce' | 'social' | 'minimal';

export const BatchProcessor: React.FC<BatchProcessorProps> = ({
    onCreditsRequired,
    onSaveToHistory,
    creditCost,
    userCredits
}) => {
    const [images, setImages] = useState<BatchImage[]>([]);
    const [operation, setOperation] = useState<BatchOperationType>('remove_bg');
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState({ current: 0, total: 0 });
    const [retouchLevel, setRetouchLevel] = useState<RetouchLevel>('medium');
    const [catalogStyle, setCatalogStyle] = useState<CatalogStyle>('ecommerce');

    const maxImages = 30;

    const operations = [
        {
            id: 'remove_bg' as BatchOperationType,
            label: '🎯 Arka Plan Kaldır',
            desc: 'Görsellerin arka planını kaldırır',
            color: 'from-red-500 to-pink-600'
        },
        {
            id: 'retouch' as BatchOperationType,
            label: '✨ Toplu Retouch',
            desc: 'Profesyonel düzenleme ve iyileştirme',
            color: 'from-purple-500 to-indigo-600'
        },
        {
            id: 'catalog' as BatchOperationType,
            label: '📦 Katalog Hazırla',
            desc: 'E-ticaret için optimize görsel',
            color: 'from-cyan-500 to-blue-600'
        },
    ];

    const handleFileDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const fileList = e.dataTransfer.files;
        const files: File[] = [];
        for (let i = 0; i < fileList.length; i++) {
            const file = fileList[i];
            if (file.type.startsWith('image/')) {
                files.push(file);
            }
        }
        await addFiles(files);
    }, [images]);

    const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const fileList = e.target.files;
        const files: File[] = [];
        if (fileList) {
            for (let i = 0; i < fileList.length; i++) {
                const file = fileList[i];
                if (file.type.startsWith('image/')) {
                    files.push(file);
                }
            }
        }
        await addFiles(files);
        e.target.value = '';
    }, [images]);

    const addFiles = async (files: File[]) => {
        const remaining = maxImages - images.length;
        const toAdd = files.slice(0, remaining);

        const newImages: BatchImage[] = await Promise.all(
            toAdd.map(async (file) => {
                const processed = await processFile(file);
                return {
                    id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    file,
                    previewUrl: processed.previewUrl,
                    base64: processed.base64,
                    mimeType: processed.mimeType,
                    status: 'pending' as const
                };
            })
        );

        setImages(prev => [...prev, ...newImages]);
    };

    const removeImage = (id: string) => {
        setImages(prev => prev.filter(img => img.id !== id));
    };

    const clearAll = () => {
        setImages([]);
        setProgress({ current: 0, total: 0 });
    };

    const processImages = async () => {
        if (images.length === 0) return;

        const pendingImages = images.filter(img => img.status === 'pending' || img.status === 'error');
        if (pendingImages.length === 0) return;

        // Check credits
        const totalCredits = pendingImages.length * creditCost;
        const hasCredits = await onCreditsRequired(totalCredits);
        if (!hasCredits) return;

        setIsProcessing(true);
        setProgress({ current: 0, total: pendingImages.length });

        for (let i = 0; i < pendingImages.length; i++) {
            const img = pendingImages[i];

            // Update status to processing
            setImages(prev => prev.map(p =>
                p.id === img.id ? { ...p, status: 'processing' as const } : p
            ));

            try {
                let result: string;

                switch (operation) {
                    case 'remove_bg':
                        result = await fotomatikRemoveBackground(img.base64, img.mimeType);
                        break;
                    case 'retouch':
                        result = await fotomatikRetouch(img.base64, img.mimeType, retouchLevel);
                        break;
                    case 'catalog':
                        result = await fotomatikCatalogPrep(img.base64, img.mimeType, catalogStyle);
                        break;
                    default:
                        result = await fotomatikRemoveBackground(img.base64, img.mimeType);
                }

                // Update with success
                setImages(prev => prev.map(p =>
                    p.id === img.id ? { ...p, status: 'completed' as const, processedUrl: result } : p
                ));

                // Save to history
                await onSaveToHistory(result, {
                    operation,
                    retouchLevel: operation === 'retouch' ? retouchLevel : undefined,
                    catalogStyle: operation === 'catalog' ? catalogStyle : undefined,
                    batchId: img.id
                });

            } catch (error: any) {
                // Update with error
                setImages(prev => prev.map(p =>
                    p.id === img.id ? { ...p, status: 'error' as const, error: error.message } : p
                ));
            }

            setProgress({ current: i + 1, total: pendingImages.length });

            // Small delay between requests to avoid rate limiting
            if (i < pendingImages.length - 1) {
                await new Promise(r => setTimeout(r, 500));
            }
        }

        setIsProcessing(false);
    };

    const downloadAll = async () => {
        const completedImages = images.filter(img => img.status === 'completed' && img.processedUrl);
        if (completedImages.length === 0) return;

        // Download each image as real PNG file
        for (let i = 0; i < completedImages.length; i++) {
            const img = completedImages[i];

            try {
                // Convert base64 to blob
                const base64Data = img.processedUrl!.split(',')[1];
                const byteCharacters = atob(base64Data);
                const byteNumbers = new Array(byteCharacters.length);
                for (let j = 0; j < byteCharacters.length; j++) {
                    byteNumbers[j] = byteCharacters.charCodeAt(j);
                }
                const byteArray = new Uint8Array(byteNumbers);
                const blob = new Blob([byteArray], { type: 'image/png' });

                // Create download link
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `fotomatik-${operation}-${i + 1}-${Date.now()}.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);

                // Small delay between downloads
                if (i < completedImages.length - 1) {
                    await new Promise(r => setTimeout(r, 300));
                }
            } catch (error) {
                console.error('Download error:', error);
            }
        }
    };

    const completedCount = images.filter(img => img.status === 'completed').length;
    const pendingCount = images.filter(img => img.status === 'pending' || img.status === 'error').length;
    const estimatedCredits = pendingCount * creditCost;

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Operation Selection */}
            <div className="grid md:grid-cols-3 gap-4">
                {operations.map((op) => (
                    <button
                        key={op.id}
                        onClick={() => setOperation(op.id)}
                        disabled={isProcessing}
                        className={`p-6 rounded-2xl border-2 transition-all text-left ${operation === op.id
                            ? `bg-gradient-to-br ${op.color} border-transparent shadow-lg`
                            : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                            } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <span className="text-2xl block mb-2">{op.label.split(' ')[0]}</span>
                        <span className="font-bold text-lg block">{op.label.split(' ').slice(1).join(' ')}</span>
                        <span className="text-sm text-slate-300 block mt-1">{op.desc}</span>
                    </button>
                ))}
            </div>

            {/* Operation-specific Options */}
            {operation === 'retouch' && (
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                    <label className="block text-sm font-medium text-slate-300 mb-3">Retouch Seviyesi</label>
                    <div className="flex gap-3">
                        {(['light', 'medium', 'heavy'] as RetouchLevel[]).map((level) => (
                            <button
                                key={level}
                                onClick={() => setRetouchLevel(level)}
                                disabled={isProcessing}
                                className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${retouchLevel === level
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                    }`}
                            >
                                {level === 'light' && '🌱 Hafif'}
                                {level === 'medium' && '⚡ Orta'}
                                {level === 'heavy' && '🔥 Yoğun'}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {operation === 'catalog' && (
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                    <label className="block text-sm font-medium text-slate-300 mb-3">Katalog Stili</label>
                    <div className="flex gap-3">
                        {([
                            { id: 'ecommerce' as CatalogStyle, label: '🛒 E-Ticaret', desc: 'Amazon/Shopify' },
                            { id: 'social' as CatalogStyle, label: '📱 Sosyal Medya', desc: 'Instagram/TikTok' },
                            { id: 'minimal' as CatalogStyle, label: '✨ Minimal', desc: 'Lüks Markalar' },
                        ]).map((style) => (
                            <button
                                key={style.id}
                                onClick={() => setCatalogStyle(style.id)}
                                disabled={isProcessing}
                                className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${catalogStyle === style.id
                                    ? 'bg-cyan-600 text-white'
                                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                    }`}
                            >
                                <span className="block">{style.label}</span>
                                <span className="text-xs opacity-70">{style.desc}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Upload Area */}
            <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleFileDrop}
                className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${images.length >= maxImages
                    ? 'border-slate-600 bg-slate-800/30 cursor-not-allowed'
                    : 'border-slate-600 hover:border-cyan-500/50 bg-slate-800/50 cursor-pointer'
                    }`}
            >
                <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileSelect}
                    disabled={isProcessing || images.length >= maxImages}
                    className="hidden"
                    id="batch-upload"
                />
                <label htmlFor="batch-upload" className={images.length >= maxImages ? 'cursor-not-allowed' : 'cursor-pointer'}>
                    <div className="text-5xl mb-4">📸</div>
                    <p className="text-xl font-bold text-slate-200 mb-2">
                        {images.length >= maxImages
                            ? `Maksimum ${maxImages} görsel yüklenebilir`
                            : 'Görselleri sürükleyin veya tıklayın'}
                    </p>
                    <p className="text-sm text-slate-400">
                        PNG, JPG, WEBP • Maks {maxImages} görsel • Her biri maks 10MB
                    </p>
                </label>
            </div>

            {/* Images Grid */}
            {images.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-slate-300">
                            <span className="font-bold text-cyan-400">{images.length}</span> görsel yüklendi
                            {completedCount > 0 && (
                                <span className="ml-2 text-emerald-400">• {completedCount} tamamlandı</span>
                            )}
                        </span>
                        <button
                            onClick={clearAll}
                            disabled={isProcessing}
                            className="text-sm text-red-400 hover:text-red-300 disabled:opacity-50"
                        >
                            Tümünü Temizle
                        </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {images.map((img) => (
                            <div
                                key={img.id}
                                className={`relative group rounded-xl overflow-hidden border-2 transition-all ${img.status === 'completed'
                                    ? 'border-emerald-500/50'
                                    : img.status === 'error'
                                        ? 'border-red-500/50'
                                        : img.status === 'processing'
                                            ? 'border-yellow-500/50'
                                            : 'border-slate-700'
                                    }`}
                            >
                                <img
                                    src={img.processedUrl || img.previewUrl}
                                    alt="Preview"
                                    className="w-full aspect-square object-cover"
                                />

                                {/* Status Overlay */}
                                {img.status === 'processing' && (
                                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                                        <div className="w-10 h-10 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                )}

                                {img.status === 'completed' && (
                                    <div className="absolute top-2 right-2 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                                        <span className="text-white">✓</span>
                                    </div>
                                )}

                                {img.status === 'error' && (
                                    <div className="absolute inset-0 bg-red-900/70 flex items-center justify-center p-2">
                                        <span className="text-red-200 text-xs text-center">{img.error || 'Hata'}</span>
                                    </div>
                                )}

                                {/* Remove Button */}
                                {!isProcessing && img.status !== 'processing' && (
                                    <button
                                        onClick={() => removeImage(img.id)}
                                        className="absolute top-2 left-2 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <span className="text-white text-sm">×</span>
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Progress Bar */}
            {isProcessing && (
                <div className="bg-slate-800/50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-slate-300">İşleniyor...</span>
                        <span className="text-cyan-400 font-bold">{progress.current} / {progress.total}</span>
                    </div>
                    <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300"
                            style={{ width: `${(progress.current / progress.total) * 100}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            {images.length > 0 && (
                <div className="flex gap-4">
                    <button
                        onClick={processImages}
                        disabled={isProcessing || pendingCount === 0}
                        className={`flex-1 py-4 bg-gradient-to-r ${operations.find(o => o.id === operation)?.color || 'from-cyan-500 to-blue-600'} text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        {isProcessing
                            ? `İşleniyor... (${progress.current}/${progress.total})`
                            : pendingCount === 0
                                ? '✓ Tamamlandı'
                                : `🚀 ${pendingCount} Görseli İşle (${estimatedCredits} Kredi)`
                        }
                    </button>

                    {completedCount > 0 && (
                        <button
                            onClick={downloadAll}
                            disabled={isProcessing}
                            className="px-8 py-4 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-500 transition-all disabled:opacity-50"
                        >
                            📥 {completedCount > 1 ? `${completedCount} Görseli İndir (ZIP)` : 'İndir'}
                        </button>
                    )}
                </div>
            )}

            {/* Credit Warning */}
            {images.length > 0 && pendingCount > 0 && (
                <div className={`p-4 rounded-xl text-center ${estimatedCredits > userCredits
                    ? 'bg-red-500/20 border border-red-500/30 text-red-300'
                    : 'bg-slate-800/50 border border-slate-700 text-slate-400'
                    }`}>
                    {estimatedCredits > userCredits ? (
                        <>
                            ⚠️ <span className="font-bold">{estimatedCredits} kredi</span> gerekiyor,
                            <span className="font-bold"> {userCredits} krediniz</span> var.
                            Lütfen kredi satın alın.
                        </>
                    ) : (
                        <>
                            Bu işlem toplam <span className="text-cyan-400 font-bold">{estimatedCredits} kredi</span> harcayacak.
                            Mevcut: <span className="text-cyan-400 font-bold">{userCredits} kredi</span>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};
