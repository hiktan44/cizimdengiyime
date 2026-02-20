import React, { useState } from 'react';
import { XCircleIcon } from './icons/XCircleIcon';
import { useTranslation } from '../lib/i18n/context';
import type { TranslationRecord } from '../lib/i18n/types';

const trAuth = {
  signIn: 'Giriş Yap',
  signUp: 'Hesap Oluştur',
  forgotPassword: 'Şifremi Unuttum',
  signInSuccess: 'Giriş başarılı! Yönlendiriliyorsunuz...',
  signUpSuccess: 'Hesap oluşturuldu! Lütfen e-postanızı kontrol edip doğrulama linkine tıklayın.',
  resetSuccess: 'Sıfırlama bağlantısı e-posta adresinize gönderildi.',
  googleContinue: 'Google ile Devam Et',
  or: 'veya',
  fullName: 'Ad Soyad',
  email: 'E-posta',
  password: 'Şifre',
  forgotPasswordLink: 'Şifremi unuttum?',
  success: 'Başarılı!',
  processing: 'İşleniyor...',
  sendResetLink: 'Sıfırlama Linki Gönder',
  noAccount: 'Hesabınız yok mu? Kayıt olun',
  hasAccount: 'Zaten hesabınız var mı? Giriş yapın',
  backToLogin: 'Giriş ekranına dön',
  defaultError: 'Bir hata oluştu. Lütfen tekrar deneyin.',
  corporateWarningTitle: 'Kurumsal Ağ / Güvenlik Uyarısı',
  corporateWarningDesc: 'Şirket ağı veya VPN üzerinden bağlanıyorsanız, güvenlik duvarınız bu işlemi (özellikle Google ile bağlantılarda) yanlışlıkla "Phishing (Oltalama)" olarak algılayıp engelleyebilir.',
  corporateWarningSolutionLabel: 'Çözüm:',
  corporateWarningSolution: 'Tarayıcı uyarısında "Güvenli olarak devam et" seçeneğini kullanın veya işlemi kişisel ağınızdan (Mobil Veri vs.) yapmayı deneyin.',
};

const authTranslations: TranslationRecord<typeof trAuth> = {
  tr: trAuth,
  en: {
    signIn: 'Sign In',
    signUp: 'Create Account',
    forgotPassword: 'Forgot Password',
    signInSuccess: 'Login successful! Redirecting...',
    signUpSuccess: 'Account created! Please check your email and click the verification link.',
    resetSuccess: 'Reset link has been sent to your email address.',
    googleContinue: 'Continue with Google',
    or: 'or',
    fullName: 'Full Name',
    email: 'Email',
    password: 'Password',
    forgotPasswordLink: 'Forgot password?',
    success: 'Success!',
    processing: 'Processing...',
    sendResetLink: 'Send Reset Link',
    noAccount: "Don't have an account? Sign up",
    hasAccount: 'Already have an account? Sign in',
    backToLogin: 'Back to login',
    defaultError: 'An error occurred. Please try again.',
    corporateWarningTitle: 'Corporate Network / Security Warning',
    corporateWarningDesc: 'If you are connecting from a corporate network or VPN, your firewall might mistakenly detect this action (especially Google connections) as "Phishing" and block it.',
    corporateWarningSolutionLabel: 'Solution:',
    corporateWarningSolution: 'Use the "Continue to site" option on the browser warning, or try connecting from your personal network (Mobile Data).',
  },
};

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoogleSignIn: () => void;
  onEmailSignIn: (email: string, password: string) => Promise<void>;
  onEmailSignUp: (email: string, password: string, fullName: string) => Promise<void>;
  onForgotPassword: (email: string) => Promise<any>;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onGoogleSignIn,
  onEmailSignIn,
  onEmailSignUp,
  onForgotPassword,
}) => {
  const t = useTranslation(authTranslations);
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot-password'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      if (mode === 'signin') {
        await onEmailSignIn(email, password);
      } else if (mode === 'signup') {
        await onEmailSignUp(email, password, fullName);
      } else if (mode === 'forgot-password') {
        await onForgotPassword(email);
      }

      setSuccess(true);

      setTimeout(() => {
        onClose();
        setTimeout(() => {
          setSuccess(false);
          setEmail('');
          setPassword('');
          setFullName('');
        }, 300);
      }, 5000);
    } catch (err: any) {
      setError(err.message || t.defaultError);
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
          {mode === 'signin' ? t.signIn : mode === 'signup' ? t.signUp : t.forgotPassword}
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
            {mode === 'signin'
              ? t.signInSuccess
              : mode === 'signup'
                ? t.signUpSuccess
                : t.resetSuccess}
          </div>
        )}

        {/* Social Login - Hide in forgot password mode */}
        {mode !== 'forgot-password' && (
          <>
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 sm:p-4 mb-6">
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div className="text-xs sm:text-sm text-amber-200/90 leading-relaxed">
                  <p className="font-semibold text-amber-500 mb-1">{t.corporateWarningTitle}</p>
                  <p className="mb-2">{t.corporateWarningDesc}</p>
                  <p className="text-amber-400">
                    <span className="font-semibold text-white">{t.corporateWarningSolutionLabel}</span> {t.corporateWarningSolution}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <button
                onClick={onGoogleSignIn}
                className="w-full flex items-center justify-center gap-3 bg-white text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                {t.googleContinue}
              </button>
            </div>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-slate-900 text-slate-400">{t.or}</span>
              </div>
            </div>
          </>
        )}

        {/* Email Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                {t.fullName}
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              {t.email}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              required
            />
          </div>

          {mode !== 'forgot-password' && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-slate-300">
                  {t.password}
                </label>
                {mode === 'signin' && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot-password');
                      setError('');
                      setSuccess(false);
                    }}
                    className="text-xs text-cyan-400 hover:text-cyan-300 transition"
                  >
                    {t.forgotPasswordLink}
                  </button>
                )}
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                required
                minLength={6}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading || success}
            className={`w-full px-6 py-3 rounded-lg font-semibold transition disabled:cursor-not-allowed ${success
              ? 'bg-green-600 text-white'
              : 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50'
              }`}
          >
            {success ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {t.success}
              </span>
            ) : loading ? (
              t.processing
            ) : mode === 'signin' ? (
              t.signIn
            ) : mode === 'signup' ? (
              t.signUp
            ) : (
              t.sendResetLink
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              if (mode === 'forgot-password') {
                setMode('signin');
              } else {
                setMode(mode === 'signin' ? 'signup' : 'signin');
              }
              setError('');
              setSuccess(false);
            }}
            className="text-sm text-slate-400 hover:text-cyan-400 transition"
          >
            {mode === 'signin'
              ? t.noAccount
              : mode === 'signup'
                ? t.hasAccount
                : t.backToLogin}
          </button>
        </div>
      </div>
    </div>
  );
};
