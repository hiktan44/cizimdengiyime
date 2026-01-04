import React from 'react';
import { Loader2 } from 'lucide-react';

interface Props {
    progress: number;
    label: string;
}

export const VideoGenerationOverlay: React.FC<Props> = ({ progress, label }) => {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-slate-950/80 backdrop-blur-xl animate-fade-in">
            {/* Moving Blobs Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600 rounded-full mix-blend-screen filter blur-3xl animate-blob opacity-30"></div>
                <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-cyan-600 rounded-full mix-blend-screen filter blur-3xl animate-blob animation-delay-2000 opacity-30"></div>
                <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-pink-600 rounded-full mix-blend-screen filter blur-3xl animate-blob animation-delay-4000 opacity-30"></div>
            </div>

            {/* Noise Overlay */}
            <div className="noise-overlay"></div>

            {/* Content */}
            <div className="relative z-10 text-center px-6 max-w-lg">
                {/* Circular Progress */}
                <div className="relative w-40 h-40 mx-auto mb-8">
                    <svg className="w-full h-full transform -rotate-90">
                        <circle
                            cx="80"
                            cy="80"
                            r="70"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="transparent"
                            className="text-slate-800"
                        />
                        <circle
                            cx="80"
                            cy="80"
                            r="70"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="transparent"
                            strokeDasharray={440}
                            strokeDashoffset={440 - (progress / 100) * 440}
                            strokeLinecap="round"
                            className="text-cyan-500 transition-all duration-1000 ease-in-out"
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-3xl font-black text-white tracking-tighter">
                            {Math.round(progress)}%
                        </span>
                    </div>
                </div>

                {/* Text */}
                <div className="space-y-4">
                    <h3 className="text-2xl font-bold text-white tracking-tight animate-pulse">
                        {label}
                    </h3>
                    <p className="text-slate-400 text-sm leading-relaxed max-w-xs mx-auto">
                        Videonuz yapay zeka tarafından işleniyor. Hazır olduğunda galeride belirecektir.
                    </p>
                </div>

                {/* Indicator */}
                <div className="mt-12 flex justify-center gap-1">
                    {[0, 1, 2].map((i) => (
                        <div
                            key={i}
                            className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce"
                            style={{ animationDelay: `${i * 0.15}s` }}
                        ></div>
                    ))}
                </div>
            </div>
        </div>
    );
};
