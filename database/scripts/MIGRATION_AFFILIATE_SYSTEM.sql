-- ==========================================
-- FASHEONE AFFILIATE (ORTAKLIK) PROGRAMI
-- Migration Script v2 - Güncellenmiş
-- ==========================================

-- 0. uuid-ossp eklentisini aktifleştir (yoksa)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 0.1 update_updated_at_column fonksiyonu (yoksa oluştur)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 1. Profiles tablosuna is_affiliate alanı ekle
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_affiliate BOOLEAN DEFAULT false;

-- ==========================================
-- 2. AFFILIATES TABLE (Ortak Profilleri)
-- ==========================================
CREATE TABLE IF NOT EXISTS affiliates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  referral_code TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended', 'terminated')),
  
  -- Kişisel bilgiler
  full_name TEXT,
  email TEXT,
  phone TEXT,
  
  -- Banka/Ödeme bilgileri
  iban TEXT,
  bank_account_holder TEXT,
  bank_name TEXT,
  swift_code TEXT,
  
  -- Firma bilgileri (opsiyonel)
  company_name TEXT,
  company_type TEXT,
  tax_number TEXT,
  tax_office TEXT,
  company_address TEXT,
  
  -- Sözleşme
  contract_accepted_at TIMESTAMP WITH TIME ZONE,
  contract_expires_at TIMESTAMP WITH TIME ZONE,
  
  -- Komisyon (Kademeli: 0-1000 kredi %15, 1000-10000 %20, 10000+ %25)
  commission_rate NUMERIC(5,4) DEFAULT 0.15,
  
  -- Kazanç özeti
  total_earnings NUMERIC(12,2) DEFAULT 0,
  total_paid NUMERIC(12,2) DEFAULT 0,
  pending_balance NUMERIC(12,2) DEFAULT 0,
  
  -- Meta
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- İndeksler
CREATE INDEX IF NOT EXISTS idx_affiliates_user_id ON affiliates(user_id);
CREATE INDEX IF NOT EXISTS idx_affiliates_referral_code ON affiliates(referral_code);
CREATE INDEX IF NOT EXISTS idx_affiliates_status ON affiliates(status);

-- RLS
ALTER TABLE affiliates ENABLE ROW LEVEL SECURITY;

-- Önce mevcut policy'leri temizle (IF EXISTS yoksa DO bloku kullan)
DO $$ BEGIN
  DROP POLICY IF EXISTS "Affiliates can view own profile" ON affiliates;
  DROP POLICY IF EXISTS "Affiliates can update own profile" ON affiliates;
  DROP POLICY IF EXISTS "Users can apply as affiliate" ON affiliates;
  DROP POLICY IF EXISTS "Admins can manage affiliates" ON affiliates;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "Affiliates can view own profile" ON affiliates
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Affiliates can update own profile" ON affiliates
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can apply as affiliate" ON affiliates
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage affiliates" ON affiliates
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- ==========================================
-- 3. AFFILIATE REFERRALS (Tıklama Takibi)
-- ==========================================
CREATE TABLE IF NOT EXISTS affiliate_referrals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  affiliate_id UUID REFERENCES affiliates(id) ON DELETE CASCADE NOT NULL,
  visitor_ip_hash TEXT,
  user_agent TEXT,
  landing_page TEXT,
  clicked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_referrals_affiliate_id ON affiliate_referrals(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_referrals_clicked_at ON affiliate_referrals(clicked_at);

ALTER TABLE affiliate_referrals ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Affiliates can view own referrals" ON affiliate_referrals;
  DROP POLICY IF EXISTS "Anyone can insert referral click" ON affiliate_referrals;
  DROP POLICY IF EXISTS "Admins can manage referrals" ON affiliate_referrals;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "Affiliates can view own referrals" ON affiliate_referrals
  FOR SELECT USING (
    affiliate_id IN (SELECT id FROM affiliates WHERE user_id = auth.uid())
  );

CREATE POLICY "Anyone can insert referral click" ON affiliate_referrals
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage referrals" ON affiliate_referrals
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- ==========================================
-- 4. AFFILIATE CUSTOMERS (Atanan Müşteriler)
-- ==========================================
CREATE TABLE IF NOT EXISTS affiliate_customers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  affiliate_id UUID REFERENCES affiliates(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  attributed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  first_purchase_at TIMESTAMP WITH TIME ZONE,
  first_purchase_amount NUMERIC(10,2),
  status TEXT DEFAULT 'referred' CHECK (status IN ('referred', 'converted', 'expired')),
  
  UNIQUE (affiliate_id, customer_id)
);

CREATE INDEX IF NOT EXISTS idx_aff_customers_affiliate ON affiliate_customers(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_aff_customers_customer ON affiliate_customers(customer_id);
CREATE INDEX IF NOT EXISTS idx_aff_customers_status ON affiliate_customers(status);

ALTER TABLE affiliate_customers ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Affiliates can view own customers" ON affiliate_customers;
  DROP POLICY IF EXISTS "Admins can manage affiliate customers" ON affiliate_customers;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "Affiliates can view own customers" ON affiliate_customers
  FOR SELECT USING (
    affiliate_id IN (SELECT id FROM affiliates WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can manage affiliate customers" ON affiliate_customers
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- ==========================================
-- 5. AFFILIATE COMMISSIONS (Komisyonlar)
-- ==========================================
CREATE TABLE IF NOT EXISTS affiliate_commissions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  affiliate_id UUID REFERENCES affiliates(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  transaction_id TEXT, -- String referans (transactions tablosu opsiyonel)
  order_amount NUMERIC(10,2) NOT NULL,
  commission_rate NUMERIC(5,4) NOT NULL,
  commission_amount NUMERIC(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_commissions_affiliate ON affiliate_commissions(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_commissions_status ON affiliate_commissions(status);
CREATE INDEX IF NOT EXISTS idx_commissions_created ON affiliate_commissions(created_at);

ALTER TABLE affiliate_commissions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Affiliates can view own commissions" ON affiliate_commissions;
  DROP POLICY IF EXISTS "Admins can manage commissions" ON affiliate_commissions;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "Affiliates can view own commissions" ON affiliate_commissions
  FOR SELECT USING (
    affiliate_id IN (SELECT id FROM affiliates WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can manage commissions" ON affiliate_commissions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- ==========================================
-- 6. AFFILIATE PAYOUTS (Ödeme Geçmişi)
-- ==========================================
CREATE TABLE IF NOT EXISTS affiliate_payouts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  affiliate_id UUID REFERENCES affiliates(id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  payment_method TEXT DEFAULT 'bank_transfer',
  payment_reference TEXT,
  status TEXT DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),
  period_start TIMESTAMP WITH TIME ZONE,
  period_end TIMESTAMP WITH TIME ZONE,
  paid_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payouts_affiliate ON affiliate_payouts(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_payouts_status ON affiliate_payouts(status);

ALTER TABLE affiliate_payouts ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Affiliates can view own payouts" ON affiliate_payouts;
  DROP POLICY IF EXISTS "Admins can manage payouts" ON affiliate_payouts;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "Affiliates can view own payouts" ON affiliate_payouts
  FOR SELECT USING (
    affiliate_id IN (SELECT id FROM affiliates WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can manage payouts" ON affiliate_payouts
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- ==========================================
-- 7. UPDATED_AT TRIGGER
-- ==========================================
DROP TRIGGER IF EXISTS update_affiliates_updated_at ON affiliates;
CREATE TRIGGER update_affiliates_updated_at
  BEFORE UPDATE ON affiliates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- 8. BALANCE INCREMENT FUNCTION (RPC)
-- ==========================================
CREATE OR REPLACE FUNCTION increment_affiliate_balance(
  affiliate_uuid UUID,
  amount NUMERIC
)
RETURNS VOID AS $$
BEGIN
  UPDATE affiliates
  SET 
    pending_balance = pending_balance + amount,
    total_earnings = total_earnings + amount,
    updated_at = NOW()
  WHERE id = affiliate_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- ✅ Migration tamamlandı!
-- Tablolar: affiliates, affiliate_referrals, 
--           affiliate_customers, affiliate_commissions, 
--           affiliate_payouts
-- ==========================================
