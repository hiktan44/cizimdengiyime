/**
 * Fasheone Affiliate (Ortaklık) Programı Tip Tanımları
 */

export type AffiliateStatus = 'pending' | 'active' | 'suspended' | 'terminated';
export type CustomerStatus = 'referred' | 'converted' | 'expired';
export type CommissionStatus = 'pending' | 'approved' | 'paid' | 'cancelled';
export type PayoutStatus = 'processing' | 'completed' | 'failed';
export type CompanyType = 'individual' | 'sole_proprietorship' | 'limited' | 'corporation';

export interface Affiliate {
    id: string;
    user_id: string;
    referral_code: string;
    status: AffiliateStatus;

    // Kişisel bilgiler (zorunlu)
    full_name: string | null;
    email: string | null;
    phone: string | null;

    // Banka bilgileri (zorunlu)
    iban: string | null;
    bank_account_holder: string | null;
    bank_name: string | null;
    swift_code: string | null;

    // Firma bilgileri (opsiyonel)
    company_name: string | null;
    company_type: CompanyType | null;
    tax_number: string | null;
    tax_office: string | null;
    company_address: string | null;

    // Sözleşme
    contract_accepted_at: string | null;
    contract_expires_at: string | null;
    commission_rate: number;

    // Kazanç özeti
    total_earnings: number;
    total_paid: number;
    pending_balance: number;

    // Meta
    notes: string | null;
    created_at: string;
    updated_at: string;
}

export interface AffiliateReferral {
    id: string;
    affiliate_id: string;
    visitor_ip_hash: string | null;
    user_agent: string | null;
    landing_page: string | null;
    clicked_at: string;
}

export interface AffiliateCustomer {
    id: string;
    affiliate_id: string;
    customer_id: string;
    attributed_at: string;
    first_purchase_at: string | null;
    first_purchase_amount: number | null;
    status: CustomerStatus;
    customer_name?: string;
    customer_email?: string;
}

export interface AffiliateCommission {
    id: string;
    affiliate_id: string;
    customer_id: string | null;
    transaction_id: string | null;
    order_amount: number;
    commission_rate: number;
    commission_amount: number;
    status: CommissionStatus;
    created_at: string;
    customer_name?: string;
}

export interface AffiliatePayout {
    id: string;
    affiliate_id: string;
    amount: number;
    payment_method: string;
    payment_reference: string | null;
    status: PayoutStatus;
    period_start: string | null;
    period_end: string | null;
    paid_at: string | null;
    notes: string | null;
    created_at: string;
}

export interface AffiliateStats {
    totalEarnings: number;
    totalPaid: number;
    pendingBalance: number;
    totalCustomers: number;
    convertedCustomers: number;
    totalClicks: number;
    conversionRate: number;
    thisMonthEarnings: number;
}

export interface AffiliateApplication {
    // Zorunlu alanlar
    fullName: string;
    email: string;
    phone: string;

    // Banka bilgileri (zorunlu)
    iban: string;
    bankAccountHolder: string;
    bankName: string;
    swiftCode?: string;

    // Firma bilgileri (opsiyonel)
    companyName?: string;
    companyType?: CompanyType;
    taxNumber?: string;
    taxOffice?: string;
    companyAddress?: string;
}

// Admin tarafı genişletilmiş ortak bilgisi
export interface AffiliateWithProfile extends Affiliate {
    user_email: string;
    user_name: string | null;
    customer_count: number;
}
