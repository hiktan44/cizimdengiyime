import React, { useState, useEffect } from 'react';
import { XIcon } from './icons/XIcon';

interface ApiKeyModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentKey: string;
    onSave: (key: string) => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, currentKey, onSave }) => {
    const [key, setKey] = useState(currentKey);

    useEffect(() => {
        setKey(currentKey);
    }, [currentKey, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(key);
    };

    return (
        <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
            onClick={onClose}
        >
            <div
                className="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md border border-slate-700 p-8"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <span>🔑</span> API Anahtarı Ayarları
                    </h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
                        <XIcon />
                    </button>
                </div>
                
                <p className="text-sm text-slate-400 mb-6">
                    Uygulamanın doğru çalışması için geçerli bir Google Gemini API anahtarına ihtiyaç vardır. Deploy edilen ortamlarda .env dosyası okunamazsa anahtarı buradan manuel olarak girebilirsiniz.
                    <br/><br/>
                    <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline">
                        API Anahtarı Almak İçin Tıklayın
                    </a>
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="apiKey" className="font-medium text-slate-300 block mb-2 text-sm">API Key</label>
                        <input
                            type="text"
                            id="apiKey"
                            value={key}
                            onChange={(e) => setKey(e.target.value)}
                            placeholder="API Anahtarınızı buraya girin..."
                            className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:ring-cyan-500 focus:border-cyan-500 transition font-mono text-sm"
                        />
                    </div>
                    
                    <div className="flex gap-3 justify-end mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                        >
                            İptal
                        </button>
                        <button
                            type="submit"
                            className="bg-cyan-600 text-white font-bold py-2 px-6 rounded-lg shadow-lg shadow-cyan-600/30 hover:bg-cyan-500 transition-all"
                        >
                            Kaydet
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};