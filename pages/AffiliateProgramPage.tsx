/**
 * Fasheone Ortaklık Programı Bilgilendirme Sayfası
 * Herkese açık – programa katılım için bilgi ve başvuru CTA
 */

import React from 'react';
import { affiliateTranslations } from '../lib/i18n/affiliateTranslations';

interface AffiliateProgramPageProps {
    language: 'tr' | 'en';
    onApply: () => void;
    onNavigateHome: () => void;
}

const AffiliateProgramPage: React.FC<AffiliateProgramPageProps> = ({ language, onApply, onNavigateHome }) => {
    const t = affiliateTranslations[language].infoPage;

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0F0F1A 0%, #1A1A2E 50%, #16213E 100%)' }}>
            {/* Header */}
            <div style={{ padding: '16px 24px' }}>
                <button onClick={onNavigateHome} style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                    ← {language === 'tr' ? 'Ana Sayfa' : 'Home'}
                </button>
            </div>

            {/* Hero */}
            <div style={{ textAlign: 'center', padding: '60px 20px 80px', position: 'relative' }}>
                <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 600, height: 600, background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
                <div style={{ fontSize: 64, marginBottom: 20 }}>🤝</div>
                <h1 style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 800, color: '#FFFFFF', marginBottom: 16, lineHeight: 1.2 }}>
                    {t.heroTitle}
                </h1>
                <p style={{ fontSize: 'clamp(16px, 2vw, 20px)', color: '#9CA3AF', maxWidth: 600, margin: '0 auto 36px', lineHeight: 1.6 }}>
                    {t.heroSubtitle}
                </p>
                <button
                    onClick={onApply}
                    style={{ padding: '16px 40px', background: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)', color: '#FFF', border: 'none', borderRadius: 14, fontSize: 18, fontWeight: 700, cursor: 'pointer', boxShadow: '0 8px 32px rgba(139,92,246,0.3)', transition: 'all 0.3s', letterSpacing: 0.5 }}
                >
                    {t.ctaButton}
                </button>
            </div>

            {/* Kademeli Komisyon Tablosu */}
            <div style={{ padding: '0 20px 80px', maxWidth: 900, margin: '0 auto' }}>
                <h2 style={{ fontSize: 28, fontWeight: 700, color: '#FFF', textAlign: 'center', marginBottom: 40 }}>{t.commission.title}</h2>

                {/* Kademeli Oranlar */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 32 }}>
                    {(t.commission as any).tiers.map((tier: any, i: number) => {
                        const gradients = [
                            'linear-gradient(135deg, #6366F1, #4F46E5)',
                            'linear-gradient(135deg, #8B5CF6, #6D28D9)',
                            'linear-gradient(135deg, #10B981, #059669)',
                        ];
                        const emojis = ['🌱', '🚀', '💎'];
                        return (
                            <div key={i} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: '32px 20px', border: '1px solid rgba(255,255,255,0.08)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                                <div style={{ fontSize: 32, marginBottom: 12 }}>{emojis[i]}</div>
                                <div style={{ fontSize: 36, fontWeight: 800, background: gradients[i], WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 8 }}>
                                    {tier.rate}
                                </div>
                                <div style={{ fontSize: 14, color: '#9CA3AF', lineHeight: 1.5 }}>{tier.range}</div>
                            </div>
                        );
                    })}
                </div>

                {/* Süre & Garanti Kartları */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20, marginBottom: 80 }}>
                    {[
                        { value: t.commission.duration, label: t.commission.durationLabel, gradient: 'linear-gradient(135deg, #3B82F6, #1D4ED8)' },
                        { value: t.commission.condition, label: t.commission.conditionLabel, gradient: 'linear-gradient(135deg, #F59E0B, #D97706)' },
                    ].map((item, i) => (
                        <div key={i} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: '32px 20px', border: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
                            <div style={{ fontSize: 36, fontWeight: 800, background: item.gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 8 }}>
                                {item.value}
                            </div>
                            <div style={{ fontSize: 14, color: '#9CA3AF' }}>{item.label}</div>
                        </div>
                    ))}
                </div>

                {/* Avantajlar */}
                <div style={{ marginBottom: 80 }}>
                    <h2 style={{ fontSize: 28, fontWeight: 700, color: '#FFF', textAlign: 'center', marginBottom: 40 }}>{t.benefits.title}</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
                        {t.benefits.items.map((item, i) => {
                            const icons = ['💎', '🛡️', '📊', '💳'];
                            const colors = ['#8B5CF6', '#10B981', '#3B82F6', '#F59E0B'];
                            return (
                                <div key={i} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: '28px 24px', border: '1px solid rgba(255,255,255,0.08)', transition: 'all 0.3s' }}>
                                    <div style={{ fontSize: 36, marginBottom: 16 }}>{icons[i]}</div>
                                    <h3 style={{ fontSize: 17, fontWeight: 600, color: colors[i], marginBottom: 8 }}>{item.title}</h3>
                                    <p style={{ fontSize: 14, color: '#9CA3AF', lineHeight: 1.5, margin: 0 }}>{item.desc}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Nasıl Çalışır */}
                <div style={{ marginBottom: 80 }}>
                    <h2 style={{ fontSize: 28, fontWeight: 700, color: '#FFF', textAlign: 'center', marginBottom: 40 }}>{t.howItWorks.title}</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
                        {t.howItWorks.steps.map((step, i) => {
                            const stepColors = ['#8B5CF6', '#3B82F6', '#10B981'];
                            return (
                                <div key={i} style={{ textAlign: 'center', position: 'relative' }}>
                                    <div style={{ width: 56, height: 56, borderRadius: '50%', background: `${stepColors[i]}20`, border: `2px solid ${stepColors[i]}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 22, fontWeight: 800, color: stepColors[i] }}>
                                        {i + 1}
                                    </div>
                                    <h3 style={{ fontSize: 18, fontWeight: 600, color: '#FFF', marginBottom: 8 }}>{step.title}</h3>
                                    <p style={{ fontSize: 14, color: '#9CA3AF', lineHeight: 1.5, margin: 0 }}>{step.desc}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* SSS */}
                <div style={{ marginBottom: 80 }}>
                    <h2 style={{ fontSize: 28, fontWeight: 700, color: '#FFF', textAlign: 'center', marginBottom: 40 }}>{t.faq.title}</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 700, margin: '0 auto' }}>
                        {t.faq.items.map((item, i) => (
                            <div key={i} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: '20px 24px', border: '1px solid rgba(255,255,255,0.08)' }}>
                                <h4 style={{ fontSize: 15, fontWeight: 600, color: '#E5E7EB', marginBottom: 8 }}>{item.q}</h4>
                                <p style={{ fontSize: 14, color: '#9CA3AF', lineHeight: 1.5, margin: 0 }}>{item.a}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom CTA */}
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <button
                        onClick={onApply}
                        style={{ padding: '16px 48px', background: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)', color: '#FFF', border: 'none', borderRadius: 14, fontSize: 18, fontWeight: 700, cursor: 'pointer', boxShadow: '0 8px 32px rgba(139,92,246,0.3)' }}
                    >
                        {t.ctaButton}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AffiliateProgramPage;
