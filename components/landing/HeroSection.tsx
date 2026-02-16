import React from 'react';

interface HeroSectionProps {
    onGetStarted: () => void;
    t: any;
    heroVideoUrl?: string;
    heroVideo1Url?: string;
    heroVideo2Url?: string;
    heroVideo3Url?: string;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onGetStarted, t, heroVideoUrl }) => {
    return (
        <section className="relative min-h-[90vh] flex items-center pt-20 pb-16 px-6 overflow-hidden">
            {/* Glow Effects */}
            <div className="absolute top-20 left-10 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none animate-float" />
            <div className="absolute bottom-20 right-10 w-80 h-80 bg-coral-500/8 rounded-full blur-3xl pointer-events-none animate-float delay-300" style={{ animationDelay: '2s' }} />

            <div className="max-w-7xl mx-auto w-full relative z-10">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Left: Content */}
                    <div className="space-y-8 animate-fadeInUp">
                        <div className="space-y-4">
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight">
                                <span className="text-white">{t?.hero?.title || 'AI-Powered Fashion'}</span>
                                <br />
                                <span style={{
                                    background: 'linear-gradient(135deg, #6C3CE1, #FF6B6B, #D4A574)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text',
                                }}>
                                    {t?.hero?.subtitle || 'Production Platform'}
                                </span>
                            </h1>
                            <p className="text-lg text-white/50 max-w-lg leading-relaxed">
                                {t?.hero?.description || 'Transform your fashion business with AI Virtual Try-On, Product Photography & Technical Design'}
                            </p>
                        </div>

                        {/* Stats Badges */}
                        <div className="flex flex-wrap gap-3">
                            {[
                                { icon: '🎨', label: 'Virtual Try-On' },
                                { icon: '📸', label: 'Product Photography' },
                                { icon: '📐', label: 'Tech Packs' },
                                { icon: '🎬', label: 'Video Ads' },
                            ].map((badge, i) => (
                                <span
                                    key={i}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-white/70 bg-white/5 border border-white/10"
                                >
                                    {badge.icon} {badge.label}
                                </span>
                            ))}
                        </div>

                        {/* CTA Buttons */}
                        <div className="flex flex-wrap gap-4">
                            <button onClick={onGetStarted} className="btn-primary text-base">
                                <span>{t?.hero?.cta || 'Start Free Trial'}</span>
                            </button>
                            <button
                                onClick={() => document.getElementById('showcase')?.scrollIntoView({ behavior: 'smooth' })}
                                className="btn-outline text-base flex items-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Watch Demo
                            </button>
                        </div>
                    </div>

                    {/* Right: Visual */}
                    <div className="relative hidden lg:block animate-fadeInUp delay-200">
                        <div className="relative">
                            {/* Glass Frame */}
                            <div className="glass-card p-2 rounded-2xl overflow-hidden">
                                {heroVideoUrl ? (
                                    <video
                                        src={heroVideoUrl}
                                        className="w-full aspect-[4/5] object-cover rounded-xl"
                                        autoPlay loop muted playsInline
                                    />
                                ) : (
                                    <div className="w-full aspect-[4/5] rounded-xl bg-gradient-to-br from-purple-900/40 to-pink-900/40 flex items-center justify-center">
                                        <div className="text-center space-y-4">
                                            <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
                                                </svg>
                                            </div>
                                            <p className="text-white/40 text-sm">AI Fashion Preview</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Floating Labels */}
                            <div className="absolute -top-4 -right-4 glass-card px-4 py-2 rounded-xl animate-float">
                                <span className="text-xs font-semibold text-white/80">✨ Virtual Try-On</span>
                            </div>
                            <div className="absolute -bottom-4 -left-4 glass-card px-4 py-2 rounded-xl animate-float" style={{ animationDelay: '1s' }}>
                                <span className="text-xs font-semibold text-white/80">🎯 AI Powered</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
