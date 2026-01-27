import React, { useState } from 'react';
import { XCircleIcon } from './icons/XCircleIcon';

interface PasswordUpdateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpdatePassword: (password: string) => Promise<void>;
}

export const PasswordUpdateModal: React.FC<PasswordUpdateModalProps> = ({
    isOpen,
    onClose,
    onUpdatePassword
}) => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess(false);

        if (password.length < 6) {
            setError('Şifre en az 6 karakter olmalıdır.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Şifreler eşleşmiyor.');
            return;
        }

        setLoading(true);

        try {
            await onUpdatePassword(password);
            setSuccess(true);
            setTimeout(() => {
                onClose();
                // Clear state
                setPassword('');
                setConfirmPassword('');
                setSuccess(false);
            }, 2000);
        } catch (err: any) {
            setError(err.message || 'Şifre güncellenirken bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
            <div className="bg-slate-900 rounded-2xl border border-slate-700 max-w-md w-full p-8 relative animate-fade-in">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-white transition"
                >
                    <XCircleIcon />
                </button>

                <h2 className="text-2xl font-bold text-white mb-6">
                    Yeni Şifre Belirle
                </h2>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg mb-4 text-sm flex items-start gap-2">
                        <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{error}</span>
                    </div>
                )}

                {success && (
                    <div className="bg-green-500/10 border border-green-500/50 text-green-400 px-4 py-3 rounded-lg mb-4 text-sm flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Şifreniz başarıyla güncellendi!
                    </div>
                )}

                <p className="text-slate-400 mb-6 text-sm">
                    Lütfen hesabınız için yeni bir şifre belirleyin.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Yeni Şifre
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                            required
                            minLength={6}
                            placeholder="En az 6 karakter"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Şifre (Tekrar)
                        </label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                            required
                            minLength={6}
                            placeholder="Şifrenizi tekrar girin"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading || success}
                        className={`w-full px-6 py-3 rounded-lg font-semibold transition disabled:cursor-not-allowed ${success
                            ? 'bg-green-600 text-white'
                            : 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50'
                            }`}
                    >
                        {success ? 'Güncellendi!' : loading ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
                    </button>
                </form>
            </div>
        </div>
    );
};
