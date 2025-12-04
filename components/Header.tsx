
import React from 'react';
import { Logo } from './Logo';

interface HeaderProps {
  onHomeClick?: () => void;
  isLoggedIn: boolean;
  userRole: 'admin' | 'user' | null;
  userName?: string | null;
  onLoginClick: () => void;
  onLogoutClick: () => void;
  onAdminClick?: () => void;
  onBuyCreditsClick?: () => void;
  credits?: number;
}

export const Header: React.FC<HeaderProps> = ({ 
    onHomeClick, 
    isLoggedIn, 
    userRole,
    userName, 
    onLoginClick, 
    onLogoutClick, 
    onAdminClick,
    onBuyCreditsClick,
    credits
}) => {
  return (
    <header className="sticky top-0 bg-slate-900/80 backdrop-blur-sm z-50 border-b border-slate-800">
      <nav className="container mx-auto flex items-center justify-between p-4">
        <div className="flex items-center gap-4">
          <div 
            className="cursor-pointer hover:opacity-90 transition-opacity"
            onClick={onHomeClick}
          >
            <Logo className="h-10 md:h-12" />
          </div>
        </div>
        <div className="flex items-center gap-3 md:gap-4">
            
            {/* User Name Badge */}
            {isLoggedIn && userName && (
                <div className="hidden sm:flex items-center gap-2 bg-slate-800/50 border border-slate-700 rounded-full px-4 py-1.5">
                    <svg className="w-4 h-4 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium text-white">{userName}</span>
                </div>
            )}

            {/* Credits Badge & Buy Button */}
            {isLoggedIn && credits !== undefined && (
                <>
                    <div className="bg-gradient-to-r from-cyan-600/20 to-blue-600/20 border border-cyan-500/50 rounded-full px-3 sm:px-4 py-1.5 flex items-center gap-2">
                        <svg className="w-4 h-4 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"/>
                        </svg>
                        <span className="text-sm font-bold text-white">{credits}</span>
                        <span className="text-xs text-slate-400 hidden sm:inline">Kredi</span>
                    </div>
                    {onBuyCreditsClick && (
                        <button
                            onClick={onBuyCreditsClick}
                            className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white px-4 py-1.5 rounded-full text-xs font-semibold transition-all shadow-lg"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Kredi Al
                        </button>
                    )}
                </>
            )}
            
            {/* Admin Panel Button - Only shown if user is admin */}
            {userRole === 'admin' && onAdminClick && (
                <button 
                    onClick={onAdminClick}
                    className="text-xs md:text-sm font-medium px-3 py-1.5 rounded-full border bg-purple-500/10 text-purple-400 border-purple-500/50 hover:bg-purple-500/20 transition-all"
                >
                    ⚙️ Admin Panel
                </button>
            )}

            {onHomeClick && (
                <button 
                    onClick={onHomeClick}
                    className="text-sm font-medium text-slate-300 hover:text-cyan-400 transition-colors hidden md:block"
                >
                    Ana Sayfa
                </button>
            )}
            
            {isLoggedIn ? (
                <>
                    <button 
                        onClick={onLogoutClick}
                        className="text-sm font-medium text-red-400 hover:text-red-300 transition-colors"
                    >
                        Çıkış
                    </button>
                </>
            ) : (
                <button 
                    onClick={onLoginClick}
                    className="text-sm font-medium bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-500 transition-colors shadow-lg shadow-cyan-900/20"
                >
                    Giriş Yap
                </button>
            )}
        </div>
      </nav>
    </header>
  );
};
