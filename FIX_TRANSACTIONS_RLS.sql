-- =====================================================
-- FIX TRANSACTIONS RLS POLICIES
-- =====================================================
-- Kullanıcılar kendi transaction'larını oluşturabilsin

-- Önce mevcut policy'leri kontrol edelim
-- SELECT * FROM pg_policies WHERE tablename = 'transactions';

-- Users can insert their own transactions
CREATE POLICY "Users can insert own transactions" ON transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own transactions (PayTR callback için gerekli olabilir)
CREATE POLICY "Users can update own transactions" ON transactions
  FOR UPDATE USING (auth.uid() = user_id);

-- Admins can view all transactions
CREATE POLICY "Admins can view all transactions" ON transactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

-- Admins can update all transactions
CREATE POLICY "Admins can update all transactions" ON transactions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

-- payment_method column ekleyelim (eğer yoksa)
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'card';

-- Test için bir transaction oluşturabilirsiniz:
-- INSERT INTO transactions (user_id, type, amount, credits, status, payment_method)
-- VALUES (auth.uid(), 'credit_purchase', 250.00, 50, 'completed', 'paytr_test');

