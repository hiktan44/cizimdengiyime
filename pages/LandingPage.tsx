import React, { useState } from 'react';
import { Logo } from '../components/Logo';
import { SUBSCRIPTION_PLANS, CREDIT_PACKAGES } from '../lib/supabase';

interface LandingPageProps {
  onGetStarted: () => void;
  onSignIn: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onSignIn }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Logo className="h-10" />
          <div className="flex items-center gap-4">
            <button
              onClick={onSignIn}
              className="text-slate-300 hover:text-white transition px-4 py-2"
            >
              Giriş Yap
            </button>
            <button
              onClick={onGetStarted}
              className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-cyan-500 hover:to-blue-500 transition"
            >
              Başla
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight">
            Çizimden Gerçeğe,
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">
              Saniyeler İçinde
            </span>
          </h1>
          <p className="text-xl text-slate-300 mb-12 max-w-3xl mx-auto">
            Moda tasarımlarınızı AI ile profesyonel ürün fotoğraflarına ve canlı model görsellerine dönüştürün. Video oluşturun, markanızı büyütün.
          </p>
          <button
            onClick={onGetStarted}
            className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-10 py-4 rounded-xl font-bold text-lg hover:from-cyan-500 hover:to-blue-500 transition shadow-2xl shadow-cyan-500/50"
          >
            Ücretsiz Deneyin
          </button>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-slate-800/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-16">
            Güçlü Özellikler
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-slate-900/50 border border-slate-700 rounded-2xl p-8">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Çizimden Ürüne</h3>
              <p className="text-slate-400">
                Moda çizimlerinizi ultra-gerçekçi hayalet manken ürün fotoğraflarına dönüştürün.
              </p>
            </div>

            <div className="bg-slate-900/50 border border-slate-700 rounded-2xl p-8">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Canlı Model</h3>
              <p className="text-slate-400">
                Ürünlerinizi gerçek modeller üzerinde görün. Etnik köken, poz, stil seçenekleriyle.
              </p>
            </div>

            <div className="bg-slate-900/50 border border-slate-700 rounded-2xl p-8">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Video Oluşturma</h3>
              <p className="text-slate-400">
                Görsellerinizi 5-10 saniyelik profesyonel videolara dönüştürün.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By Brands */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-12">
            Güvenilen Markalar
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 opacity-60">
            {['Marka A', 'Marka B', 'Marka C', 'Marka D'].map((brand) => (
              <div key={brand} className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 flex items-center justify-center">
                <span className="text-2xl font-bold text-slate-400">{brand}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-6 bg-slate-800/50" id="pricing">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-4">
            Fiyatlandırma
          </h2>
          <p className="text-slate-400 text-center mb-16">
            İhtiyacınıza uygun planı seçin. Her ay krediniz otomatik yenilenir.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {/* Starter Plan */}
            <div className="bg-slate-900/50 border border-slate-700 rounded-2xl p-8 hover:border-cyan-500 transition">
              <h3 className="text-2xl font-bold text-white mb-2">Starter</h3>
              <div className="mb-6">
                <span className="text-4xl font-black text-white">{SUBSCRIPTION_PLANS.STARTER.price}₺</span>
                <span className="text-slate-400">/ay</span>
              </div>
              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-2 text-slate-300">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{SUBSCRIPTION_PLANS.STARTER.credits} Kredi/Ay</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Çizim → Ürün (1 kredi)</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Ürün → Model (1 kredi)</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Video (3 kredi)</span>
                </div>
              </div>
              <button
                onClick={onGetStarted}
                className="w-full bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg font-semibold transition"
              >
                Başla
              </button>
            </div>

            {/* Pro Plan - Popular */}
            <div className="bg-gradient-to-b from-cyan-900/50 to-slate-900/50 border-2 border-cyan-500 rounded-2xl p-8 relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-cyan-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                Popüler
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Pro</h3>
              <div className="mb-6">
                <span className="text-4xl font-black text-white">{SUBSCRIPTION_PLANS.PRO.price}₺</span>
                <span className="text-slate-400">/ay</span>
              </div>
              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-2 text-slate-300">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{SUBSCRIPTION_PLANS.PRO.credits} Kredi/Ay</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Tüm özellikler</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Öncelikli destek</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Geçmiş arşivi (1 ay)</span>
                </div>
              </div>
              <button
                onClick={onGetStarted}
                className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-6 py-3 rounded-lg font-semibold transition"
              >
                Başla
              </button>
            </div>

            {/* Premium Plan */}
            <div className="bg-slate-900/50 border border-slate-700 rounded-2xl p-8 hover:border-purple-500 transition">
              <h3 className="text-2xl font-bold text-white mb-2">Premium</h3>
              <div className="mb-6">
                <span className="text-4xl font-black text-white">{SUBSCRIPTION_PLANS.PREMIUM.price}₺</span>
                <span className="text-slate-400">/ay</span>
              </div>
              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-2 text-slate-300">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{SUBSCRIPTION_PLANS.PREMIUM.credits} Kredi/Ay</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Tüm özellikler</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>7/24 Premium destek</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>API erişimi</span>
                </div>
              </div>
              <button
                onClick={onGetStarted}
                className="w-full bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg font-semibold transition"
              >
                Başla
              </button>
            </div>
          </div>

          {/* Extra Credit Packages */}
          <div className="border-t border-slate-700 pt-12">
            <h3 className="text-2xl font-bold text-white text-center mb-8">
              Ek Kredi Paketleri
            </h3>
            <p className="text-slate-400 text-center mb-8">
              Aboneliğiniz devam ederken krediniz biterse, ek kredi satın alabilirsiniz.
            </p>
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-white mb-2">{CREDIT_PACKAGES.SMALL.credits} Kredi</div>
                <div className="text-2xl font-bold text-cyan-400 mb-4">{CREDIT_PACKAGES.SMALL.price}₺</div>
                <div className="text-sm text-slate-400">1 Kredi = 5₺</div>
              </div>
              <div className="bg-slate-900 border border-cyan-500 rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-white mb-2">{CREDIT_PACKAGES.MEDIUM.credits} Kredi</div>
                <div className="text-2xl font-bold text-cyan-400 mb-4">{CREDIT_PACKAGES.MEDIUM.price}₺</div>
                <div className="text-sm text-slate-400">1 Kredi = 5₺</div>
              </div>
              <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-white mb-2">{CREDIT_PACKAGES.LARGE.credits} Kredi</div>
                <div className="text-2xl font-bold text-cyan-400 mb-4">{CREDIT_PACKAGES.LARGE.price}₺</div>
                <div className="text-sm text-slate-400">1 Kredi = 5₺</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-16">
            Kullanıcı Yorumları
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-slate-900/50 border border-slate-700 rounded-2xl p-8">
              <div className="flex items-center gap-2 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-slate-300 mb-6">
                "Bu platform sayesinde koleksiyonumu birkaç saat içinde görselleştirebildim. İnanılmaz hızlı ve kaliteli!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full"></div>
                <div>
                  <div className="font-semibold text-white">Ayşe Yılmaz</div>
                  <div className="text-sm text-slate-400">Fashion Designer</div>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/50 border border-slate-700 rounded-2xl p-8">
              <div className="flex items-center gap-2 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-slate-300 mb-6">
                "Müşterilerime ürünleri göstermek artık çok kolay. Video özelliği harika, sosyal medyada çok beğeniliyor!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-600 rounded-full"></div>
                <div>
                  <div className="font-semibold text-white">Mehmet Kaya</div>
                  <div className="text-sm text-slate-400">Brand Owner</div>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/50 border border-slate-700 rounded-2xl p-8">
              <div className="flex items-center gap-2 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-slate-300 mb-6">
                "Fotoğraf çekimi maliyetlerinden kurtuldum. AI görseller gerçekten profesyonel görünüyor!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-600 rounded-full"></div>
                <div>
                  <div className="font-semibold text-white">Zeynep Demir</div>
                  <div className="text-sm text-slate-400">E-commerce Manager</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-gradient-to-r from-cyan-900/50 to-blue-900/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Hemen Başlayın
          </h2>
          <p className="text-xl text-slate-300 mb-8">
            İlk tasarımınızı ücretsiz deneyin. Kredi kartı gerekmez.
          </p>
          <button
            onClick={onGetStarted}
            className="bg-white text-slate-900 px-10 py-4 rounded-xl font-bold text-lg hover:bg-slate-100 transition shadow-2xl"
          >
            Ücretsiz Başla
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-slate-700">
        <div className="max-w-7xl mx-auto text-center text-slate-400">
          <p>&copy; 2024 Fashion AI. Tüm hakları saklıdır.</p>
        </div>
      </footer>
    </div>
  );
};
