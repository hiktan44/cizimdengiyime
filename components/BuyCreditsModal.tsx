import React, { useState, useEffect } from 'react';
import { supabase, CREDIT_PACKAGES } from '../lib/supabase';
import { createPaymentToken, getTestCardInfo, TEST_CARDS } from '../lib/paytrService';
import { createTransaction, addCreditsToUser, updateTransactionStatus } from '../lib/database';
import { getSiteSettings } from '../lib/adminService';

interface BuyCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userEmail: string;
  userName: string;
  onSuccess: () => void;
}

export const BuyCreditsModal: React.FC<BuyCreditsModalProps> = ({
  isOpen,
  onClose,
  userId,
  userEmail,
  userName,
  onSuccess,
}) => {
  const [selectedPackage, setSelectedPackage] = useState<'SMALL' | 'MEDIUM' | 'LARGE'>('MEDIUM');
  const [loading, setLoading] = useState(false);
  const [showTestCards, setShowTestCards] = useState(false);
  const [paymentIframe, setPaymentIframe] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [packages, setPackages] = useState({
    SMALL: CREDIT_PACKAGES.SMALL,
    MEDIUM: CREDIT_PACKAGES.MEDIUM,
    LARGE: CREDIT_PACKAGES.LARGE,
  });

  const isTestMode = import.meta.env.VITE_PAYTR_TEST_MODE === '1';

  // Fetch credit packages from site settings
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const settings = await getSiteSettings();
        if (settings) {
          setPackages({
            SMALL: {
              credits: settings.credit_package_small_credits || CREDIT_PACKAGES.SMALL.credits,
              price: settings.credit_package_small_price || CREDIT_PACKAGES.SMALL.price,
            },
            MEDIUM: {
              credits: settings.credit_package_medium_credits || CREDIT_PACKAGES.MEDIUM.credits,
              price: settings.credit_package_medium_price || CREDIT_PACKAGES.MEDIUM.price,
            },
            LARGE: {
              credits: settings.credit_package_large_credits || CREDIT_PACKAGES.LARGE.credits,
              price: settings.credit_package_large_price || CREDIT_PACKAGES.LARGE.price,
            },
          });
        }
      } catch (error) {
        console.error('Error fetching credit packages:', error);
      }
    };

    if (isOpen) {
      fetchPackages();
    }
  }, [isOpen]);

  useEffect(() => {
    const fetchUserPhone = async () => {
      if (!isOpen || !userId) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('phone_number')
          .eq('id', userId)
          .single();

        if (data?.phone_number) {
          setPhoneNumber(data.phone_number);
        }
      } catch (error) {
        console.error('Error fetching phone:', error);
      }
    };

    if (isOpen) {
      fetchUserPhone();
    }
  }, [isOpen, userId]);

  useEffect(() => {
    if (!isOpen) {
      setPaymentIframe(null);
      setShowTestCards(false);
      setPhoneError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBuyCredits = async () => {
    // Validate phone
    if (!phoneNumber.trim()) {
      setPhoneError('Lütfen telefon numaranızı giriniz.');
      return;
    }
    if (phoneNumber.length < 10) {
      setPhoneError('Geçerli bir telefon numarası giriniz.');
      return;
    }

    setLoading(true);
    setPhoneError('');

    try {
      // Save phone number first
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ phone_number: phoneNumber })
        .eq('id', userId);

      if (updateError) {
        console.error('Phone update error:', updateError);
        // Continue anyway or block? Let's assume we block to ensure data is collected
        throw new Error('Telefon numarası kaydedilemedi. Lütfen tekrar deneyin.');
      }

      const pkg = packages[selectedPackage];
      // PayTR merchant_oid alfanumerik olmalı (tire veya özel karakter yok)
      const orderId = `ORDER${Date.now()}${userId.replace(/[^a-zA-Z0-9]/g, '').substring(0, 8)}`;

      // Create transaction in DB
      const transactionResult = await createTransaction(
        userId,
        'credit_purchase',
        pkg.price,
        pkg.credits,
        orderId,
        'paytr'
      );

      if (!transactionResult.success) {
        throw new Error(transactionResult.error || 'İşlem oluşturulamadı');
      }

      // Create PayTR payment token
      const paymentResult = await createPaymentToken({
        userId,
        userEmail,
        userName,
        amount: pkg.price,
        credits: pkg.credits,
        orderId,
        successUrl: `${window.location.origin}/payment-success`,
        failUrl: `${window.location.origin}/payment-fail`,
      });

      if (!paymentResult.success || !paymentResult.iframeUrl) {
        throw new Error(paymentResult.error || 'Ödeme başlatılamadı');
      }

      setPaymentIframe(paymentResult.iframeUrl);

      // PayTR kendi success/fail URL'lerine yönlendirecek
      // Backend callback çalıştığında krediler otomatik eklenecek
      // Kullanıcı modal'ı kapatıp dashboard'a gidebilir
    } catch (error: any) {
      console.error('Payment error:', error);
      alert(error.message || 'Ödeme işlemi başarısız oldu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-2xl border border-slate-700 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-slate-900 border-b border-slate-700 p-6 flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-bold text-white">💳 Kredi Satın Al</h2>
            {isTestMode && (
              <p className="text-amber-400 text-sm mt-1 flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Test modunda çalışıyorsunuz. Gerçek ödeme alınmayacaktır.
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {!paymentIframe ? (
            <>
              {/* Test Cards Info - Sadece test modunda göster */}
              {isTestMode && (
                <div className="mb-6 bg-yellow-500/10 border border-yellow-500/50 rounded-xl p-4">
                  <button
                    onClick={() => setShowTestCards(!showTestCards)}
                    className="w-full flex items-center justify-between text-left"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-yellow-400">⚠️</span>
                      <span className="text-yellow-400 font-semibold">Test Kartları Bilgisi</span>
                    </div>
                    <svg
                      className={`w-5 h-5 text-yellow-400 transition-transform ${showTestCards ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {showTestCards && (
                    <div className="mt-4 space-y-3 text-sm">
                      <div className="bg-slate-900/50 rounded-lg p-3">
                        <div className="text-green-400 font-semibold mb-2">✅ Başarılı İşlem</div>
                        <div className="text-slate-300 space-y-1">
                          <div>Kart No: {TEST_CARDS.SUCCESS.cardNumber}</div>
                          <div>Son Kullanma: {TEST_CARDS.SUCCESS.expiry}</div>
                          <div>CVV: {TEST_CARDS.SUCCESS.cvv}</div>
                        </div>
                      </div>
                      <div className="bg-slate-900/50 rounded-lg p-3">
                        <div className="text-red-400 font-semibold mb-2">❌ Yetersiz Bakiye</div>
                        <div className="text-slate-300 space-y-1">
                          <div>Kart No: {TEST_CARDS.FAIL_INSUFFICIENT_FUNDS.cardNumber}</div>
                          <div>Son Kullanma: {TEST_CARDS.FAIL_INSUFFICIENT_FUNDS.expiry}</div>
                          <div>CVV: {TEST_CARDS.FAIL_INSUFFICIENT_FUNDS.cvv}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Phone Number Input */}
              <div className="mb-6 bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                <label className="block text-slate-300 text-sm font-bold mb-2">
                  Telefon Numarası <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-slate-500">📞</span>
                  </div>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => {
                      const val = e.target.value;
                      // Allow numbers, spaces, plus, dash, parentheses
                      if (/^[\d\s+\-()]*$/.test(val)) {
                        setPhoneNumber(val);
                        setPhoneError('');
                      }
                    }}
                    placeholder="05XX XXX XX XX"
                    className={`w-full bg-slate-900 border ${phoneError ? 'border-red-500' : 'border-slate-600'} rounded-lg py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition`}
                  />
                </div>
                {phoneError && (
                  <p className="text-red-500 text-xs mt-1">{phoneError}</p>
                )}
                <p className="text-xs text-slate-500 mt-2">
                  Satın alma işleminizle ilgili bilgilendirmeler için gereklidir.
                </p>
              </div>

              {/* Package Selection */}
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                {(Object.keys(packages) as Array<keyof typeof packages>).map((key) => {
                  const pkg = packages[key];
                  const isSelected = selectedPackage === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedPackage(key)}
                      className={`border-2 rounded-xl p-6 text-center transition-all ${isSelected
                        ? 'border-cyan-500 bg-cyan-500/10'
                        : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                        }`}
                    >
                      <div className="text-3xl font-bold text-white mb-2">{pkg.credits}</div>
                      <div className="text-sm text-slate-400 mb-4">Kredi</div>
                      <div className="text-2xl font-bold text-cyan-400 mb-2">{pkg.price}₺</div>
                      <div className="text-xs text-slate-500">1 Kredi = {(pkg.price / pkg.credits).toFixed(2)}₺</div>
                      {key === 'MEDIUM' && (
                        <div className="mt-3 bg-cyan-500 text-white text-xs font-semibold px-3 py-1 rounded-full inline-block">
                          Popüler
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Buy Button */}
              <button
                onClick={handleBuyCredits}
                disabled={loading}
                className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:from-slate-600 disabled:to-slate-600 text-white px-8 py-4 rounded-xl font-bold text-lg transition shadow-lg"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    İşlem Yapılıyor...
                  </span>
                ) : (
                  `${packages[selectedPackage].price}₺ Öde ve ${packages[selectedPackage].credits} Kredi Al`
                )}
              </button>

              <p className="text-xs text-slate-500 text-center mt-4">
                Ödeme için güvenli PayTR kullanılmaktadır.
                {isTestMode && ' Test modundasınız.'}
              </p>
            </>
          ) : (
            /* Payment Iframe */
            <div className="space-y-4">
              <div className="bg-cyan-500/10 border border-cyan-500/50 rounded-xl p-4">
                <p className="text-cyan-400 text-sm">
                  ⏳ Ödeme sayfası yükleniyor...
                  {isTestMode && ' Test kartı ile ödeme yapabilirsiniz.'}
                </p>
              </div>
              <iframe
                src={paymentIframe}
                className="w-full h-[600px] border-0 rounded-xl"
                title="Payment"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

