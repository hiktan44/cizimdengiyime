import React, { useState } from 'react';
import { GenerationResult } from './types';
import { Sparkles, Edit3, CheckCircle2, ArrowLeft } from 'lucide-react';

interface Props {
    results: GenerationResult[];
    setResults: React.Dispatch<React.SetStateAction<GenerationResult[]>>;
    onSubmit: () => void;
    onBack: () => void;
    t: any;
}

const PromptPreview: React.FC<Props> = ({ results, setResults, onSubmit, onBack, t }) => {
    const [isEditing, setIsEditing] = useState(false);

    const handlePromptChange = (id: number, newPrompt: string) => {
        setResults(prev => prev.map(r => r.id === id ? { ...r, prompt: newPrompt } : r));
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-20">
            <div className="text-center space-y-4">
                <h2 className="text-3xl font-black text-white tracking-tight flex items-center justify-center gap-3">
                    <Sparkles className="w-8 h-8 text-cyan-400" />
                    {t.preview?.title || 'Kampanya Sahne Seçimi'}
                </h2>
                <p className="text-slate-400 max-w-xl mx-auto">
                    {t.preview?.subtitle || 'Yapay zeka tarafından planlanan sahneleri aşağıda görebilirsiniz. İsterseniz her sahnede modelin duruşunu veya arka planı özelleştirebilirsiniz.'}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {results.map((result) => (
                    <div key={result.id} className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 hover:border-cyan-500/50 transition-all group hover:shadow-2xl hover:shadow-cyan-500/10 hover:-translate-y-1">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
                                    <span className="text-cyan-400 text-xs font-black">{result.id}</span>
                                </div>
                                <span className="text-xs font-bold uppercase tracking-widest text-slate-500 group-hover:text-cyan-400 transition-colors">
                                    {t.preview?.location || 'MEKAN'}
                                </span>
                            </div>
                            <span className="text-sm font-bold text-white bg-slate-700/50 px-3 py-1 rounded-full border border-slate-600/50 group-hover:border-cyan-500/30 transition-all">{result.type}</span>
                        </div>

                        {isEditing ? (
                            <div className="space-y-4 animate-fade-in-up">
                                <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">{t.preview?.location || 'Mekan İsmi'}</label>
                                    <div className="relative">
                                        <textarea
                                            value={result.type}
                                            onChange={(e) => setResults(prev => prev.map(r => r.id === result.id ? { ...r, type: e.target.value } : r))}
                                            rows={1}
                                            className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-3 text-sm text-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 min-h-[50px] resize-y"
                                        />
                                        <div className="absolute bottom-2 right-2 text-slate-600 pointer-events-none opacity-50">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 13v6m0 0h-6m6 0L13 13" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Özel Sahne Promptu</label>
                                    <div className="relative">
                                        <textarea
                                            value={result.prompt}
                                            onChange={(e) => {
                                                handlePromptChange(result.id, e.target.value);
                                            }}
                                            placeholder={t.preview?.promptPlaceholder || "Örn: Modern bir stüdyoda, profesyonel ışıklandırma altında..."}
                                            className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 min-h-[120px] resize-y"
                                        />
                                        <div className="absolute bottom-2 right-2 text-slate-600 pointer-events-none">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 13v6m0 0h-6m6 0L13 13" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-slate-900/30 rounded-xl p-4 border border-dashed border-slate-700 group-hover:bg-slate-900/50 transition-colors">
                                <p className="text-sm text-slate-400 line-clamp-2 italic">
                                    {result.prompt}
                                </p>
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

                {!isEditing ? (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold bg-slate-800 border border-slate-700 text-white hover:border-slate-500 hover:bg-slate-700 transition-all flex items-center justify-center gap-2"
                    >
                        <Edit3 className="w-5 h-5" />
                        {t.preview?.editButton || 'Düzenlemek İstiyorum'}
                    </button>
                ) : null}

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
