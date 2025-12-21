import React from 'react';

interface WhatsAppPanelProps {
  phoneNumber?: string;
  message?: string;
  title?: string;
  subtitle?: string;
}

const sanitizePhoneNumber = (phoneNumber?: string) => {
  if (!phoneNumber) return '';
  return phoneNumber.replace(/[^\d]/g, '');
};

const buildWhatsAppUrl = (phoneNumber?: string, message?: string) => {
  const sanitized = sanitizePhoneNumber(phoneNumber);
  if (!sanitized) return '';
  const text = message ? `?text=${encodeURIComponent(message)}` : '';
  return `https://wa.me/${sanitized}${text}`;
};

export const WhatsAppPanel: React.FC<WhatsAppPanelProps> = ({
  phoneNumber,
  message,
  title = 'WhatsApp',
  subtitle = 'Mesaj Gonder',
}) => {
  const url = buildWhatsAppUrl(phoneNumber, message);

  if (!url) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[120] sm:bottom-6 sm:right-6">
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="group flex items-center gap-3 rounded-2xl border border-emerald-200/70 bg-white/95 px-4 py-3 shadow-xl shadow-emerald-500/20 backdrop-blur transition hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-emerald-500/30"
        aria-label={`${title} - ${subtitle}`}
      >
        <span className="flex flex-col text-left">
          <span className="text-[11px] uppercase tracking-wide text-emerald-600">{title}</span>
          <span className="text-sm font-semibold text-slate-900">{subtitle}</span>
        </span>
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-md shadow-emerald-500/30">
          <svg viewBox="0 0 32 32" className="h-5 w-5" fill="currentColor" aria-hidden="true">
            <path d="M19.11 17.45c-.27-.14-1.6-.79-1.85-.88-.25-.09-.43-.14-.61.14-.18.27-.7.88-.86 1.06-.16.18-.32.2-.59.07-.27-.14-1.13-.42-2.16-1.33-.8-.71-1.34-1.59-1.5-1.86-.16-.27-.02-.41.12-.55.12-.12.27-.32.41-.48.14-.16.18-.27.27-.45.09-.18.05-.34-.02-.48-.07-.14-.61-1.47-.84-2.01-.22-.53-.45-.46-.61-.47h-.52c-.18 0-.48.07-.73.34-.25.27-.96.94-.96 2.3s.99 2.68 1.13 2.86c.14.18 1.96 2.99 4.76 4.19.67.29 1.19.46 1.6.59.67.21 1.28.18 1.76.11.54-.08 1.6-.65 1.83-1.28.23-.63.23-1.17.16-1.28-.07-.11-.25-.18-.52-.32z"/>
            <path d="M16.01 5.33c-5.91 0-10.72 4.81-10.72 10.72 0 2.1.62 4.12 1.79 5.85L5 27l5.25-2.06c1.68.92 3.57 1.41 5.56 1.41 5.91 0 10.72-4.81 10.72-10.72S21.92 5.33 16.01 5.33zm0 19.55c-1.82 0-3.6-.5-5.15-1.45l-.37-.22-3.12 1.23 1.18-3.04-.24-.39a8.49 8.49 0 01-1.33-4.56c0-4.69 3.81-8.5 8.5-8.5s8.5 3.81 8.5 8.5-3.81 8.43-8.5 8.43z"/>
          </svg>
        </span>
      </a>
    </div>
  );
};
