
// Helper function to convert File to base64
export const fileToBase64 = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result as string;
            const mimeType = file.type || 'image/jpeg';
            resolve(`data:${mimeType};base64,${base64.split(',')[1]}`);
        };
        reader.onerror = () => {
            reject(new Error('File to base64 conversion failed'));
        };
        reader.readAsDataURL(file); // ✅ File için readAsDataURL kullanılıyor
    });
};

// Helper function to generate stable seed from file
export const generateStableSeed = async (file: File): Promise<number> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => { // ✅ DÜZELTİLDİ: onloadend kullanılıyor
            try {
                const base64 = reader.result as string;
                // Base64'dan hash oluştur
                const hash = hashString(base64);
                // Hash'i seed olarak kullan (0-1M aralığı)
                const seed = Math.abs(hash) % 1000000000;
                console.log('🔒 Stable seed generated from image hash:', seed);
                resolve(seed);
            } catch (error) {
                reject(new Error(`Seed generation failed: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`));
            }
        };
        reader.onerror = () => {
            reject(new Error('File reading failed for seed generation'));
        };
        reader.readAsDataURL(file);
    });
};

// Simple hash function (djb2 algorithm)
export const hashString = (str: string): number => {
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash;
};

// Helper function to convert Blob to base64
export const blobToBase64 = async (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result as string;
            // Add data URL prefix
            const mimeType = blob.type || 'image/jpeg';
            resolve(`data:${mimeType};base64,${base64.split(',')[1]}`);
        };
        reader.onerror = () => {
            reject(new Error('Blob to base64 conversion failed'));
        };
        reader.readAsDataURL(blob); // ✅ Blob için readAsDataURL kullanılıyor
    });
};

// Helper function to convert File to GenerativePart (for Gemini API)
export const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        // The result includes the data URL prefix (e.g., "data:image/jpeg;base64,"),
        // so we need to remove it.
        resolve(reader.result.split(',')[1]);
      } else {
        // Handle ArrayBuffer case if necessary, though for images it's usually a data URL
        resolve(''); // Or handle error appropriately
      }
    };
    reader.readAsDataURL(file);
  });

  return {
    inlineData: {
      data: await base64EncodedDataPromise,
      mimeType: file.type,
    },
  };
};

export const base64ToFile = async (base64String: string, fileName: string): Promise<File> => {
    const res = await fetch(base64String);
    const blob = await res.blob();
    return new File([blob], fileName, { type: blob.type });
};
