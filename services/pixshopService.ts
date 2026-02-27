/**
 * Pixshop Service - Fotoğraf düzenleme servisi
 * Gemini AI kullanarak fotoğraf rötuşlama, filtre uygulama, ayarlama ve yükseltme işlemleri yapar.
 */

import { GoogleGenAI, GenerateContentResponse, HarmCategory, HarmBlockThreshold, Modality } from "@google/genai";

// Vite projelerinde ortam değişkenlerine erişmek için import.meta.env kullanılır
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string;

const checkApiKey = () => {
    if (!API_KEY || API_KEY === 'undefined' || API_KEY === 'your-gemini-api-key-here') {
        throw new Error('Gemini API anahtarı ayarlanmamış. Lütfen .env.local dosyasını kontrol edin ve VITE_GEMINI_API_KEY değişkeninin doğru olduğundan emin olun.');
    }
};

// Birincil model (maliyet düşük, hızlı)
const IMAGE_MODEL_PRIMARY = 'gemini-3.1-flash-image-preview';
const IMAGE_MODEL_FALLBACK = 'gemini-3-pro-image-preview';

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
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
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
    hotspot: { x: number, y: number },
    resolution: '2K' | '4K' = '2K'
): Promise<string> => {
    console.log('Starting generative edit at:', hotspot);
    checkApiKey();
    const ai = new GoogleGenAI({ apiKey: API_KEY });

    const originalImagePart = await fileToPart(originalImage);
    const prompt = `Edit this image based on the user request.
User Request: "${userPrompt}"
Edit Location: Focus on the area around pixel coordinates (x: ${hotspot.x}, y: ${hotspot.y}).

*** EXECUTION RULES FOR HYPER-REALISM ***:
1. NO AI LOOK: The edited area MUST blend 100% physically correct with the grain, noise, and lighting of the original RAW photo. Do not introduce smooth, plastic, or cartoonish textures.
2. TEXTURE MATCHING: If the original image has film grain or sensor noise, the edited part perfectly copy that noise pattern.
3. LIGHTING CONSISTENCY: Subsurface scattering and shadow softness must match the original scene exactly.
4. INVISIBLE EDIT: The result should look like it was captured in-camera, not photoshopped.`;

    const textPart = { text: prompt };

    console.log('Sending image and prompt to the model...');
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: IMAGE_MODEL_PRIMARY,
        contents: { parts: [originalImagePart, textPart] },
        config: {
            safetySettings,
            responseModalities: [Modality.IMAGE],
            imageConfig: {
                imageSize: resolution, // 2K veya 4K
                aspectRatio: "3:4"
            }
        },
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
    resolution: '2K' | '4K' = '2K'
): Promise<string> => {
    console.log(`Starting filter generation: ${filterPrompt}`);
    checkApiKey();
    const ai = new GoogleGenAI({ apiKey: API_KEY });

    const originalImagePart = await fileToPart(originalImage);
    const prompt = `Apply a stylistic filter to this image.
Filter Request: "${filterPrompt}"
Do not change the content or composition, only apply the visual style.`;

    const textPart = { text: prompt };

    console.log('Sending image and filter prompt to the model...');
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: IMAGE_MODEL_PRIMARY,
        contents: { parts: [originalImagePart, textPart] },
        config: {
            safetySettings,
            responseModalities: [Modality.IMAGE],
            imageConfig: {
                imageSize: resolution,
                aspectRatio: "3:4"
            }
        },
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
    resolution: '2K' | '4K' = '2K'
): Promise<string> => {
    console.log(`Starting global adjustment generation: ${adjustmentPrompt}`);
    checkApiKey();
    const ai = new GoogleGenAI({ apiKey: API_KEY });

    const originalImagePart = await fileToPart(originalImage);
    const prompt = `Perform a global adjustment to this image.
Request: "${adjustmentPrompt}"

*** PROFESSIONAL COLOR GRADING RULES ***:
1. PRESERVE DYNAMIC RANGE: Do not blow out highlights or crush shadows excessively unless requested.
2. NATURAL SKIN TONES: If people are present, skin tones must remain within natural vectors (Vectorscope line). Avoid orange/teal abuse on skin.
3. ORGANIC FEEL: The adjustment should feel like optical filters or professional chemical film processing, not digital overlays.`;

    const textPart = { text: prompt };

    console.log('Sending image and adjustment prompt to the model...');
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: IMAGE_MODEL_PRIMARY,
        contents: { parts: [originalImagePart, textPart] },
        config: {
            safetySettings,
            responseModalities: [Modality.IMAGE],
            imageConfig: {
                imageSize: resolution,
                aspectRatio: "3:4"
            }
        },
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
    originalImage: File,
    resolution: '2K' | '4K' = '2K'
): Promise<string> => {
    console.log('Starting background removal...');
    checkApiKey();
    const ai = new GoogleGenAI({ apiKey: API_KEY });

    const originalImagePart = await fileToPart(originalImage);
    const prompt = `Remove the background from this image. 
Return ONLY the main subject with a fully transparent background (alpha channel). 
Ensure there are no background artifacts or white outlines. 
The output MUST be a transparent PNG.`;

    const textPart = { text: prompt };

    console.log('Sending image and background removal prompt to the model...');
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: IMAGE_MODEL_PRIMARY,
        contents: { parts: [originalImagePart, textPart] },
        config: {
            safetySettings,
            responseModalities: [Modality.IMAGE],
            imageConfig: {
                imageSize: resolution,
                aspectRatio: "3:4"
            }
        },
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
    checkApiKey();
    const ai = new GoogleGenAI({ apiKey: API_KEY });

    const originalImagePart = await fileToPart(originalImage);
    const prompt = `Upscale this image to ${size} resolution. Increase resolution while maintaining fidelity. Sharpen details, reduce noise.
    
*** CRITICAL LOGO/TEXT PRESERVATION RULES ***:
1. PROTECT LOGOS: If there are any logos, brand marks, or text overlays in the image, they MUST remain crystal clear and sharp at ${size} resolution.
2. NO LOGO DISTORTION: Do not blur, warp, or degrade any logos, watermarks, or text elements during upscaling.
3. ENHANCE CLARITY: Logos and text should become SHARPER and MORE READABLE at higher resolution, not blurrier.
4. MAINTAIN POSITIONING: Keep all logos and overlays in their exact original positions and proportions.`;

    const textPart = { text: prompt };

    console.log('Sending image and upscale prompt to the model...');
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: IMAGE_MODEL_PRIMARY,
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

/**
 * Adds a logo or product (accessory) to the main image at a specific location.
 * @param originalImage The base image file.
 * @param overlayImage The logo or product image to add (e.g., logo, tie, scarf).
 * @param userPrompt Description of what to add and where.
 * @param hotspot Optional {x, y} coordinates for precise placement.
 * @returns A promise that resolves to the data URL of the composite image.
 */
export const pixshopAddProductOrLogo = async (
    originalImage: File,
    overlayImage: File,
    userPrompt: string,
    hotspot?: { x: number, y: number },
    resolution: '2K' | '4K' = '2K'
): Promise<string> => {
    console.log('Starting product/logo addition...');
    checkApiKey();
    const ai = new GoogleGenAI({ apiKey: API_KEY });

    const originalImagePart = await fileToPart(originalImage);
    const overlayImagePart = await fileToPart(overlayImage);

    const hotspotText = hotspot
        ? `Focus placement around pixel coordinates (x: ${hotspot.x}, y: ${hotspot.y}).`
        : '';

    const prompt = `Add the second image (logo/product/accessory) to the first image based on this request:
User Request: "${userPrompt}"
${hotspotText}

*** PROFESSIONAL COMPOSITE RULES ***:
1. NATURAL INTEGRATION: The added element must look like it was photographed with the original scene - match lighting, shadows, and perspective.
2. PRESERVE LOGO CLARITY: If adding a logo, it MUST remain sharp, clear, and readable. Do not blur or distort logos.
3. REALISTIC PHYSICS: If adding clothing/accessories (tie, scarf, etc.), they must drape naturally with realistic fabric physics and shadows.
4. PROPER SCALING: Scale the added element appropriately for the scene - logos should be visible but not overwhelming, accessories should fit the person naturally.
5. SEAMLESS BLENDING: Edges must blend perfectly - no harsh cutouts or obvious compositing artifacts.
6. MAINTAIN QUALITY: The final image should look professional and production-ready, suitable for e-commerce or marketing use.`;

    const textPart = { text: prompt };

    console.log('Sending images and composite prompt to the model...');
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: IMAGE_MODEL_PRIMARY,
        contents: { parts: [originalImagePart, overlayImagePart, textPart] },
        config: {
            safetySettings,
            responseModalities: [Modality.IMAGE],
            imageConfig: {
                imageSize: resolution,
                aspectRatio: "3:4"
            }
        },
    });
    console.log('Received response from model for product/logo addition.', response);

    return handleApiResponse(response, 'add_product_logo');
};

