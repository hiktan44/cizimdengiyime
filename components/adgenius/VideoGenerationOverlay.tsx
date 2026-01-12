import React, { useMemo } from 'react';
import { Sparkles } from 'lucide-react';

interface Props {
    progress: number;
    label: string;
}

export const VideoGenerationOverlay: React.FC<Props> = ({ progress, label }) => {
    // Generate random particles once
    const particles = useMemo(() => {
        return Array.from({ length: 30 }).map((_, i) => ({
            id: i,
            size: Math.random() * 4 + 2,
            left: Math.random() * 100 + '%',
            top: Math.random() * 100 + '%',
            duration: Math.random() * 3 + 2 + 's',
            delay: Math.random() * 5 + 's',
            opacity: Math.random() * 0.5 + 0.2
        }));
    }, []);

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-slate-950/90 backdrop-blur-2xl animate-fade-in">
            {/* Moving Blobs Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] bg-purple-600/20 rounded-full mix-blend-screen filter blur-[120px] animate-blob"></div>
                <div className="absolute -bottom-[10%] -right-[10%] w-[60%] h-[60%] bg-blue-600/20 rounded-full mix-blend-screen filter blur-[120px] animate-blob animation-delay-2000"></div>
                <div className="absolute top-1/4 right-1/4 w-[40%] h-[40%] bg-cyan-600/10 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-4000"></div>
            </div>

            {/* Particle System */}
            <div className="absolute inset-0 pointer-events-none">
                {particles.map((p) => (
                    <div
                        key={p.id}
                        className="absolute rounded-full bg-white animate-pulse"
                        style={{
                            width: p.size,
                            height: p.size,
                            left: p.left,
                            top: p.top,
                            opacity: p.opacity,
                            animationDuration: p.duration,
                            animationDelay: p.delay,
                            boxShadow: '0 0 10px rgba(255,255,255,0.5)'
                        }}
                    />
                ))}
            </div>

            {/* Noise Overlay */}
            <div className="noise-overlay opacity-20"></div>

            {/* Content */}
            <div className="relative z-10 text-center px-6 max-w-lg scale-110">
                {/* Animated Glow Icon */}
                <div className="relative w-24 h-24 mx-auto mb-10">
                    <div className="absolute inset-0 bg-blue-500 rounded-full blur-2xl animate-pulse opacity-20"></div>
                    <div className="relative flex items-center justify-center w-full h-full bg-slate-900 border border-blue-500/30 rounded-full shadow-2xl">
                        <Sparkles className="w-10 h-10 text-blue-400 animate-pulse" />
                    </div>
                </div>

                {/* Circular Progress */}
                <div className="relative w-48 h-48 mx-auto mb-10">
                    <svg className="w-full h-full transform -rotate-90">
                        <circle
                            cx="96"
                            cy="96"
                            r="84"
                            stroke="currentColor"
                            strokeWidth="6"
                            fill="transparent"
                            className="text-white/5"
                        />
                        <circle
                            cx="96"
                            cy="96"
                            r="84"
                            stroke="url(#progressGradient)"
                            strokeWidth="8"
                            fill="transparent"
                            strokeDasharray={528}
                            strokeDashoffset={528 - (progress / 100) * 528}
                            strokeLinecap="round"
                            className="transition-all duration-700 ease-out"
                        />
                        <defs>
                            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#22d3ee" />
                                <stop offset="100%" stopColor="#8b5cf6" />
                            </linearGradient>
                        </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-5xl font-black text-white tracking-tighter drop-shadow-lg">
                            {Math.round(progress)}%
                        </span>
                        <span className="text-[10px] uppercase tracking-widest text-cyan-400 font-bold mt-1">
                            {progress === 100 ? (label.includes('video') ? 'Tamamlandı' : 'Success') : 'İşleniyor'}
                        </span>
                    </div>
                </div>

                {/* Text */}
                <div className="space-y-4">
                    <h3 className="text-3xl font-black text-white tracking-tight">
                        {label}
                    </h3>
                    <p className="text-slate-400 text-sm leading-relaxed max-w-xs mx-auto font-medium">
                        AI motoru sahneleri canlandırıyor. Lütfen pencereyi kapatmayın.
                    </p>
                </div>

                {/* Loading Bar Bottom */}
                <div className="mt-12 w-48 h-1 bg-white/5 rounded-full mx-auto overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-cyan-400 to-purple-600 transition-all duration-500"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
            </div>
        </div>
    );
};
