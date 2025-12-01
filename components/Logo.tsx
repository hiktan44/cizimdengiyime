
import React from 'react';

interface LogoProps {
    className?: string;
}

export const Logo: React.FC<LogoProps> = ({ className = "h-10" }) => {
    return (
        <div className={`flex items-center gap-3 ${className}`}>
            {/* Logo Icon SVG */}
            <svg 
                viewBox="0 0 100 100" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                className="h-full w-auto aspect-square drop-shadow-lg"
            >
                <defs>
                    <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#22d3ee" /> {/* Cyan-400 */}
                        <stop offset="33%" stopColor="#3b82f6" /> {/* Blue-500 */}
                        <stop offset="66%" stopColor="#a855f7" /> {/* Purple-500 */}
                        <stop offset="100%" stopColor="#f97316" /> {/* Orange-500 */}
                    </linearGradient>
                </defs>

                {/* Pen Nib Shape (Abstract) */}
                <path 
                    d="M30 80 C 30 90, 70 90, 70 80 L 85 30 L 50 10 L 15 30 Z" 
                    stroke="url(#logoGradient)" 
                    strokeWidth="6" 
                    strokeLinejoin="round"
                    fill="none"
                />
                
                {/* Center Split Line of Pen */}
                <path 
                    d="M50 10 L 50 60" 
                    stroke="url(#logoGradient)" 
                    strokeWidth="4" 
                    strokeLinecap="round"
                />

                {/* AI Sparkles (Replacing Ink) */}
                <path 
                    d="M50 75 L 50 95 M 40 85 L 60 85" 
                    stroke="url(#logoGradient)" 
                    strokeWidth="4" 
                    strokeLinecap="round" 
                    className="animate-pulse"
                />
                <circle cx="20" cy="20" r="5" fill="#22d3ee" className="animate-ping" style={{animationDuration: '3s'}} />
                {/* Accent shape changed to Orange to balance the gradient */}
                <path d="M85 20 L 95 30 L 85 40 L 75 30 Z" fill="#f97316" />
            </svg>

            {/* Text Part */}
            <div className="flex flex-col justify-center">
                <span className="text-xl md:text-2xl font-black tracking-tight leading-none text-transparent bg-clip-text bg-[linear-gradient(to_right,#22d3ee,#3b82f6,#a855f7,#f97316)]">
                    FASHION
                </span>
                <span className="text-[0.65rem] md:text-xs font-bold text-slate-400 tracking-[0.3em] uppercase ml-0.5">
                    Sketch to Reality
                </span>
            </div>
        </div>
    );
};
