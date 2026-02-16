/**
 * Fasheone Affiliate Service
 * Ortak tarafı işlemleri (başvuru, profil, müşteriler, komisyonlar, ödemeler)
 */

import { supabase } from './supabase';
import type {
    Affiliate,
    AffiliateApplication,
    AffiliateCustomer,
    AffiliateCommission,
    AffiliatePayout,
    AffiliateReferral,
    AffiliateStats,
} from './affiliateTypes';

// ==========================================
// BAŞVURU & PROFİL
// ==========================================

/** Client-side benzersiz referral code üret */
const generateReferralCode = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const prefix = 'FSH';
    let code = prefix;
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
};

/** Ortaklık başvurusu oluştur */
export const applyForAffiliate = async (
    userId: string,
    application: AffiliateApplication
): Promise<Affiliate> => {
    const referralCode = generateReferralCode();

    const { data, error } = await supabase
        .from('affiliates')
        .insert({
            user_id: userId,
            referral_code: referralCode,
            status: 'pending',
            commission_rate: 0.15, // Başlangıç kademe
            // Kişisel bilgiler
            full_name: application.fullName || null,
            email: application.email || null,
            phone: application.phone || null,
            // Banka bilgileri
            iban: application.iban || null,
            bank_account_holder: application.bankAccountHolder || null,
            bank_name: application.bankName || null,
            swift_code: application.swiftCode || null,
            // Firma bilgileri (opsiyonel)
            company_name: application.companyName || null,
            company_type: application.companyType || null,
            tax_number: application.taxNumber || null,
            tax_office: application.taxOffice || null,
            company_address: application.companyAddress || null,
        })
        .select()
        .single();

    if (error) throw new Error('Başvuru oluşturulamadı: ' + error.message);

    // Profil tablosunda is_affiliate işaretle
    await supabase.from('profiles').update({ is_affiliate: true }).eq('id', userId);

    return data as Affiliate;
};

/** Ortak profilini getir */
export const getAffiliateProfile = async (userId: string): Promise<Affiliate | null> => {
    const { data, error } = await supabase
        .from('affiliates')
        .select('*')
        .eq('user_id', userId)
        .single();

    if (error) {
        // Kayıt bulunamadı veya tablo henüz oluşturulmamış
        if (error.code === 'PGRST116' || error.code === '42P01' || error.message?.includes('does not exist')) {
            return null;
        }
        throw new Error('Profil alınamadı: ' + error.message);
    }
    return data as Affiliate;
};

/** Ortak profilini güncelle (kişisel, banka, firma bilgileri) */
export const updateAffiliateProfile = async (
    affiliateId: string,
    updates: Partial<Pick<Affiliate, 'full_name' | 'email' | 'phone' | 'iban' | 'bank_account_holder' | 'bank_name' | 'swift_code' | 'company_name' | 'company_type' | 'tax_number' | 'tax_office' | 'company_address'>>
): Promise<Affiliate> => {
    const { data, error } = await supabase
        .from('affiliates')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', affiliateId)
        .select()
        .single();

    if (error) throw new Error('Profil güncellenemedi: ' + error.message);
    return data as Affiliate;
};

/** Sözleşmeyi kabul et */
export const acceptAffiliateContract = async (affiliateId: string): Promise<void> => {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000); // 1 yıl

    const { error } = await supabase
        .from('affiliates')
        .update({
            contract_accepted_at: now.toISOString(),
            contract_expires_at: expiresAt.toISOString(),
            updated_at: now.toISOString(),
        })
        .eq('id', affiliateId);

    if (error) throw new Error('Sözleşme onaylanamadı: ' + error.message);
};

// ==========================================
// İSTATİSTİKLER
// ==========================================

/** Ortak istatistiklerini getir */
export const getAffiliateStats = async (affiliateId: string): Promise<AffiliateStats> => {
    // Profil bilgileri
    const { data: aff } = await supabase
        .from('affiliates')
        .select('total_earnings, total_paid, pending_balance')
        .eq('id', affiliateId)
        .single();

    // Müşteri sayıları
    const { count: totalCustomers } = await supabase
        .from('affiliate_customers')
        .select('*', { count: 'exact', head: true })
        .eq('affiliate_id', affiliateId);

    const { count: convertedCustomers } = await supabase
        .from('affiliate_customers')
        .select('*', { count: 'exact', head: true })
        .eq('affiliate_id', affiliateId)
        .eq('status', 'converted');

    // Tıklama sayısı
    const { count: totalClicks } = await supabase
        .from('affiliate_referrals')
        .select('*', { count: 'exact', head: true })
        .eq('affiliate_id', affiliateId);

    // Bu ay kazanç
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { data: monthCommissions } = await supabase
        .from('affiliate_commissions')
        .select('commission_amount')
        .eq('affiliate_id', affiliateId)
        .gte('created_at', startOfMonth.toISOString())
        .neq('status', 'cancelled');

    const thisMonthEarnings = monthCommissions?.reduce(
        (sum, c) => sum + Number(c.commission_amount),
        0
    ) || 0;

    const total = totalCustomers || 0;
    const converted = convertedCustomers || 0;
    const clicks = totalClicks || 0;

    return {
        totalEarnings: Number(aff?.total_earnings) || 0,
        totalPaid: Number(aff?.total_paid) || 0,
        pendingBalance: Number(aff?.pending_balance) || 0,
        totalCustomers: total,
        convertedCustomers: converted,
        totalClicks: clicks,
        conversionRate: clicks > 0 ? (total / clicks) * 100 : 0,
        thisMonthEarnings,
    };
};

// ==========================================
// MÜŞTERİLER
// ==========================================

/** Ortağın müşterilerini listele */
export const getAffiliateCustomers = async (
    affiliateId: string
): Promise<AffiliateCustomer[]> => {
    const { data, error } = await supabase
        .from('affiliate_customers')
        .select(`
      *,
      profiles:customer_id (
        full_name,
        email
      )
    `)
        .eq('affiliate_id', affiliateId)
        .order('attributed_at', { ascending: false });

    if (error) throw new Error('Müşteriler alınamadı: ' + error.message);

    return (data || []).map((item: any) => ({
        ...item,
        customer_name: item.profiles?.full_name || 'İsimsiz',
        customer_email: item.profiles?.email || '',
        profiles: undefined,
    })) as AffiliateCustomer[];
};

// ==========================================
// KOMİSYONLAR
// ==========================================

/** Ortağın komisyonlarını listele */
export const getAffiliateCommissions = async (
    affiliateId: string
): Promise<AffiliateCommission[]> => {
    const { data, error } = await supabase
        .from('affiliate_commissions')
        .select(`
      *,
      profiles:customer_id (
        full_name
      )
    `)
        .eq('affiliate_id', affiliateId)
        .order('created_at', { ascending: false });

    if (error) throw new Error('Komisyonlar alınamadı: ' + error.message);

    return (data || []).map((item: any) => ({
        ...item,
        customer_name: item.profiles?.full_name || 'İsimsiz',
        profiles: undefined,
    })) as AffiliateCommission[];
};

/**
 * Kademeli komisyon oranı hesapla
 * 0 - 1000 kredi: %15
 * 1000 - 10000 kredi: %20
 * 10000+ kredi: %25
 */
export const getTieredCommissionRate = (totalCreditsReferred: number): number => {
    if (totalCreditsReferred >= 10000) return 0.25;
    if (totalCreditsReferred >= 1000) return 0.20;
    return 0.15;
};

/** Komisyon hesapla ve kaydet (kademeli oran sistemi) */
export const calculateCommission = async (
    affiliateId: string,
    customerId: string,
    transactionId: string,
    orderAmount: number
): Promise<AffiliateCommission> => {
    // Ortağın bilgilerini al
    const { data: aff } = await supabase
        .from('affiliates')
        .select('contract_expires_at, total_earnings')
        .eq('id', affiliateId)
        .single();

    if (!aff) throw new Error('Ortak bulunamadı');

    // Sözleşme süresi dolmuş mu kontrol et
    if (aff.contract_expires_at && new Date(aff.contract_expires_at) < new Date()) {
        throw new Error('Sözleşme süresi dolmuş');
    }

    // Ortağın toplam kullandırdığı krediyi hesapla
    const { data: totalData } = await supabase
        .from('affiliate_commissions')
        .select('order_amount')
        .eq('affiliate_id', affiliateId);

    const totalCreditsReferred = (totalData || []).reduce(
        (sum, c) => sum + (Number(c.order_amount) || 0), 0
    );

    // Kademeli oran belirle
    const rate = getTieredCommissionRate(totalCreditsReferred);
    const amount = orderAmount * rate;

    // Komisyon kaydı oluştur
    const { data, error } = await supabase
        .from('affiliate_commissions')
        .insert({
            affiliate_id: affiliateId,
            customer_id: customerId,
            transaction_id: transactionId,
            order_amount: orderAmount,
            commission_rate: rate,
            commission_amount: amount,
            status: 'pending',
        })
        .select()
        .single();

    if (error) throw new Error('Komisyon kaydedilemedi: ' + error.message);

    // Bekleyen bakiyeyi güncelle
    await supabase.rpc('increment_affiliate_balance', {
        p_affiliate_id: affiliateId,
        p_amount: amount,
    }).then(({ error: rpcError }) => {
        // RPC yoksa manuel güncelle
        if (rpcError) {
            supabase
                .from('affiliates')
                .update({
                    pending_balance: (Number(aff.total_earnings) || 0) + amount,
                    total_earnings: (Number(aff.total_earnings) || 0) + amount,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', affiliateId);
        }
    });

    return data as AffiliateCommission;
};

// ==========================================
// ÖDEMELER
// ==========================================

/** Ortağın ödeme geçmişini getir */
export const getAffiliatePayouts = async (
    affiliateId: string
): Promise<AffiliatePayout[]> => {
    const { data, error } = await supabase
        .from('affiliate_payouts')
        .select('*')
        .eq('affiliate_id', affiliateId)
        .order('created_at', { ascending: false });

    if (error) throw new Error('Ödemeler alınamadı: ' + error.message);
    return (data || []) as AffiliatePayout[];
};

// ==========================================
// REFERRAL LİNK TAKİBİ
// ==========================================

/** Referral link tıklamasını kaydet */
export const trackReferralClick = async (referralCode: string): Promise<void> => {
    // Ortağı bul
    const { data: aff } = await supabase
        .from('affiliates')
        .select('id')
        .eq('referral_code', referralCode)
        .eq('status', 'active')
        .single();

    if (!aff) return; // Geçersiz veya aktif olmayan kod

    await supabase.from('affiliate_referrals').insert({
        affiliate_id: aff.id,
        landing_page: window.location.pathname,
        user_agent: navigator.userAgent,
        visitor_ip_hash: null, // Client tarafında IP hash almıyoruz
    });
};

/** Müşteriyi ortağa ata (ilk satın alma sırasında çağrılır) */
export const attributeCustomerToAffiliate = async (
    referralCode: string,
    customerId: string
): Promise<string | null> => {
    // Ortağı bul
    const { data: aff } = await supabase
        .from('affiliates')
        .select('id, status, contract_expires_at')
        .eq('referral_code', referralCode)
        .single();

    if (!aff || aff.status !== 'active') return null;

    // Sözleşme süresi dolmuş mu
    if (aff.contract_expires_at && new Date(aff.contract_expires_at) < new Date()) return null;

    // Müşteri zaten bir ortağa atanmış mı
    const { data: existing } = await supabase
        .from('affiliate_customers')
        .select('id')
        .eq('customer_id', customerId)
        .single();

    if (existing) return null; // Zaten atanmış

    // Ata
    const { error } = await supabase.from('affiliate_customers').insert({
        affiliate_id: aff.id,
        customer_id: customerId,
        status: 'referred',
    });

    if (error) return null;
    return aff.id; // Atama başarılı, affiliate_id döndür
};

/** Referral code'u doğrula */
export const validateReferralCode = async (code: string): Promise<boolean> => {
    const { data } = await supabase
        .from('affiliates')
        .select('id')
        .eq('referral_code', code)
        .eq('status', 'active')
        .single();

    return !!data;
};

/** Referral link URL'i oluştur */
export const getReferralLink = (referralCode: string): string => {
    const baseUrl = window.location.origin;
    return `${baseUrl}?ref=${referralCode}`;
};
