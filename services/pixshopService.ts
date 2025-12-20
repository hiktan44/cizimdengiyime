/**
 * Pixshop Service - Fotoğraf düzenleme servisi
 * Gemini AI kullanarak fotoğraf rötuşlama, filtre uygulama, ayarlama ve yükseltme işlemleri yapar.
 */

import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

// Vite projelerinde ortam değişkenlerine erişmek için import.meta.env kullanılır
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string;

if (!API_KEY) {
    console.error('VITE_GEMINI_API_KEY environment variable is not set for Pixshop!');
}

// Helper function to convert a File object to a Gemini API Part
const fileToPart = async (file: File): Promise<{ inlineData: { mimeType: string; data: string; } }> => {
    const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
    
    const arr = dataUrl.split(',');
    if (arr.length < 2) throw new Error("Invalid data URL");
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch || !mimeMatch[1]) throw new Error("Could not parse MIME type from data URL");
    
    const mimeType = mimeMatch[1];
    const data = arr[1];
    return { inlineData: { mimeType, data } };
};

const handleApiResponse = (
    response: GenerateContentResponse,
    context: string
): string => {
    // 1. Check for prompt blocking first
    if (response.promptFeedback?.blockReason) {
        const { blockReason } = response.promptFeedback;
        const errorMessage = `İsteğiniz güvenlik nedeniyle engellendi. Sebep: ${blockReason}.`;
        console.error(errorMessage, { response });
        throw new Error(errorMessage);
    }

    // 2. Try to find the image part
    const imagePartFromResponse = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData);

    if (imagePartFromResponse?.inlineData) {
        const { mimeType, data } = imagePartFromResponse.inlineData;
        console.log(`Received image data (${mimeType}) for ${context}`);
        return `data:${mimeType};base64,${data}`;
    }

    // 3. If no image, check for other reasons
    const finishReason = response.candidates?.[0]?.finishReason;
    if (finishReason && finishReason !== 'STOP') {
        const errorMessage = `Resim oluşturma işlemi durduruldu. Sebep: ${finishReason}. Bu durum genellikle güvenlik ayarlarından kaynaklanır.`;
        console.error(errorMessage, { response });
        throw new Error(errorMessage);
    }
    
    const errorMessage = `Yapay zeka bir resim oluşturamadı. Bu durum, isteğinizin karmaşık olmasından veya güvenlik filtrelerinden kaynaklanabilir. Lütfen isteğinizi basitleştirerek tekrar deneyin.`;

    console.error(`Model response did not contain an image part for ${context}.`, { response });
    throw new Error(errorMessage);
};

// Common safety settings to be more permissive to avoid IMAGE_OTHER errors on benign edits
const safetySettings = [
    { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
    { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
    { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
    { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
];

/**
 * Generates an edited image using generative AI based on a text prompt and a specific point.
 * @param originalImage The original image file.
 * @param userPrompt The text prompt describing the desired edit.
 * @param hotspot The {x, y} coordinates on the image to focus the edit.
 * @returns A promise that resolves to the data URL of the edited image.
 */
export const pixshopGenerateEditedImage = async (
    originalImage: File,
    userPrompt: string,
    hotspot: { x: number, y: number }
): Promise<string> => {
    console.log('Starting generative edit at:', hotspot);
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    
    const originalImagePart = await fileToPart(originalImage);
    const prompt = `Edit this image based on the user request.
User Request: "${userPrompt}"
Edit Location: Focus on the area around pixel coordinates (x: ${hotspot.x}, y: ${hotspot.y}).
Maintain photorealism and blend the edit seamlessly with the original image.`;
    
    const textPart = { text: prompt };

    console.log('Sending image and prompt to the model...');
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [originalImagePart, textPart] },
        config: { safetySettings },
    });
    console.log('Received response from model.', response);

    return handleApiResponse(response, 'edit');
};

/**
 * Generates an image with a filter applied using generative AI.
 * @param originalImage The original image file.
 * @param filterPrompt The text prompt describing the desired filter.
 * @returns A promise that resolves to the data URL of the filtered image.
 */
export const pixshopGenerateFilteredImage = async (
    originalImage: File,
    filterPrompt: string,
): Promise<string> => {
    console.log(`Starting filter generation: ${filterPrompt}`);
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    
    const originalImagePart = await fileToPart(originalImage);
    const prompt = `Apply a stylistic filter to this image.
Filter Request: "${filterPrompt}"
Do not change the content or composition, only apply the visual style.`;
    
    const textPart = { text: prompt };

    console.log('Sending image and filter prompt to the model...');
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [originalImagePart, textPart] },
        config: { safetySettings },
    });
    console.log('Received response from model for filter.', response);
    
    return handleApiResponse(response, 'filter');
};

/**
 * Generates an image with a global adjustment applied using generative AI.
 * @param originalImage The original image file.
 * @param adjustmentPrompt The text prompt describing the desired adjustment.
 * @returns A promise that resolves to the data URL of the adjusted image.
 */
export const pixshopGenerateAdjustedImage = async (
    originalImage: File,
    adjustmentPrompt: string,
): Promise<string> => {
    console.log(`Starting global adjustment generation: ${adjustmentPrompt}`);
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    
    const originalImagePart = await fileToPart(originalImage);
    const prompt = `Perform a global adjustment to this image.
Request: "${adjustmentPrompt}"
Ensure the result is photorealistic.`;
    
    const textPart = { text: prompt };

    console.log('Sending image and adjustment prompt to the model...');
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [originalImagePart, textPart] },
        config: { safetySettings },
    });
    console.log('Received response from model for adjustment.', response);
    
    return handleApiResponse(response, 'adjustment');
};

/**
 * Removes the background from the image and returns a transparent PNG.
 * @param originalImage The original image file.
 * @returns A promise that resolves to the data URL of the image with background removed.
 */
export const pixshopRemoveBackground = async (
    originalImage: File
): Promise<string> => {
    console.log('Starting background removal...');
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    
    const originalImagePart = await fileToPart(originalImage);
    const prompt = `Remove the background from this image. 
Return ONLY the main subject with a fully transparent background (alpha channel). 
Ensure there are no background artifacts or white outlines. 
The output MUST be a transparent PNG.`;
    
    const textPart = { text: prompt };

    console.log('Sending image and background removal prompt to the model...');
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [originalImagePart, textPart] },
        config: { safetySettings },
    });
    console.log('Received response from model for background removal.', response);
    
    return handleApiResponse(response, 'remove_bg');
};

/**
 * Upscales the image to the specified resolution (2K or 4K).
 * @param originalImage The original image file.
 * @param size The target resolution size ('2K' | '4K').
 * @returns A promise that resolves to the data URL of the upscaled image.
 */
export const pixshopUpscaleImage = async (
    originalImage: File,
    size: '2K' | '4K'
): Promise<string> => {
    console.log(`Starting image upscale to ${size}...`);
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    
    const originalImagePart = await fileToPart(originalImage);
    const prompt = `Upscale this image to ${size} resolution. Increase resolution while maintaining fidelity. Sharpen details, reduce noise.`;
    
    const textPart = { text: prompt };

    console.log('Sending image and upscale prompt to the model...');
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: { parts: [originalImagePart, textPart] },
        config: {
            safetySettings,
            imageConfig: {
                imageSize: size,
            }
        }
    });
    console.log('Received response from model for upscale.', response);
    
    return handleApiResponse(response, 'upscale');
};

