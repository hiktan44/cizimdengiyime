import React from 'react';

interface FloatingWhatsAppProps {
    phoneNumber?: string;
    message?: string;
}

export const FloatingWhatsApp: React.FC<FloatingWhatsAppProps> = ({
    phoneNumber = '+905389612944',
    message = 'Merhaba, Fasheone hakkında bilgi almak istiyorum.'
}) => {
    const handleClick = () => {
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${phoneNumber.replace(/[^0-9]/g, '')}?text=${encodedMessage}`;
        window.open(whatsappUrl, '_blank');
    };

    return (
        <button
            onClick={handleClick}
            className="fixed bottom-6 right-6 z-[100] w-14 h-14 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-110 hover:-translate-y-1 active:scale-95 cursor-pointer"
            aria-label="WhatsApp ile iletişime geç"
            title="WhatsApp ile iletişime geç"
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
