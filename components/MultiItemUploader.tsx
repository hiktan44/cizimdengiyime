import React, { useState, useRef } from 'react';

interface MultiItem {
    file: File;
    preview: string;
    label: string; // AI tarafından analiz edilecek (gömlek, yelek, mont vb.)
}

interface MultiItemUploaderProps {
    items: MultiItem[];
    onItemsChange: (items: MultiItem[]) => void;
    maxItems?: number;
    disabled?: boolean;
}

const SLOT_LABELS = ['1', '2', '3', '4', '5', '6'];

export const MultiItemUploader: React.FC<MultiItemUploaderProps> = ({
    items,
    onItemsChange,
    maxItems = 6,
    disabled = false
}) => {
    const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const handleFileSelect = async (index: number, file: File) => {
        const preview = URL.createObjectURL(file);
        const label = file.name.replace(/\.[^/.]+$/, '').substring(0, 20);

        const newItems = [...items];
        if (index < newItems.length) {
            // Eski preview'i temizle
            URL.revokeObjectURL(newItems[index].preview);
            newItems[index] = { file, preview, label };
        } else {
            newItems.push({ file, preview, label });
        }
        onItemsChange(newItems);
    };

    const handleRemove = (index: number) => {
        const newItems = [...items];
        URL.revokeObjectURL(newItems[index].preview);
        newItems.splice(index, 1);
        onItemsChange(newItems);
    };

    const handleSlotClick = (index: number) => {
        if (disabled) return;
        fileInputRefs.current[index]?.click();
    };

    return (
        <div className="w-full">
            <div className="grid grid-cols-3 gap-2">
                {Array.from({ length: maxItems }).map((_, index) => {
                    const item = items[index];
                    const hasItem = !!item;

                    return (
                        <div key={index} className="relative group">
                            <input
                                ref={el => { fileInputRefs.current[index] = el; }}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleFileSelect(index, file);
                                    e.target.value = '';
                                }}
                            />

                            <button
                                type="button"
                                onClick={() => handleSlotClick(index)}
                                disabled={disabled || (index > items.length)}
                                className={`
                                    w-full aspect-square rounded-lg border-2 border-dashed transition-all overflow-hidden
                                    flex items-center justify-center relative
                                    ${hasItem
                                        ? 'border-cyan-500/50 bg-slate-800'
                                        : index <= items.length
                                            ? 'border-slate-600 bg-slate-800/50 hover:border-cyan-500/50 hover:bg-slate-700/50 cursor-pointer'
                                            : 'border-slate-700/30 bg-slate-900/30 opacity-40 cursor-not-allowed'
                                    }
                                `}
                            >
                                {hasItem ? (
                                    <>
                                        <img
                                            src={item.preview}
                                            alt={`Ürün ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                        {/* Numara badge */}
                                        <div className="absolute top-1 left-1 w-5 h-5 bg-cyan-600 rounded-full flex items-center justify-center">
                                            <span className="text-[10px] font-bold text-white">{index + 1}</span>
                                        </div>
                                        {/* Sil butonu */}
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleRemove(index);
                                            }}
                                            className="absolute top-1 right-1 w-5 h-5 bg-red-600/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <span className="text-[10px] text-white font-bold">✕</span>
                                        </button>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center gap-0.5">
                                        <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                        <span className="text-[9px] text-slate-500 font-medium">{SLOT_LABELS[index]}</span>
                                    </div>
                                )}
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* Yüklenen ürün sayısı */}
            {items.length > 0 && (
                <div className="mt-2 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                        {items.length}/{maxItems} ürün yüklendi
                    </span>
                    {items.length > 1 && (
                        <button
                            type="button"
                            onClick={() => {
                                items.forEach(i => URL.revokeObjectURL(i.preview));
                                onItemsChange([]);
                            }}
                            className="text-[11px] text-red-400 hover:text-red-300 transition"
                        >
                            Tümünü Temizle
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export type { MultiItem };
