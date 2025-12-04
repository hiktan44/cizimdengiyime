import React, { useState, useEffect } from 'react';
import { getAllUsersActivity, UserActivity, getUserGenerations } from '../../lib/adminService';

export const UserActivityPanel: React.FC = () => {
  const [users, setUsers] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserActivity | null>(null);
  const [userGenerations, setUserGenerations] = useState<any[]>([]);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await getAllUsersActivity();
      setUsers(data);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserClick = async (user: UserActivity) => {
    setSelectedUser(user);
    const generations = await getUserGenerations(user.id);
    setUserGenerations(generations);
  };

  const filteredUsers = users.filter(
    (user) =>
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.full_name && user.full_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-700 border-t-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
        <input
          type="text"
          placeholder="Kullanıcı ara (email veya isim)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
        />
      </div>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <div className="text-slate-400 text-sm mb-1">Toplam Kullanıcı</div>
          <div className="text-3xl font-bold text-white">{users.length}</div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <div className="text-slate-400 text-sm mb-1">Admin Kullanıcı</div>
          <div className="text-3xl font-bold text-purple-400">{users.filter((u) => u.is_admin).length}</div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <div className="text-slate-400 text-sm mb-1">Toplam Kredi</div>
          <div className="text-3xl font-bold text-cyan-400">{users.reduce((sum, u) => sum + u.credits, 0)}</div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <div className="text-slate-400 text-sm mb-1">Toplam İşlem</div>
          <div className="text-3xl font-bold text-green-400">{users.reduce((sum, u) => sum + u.total_generations, 0)}</div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-900/50 border-b border-slate-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Kullanıcı</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Rol</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400 uppercase">Kredi</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400 uppercase">İşlemler</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400 uppercase">Harcanan</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Son Aktivite</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Kayıt Tarihi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  onClick={() => handleUserClick(user)}
                  className="hover:bg-slate-700/30 cursor-pointer transition"
                >
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-white">{user.full_name || 'İsimsiz'}</div>
                    <div className="text-xs text-slate-400">{user.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    {user.is_admin ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-400 border border-purple-500/50">
                        Admin
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-slate-700 text-slate-400">
                        Kullanıcı
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-sm font-bold text-cyan-400">{user.credits}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-sm text-white">{user.total_generations}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-sm text-orange-400">{user.total_credits_used}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-slate-400">
                      {user.last_activity ? new Date(user.last_activity).toLocaleString('tr-TR') : 'Hiç'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-slate-400">{new Date(user.created_at).toLocaleDateString('tr-TR')}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl border border-slate-700 max-w-4xl w-full max-h-[80vh] overflow-y-auto p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Kullanıcı Detayları</h2>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-slate-400 hover:text-white transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              {/* User Info */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                  <div className="text-sm text-slate-400 mb-1">Email</div>
                  <div className="text-white font-medium">{selectedUser.email}</div>
                </div>
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                  <div className="text-sm text-slate-400 mb-1">İsim</div>
                  <div className="text-white font-medium">{selectedUser.full_name || 'Belirtilmemiş'}</div>
                </div>
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                  <div className="text-sm text-slate-400 mb-1">Mevcut Kredi</div>
                  <div className="text-2xl font-bold text-cyan-400">{selectedUser.credits}</div>
                </div>
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                  <div className="text-sm text-slate-400 mb-1">Toplam Harcanan</div>
                  <div className="text-2xl font-bold text-orange-400">{selectedUser.total_credits_used}</div>
                </div>
              </div>

              {/* Recent Generations */}
              <div>
                <h3 className="text-lg font-bold text-white mb-4">Son İşlemler (Son 10)</h3>
                <div className="space-y-3">
                  {userGenerations.length === 0 ? (
                    <p className="text-slate-400 text-center py-4">Henüz işlem yok</p>
                  ) : (
                    userGenerations.map((gen) => (
                      <div key={gen.id} className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-sm font-semibold text-cyan-400">
                              {gen.type === 'sketch_to_product' ? 'Çizim → Ürün' : gen.type === 'product_to_model' ? 'Ürün → Model' : 'Video'}
                            </span>
                            <span className="text-xs text-slate-400 ml-3">{new Date(gen.created_at).toLocaleString('tr-TR')}</span>
                          </div>
                          <span className="text-sm text-white">{gen.credits_used} kredi</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

