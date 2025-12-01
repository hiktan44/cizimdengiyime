
import React from 'react';
import { Logo } from './Logo';

interface HeaderProps {
  onHomeClick?: () => void;
  isLoggedIn: boolean;
  userRole: 'admin' | 'user' | null;
  onLoginClick: () => void;
  onLogoutClick: () => void;
  onAdminClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
    onHomeClick, 
    isLoggedIn, 
    userRole, 
    onLoginClick, 
    onLogoutClick, 
    onAdminClick 
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
            
            {onAdminClick && (
                <button 
                    onClick={userRole === 'admin' ? onAdminClick : onLoginClick}
                    className={`text-xs md:text-sm font-medium px-3 py-1.5 rounded-full border transition-all ${
                        userRole === 'admin' 
                            ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/50 hover:bg-cyan-500/20' 
                            : 'text-slate-500 border-slate-700 hover:border-slate-500 hover:text-slate-300'
                    }`}
                >
                    {userRole === 'admin' ? 'Admin Paneli' : 'Admin'}
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
                    <span className="text-sm font-medium text-slate-400 hidden md:inline-block">
                        {userRole === 'admin' ? 'Yönetici' : 'Üye'}
                    </span>
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
