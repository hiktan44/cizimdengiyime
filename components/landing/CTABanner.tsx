import React from 'react';

interface CTABannerProps {
    onGetStarted: () => void;
    t: any;
}

export const CTABanner: React.FC<CTABannerProps> = ({ onGetStarted, t }) => {
    return (
        <section className="relative py-24 px-6 z-10">
            <div className="max-w-4xl mx-auto text-center relative overflow-hidden rounded-3xl"
                style={{
                    background: 'linear-gradient(135deg, rgba(108,60,225,0.25), rgba(255,107,107,0.15), rgba(212,165,116,0.1))',
                    backdropFilter: 'blur(24px)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    padding: '4rem 2rem',
                }}
            >
                {/* Decorative glows */}
                <div className="absolute -top-20 -left-20 w-60 h-60 rounded-full opacity-30 animate-float"
                    style={{ background: 'radial-gradient(circle, rgba(108,60,225,0.4), transparent 70%)' }}
                />
                <div className="absolute -bottom-20 -right-20 w-60 h-60 rounded-full opacity-30 animate-float"
                    style={{ background: 'radial-gradient(circle, rgba(255,107,107,0.4), transparent 70%)', animationDelay: '2s' }}
                />

                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 relative z-10">
                    {t?.cta?.title || 'Ready to Transform Your Fashion Business?'}
                </h2>
                <p className="text-white/50 text-lg mb-8 max-w-xl mx-auto relative z-10">
                    {t?.cta?.subtitle || 'Join thousands of fashion brands using AI to create stunning visuals'}
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
                    <button onClick={onGetStarted} className="btn-primary text-base px-8 py-3">
                        <span>{t?.cta?.startTrial || 'Start Free Trial'}</span>
                    </button>
                    <a href="mailto:info@fasheone.com" className="btn-outline text-base px-8 py-3 inline-flex items-center justify-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                        </svg>
                        <span>{t?.cta?.contactUs || 'Contact Us'}</span>
                    </a>
                </div>
            </div>
        </section>
    );
};
