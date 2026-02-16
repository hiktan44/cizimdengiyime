/**
 * Fasheone Affiliate Admin Service
 * Admin tarafı affiliate yönetim işlemleri
 */

import { supabase } from './supabase';
import type {
    Affiliate,
    AffiliateWithProfile,
    AffiliateCommission,
    AffiliatePayout,
} from './affiliateTypes';

// ==========================================
// ORTAK LİSTELEME & YÖNETİM
// ==========================================

/** Tüm ortakları profillerle birlikte listele */
export const getAllAffiliates = async (): Promise<AffiliateWithProfile[]> => {
    const { data, error } = await supabase
        .from('affiliates')
        .select(`
      *,
      profiles:user_id (
        email,
        full_name
      )
    `)
        .order('created_at', { ascending: false });

    if (error) throw new Error('Ortaklar alınamadı: ' + error.message);

    // Her ortak için müşteri sayısını al
    const affiliates = (data || []).map((item: any) => ({
        ...item,
        user_email: item.profiles?.email || '',
        user_name: item.profiles?.full_name || null,
        customer_count: 0,
        profiles: undefined,
    }));

    // Müşteri sayılarını toplu al
    for (const aff of affiliates) {
        const { count } = await supabase
            .from('affiliate_customers')
            .select('*', { count: 'exact', head: true })
            .eq('affiliate_id', aff.id);
        aff.customer_count = count || 0;
    }

    return affiliates as AffiliateWithProfile[];
};

/** Bekleyen başvuruları getir */
export const getPendingApplications = async (): Promise<AffiliateWithProfile[]> => {
    const { data, error } = await supabase
        .from('affiliates')
        .select(`
      *,
      profiles:user_id (
        email,
        full_name
      )
    `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

    if (error) throw new Error('Başvurular alınamadı: ' + error.message);

    return (data || []).map((item: any) => ({
        ...item,
        user_email: item.profiles?.email || '',
        user_name: item.profiles?.full_name || null,
        customer_count: 0,
        profiles: undefined,
    })) as AffiliateWithProfile[];
};

/** Ortağı onayla */
export const approveAffiliate = async (affiliateId: string): Promise<void> => {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);

    const { error } = await supabase
        .from('affiliates')
        .update({
            status: 'active',
            contract_accepted_at: now.toISOString(),
            contract_expires_at: expiresAt.toISOString(),
            updated_at: now.toISOString(),
        })
        .eq('id', affiliateId);

    if (error) throw new Error('Onaylama başarısız: ' + error.message);
};

/** Ortağı reddet */
export const rejectAffiliate = async (affiliateId: string, reason?: string): Promise<void> => {
    const { error } = await supabase
        .from('affiliates')
        .update({
            status: 'terminated',
            notes: reason || 'Başvuru reddedildi',
            updated_at: new Date().toISOString(),
        })
        .eq('id', affiliateId);

    if (error) throw new Error('Ret işlemi başarısız: ' + error.message);
};

/** Ortağı askıya al */
export const suspendAffiliate = async (affiliateId: string, reason?: string): Promise<void> => {
    const { error } = await supabase
        .from('affiliates')
        .update({
            status: 'suspended',
            notes: reason || 'Ortaklık askıya alındı',
            updated_at: new Date().toISOString(),
        })
        .eq('id', affiliateId);

    if (error) throw new Error('Askıya alma başarısız: ' + error.message);
};

// ==========================================
// KOMİSYON YÖNETİMİ
// ==========================================

/** Bekleyen komisyonları onayla */
export const approveCommissions = async (commissionIds: string[]): Promise<void> => {
    const { error } = await supabase
        .from('affiliate_commissions')
        .update({ status: 'approved' })
        .in('id', commissionIds);

    if (error) throw new Error('Komisyon onayı başarısız: ' + error.message);
};

/** Tüm bekleyen komisyonları getir */
export const getPendingCommissions = async (): Promise<AffiliateCommission[]> => {
    const { data, error } = await supabase
        .from('affiliate_commissions')
        .select(`
      *,
      profiles:customer_id (full_name),
      affiliates:affiliate_id (referral_code, user_id)
    `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

    if (error) throw new Error('Komisyonlar alınamadı: ' + error.message);

    return (data || []).map((item: any) => ({
        ...item,
        customer_name: item.profiles?.full_name || 'İsimsiz',
        profiles: undefined,
        affiliates: undefined,
    })) as AffiliateCommission[];
};

// ==========================================
// ÖDEME YÖNETİMİ
// ==========================================

/** Ödeme oluştur */
export const createPayout = async (
    affiliateId: string,
    amount: number,
    periodStart: string,
    periodEnd: string
): Promise<AffiliatePayout> => {
    const { data, error } = await supabase
        .from('affiliate_payouts')
        .insert({
            affiliate_id: affiliateId,
            amount,
            payment_method: 'bank_transfer',
            status: 'processing',
            period_start: periodStart,
            period_end: periodEnd,
        })
        .select()
        .single();

    if (error) throw new Error('Ödeme oluşturulamadı: ' + error.message);
    return data as AffiliatePayout;
};

/** Ödemeyi tamamla */
export const completePayout = async (
    payoutId: string,
    paymentReference: string
): Promise<void> => {
    // Ödeme bilgisini al
    const { data: payout } = await supabase
        .from('affiliate_payouts')
        .select('affiliate_id, amount')
        .eq('id', payoutId)
        .single();

    if (!payout) throw new Error('Ödeme bulunamadı');

    // Ödemeyi tamamla
    const { error } = await supabase
        .from('affiliate_payouts')
        .update({
            status: 'completed',
            payment_reference: paymentReference,
            paid_at: new Date().toISOString(),
        })
        .eq('id', payoutId);

    if (error) throw new Error('Ödeme tamamlanamadı: ' + error.message);

    // Ortak bakiyesini güncelle
    const { data: aff } = await supabase
        .from('affiliates')
        .select('total_paid, pending_balance')
        .eq('id', payout.affiliate_id)
        .single();

    if (aff) {
        await supabase
            .from('affiliates')
            .update({
                total_paid: Number(aff.total_paid) + Number(payout.amount),
                pending_balance: Math.max(0, Number(aff.pending_balance) - Number(payout.amount)),
                updated_at: new Date().toISOString(),
            })
            .eq('id', payout.affiliate_id);
    }

    // İlgili komisyonları 'paid' olarak işaretle
    await supabase
        .from('affiliate_commissions')
        .update({ status: 'paid' })
        .eq('affiliate_id', payout.affiliate_id)
        .eq('status', 'approved');
};

/** Tüm ödemeleri listele */
export const getAllPayouts = async (): Promise<AffiliatePayout[]> => {
    const { data, error } = await supabase
        .from('affiliate_payouts')
        .select(`
      *,
      affiliates:affiliate_id (referral_code, user_id)
    `)
        .order('created_at', { ascending: false });

    if (error) throw new Error('Ödemeler alınamadı: ' + error.message);
    return (data || []) as AffiliatePayout[];
};

// ==========================================
// GENEL İSTATİSTİKLER
// ==========================================

export interface AdminAffiliateStats {
    totalAffiliates: number;
    activeAffiliates: number;
    pendingApplications: number;
    totalCommissions: number;
    totalPaidOut: number;
    pendingPayouts: number;
}

/** Admin genel affiliate istatistikleri */
export const getAdminAffiliateStats = async (): Promise<AdminAffiliateStats> => {
    const { count: total } = await supabase
        .from('affiliates')
        .select('*', { count: 'exact', head: true });

    const { count: active } = await supabase
        .from('affiliates')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

    const { count: pending } = await supabase
        .from('affiliates')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

    const { data: totals } = await supabase
        .from('affiliates')
        .select('total_earnings, total_paid, pending_balance');

    let totalCommissions = 0;
    let totalPaidOut = 0;
    let pendingPayouts = 0;

    (totals || []).forEach((a: any) => {
        totalCommissions += Number(a.total_earnings) || 0;
        totalPaidOut += Number(a.total_paid) || 0;
        pendingPayouts += Number(a.pending_balance) || 0;
    });

    return {
        totalAffiliates: total || 0,
        activeAffiliates: active || 0,
        pendingApplications: pending || 0,
        totalCommissions,
        totalPaidOut,
        pendingPayouts,
    };
};
