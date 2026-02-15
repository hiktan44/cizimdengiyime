
import React, { useState, useEffect } from 'react';
import { SparklesIcon } from './icons/SparklesIcon';
import { XIcon } from './icons/XIcon';
import { VideoGenerationSettings } from '../services/geminiService';
import { useI18n, useTranslation, TranslationRecord } from '../lib/i18n';

const trVideo = {
    title: 'Video Stüdyosu',
    subtitle: 'Yapay zeka ile sahnenizi canlandırın',
    scenario: 'Senaryo',
    scenarioPlaceholder: 'Örn: Model kıyafetini sergileyerek doğal şekilde dönerek poz veriyor...',
    defaultPrompt: 'Model doğal ve akıcı hareketlerle kıyafetini sergileyerek hafifçe dönüyor ve poz veriyor. Gerçek bir profesyonel çekim ortamı.',
    quality: 'Kalite & Model',
    qualityFast: 'Hızlı (Veo Fast - ~30sn)',
    qualityHigh: 'Yüksek Kalite (Veo 3.1 - ~3dk)',
    resolution: 'Çözünürlük',
    duration: 'Süre (Saniye)',
    format: 'Format',
    formatVertical: '9:16 (Dikey/Hikaye)',
    formatHorizontal: '16:9 (Yatay/Sinema)',
    note: 'Not:',
    noteText: 'Yüksek kalite modu, daha gerçekçi dokular ve ışıklandırma sağlar ancak oluşturulması 2-5 dakika sürebilir.',
    creditInfo: 'Video oluşturma:',
    credits: 'kredi',
    generating: 'Video Render Ediliyor...',
    generateFast: 'Hızlı Video Oluştur',
    generateHQ: 'HQ Video Oluştur',
};

const translations: TranslationRecord<typeof trVideo> = {
    tr: trVideo,
    en: {
        title: 'Video Studio',
        subtitle: 'Bring your scene to life with AI',
        scenario: 'Scenario',
        scenarioPlaceholder: 'E.g: Model naturally turns and poses to showcase the outfit...',
        defaultPrompt: 'Model naturally turns and poses with smooth, realistic movements to showcase the outfit. Professional video shoot atmosphere.',
        quality: 'Quality & Model',
        qualityFast: 'Fast (Veo Fast - ~30s)',
        qualityHigh: 'High Quality (Veo 3.1 - ~3min)',
        resolution: 'Resolution',
        duration: 'Duration (Seconds)',
        format: 'Format',
        formatVertical: '9:16 (Vertical/Story)',
        formatHorizontal: '16:9 (Horizontal/Cinema)',
        note: 'Note:',
        noteText: 'High quality mode provides more realistic textures and lighting but may take 2-5 minutes to generate.',
        creditInfo: 'Video generation:',
        credits: 'credits',
        generating: 'Rendering Video...',
        generateFast: 'Generate Fast Video',
        generateHQ: 'Generate HQ Video',
    },
};

interface VideoSettingsModalProps {
    isOpen: boolean;
    isGenerating: boolean;
    onClose: () => void;
    onGenerate: (settings: VideoGenerationSettings) => void;
}

export const VideoSettingsModal: React.FC<VideoSettingsModalProps> = ({ isOpen, isGenerating, onClose, onGenerate }) => {
    const { language } = useI18n();
    const t = useTranslation(translations);
    const [prompt, setPrompt] = useState('');
    const [resolution, setResolution] = useState<'720p' | '1080p'>('720p');
    const [durationSecs, setDurationSecs] = useState(5);
    const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('9:16');
    const [quality, setQuality] = useState<'fast' | 'high'>('fast');

    useEffect(() => {
        setPrompt(t.defaultPrompt);
    }, [language]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onGenerate({ prompt, resolution, durationSecs, aspectRatio, quality });
    };

    return (
        <div
            className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in"
            onClick={onClose}
        >
            <div
                className="bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg border border-slate-700 p-8 transform transition-all scale-100 relative overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Background Decor */}
                <div className="absolute -top-20 -right-20 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="flex justify-between items-center mb-8 relative z-10">
                    <div>
                        <h2 className="text-2xl font-bold text-white">{t.title}</h2>
                        <p className="text-slate-400 text-sm mt-1">{t.subtitle}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                    >
                        <XIcon />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                    <div className="space-y-2">
                        <label htmlFor="prompt" className="text-sm font-semibold text-slate-300 uppercase tracking-wider">{t.scenario}</label>
                        <div className="relative">
                            <textarea
                                id="prompt"
                                value={prompt}
                                onChange={(e) => {
                                    setPrompt(e.target.value);
                                }}
                                rows={3}
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-y min-h-[120px] text-sm leading-relaxed"
                                placeholder={t.scenarioPlaceholder}
                            />
                            <div className="absolute bottom-2 right-2 text-slate-600 pointer-events-none">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 13v6m0 0h-6m6 0L13 13" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-400 uppercase">{t.quality}</label>
                            <select
                                value={quality}
                                onChange={(e) => setQuality(e.target.value as 'fast' | 'high')}
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white text-sm focus:ring-2 focus:ring-cyan-500 transition appearance-none"
                            >
                                <option value="fast">{t.qualityFast}</option>
                                <option value="high">{t.qualityHigh}</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-400 uppercase">{t.resolution}</label>
                            <select
                                value={resolution}
                                onChange={(e) => setResolution(e.target.value as '720p' | '1080p')}
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white text-sm focus:ring-2 focus:ring-cyan-500 transition appearance-none"
                            >
                                <option value="720p">720p HD</option>
                                <option value="1080p">1080p FHD</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-400 uppercase">{t.duration}</label>
                            <input
                                type="number"
                                value={durationSecs}
                                onChange={(e) => setDurationSecs(Math.max(2, Math.min(10, parseInt(e.target.value, 10) || 5)))}
                                min="2"
                                max="10"
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white text-sm focus:ring-2 focus:ring-cyan-500 transition"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-400 uppercase">{t.format}</label>
                            <select
                                value={aspectRatio}
                                onChange={(e) => setAspectRatio(e.target.value as '16:9' | '9:16')}
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white text-sm focus:ring-2 focus:ring-cyan-500 transition appearance-none"
                            >
                                <option value="9:16">{t.formatVertical}</option>
                                <option value="16:9">{t.formatHorizontal}</option>
                            </select>
                        </div>
                    </div>

                    {quality === 'high' && (
                        <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3 text-xs text-purple-200">
                            <strong>{t.note}</strong> {t.noteText}
                        </div>
                    )}

                    {/* Kredi Bilgisi */}
                    <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                            <svg className="w-5 h-5 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                            </svg>
                            <span className="text-sm font-semibold text-slate-300">
                                {t.creditInfo} <span className="text-orange-400 font-bold text-lg">3 {t.credits}</span>
                            </span>
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={isGenerating}
                            className={`w-full font-bold py-4 px-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3 ${quality === 'high'
                                ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 shadow-purple-900/40'
                                : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-cyan-900/40'
                                }`}
                        >
                            {isGenerating ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>{t.generating}</span>
                                </>
                            ) : (
                                <>
                                    <SparklesIcon />
                                    <span>{quality === 'high' ? t.generateHQ : t.generateFast}</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
