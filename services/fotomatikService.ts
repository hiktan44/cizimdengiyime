/**
 * Fotomatik Service - Görüntü dönüştürme ve prompt üretme servisi
 * Gemini AI kullanarak görüntü dönüştürme, prompt üretme ve iyileştirme önerileri sunar.
 */

import { GoogleGenAI } from "@google/genai";

// Vite projelerinde ortam değişkenlerine erişmek için import.meta.env kullanılır
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string;

const checkApiKey = () => {
  if (!API_KEY || API_KEY === 'undefined' || API_KEY === 'your-gemini-api-key-here') {
    throw new Error('Gemini API anahtarı ayarlanmamış. Lütfen .env.local dosyasını kontrol edin ve VITE_GEMINI_API_KEY değişkeninin doğru olduğundan emin olun.');
  }
};

// Birincil image model (hızlı + maliyet düşük)
const IMAGE_MODEL_PRIMARY = 'gemini-3.1-flash-image-preview';
const IMAGE_MODEL_FALLBACK = 'gemini-3-pro-image-preview';

/**
 * Görüntüyü dönüştürür (Transform modu)
 * @param imageBase64 Base64 formatında görüntü verisi
 * @param mimeType Görüntü MIME tipi
 * @param prompt Dönüşüm istemi
 * @param config En boy oranı ve çözünürlük ayarları
 * @returns Dönüştürülmüş görüntünün data URL'i
 */
export const fotomatikGenerateEditedImage = async (
  imageBase64: string,
  mimeType: string,
  prompt: string,
  config: {
    aspectRatio: string;
    imageSize: string;
  }
): Promise<string> => {
  checkApiKey();
  const ai = new GoogleGenAI({ apiKey: API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: IMAGE_MODEL_PRIMARY,
      contents: {
        parts: [
          {
            text: prompt,
          },
          {
            inlineData: {
              mimeType: mimeType,
              data: imageBase64,
            },
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: config.aspectRatio,
          imageSize: config.imageSize,
        }
      }
    });

    const parts = response.candidates?.[0]?.content?.parts;
    if (!parts) {
      throw new Error("No content returned from Gemini.");
    }

    for (const part of parts) {
      if (part.inlineData && part.inlineData.data) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }

    // If only text is returned (e.g., a refusal or explanation), throw it as an error to display
    for (const part of parts) {
      if (part.text) {
        throw new Error(`Model returned text instead of image: ${part.text}`);
      }
    }

    throw new Error("No valid image data found in the response.");

  } catch (error: any) {
    console.error("Fotomatik Transform Error:", error);
    throw new Error(error.message || "Failed to generate image.");
  }
};

export interface PromptAnalysisResponse {
  tr: string;
  en: string;
  midjourney: string;
  stableDiffusion: {
    positive: string;
    negative: string;
    params: string;
  };
  tips: string[];
}

/**
 * Görüntüden gelişmiş prompt üretir (Describe modu)
 * @param imageBase64 Base64 formatında görüntü verisi
 * @param mimeType Görüntü MIME tipi
 * @returns Türkçe/İngilizce prompt'lar + Midjourney + Stable Diffusion optimizasyonları
 */
export const fotomatikGenerateImagePrompt = async (
  imageBase64: string,
  mimeType: string
): Promise<PromptAnalysisResponse> => {
  checkApiKey();
  const ai = new GoogleGenAI({ apiKey: API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: imageBase64,
            },
          },
          {
            text: `Analyze this image in extreme technical and artistic detail to create high-end prompts for AI image generators. 
            
            Return a JSON object with the following structure:
            {
              "tr": "Detailed artistic analysis in Turkish",
              "en": "Standard technical prompt in English",
              "midjourney": "Optimized Midjourney V6 prompt including relevant parameters like --ar, --stylize, --chaos based on image analysis",
              "stableDiffusion": {
                "positive": "Masterpiece level positive prompt for SDXL/Pony/Flux",
                "negative": "Standard negative prompt to avoid artifacts",
                "params": "Recommended Sampler, CFG Scale and Steps"
              },
              "tips": ["3 expert tips to improve this specific style of image (e.g., lens choice, lighting setup, keyword emphasis)"]
            }
            
            Ensure the response is ONLY the JSON object, no markdown, no conversational text.`
          }
        ],
      },
      config: {
        responseMimeType: 'application/json',
      }
    });

    const text = response.text;
    if (!text) throw new Error("No text returned from Gemini");

    return JSON.parse(text);

  } catch (error: any) {
    console.error("Prompt Generation Error:", error);
    throw new Error("Prompt oluşturulamadı: " + error.message);
  }
};

/**
 * Görüntü için iyileştirme önerileri üretir (Mode seçenekleriyle)
 * @param imageBase64 Base64 formatında görüntü verisi
 * @param mimeType Görüntü MIME tipi
 * @param mode İyileştirme modu: balanced/vibrant/crisp/cinematic
 * @returns İyileştirme parametreleri
 */
export const fotomatikSuggestEnhancements = async (
  imageBase64: string,
  mimeType: string,
  mode: 'balanced' | 'vibrant' | 'crisp' | 'cinematic' = 'balanced'
): Promise<{
  brightness: number;
  contrast: number;
  saturation: number;
  sharpness: number;
  highlights: number;
  shadows: number;
}> => {
  checkApiKey();
  const ai = new GoogleGenAI({ apiKey: API_KEY });

  const modeInstructions = {
    balanced: "Aims for a natural, professional look with balanced exposure and color.",
    vibrant: "Focuses on boosting color saturation, pop, and lively tones. Make it look energetic.",
    crisp: "Prioritizes sharpness, micro-contrast, and clarity of fine details and textures.",
    cinematic: "Targets a film-like quality with deeper shadows, controlled highlights, and dramatic contrast."
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: imageBase64,
            },
          },
          {
            text: `You are a professional photo editor using the "${mode.toUpperCase()}" model strategy. 
            Strategy Details: ${modeInstructions[mode]}
            
            Analyze the image and return a JSON object with these keys and integer values:
            
            - "brightness": 50 to 150 (100 default)
            - "contrast": 50 to 150 (100 default)
            - "saturation": 0 to 200 (100 default)
            - "sharpness": 0 to 100 (0 default)
            - "highlights": -100 to 100 (0 default)
            - "shadows": -100 to 100 (0 default)
            
            Example: { "brightness": 105, "contrast": 110, "saturation": 115, "sharpness": 15, "highlights": -25, "shadows": 20 }`
          }
        ],
      },
      config: {
        responseMimeType: 'application/json',
      }
    });

    const text = response.text;
    if (!text) throw new Error("No text returned from Gemini");

    const json = JSON.parse(text);
    return {
      brightness: typeof json.brightness === 'number' ? json.brightness : 100,
      contrast: typeof json.contrast === 'number' ? json.contrast : 100,
      saturation: typeof json.saturation === 'number' ? json.saturation : 100,
      sharpness: typeof json.sharpness === 'number' ? json.sharpness : 0,
      highlights: typeof json.highlights === 'number' ? json.highlights : 0,
      shadows: typeof json.shadows === 'number' ? json.shadows : 0,
    };

  } catch (error: any) {
    console.error("Enhancement Analysis Error:", error);
    // Fallback default
    return { brightness: 100, contrast: 100, saturation: 100, sharpness: 0, highlights: 0, shadows: 0 };
  }
};

// ==========================================
// TOPLU İŞLEME FONKSİYONLARI
// ==========================================

export type BatchOperationType = 'remove_bg' | 'retouch' | 'enhance' | 'catalog';

export interface BatchImageResult {
  id: string;
  originalUrl: string;
  processedUrl: string | null;
  status: 'pending' | 'processing' | 'completed' | 'error';
  error?: string;
}

/**
 * Tekil arka plan kaldırma (Gemini ile)
 */
export const fotomatikRemoveBackground = async (
  imageBase64: string,
  mimeType: string
): Promise<string> => {
  checkApiKey();
  const ai = new GoogleGenAI({ apiKey: API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: IMAGE_MODEL_PRIMARY,
      contents: {
        parts: [
          {
            text: "Remove the background from this image completely, leaving only the main subject. Make the background pure white or transparent. Preserve all details of the main subject with clean edges. Perfect for e-commerce product photography.",
          },
          {
            inlineData: {
              mimeType: mimeType,
              data: imageBase64,
            },
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: '1:1',
          imageSize: '2K',
        }
      }
    });

    const parts = response.candidates?.[0]?.content?.parts;
    if (!parts) throw new Error("No content returned from Gemini");

    for (const part of parts) {
      if (part.inlineData && part.inlineData.data) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }

    throw new Error("Background removal failed - no image returned");
  } catch (error: any) {
    console.error("Background Removal Error:", error);
    throw new Error(error.message || "Arka plan kaldırılamadı");
  }
};

/**
 * Tekil retouch işlemi (ürün fotoğrafı iyileştirme)
 */
export const fotomatikRetouch = async (
  imageBase64: string,
  mimeType: string,
  retouchLevel: 'light' | 'medium' | 'heavy' = 'medium'
): Promise<string> => {
  checkApiKey();
  const ai = new GoogleGenAI({ apiKey: API_KEY });

  const levelPrompts = {
    light: "Slightly improve colors, fix minor lighting issues, keep natural look.",
    medium: "Professional retouch: fix lighting, enhance colors, remove blemishes, sharpen details. E-commerce quality.",
    heavy: "Full professional studio retouch: perfect lighting, vibrant colors, remove all imperfections, magazine quality."
  };

  try {
    const response = await ai.models.generateContent({
      model: IMAGE_MODEL_PRIMARY,
      contents: {
        parts: [
          {
            text: `Professional product photo retouch. ${levelPrompts[retouchLevel]} Maintain product authenticity while making it look professionally photographed.`,
          },
          {
            inlineData: {
              mimeType: mimeType,
              data: imageBase64,
            },
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: '1:1',
          imageSize: '2K',
        }
      }
    });

    const parts = response.candidates?.[0]?.content?.parts;
    if (!parts) throw new Error("No content returned from Gemini");

    for (const part of parts) {
      if (part.inlineData && part.inlineData.data) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }

    throw new Error("Retouch failed - no image returned");
  } catch (error: any) {
    console.error("Retouch Error:", error);
    throw new Error(error.message || "Retouch işlemi başarısız");
  }
};

/**
 * Katalog hazırlama (beyaz arka plan + profesyonel görünüm)
 */
export const fotomatikCatalogPrep = async (
  imageBase64: string,
  mimeType: string,
  style: 'ecommerce' | 'social' | 'minimal' = 'ecommerce'
): Promise<string> => {
  checkApiKey();
  const ai = new GoogleGenAI({ apiKey: API_KEY });

  const stylePrompts = {
    ecommerce: "Transform into professional e-commerce product photo: pure white background, perfect lighting, soft shadows beneath product, crisp details. Ready for Amazon/Shopify listing.",
    social: "Transform into social media ready product photo: clean background, trendy look, good contrast, lifestyle feel while maintaining focus on product.",
    minimal: "Transform into minimal product photo: white or very light gray background, ultra clean, no distractions, premium luxury feel."
  };

  try {
    const response = await ai.models.generateContent({
      model: IMAGE_MODEL_PRIMARY,
      contents: {
        parts: [
          {
            text: stylePrompts[style],
          },
          {
            inlineData: {
              mimeType: mimeType,
              data: imageBase64,
            },
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: '1:1',
          imageSize: '2K',
        }
      }
    });

    const parts = response.candidates?.[0]?.content?.parts;
    if (!parts) throw new Error("No content returned from Gemini");

    for (const part of parts) {
      if (part.inlineData && part.inlineData.data) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }

    throw new Error("Catalog prep failed - no image returned");
  } catch (error: any) {
    console.error("Catalog Prep Error:", error);
    throw new Error(error.message || "Katalog hazırlama başarısız");
  }
};

