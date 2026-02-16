/**
 * Fasheone Admin Affiliate Yönetim Paneli
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
    getAllAffiliates,
    getPendingApplications,
    approveAffiliate,
    rejectAffiliate,
    suspendAffiliate,
    getAdminAffiliateStats,
} from '../../lib/affiliateAdminService';
import type { AffiliateWithProfile } from '../../lib/affiliateTypes';
import type { AdminAffiliateStats } from '../../lib/affiliateAdminService';
import { affiliateTranslations } from '../../lib/i18n/affiliateTranslations';

interface AffiliateManagementProps {
    language: 'tr' | 'en';
}

type AdminTab = 'overview' | 'affiliates' | 'commissions' | 'payouts';

const AffiliateManagement: React.FC<AffiliateManagementProps> = ({ language }) => {
    const t = affiliateTranslations[language].admin;
    const tStatus = affiliateTranslations[language].status;
    const [activeTab, setActiveTab] = useState<AdminTab>('overview');
    const [affiliates, setAffiliates] = useState<AffiliateWithProfile[]>([]);
    const [stats, setStats] = useState<AdminAffiliateStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [affData, statsData] = await Promise.all([
                getAllAffiliates(),
                getAdminAffiliateStats(),
            ]);
            setAffiliates(affData);
            setStats(statsData);
        } catch (err) {
            console.error('Affiliate admin veri yükleme hatası:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    const handleApprove = async (id: string) => {
        setActionLoading(id);
        try {
            await approveAffiliate(id);
            await loadData();
        } catch (err) {
            console.error('Onaylama hatası:', err);
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (id: string) => {
        setActionLoading(id);
        try {
            await rejectAffiliate(id);
            await loadData();
        } catch (err) {
            console.error('Ret hatası:', err);
        } finally {
            setActionLoading(null);
        }
    };

    const handleSuspend = async (id: string) => {
        setActionLoading(id);
        try {
            await suspendAffiliate(id);
            await loadData();
        } catch (err) {
            console.error('Askıya alma hatası:', err);
        } finally {
            setActionLoading(null);
        }
    };

    const formatCurrency = (amount: number) => language === 'tr' ? `₺${amount.toFixed(2)}` : `$${amount.toFixed(2)}`;
    const formatDate = (date: string) => new Date(date).toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US');

    const statusColor = (status: string) => {
        switch (status) {
            case 'active': return { bg: 'rgba(16,185,129,0.15)', color: '#10B981' };
            case 'pending': return { bg: 'rgba(245,158,11,0.15)', color: '#F59E0B' };
            case 'suspended': return { bg: 'rgba(239,68,68,0.15)', color: '#EF4444' };
            default: return { bg: 'rgba(107,114,128,0.15)', color: '#6B7280' };
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
                <div style={{ width: 36, height: 36, border: '3px solid rgba(139,92,246,0.3)', borderTop: '3px solid #8B5CF6', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            </div>
        );
    }

    return (
        <div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: '#FFF', marginBottom: 24 }}>{t.title}</h2>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 4, marginBottom: 24, flexWrap: 'wrap' }}>
                {(['overview', 'affiliates'] as AdminTab[]).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                            padding: '8px 18px',
                            background: activeTab === tab ? 'rgba(139,92,246,0.2)' : 'transparent',
                            border: activeTab === tab ? '1px solid rgba(139,92,246,0.4)' : '1px solid transparent',
                            borderRadius: 8,
                            color: activeTab === tab ? '#A78BFA' : '#9CA3AF',
                            fontSize: 13,
                            fontWeight: 500,
                            cursor: 'pointer',
                        }}
                    >
                        {t.tabs[tab]}
                    </button>
                ))}
            </div>

            {/* Overview */}
            {activeTab === 'overview' && stats && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
                    {[
                        { label: t.stats.totalAffiliates, value: String(stats.totalAffiliates), color: '#8B5CF6', icon: '👥' },
                        { label: t.stats.activeAffiliates, value: String(stats.activeAffiliates), color: '#10B981', icon: '✅' },
                        { label: t.stats.pendingApplications, value: String(stats.pendingApplications), color: '#F59E0B', icon: '⏳' },
                        { label: t.stats.totalCommissions, value: formatCurrency(stats.totalCommissions), color: '#3B82F6', icon: '💰' },
                        { label: t.stats.totalPaidOut, value: formatCurrency(stats.totalPaidOut), color: '#06B6D4', icon: '🏦' },
                        { label: t.stats.pendingPayouts, value: formatCurrency(stats.pendingPayouts), color: '#EC4899', icon: '📋' },
                    ].map((card, i) => (
                        <div key={i} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: '20px 16px', border: '1px solid rgba(255,255,255,0.08)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                                <span style={{ fontSize: 12, color: '#9CA3AF' }}>{card.label}</span>
                                <span>{card.icon}</span>
                            </div>
                            <div style={{ fontSize: 24, fontWeight: 700, color: card.color }}>{card.value}</div>
                        </div>
                    ))}
                </div>
            )}

            {/* Affiliates Table */}
            {activeTab === 'affiliates' && (
                <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
                    {affiliates.length === 0 ? (
                        <div style={{ padding: 60, textAlign: 'center', color: '#6B7280' }}>{t.noAffiliates}</div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr>
                                        {[language === 'tr' ? 'Ortak' : 'Affiliate', 'Email', language === 'tr' ? 'Kod' : 'Code', language === 'tr' ? 'Durum' : 'Status', language === 'tr' ? 'Müşteri' : 'Customers', language === 'tr' ? 'Kazanç' : 'Earnings', language === 'tr' ? 'İşlem' : 'Actions'].map((h, i) => (
                                            <th key={i} style={{ padding: '12px 14px', textAlign: 'left', color: '#9CA3AF', fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.5, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {affiliates.map(aff => {
                                        const sc = statusColor(aff.status);
                                        const isLoading = actionLoading === aff.id;
                                        return (
                                            <tr key={aff.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                                <td style={{ padding: '12px 14px', color: '#E5E7EB', fontSize: 13 }}>{aff.user_name || aff.company_name || '-'}</td>
                                                <td style={{ padding: '12px 14px', color: '#9CA3AF', fontSize: 13 }}>{aff.user_email}</td>
                                                <td style={{ padding: '12px 14px' }}>
                                                    <code style={{ background: 'rgba(139,92,246,0.12)', color: '#A78BFA', padding: '3px 8px', borderRadius: 4, fontSize: 12 }}>{aff.referral_code}</code>
                                                </td>
                                                <td style={{ padding: '12px 14px' }}>
                                                    <span style={{ padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 500, background: sc.bg, color: sc.color }}>{tStatus[aff.status as keyof typeof tStatus]}</span>
                                                </td>
                                                <td style={{ padding: '12px 14px', color: '#E5E7EB', fontSize: 13, textAlign: 'center' }}>{aff.customer_count}</td>
                                                <td style={{ padding: '12px 14px', color: '#10B981', fontSize: 13, fontWeight: 500 }}>{formatCurrency(Number(aff.total_earnings))}</td>
                                                <td style={{ padding: '12px 14px' }}>
                                                    <div style={{ display: 'flex', gap: 6 }}>
                                                        {aff.status === 'pending' && (
                                                            <>
                                                                <button onClick={() => handleApprove(aff.id)} disabled={isLoading} style={{ padding: '4px 10px', background: 'rgba(16,185,129,0.15)', color: '#10B981', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 6, fontSize: 11, cursor: 'pointer', fontWeight: 500, opacity: isLoading ? 0.5 : 1 }}>{t.actions.approve}</button>
                                                                <button onClick={() => handleReject(aff.id)} disabled={isLoading} style={{ padding: '4px 10px', background: 'rgba(239,68,68,0.15)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 6, fontSize: 11, cursor: 'pointer', fontWeight: 500, opacity: isLoading ? 0.5 : 1 }}>{t.actions.reject}</button>
                                                            </>
                                                        )}
                                                        {aff.status === 'active' && (
                                                            <button onClick={() => handleSuspend(aff.id)} disabled={isLoading} style={{ padding: '4px 10px', background: 'rgba(245,158,11,0.15)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 6, fontSize: 11, cursor: 'pointer', fontWeight: 500, opacity: isLoading ? 0.5 : 1 }}>{t.actions.suspend}</button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

export default AffiliateManagement;
