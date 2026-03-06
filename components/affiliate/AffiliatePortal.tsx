/**
 * Fasheone Affiliate Portal – Ana Bileşen
 * Ortakların kazançlarını, müşterilerini ve komisyonlarını takip ettiği panel
 */

import React, { useState, useEffect, useCallback } from 'react';
import type { Profile } from '../../lib/supabase';
import type { Affiliate, AffiliateStats as AffStatsType, AffiliateCustomer, AffiliateCommission, AffiliatePayout, AffiliateApplication } from '../../lib/affiliateTypes';
import {
    getAffiliateProfile,
    getAffiliateStats,
    getAffiliateCustomers,
    getAffiliateCommissions,
    getAffiliatePayouts,
    applyForAffiliate,
    updateAffiliateProfile,
    getReferralLink,
} from '../../lib/affiliateService';
import { affiliateTranslations } from '../../lib/i18n/affiliateTranslations';

interface AffiliatePortalProps {
    profile: Profile;
    language: 'tr' | 'en';
    onNavigateHome: () => void;
}

type TabType = 'dashboard' | 'customers' | 'commissions' | 'payouts' | 'settings';

const AffiliatePortal: React.FC<AffiliatePortalProps> = ({ profile, language, onNavigateHome }) => {
    const t = affiliateTranslations[language];
    const [activeTab, setActiveTab] = useState<TabType>('dashboard');
    const [affiliate, setAffiliate] = useState<Affiliate | null>(null);
    const [stats, setStats] = useState<AffStatsType | null>(null);
    const [customers, setCustomers] = useState<AffiliateCustomer[]>([]);
    const [commissions, setCommissions] = useState<AffiliateCommission[]>([]);
    const [payouts, setPayouts] = useState<AffiliatePayout[]>([]);
    const [loading, setLoading] = useState(true);
    const [showApplication, setShowApplication] = useState(false);
    const [copied, setCopied] = useState(false);

    // Başvuru formu state
    const [appForm, setAppForm] = useState<AffiliateApplication>({});
    const [appLoading, setAppLoading] = useState(false);
    const [appMessage, setAppMessage] = useState('');

    // Ayarlar formu state
    const [settingsForm, setSettingsForm] = useState({
        full_name: '',
        email: '',
        phone: '',
        iban: '',
        bank_account_holder: '',
        bank_name: '',
        swift_code: '',
        company_name: '',
        company_type: '',
        tax_number: '',
        tax_office: '',
        company_address: '',
    });
    const [settingsSaved, setSettingsSaved] = useState(false);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const affData = await getAffiliateProfile(profile.id);
            setAffiliate(affData);

            if (affData && affData.status === 'active') {
                const [statsData, custData, commData, payData] = await Promise.all([
                    getAffiliateStats(affData.id),
                    getAffiliateCustomers(affData.id),
                    getAffiliateCommissions(affData.id),
                    getAffiliatePayouts(affData.id),
                ]);
                setStats(statsData);
                setCustomers(custData);
                setCommissions(commData);
                setPayouts(payData);
                setSettingsForm({
                    full_name: affData.full_name || '',
                    email: affData.email || '',
                    phone: affData.phone || '',
                    iban: affData.iban || '',
                    bank_account_holder: affData.bank_account_holder || '',
                    bank_name: affData.bank_name || '',
                    swift_code: affData.swift_code || '',
                    company_name: affData.company_name || '',
                    company_type: affData.company_type || '',
                    tax_number: affData.tax_number || '',
                    tax_office: affData.tax_office || '',
                    company_address: affData.company_address || '',
                });
            } else if (!affData) {
                setShowApplication(true);
            }
        } catch (err: any) {
            // Tablo yoksa (henüz migration yapılmamış) sessizce başvuru formunu göster
            if (err?.message?.includes('does not exist') || err?.message?.includes('404')) {
                setShowApplication(true);
            } else {
                console.error('Affiliate veri yükleme hatası:', err);
            }
        } finally {
            setLoading(false);
        }
    }, [profile.id]);

    useEffect(() => { loadData(); }, [loadData]);

    const handleApply = async () => {
        // Validasyon - zorunlu alanlar
        if (!appForm.fullName?.trim() || !appForm.email?.trim() || !appForm.phone?.trim() ||
            !appForm.iban?.trim() || !appForm.bankAccountHolder?.trim() || !appForm.bankName?.trim()) {
            setAppMessage((t.application as any).validationError || 'Please fill in required fields');
            return;
        }
        setAppLoading(true);
        setAppMessage('');
        try {
            await applyForAffiliate(profile.id, appForm);
            setAppMessage(t.application.success);
            setShowApplication(false);
            await loadData();
        } catch (err: any) {
            setAppMessage(err.message || t.application.error);
        } finally {
            setAppLoading(false);
        }
    };

    const handleCopyLink = () => {
        if (!affiliate) return;
        navigator.clipboard.writeText(getReferralLink(affiliate.referral_code));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSaveSettings = async () => {
        if (!affiliate) return;
        try {
            await updateAffiliateProfile(affiliate.id, settingsForm);
            setSettingsSaved(true);
            setTimeout(() => setSettingsSaved(false), 2000);
        } catch (err) {
            console.error('Ayar kaydetme hatası:', err);
        }
    };

    const formatCurrency = (amount: number) => {
        return language === 'tr'
            ? `₺${amount.toFixed(2)}`
            : `$${amount.toFixed(2)}`;
    };

    const formatDate = (date: string) => new Date(date).toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US');

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ width: 48, height: 48, border: '4px solid rgba(139,92,246,0.3)', borderTop: '4px solid #8B5CF6', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
                    <p style={{ color: '#9CA3AF' }}>Yükleniyor...</p>
                </div>
            </div>
        );
    }

    // Başvuru Formu
    if (showApplication || (!affiliate)) {
        return (
            <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0F0F1A 0%, #1A1A2E 50%, #16213E 100%)', padding: '40px 20px' }}>
                <div style={{ maxWidth: 600, margin: '0 auto' }}>
                    <button onClick={onNavigateHome} style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', fontSize: 14, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
                        ← {language === 'tr' ? 'Ana Sayfa' : 'Home'}
                    </button>

                    <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 40, border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)' }}>
                        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#FFFFFF', marginBottom: 8 }}>{t.application.title}</h1>
                        <p style={{ color: '#9CA3AF', marginBottom: 32 }}>{t.application.subtitle}</p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                            {/* === Kişisel Bilgiler === */}
                            <div style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 8 }}>
                                <h3 style={{ color: '#A78BFA', fontSize: 15, fontWeight: 600, margin: 0 }}>{(t.application as any).sectionPersonal}</h3>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: 13, color: '#D1D5DB', marginBottom: 6 }}>{(t.application as any).fullName}</label>
                                    <input type="text" value={appForm.fullName || ''} onChange={(e) => setAppForm(p => ({ ...p, fullName: e.target.value }))} placeholder={language === 'tr' ? 'Örn: Ahmet Yılmaz' : 'e.g. John Doe'} style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, color: '#FFF', fontSize: 15, outline: 'none', boxSizing: 'border-box' }} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: 13, color: '#D1D5DB', marginBottom: 6 }}>{(t.application as any).email}</label>
                                        <input type="email" value={appForm.email || ''} onChange={(e) => setAppForm(p => ({ ...p, email: e.target.value }))} placeholder="ornek@email.com" style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, color: '#FFF', fontSize: 15, outline: 'none', boxSizing: 'border-box' }} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: 13, color: '#D1D5DB', marginBottom: 6 }}>{(t.application as any).phone}</label>
                                        <input type="tel" value={appForm.phone || ''} onChange={(e) => setAppForm(p => ({ ...p, phone: e.target.value }))} placeholder="+90 5XX XXX XX XX" style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, color: '#FFF', fontSize: 15, outline: 'none', boxSizing: 'border-box' }} />
                                    </div>
                                </div>
                            </div>

                            {/* === Banka Bilgileri === */}
                            <div style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 8 }}>
                                <h3 style={{ color: '#A78BFA', fontSize: 15, fontWeight: 600, margin: 0 }}>{(t.application as any).sectionBank}</h3>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: 13, color: '#D1D5DB', marginBottom: 6 }}>{(t.application as any).iban}</label>
                                    <input type="text" value={appForm.iban || ''} onChange={(e) => setAppForm(p => ({ ...p, iban: e.target.value }))} placeholder="TR00 0000 0000 0000 0000 0000 00" style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, color: '#FFF', fontSize: 15, outline: 'none', boxSizing: 'border-box' }} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: 13, color: '#D1D5DB', marginBottom: 6 }}>{(t.application as any).bankAccountHolder}</label>
                                        <input type="text" value={appForm.bankAccountHolder || ''} onChange={(e) => setAppForm(p => ({ ...p, bankAccountHolder: e.target.value }))} style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, color: '#FFF', fontSize: 15, outline: 'none', boxSizing: 'border-box' }} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: 13, color: '#D1D5DB', marginBottom: 6 }}>{(t.application as any).bankName}</label>
                                        <input type="text" value={appForm.bankName || ''} onChange={(e) => setAppForm(p => ({ ...p, bankName: e.target.value }))} style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, color: '#FFF', fontSize: 15, outline: 'none', boxSizing: 'border-box' }} />
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: 13, color: '#D1D5DB', marginBottom: 6 }}>{(t.application as any).swiftCode}</label>
                                    <input type="text" value={appForm.swiftCode || ''} onChange={(e) => setAppForm(p => ({ ...p, swiftCode: e.target.value }))} placeholder={language === 'tr' ? 'Opsiyonel' : 'Optional'} style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, color: '#FFF', fontSize: 15, outline: 'none', boxSizing: 'border-box' }} />
                                </div>
                            </div>

                            {/* === Firma Bilgileri (Opsiyonel) === */}
                            <div style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 8 }}>
                                <h3 style={{ color: '#6B7280', fontSize: 15, fontWeight: 600, margin: 0 }}>{(t.application as any).sectionCompany}</h3>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: 13, color: '#D1D5DB', marginBottom: 6 }}>{(t.application as any).companyName}</label>
                                        <input type="text" value={appForm.companyName || ''} onChange={(e) => setAppForm(p => ({ ...p, companyName: e.target.value }))} style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, color: '#FFF', fontSize: 15, outline: 'none', boxSizing: 'border-box' }} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: 13, color: '#D1D5DB', marginBottom: 6 }}>{(t.application as any).companyType}</label>
                                        <select value={appForm.companyType || ''} onChange={(e) => setAppForm(p => ({ ...p, companyType: e.target.value as any }))} style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, color: '#FFF', fontSize: 15, outline: 'none', boxSizing: 'border-box' }}>
                                            <option value="" style={{ background: '#1A1A2E' }}>—</option>
                                            <option value="individual" style={{ background: '#1A1A2E' }}>{(t.application as any).companyTypes?.individual}</option>
                                            <option value="sole_proprietorship" style={{ background: '#1A1A2E' }}>{(t.application as any).companyTypes?.sole_proprietorship}</option>
                                            <option value="limited" style={{ background: '#1A1A2E' }}>{(t.application as any).companyTypes?.limited}</option>
                                            <option value="corporation" style={{ background: '#1A1A2E' }}>{(t.application as any).companyTypes?.corporation}</option>
                                        </select>
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: 13, color: '#D1D5DB', marginBottom: 6 }}>{(t.application as any).taxNumber}</label>
                                        <input type="text" value={appForm.taxNumber || ''} onChange={(e) => setAppForm(p => ({ ...p, taxNumber: e.target.value }))} style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, color: '#FFF', fontSize: 15, outline: 'none', boxSizing: 'border-box' }} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: 13, color: '#D1D5DB', marginBottom: 6 }}>{(t.application as any).taxOffice}</label>
                                        <input type="text" value={appForm.taxOffice || ''} onChange={(e) => setAppForm(p => ({ ...p, taxOffice: e.target.value }))} style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, color: '#FFF', fontSize: 15, outline: 'none', boxSizing: 'border-box' }} />
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: 13, color: '#D1D5DB', marginBottom: 6 }}>{(t.application as any).companyAddress}</label>
                                    <textarea value={appForm.companyAddress || ''} onChange={(e) => setAppForm(p => ({ ...p, companyAddress: e.target.value }))} rows={2} style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, color: '#FFF', fontSize: 15, outline: 'none', boxSizing: 'border-box', resize: 'vertical' }} />
                                </div>
                            </div>

                            <p style={{ color: '#6B7280', fontSize: 12, margin: 0 }}>{(t.application as any).requiredFields}</p>

                            {appMessage && (
                                <p style={{ color: appMessage.includes('hata') || appMessage.includes('error') || appMessage.includes('doldurun') || appMessage.includes('fill') ? '#EF4444' : '#10B981', fontSize: 14 }}>{appMessage}</p>
                            )}

                            <button
                                onClick={handleApply}
                                disabled={appLoading}
                                style={{ width: '100%', padding: '14px 24px', background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)', color: '#FFF', border: 'none', borderRadius: 12, fontSize: 16, fontWeight: 600, cursor: appLoading ? 'not-allowed' : 'pointer', opacity: appLoading ? 0.7 : 1, transition: 'all 0.2s' }}
                            >
                                {appLoading ? t.application.submitting : t.application.submit}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Bekleyen başvuru
    if (affiliate.status === 'pending') {
        return (
            <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0F0F1A 0%, #1A1A2E 50%, #16213E 100%)', padding: '40px 20px' }}>
                <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
                    <button onClick={onNavigateHome} style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', fontSize: 14, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
                        ← {language === 'tr' ? 'Ana Sayfa' : 'Home'}
                    </button>
                    <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 60, border: '1px solid rgba(255,255,255,0.1)' }}>
                        <div style={{ fontSize: 64, marginBottom: 16 }}>⏳</div>
                        <h2 style={{ color: '#FFF', fontSize: 24, marginBottom: 12 }}>{t.status.pending}</h2>
                        <p style={{ color: '#9CA3AF', fontSize: 15 }}>{language === 'tr' ? 'Başvurunuz inceleniyor. En kısa sürede bilgilendirileceksiniz.' : 'Your application is being reviewed. You will be notified soon.'}</p>
                    </div>
                </div>
            </div>
        );
    }

    // Askıya alınmış veya sonlandırılmış
    if (affiliate.status === 'suspended' || affiliate.status === 'terminated') {
        return (
            <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0F0F1A 0%, #1A1A2E 50%, #16213E 100%)', padding: '40px 20px' }}>
                <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
                    <button onClick={onNavigateHome} style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', fontSize: 14, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
                        ← {language === 'tr' ? 'Ana Sayfa' : 'Home'}
                    </button>
                    <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 60, border: '1px solid rgba(239,68,68,0.3)' }}>
                        <div style={{ fontSize: 64, marginBottom: 16 }}>🚫</div>
                        <h2 style={{ color: '#EF4444', fontSize: 24, marginBottom: 12 }}>{t.status[affiliate.status]}</h2>
                        <p style={{ color: '#9CA3AF', fontSize: 15 }}>{affiliate.notes || ''}</p>
                    </div>
                </div>
            </div>
        );
    }

    // Aktif ortak paneli
    const tabs: { key: TabType; label: string; icon: string }[] = [
        { key: 'dashboard', label: t.portal.tabs.dashboard, icon: '📊' },
        { key: 'customers', label: t.portal.tabs.customers, icon: '👥' },
        { key: 'commissions', label: t.portal.tabs.commissions, icon: '💰' },
        { key: 'payouts', label: t.portal.tabs.payouts, icon: '🏦' },
        { key: 'settings', label: t.portal.tabs.settings, icon: '⚙️' },
    ];

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0F0F1A 0%, #1A1A2E 50%, #16213E 100%)', padding: '24px 20px' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap', gap: 12 }}>
                    <div>
                        <button onClick={onNavigateHome} style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', fontSize: 13, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                            ← {language === 'tr' ? 'Ana Sayfa' : 'Home'}
                        </button>
                        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#FFF', margin: 0 }}>{t.portal.title}</h1>
                        <p style={{ color: '#9CA3AF', fontSize: 14, margin: '4px 0 0' }}>{t.portal.subtitle}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ background: 'rgba(16,185,129,0.15)', color: '#10B981', padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 500 }}>
                            {affiliate.referral_code}
                        </span>
                        <button
                            onClick={handleCopyLink}
                            style={{ padding: '8px 16px', background: copied ? '#10B981' : 'rgba(139,92,246,0.2)', color: copied ? '#FFF' : '#A78BFA', border: '1px solid ' + (copied ? '#10B981' : 'rgba(139,92,246,0.3)'), borderRadius: 10, fontSize: 13, cursor: 'pointer', fontWeight: 500, transition: 'all 0.2s' }}
                        >
                            {copied ? t.settings.copied : t.settings.copyLink}
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: 4, marginBottom: 28, overflowX: 'auto', paddingBottom: 4 }}>
                    {tabs.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            style={{
                                padding: '10px 20px',
                                background: activeTab === tab.key ? 'rgba(139,92,246,0.2)' : 'transparent',
                                border: activeTab === tab.key ? '1px solid rgba(139,92,246,0.4)' : '1px solid transparent',
                                borderRadius: 10,
                                color: activeTab === tab.key ? '#A78BFA' : '#9CA3AF',
                                fontSize: 14,
                                fontWeight: 500,
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                                transition: 'all 0.2s',
                            }}
                        >
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>

                {/* Dashboard Tab */}
                {activeTab === 'dashboard' && stats && (
                    <div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 24 }}>
                            {[
                                { label: t.stats.totalEarnings, value: formatCurrency(stats.totalEarnings), color: '#10B981', icon: '💎' },
                                { label: t.stats.pendingBalance, value: formatCurrency(stats.pendingBalance), color: '#F59E0B', icon: '⏳' },
                                { label: t.stats.totalPaid, value: formatCurrency(stats.totalPaid), color: '#3B82F6', icon: '✅' },
                                { label: t.stats.thisMonth, value: formatCurrency(stats.thisMonthEarnings), color: '#8B5CF6', icon: '📈' },
                                { label: t.stats.totalCustomers, value: String(stats.totalCustomers), color: '#EC4899', icon: '👥' },
                                { label: t.stats.convertedCustomers, value: String(stats.convertedCustomers), color: '#06B6D4', icon: '🎯' },
                                { label: t.stats.totalClicks, value: String(stats.totalClicks), color: '#F97316', icon: '🔗' },
                                { label: t.stats.conversionRate, value: `${stats.conversionRate.toFixed(1)}%`, color: '#14B8A6', icon: '📊' },
                            ].map((card, i) => (
                                <div key={i} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: '24px 20px', border: '1px solid rgba(255,255,255,0.08)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                        <span style={{ fontSize: 13, color: '#9CA3AF' }}>{card.label}</span>
                                        <span style={{ fontSize: 20 }}>{card.icon}</span>
                                    </div>
                                    <div style={{ fontSize: 28, fontWeight: 700, color: card.color }}>{card.value}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Customers Tab */}
                {activeTab === 'customers' && (
                    <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 14, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                            <h3 style={{ color: '#FFF', fontSize: 18, fontWeight: 600, margin: 0 }}>{t.customers.title}</h3>
                        </div>
                        {customers.length === 0 ? (
                            <div style={{ padding: 60, textAlign: 'center', color: '#6B7280' }}>{t.customers.noCustomers}</div>
                        ) : (
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr>
                                            {[t.customers.name, t.customers.status, t.customers.attributedAt, t.customers.firstPurchase, t.customers.amount].map((h, i) => (
                                                <th key={i} style={{ padding: '12px 16px', textAlign: 'left', color: '#9CA3AF', fontSize: 12, fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.5, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {customers.map(c => (
                                            <tr key={c.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                                <td style={{ padding: '14px 16px', color: '#E5E7EB', fontSize: 14 }}>{c.customer_name}</td>
                                                <td style={{ padding: '14px 16px' }}>
                                                    <span style={{ padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 500, background: c.status === 'converted' ? 'rgba(16,185,129,0.15)' : c.status === 'expired' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)', color: c.status === 'converted' ? '#10B981' : c.status === 'expired' ? '#EF4444' : '#F59E0B' }}>
                                                        {t.customers.statusLabels[c.status]}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '14px 16px', color: '#9CA3AF', fontSize: 14 }}>{formatDate(c.attributed_at)}</td>
                                                <td style={{ padding: '14px 16px', color: '#9CA3AF', fontSize: 14 }}>{c.first_purchase_at ? formatDate(c.first_purchase_at) : '-'}</td>
                                                <td style={{ padding: '14px 16px', color: '#E5E7EB', fontSize: 14, fontWeight: 500 }}>{c.first_purchase_amount ? formatCurrency(c.first_purchase_amount) : '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* Commissions Tab */}
                {activeTab === 'commissions' && (
                    <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 14, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                            <h3 style={{ color: '#FFF', fontSize: 18, fontWeight: 600, margin: 0 }}>{t.commissions.title}</h3>
                        </div>
                        {commissions.length === 0 ? (
                            <div style={{ padding: 60, textAlign: 'center', color: '#6B7280' }}>{t.commissions.noCommissions}</div>
                        ) : (
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr>
                                            {[t.commissions.customer, t.commissions.orderAmount, t.commissions.rate, t.commissions.commission, t.commissions.status, t.commissions.date].map((h, i) => (
                                                <th key={i} style={{ padding: '12px 16px', textAlign: 'left', color: '#9CA3AF', fontSize: 12, fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.5, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {commissions.map(c => (
                                            <tr key={c.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                                <td style={{ padding: '14px 16px', color: '#E5E7EB', fontSize: 14 }}>{c.customer_name || '-'}</td>
                                                <td style={{ padding: '14px 16px', color: '#9CA3AF', fontSize: 14 }}>{formatCurrency(c.order_amount)}</td>
                                                <td style={{ padding: '14px 16px', color: '#9CA3AF', fontSize: 14 }}>{(c.commission_rate * 100).toFixed(0)}%</td>
                                                <td style={{ padding: '14px 16px', color: '#10B981', fontSize: 14, fontWeight: 600 }}>{formatCurrency(c.commission_amount)}</td>
                                                <td style={{ padding: '14px 16px' }}>
                                                    <span style={{ padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 500, background: c.status === 'paid' ? 'rgba(16,185,129,0.15)' : c.status === 'approved' ? 'rgba(59,130,246,0.15)' : c.status === 'cancelled' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)', color: c.status === 'paid' ? '#10B981' : c.status === 'approved' ? '#3B82F6' : c.status === 'cancelled' ? '#EF4444' : '#F59E0B' }}>
                                                        {t.commissions.statusLabels[c.status]}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '14px 16px', color: '#9CA3AF', fontSize: 14 }}>{formatDate(c.created_at)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* Payouts Tab */}
                {activeTab === 'payouts' && (
                    <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 14, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                            <h3 style={{ color: '#FFF', fontSize: 18, fontWeight: 600, margin: 0 }}>{t.payouts.title}</h3>
                        </div>
                        {payouts.length === 0 ? (
                            <div style={{ padding: 60, textAlign: 'center', color: '#6B7280' }}>{t.payouts.noPayouts}</div>
                        ) : (
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr>
                                            {[t.payouts.amount, t.payouts.method, t.payouts.status, t.payouts.period, t.payouts.paidAt, t.payouts.reference].map((h, i) => (
                                                <th key={i} style={{ padding: '12px 16px', textAlign: 'left', color: '#9CA3AF', fontSize: 12, fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.5, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {payouts.map(p => (
                                            <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                                <td style={{ padding: '14px 16px', color: '#10B981', fontSize: 14, fontWeight: 600 }}>{formatCurrency(p.amount)}</td>
                                                <td style={{ padding: '14px 16px', color: '#9CA3AF', fontSize: 14 }}>{t.payouts.bankTransfer}</td>
                                                <td style={{ padding: '14px 16px' }}>
                                                    <span style={{ padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 500, background: p.status === 'completed' ? 'rgba(16,185,129,0.15)' : p.status === 'failed' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)', color: p.status === 'completed' ? '#10B981' : p.status === 'failed' ? '#EF4444' : '#F59E0B' }}>
                                                        {t.payouts.statusLabels[p.status]}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '14px 16px', color: '#9CA3AF', fontSize: 14 }}>{p.period_start && p.period_end ? `${formatDate(p.period_start)} - ${formatDate(p.period_end)}` : '-'}</td>
                                                <td style={{ padding: '14px 16px', color: '#9CA3AF', fontSize: 14 }}>{p.paid_at ? formatDate(p.paid_at) : '-'}</td>
                                                <td style={{ padding: '14px 16px', color: '#9CA3AF', fontSize: 14 }}>{p.payment_reference || '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* Settings Tab */}
                {activeTab === 'settings' && (
                    <div style={{ maxWidth: 600 }}>
                        {/* Referral Link */}
                        <div style={{ background: 'rgba(139,92,246,0.08)', borderRadius: 14, padding: 24, border: '1px solid rgba(139,92,246,0.2)', marginBottom: 24 }}>
                            <label style={{ display: 'block', fontSize: 13, color: '#A78BFA', marginBottom: 8, fontWeight: 500 }}>{t.settings.referralLink}</label>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <input
                                    type="text"
                                    readOnly
                                    value={getReferralLink(affiliate.referral_code)}
                                    style={{ flex: 1, padding: '10px 14px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#E5E7EB', fontSize: 14 }}
                                />
                                <button onClick={handleCopyLink} style={{ padding: '10px 18px', background: copied ? '#10B981' : '#8B5CF6', color: '#FFF', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                                    {copied ? t.settings.copied : t.settings.copyLink}
                                </button>
                            </div>
                        </div>

                        {/* Sözleşme durumu */}
                        <div style={{ background: 'rgba(16,185,129,0.08)', borderRadius: 14, padding: 20, border: '1px solid rgba(16,185,129,0.2)', marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <span style={{ fontSize: 13, color: '#9CA3AF' }}>{t.settings.contractStatus}</span>
                                <div style={{ color: '#10B981', fontWeight: 600, fontSize: 15 }}>{t.settings.contractActive}</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <span style={{ fontSize: 13, color: '#9CA3AF' }}>{t.settings.contractExpires}</span>
                                <div style={{ color: '#E5E7EB', fontSize: 15 }}>{affiliate.contract_expires_at ? formatDate(affiliate.contract_expires_at) : '-'}</div>
                            </div>
                        </div>

                        {/* Bilgi Formu */}
                        <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: 28, border: '1px solid rgba(255,255,255,0.08)' }}>
                            <h3 style={{ color: '#FFF', fontSize: 18, fontWeight: 600, margin: '0 0 24px' }}>{t.settings.title}</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                                {/* Kişisel Bilgiler */}
                                <div style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 6 }}>
                                    <span style={{ color: '#A78BFA', fontSize: 14, fontWeight: 600 }}>{(t.settings as any).sectionPersonal}</span>
                                </div>
                                {[
                                    { key: 'full_name' as const, label: (t.settings as any).fullName },
                                    { key: 'email' as const, label: (t.settings as any).email, type: 'email' },
                                    { key: 'phone' as const, label: (t.settings as any).phone, type: 'tel' },
                                ].map(field => (
                                    <div key={field.key}>
                                        <label style={{ display: 'block', fontSize: 13, color: '#D1D5DB', marginBottom: 6 }}>{field.label}</label>
                                        <input type={field.type || 'text'} value={settingsForm[field.key]} onChange={(e) => setSettingsForm(p => ({ ...p, [field.key]: e.target.value }))} style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, color: '#FFF', fontSize: 15, outline: 'none', boxSizing: 'border-box' }} />
                                    </div>
                                ))}

                                {/* Banka Bilgileri */}
                                <div style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 6, marginTop: 8 }}>
                                    <span style={{ color: '#A78BFA', fontSize: 14, fontWeight: 600 }}>{(t.settings as any).sectionBank}</span>
                                </div>
                                {[
                                    { key: 'iban' as const, label: (t.settings as any).iban },
                                    { key: 'bank_account_holder' as const, label: (t.settings as any).bankAccountHolder },
                                    { key: 'bank_name' as const, label: (t.settings as any).bankName },
                                    { key: 'swift_code' as const, label: (t.settings as any).swiftCode },
                                ].map(field => (
                                    <div key={field.key}>
                                        <label style={{ display: 'block', fontSize: 13, color: '#D1D5DB', marginBottom: 6 }}>{field.label}</label>
                                        <input type="text" value={settingsForm[field.key]} onChange={(e) => setSettingsForm(p => ({ ...p, [field.key]: e.target.value }))} style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, color: '#FFF', fontSize: 15, outline: 'none', boxSizing: 'border-box' }} />
                                    </div>
                                ))}

                                {/* Firma Bilgileri (Opsiyonel) */}
                                <div style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 6, marginTop: 8 }}>
                                    <span style={{ color: '#6B7280', fontSize: 14, fontWeight: 600 }}>{(t.settings as any).sectionCompany}</span>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: 13, color: '#D1D5DB', marginBottom: 6 }}>{(t.settings as any).companyName}</label>
                                    <input type="text" value={settingsForm.company_name} onChange={(e) => setSettingsForm(p => ({ ...p, company_name: e.target.value }))} style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, color: '#FFF', fontSize: 15, outline: 'none', boxSizing: 'border-box' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: 13, color: '#D1D5DB', marginBottom: 6 }}>{(t.settings as any).companyType}</label>
                                    <select value={settingsForm.company_type} onChange={(e) => setSettingsForm(p => ({ ...p, company_type: e.target.value }))} style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, color: '#FFF', fontSize: 15, outline: 'none', boxSizing: 'border-box' }}>
                                        <option value="" style={{ background: '#1A1A2E' }}>—</option>
                                        <option value="individual" style={{ background: '#1A1A2E' }}>{(t.settings as any).companyTypes?.individual}</option>
                                        <option value="sole_proprietorship" style={{ background: '#1A1A2E' }}>{(t.settings as any).companyTypes?.sole_proprietorship}</option>
                                        <option value="limited" style={{ background: '#1A1A2E' }}>{(t.settings as any).companyTypes?.limited}</option>
                                        <option value="corporation" style={{ background: '#1A1A2E' }}>{(t.settings as any).companyTypes?.corporation}</option>
                                    </select>
                                </div>
                                {[
                                    { key: 'tax_number' as const, label: (t.settings as any).taxNumber },
                                    { key: 'tax_office' as const, label: (t.settings as any).taxOffice },
                                    { key: 'company_address' as const, label: (t.settings as any).companyAddress },
                                ].map(field => (
                                    <div key={field.key}>
                                        <label style={{ display: 'block', fontSize: 13, color: '#D1D5DB', marginBottom: 6 }}>{field.label}</label>
                                        <input type="text" value={settingsForm[field.key]} onChange={(e) => setSettingsForm(p => ({ ...p, [field.key]: e.target.value }))} style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, color: '#FFF', fontSize: 15, outline: 'none', boxSizing: 'border-box' }} />
                                    </div>
                                ))}

                                <button
                                    onClick={handleSaveSettings}
                                    style={{ width: '100%', padding: '12px 20px', background: settingsSaved ? '#10B981' : 'linear-gradient(135deg, #8B5CF6, #6D28D9)', color: '#FFF', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', marginTop: 12 }}
                                >
                                    {settingsSaved ? t.settings.saved : t.settings.save}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
        </div>
    );
};

export default AffiliatePortal;
