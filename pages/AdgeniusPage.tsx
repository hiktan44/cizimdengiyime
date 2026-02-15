/**
 * AdGenius Page - Reklam Kampanyaları ve E-Ticaret Ürün Fotoğrafları
 * Kredi sistemi entegrasyonuyla (Görsel = 1 kredi, Video = 3 kredi)
 */

import React, { useState, useCallback, useEffect } from 'react';
import { useTranslation, TranslationRecord } from '../lib/i18n';
import { UploadForm, ProcessingStep, ResultsGallery, PromptPreview } from './adgenius';

import { analyzeProductImage, generateAdPrompts, generateAdImage, generateAdVideo, ensureApiKey, fileToGoogleGenAIBase64 } from '../services/adgeniusService';
import { ProductAnalysis, AdPrompt, GenerationResult, FormData, AppStep, AdStyle, ImageModel, VideoModel, GenerationMode, AspectRatio } from './adgenius';
import { checkAndDeductCredits, saveGeneration, uploadBase64ToStorage, addCreditsToUser } from '../lib/database';

import { CREDIT_COSTS, Profile } from '../lib/supabase';

import { trackEvent, ANALYTICS_EVENTS } from '../utils/analytics';
import { Sparkles, Upload, BrainCircuit, Image as ImageIcon, Video, Loader2 } from 'lucide-react';

interface AdgeniusPageProps {
  profile: Profile | null;
  onRefreshProfile: () => void;
  onShowBuyCredits?: () => void;
}

const trAdgenius = {
  title: 'AdGenius - Yapay Zeka ile Reklam Üretimi',
  subtitle: 'Ürün fotoğrafını yükleyin, yapay zeka profesyonel reklam kampanyaları ve e-ticaret ürün fotoğrafları üretsin',
  modes: {
    campaign: '🎨 Reklam Kampanyası',
    ecommerce: '📦 E-Ticaret Paketi'
  },
  buttons: {
    start: 'Üretimi Başlat',
    downloadImage: 'Resmi İndir',
    downloadVideo: 'Videoyu İndir',
    copyTitle: 'Başlığı Kopyala',
    copied: 'Kopyalandı!',
    createCampaign: 'Yeni Kampanya Oluştur',
  },
  labels: {
    productName: 'Elbise veya Model Adı',
    brand: 'Ürünün Markası',
    customPrompt: 'Özel İstekler & Sahne Detayları (Opsiyonel)',
    productImage: 'Ürün Fotoğrafı (Zorunlu)',
    optionalImage: 'Ürünün Arkadan Görünümü / Aksesuar Ekleme (Opsiyonel)',
    outputPreference: 'Çıktı Tercihi',
    style: 'Reklam Stili / E-Ticaret Mekan Teması',
    aspectRatio: 'Görsel Boyutu / Oranı',
    colors: 'Renk Varyasyonları',
    pattern: 'Desen/Doku (Opsiyonel)',
    photoCount: 'E-Ticaret Poz Sayısı',
    campaignCount: 'Kampanya Stil Sayısı'
  },
  messages: {
    loginRequired: 'İşlem yapmak için giriş yapmalısınız.',
    insufficientCredits: 'Yetersiz kredi.',
    processing: 'İşleniyor...',
    generatingImage: 'Görseller üretiliyor...',
    generatingVideo: 'Videolar üretiliyor...',
    success: 'İşlem başarılı!',
    error: 'Bir hata oluştu',
    uploadProductImage: 'Lütfen önce bir ürün fotoğrafı yükleyin.',
    productNameRequired: 'Lütfen ürün adını girin.',
    apiKeyRequired: 'API anahtarı seçimi gereklidir.',
  },
  creditInfo: {
    imageCost: 'Görsel başı',
    videoCost: 'Video başı',
    totalImages: 'Toplam Görsel',
    totalVideos: 'Toplam Video',
    totalCredits: 'Harcanan Kredi',
    available: 'Mevcut',
    credits: 'kredi'
  },
  stats: {
    imagesGenerated: 'Oluşturulan Görsel',
    videosGenerated: 'Oluşturulan Video',
    creditsUsed: 'Harcanan Kredi'
  },
  preview: {
    title: 'Kampanya Detayları',
    subtitle: 'Oluşturulacak sahneleri ve mekanları gözden geçirin. İsterseniz her mekan için özel prompt girebilirsiniz.',
    editButton: 'Düzenle / Değiştir',
    confirmButton: 'Seçimleri Onayla ve Üretimi Başlat',
    location: 'Mekan / Sahne',
    promptPlaceholder: 'Örn: Modern bir stüdyoda, profesyonel ışıklandırma altında, model yürürken...',
    backButton: 'Geri Dön',
    customPromptLabel: 'Özel Sahne Promptu',
  },
  processing: {
    stepAnalyzing: 'Ürün Analizi',
    stepGenerating: 'Görsel & Video Üretimi',
    stepResults: 'Tamamlandı',
    ready: 'Hazır',
    analyzingAI: 'Yapay zeka ürün özelliklerini analiz ediyor...',
    allDone: 'Tüm işlemler başarıyla tamamlandı!',
    preparingQueue: 'Üretim kuyruğu hazırlanıyor...',
    preparingPrompts: 'Sahne kurgusu ve promptlar hazırlanıyor',
    generatingHD: 'Yüksek çözünürlüklü görseller üretiliyor',
    qualityCheck: 'Görseller işleniyor ve kalite kontrolü yapılıyor',
    videoAnimations: 'Veo modeli ile video animasyonları oluşturuluyor',
    refiningDetails: 'Detaylar iyileştiriliyor ve netleştiriliyor',
    compilingResults: 'Sonuçlar derleniyor',
    technicalData: 'Teknik Veriler',
    categoryStyle: 'Kategori & Stil',
    material: 'Materyal',
    colorAnalysis: 'Renk Analizi',
    targetAudience: 'Hedef Kitle',
    ecommerceContent: 'Hazır E-Ticaret İçeriği',
    productTitle: 'Ürün Başlığı',
    description: 'Açıklama',
    descriptionPreparing: 'Açıklama hazırlanıyor...',
    features: 'Öne Çıkan Özellikler',
    productFeatures: 'Ürün Özellikleri',
  },
  gallery: {
    bulkDownload: 'Toplu İndirme',
    imagesReady: 'görsel',
    videosReady: 'video',
    ready: 'hazır',
    downloadAllImages: 'Tüm Görselleri İndir',
    downloadAllVideos: 'Tüm Videoları İndir',
    downloading: 'İndiriliyor...',
    downloadAll: 'Hepsini İndir',
    album: 'Albüm...',
    createAlbum: 'Albüm Oluştur',
    downloadAlbum: 'Albümü İndir',
    downloadAlbumPNG: 'Albümü İndir (PNG)',
    hideAlbum: 'Albümü Gizle / Yeniden Oluştur',
    campaignAlbum: 'Kampanya Albümü',
    generatedContent: 'Üretilen İçerikler',
    imageLabel: 'Görsel',
    videoLabel: 'Video',
    videoError: 'Video Hatası',
    statusReady: 'Hazır',
    statusGeneratingImage: 'Görsel Üretiliyor...',
    statusGeneratingVideo: 'Video Üretiliyor...',
    statusWaiting: 'Bekliyor',
    generatedAd: 'Oluşturulan Reklam',
    veoGenerating: 'Veo Video Oluşturuyor...',
    videoFailed: 'Video Oluşturulamadı',
    imageGenerating: 'Görsel Oluşturuluyor...',
    errorLabel: 'Hata',
    downloadImage: 'Resmi İndir',
    downloadVideo: 'Videoyu İndir',
    regenerate: 'Bu Görseli Yeniden Üret',
    downloadFailed: 'İndirme başarısız oldu. Lütfen tekrar deneyin.',
    imagesProgress: 'Görseller',
    videosProgress: 'Videolar',
    downloadingProgress: 'indiriliyor...',
    startCampaign: 'Kampanyayı Başlat',
  },
  upload: {
    colorBlack: 'Siyah',
    colorWhite: 'Beyaz',
    colorBurgundy: 'Bordo',
    colorNavy: 'Lacivert',
    colorBeige: 'Bej',
    colorEmerald: 'Zümrüt',
    colorGold: 'Altın',
    colorSilver: 'Gümüş',
    colorRed: 'Kırmızı',
    colorPink: 'Pembe',
    styleLuxury: 'Lüks ve Premium',
    styleMinimalist: 'Minimalist Stüdyo',
    styleLuxuryStore: 'Lüks Mağaza Atmosferi',
    styleNaturalLight: 'Doğal Gün Işığı',
    styleVintage: 'Vintage & Retro',
    styleNeon: 'Neon & Cyberpunk',
    styleCinematic: 'Sinematik & Dramatik',
    stylePopArt: 'Renkli & Pop Art',
    styleArtDeco: 'Art Deco',
    styleGothic: 'Gotik',
    styleSciFi: 'Bilim Kurgu',
    styleRetroFuturism: 'Retro Fütürizm',
    styleAbstract: 'Soyut',
    styleSteampunk: 'Steampunk',
    styleVaporwave: 'Vaporwave',
    styleBauhaus: 'Bauhaus',
    styleRustic: 'Rustik & Bohem',
    videoHighQuality: 'Yüksek Kalite',
    videoHighDesc: 'Sinematik kalite, en iyi detaylar (Yavaş)',
    videoFast: 'Hızlı',
    videoFastDesc: 'Hızlı üretim, standart kalite',
    ratioSquare: 'Kare (1:1)',
    ratioStory: 'Hikaye (9:16)',
    ratioLandscape169: 'Yatay (16:9)',
    ratioPortrait: 'Dikey (3:4)',
    ratioLandscape43: 'Yatay (4:3)',
    modeCampaign: 'Reklam Kampanyası',
    modeCampaignBadge: '4-10 Stil',
    modeEcommerce: 'E-Ticaret Paketi',
    modeEcommerceBadge: '6-12 Poz',
    countUnit: 'Adet',
    defaultLabel: '4 (Varsayılan)',
    maxLabel: '10 (Max)',
    minLabel: '6 (Min)',
    maxLabel12: '12 (Max)',
    colorButton: 'Renk',
    popularFashionColors: 'POPÜLER MODA RENKLERİ',
    customSelection: 'ÖZEL SEÇİM',
    addToList: 'Listeye Ekle',
    uploadPattern: 'Desen yükle',
    colorPatternHint: 'Renkler üretilen görsellere sırasıyla uygulanır. Desen yüklerseniz ürün desenli olarak üretilir.',
    preview: 'Önizleme',
    removeImage: 'Resmi Kaldır',
    dragOrSelect: 'Fotoğrafı buraya sürükle veya seç',
    formatHint: 'PNG, JPG, WEBP (Max 10MB)',
    placeholderProductName: 'Örn: İpek Saten Abiye',
    placeholderBrand: 'Örn: Vakko, Zara',
    addBrandOverlay: 'Görsel üzerine yazı/marka ekle',
    placeholderOverlayText: 'Görselde yazacak metin (Örn: Marka Adı)',
    imageAdded: 'Resim eklendi',
    uploadBackView: 'Arkadan görünüm veya aksesuar resmi yükle',
    placeholderCustomPrompt: 'Örn: "Model hafifçe sağa baksın", "Arka planda hafif şehir ışıkları olsun" veya "Yüklediğim aksesuarı modelin eline doğal bir şekilde yerleştirin".',
    photoOnly: 'Sadece Fotoğraf',
    photoAndVideo: 'Fotoğraf + Video',
    videoQuality: 'Video Kalitesi',
    adStyle: 'Reklam Stili',
    placeholderColor: 'Örn: Kırmızı, #0000FF, Lacivert',
  },
};

const adgeniusTranslations: TranslationRecord<typeof trAdgenius> = {
  tr: trAdgenius,
  en: {
    title: 'AdGenius - AI-Powered Ad Generation',
    subtitle: 'Upload your product image and let AI generate professional ad campaigns and e-commerce product photos',
    modes: {
      campaign: '🎨 Campaign Mode',
      ecommerce: '📦 E-Commerce Package'
    },
    buttons: {
      start: 'Start Generation',
      downloadImage: 'Download Image',
      downloadVideo: 'Download Video',
      copyTitle: 'Copy Title',
      copied: 'Copied!',
      createCampaign: 'Create New Campaign',
    },
    labels: {
      productName: 'Garment or Model Name',
      brand: 'Brand Name',
      customPrompt: 'Custom Requirements & Scene Details (Optional)',
      productImage: 'Product Photo (Required)',
      optionalImage: 'Add Back View / Accessory (Optional)',
      outputPreference: 'Output Preference',
      style: 'Ad Style / E-Commerce Theme',
      aspectRatio: 'Image Size / Ratio',
      colors: 'Color Variations',
      pattern: 'Pattern/Texture (Optional)',
      photoCount: 'E-Commerce Photo Count',
      campaignCount: 'Campaign Style Count'
    },
    messages: {
      loginRequired: 'Please login to perform this action.',
      insufficientCredits: 'Insufficient credits.',
      processing: 'Processing...',
      generatingImage: 'Generating images...',
      generatingVideo: 'Generating videos...',
      success: 'Operation successful!',
      error: 'An error occurred',
      uploadProductImage: 'Please upload a product image first.',
      productNameRequired: 'Please enter product name.',
      apiKeyRequired: 'API key selection required.',
    },
    creditInfo: {
      imageCost: 'Per image',
      videoCost: 'Per video',
      totalImages: 'Total Images',
      totalVideos: 'Total Videos',
      totalCredits: 'Total Credits Used',
      available: 'Available',
      credits: 'credits'
    },
    stats: {
      imagesGenerated: 'Images Generated',
      videosGenerated: 'Videos Generated',
      creditsUsed: 'Credits Used'
    },
    preview: {
      title: 'Campaign Details',
      subtitle: 'Review the scenes and locations. You can enter custom prompts for each location if you wish.',
      editButton: 'Edit / Change',
      confirmButton: 'Confirm & Start Generation',
      location: 'Location / Scene',
      promptPlaceholder: 'Ex: Walking in a modern studio under professional lighting...',
      backButton: 'Go Back',
      customPromptLabel: 'Custom Scene Prompt',
    },
    processing: {
      stepAnalyzing: 'Product Analysis',
      stepGenerating: 'Image & Video Generation',
      stepResults: 'Completed',
      ready: 'Ready',
      analyzingAI: 'AI is analyzing product features...',
      allDone: 'All processes completed successfully!',
      preparingQueue: 'Preparing generation queue...',
      preparingPrompts: 'Setting up scenes and prompts',
      generatingHD: 'Generating high-resolution images',
      qualityCheck: 'Processing images and quality check',
      videoAnimations: 'Creating video animations with Veo model',
      refiningDetails: 'Refining and enhancing details',
      compilingResults: 'Compiling results',
      technicalData: 'Technical Data',
      categoryStyle: 'Category & Style',
      material: 'Material',
      colorAnalysis: 'Color Analysis',
      targetAudience: 'Target Audience',
      ecommerceContent: 'Ready E-Commerce Content',
      productTitle: 'Product Title',
      description: 'Description',
      descriptionPreparing: 'Preparing description...',
      features: 'Key Features',
      productFeatures: 'Product Features',
    },
    gallery: {
      bulkDownload: 'Bulk Download',
      imagesReady: 'image(s)',
      videosReady: 'video(s)',
      ready: 'ready',
      downloadAllImages: 'Download All Images',
      downloadAllVideos: 'Download All Videos',
      downloading: 'Downloading...',
      downloadAll: 'Download All',
      album: 'Album...',
      createAlbum: 'Create Album',
      downloadAlbum: 'Download Album',
      downloadAlbumPNG: 'Download Album (PNG)',
      hideAlbum: 'Hide Album / Recreate',
      campaignAlbum: 'Campaign Album',
      generatedContent: 'Generated Content',
      imageLabel: 'Image',
      videoLabel: 'Video',
      videoError: 'Video Error',
      statusReady: 'Ready',
      statusGeneratingImage: 'Generating Image...',
      statusGeneratingVideo: 'Generating Video...',
      statusWaiting: 'Waiting',
      generatedAd: 'Generated Ad',
      veoGenerating: 'Veo Generating Video...',
      videoFailed: 'Video Generation Failed',
      imageGenerating: 'Generating Image...',
      errorLabel: 'Error',
      downloadImage: 'Download Image',
      downloadVideo: 'Download Video',
      regenerate: 'Regenerate This Image',
      downloadFailed: 'Download failed. Please try again.',
      imagesProgress: 'Images',
      videosProgress: 'Videos',
      downloadingProgress: 'downloading...',
      startCampaign: 'Start Campaign',
    },
    upload: {
      colorBlack: 'Black',
      colorWhite: 'White',
      colorBurgundy: 'Burgundy',
      colorNavy: 'Navy',
      colorBeige: 'Beige',
      colorEmerald: 'Emerald',
      colorGold: 'Gold',
      colorSilver: 'Silver',
      colorRed: 'Red',
      colorPink: 'Pink',
      styleLuxury: 'Luxury & Premium',
      styleMinimalist: 'Minimalist Studio',
      styleLuxuryStore: 'Luxury Store Atmosphere',
      styleNaturalLight: 'Natural Daylight',
      styleVintage: 'Vintage & Retro',
      styleNeon: 'Neon & Cyberpunk',
      styleCinematic: 'Cinematic & Dramatic',
      stylePopArt: 'Colorful & Pop Art',
      styleArtDeco: 'Art Deco',
      styleGothic: 'Gothic',
      styleSciFi: 'Sci-Fi',
      styleRetroFuturism: 'Retro Futurism',
      styleAbstract: 'Abstract',
      styleSteampunk: 'Steampunk',
      styleVaporwave: 'Vaporwave',
      styleBauhaus: 'Bauhaus',
      styleRustic: 'Rustic & Bohemian',
      videoHighQuality: 'High Quality',
      videoHighDesc: 'Cinematic quality, best details (Slow)',
      videoFast: 'Fast',
      videoFastDesc: 'Fast generation, standard quality',
      ratioSquare: 'Square (1:1)',
      ratioStory: 'Story (9:16)',
      ratioLandscape169: 'Landscape (16:9)',
      ratioPortrait: 'Portrait (3:4)',
      ratioLandscape43: 'Landscape (4:3)',
      modeCampaign: 'Ad Campaign',
      modeCampaignBadge: '4-10 Styles',
      modeEcommerce: 'E-Commerce Package',
      modeEcommerceBadge: '6-12 Poses',
      countUnit: 'Items',
      defaultLabel: '4 (Default)',
      maxLabel: '10 (Max)',
      minLabel: '6 (Min)',
      maxLabel12: '12 (Max)',
      colorButton: 'Color',
      popularFashionColors: 'POPULAR FASHION COLORS',
      customSelection: 'CUSTOM SELECTION',
      addToList: 'Add to List',
      uploadPattern: 'Upload pattern',
      colorPatternHint: 'Colors are applied to generated images in order. If you upload a pattern, the product will be generated with that pattern.',
      preview: 'Preview',
      removeImage: 'Remove Image',
      dragOrSelect: 'Drag & drop photo or click to browse',
      formatHint: 'PNG, JPG, WEBP (Max 10MB)',
      placeholderProductName: 'E.g: Silk Satin Dress',
      placeholderBrand: 'E.g: Vakko, Zara',
      addBrandOverlay: 'Add text/brand overlay on image',
      placeholderOverlayText: 'Text to display on image (E.g: Brand Name)',
      imageAdded: 'Image added',
      uploadBackView: 'Upload back view or accessory image',
      placeholderCustomPrompt: 'E.g: "Model slightly looking right", "Soft city lights in background" or "Place the accessory naturally in model\'s hand".',
      photoOnly: 'Photo Only',
      photoAndVideo: 'Photo + Video',
      videoQuality: 'Video Quality',
      adStyle: 'Ad Style',
      placeholderColor: 'E.g: Red, #0000FF, Navy',
    },
  },
};


// Types for sub-components
export type { FormData, AppStep, ProductAnalysis, GenerationResult, AdStyle, ImageModel, VideoModel, GenerationMode, AspectRatio };

export const AdgeniusPage: React.FC<AdgeniusPageProps> = ({ profile, onRefreshProfile, onShowBuyCredits }) => {
  const t = useTranslation(adgeniusTranslations);

  const [step, setStep] = useState<AppStep>('upload');
  const [formData, setFormData] = useState<FormData>({
    productImage: null,
    optionalImage: null,
    productName: '',
    brand: '',
    customPrompt: '',
    adStyle: 'Lüks ve Premium',
    imageModel: 'gemini-3-pro-image-preview',
    videoModel: 'veo-3.1-fast-generate-preview',
    mode: 'campaign',
    includeVideo: false,
    aspectRatio: '1:1',
    campaignStyleCount: 4,
    ecommercePhotoCount: 8,
    ecommerceColorVariations: '',
    ecommercePatternImage: null,
    renderTextOnImage: false,
    imageOverlayText: ''
  });

  const [analysis, setAnalysis] = useState<ProductAnalysis | null>(null);
  const [results, setResults] = useState<GenerationResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [totalImagesGenerated, setTotalImagesGenerated] = useState(0);
  const [totalVideosGenerated, setTotalVideosGenerated] = useState(0);
  const [totalCreditsUsed, setTotalCreditsUsed] = useState(0);
  const [base64Strings, setBase64Strings] = useState<{
    original: string,
    optional: string | null,
    pattern: string | null,
    patternMime: string | null
  } | null>(null);
  const [batchSeed, setBatchSeed] = useState<number>(Math.floor(Math.random() * 1000000));

  // Calculate totals
  useEffect(() => {
    const imagesCount = results.filter(r => r.imageUrl).length;
    const videosCount = results.filter(r => r.videoUrl).length;
    const credits = results.reduce((sum, r) => {
      // If result is completed, check if it has video. 
      // If is pending/generating, use formData.includeVideo to estimate.
      if (r.status === 'completed' || r.status === 'failed') {
        let cost = CREDIT_COSTS.ADGENIUS_IMAGE; // Always 1 for image
        if (r.videoUrl) cost += CREDIT_COSTS.ADGENIUS_VIDEO; // Add 3 for video
        return sum + cost;
      }

      // Pending
      let expectedCost = CREDIT_COSTS.ADGENIUS_IMAGE;
      if (formData.includeVideo) expectedCost += CREDIT_COSTS.ADGENIUS_VIDEO;
      return sum + expectedCost;
    }, 0);

    setTotalImagesGenerated(imagesCount);
    setTotalVideosGenerated(videosCount);
    setTotalCreditsUsed(credits);
  }, [results]);

  // Check credits before operation
  const checkCredits = async (
    operationType: 'adgenius_campaign_image' | 'adgenius_campaign_video' | 'adgenius_ecommerce_image' | 'adgenius_ecommerce_video'
  ): Promise<boolean> => {
    if (!profile) {
      setError(t.messages.loginRequired);
      return false;
    }
    const result = await checkAndDeductCredits(profile.id, operationType);
    if (!result.success) {
      setError(result.message || t.messages.insufficientCredits);
      if (onShowBuyCredits) onShowBuyCredits();
      return false;
    }
    onRefreshProfile();
    return true;
  };

  // Save generation to history
  const saveToHistory = async (
    operationType: 'adgenius_campaign_image' | 'adgenius_campaign_video' | 'adgenius_ecommerce_image' | 'adgenius_ecommerce_video',
    outputImageUrl: string | null,
    outputVideoUrl: string | null,
    settings: Record<string, any>
  ) => {
    if (!profile) return;

    const uploadedImageUrl = outputImageUrl ? await uploadBase64ToStorage(outputImageUrl, profile.id, 'output') : null;
    const uploadedVideoUrl = outputVideoUrl ? await uploadBase64ToStorage(outputVideoUrl, profile.id, 'video') : null;

    // Calculate credits used based on outputs
    // Logic: Image (1) + Video (3) if video exists = Total 4
    let creditsUsed = CREDIT_COSTS.ADGENIUS_IMAGE;
    if (outputVideoUrl) {
      creditsUsed += CREDIT_COSTS.ADGENIUS_VIDEO;
    }

    await saveGeneration(
      profile.id,
      operationType,
      creditsUsed,
      formData.productImage ? await uploadBase64ToStorage(
        `data:${formData.productImage.type};base64,${await fileToGoogleGenAIBase64(formData.productImage)}`,
        profile.id,
        'input'
      ) : null,
      uploadedImageUrl,
      uploadedVideoUrl,
      settings
    );

    // Track analytics
    trackEvent(ANALYTICS_EVENTS.GENERATE_AD, {
      operationType,
      hasVideo: !!outputVideoUrl,
      mode: formData.mode,
      style: formData.adStyle,
      userId: profile.id
    });
  };

  const processItem = useCallback(async (
    item: GenerationResult,
    currentFormData: FormData,
    analysisResult: ProductAnalysis,
    origImgB64: string,
    optImgB64: string | null,
    pattImgB64: string | null,
    pattImgMime: string | null
  ) => {
    // Helper to update result state
    const updateResult = (id: number, update: Partial<GenerationResult>) => {
      setResults(prev => prev.map(r => r.id === id ? { ...r, ...update } : r));
    };

    // Determine operation types
    const isEcommerce = currentFormData.mode === 'ecommerce';
    const imageOperationType = isEcommerce ? 'adgenius_ecommerce_image' : 'adgenius_campaign_image';
    const videoOperationType = isEcommerce ? 'adgenius_ecommerce_video' : 'adgenius_campaign_video';

    // 1. Check & Deduct Credits for IMAGE first (1 Credit)
    if (!await checkCredits(imageOperationType)) return;

    // Determine Aspect Ratios
    const imgAspectRatio = currentFormData.aspectRatio;

    // Determine Video Ratio (Veo strictly supports 16:9 or 9:16)
    let vidAspectRatio = '16:9';
    if (imgAspectRatio === '9:16' || imgAspectRatio === '3:4' || imgAspectRatio === '1:1') {
      vidAspectRatio = '9:16';
    } else {
      vidAspectRatio = '16:9';
    }

    try {
      updateResult(item.id, { status: 'generating_image', progress: 5, error: undefined, imageUrl: undefined, videoUrl: undefined });

      if (!currentFormData.productImage) throw new Error("Ana resim eksik");

      // Calculate Stable Seed for this product (Deterministic based on product name)
      // This ensures the same model face is used for all shots of this product
      // We use the batchSeed (random per session) if productName is empty, otherwise product based.
      const productStableSeed = currentFormData.productName
        ? currentFormData.productName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) * 12345
        : batchSeed;

      const base64Image = await generateAdImage(
        item.prompt,
        origImgB64,
        currentFormData.productImage.type,
        optImgB64,
        currentFormData.optionalImage?.type || null,
        currentFormData.imageModel,
        imgAspectRatio,
        pattImgB64,
        pattImgMime,
        productStableSeed // Pass the stable seed here!
      );

      updateResult(item.id, {
        status: 'completed',
        imageUrl: base64Image,
        progress: 45
      });

      // Check if Video is requested
      if (currentFormData.includeVideo) {

        // 2. Check & Deduct Credits for VIDEO separately (3 Credits)
        // This ensures if video fails or user has no credits, they still keep the image
        if (!await checkCredits(videoOperationType)) {
          updateResult(item.id, {
            status: 'completed', // Complete with just image
            imageUrl: base64Image,
            error: 'Video oluşturulamadı: Yetersiz kredi.', // Non-fatal warning
            progress: 100
          });
          // Save Image Only
          await saveToHistory(imageOperationType, base64Image, null, {
            ...currentFormData,
            analysis: analysisResult,
            generatedPrompt: item.prompt,
            videoError: 'Insufficient credits for video'
          });
          return;
        }

        updateResult(item.id, {
          status: 'generating_video',
          imageUrl: base64Image,
          progress: 50
        });

        try {
          const videoUrl = await generateAdVideo(
            base64Image,
            item.type,
            currentFormData.videoModel,
            vidAspectRatio,
            (vidProgress) => {
              // Update progress during polling (50% -> 99%)
              updateResult(item.id, { progress: vidProgress });
            }
          );

          updateResult(item.id, {
            status: 'completed',
            videoUrl: videoUrl,
            progress: 100
          });

          // Save both image and video
          // Using videoOperationType for history tagging, but calculation handles full cost
          await saveToHistory(videoOperationType, base64Image, videoUrl, {
            ...currentFormData,
            analysis: analysisResult,
            generatedPrompt: item.prompt
          });
        } catch (videoError: any) {
          console.warn(`Video generation failed for item ${item.id}, preserving image. Error:`, videoError);

          // REFUND VIDEO CREDIT
          if (profile) {
            await addCreditsToUser(profile.id, CREDIT_COSTS.ADGENIUS_VIDEO);
            console.log(`Video failure refund: ${CREDIT_COSTS.ADGENIUS_VIDEO} credits restored.`);
            onRefreshProfile();
          }

          // Mark as completed but attach error message to show partial success
          updateResult(item.id, {
            status: 'completed',
            imageUrl: base64Image,
            error: videoError.message,
            progress: 100
          });

          // Save just the image
          await saveToHistory(imageOperationType, base64Image, null, {
            ...currentFormData,
            analysis: analysisResult,
            generatedPrompt: item.prompt,
            videoError: videoError.message
          });
        }
      } else {
        // Image Only Mode - save immediately
        await saveToHistory(imageOperationType, base64Image, null, {
          ...currentFormData,
          analysis: analysisResult,
          generatedPrompt: item.prompt
        });
      }

    } catch (err: any) {
      console.error(`Error processing item ${item.id}`, err);

      // REFUND IMAGE CREDIT (Only if it failed during image generation phase)
      if (profile) {
        await addCreditsToUser(profile.id, CREDIT_COSTS.ADGENIUS_IMAGE);
        console.log(`Image failure refund: ${CREDIT_COSTS.ADGENIUS_IMAGE} credits restored.`);
        onRefreshProfile();
      }

      updateResult(item.id, {
        status: 'failed',
        error: err.message || "Bilinmeyen bir hata oluştu.",
        progress: 0
      });
    }
  }, [checkCredits, saveToHistory, onRefreshProfile]); // Added dependencies as they are used inside processItem or its sub-calls. Wait, setResults is also used.

  const handleRegenerateItem = useCallback(async (id: number) => {
    const item = results.find(r => r.id === id);
    if (!item || !analysis || !formData.productImage) return;

    try {
      const originalImageB64 = await fileToGoogleGenAIBase64(formData.productImage);
      let optionalImageB64: string | null = null;
      if (formData.optionalImage) {
        optionalImageB64 = await fileToGoogleGenAIBase64(formData.optionalImage);
      }
      let patternImageB64: string | null = null;
      let patternImageMimeType: string | null = null;
      if (formData.ecommercePatternImage) {
        patternImageB64 = await fileToGoogleGenAIBase64(formData.ecommercePatternImage);
        patternImageMimeType = formData.ecommercePatternImage.type;
      }

      await processItem(
        item,
        formData,
        analysis,
        originalImageB64,
        optionalImageB64,
        patternImageB64,
        patternImageMimeType
      );
    } catch (err: any) {
      console.error('Regeneration error:', err);
      setError(err.message || t.messages.error);
    }
  }, [results, analysis, formData, processItem]);

  const handleSubmit = useCallback(async () => {
    if (!formData.productImage) {
      setError(t.messages.uploadProductImage);
      return;
    }

    if (!formData.productName.trim()) {
      setError(t.messages.productNameRequired);
      return;
    }

    setError(null);
    setStep('analyzing');

    try {
      // 0. Ensure API Key
      const hasKey = await ensureApiKey();
      if (!hasKey) {
        throw new Error(t.messages.apiKeyRequired);
      }

      // Convert images to base64
      const originalImageB64 = await fileToGoogleGenAIBase64(formData.productImage);

      // Convert optional image if exists
      let optionalImageB64: string | null = null;
      if (formData.optionalImage) {
        optionalImageB64 = await fileToGoogleGenAIBase64(formData.optionalImage);
      }

      // Convert pattern image if exists
      let patternImageB64: string | null = null;
      let patternImageMimeType: string | null = null;
      if (formData.ecommercePatternImage) {
        patternImageB64 = await fileToGoogleGenAIBase64(formData.ecommercePatternImage);
        patternImageMimeType = formData.ecommercePatternImage.type;
      }

      // 1. Analyze
      const analysisResult = await analyzeProductImage(formData.productImage);
      setAnalysis(analysisResult);

      // 2. Generate Prompts locally
      const prompts = generateAdPrompts(analysisResult, formData);

      // Initialize Results State
      const initialResults: GenerationResult[] = prompts.map(p => ({
        id: p.id,
        type: p.type,
        prompt: p.text,
        status: 'pending',
        progress: 0
      }));
      setResults(initialResults);
      setBase64Strings({
        original: originalImageB64,
        optional: optionalImageB64,
        pattern: patternImageB64,
        patternMime: patternImageMimeType
      });

      setStep('preview_prompts');

    } catch (err: any) {
      console.error('Generation error:', err);
      setError(err.message || t.messages.error);
      setStep('upload');
    }
  }, [formData, profile, onRefreshProfile, onShowBuyCredits, t.messages]);

  const handleConfirmGeneration = useCallback(async () => {
    if (!base64Strings || !analysis) return;

    setStep('generating');

    try {
      // Execute all generations in parallel for maximum speed
      // Each item has its own retry mechanism inside generateAdImage
      const pendingItems = results.filter(item => item.status !== 'completed');

      await Promise.allSettled(
        pendingItems.map(item =>
          processItem(
            item,
            formData,
            analysis,
            base64Strings.original,
            base64Strings.optional,
            base64Strings.pattern,
            base64Strings.patternMime
          )
        )
      );

      setStep('results');
    } catch (err: any) {
      console.error('Final generation error:', err);
      setError(err.message || t.messages.error);
      setStep('preview_prompts');
    }
  }, [results, formData, analysis, base64Strings, processItem, t.messages.error]);



  const handleReset = () => {
    setStep('upload');
    setFormData(prev => ({
      ...prev,
      productImage: null,
      optionalImage: null,
      ecommercePatternImage: null
    }));
    setAnalysis(null);
    setResults([]);
    setError(null);
    setTotalImagesGenerated(0);
    setTotalVideosGenerated(0);
    setTotalCreditsUsed(0);
    setBatchSeed(Math.floor(Math.random() * 1000000));
  };

  // Credit info display - CREDIT_COSTS sabitinden dinamik olarak alınıyor
  const creditCostPerImage = CREDIT_COSTS.ADGENIUS_IMAGE;
  const creditCostPerVideo = CREDIT_COSTS.ADGENIUS_VIDEO;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-gray-100 py-8 px-4">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-white mb-4">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
            AdGenius
          </span>
          <span className="text-slate-400 font-light ml-3">AI</span>
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto">
          {t.subtitle}
        </p>
      </div>

      {error && (
        <div className="max-w-2xl mx-auto mb-6 bg-red-500/10 border border-red-500/50 text-red-200 p-4 rounded-xl flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="text-red-400 hover:text-red-300"
          >
            ✕
          </button>
        </div>
      )}

      {/* Mode Selection moved into UploadForm to avoid duplication */}

      {/* Credit Info */}
      {profile && (
        <div className="max-w-4xl mx-auto bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 mb-8 border border-slate-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-sm text-slate-400 mb-1">{t.creditInfo.imageCost}</div>
              <div className="text-xl font-bold text-white">{creditCostPerImage} {t.creditInfo.credits}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-slate-400 mb-1">{t.creditInfo.videoCost}</div>
              <div className="text-xl font-bold text-white">{creditCostPerVideo} {t.creditInfo.credits}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-slate-400 mb-1">{t.creditInfo.available}</div>
              <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                {profile.credits}
              </div>
            </div>
          </div>
        </div>
      )}

      {step === 'upload' && (
        <UploadForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleSubmit}
          isSubmitting={false}
          t={t}
        />
      )}

      {step === 'preview_prompts' && (
        <PromptPreview
          results={results}
          setResults={setResults}
          onSubmit={handleConfirmGeneration}
          onBack={() => setStep('upload')}
          t={t}
        />
      )}

      {(step === 'analyzing' || step === 'generating' || step === 'results') && (
        <ProcessingStep
          step={step}
          analysis={analysis}
          results={results}
          t={t}
        />
      )}

      {(step === 'generating' || step === 'results') && (
        <ResultsGallery
          results={results}
          onRegenerate={handleRegenerateItem}
          t={t}
        />
      )}

      {step === 'results' && (
        <div className="max-w-4xl mx-auto mt-12 space-y-6">
          {/* Statistics */}
          <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-8 border border-slate-700">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-cyan-400" />
              {t.title}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-700">
                <div className="text-slate-400 text-sm mb-2">{t.stats.imagesGenerated}</div>
                <div className="text-4xl font-bold text-cyan-400">{totalImagesGenerated}</div>
              </div>
              <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-700">
                <div className="text-slate-400 text-sm mb-2">{t.stats.videosGenerated}</div>
                <div className="text-4xl font-bold text-purple-400">{totalVideosGenerated}</div>
              </div>
              <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-700">
                <div className="text-slate-400 text-sm mb-2">{t.stats.creditsUsed}</div>
                <div className="text-4xl font-bold text-orange-400">{totalCreditsUsed}</div>
              </div>
            </div>

            <div className="mt-8 text-center">
              <button
                onClick={handleReset}
                className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-cyan-500 hover:to-blue-500 transition-all transform hover:scale-105 active:scale-95"
              >
                {t.buttons.createCampaign}
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
};


export default AdgeniusPage;

