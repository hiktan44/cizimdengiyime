import React, { useEffect, useState } from 'react';
import { supabase, Generation } from '../lib/supabase';
import { getUserGenerations } from '../lib/database';
import { HistoryIcon } from './icons/HistoryIcon';

interface HistoryPanelProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({ isOpen, onClose, userId }) => {
    const [generations, setGenerations] = useState<Generation[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const LIMIT = 5;

    const fetchHistory = async (pageNumber: number) => {
        setIsLoading(true);
        try {
            const data = await getUserGenerations(userId, pageNumber, LIMIT);

            if (data.length < LIMIT) {
                setHasMore(false);
            }

            if (pageNumber === 1) {
                setGenerations(data);
            } else {
                setGenerations(prev => [...prev, ...data]);
            }
        } catch (error) {
            console.error('Failed to load history', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen && userId) {
            setGenerations([]);
            setPage(1);
            setHasMore(true);
            fetchHistory(1);
        }
    }, [isOpen, userId]);

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchHistory(nextPage);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex justify-end">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            ></div>

            <div className="relative w-full max-w-md h-full bg-slate-900 border-l border-slate-700 shadow-2xl flex flex-col animate-slide-in-right">
                <div className="p-4 border-b border-slate-700 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-white font-bold">
                        <HistoryIcon />
                        <h2>Geçmiş Çalışmalarım</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-4 bg-slate-800/50 border-b border-slate-700">
                    <p className="text-xs text-slate-400 text-center">
                        Geçmiş çalışmalarınız burada listelenir.
                    </p>
                </div>

                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    {generations.length === 0 && !isLoading ? (
                        <div className="text-center py-10 text-slate-500">
                            <p>Henüz kayıtlı bir çalışmanız yok.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-3 mb-4">
                            {generations.map((gen) => (
                                <div key={gen.id} className="group relative aspect-[3/4] bg-slate-800 rounded-lg overflow-hidden border border-slate-700">
                                    {/* Image/Video Thumbnail */}
                                    {gen.output_image_url ? (
                                        <img
                                            src={gen.output_image_url}
                                            alt="Generation"
                                            className="w-full h-full object-cover"
                                            onClick={() => setSelectedImage(gen.output_image_url)}
                                        />
                                    ) : gen.output_video_url ? (
                                        <video
                                            src={gen.output_video_url}
                                            className="w-full h-full object-cover"
                                            controls={false}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-600 font-mono text-xs">
                                            No Media
                                        </div>
                                    )}

                                    {/* Overlay Info */}
                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-2">
                                        <p className="text-[10px] text-slate-300">
                                            {new Date(gen.created_at).toLocaleDateString('tr-TR')}
                                        </p>
                                        <p className="text-[10px] font-semibold text-white truncate">
                                            {gen.type === 'sketch_to_product' ? 'Ürün Dönüşümü' :
                                                gen.type === 'product_to_model' ? 'Model Çekimi' :
                                                    gen.type === 'video' ? 'Video' :
                                                        gen.type === 'tech_sketch' ? 'Teknik Çizim' : 'Diğer'}
                                        </p>
                                    </div>

                                    {/* Actions */}
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        <a
                                            href={gen.output_image_url || gen.output_video_url || '#'}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-sm"
                                            title="Görüntüle"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        </a>
                                        <a
                                            href={gen.output_image_url || gen.output_video_url || '#'}
                                            download={`fasheone-${gen.type}-${gen.id}`}
                                            className="p-2 bg-cyan-600/80 hover:bg-cyan-600 rounded-full text-white backdrop-blur-sm"
                                            title="İndir"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                            </svg>
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {isLoading && (
                        <div className="flex justify-center py-4">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
                        </div>
                    )}

                    {!isLoading && hasMore && generations.length > 0 && (
                        <button
                            onClick={handleLoadMore}
                            className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors text-sm font-medium border border-slate-700"
                        >
                            Devamını Yükle
                        </button>
                    )}
                </div>
            </div>

            {/* Lightbox for Image Preview */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-[250] bg-black/90 flex items-center justify-center p-4 cursor-pointer"
                    onClick={() => setSelectedImage(null)}
                >
                    <img
                        src={selectedImage}
                        alt="Full Preview"
                        className="max-w-full max-h-screen object-contain"
                    />
                    <button
                        className="absolute top-4 right-4 text-white hover:text-gray-300"
                        onClick={() => setSelectedImage(null)}
                    >
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            )}
        </div>
    );
};
