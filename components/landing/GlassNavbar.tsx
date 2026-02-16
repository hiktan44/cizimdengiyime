import React, { useState, useEffect } from 'react';

interface GlassNavbarProps {
    isLoggedIn?: boolean;
    userName?: string | null;
    userRole?: 'admin' | 'user' | null;
    credits?: number;
    onSignIn: () => void;
    onGetStarted: () => void;
    onLogout?: () => void;
    onAdminClick?: () => void;
    onNavigate?: (page: string) => void;
    onBuyCreditsClick?: () => void;
    t: any;
}

export const GlassNavbar: React.FC<GlassNavbarProps> = ({
    isLoggedIn, userName, userRole, credits,
    onSignIn, onGetStarted, onLogout, onAdminClick, onNavigate, onBuyCreditsClick, t
}) => {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { label: t?.features?.title || 'Features', action: () => onNavigate?.('features') },
        { label: t?.pricing?.title || 'Pricing', action: () => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' }) },
        { label: 'Blog', action: () => onNavigate?.('blog') },
    ];

    return (
        <nav className={`glass-navbar fixed top-0 left-0 right-0 z-50 ${scrolled ? 'scrolled' : ''}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <button
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        className="flex items-center gap-2 bg-transparent border-none cursor-pointer p-0"
                    >
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                            <span className="text-white font-bold text-sm">F</span>
                        </div>
                        <span className="text-white font-bold text-lg tracking-tight">Fasheone AI</span>
                    </button>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-6">
                        {navLinks.map((link, i) => (
                            <button
                                key={i}
                                onClick={link.action}
                                className="text-sm text-white/60 hover:text-white transition-colors bg-transparent border-none cursor-pointer p-0 font-medium"
                            >
                                {link.label}
                            </button>
                        ))}
                    </div>

                    {/* Desktop Actions */}
                    <div className="hidden md:flex items-center gap-3">
                        {isLoggedIn ? (
                            <>
                                {credits !== undefined && (
                                    <button
                                        onClick={onBuyCreditsClick}
                                        className="text-xs px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                                    >
                                        💎 {credits}
                                    </button>
                                )}
                                {userRole === 'admin' && onAdminClick && (
                                    <button
                                        onClick={onAdminClick}
                                        className="text-xs px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                                    >
                                        ⚙️ Admin
                                    </button>
                                )}
                                <button
                                    onClick={onGetStarted}
                                    className="btn-primary text-sm !py-2 !px-4"
                                >
                                    <span>{t?.header?.continueUsing || 'Continue'}</span>
                                </button>
                                <button
                                    onClick={onLogout}
                                    className="text-xs text-white/40 hover:text-white/80 transition-colors bg-transparent border-none cursor-pointer p-0"
                                >
                                    {t?.header?.signOut || 'Sign Out'}
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={onSignIn}
                                    className="text-sm text-white/70 hover:text-white transition-colors bg-transparent border-none cursor-pointer px-3 py-1.5 font-medium"
                                >
                                    {t?.header?.signIn || 'Sign In'}
                                </button>
                                <button onClick={onGetStarted} className="btn-primary text-sm !py-2 !px-4">
                                    <span>{t?.header?.start || 'Get Started'}</span>
                                </button>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="md:hidden text-white bg-transparent border-none cursor-pointer p-2"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {mobileOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>

                {/* Mobile Menu */}
                {mobileOpen && (
                    <div className="md:hidden py-4 space-y-3 border-t border-white/5 animate-fadeIn">
                        {navLinks.map((link, i) => (
                            <button
                                key={i}
                                onClick={() => { link.action(); setMobileOpen(false); }}
                                className="block w-full text-left text-sm text-white/70 hover:text-white py-2 bg-transparent border-none cursor-pointer font-medium"
                            >
                                {link.label}
                            </button>
                        ))}
                        <div className="pt-3 border-t border-white/5 space-y-2">
                            {isLoggedIn ? (
                                <>
                                    <button onClick={onGetStarted} className="btn-primary w-full text-sm !py-2">
                                        <span>{t?.header?.continueUsing || 'Continue'}</span>
                                    </button>
                                    {userRole === 'admin' && onAdminClick && (
                                        <button onClick={onAdminClick} className="w-full text-left text-sm text-white/50 py-2 bg-transparent border-none cursor-pointer">
                                            ⚙️ Admin Panel
                                        </button>
                                    )}
                                    <button onClick={onLogout} className="w-full text-left text-sm text-white/40 py-2 bg-transparent border-none cursor-pointer">
                                        {t?.header?.signOut || 'Sign Out'}
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button onClick={onSignIn} className="w-full text-left text-sm text-white/70 py-2 bg-transparent border-none cursor-pointer font-medium">
                                        {t?.header?.signIn || 'Sign In'}
                                    </button>
                                    <button onClick={onGetStarted} className="btn-primary w-full text-sm !py-2">
                                        <span>{t?.header?.start || 'Get Started'}</span>
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};
