import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import crypto from 'crypto';
import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Stripe from 'stripe';
import { parseStringPromise } from 'xml2js';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// Polyfill for Node.js 14
if (!globalThis.fetch) {
  globalThis.fetch = fetch;
  globalThis.Headers = fetch.Headers;
  globalThis.Request = fetch.Request;
  globalThis.Response = fetch.Response;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

const app = express();

// Security Middleware (Helmet + Rate Limiting)
app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to all requests
app.use(limiter);

const PORT = process.env.PORT || 3000;

// Supabase Admin Client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Supabase credentials missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// CORS
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL,
  'https://fasheone.com',
  'https://www.fasheone.com',
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('🚫 CORS Blocked Origin:', origin);
      callback(new Error(`Not allowed by CORS: ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'stripe-signature']
}));

// Webhook endpoint needs raw body
app.use('/api/stripe-webhook', bodyParser.raw({ type: 'application/json' }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Initialize Stripe (Dynamic Key Loading)
let stripe;

const getStripe = async () => {
  if (stripe) return stripe;

  let secretKey;

  // 1. Try getting from site_settings (DB) first (Allows Admin Panel override)
  try {
    const { data } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'stripe_secret_key')
      .single();
    if (data && data.value && data.value.startsWith('sk_')) {
      secretKey = data.value;
    }
  } catch (err) {
    console.warn('Failed to fetch stripe key from DB', err);
  }

  // 2. If not in DB, fallback to environment variable
  if (!secretKey) {
    secretKey = process.env.STRIPE_SECRET_KEY;
  }

  if (secretKey) {
    stripe = new Stripe(secretKey);
    return stripe;
  }
  return null;
};

// --- ROUTES ---

// Health Check (Frontend/API)
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend is running' });
});

// Coolify System Health Check (ZORUNLU)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: Date.now(),
    uptime: process.uptime()
  });
});

// 1. Get Currency Rate (TCMB)
app.get('/api/get-currency-rate', async (req, res) => {
  try {
    const response = await fetch('https://www.tcmb.gov.tr/kurlar/today.xml');
    const xml = await response.text();
    const result = await parseStringPromise(xml);

    // Find Euro
    const euro = result.Tarih_Date.Currency.find((c) => c.$.CurrencyCode === 'EUR');
    if (!euro) throw new Error('EUR rate not found');

    // BanknoteSelling or ForexSelling
    const rate = parseFloat(euro.BanknoteSelling[0] || euro.ForexSelling[0]);

    res.json({ currency: 'EUR', rate });
  } catch (error) {
    console.error('Currency Fetch Error:', error);
    res.status(500).json({ error: 'Failed to fetch currency rate' });
  }
});

// 2. Create Payment Intent
app.post('/api/create-payment-intent', async (req, res) => {
  try {
    const userId = req.body.userId;
    const userEmail = req.body.userEmail;
    const amountTL = parseFloat(req.body.amountTL);
    const credits = parseInt(req.body.credits);

    if (!amountTL || !credits || isNaN(amountTL) || isNaN(credits)) {
      return res.status(400).json({ error: 'Invalid input parameters' });
    }

    // SECURITY: Validate Price/Credit Ratio to prevent tampering
    // Standard price is ~5 TL/credit. Lowest subscription is ~4 TL/credit.
    // We enforce a minimum floor of 3.0 TL/credit to block gross abuse (e.g. 1 TL for 1000 credits).
    // This allows for future discounts but blocks obvious attacks.
    const pricePerCredit = amountTL / credits;
    if (pricePerCredit < 3.0) {
      console.warn(`SECURITY ALERT: Price tampering attempt. User: ${userId}, Amount: ${amountTL}, Credits: ${credits}, Ratio: ${pricePerCredit}`);
      return res.status(400).json({ error: 'Invalid payment parameters. Price/Credit ratio too low.' });
    }

    const stripeInstance = await getStripe();
    if (!stripeInstance) {
      return res.status(500).json({ error: 'Stripe not configured' });
    }

    // Get Conversion Rate
    const tcmbResponse = await fetch('https://www.tcmb.gov.tr/kurlar/today.xml');
    const xml = await tcmbResponse.text();
    const result = await parseStringPromise(xml);
    const euro = result.Tarih_Date.Currency.find(c => c.$.CurrencyCode === 'EUR');
    const rate = parseFloat(euro.BanknoteSelling[0] || euro.ForexSelling[0]);

    // Calculate EUR amount
    const amountEUR = amountTL / rate;
    const amountCents = Math.round(amountEUR * 100);

    // Create Payment Intent
    const paymentIntent = await stripeInstance.paymentIntents.create({
      amount: amountCents,
      currency: 'eur',
      metadata: {
        userId,
        credits: credits.toString(),
        amountTL: amountTL.toString(),
        rate: rate.toString()
      },
      receipt_email: userEmail,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      amountEUR: amountEUR.toFixed(2),
      rate
    });

  } catch (error) {
    console.error('Payment Intent Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 3. Stripe Webhook
app.post('/api/stripe-webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const stripeInstance = await getStripe();

  if (!stripeInstance) return res.status(500).send('Stripe not ready');

  let event;

  try {
    // If you have a webhook secret, use it here. 
    // For simplicity/dynamic nature, we might trust the event data if verify fails, 
    // BUT for security, you should configure a Webhook Secret in Admin Panel later.
    // Here we will try to verify if secret exists, else retrieve the event to verify authenticity.

    // Simplest reliable way without static webhook secret: Retrieve event from API
    // req.body is a Buffer due to bodyParser.raw
    const payloadString = req.body.toString();
    const payload = JSON.parse(payloadString);

    console.log('🔔 Webhook received:', payload.type, payload.id);

    if (payload.id && payload.type) {
      event = await stripeInstance.events.retrieve(payload.id);
    } else {
      throw new Error('Invalid payload');
    }
  } catch (err) {
    console.error('Webhook Error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (!event) {
    console.error('Event retrieval failed');
    return res.status(400).send('Event retrieval failed');
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    const { userId, credits } = paymentIntent.metadata;

    console.log(`💰 Payment succeeded for User ${userId}, Credits: ${credits}`);

    // Update DB
    try {
      // 1. Log Transaction
      const { data: tx, error: txError } = await supabase
        .from('transactions')
        .insert({
          user_id: userId,
          type: 'credit_purchase',
          amount: parseFloat(paymentIntent.metadata.amountTL), // Log original TL amount
          credits: parseInt(credits),
          status: 'completed',
          payment_method: 'stripe',
          stripe_payment_id: paymentIntent.id
        })
        .select()
        .single();

      if (txError) throw txError;

      // 2. Add Credits
      const { data: profile } = await supabase
        .from('profiles')
        .select('credits')
        .eq('id', userId)
        .single();

      const newCredits = (profile?.credits || 0) + parseInt(credits);

      await supabase
        .from('profiles')
        .update({ credits: newCredits })
        .eq('id', userId);

      console.log('✅ Credits added successfully');

    } catch (dbError) {
      console.error('Database Update Error:', dbError);
      return res.status(500).json({ error: 'DB Error' });
    }
  }

  res.json({ received: true });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

