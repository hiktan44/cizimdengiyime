import React, { useState, useEffect } from 'react';
import { supabase, Generation, Profile, CREDIT_PACKAGES, Transaction } from '../lib/supabase';
import { BuyCreditsModal } from './BuyCreditsModal';
import { getUserTransactions } from '../lib/database';
import { useTranslation, TranslationRecord } from '../lib/i18n';

// --- Dashboard Translations ---
const trDashboard = {
  greeting: 'Merhaba',
  defaultUser: 'Kullanıcı',
  accountStatus: 'Hesap Durumu',
  availableCredits: 'Mevcut Kredi',
  buyCredits: 'Kredi Satın Al',
  totalGenerations: 'Toplam Oluşturma',
  creditsSpent: 'Harcanan Kredi',
  last30Days: 'Son 30 Gün',
  myOperations: '📊 İşlemlerim',
  paymentHistory: '💳 Ödeme Geçmişi',
  operationsLast30: 'İşlemlerim (Son 30 Gün)',
  loading: 'Yükleniyor...',
  noGenerations: 'Henüz bir oluşturma işleminiz yok',
  noPayments: 'Henüz ödeme işleminiz yok',
  creditUsed: 'Kullanılan Kredi',
  paymentHistoryTitle: 'Ödeme Geçmişi',
  typeLabel: 'Tip',
  amountLabel: 'Tutar',
  creditLabel: 'Kredi',
  statusLabel: 'Durum',
  dateLabel: 'Tarih',
  subscription: 'Abonelik',
  creditPackage: 'Kredi Paketi',
  completed: 'Tamamlandı',
  pending: 'Bekliyor',
  failed: 'Başarısız',
  // Type labels
  sketchToProduct: 'Çizim → Ürün',
  productToModel: 'Ürün → Model',
  video: 'Video',
  techSketch: 'Teknik Çizim',
  pixshop: 'Pixshop',
  fotomatikTransform: 'Fotomatik (Dönüştür)',
  fotomatikDescribe: 'Fotomatik (Açıkla)',
};

const dashboardTranslations: TranslationRecord<typeof trDashboard> = {
  tr: trDashboard,
  en: {
    greeting: 'Hello',
    defaultUser: 'User',
    accountStatus: 'Account Status',
    availableCredits: 'Available Credits',
    buyCredits: 'Buy Credits',
    totalGenerations: 'Total Generations',
    creditsSpent: 'Credits Spent',
    last30Days: 'Last 30 Days',
    myOperations: '📊 My Operations',
    paymentHistory: '💳 Payment History',
    operationsLast30: 'My Operations (Last 30 Days)',
    loading: 'Loading...',
    noGenerations: 'You have no generations yet',
    noPayments: 'You have no payment transactions yet',
    creditUsed: 'Credits Used',
    paymentHistoryTitle: 'Payment History',
    typeLabel: 'Type',
    amountLabel: 'Amount',
    creditLabel: 'Credits',
    statusLabel: 'Status',
    dateLabel: 'Date',
    subscription: 'Subscription',
    creditPackage: 'Credit Package',
    completed: 'Completed',
    pending: 'Pending',
    failed: 'Failed',
    // Type labels
    sketchToProduct: 'Sketch → Product',
    productToModel: 'Product → Model',
    video: 'Video',
    techSketch: 'Technical Sketch',
    pixshop: 'Pixshop',
    fotomatikTransform: 'Fotomatik (Transform)',
    fotomatikDescribe: 'Fotomatik (Describe)',
  },
};

interface DashboardProps {
  profile: Profile;
  onRefresh: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ profile, onRefresh }) => {
  const t = useTranslation(dashboardTranslations);
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBuyCredits, setShowBuyCredits] = useState(false);
  const [activeTab, setActiveTab] = useState<'generations' | 'transactions'>('generations');

  useEffect(() => {
    fetchGenerations();
    fetchTransactions();
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

  const fetchTransactions = async () => {
    try {
      const data = await getUserTransactions(profile.id);
      setTransactions(data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'sketch_to_product':
        return t.sketchToProduct;
      case 'product_to_model':
        return t.productToModel;
      case 'video':
        return t.video;
      case 'tech_sketch':
        return t.techSketch;
      case 'pixshop':
        return t.pixshop;
      case 'fotomatik_transform':
        return t.fotomatikTransform;
      case 'fotomatik_describe':
        return t.fotomatikDescribe;
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
      case 'tech_sketch':
        return 'bg-pink-500/10 text-pink-400 border-pink-500/50';
      case 'pixshop':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/50';
      case 'fotomatik_transform':
        return 'bg-teal-500/10 text-teal-400 border-teal-500/50';
      case 'fotomatik_describe':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/50';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/50';
    }
  };

  const currentLocale = (window as any).__FASHEONE_LANG__ === 'en' ? 'en-US' : 'tr-TR';

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-8 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with Credits */}
        <div className="bg-slate-900/50 border border-slate-700 rounded-2xl p-8 mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                {t.greeting}, {profile.full_name || t.defaultUser}
              </h1>
              <p className="text-slate-400">
                {t.accountStatus}: <span className="text-cyan-400 font-semibold capitalize">{profile.subscription_tier}</span>
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-400 mb-1">{t.availableCredits}</div>
              <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                {profile.credits}
              </div>
              <button
                onClick={() => setShowBuyCredits(true)}
                className="mt-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-cyan-500 hover:to-blue-500 transition text-sm"
              >
                {t.buyCredits}
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
            <div className="text-slate-400 text-sm mb-2">{t.totalGenerations}</div>
            <div className="text-3xl font-bold text-white">{generations.length}</div>
          </div>
          <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
            <div className="text-slate-400 text-sm mb-2">{t.creditsSpent}</div>
            <div className="text-3xl font-bold text-white">
              {generations.reduce((sum, g) => sum + g.credits_used, 0)}
            </div>
          </div>
          <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
            <div className="text-slate-400 text-sm mb-2">{t.last30Days}</div>
            <div className="text-3xl font-bold text-white">{generations.length}</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-2 mb-8">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setActiveTab('generations')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${activeTab === 'generations'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg'
                  : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700 hover:text-white'
                }`}
            >
              {t.myOperations}
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${activeTab === 'transactions'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg'
                  : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700 hover:text-white'
                }`}
            >
              {t.paymentHistory}
            </button>
          </div>
        </div>

        {/* History */}
        {activeTab === 'generations' && (
          <div className="bg-slate-900/50 border border-slate-700 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">{t.operationsLast30}</h2>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-slate-700 border-t-cyan-500"></div>
                <p className="text-slate-400 mt-4">{t.loading}</p>
              </div>
            ) : generations.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-slate-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p className="text-slate-400">{t.noGenerations}</p>
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
                            {new Date(gen.created_at).toLocaleString(currentLocale)}
                          </span>
                        </div>
                        <div className="text-slate-400 text-sm">
                          {t.creditUsed}: <span className="text-cyan-400 font-semibold">{gen.credits_used}</span>
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
        )}

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <div className="bg-slate-900/50 border border-slate-700 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">{t.paymentHistoryTitle}</h2>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-slate-700 border-t-cyan-500"></div>
                <p className="text-slate-400 mt-4">{t.loading}</p>
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-slate-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                <p className="text-slate-400">{t.noPayments}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-900/50 border-b border-slate-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">{t.typeLabel}</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400 uppercase">{t.amountLabel}</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400 uppercase">{t.creditLabel}</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">{t.statusLabel}</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">{t.dateLabel}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-700/30 transition">
                        <td className="px-4 py-3">
                          <span className="text-sm text-slate-300">
                            {tx.type === 'subscription' ? t.subscription : t.creditPackage}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="text-sm font-bold text-green-400">{Number(tx.amount).toFixed(2)}₺</span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="text-sm font-bold text-cyan-400">{tx.credits}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold border ${tx.status === 'completed'
                                ? 'bg-green-500/20 text-green-400 border-green-500/50'
                                : tx.status === 'pending'
                                  ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
                                  : 'bg-red-500/20 text-red-400 border-red-500/50'
                              }`}
                          >
                            {tx.status === 'completed' ? t.completed : tx.status === 'pending' ? t.pending : t.failed}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs text-slate-400">{new Date(tx.created_at).toLocaleString(currentLocale)}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Buy Credits Modal */}
        <BuyCreditsModal
          isOpen={showBuyCredits}
          onClose={() => setShowBuyCredits(false)}
          userId={profile.id}
          userEmail={profile.email}
          userName={profile.full_name || t.defaultUser}
          onSuccess={() => {
            onRefresh();
            fetchTransactions();
          }}
        />
      </div>
    </div>
  );
};
