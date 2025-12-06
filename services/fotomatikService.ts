/**
 * Fotomatik Service - Görüntü dönüştürme ve prompt üretme servisi
 * Gemini AI kullanarak görüntü dönüştürme, prompt üretme ve iyileştirme önerileri sunar.
 */

import { GoogleGenAI } from "@google/genai";

// Vite projelerinde ortam değişkenlerine erişmek için import.meta.env kullanılır
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string;

if (!API_KEY) {
    console.error('VITE_GEMINI_API_KEY environment variable is not set for Fotomatik!');
}

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
  if (!API_KEY) {
    throw new Error("API Key is missing. Please check your environment configuration.");
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
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

/**
 * Görüntüden prompt üretir (Describe modu)
 * @param imageBase64 Base64 formatında görüntü verisi
 * @param mimeType Görüntü MIME tipi
 * @returns Türkçe ve İngilizce prompt'lar
 */
export const fotomatikGenerateImagePrompt = async (
  imageBase64: string,
  mimeType: string
): Promise<{ tr: string; en: string }> => {
  if (!API_KEY) {
    throw new Error("API Key is missing.");
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: imageBase64,
            },
          },
          {
            text: `Analyze this image in extreme technical and artistic detail to create a prompt for an AI image generator. 
            Focus on:
            1. Camera angle and shot type (e.g., wide angle, close-up, low angle).
            2. Lighting (e.g., natural, studio, cinematic, golden hour, shadows).
            3. Environment and background details.
            4. Art style (e.g., photorealistic, oil painting, cyberpunk).
            5. Subject details (pose, expression, clothing).
            
            Return a JSON object with two keys:
            - "tr": A detailed prompt in Turkish.
            - "en": A detailed prompt in English.
            
            Do not include markdown formatting or code blocks, just the raw JSON.`
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
      tr: json.tr || "Türkçe açıklama oluşturulamadı.",
      en: json.en || "Could not generate English description."
    };

  } catch (error: any) {
    console.error("Prompt Generation Error:", error);
    throw new Error("Prompt oluşturulamadı: " + error.message);
  }
};

/**
 * Görüntü için iyileştirme önerileri üretir
 * @param imageBase64 Base64 formatında görüntü verisi
 * @param mimeType Görüntü MIME tipi
 * @returns İyileştirme parametreleri
 */
export const fotomatikSuggestEnhancements = async (
  imageBase64: string,
  mimeType: string
): Promise<{ 
  brightness: number; 
  contrast: number; 
  saturation: number; 
  sharpness: number; 
  highlights: number; 
  shadows: number; 
}> => {
  if (!API_KEY) {
    throw new Error("API Key is missing.");
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: imageBase64,
            },
          },
          {
            text: `You are a professional photo editor. Analyze the provided image to determine the optimal settings to improve its visual appeal, correcting exposure, color balance, and dynamic range.
            
            Return a JSON object with exactly these keys and integer values based on the following scales:
            
            - "brightness": Range 50 to 150. Default is 100. (e.g., 110 brightens, 90 darkens)
            - "contrast": Range 50 to 150. Default is 100. (e.g., 120 adds contrast)
            - "saturation": Range 0 to 200. Default is 100. (e.g., 120 boosts color)
            - "sharpness": Range 0 to 100. Default is 0. (e.g., 20 adds crispness)
            - "highlights": Range -100 to 100. Default is 0. (Negative values recover blown-out highlights)
            - "shadows": Range -100 to 100. Default is 0. (Positive values lift dark shadows)
            
            Example: { "brightness": 105, "contrast": 110, "saturation": 115, "sharpness": 15, "highlights": -25, "shadows": 20 }
            `
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

