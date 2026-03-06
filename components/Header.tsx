
import React, { useState, useRef, useEffect } from 'react';
import { Logo } from './Logo';
import { useI18n, TranslationRecord } from '../lib/i18n';

// Header translations
const trHeader = {
    home: 'Ana Sayfa',
    features: 'Özellikler',
    blog: 'Blog',
    credits: 'Kredi',
    buyCredits: 'Kredi Al',
    history: 'Geçmiş',
    pastWorks: 'Geçmiş Çalışmalar',
    signIn: 'Giriş Yap',
    signOut: 'Çıkış Yap',
    menu: 'Menü',
    adminPanel: 'Admin Panel',
    affiliateProgram: 'Affiliate Programı',
    account: 'Hesap',
    tools: 'Araçlar',
};

const headerTranslations: TranslationRecord<typeof trHeader> = {
    tr: trHeader,
    en: {
        home: 'Home',
        features: 'Features',
        blog: 'Blog',
        credits: 'Credits',
        buyCredits: 'Buy Credits',
        history: 'History',
        pastWorks: 'Past Works',
        signIn: 'Sign In',
        signOut: 'Sign Out',
        menu: 'Menu',
        adminPanel: 'Admin Panel',
        affiliateProgram: 'Affiliate Program',
        account: 'Account',
        tools: 'Tools',
    },
};

interface HeaderProps {
    onHomeClick?: () => void;
    onFeaturesClick?: () => void;
    onBlogClick?: () => void;
    onToolTabClick?: (tab: 'design' | 'technical' | 'pixshop' | 'fotomatik' | 'adgenius') => void;
    onNavigateHome?: () => void;
    isLoggedIn: boolean;
    userRole: 'admin' | 'user' | null;
    userName?: string | null;
    onLoginClick: () => void;
    onLogoutClick: () => void;
    onAdminClick?: () => void;
    onAffiliateClick?: () => void;
    onBuyCreditsClick?: () => void;
    onHistoryClick?: () => void;
    credits?: number;
    theme?: 'light' | 'dark';
    activeToolTab?: 'design' | 'technical' | 'pixshop' | 'fotomatik' | 'adgenius';
}

export const Header: React.FC<HeaderProps> = ({
    onHomeClick,
    onFeaturesClick,
    onBlogClick,
    isLoggedIn,
    userRole,
    userName,
    onLoginClick,
    onLogoutClick,
    onAdminClick,
    onAffiliateClick,
    onBuyCreditsClick,
    onHistoryClick,
    credits,
    theme = 'dark',
    onToolTabClick,
    activeToolTab
}) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const accountDropdownRef = useRef<HTMLDivElement>(null);
    const { t, language, setLanguage } = useI18n();
    const ht = t(headerTranslations);

    // Close menus when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMobileMenuOpen(false);
            }
            if (accountDropdownRef.current && !accountDropdownRef.current.contains(event.target as Node)) {
                setIsAccountDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleMenuItemClick = (action: () => void) => {
        setIsMobileMenuOpen(false);
        setIsAccountDropdownOpen(false);
        action();
    };

    return (
        <header className="sticky top-0 bg-slate-900/95 backdrop-blur-md z-[100] border-b border-slate-800 shadow-xl w-full safe-area-inset-top">
            <nav className="w-full max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 py-2.5 sm:py-3">
                {/* Logo - tıklayınca ana sayfaya */}
                <div className="flex items-center gap-3 sm:gap-4">
                    <div
                        className="cursor-pointer hover:opacity-90 transition-all duration-300 hover:scale-105 active:scale-95"
                        onClick={onHomeClick}
                        title={ht.home}
                    >
                        <Logo className="h-10 sm:h-12 md:h-14" theme={theme} />
                    </div>
                </div>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center gap-2 lg:gap-3">
                    {/* Landing page menüleri (giriş yapılmamışsa) */}
                    {!isLoggedIn && (
                        <>
                            {onFeaturesClick && (
                                <button
                                    onClick={onFeaturesClick}
                                    className="text-sm font-medium text-slate-300 hover:text-cyan-400 transition-colors px-2 py-1"
                                >
                                    {ht.features}
                                </button>
                            )}
                            {onBlogClick && (
                                <button
                                    onClick={onBlogClick}
                                    className="text-sm font-medium text-slate-300 hover:text-cyan-400 transition-colors px-2 py-1"
                                >
                                    {ht.blog}
                                </button>
                            )}
                        </>
                    )}

                    {/* Credits Badge & Buy Button - Giriş yapmışsa */}
                    {isLoggedIn && credits !== undefined && (
                        <>
                            <div className="bg-gradient-to-r from-cyan-600/20 to-blue-600/20 border border-cyan-500/40 rounded-full px-3 py-1.5 flex items-center gap-1.5">
                                <svg className="w-3.5 h-3.5 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                                </svg>
                                <span className="text-sm font-bold text-white">{credits}</span>
                            </div>
                            {onBuyCreditsClick && (
                                <button
                                    onClick={onBuyCreditsClick}
                                    className="flex items-center gap-1.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white px-3 py-1.5 rounded-full text-xs font-semibold transition-all shadow-lg"
                                >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    {ht.buyCredits}
                                </button>
                            )}
                        </>
                    )}

                    {/* Language Toggle - TR / EN */}
                    <div className="flex items-center bg-slate-800/60 border border-slate-700 rounded-full p-0.5">
                        <button
                            onClick={() => setLanguage('tr')}
                            className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all ${language === 'tr'
                                ? 'bg-cyan-600 text-white shadow-sm'
                                : 'text-slate-400 hover:text-white'
                                }`}
                        >
                            TR
                        </button>
                        <button
                            onClick={() => setLanguage('en')}
                            className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all ${language === 'en'
                                ? 'bg-cyan-600 text-white shadow-sm'
                                : 'text-slate-400 hover:text-white'
                                }`}
                        >
                            EN
                        </button>
                    </div>

                    {/* Login Button (giriş yapılmamışsa) */}
                    {!isLoggedIn && (
                        <button
                            onClick={onLoginClick}
                            className="text-sm font-medium bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-500 transition-all shadow-lg shadow-cyan-900/20"
                        >
                            {ht.signIn}
                        </button>
                    )}

                    {/* Account Dropdown (giriş yapılmışsa) */}
                    {isLoggedIn && (
                        <div className="relative" ref={accountDropdownRef}>
                            <button
                                onClick={() => setIsAccountDropdownOpen(!isAccountDropdownOpen)}
                                className="flex items-center gap-2 bg-slate-800/60 border border-slate-700 hover:border-slate-600 rounded-full px-3 py-1.5 transition-all"
                            >
                                <div className="w-7 h-7 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
                                    <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                {userName && (
                                    <span className="text-sm font-medium text-white max-w-[100px] truncate hidden lg:inline">{userName}</span>
                                )}
                                <svg
                                    className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isAccountDropdownOpen ? 'rotate-180' : ''}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {/* Account Dropdown */}
                            {isAccountDropdownOpen && (
                                <div className="absolute right-0 top-full mt-2 w-56 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50">
                                    {/* User Info */}
                                    {userName && (
                                        <div className="px-4 py-3 bg-slate-800/50 border-b border-slate-700">
                                            <div className="text-sm font-semibold text-white truncate">{userName}</div>
                                            <div className="text-xs text-slate-400">{credits} {ht.credits}</div>
                                        </div>
                                    )}

                                    <div className="py-1">
                                        {/* History */}
                                        {onHistoryClick && (
                                            <button
                                                onClick={() => handleMenuItemClick(onHistoryClick)}
                                                className="w-full px-4 py-2.5 flex items-center gap-3 text-left hover:bg-slate-800 transition-colors text-sm text-slate-300 hover:text-white"
                                            >
                                                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                {ht.pastWorks}
                                            </button>
                                        )}

                                        {/* Affiliate Program */}
                                        {onAffiliateClick && (
                                            <button
                                                onClick={() => handleMenuItemClick(onAffiliateClick)}
                                                className="w-full px-4 py-2.5 flex items-center gap-3 text-left hover:bg-slate-800 transition-colors text-sm text-slate-300 hover:text-white"
                                            >
                                                <span className="text-sm w-4 text-center">🤝</span>
                                                {ht.affiliateProgram}
                                            </button>
                                        )}

                                        {/* Admin Panel */}
                                        {userRole === 'admin' && onAdminClick && (
                                            <button
                                                onClick={() => handleMenuItemClick(onAdminClick)}
                                                className="w-full px-4 py-2.5 flex items-center gap-3 text-left hover:bg-slate-800 transition-colors text-sm text-purple-400 hover:text-purple-300"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                {ht.adminPanel}
                                            </button>
                                        )}

                                        {/* Divider */}
                                        <div className="my-1 border-t border-slate-700"></div>

                                        {/* Logout */}
                                        <button
                                            onClick={() => handleMenuItemClick(onLogoutClick)}
                                            className="w-full px-4 py-2.5 flex items-center gap-3 text-left hover:bg-red-500/10 transition-colors text-sm text-red-400 hover:text-red-300"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                            </svg>
                                            {ht.signOut}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Mobile Menu */}
                <div className="flex md:hidden items-center gap-2" ref={menuRef}>
                    {/* Credits Badge - Mobilde her zaman görünür */}
                    {isLoggedIn && credits !== undefined && (
                        <div className="bg-gradient-to-r from-cyan-600/20 to-blue-600/20 border border-cyan-500/40 rounded-full px-2 py-1 flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                            </svg>
                            <span className="text-xs font-bold text-white">{credits}</span>
                        </div>
                    )}

                    {/* Language Toggle - Mobile */}
                    <div className="flex items-center bg-slate-800/60 border border-slate-700 rounded-full p-0.5">
                        <button
                            onClick={() => setLanguage('tr')}
                            className={`px-2 py-1 rounded-full text-xs font-bold transition-all ${language === 'tr'
                                ? 'bg-cyan-600 text-white'
                                : 'text-slate-400'
                                }`}
                        >
                            TR
                        </button>
                        <button
                            onClick={() => setLanguage('en')}
                            className={`px-2 py-1 rounded-full text-xs font-bold transition-all ${language === 'en'
                                ? 'bg-cyan-600 text-white'
                                : 'text-slate-400'
                                }`}
                        >
                            EN
                        </button>
                    </div>

                    {/* Login Button (giriş yapılmamışsa) */}
                    {!isLoggedIn && (
                        <button
                            onClick={onLoginClick}
                            className="text-xs font-medium bg-cyan-600 text-white px-3 py-2 rounded-lg hover:bg-cyan-500 transition-all shadow-lg shadow-cyan-900/20 active:scale-95"
                        >
                            {ht.signIn}
                        </button>
                    )}

                    {/* Hamburger Menu Button */}
                    {isLoggedIn && (
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-white hover:bg-slate-700 transition-all active:scale-95"
                            aria-label={ht.menu}
                        >
                            {isMobileMenuOpen ? (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            )}
                        </button>
                    )}

                    {/* Mobile Dropdown Menu */}
                    {isMobileMenuOpen && isLoggedIn && (
                        <div className="absolute top-full right-2 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50">
                            {/* User Info */}
                            {userName && (
                                <div className="px-4 py-3 bg-slate-800/50 border-b border-slate-700">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
                                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div>
                                            <div className="text-sm font-semibold text-white">{userName}</div>
                                            <div className="text-xs text-slate-400">{credits} {ht.credits}</div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="py-1.5">
                                {/* Buy Credits */}
                                {onBuyCreditsClick && (
                                    <button
                                        onClick={() => handleMenuItemClick(onBuyCreditsClick)}
                                        className="w-full px-4 py-2.5 flex items-center gap-3 text-left hover:bg-slate-800 transition-colors active:scale-95"
                                    >
                                        <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                        <span className="text-sm font-medium text-green-400">{ht.buyCredits}</span>
                                    </button>
                                )}

                                {/* History */}
                                {onHistoryClick && (
                                    <button
                                        onClick={() => handleMenuItemClick(onHistoryClick)}
                                        className="w-full px-4 py-2.5 flex items-center gap-3 text-left hover:bg-slate-800 transition-colors active:scale-95"
                                    >
                                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span className="text-sm font-medium text-white">{ht.pastWorks}</span>
                                    </button>
                                )}

                                {/* Affiliate Program */}
                                {onAffiliateClick && (
                                    <button
                                        onClick={() => handleMenuItemClick(onAffiliateClick)}
                                        className="w-full px-4 py-2.5 flex items-center gap-3 text-left hover:bg-slate-800 transition-colors active:scale-95"
                                    >
                                        <span className="text-sm w-4 text-center">🤝</span>
                                        <span className="text-sm font-medium text-white">{ht.affiliateProgram}</span>
                                    </button>
                                )}

                                {/* Admin Panel */}
                                {userRole === 'admin' && onAdminClick && (
                                    <button
                                        onClick={() => handleMenuItemClick(onAdminClick)}
                                        className="w-full px-4 py-2.5 flex items-center gap-3 text-left hover:bg-slate-800 transition-colors active:scale-95"
                                    >
                                        <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <span className="text-sm font-medium text-purple-400">{ht.adminPanel}</span>
                                    </button>
                                )}

                                {/* Divider */}
                                <div className="my-1.5 border-t border-slate-700"></div>

                                {/* Logout */}
                                <button
                                    onClick={() => handleMenuItemClick(onLogoutClick)}
                                    className="w-full px-4 py-2.5 flex items-center gap-3 text-left hover:bg-red-500/10 transition-colors active:scale-95"
                                >
                                    <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                    <span className="text-sm font-medium text-red-400">{ht.signOut}</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </nav>
        </header>
    );
};
