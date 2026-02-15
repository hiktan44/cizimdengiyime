/**
 * Fotomatik Page - Görüntü Dönüştürme ve Prompt Üretme Aracı
 * Kredi sistemi ve geçmiş kayıt entegrasyonuyla
 * + Toplu İşleme Özelliği
 */

import React, { useState, useCallback } from 'react';
import { useI18n, useTranslation, TranslationRecord } from '../lib/i18n';
import { fotomatikGenerateEditedImage, fotomatikGenerateImagePrompt, fotomatikSuggestEnhancements, PromptAnalysisResponse } from '../services/fotomatikService';
import { UploadArea } from '../components/fotomatik/UploadArea';
import { ResultArea } from '../components/fotomatik/ResultArea';
import { ImageEditor } from '../components/fotomatik/ImageEditor';
import { BatchProcessor } from '../components/fotomatik/BatchProcessor';
import { FotomatikAppStatus, FotomatikImageFile } from '../types/fotomatik';
import { processFile } from '../components/fotomatik/fileUtils';
import { checkAndDeductCredits, saveGeneration, uploadBase64ToStorage } from '../lib/database';
import { CREDIT_COSTS, Profile } from '../lib/supabase';

import { trackEvent, ANALYTICS_EVENTS } from '../utils/analytics';

interface FotomatikPageProps {
  profile: Profile | null;
  onRefreshProfile: () => void;
  onShowBuyCredits?: () => void;
}

type FotomatikMode = 'transform' | 'describe' | 'enhance' | 'batch';
type EnhanceMode = 'balanced' | 'vibrant' | 'crisp' | 'cinematic';


const trFotomatik = {
  modes: {
    transform: '🎨 Dönüştür',
    describe: '📝 Açıkla',
    enhance: '✨ İyileştir',
    batch: '📦 Toplu İşlem',
  },
  enhanceModes: {
    balanced: { label: 'DENGELİ', desc: 'Standart profesyonel görünüm' },
    vibrant: { label: 'CANLI', desc: 'Renkleri ve tonları canlandırır' },
    crisp: { label: 'KESKİN', desc: 'Detayları ve dokuyu belirginleştirir' },
    cinematic: { label: 'SİNEMATİK', desc: 'Dramatik ışık ve gölge dengesi' },
  },
  aspectRatios: {
    square: 'Kare (1:1)',
    portrait: 'Portre (9:16)',
    landscape: 'Manzara (16:9)',
    vertical: 'Dikey (3:4)',
    horizontal: 'Yatay (4:3)',
  },
  buttons: {
    generate: 'Dönüştür',
    describe: 'Açıkla',
    autoEnhance: 'Otomatik İyileştir',
    download: 'İndir',
    copy: 'Kopyala',
    copied: 'Kopyalandı!',
  },
  labels: {
    prompt: 'Dönüşüm Promptu',
    promptPlaceholder: 'Ne yapmak istiyorsunuz? Örn: Arka planı sahil manzarası yap...',
    aspectRatio: 'En-Boy Oranı',
    imageSize: 'Görüntü Boyutu',
    enhanceMode: 'İyileştirme Modu',
  },
  prompts: {
    turkish: 'Türkçe Prompt',
    english: 'İngilizce Prompt',
    midjourney: 'Midjourney Prompt',
    stableDiffusion: 'Stable Diffusion Prompt',
    positive: 'Pozitif',
    negative: 'Negatif',
    parameters: 'Parametreler',
    expertTips: 'Uzman Önerileri',
  },
  messages: {
    loginRequired: 'İşlem yapmak için giriş yapmalısınız.',
    insufficientCredits: 'Yetersiz kredi.',
    processing: 'İşleniyor...',
    enhancing: 'İyileştiriliyor...',
    describing: 'Analiz ediliyor...',
    generating: 'Oluşturuluyor...',
    success: 'İşlem başarılı!',
    error: 'Bir hata oluştu',
    selectImageAndPrompt: 'Lütfen bir görüntü seçin ve bir istem girin.',
    selectImage: 'Lütfen önce bir görüntü seçin.',
    transformError: 'Görüntü dönüştürülürken bir hata oluştu.',
    describeError: 'Prompt oluşturulurken bir hata oluştu.',
    enhanceError: 'İyileştirme sırasında bir hata oluştu.',
    pleaseUploadImage: 'Lütfen Görsel Yükleyin',
  },
  ui: {
    subtitle: 'Yapay zeka ile fotoğraflarınızı dönüştürün veya detaylı prompt\'lar oluşturun.',
    promptLabel: 'Dönüşüm İstemi',
    promptPlaceholder: 'Ör: Bu fotoğraftaki kişiyi bir astronot yap, uzay arka planı ekle...',
    aspectRatioLabel: 'En Boy Oranı',
    resolutionLabel: 'Çözünürlük',
    suggestedParams: 'Önerilen Parametreler',
    expertTipsLabel: 'Uzman İpuçları',
    promptGenerate: 'Prompt Üret',
    creditCosts: 'Bu işlem',
    creditUnit: 'kredi',
    creditConsumes: 'harcar',
    creditAvailable: 'Mevcut:',
  },
  batch: {
    opRemoveBg: '🎯 Arka Plan Kaldır',
    opRemoveBgDesc: 'Görsellerin arka planını kaldırır',
    opRetouch: '✨ Toplu Retouch',
    opRetouchDesc: 'Profesyonel düzenleme ve iyileştirme',
    opCatalog: '📦 Katalog Hazırla',
    opCatalogDesc: 'E-ticaret için optimize görsel',
    retouchLabel: 'Retouch Seviyesi',
    retouchLight: '🌱 Hafif',
    retouchMedium: '⚡ Orta',
    retouchHeavy: '🔥 Yoğun',
    catalogLabel: 'Katalog Stili',
    catalogEcommerce: '🛒 E-Ticaret',
    catalogEcommerceDesc: 'Amazon/Shopify',
    catalogSocial: '📱 Sosyal Medya',
    catalogSocialDesc: 'Instagram/TikTok',
    catalogMinimal: '✨ Minimal',
    catalogMinimalDesc: 'Lüks Markalar',
    uploadMax: 'Maksimum {count} görsel yüklenebilir',
    uploadDrag: 'Görselleri sürükleyin veya tıklayın',
    uploadFormats: 'PNG, JPG, WEBP • Maks {count} görsel • Her biri maks 10MB',
    imagesUploaded: 'görsel yüklendi',
    completed: 'tamamlandı',
    clearAll: 'Tümünü Temizle',
    errorDefault: 'Hata',
    progressProcessing: 'İşleniyor...',
    btnProcessing: 'İşleniyor... ({current}/{total})',
    btnCompleted: '✓ Tamamlandı',
    btnProcess: '🚀 {count} Görseli İşle ({credits} Kredi)',
    creditNeeded: '{needed} kredi gerekiyor,',
    creditHave: '{have} krediniz var.',
    creditBuy: 'Lütfen kredi satın alın.',
    creditWillSpend: 'Bu işlem toplam',
    creditCurrent: 'Mevcut:',
  },
};

const fotomatikTranslations: TranslationRecord<typeof trFotomatik> = {
  tr: trFotomatik,
  en: {
    modes: {
      transform: '🎨 Transform',
      describe: '📝 Describe',
      enhance: '✨ Enhance',
      batch: '📦 Batch Process',
    },
    enhanceModes: {
      balanced: { label: 'BALANCED', desc: 'Standard professional look' },
      vibrant: { label: 'VIBRANT', desc: 'Boosts colors and tones' },
      crisp: { label: 'CRISP', desc: 'Sharpens details and textures' },
      cinematic: { label: 'CINEMATIC', desc: 'Dramatic light and shadow balance' },
    },
    aspectRatios: {
      square: 'Square (1:1)',
      portrait: 'Portrait (9:16)',
      landscape: 'Landscape (16:9)',
      vertical: 'Vertical (3:4)',
      horizontal: 'Horizontal (4:3)',
    },
    buttons: {
      generate: 'Transform',
      describe: 'Describe',
      autoEnhance: 'Auto Enhance',
      download: 'Download',
      copy: 'Copy',
      copied: 'Copied!',
    },
    labels: {
      prompt: 'Transform Prompt',
      promptPlaceholder: 'What do you want to do? E.g., Change background to beach...',
      aspectRatio: 'Aspect Ratio',
      imageSize: 'Image Size',
      enhanceMode: 'Enhancement Mode',
    },
    prompts: {
      turkish: 'Turkish Prompt',
      english: 'English Prompt',
      midjourney: 'Midjourney Prompt',
      stableDiffusion: 'Stable Diffusion Prompt',
      positive: 'Positive',
      negative: 'Negative',
      parameters: 'Parameters',
      expertTips: 'Expert Tips',
    },
    messages: {
      loginRequired: 'Please login to perform this action.',
      insufficientCredits: 'Insufficient credits.',
      processing: 'Processing...',
      enhancing: 'Enhancing...',
      describing: 'Analyzing...',
      generating: 'Generating...',
      success: 'Operation successful!',
      error: 'An error occurred',
      selectImageAndPrompt: 'Please select an image and enter a prompt.',
      selectImage: 'Please select an image first.',
      transformError: 'An error occurred while transforming the image.',
      describeError: 'An error occurred while generating the prompt.',
      enhanceError: 'An error occurred during enhancement.',
      pleaseUploadImage: 'Please Upload Image',
    },
    ui: {
      subtitle: 'Transform your photos or generate detailed prompts with AI.',
      promptLabel: 'Transform Prompt',
      promptPlaceholder: 'E.g., Turn the person in this photo into an astronaut, add a space background...',
      aspectRatioLabel: 'Aspect Ratio',
      resolutionLabel: 'Resolution',
      suggestedParams: 'Suggested Parameters',
      expertTipsLabel: 'Expert Tips',
      promptGenerate: 'Generate Prompt',
      creditCosts: 'This operation costs',
      creditUnit: 'credits',
      creditConsumes: '',
      creditAvailable: 'Available:',
    },
    batch: {
      opRemoveBg: '🎯 Remove Background',
      opRemoveBgDesc: 'Remove backgrounds from images',
      opRetouch: '✨ Batch Retouch',
      opRetouchDesc: 'Professional editing and enhancement',
      opCatalog: '📦 Catalog Prep',
      opCatalogDesc: 'Optimize images for e-commerce',
      retouchLabel: 'Retouch Level',
      retouchLight: '🌱 Light',
      retouchMedium: '⚡ Medium',
      retouchHeavy: '🔥 Heavy',
      catalogLabel: 'Catalog Style',
      catalogEcommerce: '🛒 E-Commerce',
      catalogEcommerceDesc: 'Amazon/Shopify',
      catalogSocial: '📱 Social Media',
      catalogSocialDesc: 'Instagram/TikTok',
      catalogMinimal: '✨ Minimal',
      catalogMinimalDesc: 'Luxury Brands',
      uploadMax: 'Maximum {count} images can be uploaded',
      uploadDrag: 'Drag & drop images or click to browse',
      uploadFormats: 'PNG, JPG, WEBP • Max {count} images • Max 10MB each',
      imagesUploaded: 'images uploaded',
      completed: 'completed',
      clearAll: 'Clear All',
      errorDefault: 'Error',
      progressProcessing: 'Processing...',
      btnProcessing: 'Processing... ({current}/{total})',
      btnCompleted: '✓ Completed',
      btnProcess: '🚀 Process {count} Images ({credits} Credits)',
      creditNeeded: '{needed} credits needed,',
      creditHave: 'you have {have} credits.',
      creditBuy: 'Please purchase credits.',
      creditWillSpend: 'This operation will use',
      creditCurrent: 'Available:',
    },
  },
};

const getEnhanceModes = (t: typeof trFotomatik) => [
  { id: 'balanced' as EnhanceMode, label: t.enhanceModes.balanced.label, desc: t.enhanceModes.balanced.desc, icon: '✅', color: 'text-blue-400' },
  { id: 'vibrant' as EnhanceMode, label: t.enhanceModes.vibrant.label, desc: t.enhanceModes.vibrant.desc, icon: '🎨', color: 'text-pink-400' },
  { id: 'crisp' as EnhanceMode, label: t.enhanceModes.crisp.label, desc: t.enhanceModes.crisp.desc, icon: '🔺', color: 'text-orange-400' },
  { id: 'cinematic' as EnhanceMode, label: t.enhanceModes.cinematic.label, desc: t.enhanceModes.cinematic.desc, icon: '🎬', color: 'text-purple-400' },
];

export const FotomatikPage: React.FC<FotomatikPageProps> = ({ profile, onRefreshProfile, onShowBuyCredits }) => {
  const [mode, setMode] = useState<FotomatikMode>('transform');
  const [selectedImage, setSelectedImage] = useState<FotomatikImageFile | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [aspectRatio, setAspectRatio] = useState<string>('1:1');
  const [imageSize, setImageSize] = useState<string>('1K');

  const [status, setStatus] = useState<FotomatikAppStatus>(FotomatikAppStatus.IDLE);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [isEditorOpen, setIsEditorOpen] = useState(false);

  // Describe Mode States
  const [generatedPrompts, setGeneratedPrompts] = useState<PromptAnalysisResponse | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Enhance Mode States
  const [selectedEnhanceMode, setSelectedEnhanceMode] = useState<EnhanceMode>('balanced');
  const [enhancedImageUrl, setEnhancedImageUrl] = useState<string | null>(null);

  // Language
  const { language } = useI18n();
  const t = useTranslation(fotomatikTranslations);
  const ENHANCE_MODES = getEnhanceModes(t);

  const aspectRatios = [
    { label: t.aspectRatios.square, value: '1:1' },
    { label: t.aspectRatios.portrait, value: '9:16' },
    { label: t.aspectRatios.landscape, value: '16:9' },
    { label: t.aspectRatios.vertical, value: '3:4' },
    { label: t.aspectRatios.horizontal, value: '4:3' },
  ];

  const imageSizes = ['1K', '2K', '4K'];

  // Check credits before operation
  const checkCredits = async (operationType: 'fotomatik_transform' | 'fotomatik_describe'): Promise<boolean> => {
    if (!profile) {
      setErrorMessage(t.messages.loginRequired);
      return false;
    }
    const result = await checkAndDeductCredits(profile.id, operationType);
    if (!result.success) {
      setErrorMessage(result.message || t.messages.insufficientCredits);
      if (onShowBuyCredits) onShowBuyCredits();
      return false;
    }
    onRefreshProfile();
    return true;
  };

  // Save generation to history
  const saveToHistory = async (outputUrl: string, type: 'fotomatik_transform' | 'fotomatik_describe', settings: Record<string, any>) => {
    if (!profile) return;

    const uploadedUrl = await uploadBase64ToStorage(outputUrl, profile.id, 'output');
    await saveGeneration(
      profile.id,
      type,
      type === 'fotomatik_transform' ? CREDIT_COSTS.FOTOMATIK_TRANSFORM : CREDIT_COSTS.FOTOMATIK_DESCRIBE,
      null,
      uploadedUrl,
      null,
      settings
    );

    // Track analytics
    trackEvent(ANALYTICS_EVENTS.GENERATE_FOTOMATIK, {
      type,
      mode,
      userId: profile.id
    });
  };

  // Transform Mode - Generate Image
  const handleTransform = useCallback(async () => {
    if (!selectedImage || !prompt.trim()) {
      setErrorMessage(t.messages.selectImageAndPrompt);
      return;
    }

    if (!await checkCredits('fotomatik_transform')) return;

    setStatus(FotomatikAppStatus.LOADING);
    setErrorMessage(null);
    setGeneratedImageUrl(null);

    try {
      const result = await fotomatikGenerateEditedImage(
        selectedImage.base64,
        selectedImage.mimeType,
        prompt,
        { aspectRatio, imageSize }
      );

      setGeneratedImageUrl(result);
      setStatus(FotomatikAppStatus.SUCCESS);

      await saveToHistory(result, 'fotomatik_transform', { prompt, aspectRatio, imageSize });
    } catch (error: any) {
      console.error('Transform Error:', error);
      setErrorMessage(error.message || t.messages.transformError);
      setStatus(FotomatikAppStatus.ERROR);
    }
  }, [selectedImage, prompt, aspectRatio, imageSize, profile]);

  // Describe Mode - Generate Prompt
  const handleDescribe = useCallback(async () => {
    if (!selectedImage) {
      setErrorMessage(t.messages.selectImage);
      return;
    }

    if (!await checkCredits('fotomatik_describe')) return;

    setStatus(FotomatikAppStatus.LOADING);
    setErrorMessage(null);
    setGeneratedPrompts(null);

    try {
      const result = await fotomatikGenerateImagePrompt(selectedImage.base64, selectedImage.mimeType);
      setGeneratedPrompts(result);
      setStatus(FotomatikAppStatus.SUCCESS);

      // Save with a placeholder since no image output
      if (profile) {
        await saveGeneration(
          profile.id,
          'fotomatik_describe',
          CREDIT_COSTS.FOTOMATIK_DESCRIBE,
          null,
          null,
          null,
          {
            promptTr: result.tr,
            promptEn: result.en,
            midjourney: result.midjourney,
            stableDiffusion: result.stableDiffusion,
            tips: result.tips
          }
        );

        // Track analytics
        trackEvent(ANALYTICS_EVENTS.GENERATE_FOTOMATIK, {
          type: 'fotomatik_describe',
          mode: 'describe',
          userId: profile.id
        });
      }
    } catch (error: any) {
      console.error('Describe Error:', error);
      setErrorMessage(error.message || t.messages.describeError);
      setStatus(FotomatikAppStatus.ERROR);
    }
  }, [selectedImage, profile]);

  const handleCopyPrompt = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Enhance Mode - Apply Enhancements
  const handleEnhance = useCallback(async () => {
    if (!selectedImage) {
      setErrorMessage(t.messages.selectImage);
      return;
    }

    if (!await checkCredits('fotomatik_transform')) return;

    setStatus(FotomatikAppStatus.LOADING);
    setErrorMessage(null);
    setEnhancedImageUrl(null);

    try {
      // Get AI suggested enhancements
      const suggestions = await fotomatikSuggestEnhancements(
        selectedImage.base64,
        selectedImage.mimeType,
        selectedEnhanceMode
      );

      // Apply enhancements using canvas
      const img = new Image();
      img.src = selectedImage.previewUrl;
      await new Promise((resolve) => { img.onload = resolve; });

      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Canvas context not available');
      }

      // Apply filters
      const brightnessVal = suggestions.brightness / 100;
      const contrastVal = suggestions.contrast / 100;
      const saturateVal = suggestions.saturation / 100;

      ctx.filter = `brightness(${brightnessVal}) contrast(${contrastVal}) saturate(${saturateVal})`;
      ctx.drawImage(img, 0, 0);

      const resultUrl = canvas.toDataURL('image/png');
      setEnhancedImageUrl(resultUrl);
      setStatus(FotomatikAppStatus.SUCCESS);

      await saveToHistory(resultUrl, 'fotomatik_transform', {
        mode: 'enhance',
        enhanceMode: selectedEnhanceMode,
        suggestions
      });
    } catch (error: any) {
      console.error('Enhance Error:', error);
      setErrorMessage(error.message || t.messages.enhanceError);
      setStatus(FotomatikAppStatus.ERROR);
    }
  }, [selectedImage, selectedEnhanceMode, profile]);

  const handleEditorSave = (newBase64: string) => {
    if (selectedImage) {
      setSelectedImage({
        ...selectedImage,
        base64: newBase64,
        previewUrl: `data:${selectedImage.mimeType};base64,${newBase64}`
      });
    }
    setIsEditorOpen(false);
  };

  const handleReset = () => {
    setSelectedImage(null);
    setPrompt('');
    setGeneratedImageUrl(null);
    setGeneratedPrompts(null);
    setEnhancedImageUrl(null);
    setErrorMessage(null);
    setStatus(FotomatikAppStatus.IDLE);
  };

  const creditCost = mode === 'transform' ? CREDIT_COSTS.FOTOMATIK_TRANSFORM : CREDIT_COSTS.FOTOMATIK_DESCRIBE;

  return (
    <div className="min-h-screen text-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-100 sm:text-5xl mb-4">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">Fotomatik</span>
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            {t.ui.subtitle}
          </p>
        </div>

        {/* Mode Tabs */}
        <div className="flex justify-center gap-2 md:gap-4 mb-8 flex-wrap">
          <button
            onClick={() => { setMode('describe'); handleReset(); }}
            className={`px-6 py-3 md:px-8 md:py-4 rounded-xl font-bold text-base md:text-lg transition-all duration-300 ${mode === 'describe'
              ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg shadow-purple-500/30'
              : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
          >
            📝 {t.ui.promptGenerate}
          </button>
          <button
            onClick={() => { setMode('transform'); handleReset(); }}
            className={`px-6 py-3 md:px-8 md:py-4 rounded-xl font-bold text-base md:text-lg transition-all duration-300 ${mode === 'transform'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30'
              : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
          >
            {t.modes.transform}
          </button>
          <button
            onClick={() => { setMode('enhance'); handleReset(); }}
            className={`px-6 py-3 md:px-8 md:py-4 rounded-xl font-bold text-base md:text-lg transition-all duration-300 ${mode === 'enhance'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30'
              : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
          >
            {t.modes.enhance}
          </button>
          <button
            onClick={() => { setMode('batch'); handleReset(); }}
            className={`px-6 py-3 md:px-8 md:py-4 rounded-xl font-bold text-base md:text-lg transition-all duration-300 ${mode === 'batch'
              ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg shadow-orange-500/30'
              : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
          >
            {t.modes.batch}
          </button>
        </div>

        {/* Credit Info */}
        {profile && (
          <div className="max-w-4xl mx-auto flex items-center justify-between bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 mb-6">
            <span className="text-sm text-slate-400">
              {t.ui.creditCosts} <span className="text-cyan-400 font-bold">{creditCost} {t.ui.creditUnit}</span> {t.ui.creditConsumes}
            </span>
            <span className="text-sm text-slate-300">
              {t.ui.creditAvailable} <span className="text-cyan-400 font-bold">{profile.credits}</span> {t.ui.creditUnit}
            </span>
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="max-w-4xl mx-auto mb-6 bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-center justify-between">
            <span className="text-red-400">{errorMessage}</span>
            <button onClick={() => setErrorMessage(null)} className="text-red-400 hover:text-red-300">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Transform Mode */}
        {mode === 'transform' && (
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
            {/* Left Column - Input */}
            <div className="space-y-6">
              <UploadArea
                selectedImage={selectedImage}
                onImageSelected={setSelectedImage}
                onEditStart={() => setIsEditorOpen(true)}
              />

              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                {/* Prompt Input */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    {t.ui.promptLabel}
                  </label>
                  <div className="relative">
                    <textarea
                      value={prompt}
                      onChange={(e) => {
                        setPrompt(e.target.value);
                      }}
                      placeholder={t.ui.promptPlaceholder}
                      rows={4}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none resize-y min-h-[120px]"
                    />
                    <div className="absolute bottom-2 right-2 text-slate-600 pointer-events-none">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 13v6m0 0h-6m6 0L13 13" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Aspect Ratio */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    {t.ui.aspectRatioLabel}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {aspectRatios.map((ratio) => (
                      <button
                        key={ratio.value}
                        onClick={() => setAspectRatio(ratio.value)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${aspectRatio === ratio.value
                          ? 'bg-cyan-600 text-white'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                          }`}
                      >
                        {ratio.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Image Size */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    {t.ui.resolutionLabel}
                  </label>
                  <div className="flex gap-2">
                    {imageSizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setImageSize(size)}
                        className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${imageSize === size
                          ? 'bg-cyan-600 text-white'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                          }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Generate Button */}
                <button
                  onClick={handleTransform}
                  disabled={status === FotomatikAppStatus.LOADING || !prompt.trim() || !selectedImage}
                  className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                >
                  {status === FotomatikAppStatus.LOADING ? t.messages.generating : !selectedImage ? t.messages.pleaseUploadImage : `✨ ${t.buttons.generate}`}
                </button>
              </div>
            </div>

            {/* Right Column - Result */}
            <div>
              <ResultArea status={status} generatedImageUrl={generatedImageUrl} />
            </div>
          </div>
        )}

        {/* Describe Mode */}
        {mode === 'describe' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <UploadArea
              selectedImage={selectedImage}
              onImageSelected={setSelectedImage}
              onEditStart={() => setIsEditorOpen(true)}
            />

            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <button
                onClick={handleDescribe}
                disabled={status === FotomatikAppStatus.LOADING || !selectedImage}
                className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold rounded-xl shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
              >
                {status === FotomatikAppStatus.LOADING ? t.messages.describing : !selectedImage ? t.messages.pleaseUploadImage : `📝 ${t.buttons.describe}`}
              </button>

              {/* Generated Prompts */}
              {generatedPrompts && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Turkish Prompt */}
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-semibold text-slate-200">🇹🇷 {t.prompts.turkish}</span>
                        <button
                          onClick={() => handleCopyPrompt('tr', generatedPrompts.tr)}
                          className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${copiedKey === 'tr'
                            ? 'bg-green-600 text-white'
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                            }`}
                        >
                          {copiedKey === 'tr' ? `✓ ${t.buttons.copied}` : t.buttons.copy}
                        </button>
                      </div>
                      <p className="text-slate-300 text-sm leading-relaxed">{generatedPrompts.tr}</p>
                    </div>

                    {/* English Prompt */}
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-semibold text-slate-200">🇬🇧 {t.prompts.english}</span>
                        <button
                          onClick={() => handleCopyPrompt('en', generatedPrompts.en)}
                          className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${copiedKey === 'en'
                            ? 'bg-green-600 text-white'
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                            }`}
                        >
                          {copiedKey === 'en' ? `✓ ${t.buttons.copied}` : t.buttons.copy}
                        </button>
                      </div>
                      <p className="text-slate-300 text-sm leading-relaxed">{generatedPrompts.en}</p>
                    </div>
                  </div>

                  {/* Midjourney Prompt */}
                  <div className="bg-purple-900/20 border border-purple-500/30 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-semibold text-purple-300">🎨 {t.prompts.midjourney}</span>
                      <button
                        onClick={() => handleCopyPrompt('midjourney', generatedPrompts.midjourney)}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${copiedKey === 'midjourney'
                          ? 'bg-green-600 text-white'
                          : 'bg-purple-700 text-purple-200 hover:bg-purple-600'
                          }`}
                      >
                        {copiedKey === 'midjourney' ? `✓ ${t.buttons.copied}` : t.buttons.copy}
                      </button>
                    </div>
                    <p className="text-purple-100 text-sm leading-relaxed font-mono">{generatedPrompts.midjourney}</p>
                  </div>

                  {/* Stable Diffusion Prompt */}
                  <div className="bg-cyan-900/20 border border-cyan-500/30 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-semibold text-cyan-300">⚡ Stable Diffusion (SDXL/Flux)</span>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-cyan-400">Positive Prompt:</span>
                          <button
                            onClick={() => handleCopyPrompt('sd-positive', generatedPrompts.stableDiffusion.positive)}
                            className={`px-2 py-1 rounded text-xs font-medium transition-all ${copiedKey === 'sd-positive'
                              ? 'bg-green-600 text-white'
                              : 'bg-cyan-700 text-cyan-200 hover:bg-cyan-600'
                              }`}
                          >
                            {copiedKey === 'sd-positive' ? '✓' : t.buttons.copy}
                          </button>
                        </div>
                        <p className="text-cyan-100 text-xs leading-relaxed font-mono">{generatedPrompts.stableDiffusion.positive}</p>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-cyan-400">Negative Prompt:</span>
                          <button
                            onClick={() => handleCopyPrompt('sd-negative', generatedPrompts.stableDiffusion.negative)}
                            className={`px-2 py-1 rounded text-xs font-medium transition-all ${copiedKey === 'sd-negative'
                              ? 'bg-green-600 text-white'
                              : 'bg-cyan-700 text-cyan-200 hover:bg-cyan-600'
                              }`}
                          >
                            {copiedKey === 'sd-negative' ? '✓' : t.buttons.copy}
                          </button>
                        </div>
                        <p className="text-cyan-100 text-xs leading-relaxed font-mono">{generatedPrompts.stableDiffusion.negative}</p>
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-cyan-400">{t.ui.suggestedParams}:</span>
                        <p className="text-cyan-100 text-xs mt-1">{generatedPrompts.stableDiffusion.params}</p>
                      </div>
                    </div>
                  </div>

                  {/* Expert Tips */}
                  {generatedPrompts.tips && generatedPrompts.tips.length > 0 && (
                    <div className="bg-orange-900/20 border border-orange-500/30 rounded-xl p-4">
                      <span className="font-semibold text-orange-300 mb-3 block">💡 {t.ui.expertTipsLabel}</span>
                      <ul className="space-y-2">
                        {generatedPrompts.tips.map((tip, idx) => (
                          <li key={idx} className="text-orange-100 text-sm flex items-start gap-2">
                            <span className="text-orange-400 font-bold">{idx + 1}.</span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Enhance Mode */}
        {mode === 'enhance' && (
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
            {/* Left Column - Input */}
            <div className="space-y-6">
              <UploadArea
                selectedImage={selectedImage}
                onImageSelected={setSelectedImage}
                onEditStart={() => setIsEditorOpen(true)}
              />

              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                {/* Enhance Mode Selection */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-3">
                    {t.labels.enhanceMode}
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {ENHANCE_MODES.map((modeOption) => (
                      <button
                        key={modeOption.id}
                        onClick={() => setSelectedEnhanceMode(modeOption.id)}
                        className={`p-4 rounded-2xl border transition-all text-left flex flex-col gap-2 ${selectedEnhanceMode === modeOption.id
                          ? 'bg-emerald-600/20 border-emerald-500/50 shadow-lg shadow-emerald-500/20'
                          : 'bg-slate-900/40 border-slate-700 hover:border-slate-600'
                          }`}
                      >
                        <span className="text-2xl">{modeOption.icon}</span>
                        <div className={`text-xs font-black uppercase tracking-widest ${selectedEnhanceMode === modeOption.id ? modeOption.color : 'text-slate-400'
                          }`}>
                          {modeOption.label}
                        </div>
                        <p className="text-[10px] text-slate-500">{modeOption.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Enhance Button */}
                <button
                  onClick={handleEnhance}
                  disabled={status === FotomatikAppStatus.LOADING || !selectedImage}
                  className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                >
                  {status === FotomatikAppStatus.LOADING ? t.messages.enhancing : !selectedImage ? t.messages.pleaseUploadImage : `⚡ ${t.buttons.autoEnhance}`}
                </button>
              </div>
            </div>

            {/* Right Column - Result */}
            <div className="bg-slate-800/30 border border-slate-700 rounded-2xl p-6 min-h-[400px] flex items-center justify-center">
              {status === FotomatikAppStatus.LOADING ? (
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-slate-400">{language === 'tr' ? 'AI analiz ediyor...' : 'AI analyzing...'}</p>
                </div>
              ) : enhancedImageUrl ? (
                <div className="w-full space-y-4">
                  <img
                    src={enhancedImageUrl}
                    alt={language === 'tr' ? 'İyileştirilmiş' : 'Enhanced'}
                    className="w-full h-auto rounded-xl shadow-2xl"
                  />
                  <a
                    href={enhancedImageUrl}
                    download={`enhanced-${Date.now()}.png`}
                    className="block w-full py-3 bg-emerald-600 text-white text-center font-bold rounded-xl hover:bg-emerald-500 transition-all"
                  >
                    📥 {t.buttons.download}
                  </a>
                </div>
              ) : (
                <div className="text-center text-slate-600">
                  <span className="text-4xl mb-4 block">⚡</span>
                  <p className="text-sm font-medium">{language === 'tr' ? 'İyileştirilmiş görsel burada görünecek' : 'Enhanced image will appear here'}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Batch Mode */}
        {mode === 'batch' && (
          <BatchProcessor
            t={t.batch}
            onCreditsRequired={async (count: number) => {
              if (!profile) {
                setErrorMessage(t.messages.loginRequired);
                return false;
              }
              if (profile.credits < count) {
                setErrorMessage(t.messages.insufficientCredits);
                if (onShowBuyCredits) onShowBuyCredits();
                return false;
              }
              return true;
            }}
            onDeductCredit={async () => {
              if (!profile) return;
              const result = await checkAndDeductCredits(profile.id, 'fotomatik_transform');
              if (result.success) {
                onRefreshProfile();
              }
            }}
            onSaveToHistory={async (outputUrl: string, settings: Record<string, any>) => {
              if (!profile) return;
              const uploadedUrl = await uploadBase64ToStorage(outputUrl, profile.id, 'output');
              await saveGeneration(
                profile.id,
                'fotomatik_transform',
                CREDIT_COSTS.FOTOMATIK_TRANSFORM,
                null,
                uploadedUrl,
                null,
                { ...settings, mode: 'batch' }
              );
              trackEvent(ANALYTICS_EVENTS.GENERATE_FOTOMATIK, {
                type: 'batch',
                operation: settings.operation,
                userId: profile.id
              });
            }}
            creditCost={CREDIT_COSTS.FOTOMATIK_TRANSFORM}
            userCredits={profile?.credits || 0}
          />
        )}

        {/* Image Editor Modal */}
        {isEditorOpen && selectedImage && (
          <ImageEditor
            image={selectedImage}
            onSave={handleEditorSave}
            onCancel={() => setIsEditorOpen(false)}
          />
        )}
      </div>

    </div>
  );
};

export default FotomatikPage;
