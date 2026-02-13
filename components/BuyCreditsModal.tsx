import React, { useState, useEffect } from 'react';
import { supabase, CREDIT_PACKAGES } from '../lib/supabase';
import { getSiteSettings } from '../lib/adminService';
import { getStripe, createPaymentIntent } from '../lib/stripeService';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { trackEvent, ANALYTICS_EVENTS } from '../utils/analytics';

interface BuyCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userEmail: string;
  userName: string;
  onSuccess: () => void;
}

const CheckoutForm: React.FC<{
  amountEUR: string;
  rate: number;
  credits: number;
  onSuccess: () => void;
  onError: (msg: string) => void;
}> = ({ amountEUR, rate, credits, onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!stripe) return;

    const clientSecret = new URLSearchParams(window.location.search).get(
      "payment_intent_client_secret"
    );

    if (!clientSecret) return;

    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      switch (paymentIntent?.status) {
        case "succeeded":
          setMessage("Ödeme başarılı!");
          break;
        case "processing":
          setMessage("Ödeme işleniyor.");
          break;
        case "requires_payment_method":
          setMessage("Ödeme başarısız oldu, lütfen tekrar deneyin.");
          break;
        default:
          setMessage("Bir şeyler ters gitti.");
          break;
      }
    });
  }, [stripe]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setIsLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin, // We will handle success via webhook usually, or UI redirect
        receipt_email: undefined, // Passed in intent creation
      },
      redirect: "if_required", // Important to avoid redirect if not needed (e.g. card)
    });

    if (error) {
      if (error.type === "card_error" || error.type === "validation_error") {
        setMessage(error.message || "Bir hata oluştu");
        onError(error.message || "Ödeme hatası");
        trackEvent(ANALYTICS_EVENTS.PURCHASE_FAILURE, { error: error.message, type: error.type });
      } else {
        setMessage("Beklenmedik bir hata oluştu.");
        onError("Beklenmedik hata");
        trackEvent(ANALYTICS_EVENTS.PURCHASE_FAILURE, { error: "Beklenmedik hata" });
      }
    } else {
      // Success!
      setMessage("Ödeme Başarılı!");
      trackEvent(ANALYTICS_EVENTS.PURCHASE_SUCCESS, {
        amount: amountEUR,
        credits: credits,
        currency: 'EUR'
      });
      // Explicitly wait a moment for webhook to process (optional) or just show success
      // In a real app we might poll for status, but here we assume webhook works fast.
      setTimeout(() => {
        onSuccess();
      }, 1500);
    }

    setIsLoading(false);
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 mb-4">
        <p className="text-slate-300 text-sm mb-1">Ödenecek Tutar:</p>
        <div className="flex items-end gap-2">
          <span className="text-3xl font-bold text-white">€{amountEUR}</span>
          <span className="text-slate-400 text-sm mb-1">(Kur: {rate.toFixed(2)})</span>
        </div>
      </div>

      <PaymentElement id="payment-element" options={{ layout: "tabs" }} />

      {message && (
        <div className={`p-3 rounded text-sm ${message.includes('Başarılı') ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
          {message}
        </div>
      )}

      <button
        disabled={isLoading || !stripe || !elements}
        id="submit"
        className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:from-slate-600 disabled:to-slate-600 text-white px-8 py-4 rounded-xl font-bold text-lg transition shadow-lg flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            İşleniyor...
          </>
        ) : (
          "Ödemeyi Tamamla"
        )}
      </button>
    </form>
  );
};

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
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [stripePromise, setStripePromise] = useState<Promise<any> | null>(null);
  const [paymentDetails, setPaymentDetails] = useState<{ amountEUR: string; rate: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [packages, setPackages] = useState({
    SMALL: CREDIT_PACKAGES.SMALL,
    MEDIUM: CREDIT_PACKAGES.MEDIUM,
    LARGE: CREDIT_PACKAGES.LARGE,
  });

  // Fetch credit packages
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
      // Initialize Stripe
      getStripe().then(setStripePromise);
    } else {
      // Reset state on close
      setClientSecret(null);
      setPaymentDetails(null);
      setError(null);
    }
  }, [isOpen]);

  const handleInitiatePayment = async () => {
    setLoading(true);
    setError(null);
    try {
      const pkg = packages[selectedPackage];
      const response = await createPaymentIntent({
        amountTL: pkg.price,
        credits: pkg.credits,
        userId,
        userEmail,
      });

      setClientSecret(response.clientSecret);
      setPaymentDetails({
        amountEUR: response.amountEUR,
        rate: response.rate
      });

      trackEvent(ANALYTICS_EVENTS.BEGIN_CHECKOUT, {
        package: selectedPackage,
        price: pkg.price,
        credits: pkg.credits,
        userId
      });

    } catch (err: any) {
      console.error("Payment init error:", err);
      setError(err.message || "Ödeme başlatılamadı.");
      trackEvent(ANALYTICS_EVENTS.PURCHASE_FAILURE, { error: err.message || "Init failed", userId });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-2xl border border-slate-700 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-slate-900 border-b border-slate-700 p-6 flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-bold text-white">💳 Kredi Satın Al</h2>
            <p className="text-slate-400 text-sm mt-1">Stripe ile güvenli ödeme</p>
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

          {error && (
            <div className="mb-4 bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl">
              {error}
            </div>
          )}

          {!clientSecret ? (
            /* Step 1: Package Selection */
            <>
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
                    </button>
                  );
                })}
              </div>

              <button
                onClick={handleInitiatePayment}
                disabled={loading}
                className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:from-slate-600 disabled:to-slate-600 text-white px-8 py-4 rounded-xl font-bold text-lg transition shadow-lg"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Hazırlanıyor...
                  </span>
                ) : (
                  "Ödemeye Geç"
                )}
              </button>
            </>
          ) : (
            /* Step 2: Stripe Elements */
            stripePromise && clientSecret && paymentDetails ? (
              <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'night' } }}>
                <CheckoutForm
                  amountEUR={paymentDetails.amountEUR}
                  rate={paymentDetails.rate}
                  credits={packages[selectedPackage].credits}
                  onSuccess={() => {
                    onSuccess();
                    onClose();
                  }}
                  onError={(msg) => setError(msg)}
                />
              </Elements>
            ) : (
              <div className="flex justify-center p-8">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-700 border-t-cyan-500"></div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};
