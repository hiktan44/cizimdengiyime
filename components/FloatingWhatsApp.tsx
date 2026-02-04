import React from 'react';

interface FloatingWhatsAppProps {
    phoneNumber?: string;
    message?: string;
}

export const FloatingWhatsApp: React.FC<FloatingWhatsAppProps> = ({
    phoneNumber = '+905326121347',
    message = 'Merhaba! Yardıma ihtiyacım var.'
}) => {
    const handleClick = () => {
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${phoneNumber.replace(/[^0-9]/g, '')}?text=${encodedMessage}`;
        window.open(whatsappUrl, '_blank');
    };

    return (
        <button
            onClick={handleClick}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group hover:scale-110"
            aria-label="WhatsApp ile iletişime geç"
        >
            <img
                src="/whatsapp-icon.png"
                alt="WhatsApp"
                className="w-8 h-8"
            />

            {/* Tooltip */}
            <div className="absolute right-16 bg-slate-900 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                WhatsApp ile yazın
                <div className="absolute right-[-6px] top-1/2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[6px] border-l-slate-900"></div>
            </div>
        </button>
    );
};
