import React, { useState, useEffect } from 'react';
import { getAllTransactions, AdminTransaction } from '../../lib/adminService';

type Language = 'tr' | 'en';

const translations = {
  tr: {
    stats: {
      totalTransactions: 'Toplam İşlem',
      totalRevenue: 'Toplam Gelir',
      creditsGiven: 'Verilen Kredi',
      successRate: 'Başarı Oranı',
    },
    filter: {
      label: 'Durum Filtrele:',
      all: 'Tümü',
      completed: 'Tamamlanan',
      pending: 'Bekleyen',
      failed: 'Başarısız',
    },
    table: {
      user: 'Kullanıcı',
      type: 'Tip',
      amount: 'Tutar',
      credits: 'Kredi',
      status: 'Durum',
      paymentMethod: 'Ödeme Yöntemi',
      date: 'Tarih',
      noTransactions: 'İşlem bulunamadı',
      unnamed: 'İsimsiz',
    },
    status: {
      completed: 'Tamamlandı',
      pending: 'Bekliyor',
      failed: 'Başarısız',
    },
    type: {
      subscription: 'Abonelik',
      creditPackage: 'Kredi Paketi',
    },
  },
  en: {
    stats: {
      totalTransactions: 'Total Transactions',
      totalRevenue: 'Total Revenue',
      creditsGiven: 'Credits Given',
      successRate: 'Success Rate',
    },
    filter: {
      label: 'Filter Status:',
      all: 'All',
      completed: 'Completed',
      pending: 'Pending',
      failed: 'Failed',
    },
    table: {
      user: 'User',
      type: 'Type',
      amount: 'Amount',
      credits: 'Credits',
      status: 'Status',
      paymentMethod: 'Payment Method',
      date: 'Date',
      noTransactions: 'No transactions found',
      unnamed: 'Unnamed',
    },
    status: {
      completed: 'Completed',
      pending: 'Pending',
      failed: 'Failed',
    },
    type: {
      subscription: 'Subscription',
      creditPackage: 'Credit Package',
    },
  },
};

export const TransactionsPanel: React.FC = () => {
  const [transactions, setTransactions] = useState<AdminTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'pending' | 'failed'>('all');
  const [language, setLanguage] = useState<Language>('tr');

  useEffect(() => {
    loadTransactions();
    const savedLang = localStorage.getItem('fasheone_language') as Language;
    if (savedLang) setLanguage(savedLang);
  }, []);

  const t = translations[language];

  const loadTransactions = async () => {
    try {
      const data = await getAllTransactions();
      setTransactions(data);
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter((tx) => {
    if (filterStatus === 'all') return true;
    return tx.status === filterStatus;
  });

  const totalRevenue = transactions
    .filter((tx) => tx.status === 'completed')
    .reduce((sum, tx) => sum + Number(tx.amount), 0);

  const totalCreditsGiven = transactions
    .filter((tx) => tx.status === 'completed')
    .reduce((sum, tx) => sum + tx.credits, 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'failed':
        return 'bg-red-500/20 text-red-400 border-red-500/50';
      default:
        return 'bg-slate-700 text-slate-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return t.status.completed;
      case 'pending':
        return t.status.pending;
      case 'failed':
        return t.status.failed;
      default:
        return status;
    }
  };

  const getTypeText = (type: string) => {
    return type === 'subscription' ? t.type.subscription : t.type.creditPackage;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-700 border-t-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <div className="text-slate-400 text-sm mb-1">{t.stats.totalTransactions}</div>
          <div className="text-3xl font-bold text-white">{transactions.length}</div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <div className="text-slate-400 text-sm mb-1">{t.stats.totalRevenue}</div>
          <div className="text-3xl font-bold text-green-400">{totalRevenue.toFixed(2)}₺</div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <div className="text-slate-400 text-sm mb-1">{t.stats.creditsGiven}</div>
          <div className="text-3xl font-bold text-cyan-400">{totalCreditsGiven}</div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <div className="text-slate-400 text-sm mb-1">{t.stats.successRate}</div>
          <div className="text-3xl font-bold text-purple-400">
            {transactions.length > 0 ? Math.round((transactions.filter((tx) => tx.status === 'completed').length / transactions.length) * 100) : 0}%
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm text-slate-400">{t.filter.label}</span>
          {(['all', 'completed', 'pending', 'failed'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                filterStatus === status
                  ? 'bg-cyan-600 text-white'
                  : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
              }`}
            >
              {status === 'all'
                ? t.filter.all
                : status === 'completed'
                ? t.filter.completed
                : status === 'pending'
                ? t.filter.pending
                : t.filter.failed}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-900/50 border-b border-slate-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">{t.table.user}</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">{t.table.type}</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400 uppercase">{t.table.amount}</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400 uppercase">{t.table.credits}</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">{t.table.status}</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">{t.table.paymentMethod}</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">{t.table.date}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                    {t.table.noTransactions}
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-700/30 transition">
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-white">{tx.user_name || t.table.unnamed}</div>
                      <div className="text-xs text-slate-400">{tx.user_email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-slate-300">{getTypeText(tx.type)}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm font-bold text-green-400">{Number(tx.amount).toFixed(2)}₺</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm font-bold text-cyan-400">{tx.credits}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(tx.status)}`}>
                        {getStatusText(tx.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-slate-400">{tx.payment_method || 'N/A'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-slate-400">{new Date(tx.created_at).toLocaleString(language === 'tr' ? 'tr-TR' : 'en-US')}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

