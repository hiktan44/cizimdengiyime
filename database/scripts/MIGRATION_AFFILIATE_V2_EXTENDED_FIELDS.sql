-- ==========================================
-- FASHEONE AFFILIATE V2 - GENİŞLETİLMİŞ ALANLAR
-- Migration Script
-- ==========================================

-- Kişisel bilgiler
ALTER TABLE affiliates ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE affiliates ADD COLUMN IF NOT EXISTS email TEXT;

-- Banka bilgileri (detaylı)
ALTER TABLE affiliates ADD COLUMN IF NOT EXISTS bank_account_holder TEXT;
ALTER TABLE affiliates ADD COLUMN IF NOT EXISTS bank_name TEXT;
ALTER TABLE affiliates ADD COLUMN IF NOT EXISTS swift_code TEXT;

-- Firma bilgileri (opsiyonel)
ALTER TABLE affiliates ADD COLUMN IF NOT EXISTS tax_office TEXT;           -- Vergi Dairesi
ALTER TABLE affiliates ADD COLUMN IF NOT EXISTS company_address TEXT;      -- Şirket Adresi
ALTER TABLE affiliates ADD COLUMN IF NOT EXISTS company_type TEXT;         -- Şirket Türü (şahıs/limited/anonim)

-- company_type kontrolü
ALTER TABLE affiliates DROP CONSTRAINT IF EXISTS chk_company_type;
ALTER TABLE affiliates ADD CONSTRAINT chk_company_type
  CHECK (company_type IS NULL OR company_type IN ('individual', 'sole_proprietorship', 'limited', 'corporation'));

-- İndeks
CREATE INDEX IF NOT EXISTS idx_affiliates_email ON affiliates(email);
