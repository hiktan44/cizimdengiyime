// PayTR Test Entegrasyonu
// Test merchant bilgileri kullanılacak

import CryptoJS from 'crypto-js';

// PayTR Configuration - .env dosyasından alınır
const PAYTR_CONFIG = {
  merchant_id: import.meta.env.VITE_PAYTR_MERCHANT_ID || '9999999',
  merchant_key: import.meta.env.VITE_PAYTR_MERCHANT_KEY || 'test_key',
  merchant_salt: import.meta.env.VITE_PAYTR_MERCHANT_SALT || 'test_salt',
  // test_mode: '1' = Test, '0' = Live (Production)
  test_mode: import.meta.env.VITE_PAYTR_TEST_MODE || '1',
};

export interface PaymentRequest {
  userId: string;
  userEmail: string;
  userName: string;
  amount: number; // TL cinsinden
  credits: number;
  orderId: string;
  successUrl: string;
  failUrl: string;
}

export interface PaymentResponse {
  success: boolean;
  token?: string;
  iframeUrl?: string;
  error?: string;
}

/**
 * PayTR ödeme iframe token oluştur
 * NOT: Bu fonksiyon backend'de çalıştırılmalı (güvenlik için)
 * Şu an test amaçlı frontend'de yapıyoruz
 */
export const createPaymentToken = async (
  request: PaymentRequest
): Promise<PaymentResponse> => {
  try {
    // PayTR için gerekli parametreler
    const merchant_id = PAYTR_CONFIG.merchant_id;
    const merchant_key = PAYTR_CONFIG.merchant_key;
    const merchant_salt = PAYTR_CONFIG.merchant_salt;

    const user_ip = '127.0.0.1'; // Test için
    const merchant_oid = request.orderId;
    const email = request.userEmail;
    const payment_amount = Math.round(request.amount * 100); // TL to kuruş
    const user_basket = JSON.stringify([
      [request.credits + ' Kredi', request.amount.toFixed(2), 1],
    ]);
    const no_installment = '0'; // Taksit yok
    const max_installment = '0';
    const currency = 'TL';
    const test_mode = PAYTR_CONFIG.test_mode;

    const user_name = request.userName || 'Test User';
    const user_address = 'Test Address';
    const user_phone = '5555555555';

    // PayTR hash oluşturma
    const hash_str =
      merchant_id +
      user_ip +
      merchant_oid +
      email +
      payment_amount +
      user_basket +
      no_installment +
      max_installment +
      currency +
      test_mode +
      merchant_salt;

    const paytr_token = CryptoJS.HmacSHA256(hash_str, merchant_key).toString(
      CryptoJS.enc.Base64
    );

    // PayTR API'ye istek gönder
    const formData = new URLSearchParams();
    formData.append('merchant_id', merchant_id);
    formData.append('user_ip', user_ip);
    formData.append('merchant_oid', merchant_oid);
    formData.append('email', email);
    formData.append('payment_amount', payment_amount.toString());
    formData.append('paytr_token', paytr_token);
    formData.append('user_basket', user_basket);
    formData.append('debug_on', '1');
    formData.append('no_installment', no_installment);
    formData.append('max_installment', max_installment);
    formData.append('user_name', user_name);
    formData.append('user_address', user_address);
    formData.append('user_phone', user_phone);
    formData.append('merchant_ok_url', request.successUrl);
    formData.append('merchant_fail_url', request.failUrl);
    formData.append('timeout_limit', '30');
    formData.append('currency', currency);
    formData.append('test_mode', test_mode);

    // NOT: Production'da bu çağrı backend'den yapılmalı
    const response = await fetch('https://www.paytr.com/odeme/api/get-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    const result = await response.json();

    if (result.status === 'success') {
      return {
        success: true,
        token: result.token,
        iframeUrl: `https://www.paytr.com/odeme/guvenli/${result.token}`,
      };
    } else {
      return {
        success: false,
        error: result.reason || 'Ödeme başlatılamadı',
      };
    }
  } catch (error: any) {
    console.error('PayTR payment error:', error);
    return {
      success: false,
      error: error.message || 'Ödeme işlemi başlatılamadı',
    };
  }
};

/**
 * PayTR callback hash doğrulama
 */
export const verifyPaymentCallback = (
  merchant_oid: string,
  status: string,
  total_amount: string,
  hash: string
): boolean => {
  try {
    const merchant_key = PAYTR_CONFIG.merchant_key;
    const merchant_salt = PAYTR_CONFIG.merchant_salt;

    const hash_str = merchant_oid + merchant_salt + status + total_amount;
    const expected_hash = CryptoJS.HmacSHA256(hash_str, merchant_key).toString(
      CryptoJS.enc.Base64
    );

    return hash === expected_hash;
  } catch (error) {
    console.error('Hash verification error:', error);
    return false;
  }
};

/**
 * Test kartları bilgileri
 */
export const TEST_CARDS = {
  SUCCESS: {
    cardNumber: '4355084355084358',
    expiry: '12/26',
    cvv: '000',
    description: 'Başarılı test kartı',
  },
  FAIL_INSUFFICIENT_FUNDS: {
    cardNumber: '4355084355084333',
    expiry: '12/26',
    cvv: '000',
    description: 'Yetersiz bakiye',
  },
  FAIL_INVALID_CARD: {
    cardNumber: '5400619360964581',
    expiry: '12/26',
    cvv: '000',
    description: 'Geçersiz kart',
  },
  MASTERCARD_SUCCESS: {
    cardNumber: '5400619360964581',
    expiry: '12/26',
    cvv: '000',
    description: 'Mastercard başarılı',
  },
};

export const getTestCardInfo = (): string => {
  return `
📋 PayTR Test Kartları:

✅ BAŞARILI İŞLEM:
Kart No: ${TEST_CARDS.SUCCESS.cardNumber}
Son Kullanma: ${TEST_CARDS.SUCCESS.expiry}
CVV: ${TEST_CARDS.SUCCESS.cvv}

❌ YETERSİZ BAKİYE:
Kart No: ${TEST_CARDS.FAIL_INSUFFICIENT_FUNDS.cardNumber}
Son Kullanma: ${TEST_CARDS.FAIL_INSUFFICIENT_FUNDS.expiry}
CVV: ${TEST_CARDS.FAIL_INSUFFICIENT_FUNDS.cvv}

💳 MASTERCARD:
Kart No: ${TEST_CARDS.MASTERCARD_SUCCESS.cardNumber}
Son Kullanma: ${TEST_CARDS.MASTERCARD_SUCCESS.expiry}
CVV: ${TEST_CARDS.MASTERCARD_SUCCESS.cvv}

⚠️ Test modunda çalışıyorsunuz. Gerçek ödeme alınmayacaktır.
  `.trim();
};

