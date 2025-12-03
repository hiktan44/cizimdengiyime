import React, { useState, useEffect } from 'react';
import { supabase, Generation, Profile, CREDIT_PACKAGES } from '../lib/supabase';

interface DashboardProps {
  profile: Profile;
  onRefresh: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ profile, onRefresh }) => {
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBuyCredits, setShowBuyCredits] = useState(false);

  useEffect(() => {
    fetchGenerations();
  }, []);

  const fetchGenerations = async () => {
    try {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

      const { data, error } = await supabase
        .from('generations')
        .select('*')
        .eq('user_id', profile.id)
        .gte('created_at', oneMonthAgo.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGenerations(data || []);
    } catch (error) {
      console.error('Error fetching generations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'sketch_to_product':
        return 'Çizim → Ürün';
      case 'product_to_model':
        return 'Ürün → Model';
      case 'video':
        return 'Video';
      default:
        return type;
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'sketch_to_product':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/50';
      case 'product_to_model':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/50';
      case 'video':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/50';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/50';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-8 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with Credits */}
        <div className="bg-slate-900/50 border border-slate-700 rounded-2xl p-8 mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Merhaba, {profile.full_name || 'Kullanıcı'}
              </h1>
              <p className="text-slate-400">
                Hesap Durumu: <span className="text-cyan-400 font-semibold capitalize">{profile.subscription_tier}</span>
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-400 mb-1">Mevcut Kredi</div>
              <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                {profile.credits}
              </div>
              <button
                onClick={() => setShowBuyCredits(true)}
                className="mt-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-cyan-500 hover:to-blue-500 transition text-sm"
              >
                Kredi Satın Al
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
            <div className="text-slate-400 text-sm mb-2">Toplam Oluşturma</div>
            <div className="text-3xl font-bold text-white">{generations.length}</div>
          </div>
          <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
            <div className="text-slate-400 text-sm mb-2">Harcanan Kredi</div>
            <div className="text-3xl font-bold text-white">
              {generations.reduce((sum, g) => sum + g.credits_used, 0)}
            </div>
          </div>
          <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
            <div className="text-slate-400 text-sm mb-2">Son 30 Gün</div>
            <div className="text-3xl font-bold text-white">{generations.length}</div>
          </div>
        </div>

        {/* History */}
        <div className="bg-slate-900/50 border border-slate-700 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Geçmiş (Son 30 Gün)</h2>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-slate-700 border-t-cyan-500"></div>
              <p className="text-slate-400 mt-4">Yükleniyor...</p>
            </div>
          ) : generations.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-slate-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="text-slate-400">Henüz bir oluşturma işleminiz yok</p>
            </div>
          ) : (
            <div className="space-y-4">
              {generations.map((gen) => (
                <div
                  key={gen.id}
                  className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-slate-600 transition"
                >
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getTypeBadgeColor(gen.type)}`}>
                          {getTypeLabel(gen.type)}
                        </span>
                        <span className="text-slate-500 text-sm">
                          {new Date(gen.created_at).toLocaleString('tr-TR')}
                        </span>
                      </div>
                      <div className="text-slate-400 text-sm">
                        Kullanılan Kredi: <span className="text-cyan-400 font-semibold">{gen.credits_used}</span>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      {gen.output_image_url && (
                        <img
                          src={gen.output_image_url}
                          alt="Output"
                          className="w-24 h-24 object-cover rounded-lg border border-slate-600"
                        />
                      )}
                      {gen.output_video_url && (
                        <video
                          src={gen.output_video_url}
                          className="w-24 h-24 object-cover rounded-lg border border-slate-600"
                          muted
                          loop
                          autoPlay
                        />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Buy Credits Modal */}
        {showBuyCredits && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 rounded-2xl border border-slate-700 max-w-2xl w-full p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Kredi Satın Al</h2>
                <button
                  onClick={() => setShowBuyCredits(false)}
                  className="text-slate-400 hover:text-white transition"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <p className="text-slate-400 mb-8">
                Aboneliğiniz devam ederken krediniz biterse ek kredi paketleri satın alabilirsiniz.
              </p>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 text-center hover:border-cyan-500 transition cursor-pointer">
                  <div className="text-3xl font-bold text-white mb-2">{CREDIT_PACKAGES.SMALL.credits}</div>
                  <div className="text-sm text-slate-400 mb-4">Kredi</div>
                  <div className="text-2xl font-bold text-cyan-400 mb-4">{CREDIT_PACKAGES.SMALL.price}₺</div>
                  <button className="w-full bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg font-semibold transition text-sm">
                    Satın Al
                  </button>
                </div>

                <div className="bg-slate-800 border-2 border-cyan-500 rounded-xl p-6 text-center hover:border-cyan-400 transition cursor-pointer">
                  <div className="text-3xl font-bold text-white mb-2">{CREDIT_PACKAGES.MEDIUM.credits}</div>
                  <div className="text-sm text-slate-400 mb-4">Kredi</div>
                  <div className="text-2xl font-bold text-cyan-400 mb-4">{CREDIT_PACKAGES.MEDIUM.price}₺</div>
                  <button className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-4 py-2 rounded-lg font-semibold transition text-sm">
                    Satın Al
                  </button>
                </div>

                <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 text-center hover:border-purple-500 transition cursor-pointer">
                  <div className="text-3xl font-bold text-white mb-2">{CREDIT_PACKAGES.LARGE.credits}</div>
                  <div className="text-sm text-slate-400 mb-4">Kredi</div>
                  <div className="text-2xl font-bold text-cyan-400 mb-4">{CREDIT_PACKAGES.LARGE.price}₺</div>
                  <button className="w-full bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg font-semibold transition text-sm">
                    Satın Al
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-500 text-center mt-6">
                Ödeme için güvenli Stripe kullanılmaktadır
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
