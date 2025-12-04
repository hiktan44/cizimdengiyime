// PayTR Callback Endpoint
// Vercel Serverless Function

import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';

// Supabase Admin Client (RLS bypass için)
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!; // Service role key gerekli
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const PAYTR_MERCHANT_KEY = process.env.PAYTR_MERCHANT_KEY || process.env.VITE_PAYTR_MERCHANT_KEY;
const PAYTR_MERCHANT_SALT = process.env.PAYTR_MERCHANT_SALT || process.env.VITE_PAYTR_MERCHANT_SALT;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('📥 PayTR Callback alındı:', req.body);

    const {
      merchant_oid,
      status,
      total_amount,
      hash,
      failed_reason_code,
      failed_reason_msg,
      test_mode,
    } = req.body;

    // 1. Hash Doğrulama (GÜVENLİK)
    const hashStr = merchant_oid + PAYTR_MERCHANT_SALT + status + total_amount;
    const calculatedHash = crypto
      .createHmac('sha256', PAYTR_MERCHANT_KEY!)
      .update(hashStr)
      .digest('base64');

    if (hash !== calculatedHash) {
      console.error('❌ Hash doğrulama hatası!');
      console.error('Gelen hash:', hash);
      console.error('Hesaplanan hash:', calculatedHash);
      return res.status(400).send('HASH_ERROR');
    }

    console.log('✅ Hash doğrulandı');

    // 2. Transaction'ı bul (merchant_oid'yi stripe_payment_id field'ına kaydettik)
    const { data: transaction, error: txError } = await supabase
      .from('transactions')
      .select('*')
      .eq('stripe_payment_id', merchant_oid)
      .single();

    if (txError || !transaction) {
      console.error('❌ Transaction bulunamadı:', merchant_oid, txError);
      return res.status(404).send('TRANSACTION_NOT_FOUND');
    }

    console.log('📦 Transaction bulundu:', transaction.id);

    // 3. Ödeme Durumuna Göre İşlem Yap
    if (status === 'success') {
      // ✅ BAŞARILI ÖDEME

      // Transaction'ı güncelle
      const { error: updateError } = await supabase
        .from('transactions')
        .update({ status: 'completed' })
        .eq('id', transaction.id);

      if (updateError) {
        console.error('❌ Transaction güncellenemedi:', updateError);
        return res.status(500).send('UPDATE_ERROR');
      }

      // Kullanıcıya kredi ekle
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('credits')
        .eq('id', transaction.user_id)
        .single();

      if (profileError) {
        console.error('❌ Profile bulunamadı:', profileError);
        return res.status(500).send('PROFILE_ERROR');
      }

      const newCredits = (profile?.credits || 0) + transaction.credits;

      const { error: creditError } = await supabase
        .from('profiles')
        .update({ credits: newCredits })
        .eq('id', transaction.user_id);

      if (creditError) {
        console.error('❌ Kredi eklenemedi:', creditError);
        return res.status(500).send('CREDIT_ERROR');
      }

      console.log(`✅ Ödeme başarılı: ${merchant_oid}`);
      console.log(`💰 ${transaction.credits} kredi eklendi (Toplam: ${newCredits})`);
      console.log(`👤 Kullanıcı: ${transaction.user_id}`);

      return res.status(200).send('OK');
    } else {
      // ❌ BAŞARISIZ ÖDEME

      const { error: updateError } = await supabase
        .from('transactions')
        .update({
          status: 'failed',
        })
        .eq('id', transaction.id);

      if (updateError) {
        console.error('❌ Transaction güncellenemedi:', updateError);
      }

      console.log(`❌ Ödeme başarısız: ${merchant_oid}`);
      console.log(`Sebep: ${failed_reason_msg} (Code: ${failed_reason_code})`);

      return res.status(200).send('OK');
    }
  } catch (error: any) {
    console.error('💥 Callback error:', error);
    return res.status(500).send('SERVER_ERROR');
  }
}

