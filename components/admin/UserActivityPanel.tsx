import React, { useState, useEffect } from 'react';
import { getAllUsersActivity, UserActivity, getUserGenerations, addCreditsToUser } from '../../lib/adminService';

type Language = 'tr' | 'en';

const translations = {
  tr: {
    search: 'Kullanıcı ara (email veya isim)...',
    stats: {
      totalUsers: 'Toplam Kullanıcı',
      adminUsers: 'Admin Kullanıcı',
      totalCredits: 'Toplam Kredi',
      totalOperations: 'Toplam İşlem',
    },
    table: {
      user: 'Kullanıcı',
      phone: 'Telefon',
      role: 'Rol',
      credits: 'Kredi',
      operations: 'İşlemler',
      spent: 'Harcanan',
      lastActivity: 'Son Aktivite',
      registrationDate: 'Kayıt Tarihi',
      admin: 'Admin',
      userRole: 'Kullanıcı',
      unnamed: 'İsimsiz',
      never: 'Hiç',
    },
    actions: {
      exportCSV: 'Dışa Aktar (CSV)',
      columns: 'Sütunlar',
    },
    modal: {
      title: 'Kullanıcı Detayları',
      email: 'Email',
      name: 'İsim',
      phone: 'Telefon Numarası',
      notSpecified: 'Belirtilmemiş',
      currentCredits: 'Mevcut Kredi',
      totalSpent: 'Toplam Harcanan',
      addCreditsTitle: 'Manuel Kredi Ekle',
      addCreditsBtn: 'Kredi Ekle',
      creditAmount: 'Kredi Miktarı',
      description: 'Açıklama (Opsiyonel)',
      descPlaceholder: 'Örn: Kampanya hediyesi',
      adding: 'Ekleniyor...',
      addCredits: 'Kredi Ekle',
      cancel: 'İptal',
      recentOps: 'Son İşlemler (Son 10)',
      loading: 'İşlemler yükleniyor...',
      noOps: 'Henüz işlem yok',
      sketchToProduct: 'Çizim → Ürün',
      productToModel: 'Ürün → Model',
      techSketch: 'Teknik Çizim',
      video: 'Video',
      credit: 'kredi',
      addedByAdmin: 'Admin tarafından eklendi',
      successMsg: 'kredi başarıyla eklendi!',
      errorMsg: 'Hata:',
      addError: 'Kredi eklenirken bir hata oluştu.',
    },
    errors: {
      accessError: 'İşlem kayıtlarına erişim sağlanamadı. RLS policy güncellemesi gerekebilir.',
      loadError: 'İşlem kayıtları yüklenirken hata oluştu.',
      fixNote: 'FIX_ADMIN_GENERATIONS_RLS.sql dosyasını Supabase SQL Editor\'da çalıştırın.',
    },
  },
  en: {
    search: 'Search user (email or name)...',
    stats: {
      totalUsers: 'Total Users',
      adminUsers: 'Admin Users',
      totalCredits: 'Total Credits',
      totalOperations: 'Total Operations',
    },
    table: {
      user: 'User',
      phone: 'Phone',
      role: 'Role',
      credits: 'Credits',
      operations: 'Operations',
      spent: 'Spent',
      lastActivity: 'Last Activity',
      registrationDate: 'Registration Date',
      admin: 'Admin',
      userRole: 'User',
      unnamed: 'Unnamed',
      never: 'Never',
    },
    actions: {
      exportCSV: 'Export (CSV)',
      columns: 'Columns',
    },
    modal: {
      title: 'User Details',
      email: 'Email',
      name: 'Name',
      phone: 'Phone Number',
      notSpecified: 'Not specified',
      currentCredits: 'Current Credits',
      totalSpent: 'Total Spent',
      addCreditsTitle: 'Add Credits Manually',
      addCreditsBtn: 'Add Credits',
      creditAmount: 'Credit Amount',
      description: 'Description (Optional)',
      descPlaceholder: 'Ex: Campaign gift',
      adding: 'Adding...',
      addCredits: 'Add Credits',
      cancel: 'Cancel',
      recentOps: 'Recent Operations (Last 10)',
      loading: 'Loading operations...',
      noOps: 'No operations yet',
      sketchToProduct: 'Sketch → Product',
      productToModel: 'Product → Model',
      techSketch: 'Tech Drawing',
      video: 'Video',
      credit: 'credit',
      addedByAdmin: 'Added by admin',
      successMsg: 'credits added successfully!',
      errorMsg: 'Error:',
      addError: 'An error occurred while adding credits.',
    },
    errors: {
      accessError: 'Cannot access operation records. RLS policy update may be required.',
      loadError: 'Error loading operation records.',
      fixNote: 'Run FIX_ADMIN_GENERATIONS_RLS.sql in Supabase SQL Editor.',
    },
  },
};

interface UserActivityPanelProps {
  currentUserId?: string;
  onRefreshProfile?: () => void;
}

export const UserActivityPanel: React.FC<UserActivityPanelProps> = ({ currentUserId, onRefreshProfile }) => {
  const [users, setUsers] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserActivity | null>(null);
  const [userGenerations, setUserGenerations] = useState<any[]>([]);
  const [language, setLanguage] = useState<Language>('tr');

  // Credit addition state
  const [showAddCredit, setShowAddCredit] = useState(false);
  const [creditAmount, setCreditAmount] = useState<number>(10);
  const [creditReason, setCreditReason] = useState('');
  const [isAddingCredit, setIsAddingCredit] = useState(false);

  // Sorting state
  const [sortKey, setSortKey] = useState<keyof UserActivity>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Column visibility state
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    user: true,
    phone: true,
    role: true,
    credits: true,
    operations: true,
    spent: true,
    lastActivity: true,
    registrationDate: true,
  });
  const [showColumnMenu, setShowColumnMenu] = useState(false);

  // CSV Export
  const handleExportCSV = () => {
    const headers = [
      t.table.user,
      t.table.phone,
      t.table.role,
      t.table.credits,
      t.table.operations,
      t.table.spent,
      t.table.lastActivity,
      t.table.registrationDate
    ];

    const csvContent = [
      headers.join(','),
      ...users.map(user => {
        const name = user.full_name || t.table.unnamed;
        const phone = user.phone_number || '';
        const role = user.is_admin ? t.table.admin : t.table.userRole;
        const lastActive = user.last_activity ? new Date(user.last_activity).toLocaleString(language === 'tr' ? 'tr-TR' : 'en-US') : t.table.never;
        const regDate = new Date(user.created_at).toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US');

        return [
          `"${name} (${user.email})"`,
          `"${phone}"`,
          `"${role}"`,
          user.credits,
          user.total_generations,
          user.total_credits_used,
          `"${lastActive}"`,
          `"${regDate}"`
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'users_export.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleColumn = (key: string) => {
    setVisibleColumns(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  useEffect(() => {
    loadUsers();
    const savedLang = localStorage.getItem('fasheone_language') as Language;
    if (savedLang) setLanguage(savedLang);
  }, []);

  const t = translations[language];

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await getAllUsersActivity();
      setUsers(data);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const [generationsLoading, setGenerationsLoading] = useState(false);
  const [generationsError, setGenerationsError] = useState<string | null>(null);

  const handleUserClick = async (user: UserActivity) => {
    setSelectedUser(user);
    setShowAddCredit(false);
    setCreditAmount(10);
    setCreditReason('');
    setGenerationsLoading(true);
    setGenerationsError(null);
    setUserGenerations([]);

    try {
      const generations = await getUserGenerations(user.id);
      setUserGenerations(generations);
      if (generations.length === 0 && user.total_generations > 0) {
        setGenerationsError(t.errors.accessError);
      }
    } catch (error) {
      console.error('Error loading generations:', error);
      setGenerationsError(t.errors.loadError);
    } finally {
      setGenerationsLoading(false);
    }
  };

  const handleAddCredits = async () => {
    if (!selectedUser || creditAmount <= 0) return;

    setIsAddingCredit(true);
    try {
      const result = await addCreditsToUser(
        selectedUser.id,
        creditAmount,
        creditReason || t.modal.addedByAdmin
      );

      if (result.success) {
        alert(`✅ ${creditAmount} ${t.modal.successMsg}`);
        // Update local state
        setSelectedUser({
          ...selectedUser,
          credits: result.newCredits || selectedUser.credits + creditAmount
        });
        // Refresh user list
        await loadUsers();

        // If admin added credits to their own account, refresh their profile
        if (currentUserId && selectedUser.id === currentUserId && onRefreshProfile) {
          console.log('🔄 Refreshing current user profile after credit addition');
          onRefreshProfile();
        }

        setShowAddCredit(false);
        setCreditAmount(10);
        setCreditReason('');
      } else {
        alert(`❌ ${t.modal.errorMsg} ${result.error}`);
      }
    } catch (error) {
      console.error('Error adding credits:', error);
      alert(t.modal.addError);
    } finally {
      setIsAddingCredit(false);
    }
  };

  const handleSort = (key: keyof UserActivity) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('desc'); // Default to descending for new sorts
    }
  };

  const sortedUsers = users
    .filter(
      (user) =>
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.full_name && user.full_name.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      let aValue = a[sortKey];
      let bValue = b[sortKey];

      // Handle specific cases
      if (sortKey === 'full_name') {
        aValue = a.full_name || a.email; // Fallback to email if name is empty
        bValue = b.full_name || b.email;
      }

      // Handle null dates
      if (sortKey === 'last_activity') {
        if (!aValue) return sortOrder === 'asc' ? -1 : 1;
        if (!bValue) return sortOrder === 'asc' ? 1 : -1;
      }

      if (aValue === bValue) return 0;

      // Compare
      const comparison = aValue > bValue ? 1 : -1;
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const SortIcon = ({ active, order }: { active: boolean; order: 'asc' | 'desc' }) => {
    return (
      <svg
        className={`w-4 h-4 transition-transform ${active ? 'text-cyan-400 opacity-100' : 'text-slate-600 opacity-50 group-hover:opacity-100'} ${active && order === 'desc' ? 'transform rotate-180' : ''}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    );
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
      {/* Search */}
      {/* Actions and Search */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-800/50 border border-slate-700 rounded-xl p-4">
        <div className="w-full md:w-1/3">
          <input
            type="text"
            placeholder={t.search}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          />
        </div>

        <div className="flex gap-3 w-full md:w-auto relative">
          {/* Column Toggle Button */}
          <div className="relative">
            <button
              onClick={() => setShowColumnMenu(!showColumnMenu)}
              className="px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition flex items-center gap-2 whitespace-nowrap"
            >
              <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
              </svg>
              {t.actions.columns}
            </button>

            {showColumnMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-50 p-2 space-y-1">
                {Object.keys(visibleColumns).map((col) => (
                  <label key={col} className="flex items-center gap-2 px-3 py-2 hover:bg-slate-700 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={visibleColumns[col]}
                      onChange={() => toggleColumn(col)}
                      className="rounded bg-slate-600 border-slate-500 text-cyan-500 focus:ring-cyan-500"
                    />
                    <span className="text-sm text-white capitalize">{t.table[col as keyof typeof t.table]}</span>
                  </label>
                ))}
              </div>
            )}

            {/* Click outside to close */}
            {showColumnMenu && (
              <div className="fixed inset-0 z-40" onClick={() => setShowColumnMenu(false)} />
            )}
          </div>

          <button
            onClick={handleExportCSV}
            className="px-4 py-3 bg-green-600/20 hover:bg-green-600/30 text-green-400 border border-green-500/30 rounded-lg font-semibold transition flex items-center gap-2 whitespace-nowrap"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            {t.actions.exportCSV}
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <div className="text-slate-400 text-sm mb-1">{t.stats.totalUsers}</div>
          <div className="text-3xl font-bold text-white">{users.length}</div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <div className="text-slate-400 text-sm mb-1">{t.stats.adminUsers}</div>
          <div className="text-3xl font-bold text-purple-400">{users.filter((u) => u.is_admin).length}</div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <div className="text-slate-400 text-sm mb-1">{t.stats.totalCredits}</div>
          <div className="text-3xl font-bold text-cyan-400">{users.reduce((sum, u) => sum + u.credits, 0)}</div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <div className="text-slate-400 text-sm mb-1">{t.stats.totalOperations}</div>
          <div className="text-3xl font-bold text-green-400">{users.reduce((sum, u) => sum + u.total_generations, 0)}</div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-900/50 border-b border-slate-700">
              <tr>
                {visibleColumns.user && (
                  <th
                    className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase cursor-pointer group hover:bg-slate-800/50 transition select-none"
                    onClick={() => handleSort('full_name')}
                  >
                    <div className="flex items-center gap-2">
                      {t.table.user}
                      <SortIcon active={sortKey === 'full_name'} order={sortOrder} />
                    </div>
                  </th>
                )}
                {visibleColumns.phone && (
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase select-none">
                    {t.table.phone}
                  </th>
                )}
                {visibleColumns.role && (
                  <th
                    className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase cursor-pointer group hover:bg-slate-800/50 transition select-none"
                    onClick={() => handleSort('is_admin')}
                  >
                    <div className="flex items-center gap-2">
                      {t.table.role}
                      <SortIcon active={sortKey === 'is_admin'} order={sortOrder} />
                    </div>
                  </th>
                )}
                {visibleColumns.credits && (
                  <th
                    className="px-4 py-3 text-right text-xs font-semibold text-slate-400 uppercase cursor-pointer group hover:bg-slate-800/50 transition select-none"
                    onClick={() => handleSort('credits')}
                  >
                    <div className="flex items-center justify-end gap-2">
                      {t.table.credits}
                      <SortIcon active={sortKey === 'credits'} order={sortOrder} />
                    </div>
                  </th>
                )}
                {visibleColumns.operations && (
                  <th
                    className="px-4 py-3 text-right text-xs font-semibold text-slate-400 uppercase cursor-pointer group hover:bg-slate-800/50 transition select-none"
                    onClick={() => handleSort('total_generations')}
                  >
                    <div className="flex items-center justify-end gap-2">
                      {t.table.operations}
                      <SortIcon active={sortKey === 'total_generations'} order={sortOrder} />
                    </div>
                  </th>
                )}
                {visibleColumns.spent && (
                  <th
                    className="px-4 py-3 text-right text-xs font-semibold text-slate-400 uppercase cursor-pointer group hover:bg-slate-800/50 transition select-none"
                    onClick={() => handleSort('total_credits_used')}
                  >
                    <div className="flex items-center justify-end gap-2">
                      {t.table.spent}
                      <SortIcon active={sortKey === 'total_credits_used'} order={sortOrder} />
                    </div>
                  </th>
                )}
                {visibleColumns.lastActivity && (
                  <th
                    className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase cursor-pointer group hover:bg-slate-800/50 transition select-none"
                    onClick={() => handleSort('last_activity')}
                  >
                    <div className="flex items-center gap-2">
                      {t.table.lastActivity}
                      <SortIcon active={sortKey === 'last_activity'} order={sortOrder} />
                    </div>
                  </th>
                )}
                {visibleColumns.registrationDate && (
                  <th
                    className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase cursor-pointer group hover:bg-slate-800/50 transition select-none"
                    onClick={() => handleSort('created_at')}
                  >
                    <div className="flex items-center gap-2">
                      {t.table.registrationDate}
                      <SortIcon active={sortKey === 'created_at'} order={sortOrder} />
                    </div>
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {sortedUsers.map((user) => (
                <tr
                  key={user.id}
                  onClick={() => handleUserClick(user)}
                  className="hover:bg-slate-700/30 cursor-pointer transition"
                >
                  {visibleColumns.user && (
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-white">{user.full_name || t.table.unnamed}</div>
                      <div className="text-xs text-slate-400">{user.email}</div>
                    </td>
                  )}
                  {visibleColumns.phone && (
                    <td className="px-4 py-3 text-sm text-slate-300">
                      {user.phone_number || '-'}
                    </td>
                  )}
                  {visibleColumns.role && (
                    <td className="px-4 py-3">
                      {user.is_admin ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-400 border border-purple-500/50">
                          {t.table.admin}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-slate-700 text-slate-400">
                          {t.table.userRole}
                        </span>
                      )}
                    </td>
                  )}
                  {visibleColumns.credits && (
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm font-bold text-cyan-400">{user.credits}</span>
                    </td>
                  )}
                  {visibleColumns.operations && (
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm text-white">{user.total_generations}</span>
                    </td>
                  )}
                  {visibleColumns.spent && (
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm text-orange-400">{user.total_credits_used}</span>
                    </td>
                  )}
                  {visibleColumns.lastActivity && (
                    <td className="px-4 py-3">
                      <span className="text-xs text-slate-400">
                        {user.last_activity ? new Date(user.last_activity).toLocaleString(language === 'tr' ? 'tr-TR' : 'en-US') : t.table.never}
                      </span>
                    </td>
                  )}
                  {visibleColumns.registrationDate && (
                    <td className="px-4 py-3">
                      <span className="text-xs text-slate-400">{new Date(user.created_at).toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US')}</span>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl border border-slate-700 w-full max-w-7xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900 z-10 shrink-0">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  {selectedUser.full_name || t.modal.unnamed}
                  <span className="text-sm font-normal text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700">{selectedUser.email}</span>
                </h2>
                <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-400"></span>Harcanan: <span className="text-white font-medium">{selectedUser.total_credits_used}</span></span>
                  <span className="text-slate-700">|</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-cyan-400"></span>Mevcut: <span className="text-white font-medium">{selectedUser.credits}</span></span>
                </p>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-slate-400 hover:text-white transition p-2 hover:bg-slate-800 rounded-full"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <GenList
              t={t}
              userGenerations={userGenerations}
              generationsLoading={generationsLoading}
              generationsError={generationsError}
              showAddCredit={showAddCredit}
              setShowAddCredit={setShowAddCredit}
              creditAmount={creditAmount}
              setCreditAmount={setCreditAmount}
              handleAddCredits={handleAddCredits}
              isAddingCredit={isAddingCredit}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Sub-component for Generation List logic
const GenList = ({
  t,
  userGenerations,
  generationsLoading,
  generationsError,
  showAddCredit,
  setShowAddCredit,
  creditAmount,
  setCreditAmount,
  handleAddCredits,
  isAddingCredit
}: any) => {
  const [lightboxMedia, setLightboxMedia] = useState<{ url: string; type: 'image' | 'video' } | null>(null);
  const [filterType, setFilterType] = useState<string>('all');

  // Analytics
  const getAnalytics = (gens: any[]) => {
    const counts: Record<string, number> = {};
    gens.forEach(g => {
      counts[g.type] = (counts[g.type] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  };

  const filteredGenerations = userGenerations.filter((gen: any) =>
    filterType === 'all' || gen.type === filterType
  );

  const analytics = getAnalytics(userGenerations);

  const formatType = (type: string) => {
    const map: Record<string, string> = {
      'sketch_to_product': 'Çizim → Ürün',
      'product_to_model': 'Ürün → Model',
      'tech_sketch': 'Teknik Çizim',
      'video': 'Video',
      'pixshop': 'Pixshop',
      'fotomatik_transform': 'Fotomatik',
      'fotomatik_describe': 'Foto Analiz',
      'adgenius_campaign_image': 'AdGenius (Kampanya)',
      'adgenius_ecommerce_image': 'AdGenius (E-ticaret)',
      'collage': 'Kolaj'
    };
    return map[type] || type;
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-900/50">
      {/* Analytics & Actions Bar */}
      <div className="flex flex-col xl:flex-row gap-4">

        {/* Analytics Chart */}
        <div className="flex-1 bg-slate-800/40 rounded-xl p-4 border border-slate-700/50">
          <h4 className="text-[10px] font-bold text-slate-500 uppercase mb-3 tracking-wider">Kullanım Analizi</h4>
          <div className="flex flex-wrap gap-2">
            {analytics.length > 0 ? analytics.map(([type, count]) => (
              <div key={type} className="flex items-center gap-2 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-700/50 hover:border-cyan-500/30 transition cursor-help" title={`${count} adet ${formatType(type)} işlemi`}>
                <div className={`w-2 h-2 rounded-full ${type === 'pixshop' ? 'bg-pink-500' : type === 'video' ? 'bg-purple-500' : 'bg-cyan-500'}`}></div>
                <span className="text-xs font-medium text-slate-300">{formatType(type)}</span>
                <span className="text-xs font-bold text-white ml-1">{count}</span>
              </div>
            )) : (
              <span className="text-sm text-slate-500 italic">Analiz verisi bulunamadı</span>
            )}
          </div>
        </div>

        {/* Quick Credits */}
        <div className="w-full xl:w-auto flex-shrink-0 bg-slate-800/40 rounded-xl p-4 border border-slate-700/50 flex flex-col justify-center min-w-[300px]">
          {!showAddCredit ? (
            <button
              onClick={() => setShowAddCredit(true)}
              className="w-full h-full min-h-[40px] bg-green-600/10 hover:bg-green-600/20 text-green-400 border border-green-500/20 hover:border-green-500/40 rounded-lg font-semibold transition flex items-center justify-center gap-2 text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {t.modal.addCreditsTitle}
            </button>
          ) : (
            <div className="flex items-center gap-2 animate-fade-in">
              <input
                type="number"
                value={creditAmount}
                onChange={(e) => setCreditAmount(Number(e.target.value))}
                className="w-24 bg-slate-900 border border-slate-600 rounded-lg p-2 text-white text-sm focus:border-green-500 focus:outline-none"
                placeholder="Miktar"
                autoFocus
              />
              <button
                onClick={handleAddCredits}
                disabled={isAddingCredit}
                className="bg-green-600 hover:bg-green-500 text-white px-3 py-2 rounded-lg text-sm font-medium disabled:opacity-50 transition shadow-lg shadow-green-900/20"
              >
                {isAddingCredit ? '...' : 'Ekle'}
              </button>
              <button
                onClick={() => setShowAddCredit(false)}
                className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-2 rounded-lg text-sm transition"
              >
                İptal
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="sticky top-0 z-20 bg-slate-900/95 backdrop-blur-sm -mx-2 px-2 py-2 border-b border-slate-800">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition whitespace-nowrap border ${filterType === 'all' ? 'bg-white text-black border-white' : 'bg-transparent text-slate-400 border-slate-700 hover:border-slate-500'}`}
          >
            Tümü ({(userGenerations || []).length})
          </button>
          {analytics.map(([type, count]) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition whitespace-nowrap border flex items-center gap-2 ${filterType === type ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/50' : 'bg-transparent text-slate-400 border-slate-700 hover:border-slate-500'}`}
            >
              {formatType(type)}
              <span className="bg-slate-800 px-1.5 rounded-full text-[10px] opacity-70 border border-slate-700">{count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Generations Grid */}
      <div className="min-h-[400px]">
        {generationsLoading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-700 border-t-cyan-500"></div>
            <span className="ml-3 text-slate-400">{t.modal.loading}</span>
          </div>
        ) : filteredGenerations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-slate-500 border-2 border-dashed border-slate-800 rounded-xl bg-slate-800/20">
            <svg className="w-12 h-12 mb-2 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            <p>Bu filtrede gösterilecek kayıt yok.</p>
            {generationsError && <p className="text-orange-400 mt-2 text-sm bg-orange-900/20 px-4 py-2 rounded-lg border border-orange-500/30">{generationsError}</p>}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 pb-12">
            {filteredGenerations.map((gen: any) => (
              <div key={gen.id} className="group bg-slate-800 rounded-xl overflow-hidden border border-slate-700 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-900/10 transition-all duration-300 flex flex-col">
                {/* Thumbnail Container */}
                <div className="aspect-square relative bg-slate-900 border-b border-slate-700 overflow-hidden">
                  {/* Input Mini-thumbnail (Overlay) */}
                  {gen.input_image_url && (
                    <div
                      onClick={(e) => { e.stopPropagation(); setLightboxMedia({ url: gen.input_image_url, type: 'image' }); }}
                      className="absolute top-2 left-2 w-10 h-10 md:w-12 md:h-12 rounded-lg border border-white/20 shadow-lg z-10 cursor-pointer hover:scale-110 transition bg-black group-hover:block"
                      title="Giriş Görseli"
                    >
                      <img src={gen.input_image_url} className="w-full h-full object-cover rounded-lg opacity-90 hover:opacity-100" />
                    </div>
                  )}

                  {/* Main Output Content */}
                  {gen.output_video_url ? (
                    <video src={gen.output_video_url} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition" />
                  ) : gen.output_image_url ? (
                    <img src={gen.output_image_url} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 bg-slate-800/50 p-4 text-center">
                      <span className="text-2xl mb-1 opacity-50">🖼️</span>
                      <span className="text-[10px]">Görsel Yok</span>
                    </div>
                  )}

                  {/* Overlay Actions */}
                  {(gen.output_video_url || gen.output_image_url) && (
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                      <button
                        onClick={() => setLightboxMedia({
                          url: gen.output_video_url || gen.output_image_url || '',
                          type: gen.output_video_url ? 'video' : 'image'
                        })}
                        className="p-3 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md transition text-white border border-white/10"
                        title="Büyüt"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>
                      </button>
                    </div>
                  )}
                </div>

                {/* Card Footer */}
                <div className="p-3 flex flex-col justify-between flex-1">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[9px] font-bold uppercase text-white bg-slate-700 px-1.5 py-0.5 rounded tracking-wide truncate max-w-[70%]" title={formatType(gen.type)}>
                        {formatType(gen.type).split(' ')[0]}..
                      </span>
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${gen.credits_used > 5 ? 'text-orange-300 bg-orange-900/20' : 'text-cyan-300 bg-cyan-900/20'}`}>
                        -{gen.credits_used}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono truncate" title={new Date(gen.created_at).toLocaleString()}>
                      {new Date(gen.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {lightboxMedia && (
        <div className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 animate-fade-in cursor-zoom-out" onClick={() => setLightboxMedia(null)}>
          <button
            onClick={() => setLightboxMedia(null)}
            className="fixed top-6 right-6 p-2 text-slate-400 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition z-[70] border border-white/10 shadow-xl"
            title="Kapat (ESC)"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>

          <div className="w-full max-w-7xl max-h-screen flex flex-col items-center justify-center h-full gap-4 pointer-events-none">
            <div className="relative w-full h-full flex items-center justify-center pointer-events-auto" onClick={(e) => e.stopPropagation()}>
              {lightboxMedia.type === 'video' ? (
                <video
                  src={lightboxMedia.url}
                  controls
                  autoPlay
                  className="max-w-full max-h-[85vh] rounded shadow-2xl border border-white/10 bg-black cursor-default"
                />
              ) : (
                <img
                  src={lightboxMedia.url}
                  alt="Zoom Preview"
                  className="max-w-full max-h-[85vh] object-contain rounded shadow-2xl border border-white/10 cursor-default"
                />
              )}
            </div>

            <div className="flex gap-4 z-50 pointer-events-auto" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => {
                  const windowRef = window.open();
                  if (windowRef) {
                    if (lightboxMedia.url.startsWith('data:')) {
                      windowRef.document.write(
                        `<html><body style="margin:0;background:#111;display:flex;justify-content:center;align-items:center;height:100vh;">
                                                   ${lightboxMedia.type === 'video'
                          ? `<video src="${lightboxMedia.url}" controls style="max-width:100%;max-height:100%;" />`
                          : `<img src="${lightboxMedia.url}" style="max-width:100%;max-height:100%;object-fit:contain;" />`
                        }
                                               </body></html>`
                      );
                      windowRef.document.close();
                    } else {
                      windowRef.location = lightboxMedia.url;
                    }
                  }
                }}
                className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-full font-medium transition flex items-center gap-2 border border-slate-600 shadow-lg shadow-black/50 cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                Yeni Sekmede Aç
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
