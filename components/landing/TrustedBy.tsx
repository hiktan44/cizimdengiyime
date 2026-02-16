import React from 'react';

interface TrustedByProps {
    t: any;
}

export const TrustedBy: React.FC<TrustedByProps> = ({ t }) => {
    const stats = [
        { value: '10K+', label: t?.trustedBy?.designs || 'Designs Created' },
        { value: '500+', label: t?.trustedBy?.brands || 'Fashion Brands' },
        { value: '98%', label: t?.trustedBy?.satisfaction || 'Satisfaction Rate' },
        { value: '50+', label: t?.trustedBy?.countries || 'Countries' },
    ];

    return (
        <section className="relative py-16 px-6 z-10">
            <div className="max-w-5xl mx-auto">
                <p className="text-center text-xs uppercase tracking-[0.2em] text-white/30 mb-8 font-medium">
                    {t?.trustedBy?.title || 'Trusted by fashion brands worldwide'}
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {stats.map((stat, i) => (
                        <div
                            key={i}
                            className="glass-card p-6 text-center animate-fadeInUp"
                            style={{ animationDelay: `${i * 100}ms` }}
                        >
                            <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-amber-400 bg-clip-text text-transparent mb-1">
                                {stat.value}
                            </div>
                            <div className="text-white/40 text-xs uppercase tracking-wider">
                                {stat.label}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
