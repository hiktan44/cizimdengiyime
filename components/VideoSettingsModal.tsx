
import React, { useState } from 'react';
import { SparklesIcon } from './icons/SparklesIcon';
import { XIcon } from './icons/XIcon';
import { VideoGenerationSettings } from '../services/geminiService';

interface VideoSettingsModalProps {
    isOpen: boolean;
    isGenerating: boolean;
    onClose: () => void;
    onGenerate: (settings: VideoGenerationSettings) => void;
}

export const VideoSettingsModal: React.FC<VideoSettingsModalProps> = ({ isOpen, isGenerating, onClose, onGenerate }) => {
    const [prompt, setPrompt] = useState('Model podyumda yürüyor ve gülümsüyor.');
    const [resolution, setResolution] = useState<'720p' | '1080p'>('720p');
    const [durationSecs, setDurationSecs] = useState(5);
    const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('9:16');
    const [quality, setQuality] = useState<'fast' | 'high'>('fast');

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
                        <h2 className="text-2xl font-bold text-white">Video Stüdyosu</h2>
                        <p className="text-slate-400 text-sm mt-1">Yapay zeka ile sahnenizi canlandırın</p>
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
                        <label htmlFor="prompt" className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Senaryo</label>
                        <textarea
                            id="prompt"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            rows={3}
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition resize-none text-sm leading-relaxed"
                            placeholder="Örn: Model podyumda yürüyor, dönüyor ve gülümsüyor..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-400 uppercase">Kalite & Model</label>
                            <select
                                value={quality}
                                onChange={(e) => setQuality(e.target.value as 'fast' | 'high')}
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white text-sm focus:ring-2 focus:ring-cyan-500 transition appearance-none"
                            >
                                <option value="fast">Hızlı (Veo Fast - ~30sn)</option>
                                <option value="high">Yüksek Kalite (Veo 3.1 - ~3dk)</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-400 uppercase">Çözünürlük</label>
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
                             <label className="text-xs font-semibold text-slate-400 uppercase">Süre (Saniye)</label>
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
                            <label className="text-xs font-semibold text-slate-400 uppercase">Format</label>
                            <select
                                value={aspectRatio}
                                onChange={(e) => setAspectRatio(e.target.value as '16:9' | '9:16')}
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white text-sm focus:ring-2 focus:ring-cyan-500 transition appearance-none"
                            >
                                <option value="9:16">9:16 (Dikey/Hikaye)</option>
                                <option value="16:9">16:9 (Yatay/Sinema)</option>
                            </select>
                        </div>
                    </div>
                    
                    {quality === 'high' && (
                        <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3 text-xs text-purple-200">
                            <strong>Not:</strong> Yüksek kalite modu, daha gerçekçi dokular ve ışıklandırma sağlar ancak oluşturulması 2-5 dakika sürebilir.
                        </div>
                    )}
                    
                    {/* Kredi Bilgisi */}
                    <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                            <svg className="w-5 h-5 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"/>
                            </svg>
                            <span className="text-sm font-semibold text-slate-300">
                                Video oluşturma: <span className="text-orange-400 font-bold text-lg">3 kredi</span>
                            </span>
                        </div>
                    </div>
                    
                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={isGenerating}
                            className={`w-full font-bold py-4 px-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3 ${
                                quality === 'high' 
                                ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 shadow-purple-900/40'
                                : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-cyan-900/40'
                            }`}
                        >
                            {isGenerating ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Video Render Ediliyor...</span>
                                </>
                            ) : (
                                <>
                                    <SparklesIcon />
                                    <span>{quality === 'high' ? 'HQ Video Oluştur' : 'Hızlı Video Oluştur'}</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
