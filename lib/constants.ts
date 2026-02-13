
// Credit costs
export const CREDIT_COSTS = {
    SKETCH_TO_PRODUCT: 1,
    PRODUCT_TO_MODEL: 1,
    VIDEO: 3,
    TECH_SKETCH: 1, // Teknik çizim maliyeti
    TECH_PACK: 3, // Tech Pack (ön/arka görünüm + ölçüler + spesifikasyonlar)
    PIXSHOP: 1, // Pixshop fotoğraf düzenleme maliyeti (rötuş, filtre, ayarlama, kırpma, 2K upscale)
    PIXSHOP_4K: 2, // Pixshop 4K upscale maliyeti (ekstra işlem gücü gerektirir)
    FOTOMATIK_TRANSFORM: 1, // Fotomatik görüntü dönüştürme maliyeti
    FOTOMATIK_DESCRIBE: 1, // Fotomatik prompt üretme maliyeti
    ADGENIUS_IMAGE: 1, // AdGenius görsel maliyeti (her görsel için)
    ADGENIUS_VIDEO: 3, // AdGenius video maliyeti (her video için)
    COLLAGE: 2, // Kolaj oluşturma maliyeti (2-6 görsel birleştirme) - 2 kredi
} as const;

// Subscription plans
export const SUBSCRIPTION_PLANS = {
    STARTER: {
        name: 'Starter',
        credits: 100,
        price: 500,
        monthly: true,
    },
    PRO: {
        name: 'Pro',
        credits: 500,
        price: 2250,
        monthly: true,
    },
    PREMIUM: {
        name: 'Premium',
        credits: 1000,
        price: 4000,
        monthly: true,
    },
} as const;

// Credit packages
export const CREDIT_PACKAGES = {
    SMALL: {
        credits: 50,
        price: 250,
    },
    MEDIUM: {
        credits: 100,
        price: 500,
    },
    LARGE: {
        credits: 200,
        price: 1000,
    },
} as const;
