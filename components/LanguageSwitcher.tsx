/**
 * LanguageSwitcher - Dil Değiştirme Bileşeni
 * Header veya herhangi bir yerde kullanılabilir.
 */

import React, { useState, useRef, useEffect } from 'react';
import { useI18n } from '../lib/i18n';
import { LANGUAGE_INFO, Language } from '../lib/i18n/types';

interface LanguageSwitcherProps {
    /** Kompakt mod - sadece bayrak gösterir */
    compact?: boolean;
    /** Ek CSS sınıfları */
    className?: string;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ compact = false, className = '' }) => {
    const { language, setLanguage, supportedLanguages } = useI18n();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Dropdown dışına tıklama ile kapatma
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const currentLang = LANGUAGE_INFO[language];

    const handleSelect = (lang: Language) => {
        setLanguage(lang);
        setIsOpen(false);
    };

    return (
        <div ref={dropdownRef} className={`relative ${className}`}>
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700 hover:border-slate-600 transition-all text-sm"
                aria-label="Dil seçin"
            >
                <span className="text-base">{currentLang.flag}</span>
                {!compact && (
                    <span className="text-slate-300 font-medium">{currentLang.code.toUpperCase()}</span>
                )}
                <svg
                    className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute right-0 top-full mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl shadow-black/50 overflow-hidden z-50 min-w-[160px] animate-in fade-in slide-in-from-top-2 duration-200">
                    {supportedLanguages.map((lang) => {
                        const info = LANGUAGE_INFO[lang];
                        const isActive = lang === language;

                        return (
                            <button
                                key={lang}
                                onClick={() => handleSelect(lang)}
                                className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-all ${isActive
                                        ? 'bg-cyan-600/20 text-cyan-400'
                                        : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                                    }`}
                            >
                                <span className="text-lg">{info.flag}</span>
                                <span className="font-medium">{info.name}</span>
                                {isActive && (
                                    <svg className="w-4 h-4 ml-auto text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
