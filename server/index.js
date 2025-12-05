import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import crypto from 'crypto';
import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Polyfill for Node.js 14 (Headers global yoksa ekle)
if (!globalThis.fetch) {
  globalThis.fetch = fetch;
  globalThis.Headers = fetch.Headers;
  globalThis.Request = fetch.Request;
  globalThis.Response = fetch.Response;
}

// Get current directory (ES modules için gerekli)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '.env') });

// Environment variables kontrolü
console.log('🔍 Environment Variables Check:');
console.log('VITE_SUPABASE_URL:', process.env.VITE_SUPABASE_URL ? '✅ Set' : '❌ Missing');
console.log('SUPABASE_SERVICE_KEY:', process.env.SUPABASE_SERVICE_KEY ? '✅ Set' : '❌ Missing');
console.log('PAYTR_MERCHANT_KEY:', process.env.PAYTR_MERCHANT_KEY || process.env.VITE_PAYTR_MERCHANT_KEY ? '✅ Set' : '❌ Missing');
console.log('PAYTR_MERCHANT_SALT:', process.env.PAYTR_MERCHANT_SALT || process.env.VITE_PAYTR_MERCHANT_SALT ? '✅ Set' : '❌ Missing');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
// CORS - Frontend URL'lerini ekle
const allowedOrigins = [
  'http://localhost:5173', // Local development
  'http://localhost:3000',
  process.env.FRONTEND_URL, // Coolify frontend URL (environment variable)
  // Production URL'leri buraya eklenecek (örnek aşağıda)
  // 'https://cizimdengiyime-frontend-xxx.coolify.app',
  // 'https://yourdomain.com',
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Supabase Admin Client (RLS bypass için)
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl) {
  console.error('❌ VITE_SUPABASE_URL is missing in .env file');
  process.exit(1);
}

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_KEY is missing in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// PayTR Configuration
const PAYTR_MERCHANT_KEY = process.env.PAYTR_MERCHANT_KEY || process.env.VITE_PAYTR_MERCHANT_KEY;
const PAYTR_MERCHANT_SALT = process.env.PAYTR_MERCHANT_SALT || process.env.VITE_PAYTR_MERCHANT_SALT;

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend is running' });
});

// PayTR Callback Endpoint
app.post('/api/paytr-callback', async (req, res) => {
  console.log('📥 PayTR Callback alındı');
  console.log('Body:', req.body);

  try {
    const {
      merchant_oid,
      status,
      total_amount,
      hash,
      failed_reason_code,
      failed_reason_msg,
      test_mode,
    } = req.body;

    // 1. Hash Doğrulama (GÜVENLİK - ÇOK ÖNEMLİ!)
    const hashStr = merchant_oid + PAYTR_MERCHANT_SALT + status + total_amount;
    const calculatedHash = crypto
      .createHmac('sha256', PAYTR_MERCHANT_KEY)
      .update(hashStr)
      .digest('base64');

    console.log('Hash kontrolü:');
    console.log('Gelen hash:', hash);
    console.log('Hesaplanan hash:', calculatedHash);

    if (hash !== calculatedHash) {
      console.error('❌ Hash doğrulama hatası!');
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
      console.log(`🧪 Test mode: ${test_mode}`);

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
  } catch (error) {
    console.error('💥 Callback error:', error);
    return res.status(500).send('SERVER_ERROR');
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
  console.log(`📍 Callback URL: http://localhost:${PORT}/api/paytr-callback`);
  console.log(`🔑 PayTR Merchant Key: ${PAYTR_MERCHANT_KEY ? '✅ Set' : '❌ Missing'}`);
  console.log(`🔑 PayTR Merchant Salt: ${PAYTR_MERCHANT_SALT ? '✅ Set' : '❌ Missing'}`);
  console.log(`🔑 Supabase URL: ${supabaseUrl ? '✅ Set' : '❌ Missing'}`);
  console.log(`🔑 Supabase Service Key: ${supabaseServiceKey ? '✅ Set' : '❌ Missing'}`);
});

