import React, { useState } from 'react';
import { GenerationResult } from './types';
import { Sparkles, Edit3, CheckCircle2, ArrowLeft, Wand2, X } from 'lucide-react';

interface Props {
    results: GenerationResult[];
    setResults: React.Dispatch<React.SetStateAction<GenerationResult[]>>;
    onSubmit: () => void;
    onBack: () => void;
    t: any;
}

// Sahne ikonları
const sceneIcons: Record<string, string> = {
    'Şehir': '🏙️', 'Sokak': '🏙️', 'Urban': '🏙️',
    'Cafe': '☕', 'Lifestyle': '☕',
    'Doğa': '🌿', 'Manzara': '🌿', 'Nature': '🌿',
    'Stüdyo': '📸', 'Editorial': '📸', 'Studio': '📸',
    'Mimari': '🏛️', 'Modern': '🏛️', 'Architecture': '🏛️',
    'Gece': '🌃', 'Neon': '🌃', 'Night': '🌃',
    'Lüks': '💎', 'Luxury': '💎', 'Penthouse': '💎',
    'Soyut': '🎨', 'Sanat': '🎨', 'Abstract': '🎨',
    'Tarihi': '🏰', 'Historic': '🏰',
    'Gökyüzü': '☀️', 'Rooftop': '☀️', 'Sky': '☀️',
    // E-Ticaret pozları
    'Önden': '👤', 'Front': '👤',
    'Arkadan': '🔄', 'Back': '🔄',
    'Yan': '👥', 'Side': '👥',
    'Kullanım': '🚶', 'Walking': '🚶',
    'Tam Boy': '📏', 'Full Body': '📏',
    'Kumaş': '🔍', 'Close-up': '🔍', 'Detay': '🔍',
    'Sanatsal': '✨', 'Artistic': '✨',
    'Oturma': '🪑', 'Sitting': '🪑',
    'Çapraz': '↗️', '45-degree': '↗️',
    'Aksesuar': '💍', 'El': '💍',
    'Omuz': '👁️', 'Shoulder': '👁️',
    'Alt Açı': '📐', 'Low Angle': '📐',
};

const getSceneIcon = (type: string): string => {
    for (const [key, icon] of Object.entries(sceneIcons)) {
        if (type.includes(key)) return icon;
    }
    return '📷';
};

// Sahne önerme kısayolları
const quickEditSuggestions = [
    { label: '🧍 Ayakta dik duruş', value: 'Model ayakta dik duruyor, kameraya bakıyor' },
    { label: '🪑 Oturma pozu', value: 'Model zarif bir şekilde oturuyor' },
    { label: '🚶 Yürüme', value: 'Model kameraya doğru yürüyor, doğal hareket' },
    { label: '🌅 Gün batımı', value: 'Altın saat (golden hour), sıcak güneş ışığı' },
    { label: '🏖️ Sahil', value: 'Deniz kenarı, kumsalda' },
    { label: '🏙️ Şehir sokağı', value: 'Modern şehir sokağı, bokeh arka plan' },
    { label: '🏛️ Mimari fon', value: 'Minimalist beton mimari arka plan' },
    { label: '📸 Temiz stüdyo', value: 'Temiz beyaz stüdyo arka plan, sonsuz fon' },
];

const PromptPreview: React.FC<Props> = ({ results, setResults, onSubmit, onBack, t }) => {
    // Her sahne için düzenleme prompt'unu ayrı tut
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editPrompts, setEditPrompts] = useState<Record<number, string>>({});

    const handleQuickEdit = (id: number, suggestion: string) => {
        setEditPrompts(prev => ({
            ...prev,
            [id]: (prev[id] || '') + (prev[id] ? ', ' : '') + suggestion
        }));
    };

    const applyEdit = (id: number) => {
        const userEdit = editPrompts[id]?.trim();
        if (!userEdit) {
            setEditingId(null);
            return;
        }

        setResults(prev => prev.map(r => {
            if (r.id !== id) return r;

            // Ana prompt'a kullanıcı isteğini ekle
            const updatedPrompt = r.prompt + `\n\nKULLANICI DÜZENLEME TALEBİ (ÖNCELİKLİ): ${userEdit}`;

            // Sahne ismini güncelle
            let updatedType = r.type;
            // Kısa açıklama ekle
            const shortDesc = userEdit.length > 30 ? userEdit.substring(0, 30) + '...' : userEdit;
            updatedType = `${r.type} (${shortDesc})`;

            return { ...r, prompt: updatedPrompt, type: updatedType };
        }));

        setEditingId(null);
        // Prompt'u temizle
        setEditPrompts(prev => {
            const next = { ...prev };
            delete next[id];
            return next;
        });
    };

    const cancelEdit = (id: number) => {
        setEditingId(null);
        setEditPrompts(prev => {
            const next = { ...prev };
            delete next[id];
            return next;
        });
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-20">
            <div className="text-center space-y-4">
                <h2 className="text-3xl font-black text-white tracking-tight flex items-center justify-center gap-3">
                    <Sparkles className="w-8 h-8 text-cyan-400" />
                    {t.preview?.title || 'Kampanya Sahne Seçimi'}
                </h2>
                <p className="text-slate-400 max-w-xl mx-auto">
                    {t.preview?.subtitle || 'Sahneleri inceleyin, düzenlemek için kalem ikonuna tıklayın. Basit komutlarla pozu veya mekanı değiştirebilirsiniz.'}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {results.map((result) => (
                    <div
                        key={result.id}
                        className={`bg-slate-800/40 backdrop-blur-xl border rounded-2xl p-5 transition-all group hover:shadow-xl hover:-translate-y-0.5 ${editingId === result.id
                                ? 'border-cyan-500/50 shadow-lg shadow-cyan-500/10'
                                : 'border-slate-700/50 hover:border-cyan-500/30'
                            }`}
                    >
                        {/* Sahne Başlığı */}
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center border border-slate-600/50 text-lg">
                                    {getSceneIcon(result.type)}
                                </div>
                                <div>
                                    <span className="text-sm font-bold text-white block leading-tight">
                                        {result.type}
                                    </span>
                                    <span className="text-[10px] text-slate-500">
                                        Sahne {result.id}
                                    </span>
                                </div>
                            </div>

                            {editingId !== result.id && (
                                <button
                                    onClick={() => setEditingId(result.id)}
                                    className="w-8 h-8 rounded-lg bg-slate-700/50 hover:bg-cyan-600/20 flex items-center justify-center transition-all border border-slate-600/50 hover:border-cyan-500/50"
                                    title="Sahneyi düzenle"
                                >
                                    <Edit3 className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400 transition-colors" />
                                </button>
                            )}
                        </div>

                        {/* Düzenleme Modu */}
                        {editingId === result.id ? (
                            <div className="space-y-3 animate-fade-in">
                                {/* Basit prompt kutusu */}
                                <div>
                                    <label className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider mb-1.5 block flex items-center gap-1">
                                        <Wand2 className="w-3 h-3" />
                                        Düzenleme Talebi
                                    </label>
                                    <textarea
                                        value={editPrompts[result.id] || ''}
                                        onChange={(e) => setEditPrompts(prev => ({ ...prev, [result.id]: e.target.value }))}
                                        placeholder="Örn: Pozu değiştir, sahilde olsun, oturma pozu..."
                                        className="w-full bg-slate-900/80 border border-cyan-500/30 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 min-h-[70px] max-h-[120px] resize-y"
                                        autoFocus
                                    />
                                </div>

                                {/* Hızlı öneriler */}
                                <div>
                                    <span className="text-[9px] text-slate-500 uppercase tracking-wider mb-1.5 block">Hızlı Seçimler</span>
                                    <div className="flex flex-wrap gap-1.5">
                                        {quickEditSuggestions.map((s, i) => (
                                            <button
                                                key={i}
                                                type="button"
                                                onClick={() => handleQuickEdit(result.id, s.value)}
                                                className="text-[10px] px-2.5 py-1 bg-slate-700/60 hover:bg-cyan-600/20 text-slate-300 hover:text-cyan-300 rounded-lg border border-slate-600/40 hover:border-cyan-500/40 transition-all"
                                            >
                                                {s.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Butonlar */}
                                <div className="flex items-center gap-2 pt-1">
                                    <button
                                        onClick={() => applyEdit(result.id)}
                                        className="flex-1 py-2 px-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-1"
                                    >
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                        Uygula
                                    </button>
                                    <button
                                        onClick={() => cancelEdit(result.id)}
                                        className="py-2 px-3 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-medium transition-all flex items-center justify-center gap-1"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                        İptal
                                    </button>
                                </div>
                            </div>
                        ) : (
                            /* Normal Mod — sadece sahne ismi, prompt GÖRÜNMEYECEK */
                            <div className="bg-slate-900/30 rounded-xl p-3 border border-dashed border-slate-700/50">
                                <p className="text-xs text-slate-500 italic">
                                    AI bu sahneyi referans görsele göre otomatik üretecek.
                                </p>
                                {/* Prompt gizli — kullanıcıya gösterilmez */}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
                <button
                    onClick={onBack}
                    className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold bg-slate-800 text-slate-300 hover:bg-slate-700 transition-all flex items-center justify-center gap-2"
                >
                    <ArrowLeft className="w-5 h-5" />
                    {t.preview?.backButton || 'Geri Dön'}
                </button>

                <button
                    onClick={onSubmit}
                    className="w-full sm:w-auto px-12 py-4 rounded-xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:from-cyan-500 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
                >
                    <CheckCircle2 className="w-5 h-5" />
                    {t.preview?.confirmButton || 'Seçimleri Onayla ve Üret'}
                </button>
            </div>
        </div>
    );
};

export default PromptPreview;
