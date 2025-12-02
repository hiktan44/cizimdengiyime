
import React from 'react';

interface LogoProps {
    className?: string;
}

export const Logo: React.FC<LogoProps> = ({ className = "h-10" }) => {
    return (
        <div className={`flex items-center gap-3 ${className}`}>
            {/* Fashion Logo Image */}
            <img 
                src="/fashion-logo.svg" 
                alt="Fashion" 
                className="h-full w-auto object-contain drop-shadow-lg"
                style={{ maxHeight: '100%', height: 'auto' }}
            />
            {/* Text Part */}
            <div className="flex flex-col justify-center">
                <span className="text-xl md:text-2xl font-black tracking-tight leading-none text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-orange-500">
                    FASHION
                </span>
                <span className="text-[0.65rem] md:text-xs font-bold text-slate-400 tracking-[0.2em] uppercase">
                    Sketch to Reality
                </span>
            </div>
        </div>
    );
};
