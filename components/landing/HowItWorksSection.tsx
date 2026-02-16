import React from 'react';

interface HowItWorksSectionProps {
    t: any;
}

export const HowItWorksSection: React.FC<HowItWorksSectionProps> = ({ t }) => {
    const steps = [
        {
            number: '01',
            title: t?.howItWorks?.step1Title || 'Upload',
            desc: t?.howItWorks?.step1Desc || 'Upload your product photos or fashion sketches',
            icon: (
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
            ),
            gradient: 'from-purple-500 to-indigo-600',
            glow: 'rgba(108, 60, 225, 0.15)',
        },
        {
            number: '02',
            title: t?.howItWorks?.step2Title || 'Generate',
            desc: t?.howItWorks?.step2Desc || 'AI creates stunning professional visuals instantly',
            icon: (
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
                </svg>
            ),
            gradient: 'from-coral-500 to-rose-600',
            glow: 'rgba(255, 107, 107, 0.15)',
        },
        {
            number: '03',
            title: t?.howItWorks?.step3Title || 'Download',
            desc: t?.howItWorks?.step3Desc || 'Get professional results ready to use',
            icon: (
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
            ),
            gradient: 'from-amber-500 to-orange-600',
            glow: 'rgba(212, 165, 116, 0.15)',
        },
    ];

    return (
        <section className="relative py-20 px-6 z-10">
            <div className="max-w-5xl mx-auto">
                <h2 className="section-title title-gold">
                    {t?.howItWorks?.title || '3 Simple Steps'}
                </h2>
                <p className="section-subtitle">
                    {t?.howItWorks?.subtitle || 'Professional results in minutes'}
                </p>

                <div className="grid md:grid-cols-3 gap-6 relative">
                    {/* Connection Line (desktop) */}
                    <div className="hidden md:block absolute top-1/2 left-[16.5%] right-[16.5%] h-[2px] -translate-y-1/2 z-0"
                        style={{ background: 'linear-gradient(90deg, rgba(108,60,225,0.3), rgba(255,107,107,0.3), rgba(212,165,116,0.3))' }}
                    />

                    {steps.map((step, i) => (
                        <div
                            key={i}
                            className="glass-card p-8 text-center relative z-10 animate-fadeInUp"
                            style={{
                                animationDelay: `${i * 150}ms`,
                                boxShadow: `0 8px 32px ${step.glow}`,
                            }}
                        >
                            <div className="step-number">{step.number}</div>
                            <div className={`w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br ${step.gradient} flex items-center justify-center mb-4`}>
                                {step.icon}
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                            <p className="text-white/50 text-sm leading-relaxed">{step.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
