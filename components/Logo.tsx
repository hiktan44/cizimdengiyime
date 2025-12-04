
import React from 'react';

interface LogoProps {
    className?: string;
}

export const Logo: React.FC<LogoProps> = ({ className = "h-10" }) => {
    return (
        <div className={`flex items-center gap-2 ${className}`}>
            {/* Colorful Dress & Wave Logo - Simplified and visible */}
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 drop-shadow-lg flex-shrink-0">
                <defs>
                    <linearGradient id="dressBlue" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#60a5fa" />
                        <stop offset="100%" stopColor="#2563eb" />
                    </linearGradient>
                    <linearGradient id="wavePurple" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#a855f7" />
                        <stop offset="100%" stopColor="#9333ea" />
                    </linearGradient>
                    <linearGradient id="waveOrange" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#fb923c" />
                        <stop offset="100%" stopColor="#f97316" />
                    </linearGradient>
                </defs>
                
                {/* Blue Dress */}
                <path d="M35 20 L40 15 L45 20 L43 40 Q43 55 40 65 L38 70 L32 70 L30 65 Q27 55 27 40 L25 20 L30 15 Z" 
                      fill="url(#dressBlue)" stroke="#1e40af" strokeWidth="1"/>
                
                {/* Purple Wave */}
                <path d="M45 35 Q55 38 62 45 Q67 52 65 58 Q62 63 55 62 Q48 60 43 53 Z" 
                      fill="url(#wavePurple)" stroke="#7c3aed" strokeWidth="1"/>
                
                {/* Orange Wave */}
                <path d="M58 48 Q68 52 75 60 Q80 68 77 74 Q72 78 65 76 Q58 73 54 66 Z" 
                      fill="url(#waveOrange)" stroke="#ea580c" strokeWidth="1"/>
            </svg>
            
            {/* Text Part */}
            <div className="flex flex-col justify-center leading-tight">
                <span className="text-lg md:text-xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-orange-500">
                    BEST FASHION
                </span>
                <span className="text-[0.55rem] md:text-[0.65rem] font-semibold text-slate-300 tracking-[0.15em] uppercase">
                    Sketch to Reality
                </span>
            </div>
        </div>
    );
};
