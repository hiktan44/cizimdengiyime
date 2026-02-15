import React from 'react';
import { useTranslation } from '../lib/i18n/context';
import type { TranslationRecord } from '../lib/i18n/types';

const trWhatsApp = {
    ariaLabel: 'WhatsApp ile iletişime geç',
    defaultMessage: 'Merhaba, Fasheone hakkında bilgi almak istiyorum.',
};

const whatsAppTranslations: TranslationRecord<typeof trWhatsApp> = {
    tr: trWhatsApp,
    en: {
        ariaLabel: 'Contact us via WhatsApp',
        defaultMessage: 'Hello, I would like to get information about Fasheone.',
    },
};

interface FloatingWhatsAppProps {
    phoneNumber?: string;
    message?: string;
}

export const FloatingWhatsApp: React.FC<FloatingWhatsAppProps> = ({
    phoneNumber = '+905389612944',
    message,
}) => {
    const t = useTranslation(whatsAppTranslations);
    const finalMessage = message || t.defaultMessage;

    const handleClick = () => {
        const encodedMessage = encodeURIComponent(finalMessage);
        const whatsappUrl = `https://wa.me/${phoneNumber.replace(/[^0-9]/g, '')}?text=${encodedMessage}`;
        window.open(whatsappUrl, '_blank');
    };

    return (
        <button
            onClick={handleClick}
            className="fixed bottom-6 right-6 z-[100] w-14 h-14 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-110 hover:-translate-y-1 active:scale-95 cursor-pointer"
            aria-label={t.ariaLabel}
            title={t.ariaLabel}
        >
            <img
                src="/whatsapp-float-icon.png"
                alt="WhatsApp"
                className="w-full h-full rounded-2xl"
                loading="lazy"
            />
        </button>
    );
};
