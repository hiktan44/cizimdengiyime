
import React from 'react';

interface LogoProps {
    className?: string;
    theme?: 'light' | 'dark';
}

export const Logo: React.FC<LogoProps> = ({ className = "h-24", theme = 'dark' }) => {
    return (
        <div className={`flex items-center gap-3 ${className}`}>
            {/* Logo Görseli - Arka planı header rengiyle eşlendi ve maskeleme daraltıldı */}
            <div className="h-full aspect-square overflow-hidden flex items-center justify-center bg-[#0f172a] rounded-full">
                <img 
                    src="/fasheonelogo.png?v=50" 
                    alt="Fasheone Logo" 
                    className="h-[130%] w-auto max-w-none object-contain"
                    style={{ 
                        mixBlendMode: 'screen',
                        filter: 'contrast(1.6) brightness(1.1) saturate(1.1)',
                        WebkitMaskImage: 'radial-gradient(circle at center, white 25%, transparent 55%)',
                        maskImage: 'radial-gradient(circle at center, white 25%, transparent 55%)'
                    }}
                    onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/fasheonelogo.jpeg';
                    }}
                />
            </div>
            
            {/* Yazı Kısmı */}
            <div className="flex flex-col justify-center leading-tight">
                <span className="text-2xl md:text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-orange-400">
                    FASHEONE
                </span>
                <span className={`text-[0.65rem] md:text-[0.8rem] font-bold tracking-[0.2em] uppercase ${theme === 'light' ? 'text-[#1e40af]' : 'text-slate-300 opacity-90'}`}>
                    Sketch to Reality
                </span>
            </div>
        </div>
    );
};
