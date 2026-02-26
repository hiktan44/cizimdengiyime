import { GoogleGenAI, Type, HarmCategory, HarmBlockThreshold } from "@google/genai";
import { ProductAnalysis, AdPrompt, FormData, AdStyle, ImageModel, VideoModel } from '../pages/adgenius';

// Vite projelerinde ortam değişkenlerine erişmek için import.meta.env kullanılır
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string;

const checkApiKey = () => {
  if (!API_KEY || API_KEY === 'undefined' || API_KEY === 'your-gemini-api-key-here') {
    throw new Error('Gemini API anahtarı ayarlanmamış. Lütfen .env.local dosyasını kontrol edin ve VITE_GEMINI_API_KEY değişkeninin doğru olduğundan emin olun.');
  }
};

// Define maximally permissive safety settings for e-commerce
// Using BLOCK_NONE is essential for underwear/swimwear models to avoid IMAGE_SAFETY triggers.
const PERMISSIVE_SAFETY_SETTINGS = [
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_CIVIC_INTEGRITY,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  }
];

// Helper to convert File to Base64
export const fileToGoogleGenAIBase64 = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove data url prefix (e.g. "data:image/jpeg;base64,")
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// 1. Analyze Product Image
export const analyzeProductImage = async (file: File): Promise<ProductAnalysis> => {
  checkApiKey();
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const base64Data = await fileToGoogleGenAIBase64(file);

  const analysisSchema = {
    type: Type.OBJECT,
    properties: {
      urun_adi: { type: Type.STRING },
      urun_kategorisi: { type: Type.STRING },
      ana_renk: { type: Type.STRING },
      ikincil_renkler: { type: Type.ARRAY, items: { type: Type.STRING } },
      malzeme: { type: Type.STRING },
      boyut_tahmini: { type: Type.STRING },
      stil: { type: Type.STRING },
      ozellikler: { type: Type.ARRAY, items: { type: Type.STRING } },
      hedef_kitle: { type: Type.STRING },
      reklam_ortami: { type: Type.STRING },
      anahtar_kelimeler: { type: Type.ARRAY, items: { type: Type.STRING } },
      // New fields for E-commerce text
      eticaret_baslik: { type: Type.STRING, description: "SEO friendly impressive product title" },
      eticaret_aciklama: { type: Type.STRING, description: "Persuasive marketing description paragraph" },
      eticaret_ozellikler: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of bullet points for product page" },
      // Detail preservation fields
      urun_uzerindeki_yazilar: { type: Type.ARRAY, items: { type: Type.STRING }, description: "ALL text, letters, numbers, words found on the product surface. Transcribe each text element EXACTLY character by character. If no text, return empty array." },
      urun_uzerindeki_logolar: { type: Type.ARRAY, items: { type: Type.STRING }, description: "ALL logos/brand marks found on the product. Describe each logo in detail: shape, colors, position, size. If no logo, return empty array." },
      urun_uzerindeki_etiketler: { type: Type.ARRAY, items: { type: Type.STRING }, description: "ALL visible tags, labels, badges on the product. If none, return empty array." },
      urun_uzerindeki_baskialar: { type: Type.ARRAY, items: { type: Type.STRING }, description: "ALL prints, graphics, embroideries, patches on the product. Describe each in detail. If none, return empty array." },
      ozel_detaylar: { type: Type.ARRAY, items: { type: Type.STRING }, description: "ALL special construction details: zipper style/color, button type/count/material, stitch patterns, hardware (buckles/clasps), pockets, seam lines, decorative elements. Be extremely thorough." }
    },
    required: ["urun_adi", "urun_kategorisi", "ana_renk", "malzeme", "stil", "eticaret_baslik", "eticaret_aciklama", "eticaret_ozellikler", "urun_uzerindeki_yazilar", "urun_uzerindeki_logolar", "ozel_detaylar"]
  };

  // Retry wrapper for 503/UNAVAILABLE errors
  const MAX_RETRIES = 3;
  let lastError: any = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`🔄 Ürün analizi deneme: ${attempt}/${MAX_RETRIES}`);
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: file.type,
                data: base64Data
              }
            },
            {
              text: `Bu görseldeki ürünü **Profesyonel E-Ticaret İçerik Yazarı**, **Kıdemli Moda Tasarımcısı** ve **Detay Uzmanı** kimliğiyle analiz et.
           
           Görevin ÜÇ aşamalıdır:
           1. Görsel Üretimi İçin Teknik Analiz: Renk, doku ve kalıp detaylarını çıkar.
           2. Satış Odaklı İçerik Üretimi: Bu ürünü Trendyol, Amazon veya lüks bir butik sitesinde satmak için gereken metinleri yaz.
           3. **KRİTİK - DETAY TESPİTİ:** Ürün üzerindeki TÜM yazıları, logoları, etiketleri, baskıları ve özel detayları tespit et.

           **Teknik Analiz Kuralları:**
           - Renkleri Pantone hassasiyetinde tanımla.
           - Kumaş dokusunu ve kalıp özelliklerini (Slim-fit, Oversize, Reglan kol vb.) teknik terimlerle belirt.

           **E-Ticaret Metni Kuralları (Ciddi ve Profesyonel Ton):**
           - **Başlık (eticaret_baslik):** SEO uyumlu, markayı ve ürünün en can alıcı özelliğini içeren çarpıcı bir başlık.
           - **Açıklama (eticaret_aciklama):** Müşteriyi satın almaya ikna eden akıcı bir paragraf.
           - **Özellikler (eticaret_ozellikler):** Müşterinin hızlıca okuyabileceği, fayda odaklı 5-7 adet madde işareti.

           **DETAY TESPİTİ KURALLARI (ÇOK ÖNEMLİ):**
           - **urun_uzerindeki_yazilar:** Ürün üzerinde görünen HER YAZI, HARF, RAKAM ve KELIME'yi karakter karakter, BÜYÜK/küçük harf ayrımıyla birebir yazınız. Yazı konumunu da belirtiniz (örn: "Nike" - göğüs sol üst, "AIR MAX" - taban).
           - **urun_uzerindeki_logolar:** Her logoyu detaylı tanımlayın: şekli, renkleri, konumu, boyutu, stili (baskı/nakış/kabartma). Örnek: "Nike Swoosh - siyah, göğüs sol, 3cm, nakış".
           - **urun_uzerindeki_etiketler:** Görünür etiketler, boyun etiketi, fiyat etiketi, beden etiketi vb.
           - **urun_uzerindeki_baskialar:** Baskılar, grafikler, nakışlar, yamalar, desenler hakkında detaylı bilgi.
           - **ozel_detaylar:** Fermuar (renk, tip), düğme (sayı, malzeme, renk), dikiş desenleri, metal aksesuarlar (toka, kopça), cep tipleri, yaka detayları, manşet detayları gibi TÜM yapısal öğeleri listeleyin.

           Çıktı tamamen JSON formatında olmalıdır.`
            }
          ]
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: analysisSchema,
          temperature: 0.4,
          safetySettings: PERMISSIVE_SAFETY_SETTINGS
        }
      });

      const text = response.text;
      if (!text) throw new Error("Analiz oluşturulamadı.");
      return JSON.parse(text) as ProductAnalysis;
    } catch (error: any) {
      lastError = error;
      const errorMsg = error?.message?.toLowerCase() || String(error).toLowerCase();
      const isRetryable = errorMsg.includes('503') || errorMsg.includes('unavailable') ||
        errorMsg.includes('high demand') || errorMsg.includes('overloaded') ||
        errorMsg.includes('429') || errorMsg.includes('resource_exhausted');

      if (isRetryable && attempt < MAX_RETRIES) {
        const waitTime = 3000 * attempt;
        console.warn(`🔄 Sunucu yoğun, ${waitTime}ms sonra tekrar deneniyor... (${attempt}/${MAX_RETRIES})`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }
      throw error;
    }
  }
  throw lastError || new Error("Analiz oluşturulamadı.");
};

// 2. Generate Prompts (Human Models Allowed by Default)
export const generateAdPrompts = (analysis: ProductAnalysis, formData: FormData): AdPrompt[] => {
  const { adStyle, mode, customPrompt, brand, campaignStyleCount, ecommercePhotoCount, ecommerceColorVariations, ecommercePatternImage, renderTextOnImage, imageOverlayText } = formData;

  const styleMapping: Record<AdStyle, string> = {
    'Lüks ve Premium': 'luxury and premium, high-end aesthetic, sophisticated, vogue style',
    'Minimalist Stüdyo': 'minimalist studio photography, clean lines, neutral colors, extreme simplicity, cos',
    'Lüks Mağaza Atmosferi': 'luxury boutique interior, expensive atmosphere, high-end retail',
    'Doğal Gün Işığı': 'soft natural daylight, organic sun flare, warm tones, golden hour',
    'Vintage & Retro': 'vintage 90s aesthetic, film grain, retro vibe, nostalgic',
    'Neon & Cyberpunk': 'neon lighting, futuristic cyberpunk city atmosphere, blue and pink leds',
    'Sinematik & Dramatik': 'cinematic dramatic lighting, moody atmosphere, shadow play, chiaroscuro',
    'Renkli & Pop Art': 'vivid colors, bold pop art contrast, high energy, color-blocking',
    'Art Deco': 'art deco style, geometric patterns, gold and black palette, opulent',
    'Gotik': 'gothic aesthetic, dark and moody, dramatic shadows, mystical',
    'Bilim Kurgu': 'sci-fi aesthetic, high tech environment, futuristic lighting, metallic',
    'Retro Fütürizm': 'retro futurism, 80s sci-fi vision, synthwave colors',
    'Soyut': 'abstract background, surreal shapes, artistic composition, modern art',
    'Steampunk': 'steampunk aesthetic, bronze and copper tones, gears and industrial details',
    'Vaporwave': 'vaporwave aesthetic, pastel purple and pink tones, glitch effects, 90s digital art',
    'Bauhaus': 'bauhaus design, geometric forms, primary colors, functional and minimalist',
    'Rustik & Bohem': 'rustic and bohemian, natural textures, earth tones, ethnic patterns, warm atmosphere'
  };

  const selectedStyle = styleMapping[adStyle] || 'professional commercial photography';
  const brandInstruction = brand ? `Brand Identity: ${brand}.` : "High-end Brand Identity.";

  // Conditional Text Rendering Instruction
  let textRenderingInstruction = "";
  if (renderTextOnImage) {
    const textToRender = imageOverlayText || brand;
    if (textToRender) {
      textRenderingInstruction = `
      TEXT RENDERING TASK:
      You MUST render text "${textToRender}" clearly visible in image.
      - The text "${textToRender}" should be integrated artistically into environment (e.g., a neon sign, a wall logo, a shop window decal, or elegant typography in background).
      - Ensure spelling is EXACTLY "${textToRender}".
      - The style of text should match the ${selectedStyle} aesthetic.
      `;
    }
  } else {
    // Explicit negative prompt if not requested
    textRenderingInstruction = "IMPORTANT: DO NOT render any text, words, or logos on image. The image must be text-free.";
  }

  const userCustomInstruction = customPrompt
    ? `\nUSER CUSTOM INSTRUCTIONS (PRIORITY): ${customPrompt}`
    : "";

  const technicalFeatures = analysis.ozellikler.join(', ');

  // CONSISTENCY LOGIC:
  const isMale = analysis.hedef_kitle.toLowerCase().includes('erkek') || analysis.hedef_kitle.toLowerCase().includes('men') || analysis.urun_kategorisi.toLowerCase().includes('erkek');

  // Enhanced detailed descriptions to force consistency across multiple calls
  const consistentModelDesc = isMale
    ? "A handsome 26-year-old male fashion model, 185cm tall, athletic build, sharp symmetrical jawline, specific short dark brown hair (cleanly tapered sides), deep brown eyes, and a neutral professional high-fashion expression. He has a very specific and consistent facial structure."
    : "A beautiful 24-year-old female fashion model, 175cm tall, slender and elegant build, long dark brown hair styled in a sleek professional low ponytail, almond-shaped hazel eyes, oval face with high cheekbones, and a sophisticated neutral expression. She has a very specific and consistent facial identity.";

  // STABILIZED RANDOM SEED GENERATION (Fixes Face Drifting)
  // We generate a deterministic seed based on the product name to keep the model consistent for this specific product across all shots.
  const productSeed = analysis.urun_adi.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) * 12345;
  const gender = isMale ? 'Male' : 'Female';

  // Base instruction allows human models, emphasizing SAFETY, PROFESSIONALISM and STRICT CONTINUITY
  const baseInstruction = `
  CONTEXT: Professional Commercial Fashion Photography Series.
  PURPOSE: High-End Brand Catalog (Multi-Shot Consistency is Mandatory).
  SUBJECT: ${analysis.urun_adi}.
  
  SYSTEM GUIDELINES: 
  - Generate a safe-for-work, professional retail image.
  - USE A REALISTIC HUMAN MODEL (Fashion Model).
  - NO sexually suggestive content, poses, or expressions.
  - Modest, elegant, and professional posing suitable for global commercial standards.

  *** STRICT MODEL IDENTITY LOCK (DO NOT CHANGE THE FACE) ***
  1. BIOMETRIC LOCK: You are generating the same specific individual for the "${analysis.urun_adi}" campaign.
  2. FACE: ${isMale ? 'Strong jawline, specific nose shape, dark brown eyes, short tapered hair.' : 'High cheekbones, specific almond eyes, defined chin, long dark hair.'}
  3. CONSISTENCY: Do not generate random faces. Use the Seed to lock facial structure.
  4. NO DRIFTING: Even if the pose changes, the person's identity (face, race, age) MUST remain 100% frozen.

   CHARACTER & CLOTHING CONTINUITY (ABSOLUTE RULES):
   1. CHARACTER CONSISTENCY: You MUST render the EXACT SAME PERSON in every frame. Facial features, hair texture/style, and body proportions must be 100% identical as if shot in the same session.
   2. CLOTHING FIDELITY: The clothing piece (${analysis.urun_adi}) must be the EXACT SAME garment from the reference image. Do not change seams, buttons, drapery patterns, or structural details.
   3. NO DRIFT: Do not allow the model's face or the garment's design to drift or vary between different poses.

   TASK: ${brandInstruction} Visualize the product from reference image worn by the specific model described below.
   
   PRODUCT PRESERVATION RULES (ABSOLUTE):
   1. CRITICAL: The product design, cut, and silhouette MUST BE 100% IDENTICAL to the reference image. No exceptions.
   2. ZERO ALTERATION: Do not change neckline, sleeve length, pocket placement, stitch lines, or hem of the product. It must be the exact same physical unit.
   3. COLOR/TEXTURE FIDELITY: The product color/texture MUST match the reference (or the specific transformation requested below) exactly.
   4. MATERIAL: Emphasize the ${analysis.malzeme} texture with extreme high-fidelity detail.
   
   *** CRITICAL: TEXT, LOGO & DETAIL FIDELITY (HIGHEST PRIORITY) ***
   The following details from the reference image MUST be reproduced with PIXEL-PERFECT accuracy:
   ${analysis.urun_uzerindeki_yazilar?.length > 0 ? `
   TEXT ON PRODUCT (REPRODUCE EXACTLY - ZERO SPELLING ERRORS):
   ${analysis.urun_uzerindeki_yazilar.map((t: string, i: number) => `   ${i + 1}. "${t}" - Reproduce this text CHARACTER BY CHARACTER. Every letter, every number, every space must be EXACTLY as shown. NO misspelling, NO rearranging, NO omitting any character.`).join('\n')}
   TEXT RENDERING RULES:
   - Each character must be the EXACT same font style, weight, and size as in the reference.
   - Text color must match the original precisely.
   - Text position/placement on the garment must be identical.
   - If text is curved, angled, or styled, replicate that exact styling.
   - DOUBLE-CHECK every letter before finalizing. Spelling errors are UNACCEPTABLE.
   ` : ''}
   ${analysis.urun_uzerindeki_logolar?.length > 0 ? `
   LOGOS ON PRODUCT (REPRODUCE WITH SURGICAL PRECISION):
   ${analysis.urun_uzerindeki_logolar.map((l: string, i: number) => `   ${i + 1}. ${l} - This logo must be reproduced with pixel-level fidelity. Every curve, every color, every proportion must match the reference exactly.`).join('\n')}
   LOGO RENDERING RULES:
   - Logo proportions (width:height ratio) must be EXACT.
   - Logo colors must be IDENTICAL to the reference (no approximation).
   - Logo placement and size relative to the garment must match perfectly.
   - Internal details of logos (small elements, thin lines, dots) must NOT be lost or simplified.
   - If a logo has text inside it, that text must be spelled correctly.
   ` : ''}
   ${analysis.ozel_detaylar?.length > 0 ? `
   CONSTRUCTION DETAILS (PRESERVE ALL):
   ${analysis.ozel_detaylar.map((d: string, i: number) => `   ${i + 1}. ${d}`).join('\n')}
   - Every zipper, button, stitch pattern, hardware piece, and structural element must be visible and accurate.
   ` : ''}
   ${analysis.urun_uzerindeki_baskialar?.length > 0 ? `
   PRINTS & GRAPHICS (EXACT REPRODUCTION):
   ${analysis.urun_uzerindeki_baskialar.map((b: string, i: number) => `   ${i + 1}. ${b} - Reproduce with full fidelity including colors, gradients, and fine details.`).join('\n')}
   ` : ''}
   ${analysis.urun_uzerindeki_etiketler?.length > 0 ? `
   VISIBLE LABELS/TAGS:
   ${analysis.urun_uzerindeki_etiketler.map((e: string, i: number) => `   ${i + 1}. ${e}`).join('\n')}
   ` : ''}
   
   MODEL IDENTIFICATION:
   - Reference Model: **${consistentModelDesc}**
   
   TECHNICAL QUALITY: ${selectedStyle}. 8k resolution, hyper-realistic, sharp focus, professional three-point lighting, clean textures.
   
   ${textRenderingInstruction}
    
    *** ÜRÜN VE MODEL DEĞİŞMEZLİK KURALLARI (TÜM KARELER İÇİN) ***
    - Model yüzü: AYNI kişi, AYNI yüz hatları, AYNI ifade. Hiçbir karede farklı yüz ÜRETME.
    - Kıyafet: Referans görseldeki AYNI kıyafet, AYNI renk, AYNI desen, AYNI kesim. Hiçbir detay değişmez.
    - Aksesuarlar: Referans görseldeki tüm aksesuarlar her karede AYNI.
    
   ${userCustomInstruction}
   `;

  // Pre-process Color Variations
  let colorList: string[] = [];
  if (ecommerceColorVariations && ecommerceColorVariations.trim().length > 0) {
    colorList = ecommerceColorVariations.split(',').map(c => c.trim()).filter(c => c.length > 0);
  }

  // Check if Pattern is active (file uploaded)
  const isPatternActive = !!ecommercePatternImage;

  // Branch Logic: E-commerce Mode vs Campaign Mode
  if (mode === 'ecommerce') {
    const backgroundInstruction = `
    *** MANDATORY IDENTICAL BACKGROUND FOR ALL SHOTS (DO NOT CHANGE BETWEEN POSES) ***
    STUDIO SETUP: The EXACT SAME professional photography studio for every single shot in this series.
    - BACKGROUND: Seamless #F0F0F0 light gray cyclorama wall curving into floor. No seams, no edges, no props, no distractions.
    - FLOOR: Same seamless light gray surface, slightly reflective to show subtle shadow/reflection of model.
    - LIGHTING: Identical 3-point softbox studio lighting setup for every frame:
      * Key light: Large octabox at 45° camera-right, soft diffused white light.
      * Fill light: Medium softbox at 30° camera-left, 2 stops below key.  
      * Rim/Hair light: Strip softbox from above-behind for edge separation.
    - COLOR TEMPERATURE: 5500K daylight balanced, consistent across all frames.
    - ATMOSPHERE: Clean, professional, distraction-free. NO gradient shifts, NO color variations between shots.
    
    *** STÜDYO TEMİZLİĞİ KURALLARI (MUTLAK) ***
    - Işık kaynakları (softbox, ring light, strobe), tripodlar, standlar, kablolar, yansıtıcılar ASLA görünmeyecek.
    - Arka planda SADECE temiz, pürüzsüz, tek renk cyclorama duvarı olacak.
    - Kamera ekipmanları, reflektörler, c-stand'ler, ışık diffizerlerı KESİNLİKLE kadraja girmeyecek.
    
    CRITICAL: The background, lighting, and overall studio environment must be PIXEL-PERFECT IDENTICAL in every image. Only the model's POSE changes.
    
    *** MODEL VE KİYASET SABİTLİĞİ KURALLARI (DEĞİŞMEZ) ***
    1. MODEL YÜZÜ: Tüm karelerde AYNI YÜZ. Yüz hatları, burun şekli, göz rengi, kaş yapısı, dudak şekli %100 aynı. Yüz hiçbir karede DEĞİŞMEZ.
    2. VÜCUT ÖLÇÜLERİ: Boy, kilo, omuz genişliği, bel ölçüsü tüm karelerde AYNI.
    3. KİYASET: Modelin üzerindeki kıyafet (${analysis.urun_adi}) HER karede BİREBİR AYNI. Renk, desen, kesim, dikiş, düğme, fermuarlar DEĞİŞMEZ.
    4. AKSESUARLAR: Eğer modelite aksesuar varsa (saat, kolye, yüzük, kemer) tüm karelerde AYNI aksesuar AYNI konumda.
    5. SAÇ: Saç stili, saç rengi, saç uzunluğu tüm karelerde DEĞİŞMEZ.
    6. MAKYAJ: Makyaj stili ve tonu tüm karelerde AYNI.
    
    *** YAKIN PLAN ÇEKİM HASSASİYETİ ***
    - Yakın plan çekimlerde ürün rengi, dokusu, deseni EKSTRA hassasiyetle korunmalı.
    - Kumaş dokusu, iplik detayları, baskı kalitesi piksel düzeyinde doğru olmalı.
    - Renk sıcaklığı diğer karelerle BİREBİR AYNI olmalı.`;


    // 12 Distinct Poses for E-commerce - REORDERED for Better Default Selection (First 8)
    const allPoses = [
      { id: 1, type: "Önden Görünüm (Front)", desc: "Full front view. Model looking at camera. Symmetrical. Neutral standing pose." },
      { id: 2, type: "Arkadan Görünüm (Back)", desc: "Back view of model. Show back details and cut. Neutral standing pose." },
      { id: 3, type: "Yan Profil (Side)", desc: "Side profile view of model. Show silhouette and side details." },
      { id: 4, type: "Kullanım Anı (Lifestyle Walking)", desc: "Model in slight motion, walking towards camera. Natural drape of fabric." },
      { id: 5, type: "Tam Boy (Full Body)", desc: "Full body shot of model showing entire look + shoes. Professional pose." },
      { id: 6, type: "Kumaş/Doku Detayı (Close-up)", desc: "Close-up macro shot of fabric. Focus on texture. (Model may be cropped)" },
      { id: 7, type: "Sanatsal Duruş (Artistic)", desc: "A creative fashion pose, slight asymmetry, magazine editorial style." },
      { id: 8, type: "Oturma Pozu (Sitting)", desc: "Model sitting elegantly on a minimalist prop/chair. Relaxed posture." },
      // Secondary options (appear if count > 8)
      { id: 9, type: "Çapraz Açı (45-degree)", desc: "Model standing at a 45-degree angle. Highlights both front and side details." },
      { id: 10, type: "Aksesuar/El Detayı (Detail)", desc: "Mid-shot focusing on how model interacts with product (e.g., hand in pocket or holding fabric)." },
      { id: 11, type: "Omuz Üstü Bakış (Over Shoulder)", desc: "Model turning head over shoulder. Artistic and elegant angle." },
      { id: 12, type: "Alt Açı (Low Angle)", desc: "Slight low angle shot to make model look taller and powerful." }
    ];

    const targetCount = Math.min(Math.max(ecommercePhotoCount || 8, 6), 12);
    const selectedPoses = allPoses.slice(0, targetCount);

    return selectedPoses.map((p, index) => {
      let transformationInstruction = "";
      let variantName = "";

      // Logic: If Pattern exists, it applies to ALL poses (unless mixed with colors, but usually pattern overrides).
      // If no pattern, check colors.

      if (isPatternActive) {
        variantName = " - (Pattern Applied)";
        transformationInstruction = `
         IMPORTANT TRANSFORMATION TASK (TEXTURE MAPPING):
         1. A dedicated PATTERN REFERENCE IMAGE is provided (Image 3 or Image 2).
         2. You must TEXTURE MAP this pattern onto ${analysis.urun_adi}.
         3. REALISM CRITERIA:
            - The pattern must follow physical folds, wrinkles, and curves of fabric.
            - Retain the original sheen (shiny/matte), light reflection, and material properties of ${analysis.malzeme}.
            - DO NOT simply overlay flatly; integrate it with lighting and shadows (Ambient Occlusion).
            - The pattern should warp correctly around the model's body shape.
         `;
      } else if (colorList.length > 0) {
        const colorIndex = index % colorList.length;
        const selectedColor = colorList[colorIndex];

        variantName = ` - ${selectedColor}`;
        transformationInstruction = `
        IMPORTANT TRANSFORMATION TASK (COLOR CHANGE):
        CHANGE THE PRODUCT COLOR TO: **${selectedColor}**.
        - Keep the exact fabric texture (${analysis.malzeme}), sheen, and design.
        - Replace the original color (${analysis.ana_renk}) with ${selectedColor}.
        `;
      }

      return {
        id: p.id,
        type: `${p.type}${variantName}`,
        text: `${baseInstruction}
        
        ${transformationInstruction}

        POSE: ${p.desc}
        ${backgroundInstruction}`
      };
    });

  } else {
    // Campaign Mode
    const allEnvironments = [
      {
        id: 1,
        type: "Şehir & Sokak Modası",
        text: `ENVIRONMENT: Urban street, stylish city vibe. Blurred background (bokeh).
        POSE: Model walking confidently or looking at camera.
        LIGHTING: Natural daylight.`
      },
      {
        id: 2,
        type: "Cafe & Lifestyle",
        text: `ENVIRONMENT: Luxury cafe terrace or stylish interior.
        POSE: Model sitting comfortably, drinking coffee or reading.
        LIGHTING: Soft interior lighting.`
      },
      {
        id: 3,
        type: "Doğa & Manzara",
        text: `ENVIRONMENT: Nature, park, or beach at golden hour.
        POSE: Model leaning lightly, peaceful and aesthetic.
        LIGHTING: Cinematic warm and romantic sun flare.`
      },
      {
        id: 4,
        type: "Yaratıcı Stüdyo & Editorial",
        text: `ENVIRONMENT: Creative fashion studio. Solid color or textured artistic background.
        POSE: High-fashion editorial pose, dramatic and bold.
        LIGHTING: High contrast, dramatic studio lighting.`
      },
      {
        id: 5,
        type: "Modern Mimari",
        text: `ENVIRONMENT: Minimalist concrete architecture or modern museum exterior.
        POSE: Model standing straight, aligning with architectural lines.
        LIGHTING: Sharp, clean daylight.`
      },
      {
        id: 6,
        type: "Gece & Neon Şehir",
        text: `ENVIRONMENT: City skyline at night with bokeh city lights or neon signs.
        POSE: Model looking distant or mysterious.
        LIGHTING: Cool blue and purple ambient light with rim lighting.`
      },
      {
        id: 7,
        type: "Lüks İç Mekan",
        text: `ENVIRONMENT: High-end hotel lobby or luxury penthouse living room.
        POSE: Elegant standing or sitting pose on expensive furniture.
        LIGHTING: Warm, inviting indoor luxury lighting.`
      },
      {
        id: 8,
        type: "Soyut Sanat Fonu",
        text: `ENVIRONMENT: Abstract geometric shapes or painted canvas background.
        POSE: Dynamic movement or artistic fashion pose.
        LIGHTING: Studio softbox with colored gels.`
      },
      {
        id: 9,
        type: "Tarihi Atmosfer",
        text: `ENVIRONMENT: Old town street with cobblestones or historic building facade.
        POSE: Timeless fashion pose, looking away.
        LIGHTING: Soft overcast daylight.`
      },
      {
        id: 10,
        type: "Gökyüzü & Rooftop",
        text: `ENVIRONMENT: Rooftop with clear blue sky or sunset gradient background.
        POSE: Heroic low angle shot against the sky.
        LIGHTING: Bright sunlight.`
      }
    ];

    const targetCount = Math.min(Math.max(campaignStyleCount || 4, 4), 10);
    const selectedEnvironments = allEnvironments.slice(0, targetCount);

    return selectedEnvironments.map((env, index) => {
      let transformationInstruction = "";
      let variantName = "";

      if (isPatternActive) {
        variantName = " - (Pattern)";
        transformationInstruction = `
         IMPORTANT: Apply the provided PATTERN from reference image to the clothing.
         Ensure realistic texture mapping, preserving folds, wrinkles, and lighting interactions.
         The pattern must follow the garment's surface geometry.
         `;
      } else if (colorList.length > 0) {
        const colorIndex = index % colorList.length;
        const selectedColor = colorList[colorIndex];

        variantName = ` - ${selectedColor}`;
        transformationInstruction = `
        IMPORTANT: CHANGE PRODUCT COLOR TO **${selectedColor}**.
        Keep the original fabric texture and sheen.
        `;
      }

      return {
        id: env.id,
        type: `${env.type}${variantName}`,
        text: `${baseInstruction}
        
        ${transformationInstruction}

        *** KAMPANYA SERİSİ TUTARLILIK KURALI ***
        Mekan ve sahne değişse bile:
        - AYNI model, AYNI yüz, AYNI vücut ölçüleri.
        - AYNI kıyafet (${analysis.urun_adi}), AYNI renk, AYNI desen, AYNI kesim.
        - AYNI aksesuarlar, AYNI saç stili, AYNI makyaj.
        Sadece MEKAN ve POZ değişir, MODEL ve KIYAFETİ DEĞİŞMEZ.

        ${env.text}`
      }
    });
  }
};

// 3. Generate Image with Safe Human Fallback
export const generateAdImage = async (
  prompt: string,
  referenceImageB64: string,
  referenceImageMimeType: string,
  optionalImageB64: string | null,
  optionalImageMimeType: string | null,
  model: ImageModel = 'gemini-3-pro-image-preview',
  aspectRatio: string = '16:9',
  patternImageB64?: string | null,
  patternImageMimeType?: string | null,
  seed?: number // Seed will be auto-calculated if not provided, for consistency
): Promise<string> => {
  checkApiKey();
  const ai = new GoogleGenAI({ apiKey: API_KEY });

  // Use provided seed or generate deterministic seed from prompt to lock identity
  // This ensures that if the user retries with the same prompt, they get the same model face.
  const effectiveSeed = seed || (prompt.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) * 12345) % 2000000000;

  // Reusable generation function
  const attemptGeneration = async (promptText: string) => {
    const parts: any[] = [];

    // 1. Main Product Image
    parts.push({
      inlineData: {
        mimeType: referenceImageMimeType,
        data: referenceImageB64
      }
    });

    // 2. Optional Secondary Image
    if (optionalImageB64 && optionalImageMimeType) {
      parts.push({
        inlineData: {
          mimeType: optionalImageMimeType,
          data: optionalImageB64
        }
      });
    }

    // 3. Pattern Image (New)
    if (patternImageB64 && patternImageMimeType) {
      parts.push({
        inlineData: {
          mimeType: patternImageMimeType,
          data: patternImageB64
        }
      });
    }

    // MASTER DETAIL FIDELITY INSTRUCTION (appended to ALL prompts)
    const detailFidelityBlock = `
    
    *** ABSOLUTE DETAIL FIDELITY RULES (APPLY TO EVERY GENERATION) ***
    STUDY the reference image(s) with EXTREME attention to detail before generating:
    
    1. TEXT FIDELITY (ZERO TOLERANCE FOR ERRORS):
       - ANY text, letters, numbers, words visible on the product MUST be reproduced CHARACTER BY CHARACTER.
       - Spelling must be 100% correct - double-check every single letter.
       - Font style, font weight, font size, text color, and text placement must EXACTLY match the reference.
       - If text is curved, embossed, printed, or embroidered, replicate that exact technique.
       - Common error to AVOID: Do NOT hallucinate, add, remove, or misspell any text.
    
    2. LOGO FIDELITY (SURGICAL PRECISION):
       - Every logo, brand mark, emblem, or symbol must be reproduced with pixel-level accuracy.
       - Logo proportions (aspect ratio) must be EXACT - do not stretch or compress.
       - Logo colors must be IDENTICAL to the reference.  
       - Internal details of logos (thin lines, small dots, curves, negative space) must NOT be simplified or lost.
       - Logo placement and size relative to the garment must be precisely maintained.
    
    3. CONSTRUCTION DETAIL FIDELITY:
       - ALL buttons (count, material, color, size, placement) must match exactly.
       - ALL zippers (color, type, length, pull style) must be accurate.
       - Stitch patterns, seam lines, and topstitching must be visible and correct.
       - Hardware (buckles, clasps, rivets, grommets, snaps) must be reproduced faithfully.
       - Pockets (type, position, flap style) must match the reference precisely.
       - Collar/neckline shape, cuffs, hems must be identical.
    
    4. PRINT/GRAPHIC FIDELITY:
       - Any prints, graphics, embroideries, or patches must be reproduced in full detail.
       - Colors, gradients, and fine lines within prints must be accurate.
       - Scale and position of graphics on the garment must match exactly.
    `;

    let finalPrompt = promptText + detailFidelityBlock;

    // Logic for Multi-Image Prompts
    if (optionalImageB64 && patternImageB64) {
      finalPrompt = `TASK: Use three reference images provided.
      IMAGE 1: MAIN PRODUCT - Study ALL text, logos, and details on this product carefully.
      IMAGE 2: SECONDARY REFERENCE (Back view or Accessory).
      IMAGE 3: PATTERN/TEXTURE REFERENCE.
      
      INSTRUCTION:
      1. Visualize the main product (Image 1) being worn.
      2. Incorporate elements from Image 2 naturally.
      3. CRITICAL TEXTURE MAPPING: 
         - Apply the PATTERN from Image 3 onto the fabric of the product in Image 1.
         - GEOMETRY PRESERVATION: The pattern must curve and distort perfectly around the folds, creases, and body shape of the model.
         - LIGHTING INTEGRATION: The pattern must respond to the scene's lighting (gloss, shadows, ambient occlusion) exactly like the original material.
      4. DETAIL PRESERVATION: Even with pattern applied, preserve all logos, text, labels, and hardware from Image 1 exactly as they appear.
      ${detailFidelityBlock}
      
      SCENE DESCRIPTION:
      ${promptText}`;
    } else if (optionalImageB64) {
      finalPrompt = `TASK: Use two reference images provided.
      IMAGE 1: MAIN PRODUCT - Study ALL text, logos, and details on this product carefully.
      IMAGE 2: SECONDARY REFERENCE (Back view or Accessory).
      Instruction: Incorporate elements from both images naturally into the scene.
      CRITICAL: All text, logos, labels, and construction details from Image 1 MUST be preserved exactly.
      ${detailFidelityBlock}
      
      SCENE DESCRIPTION:
      ${promptText}`;
    } else if (patternImageB64) {
      finalPrompt = `TASK: Virtual Try-On / Texture Replacement.
      IMAGE 1: MAIN PRODUCT (Model wearing original item) - Study ALL text, logos, and details carefully.
      IMAGE 2: PATTERN SWATCH (Texture Source).
      
      CRITICAL EXECUTION TASK:
      1. Identify the garment in Image 1.
      2. Replace the surface texture of that garment with the PATTERN from Image 2.
      3. PRESERVE GEOMETRY: Keep all original folds, creases, seams, buttons, and the exact silhouette of the clothing.
      4. MATERIAL PHYSICS: The new pattern must behave like the original fabric (e.g., if silk, keep shine; if cotton, keep matte look).
      5. LIGHTING: Ensure the pattern has correct shadows and highlights based on the environment.
      6. DETAIL PRESERVATION: Even with new pattern, ALL logos, text, labels, buttons, zippers, hardware must remain EXACTLY as in Image 1.
      ${detailFidelityBlock}
      
      SCENE DESCRIPTION:
      ${promptText}`;
    }

    parts.push({ text: finalPrompt });

    const response = await ai.models.generateContent({
      model: model,
      contents: { parts },
      config: {
        safetySettings: PERMISSIVE_SAFETY_SETTINGS,
        seed: effectiveSeed,
        imageConfig: {
          imageSize: '2K',
          aspectRatio: aspectRatio,
        }
      }
    });

    const candidate = response.candidates?.[0];

    if (!candidate) {
      throw new Error("Model yanıt vermedi.");
    }

    // Success case
    for (const part of candidate.content?.parts || []) {
      if (part.inlineData) {
        const mimeType = part.inlineData.mimeType || 'image/png';
        return `data:${mimeType};base64,${part.inlineData.data}`;
      }
    }

    // Safety refusal case
    if ((candidate.finishReason as string) === 'SAFETY' || (candidate.finishReason as string) === 'IMAGE_SAFETY' || (candidate.finishReason as string) === 'IMAGE_OTHER') {
      throw new Error("SAFETY_BLOCK");
    }

    throw new Error("Görsel oluşturulamadı.");
  };

  // Retry helper with exponential backoff
  const retryWithDelay = async (fn: () => Promise<string>, retries: number = 3, delayMs: number = 3000): Promise<string> => {
    try {
      return await fn();
    } catch (error: any) {
      if (retries <= 0) throw error;

      const errorMsg = error?.message?.toLowerCase() || String(error).toLowerCase();
      const statusCode = error?.status || error?.code;

      // 503/UNAVAILABLE/high demand — sunucu yoğunluğunda retry yap
      const isServerOverloaded =
        statusCode === 503 || statusCode === 429 ||
        errorMsg.includes('503') ||
        errorMsg.includes('429') ||
        errorMsg.includes('unavailable') ||
        errorMsg.includes('high demand') ||
        errorMsg.includes('overloaded') ||
        errorMsg.includes('resource_exhausted') ||
        errorMsg.includes('rate limit') ||
        errorMsg.includes('too many requests');

      if (isServerOverloaded) {
        console.warn(`🔄 Sunucu yoğun (503/429), ${delayMs}ms sonra tekrar deneniyor... (${retries} deneme kaldı)`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
        return retryWithDelay(fn, retries - 1, delayMs * 1.5);
      }

      // For INVALID_ARGUMENT, wait longer and retry
      if (error.message?.includes('INVALID_ARGUMENT') || error.status === 'INVALID_ARGUMENT') {
        console.warn(`INVALID_ARGUMENT error, retrying in ${delayMs}ms... (${retries} retries left)`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
        return retryWithDelay(fn, retries - 1, delayMs * 1.5);
      }
      throw error;
    }
  };

  try {
    // Attempt 1: Try generating what the user asked for (Standard Human Model)
    return await retryWithDelay(() => attemptGeneration(prompt));
  } catch (error: any) {
    if (error.message === 'SAFETY_BLOCK' || error.message.includes('SAFETY')) {
      // Attempt 2: "SAFE HUMAN" Fallback
      console.warn("Safety block detected. Falling back to 'Safe Human / Wide Shot' strategy.");

      const fallbackPrompt = `
      CRITICAL RE-GENERATION TASK:
      The previous image was blocked by safety filters.
      
      NEW STRATEGY: RENDER A REALISTIC HUMAN FASHION MODEL (NOT A MANNEQUIN).
      
      TO ENSURE SAFETY COMPLIANCE:
      1. Use a WIDE ANGLE / LONG SHOT (Do not zoom in on body parts).
      2. Pose must be "High Fashion Editorial" - rigid, artistic, and completely non-suggestive.
      3. Use DRAMATIC LIGHTING or SILHOUETTE lighting if necessary to reduce skin exposure detail while keeping the fashion visible.
      4. If the product is swimwear/lingerie, treat it as "Artistic Swim" or "High-End Lounge" with appropriate cover-ups or props if needed to pass filters.
      5. Aesthetic: Hyper-realistic 3D Render style (Unreal Engine 5) - this often passes filters better than photo-realism while looking like a live model.
      
      Original Task Context: ${prompt}
      `;

      return await retryWithDelay(() => attemptGeneration(fallbackPrompt));
    }

    // Attempt 3: If INVALID_ARGUMENT persists, try with simplified prompt (shorter)
    if (error.message?.includes('INVALID_ARGUMENT') || error.message?.includes('invalid argument')) {
      console.warn("INVALID_ARGUMENT persisted. Retrying with simplified prompt...");

      // Strip the prompt to essentials only
      const simplifiedPrompt = `Professional fashion photography.
Subject: Fashion model wearing the product shown in the reference image.
Style: High-end commercial catalog photo.
Quality: 8K, hyper-realistic, sharp focus, studio lighting.
Pose: ${prompt.match(/POSE:\s*([^\n]+)/)?.[1] || 'Natural standing pose, front view.'}
${prompt.match(/ENVIRONMENT:\s*([^\n]+)/)?.[1] ? 'Environment: ' + prompt.match(/ENVIRONMENT:\s*([^\n]+)/)?.[1] : 'Background: Clean studio background.'}
IMPORTANT: Preserve the exact product design, color, and details from the reference image.`;

      return await attemptGeneration(simplifiedPrompt);
    }

    // 🔄 FAL.AI GÖRSEL FALLBACK — Tüm Gemini denemeleri başarısız olunca
    const errMsg = error?.message?.toLowerCase() || '';
    const isServerIssue = errMsg.includes('server_overloaded') || errMsg.includes('503') ||
      errMsg.includes('unavailable') || errMsg.includes('high demand') ||
      errMsg.includes('429') || errMsg.includes('overloaded');

    if (isServerIssue) {
      try {
        const { falGenerateImage, hasFalApiKey } = await import('./falaiService');
        if (hasFalApiKey()) {
          console.log('🔀 Tüm Gemini denemeleri başarısız, Fal.ai AdGenius fallback devreye giriyor...');
          window.dispatchEvent(new CustomEvent('fal-fallback-active', {
            detail: { message: '🔄 Ana sunucu yoğun, alternatif AI sunucusuna geçiliyor... Bu işlem biraz daha uzun sürebilir, özür dileriz.' }
          }));
          const result = await falGenerateImage(prompt, { imageSize: '1024x1024' });
          window.dispatchEvent(new CustomEvent('fal-fallback-success', {
            detail: { message: '✅ Reklam görseli alternatif sunucu ile başarıyla oluşturuldu.' }
          }));
          return result;
        }
      } catch (falErr: any) {
        console.error('❌ Fal.ai AdGenius fallback da başarısız:', falErr.message);
        window.dispatchEvent(new CustomEvent('fal-fallback-failed', {
          detail: { message: '❌ Alternatif sunucu da yanıt veremedi. Lütfen birkaç dakika sonra tekrar deneyin.' }
        }));
      }
    }

    throw error;
  }
};

// 4. Generate Video using Veo
export const generateAdVideo = async (
  imageB64Data: string,
  promptType: string,
  model: VideoModel = 'veo-3.1-fast-generate-preview',
  aspectRatio: string = '16:9',
  onProgress?: (progress: number) => void
): Promise<string> => {
  checkApiKey();
  const ai = new GoogleGenAI({ apiKey: API_KEY });

  // Detect and normalize mime type from base64 data
  let mimeType = 'image/png';
  const mimeMatch = imageB64Data.match(/^data:image\/(png|jpeg|webp);base64,/);
  if (mimeMatch) {
    mimeType = `image/${mimeMatch[1]}`;
  }
  const cleanB64 = imageB64Data.replace(/^data:image\/(png|jpeg|webp);base64,/, "");

  // Focused commercial video prompt
  const videoPrompt = `Cinematic fashion commercial video. Subject: The fashion product/model shown in image. Action: Very subtle, elegant, slow-motion movement. Atmosphere: ${promptType}. Quality: High resolution, photorealistic, professional fashion photography lighting, magazine quality.`;

  // Negative prompt to avoid unwanted content
  const negativePrompt = 'blurry, low quality, distorted, deformed, ugly, amateur, watermark, text overlay, logo, rapid movement, shaky camera, horror, violent';

  const MAX_RETRIES = 2;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      if (attempt > 1) {
        console.log(`Video üretim denemesi ${attempt}/${MAX_RETRIES}...`);
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 5000));
      }

      let operation = await ai.models.generateVideos({
        model: model,
        image: {
          imageBytes: cleanB64,
          mimeType: mimeType
        },
        prompt: videoPrompt,
        config: {
          numberOfVideos: 1,
          aspectRatio: aspectRatio as any,
          // personGeneration kaldırıldı — Veo API artık 'allow_all' desteklemiyor
          negativePrompt: negativePrompt,
          durationSeconds: 4,
        }
      });

      // Poll for completion
      let pollCount = 0;
      const maxPolls = 60; // ~10 minutes max

      while (!operation.done) {
        pollCount++;

        if (pollCount > maxPolls) {
          throw new Error('Video üretim zaman aşımına uğradı (10 dakika).');
        }

        // Report progress: map polls to 50% -> 95% range
        if (onProgress) {
          const currentBase = 50;
          const remainingSpace = 45;
          const estimatedCompletion = 15;
          let increment = (pollCount / estimatedCompletion) * remainingSpace;
          if (increment > remainingSpace) increment = remainingSpace;
          onProgress(Math.floor(currentBase + increment));
        }

        await new Promise(resolve => setTimeout(resolve, 10000));

        try {
          const updatedOp = await ai.operations.getVideosOperation({ operation: operation });
          operation = updatedOp;

          if (operation.error) {
            const errMsg = String(operation.error.message || 'Bilinmeyen API hatası');
            console.error("Video operation error:", errMsg);
            throw new Error(errMsg);
          }
        } catch (pollErr: any) {
          // If it's already our thrown error, rethrow
          if (pollErr.message && !pollErr.message.includes('fetch')) {
            throw pollErr;
          }
          // Network/fetch errors during polling - retry poll
          console.warn(`Video polling geçici hata (deneme ${pollCount}):`, pollErr.message);
          // Continue polling - don't abort on transient network issues
          continue;
        }
      }

      if (onProgress) onProgress(98);

      // Double check error after loop
      if (operation.error) {
        throw new Error(String(operation.error.message || 'Video API hatası'));
      }

      // Extract video URI with multiple fallback paths
      const responseData = operation.response || (operation as any).result;

      // Try multiple paths for video data
      const videoFile = responseData?.generatedVideos?.[0]?.video;
      const videoUri = videoFile?.uri;

      if (!videoUri) {
        // Check for RAI (Responsible AI) filters
        const raiReasons = responseData?.raiMediaFilteredReasons ||
          responseData?.generatedVideos?.[0]?.raiMediaFilteredReason;

        if (raiReasons) {
          const reasons = Array.isArray(raiReasons) ? raiReasons : [raiReasons];
          if (reasons.length > 0 && reasons[0]) {
            const reason = String(reasons[0]);
            if (reason.toLowerCase().includes("celebrity")) {
              throw new Error("Güvenlik Filtresi: Görselde ünlü kişi benzerliği algılandı. Farklı bir görsel deneyin.");
            }
            if (reason.toLowerCase().includes("child") || reason.toLowerCase().includes("minor")) {
              throw new Error("Güvenlik Filtresi: Çocuk içeriği tespit edildi. Sadece yetişkin modeller kullanılabilir.");
            }
            throw new Error(`Video güvenlik filtresine takıldı: ${reason}`);
          }
        }

        // Log debug info
        console.error("Video tamamlandı ama URI bulunamadı. Yanıt:", JSON.stringify(operation, null, 2));
        throw new Error("Video üretimi tamamlandı ancak video bağlantısı alınamadı. Lütfen tekrar deneyin.");
      }

      // Download video - correctly handle URI with/without query params
      try {
        const separator = videoUri.includes('?') ? '&' : '?';
        const videoUrl = `${videoUri}${separator}key=${API_KEY}`;

        const videoRes = await fetch(videoUrl);
        if (!videoRes.ok) {
          // If 403/404, try without key (some URIs are pre-signed)
          if (videoRes.status === 403 || videoRes.status === 404) {
            const retryRes = await fetch(videoUri);
            if (!retryRes.ok) {
              throw new Error(`Video indirilemedi (Status: ${retryRes.status})`);
            }
            const blob = await retryRes.blob();
            return URL.createObjectURL(blob);
          }
          throw new Error(`Video indirilemedi (Status: ${videoRes.status})`);
        }

        const blob = await videoRes.blob();
        if (blob.size < 1000) {
          throw new Error('İndirilen video dosyası çok küçük, bozuk olabilir.');
        }

        return URL.createObjectURL(blob);
      } catch (downloadErr: any) {
        throw new Error(`Video indirme hatası: ${downloadErr.message}`);
      }

    } catch (err: any) {
      lastError = err;
      console.error(`Video üretim hatası (deneme ${attempt}/${MAX_RETRIES}):`, err.message);

      const noRetryPatterns = ['güvenlik filtre', 'ünlü', 'çocuk', 'api key', 'api anahtarı', 'raimedialfiltered', 'invalid_argument', 'not supported', 'out of bound'];
      const lowerMsg = err.message?.toLowerCase() || '';
      if (noRetryPatterns.some(p => lowerMsg.includes(p))) {
        throw err; // Non-retryable error
      }

      if (attempt === MAX_RETRIES) {
        // 🔄 FAL.AI VIDEO FALLBACK
        const errorMsg = err.message?.toLowerCase() || '';
        const isServerIssue = errorMsg.includes('503') || errorMsg.includes('unavailable') ||
          errorMsg.includes('overloaded') || errorMsg.includes('high demand') ||
          errorMsg.includes('429') || errorMsg.includes('zaman aşımı');

        if (isServerIssue) {
          try {
            const { falGenerateVideo, hasFalApiKey } = await import('./falaiService');
            if (hasFalApiKey()) {
              console.log('🔀 Veo başarısız, Fal.ai AdGenius video fallback devreye giriyor...');
              window.dispatchEvent(new CustomEvent('fal-fallback-active', {
                detail: { message: '🔄 Video sunucusu yoğun, alternatif AI sunucusuna geçiliyor... Bu işlem biraz daha uzun sürebilir, özür dileriz.' }
              }));

              const result = await falGenerateVideo(promptType, {
                imageUrl: `data:image/png;base64,${imageB64Data}`,
                duration: 5,
                aspectRatio,
              });

              window.dispatchEvent(new CustomEvent('fal-fallback-success', {
                detail: { message: '✅ Video alternatif sunucu ile başarıyla oluşturuldu.' }
              }));
              return result;
            }
          } catch (falErr: any) {
            console.error('❌ Fal.ai video fallback da başarısız:', falErr.message);
            window.dispatchEvent(new CustomEvent('fal-fallback-failed', {
              detail: { message: '❌ Alternatif video sunucusu da yanıt veremedi.' }
            }));
          }
        }

        throw new Error(`Video oluşturulamadı (${MAX_RETRIES} deneme sonrası): ${err.message}`);
      }
    }
  }

  // Fallback (should not reach here)
  throw lastError || new Error('Video oluşturulamadı.');
};

// Key Selection Helper
export const ensureApiKey = async (): Promise<boolean> => {
  // If API_KEY is present in env, we are good to go
  if (API_KEY) return true;

  const win = window as any;
  if (win.aistudio) {
    const hasKey = await win.aistudio.hasSelectedApiKey();
    if (!hasKey) {
      await win.aistudio.openSelectKey();
      return true;
    }
    return true;
  }
  return false;
};

