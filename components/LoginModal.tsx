import React, { useState } from 'react';
import { XIcon } from './icons/XIcon';
import { useTranslation } from '../lib/i18n/context';
import type { TranslationRecord } from '../lib/i18n/types';

const trLogin = {
    title: 'Giriş Yap',
    autoFillHint: 'Otomatik doldurmak için tıklayın',
    adminLogin: 'Admin Girişi',
    username: 'Kullanıcı Adı',
    passwordLabel: 'Şifre',
    submitButton: 'Giriş Yap',
};

const loginTranslations: TranslationRecord<typeof trLogin> = {
    tr: trLogin,
    en: {
        title: 'Sign In',
        autoFillHint: 'Click to auto-fill',
        adminLogin: 'Admin Login',
        username: 'Username',
        passwordLabel: 'Password',
        submitButton: 'Sign In',
    },
};

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLogin: (email: string, pass: string) => void;
    onSwitchToRegister: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLogin, onSwitchToRegister }) => {
    const t = useTranslation(loginTranslations);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onLogin(email, password);
    };

    const fillAdminCreds = () => {
        setEmail('hikmet');
        setPassword('Malatya4462!');
    };

    return (
        <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
            onClick={onClose}
        >
            <div
                className="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm border border-slate-700 p-8 transform transition-all scale-100"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">{t.title}</h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
                        <XIcon />
                    </button>
                </div>

                {/* Admin Credentials Hint */}
                <div
                    className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 mb-6 text-sm cursor-pointer hover:border-cyan-500/30 transition-colors group"
                    onClick={fillAdminCreds}
                    title={t.autoFillHint}
                >
                    <p className="text-slate-400 mb-2 text-xs uppercase tracking-wider font-semibold">{t.adminLogin}</p>
                    <div className="group-hover:text-cyan-400 transition-colors">
                        <span className="text-xs text-slate-500 block">{t.username}:</span>
                        <span className="font-mono">hikmet</span>
                        <br />
                        <span className="text-xs text-slate-500 block mt-1">{t.passwordLabel}:</span>
                        <span className="font-mono text-slate-500">••••••••••</span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="font-medium text-slate-300 block mb-2">{t.username}</label>
                        <input
                            type="text"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2.5 text-white focus:ring-cyan-500 focus:border-cyan-500 transition"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="font-medium text-slate-300 block mb-2">{t.passwordLabel}</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2.5 text-white focus:ring-cyan-500 focus:border-cyan-500 transition"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full mt-4 bg-cyan-600 text-white font-bold py-3 px-6 rounded-full shadow-lg shadow-cyan-600/30 hover:bg-cyan-500 transition-all duration-300"
                    >
                        {t.submitButton}
                    </button>
                </form>
            </div>
        </div>
    );
};