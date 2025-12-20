
import React, { useState, useRef, useEffect } from 'react';
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
  theme?: 'light' | 'dark';
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
    credits,
    theme = 'dark'
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMenuItemClick = (action: () => void) => {
    setIsMobileMenuOpen(false);
    action();
  };

  return (
    <header className="sticky top-0 bg-slate-900/95 backdrop-blur-md z-[100] border-b border-slate-800 shadow-xl w-full">
      <nav className="w-full max-w-7xl mx-auto flex items-center justify-between p-4 px-6">
        <div className="flex items-center gap-4">
          <div 
            className="cursor-pointer hover:opacity-90 transition-opacity"
            onClick={onHomeClick}
          >
            <Logo className="h-[100px] md:h-[120px]" theme={theme} />
          </div>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-3 md:gap-4">
            
            {/* User Name Badge */}
            {isLoggedIn && userName && (
                <div className="flex items-center gap-2 bg-slate-800/50 border border-slate-700 rounded-full px-4 py-1.5">
                    <svg className="w-4 h-4 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium text-white">{userName}</span>
                </div>
            )}

            {/* Credits Badge & Buy Button */}
            {isLoggedIn && credits !== undefined && (
                <>
                    <div className="bg-gradient-to-r from-cyan-600/20 to-blue-600/20 border border-cyan-500/50 rounded-full px-4 py-1.5 flex items-center gap-2">
                        <svg className="w-4 h-4 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"/>
                        </svg>
                        <span className="text-sm font-bold text-white">{credits}</span>
                        <span className="text-xs text-slate-300">Kredi</span>
                    </div>
                    {onBuyCreditsClick && (
                        <button
                            onClick={onBuyCreditsClick}
                            className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white px-4 py-1.5 rounded-full text-xs font-semibold transition-all shadow-lg"
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
                    className="text-sm font-medium px-3 py-1.5 rounded-full border bg-purple-500/10 text-purple-400 border-purple-500/50 hover:bg-purple-500/20 transition-all"
                >
                    ⚙️ Admin Panel
                </button>
            )}

            {onHomeClick && (
                <button 
                    onClick={onHomeClick}
                    className="text-sm font-medium text-slate-300 hover:text-cyan-400 transition-colors"
                >
                    Ana Sayfa
                </button>
            )}
            
            {isLoggedIn ? (
                <button 
                    onClick={onLogoutClick}
                    className="text-sm font-medium text-red-400 hover:text-red-300 transition-colors"
                >
                    Çıkış
                </button>
            ) : (
                <button 
                    onClick={onLoginClick}
                    className="text-sm font-medium bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-500 transition-colors shadow-lg shadow-cyan-900/20"
                >
                    Giriş Yap
                </button>
            )}
        </div>

        {/* Mobile Menu */}
        <div className="flex md:hidden items-center gap-3" ref={menuRef}>
            {/* Credits Badge - Always visible on mobile */}
            {isLoggedIn && credits !== undefined && (
                <div className="bg-gradient-to-r from-cyan-600/20 to-blue-600/20 border border-cyan-500/50 rounded-full px-3 py-1.5 flex items-center gap-2">
                    <svg className="w-4 h-4 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"/>
                    </svg>
                    <span className="text-sm font-bold text-white">{credits}</span>
                </div>
            )}

            {/* Login Button for non-logged in users on mobile */}
            {!isLoggedIn && (
                <button 
                    onClick={onLoginClick}
                    className="text-sm font-medium bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-500 transition-colors shadow-lg shadow-cyan-900/20"
                >
                    Giriş Yap
                </button>
            )}

            {/* Hamburger Menu Button */}
            {isLoggedIn && (
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-white hover:bg-slate-700 transition-colors"
                    aria-label="Menü"
                >
                    {isMobileMenuOpen ? (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    ) : (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    )}
                </button>
            )}

            {/* Mobile Dropdown Menu */}
            {isMobileMenuOpen && isLoggedIn && (
                <div className="absolute top-full right-4 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50 animate-fade-in">
                    {/* User Info */}
                    {userName && (
                        <div className="px-4 py-3 bg-slate-800/50 border-b border-slate-700">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div>
                                    <div className="text-sm font-semibold text-white">{userName}</div>
                                    <div className="text-xs text-slate-400">{credits} Kredi</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Menu Items */}
                    <div className="py-2">
                        {/* Buy Credits */}
                        {onBuyCreditsClick && (
                            <button
                                onClick={() => handleMenuItemClick(onBuyCreditsClick)}
                                className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-slate-800 transition-colors"
                            >
                                <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                                    <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                </div>
                                <span className="text-sm font-medium text-white">Kredi Al</span>
                            </button>
                        )}

                        {/* Admin Panel */}
                        {userRole === 'admin' && onAdminClick && (
                            <button
                                onClick={() => handleMenuItemClick(onAdminClick)}
                                className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-slate-800 transition-colors"
                            >
                                <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                                    <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <span className="text-sm font-medium text-white">Admin Panel</span>
                            </button>
                        )}

                        {/* Home */}
                        {onHomeClick && (
                            <button
                                onClick={() => handleMenuItemClick(onHomeClick)}
                                className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-slate-800 transition-colors"
                            >
                                <div className="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                                    <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                    </svg>
                                </div>
                                <span className="text-sm font-medium text-white">Ana Sayfa</span>
                            </button>
                        )}

                        {/* Divider */}
                        <div className="my-2 border-t border-slate-700"></div>

                        {/* Logout */}
                        <button
                            onClick={() => handleMenuItemClick(onLogoutClick)}
                            className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-red-500/10 transition-colors"
                        >
                            <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
                                <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                            </div>
                            <span className="text-sm font-medium text-red-400">Çıkış Yap</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
      </nav>
    </header>
  );
};
