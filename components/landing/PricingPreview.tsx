import React from 'react';
import { CREDIT_PACKAGES } from '../../lib/supabase';

interface PricingPreviewProps {
    onGetStarted: () => void;
    t: any;
}

export const PricingPreview: React.FC<PricingPreviewProps> = ({ onGetStarted, t }) => {
    const plans = [
        {
            name: CREDIT_PACKAGES?.[0]?.name || 'Starter',
            price: CREDIT_PACKAGES?.[0]?.price || '$29',
            credits: CREDIT_PACKAGES?.[0]?.credits || 100,
            features: [
                'High-res images',
                'Basic AI models',
                'Email support',
            ],
            popular: false,
            gradient: '',
        },
        {
            name: CREDIT_PACKAGES?.[1]?.name || 'Professional',
            price: CREDIT_PACKAGES?.[1]?.price || '$99',
            credits: CREDIT_PACKAGES?.[1]?.credits || 500,
            features: [
                '4K Ultra-res',
                'Advanced AI models',
                'Priority support',
                'Batch processing',
            ],
            popular: true,
            gradient: 'from-purple-600 to-pink-600',
        },
        {
            name: 'Enterprise',
            price: t?.pricing?.contactUs || 'Custom',
            credits: '∞',
            features: [
                'Dedicated account',
                'API Access',
                'White labeling',
                'Custom models',
            ],
            popular: false,
            gradient: '',
        },
    ];

    return (
        <section id="pricing" className="relative py-20 px-6 z-10">
            <div className="max-w-5xl mx-auto">
                <h2 className="section-title title-coral">
                    {t?.pricing?.title || 'Simple Pricing'}
                </h2>
                <p className="section-subtitle">
                    {t?.pricing?.subtitle || 'Choose the plan that fits your needs'}
                </p>

                <div className="grid md:grid-cols-3 gap-6">
                    {plans.map((plan, i) => (
                        <div
                            key={i}
                            className={`glass-card pricing-card ${plan.popular ? 'popular' : ''} animate-fadeInUp`}
                            style={{ animationDelay: `${i * 100}ms` }}
                        >
                            {plan.popular && (
                                <div className="pricing-badge">
                                    {t?.pricing?.popular || 'Most Popular'}
                                </div>
                            )}

                            <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>

                            <div className="mb-1">
                                <span className="pricing-amount">
                                    {typeof plan.price === 'number' ? `$${plan.price}` : plan.price}
                                </span>
                                {typeof plan.price === 'number' && (
                                    <span className="pricing-period">{t?.pricing?.perMonth || '/mo'}</span>
                                )}
                            </div>

                            <p className="text-white/40 text-sm mb-6">
                                {typeof plan.credits === 'number' ? `${plan.credits} credits` : plan.credits}
                            </p>

                            <ul className="space-y-3 mb-8 text-left">
                                {plan.features.map((feature, fi) => (
                                    <li key={fi} className="flex items-center gap-2 text-sm text-white/60">
                                        <svg className="w-4 h-4 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <button
                                onClick={onGetStarted}
                                className={plan.popular ? 'btn-primary w-full' : 'btn-outline w-full'}
                            >
                                <span>{t?.pricing?.start || 'Get Started'}</span>
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
