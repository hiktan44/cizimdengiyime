import React, { useCallback } from 'react';
import { ProductItem } from '../services/geminiService';

interface ProductItemEditorProps {
    product: ProductItem;
    onUpdate: (updated: ProductItem) => void;
    onRemove: () => void;
    onEnlarge?: () => void;
}

export const ProductItemEditor: React.FC<ProductItemEditorProps> = ({ product, onUpdate, onRemove, onEnlarge }) => {
    const handleImageChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const { fileToBase64 } = await import('../utils/fileUtils');
            const preview = await fileToBase64(file);
            onUpdate({ ...product, file, preview });
        }
    }, [product, onUpdate]);

    const getPreview = () => {
        if (product.preview) return product.preview;
        if (typeof product.file === 'string' && product.file) return product.file;
        return null; // Return null instead of "" to satisfy React
    };

    return (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-4">
            <div className="flex gap-4">
                {/* Product Image Preview & Replace */}
                <div className="relative group w-24 h-24 flex-shrink-0">
                    {getPreview() ? (
                        <img
                            src={getPreview()!}
                            alt={product.name}
                            className="w-full h-full object-cover rounded-lg border border-slate-600 cursor-zoom-in"
                            onClick={() => onEnlarge?.()}
                        />
                    ) : (
                        <div className="w-full h-full bg-slate-900 rounded-lg border border-slate-700 flex items-center justify-center">
                            <span className="text-slate-600 text-[10px]">Görsel Yok</span>
                        </div>
                    )}
                    <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity rounded-lg">
                        <span className="text-[10px] font-bold text-white text-center px-1">Görseli Değiştir</span>
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageChange}
                        />
                    </label>
                </div>

                {/* Name & Price */}
                <div className="flex-1 space-y-2">
                    <div>
                        <input
                            type="text"
                            value={product.name}
                            onChange={(e) => onUpdate({ ...product, name: e.target.value })}
                            placeholder="Ürün Adı"
                            className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-1.5 text-sm text-white focus:ring-1 focus:ring-purple-500 outline-none"
                        />
                    </div>
                    <div>
                        <input
                            type="text"
                            value={product.price || ''}
                            onChange={(e) => onUpdate({ ...product, price: e.target.value })}
                            placeholder="Fiyat (Örn: 1499 TL)"
                            className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-1.5 text-sm text-white focus:ring-1 focus:ring-purple-500 outline-none"
                        />
                    </div>
                </div>

                {/* Remove Button */}
                <button
                    onClick={onRemove}
                    className="self-start text-slate-500 hover:text-red-500 transition-colors"
                    title="Kaldır"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* Description */}
            <div>
                <div className="relative">
                    <textarea
                        value={product.description || ''}
                        onChange={(e) => onUpdate({ ...product, description: e.target.value })}
                        placeholder="Ürün Açıklaması (Opsiyonel)"
                        rows={2}
                        className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-1.5 text-xs text-white focus:ring-1 focus:ring-purple-500 outline-none resize-y min-h-[60px]"
                    />
                    <div className="absolute bottom-1 right-1 text-slate-600 pointer-events-none opacity-50">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 13v6m0 0h-6m6 0L13 13" />
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    );
};
