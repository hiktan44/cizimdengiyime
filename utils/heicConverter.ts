// utils/heicConverter.ts

export const convertHeicToJpeg = async (file: File): Promise<File> => {
    // We use dynamic import to avoid any SSR/bundler issues with the raw JS file
    try {
        // @ts-ignore
        const heic2anyModule = await import('./heic2any.js');
        const heic2any = (heic2anyModule.default || heic2anyModule) as any;

        if (typeof heic2any !== 'function') {
            console.error('heic2any is not a function:', heic2any);
            return file; // fallback
        }

        const convertedBlob = await heic2any({
            blob: file,
            toType: 'image/jpeg',
            quality: 0.9,
        }) as Blob;

        // Create a new File from the Blob
        const newFilename = file.name.replace(/\.(heic|heif)$/i, '.jpg');
        return new File([convertedBlob], newFilename, { type: 'image/jpeg' });
    } catch (err) {
        console.error('HEIC to JPEG conversion failed:', err);
        return file; // Return original if conversion fails
    }
};
