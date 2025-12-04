import React, { useState, useEffect } from 'react';
import { getSiteSettings, updateSiteSetting } from '../../lib/adminService';

export const SettingsPanel: React.FC = () => {
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

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
        { key: 'initial_credits', value: settings.initial_credits, type: 'number' as const },
        { key: 'credit_package_small_credits', value: settings.credit_package_small_credits, type: 'number' as const },
        { key: 'credit_package_small_price', value: settings.credit_package_small_price, type: 'number' as const },
        { key: 'credit_package_medium_credits', value: settings.credit_package_medium_credits, type: 'number' as const },
        { key: 'credit_package_medium_price', value: settings.credit_package_medium_price, type: 'number' as const },
        { key: 'credit_package_large_credits', value: settings.credit_package_large_credits, type: 'number' as const },
        { key: 'credit_package_large_price', value: settings.credit_package_large_price, type: 'number' as const },
      ];

      for (const update of updates) {
        await updateSiteSetting(update.key, update.value, update.type);
      }

      setMessage({ type: 'success', text: 'Ayarlar başarıyla kaydedildi!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Ayarlar kaydedilirken hata oluştu!' });
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
        <h3 className="text-xl font-bold text-white mb-4">İlk Üyelik Kredisi</h3>
        <p className="text-slate-400 text-sm mb-4">Yeni kayıt olan kullanıcılara verilen kredi miktarı</p>
        <div className="flex items-center gap-4">
          <input
            type="number"
            value={settings.initial_credits || 10}
            onChange={(e) => setSettings({ ...settings, initial_credits: parseInt(e.target.value) })}
            className="w-32 bg-slate-700 border border-slate-600 rounded-lg p-3 text-white"
            min="0"
          />
          <span className="text-slate-400">Kredi</span>
        </div>
      </div>

      {/* Credit Packages */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4">Kredi Paketleri</h3>
        <div className="grid md:grid-cols-3 gap-6">
          {/* Small Package */}
          <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-cyan-400 mb-4">Küçük Paket</h4>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-slate-400 block mb-1">Kredi Miktarı</label>
                <input
                  type="number"
                  value={settings.credit_package_small_credits || 50}
                  onChange={(e) => setSettings({ ...settings, credit_package_small_credits: parseInt(e.target.value) })}
                  className="w-full bg-slate-700 border border-slate-600 rounded p-2 text-white"
                  min="0"
                />
              </div>
              <div>
                <label className="text-sm text-slate-400 block mb-1">Fiyat (TL)</label>
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
            <h4 className="text-lg font-semibold text-cyan-400 mb-4">Orta Paket</h4>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-slate-400 block mb-1">Kredi Miktarı</label>
                <input
                  type="number"
                  value={settings.credit_package_medium_credits || 100}
                  onChange={(e) => setSettings({ ...settings, credit_package_medium_credits: parseInt(e.target.value) })}
                  className="w-full bg-slate-700 border border-slate-600 rounded p-2 text-white"
                  min="0"
                />
              </div>
              <div>
                <label className="text-sm text-slate-400 block mb-1">Fiyat (TL)</label>
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
            <h4 className="text-lg font-semibold text-purple-400 mb-4">Büyük Paket</h4>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-slate-400 block mb-1">Kredi Miktarı</label>
                <input
                  type="number"
                  value={settings.credit_package_large_credits || 200}
                  onChange={(e) => setSettings({ ...settings, credit_package_large_credits: parseInt(e.target.value) })}
                  className="w-full bg-slate-700 border border-slate-600 rounded p-2 text-white"
                  min="0"
                />
              </div>
              <div>
                <label className="text-sm text-slate-400 block mb-1">Fiyat (TL)</label>
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

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:from-slate-600 disabled:to-slate-600 text-white px-8 py-3 rounded-lg font-semibold transition"
        >
          {saving ? 'Kaydediliyor...' : 'Ayarları Kaydet'}
        </button>
      </div>
    </div>
  );
};

