import React, { useState, useEffect } from 'react';
import { getSiteSettings, updateSiteSetting } from '../../lib/adminService';

type Language = 'tr' | 'en';

const translations = {
  tr: {
    initialCredits: {
      title: 'İlk Üyelik Kredisi',
      subtitle: 'Yeni kayıt olan kullanıcılara verilen kredi miktarı',
      credits: 'Kredi',
    },
    packages: {
      title: 'Kredi Paketleri',
      small: 'Küçük Paket',
      medium: 'Orta Paket',
      large: 'Büyük Paket',
      creditAmount: 'Kredi Miktarı',
      price: 'Fiyat (TL)',
    },
    stripe: {
      title: 'Stripe Ödeme Ayarları',
      mode: 'Çalışma Modu',
      publishableKey: 'Publishable Key (pk_...)',
      secretKey: 'Secret Key (sk_...)',
      test: 'Test Modu',
      live: 'Canlı (Live) Mod',
      warning: 'Bu anahtarlar ödeme almak için kritiktir. Dikkatli değiştirin.',
    },
    save: {
      saving: 'Kaydediliyor...',
      button: 'Ayarları Kaydet',
      success: 'Ayarlar başarıyla kaydedildi!',
      error: 'Ayarlar kaydedilirken hata oluştu!',
    },

  },
  en: {
    initialCredits: {
      title: 'Initial Membership Credits',
      subtitle: 'Credits given to newly registered users',
      credits: 'Credits',
    },
    packages: {
      title: 'Credit Packages',
      small: 'Small Package',
      medium: 'Medium Package',
      large: 'Large Package',
      creditAmount: 'Credit Amount',
      price: 'Price (TL)',
    },
    stripe: {
      title: 'Stripe Payment Settings',
      mode: 'Operation Mode',
      publishableKey: 'Publishable Key (pk_...)',
      secretKey: 'Secret Key (sk_...)',
      test: 'Test Mode',
      live: 'Live Mode',
      warning: 'These keys are critical for payments. Change with caution.',
    },
    save: {
      saving: 'Saving...',
      button: 'Save Settings',
      success: 'Settings saved successfully!',
      error: 'Error saving settings!',
    },

  },
};

export const SettingsPanel: React.FC = () => {
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [language, setLanguage] = useState<Language>('tr');

  useEffect(() => {
    loadSettings();
    const savedLang = localStorage.getItem('fasheone_language') as Language;
    if (savedLang) setLanguage(savedLang);
  }, []);

  const t = translations[language];

  const loadSettings = async () => {
    try {
      const data = await getSiteSettings();
      setSettings(data);
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const updates = [
        // Credit Settings
        { key: 'initial_credits', value: settings.initial_credits, type: 'number' as const },
        { key: 'credit_package_small_credits', value: settings.credit_package_small_credits, type: 'number' as const },
        { key: 'credit_package_small_price', value: settings.credit_package_small_price, type: 'number' as const },
        { key: 'credit_package_medium_credits', value: settings.credit_package_medium_credits, type: 'number' as const },
        { key: 'credit_package_medium_price', value: settings.credit_package_medium_price, type: 'number' as const },
        { key: 'credit_package_large_credits', value: settings.credit_package_large_credits, type: 'number' as const },
        { key: 'credit_package_large_price', value: settings.credit_package_large_price, type: 'number' as const },

        // Stripe Settings
        { key: 'stripe_mode', value: settings.stripe_mode || 'test', type: 'string' as const },
        { key: 'stripe_publishable_key', value: settings.stripe_publishable_key || '', type: 'string' as const },
        { key: 'stripe_secret_key', value: settings.stripe_secret_key || '', type: 'string' as const },
      ];

      for (const update of updates) {
        if (update.value !== undefined) {
          await updateSiteSetting(update.key, update.value, update.type);
        }
      }

      setMessage({ type: 'success', text: t.save.success });
      // Reload to ensure everything is consistent
      await loadSettings();
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: t.save.error });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-700 border-t-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {message && (
        <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-500/10 border border-green-500/50 text-green-400' : 'bg-red-500/10 border border-red-500/50 text-red-400'}`}>
          {message.text}
        </div>
      )}

      {/* Initial Credits */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4">{t.initialCredits.title}</h3>
        <p className="text-slate-400 text-sm mb-4">{t.initialCredits.subtitle}</p>
        <div className="flex items-center gap-4">
          <input
            type="number"
            value={settings.initial_credits || 10}
            onChange={(e) => setSettings({ ...settings, initial_credits: parseInt(e.target.value) })}
            className="w-32 bg-slate-700 border border-slate-600 rounded-lg p-3 text-white"
            min="0"
          />
          <span className="text-slate-400">{t.initialCredits.credits}</span>
        </div>
      </div>

      {/* Credit Packages */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4">{t.packages.title}</h3>
        <div className="grid md:grid-cols-3 gap-6">
          {/* Small Package */}
          <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-cyan-400 mb-4">{t.packages.small}</h4>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-slate-400 block mb-1">{t.packages.creditAmount}</label>
                <input
                  type="number"
                  value={settings.credit_package_small_credits || 50}
                  onChange={(e) => setSettings({ ...settings, credit_package_small_credits: parseInt(e.target.value) })}
                  className="w-full bg-slate-700 border border-slate-600 rounded p-2 text-white"
                  min="0"
                />
              </div>
              <div>
                <label className="text-sm text-slate-400 block mb-1">{t.packages.price}</label>
                <input
                  type="number"
                  value={settings.credit_package_small_price || 250}
                  onChange={(e) => setSettings({ ...settings, credit_package_small_price: parseInt(e.target.value) })}
                  className="w-full bg-slate-700 border border-slate-600 rounded p-2 text-white"
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* Medium Package */}
          <div className="bg-slate-900/50 border-2 border-cyan-500 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-cyan-400 mb-4">{t.packages.medium}</h4>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-slate-400 block mb-1">{t.packages.creditAmount}</label>
                <input
                  type="number"
                  value={settings.credit_package_medium_credits || 100}
                  onChange={(e) => setSettings({ ...settings, credit_package_medium_credits: parseInt(e.target.value) })}
                  className="w-full bg-slate-700 border border-slate-600 rounded p-2 text-white"
                  min="0"
                />
              </div>
              <div>
                <label className="text-sm text-slate-400 block mb-1">{t.packages.price}</label>
                <input
                  type="number"
                  value={settings.credit_package_medium_price || 500}
                  onChange={(e) => setSettings({ ...settings, credit_package_medium_price: parseInt(e.target.value) })}
                  className="w-full bg-slate-700 border border-slate-600 rounded p-2 text-white"
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* Large Package */}
          <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-purple-400 mb-4">{t.packages.large}</h4>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-slate-400 block mb-1">{t.packages.creditAmount}</label>
                <input
                  type="number"
                  value={settings.credit_package_large_credits || 200}
                  onChange={(e) => setSettings({ ...settings, credit_package_large_credits: parseInt(e.target.value) })}
                  className="w-full bg-slate-700 border border-slate-600 rounded p-2 text-white"
                  min="0"
                />
              </div>
              <div>
                <label className="text-sm text-slate-400 block mb-1">{t.packages.price}</label>
                <input
                  type="number"
                  value={settings.credit_package_large_price || 1000}
                  onChange={(e) => setSettings({ ...settings, credit_package_large_price: parseInt(e.target.value) })}
                  className="w-full bg-slate-700 border border-slate-600 rounded p-2 text-white"
                  min="0"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stripe Settings */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4">{t.stripe.title}</h3>
        <p className="text-slate-400 text-sm mb-4 bg-yellow-400/10 text-yellow-500 p-3 rounded-lg border border-yellow-500/20">
          ⚠️ {t.stripe.warning}
        </p>

        <div className="space-y-4 max-w-2xl">
          {/* Mode Selection */}
          <div>
            <label className="text-sm text-slate-400 block mb-2">{t.stripe.mode}</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="stripe_mode"
                  checked={settings.stripe_mode === 'test'}
                  onChange={() => setSettings({ ...settings, stripe_mode: 'test' })}
                  className="form-radio text-cyan-500 focus:ring-cyan-500 bg-slate-700 border-slate-600"
                />
                <span className="text-white">{t.stripe.test}</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="stripe_mode"
                  checked={settings.stripe_mode === 'live'}
                  onChange={() => setSettings({ ...settings, stripe_mode: 'live' })}
                  className="form-radio text-green-500 focus:ring-green-500 bg-slate-700 border-slate-600"
                />
                <span className="text-white">{t.stripe.live}</span>
              </label>
            </div>
          </div>

          {/* Publishable Key */}
          <div>
            <label className="text-sm text-slate-400 block mb-1">{t.stripe.publishableKey}</label>
            <input
              type="text"
              value={settings.stripe_publishable_key || ''}
              onChange={(e) => setSettings({ ...settings, stripe_publishable_key: e.target.value })}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white font-mono text-sm"
              placeholder="pk_test_..."
            />
          </div>

          {/* Secret Key */}
          <div>
            <label className="text-sm text-slate-400 block mb-1">{t.stripe.secretKey}</label>
            <input
              type="password"
              value={settings.stripe_secret_key || ''}
              onChange={(e) => setSettings({ ...settings, stripe_secret_key: e.target.value })}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white font-mono text-sm"
              placeholder="sk_test_..."
            />
          </div>
        </div>
      </div>



      {/* Save Button */}
      <div className="flex justify-end pt-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:from-slate-600 disabled:to-slate-600 text-white px-8 py-3 rounded-lg font-semibold transition shadow-lg hover:shadow-cyan-500/25"
        >
          {saving ? t.save.saving : t.save.button}
        </button>
      </div>
    </div>
  );
};
