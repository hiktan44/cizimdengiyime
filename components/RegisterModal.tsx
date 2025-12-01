import React, { useState } from 'react';
import { XIcon } from './icons/XIcon';

interface RegisterModalProps {
    isOpen: boolean;
    onClose: () => void;
    onRegister: (email: string, pass: string) => void;
    onSwitchToLogin: () => void;
}

export const RegisterModal: React.FC<RegisterModalProps> = ({ isOpen, onClose, onRegister, onSwitchToLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            alert("Şifreler uyuşmuyor!");
            return;
        }
        onRegister(email, password);
    };

    return (
        <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div
                className="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm border border-slate-700 p-8 transform transition-all"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">Hesap Oluştur</h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
                        <XIcon />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="reg-email" className="font-medium text-slate-300 block mb-2">E-posta</label>
                        <input
                            type="email"
                            id="reg-email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2.5 text-white focus:ring-cyan-500 focus:border-cyan-500 transition"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="reg-password" className="font-medium text-slate-300 block mb-2">Şifre</label>
                        <input
                            type="password"
                            id="reg-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2.5 text-white focus:ring-cyan-500 focus:border-cyan-500 transition"
                            required
                        />
                    </div>
                     <div>
                        <label htmlFor="reg-confirm-password" className="font-medium text-slate-300 block mb-2">Şifreyi Onayla</label>
                        <input
                            type="password"
                            id="reg-confirm-password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2.5 text-white focus:ring-cyan-500 focus:border-cyan-500 transition"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full mt-4 bg-cyan-500 text-white font-bold py-3 px-6 rounded-full shadow-lg shadow-cyan-500/30 hover:bg-cyan-600 transition-all duration-300"
                    >
                        Kayıt Ol
                    </button>
                </form>
                 <p className="text-center text-sm text-slate-400 mt-6">
                    Zaten bir hesabınız var mı?{' '}
                    <button onClick={onSwitchToLogin} className="font-medium text-cyan-400 hover:underline">
                        Giriş Yapın
                    </button>
                </p>
            </div>
        </div>
    );
};
