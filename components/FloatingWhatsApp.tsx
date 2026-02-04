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
            className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 flex items-center justify-center group hover:scale-110"
            aria-label="WhatsApp ile iletişime geç"
        >
            <img
                src="/whatsapp-float-icon.png"
                alt="WhatsApp"
                className="w-full h-full rounded-full"
            />
        </button>
    );
};
