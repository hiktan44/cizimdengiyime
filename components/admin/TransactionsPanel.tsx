import React, { useState, useEffect } from 'react';
import { getAllTransactions, AdminTransaction } from '../../lib/adminService';

export const TransactionsPanel: React.FC = () => {
  const [transactions, setTransactions] = useState<AdminTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'pending' | 'failed'>('all');

  useEffect(() => {
    loadTransactions();
  }, []);

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
        return 'Tamamlandı';
      case 'pending':
        return 'Bekliyor';
      case 'failed':
        return 'Başarısız';
      default:
        return status;
    }
  };

  const getTypeText = (type: string) => {
    return type === 'subscription' ? 'Abonelik' : 'Kredi Paketi';
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
          <div className="text-slate-400 text-sm mb-1">Toplam İşlem</div>
          <div className="text-3xl font-bold text-white">{transactions.length}</div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <div className="text-slate-400 text-sm mb-1">Toplam Gelir</div>
          <div className="text-3xl font-bold text-green-400">{totalRevenue.toFixed(2)}₺</div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <div className="text-slate-400 text-sm mb-1">Verilen Kredi</div>
          <div className="text-3xl font-bold text-cyan-400">{totalCreditsGiven}</div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <div className="text-slate-400 text-sm mb-1">Başarı Oranı</div>
          <div className="text-3xl font-bold text-purple-400">
            {transactions.length > 0 ? Math.round((transactions.filter((t) => t.status === 'completed').length / transactions.length) * 100) : 0}%
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm text-slate-400">Durum Filtrele:</span>
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
                ? 'Tümü'
                : status === 'completed'
                ? 'Tamamlanan'
                : status === 'pending'
                ? 'Bekleyen'
                : 'Başarısız'}
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
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Kullanıcı</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Tip</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400 uppercase">Tutar</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400 uppercase">Kredi</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Durum</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Ödeme Yöntemi</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Tarih</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                    İşlem bulunamadı
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-700/30 transition">
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-white">{tx.user_name || 'İsimsiz'}</div>
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
                      <span className="text-xs text-slate-400">{new Date(tx.created_at).toLocaleString('tr-TR')}</span>
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

