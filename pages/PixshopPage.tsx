/**
 * Pixshop Page - Fotoğraf Düzenleme Aracı
 * Kredi sistemi ve geçmiş kayıt entegrasyonuyla
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import ReactCrop, { type Crop, type PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { pixshopGenerateEditedImage, pixshopGenerateFilteredImage, pixshopGenerateAdjustedImage, pixshopRemoveBackground, pixshopUpscaleImage, pixshopAddProductOrLogo } from '../services/pixshopService';
import Spinner from '../components/pixshop/Spinner';
import FilterPanel from '../components/pixshop/FilterPanel';
import AdjustmentPanel from '../components/pixshop/AdjustmentPanel';
import CropPanel from '../components/pixshop/CropPanel';
import UpscalePanel from '../components/pixshop/UpscalePanel';
import StartScreen from '../components/pixshop/StartScreen';
import { UndoIcon, RedoIcon, EyeIcon, ZoomInIcon, ZoomOutIcon, ArrowsPointingOutIcon, DownloadIcon, MagicWandIcon, EraserIcon, SplitIcon } from '../components/pixshop/icons';
import { checkAndDeductCredits, saveGeneration, uploadBase64ToStorage } from '../lib/database';
import { CREDIT_COSTS, Profile } from '../lib/supabase';
import { trackEvent, ANALYTICS_EVENTS } from '../utils/analytics';

interface PixshopPageProps {
  profile: Profile | null;
  onRefreshProfile: () => void;
  onShowBuyCredits?: () => void;
}

// Helper to convert a data URL string to a File object
const dataURLtoFile = (dataurl: string, filename: string): File => {
  const arr = dataurl.split(',');
  if (arr.length < 2) throw new Error("Invalid data URL");
  const mimeMatch = arr[0].match(/:(.*?);/);
  if (!mimeMatch || !mimeMatch[1]) throw new Error("Could not parse MIME type from data URL");

  const mime = mimeMatch[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  // Auto-correct extension based on MIME type
  const mimeToExt: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'image/svg+xml': 'svg',
    'video/mp4': 'mp4',
    'video/webm': 'webm'
  };

  const correctExt = mimeToExt[mime];
  let finalFilename = filename;

  if (correctExt) {
    const parts = filename.split('.');
    const currentExt = parts.length > 1 ? parts.pop()?.toLowerCase() : '';

    // If extension doesn't match or is missing, fix it
    if (currentExt !== correctExt && currentExt !== (correctExt === 'jpg' ? 'jpeg' : correctExt)) {
      const baseName = parts.length > 0 ? parts.join('.') : filename;
      finalFilename = `${baseName}.${correctExt}`;
    }
  }

  return new File([u8arr], finalFilename, { type: mime });
}

// Helper for auto-centering crop
function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number,
) {
  return centerCrop(
    makeAspectCrop(
      { unit: '%', width: 90 },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  )
}

type Tab = 'upload' | 'retouch' | 'adjust' | 'filters' | 'crop' | 'upscale' | 'addproduct';
type Language = 'tr' | 'en';

const translations = {
  tr: {
    tabs: {
      upload: 'Yükle',
      retouch: 'Rötuş',
      crop: 'Kırp',
      adjust: 'Ayarla',
      filters: 'Filtreler',
      upscale: 'Yükselt',
      addproduct: 'Ürün Yerleştir',
    },
    buttons: {
      removeBackground: 'Arka Planı Kaldır',
      smartErase: 'Nesneyi Sil',
      generate: 'Oluştur',
      download: 'İndir',
      reset: 'Sıfırla',
      apply: 'Uygula',
      cancel: 'İptal',
      undo: 'Geri Al',
      redo: 'İleri Al',
    },
    placeholders: {
      retouchPrompt: "ör., 'gömleğimi mavi yap'",
      selectPoint: 'Önce resimde bir nokta seçin',
    },
    messages: {
      creditCheck: 'Kredi kontrol ediliyor...',
      processing: 'İşleniyor...',
      noCredits: 'Yeterli krediniz yok',
      success: 'İşlem başarılı!',
      error: 'Bir hata oluştu',
      uploadFirst: 'Önce bir görsel yükleyin',
      selectArea: 'Silmek için bir alan seçin',
    },
    comparison: {
      peek: 'Orijinali Göster',
      sideBySide: 'Yan Yana',
      split: 'Bölünmüş',
    },
    zoom: {
      zoomIn: 'Yakınlaştır',
      zoomOut: 'Uzaklaştır',
      fit: 'Sığdır',
      magnifier: 'Büyüteç',
    },
  },
  en: {
    tabs: {
      upload: 'Upload',
      retouch: 'Retouch',
      crop: 'Crop',
      adjust: 'Adjust',
      filters: 'Filters',
      upscale: 'Upscale',
      addproduct: 'Add Product',
    },
    buttons: {
      removeBackground: 'Remove Background',
      smartErase: 'Smart Erase',
      generate: 'Generate',
      download: 'Download',
      reset: 'Reset',
      apply: 'Apply',
      cancel: 'Cancel',
      undo: 'Undo',
      redo: 'Redo',
    },
    placeholders: {
      retouchPrompt: "e.g., 'make my shirt blue'",
      selectPoint: 'Select a point on the image first',
    },
    messages: {
      creditCheck: 'Checking credits...',
      processing: 'Processing...',
      noCredits: 'Insufficient credits',
      success: 'Operation successful!',
      error: 'An error occurred',
      uploadFirst: 'Upload an image first',
      selectArea: 'Select an area to erase',
    },
    comparison: {
      peek: 'Show Original',
      sideBySide: 'Side by Side',
      split: 'Split',
    },
    zoom: {
      zoomIn: 'Zoom In',
      zoomOut: 'Zoom Out',
      fit: 'Fit',
      magnifier: 'Magnifier',
    },
  },
};

const getTabs = (lang: Language): { id: Tab, name: string }[] => [
  { id: 'upload', name: translations[lang].tabs.upload },
  { id: 'retouch', name: translations[lang].tabs.retouch },
  { id: 'addproduct', name: translations[lang].tabs.addproduct },
  { id: 'crop', name: translations[lang].tabs.crop },
  { id: 'adjust', name: translations[lang].tabs.adjust },
  { id: 'filters', name: translations[lang].tabs.filters },
  { id: 'upscale', name: translations[lang].tabs.upscale },
];

export const PixshopPage: React.FC<PixshopPageProps> = ({ profile, onRefreshProfile, onShowBuyCredits }) => {
  const [history, setHistory] = useState<File[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [prompt, setPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState<Language>('tr');

  // Load language preference
  useEffect(() => {
    const savedLang = localStorage.getItem('fasheone_language') as Language;
    if (savedLang) setLanguage(savedLang);
  }, []);

  const t = translations[language];
  const TABS = getTabs(language);

  // Hotspot for API
  const [editHotspot, setEditHotspot] = useState<{ x: number, y: number } | null>(null);
  // Hotspot for display
  const [displayHotspot, setDisplayHotspot] = useState<{ unscaledX: number, unscaledY: number } | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('retouch');

  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [aspect, setAspect] = useState<number | undefined>();
  const [rotation, setRotation] = useState<number>(0);
  const [flipH, setFlipH] = useState<boolean>(false);
  const [flipV, setFlipV] = useState<boolean>(false);
  const [isComparing, setIsComparing] = useState<boolean>(false);
  const [cropPreviewUrl, setCropPreviewUrl] = useState<string | null>(null);

  // Split Mode & Magnifier states
  const [isSplitMode, setIsSplitMode] = useState<boolean>(false);
  const [splitPos, setSplitPos] = useState<number>(50);
  const [isHovering, setIsHovering] = useState<boolean>(false);
  const [magnifierPos, setMagnifierPos] = useState({ x: 0, y: 0, relX: 0, relY: 0 });

  // Zoom & Pan state
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Add Product/Logo states
  const [overlayImage, setOverlayImage] = useState<File | null>(null);
  const [overlayPrompt, setOverlayPrompt] = useState<string>('');
  const [overlayImageUrl, setOverlayImageUrl] = useState<string | null>(null);

  // Output resolution selection (2K = 1 kredi, 4K = +1 kredi ekstra)
  const [outputResolution, setOutputResolution] = useState<'2K' | '4K'>('2K');

  const imgRef = useRef<HTMLImageElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  const currentImage = history[historyIndex] ?? null;
  const originalImage = history[0] ?? null;

  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);

  // Effect to create and revoke object URLs
  useEffect(() => {
    if (currentImage) {
      const url = URL.createObjectURL(currentImage);
      setCurrentImageUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setCurrentImageUrl(null);
    }
  }, [currentImage]);

  useEffect(() => {
    if (originalImage) {
      const url = URL.createObjectURL(originalImage);
      setOriginalImageUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setOriginalImageUrl(null);
    }
  }, [originalImage]);

  // Effect for overlay image URL
  useEffect(() => {
    if (overlayImage) {
      const url = URL.createObjectURL(overlayImage);
      setOverlayImageUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setOverlayImageUrl(null);
    }
  }, [overlayImage]);

  // Effect to generate rotated/flipped preview for Cropping
  useEffect(() => {
    if (activeTab !== 'crop' || !currentImageUrl) {
      setCropPreviewUrl(null);
      return;
    }

    if (rotation === 0 && !flipH && !flipV) {
      setCropPreviewUrl(currentImageUrl);
      return;
    }

    const timer = setTimeout(async () => {
      const img = new Image();
      img.src = currentImageUrl;
      await new Promise((resolve) => { img.onload = resolve; img.onerror = resolve; });

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const rads = (rotation * Math.PI) / 180;
      const cos = Math.abs(Math.cos(rads));
      const sin = Math.abs(Math.sin(rads));

      const nW = img.naturalWidth;
      const nH = img.naturalHeight;

      const rotatedWidth = nW * cos + nH * sin;
      const rotatedHeight = nW * sin + nH * cos;

      canvas.width = rotatedWidth;
      canvas.height = rotatedHeight;

      ctx.translate(rotatedWidth / 2, rotatedHeight / 2);
      ctx.rotate(rads);
      ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
      ctx.translate(-nW / 2, -nH / 2);
      ctx.drawImage(img, 0, 0);

      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          setCropPreviewUrl(prev => {
            if (prev && prev !== currentImageUrl) URL.revokeObjectURL(prev);
            return url;
          });
          setCrop(undefined);
          setCompletedCrop(undefined);
        }
      });
    }, 150);

    return () => clearTimeout(timer);
  }, [currentImageUrl, rotation, flipH, flipV, activeTab]);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const handleResetView = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  useEffect(() => {
    handleResetView();
  }, [activeTab, handleResetView]);

  const handleSetAspect = useCallback((newAspect: number | undefined) => {
    setAspect(newAspect);
    if (imgRef.current && newAspect) {
      const { width, height } = imgRef.current;
      const newCrop = centerAspectCrop(width, height, newAspect);
      setCrop(newCrop);
    }
  }, []);

  const addImageToHistory = useCallback((newImageFile: File) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newImageFile);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setCrop(undefined);
    setCompletedCrop(undefined);
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    setCropPreviewUrl(null);
  }, [history, historyIndex]);

  const handleImageUpload = useCallback((file: File) => {
    setError(null);
    setHistory([file]);
    setHistoryIndex(0);
    setEditHotspot(null);
    setDisplayHotspot(null);
    setActiveTab('retouch');
    setCrop(undefined);
    setCompletedCrop(undefined);
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    handleResetView();
    setPrompt('');
  }, [handleResetView]);

  // Check credits before operation
  const checkCredits = async (): Promise<boolean> => {
    if (!profile) {
      setError('İşlem yapmak için giriş yapmalısınız.');
      return false;
    }

    // 4K seçiliyse ekstra kredi kontrolü
    const creditCost = outputResolution === '4K' ? CREDIT_COSTS.PIXSHOP_4K : CREDIT_COSTS.PIXSHOP;
    const result = await checkAndDeductCredits(profile.id, 'pixshop', creditCost);

    if (!result.success) {
      setError(result.message || `Yetersiz kredi. ${outputResolution} için ${creditCost} kredi gereklidir.`);
      if (onShowBuyCredits) onShowBuyCredits();
      return false;
    }
    onRefreshProfile();
    return true;
  };

  // Save generation to history
  const saveToHistory = async (outputUrl: string) => {
    if (!profile) return;

    const uploadedUrl = await uploadBase64ToStorage(outputUrl, profile.id, 'output');
    await saveGeneration(
      profile.id,
      'pixshop',
      CREDIT_COSTS.PIXSHOP,
      null,
      uploadedUrl,
      null,
      { tool: 'pixshop', activeTab }
    );

    // Track analytics
    trackEvent(ANALYTICS_EVENTS.GENERATE_PIXSHOP, {
      tool: 'pixshop',
      activeTab,
      userId: profile.id
    });
  };

  // Helper to upload input image securely
  const uploadInputImage = async (file: File, userId: string) => {
    try {
      const { uploadImageToStorage } = await import('../lib/database');
      return await uploadImageToStorage(file, userId, 'input');
    } catch (err) {
      console.error("Input upload failed:", err);
      return null;
    }
  };

  const handleGenerate = useCallback(async () => {
    if (!currentImage) {
      setError('Düzenlenecek bir resim yüklenmedi.');
      return;
    }

    if (!prompt.trim()) {
      setError('Lütfen yapmak istediğiniz düzenlemeyi açıklayın.');
      return;
    }

    if (!editHotspot) {
      setError('Lütfen düzenlenecek alanı seçmek için resme tıklayın.');
      return;
    }

    // Check credits first
    if (!await checkCredits()) return;

    setIsLoading(true);
    setError(null);

    try {
      const editedImageUrl = await pixshopGenerateEditedImage(currentImage, prompt, editHotspot, outputResolution);
      const newImageFile = dataURLtoFile(editedImageUrl, `edited-${Date.now()}.png`);

      // Upload input image primarily for admin logs
      let inputUrl = null;
      if (profile) {
        inputUrl = await uploadInputImage(currentImage, profile.id);
      }

      addImageToHistory(newImageFile);
      await saveToHistory(editedImageUrl, inputUrl);
      setEditHotspot(null);
      setDisplayHotspot(null);
      setPrompt('');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Bilinmeyen bir hata oluştu.';
      setError(`Resim oluşturulamadı. ${errorMessage}`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [currentImage, prompt, editHotspot, addImageToHistory, profile]);

  const handleApplyFilter = useCallback(async (filterPrompt: string) => {
    if (!currentImage) {
      setError('Filtre uygulanacak bir resim yüklenmedi.');
      return;
    }

    if (!await checkCredits()) return;

    setIsLoading(true);
    setError(null);

    try {
      const filteredImageUrl = await pixshopGenerateFilteredImage(currentImage, filterPrompt, outputResolution);
      const newImageFile = dataURLtoFile(filteredImageUrl, `filtered-${Date.now()}.png`);

      let inputUrl = null;
      if (profile) inputUrl = await uploadInputImage(currentImage, profile.id);

      addImageToHistory(newImageFile);
      await saveToHistory(filteredImageUrl, inputUrl);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Bilinmeyen bir hata oluştu.';
      setError(`Filtre uygulanamadı. ${errorMessage}`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [currentImage, addImageToHistory, profile]);

  const handleApplyAdjustment = useCallback(async (adjustmentPrompt: string) => {
    if (!currentImage) {
      setError('Ayar uygulanacak bir resim yüklenmedi.');
      return;
    }

    if (!await checkCredits()) return;

    setIsLoading(true);
    setError(null);

    try {
      const adjustedImageUrl = await pixshopGenerateAdjustedImage(currentImage, adjustmentPrompt, outputResolution);
      const newImageFile = dataURLtoFile(adjustedImageUrl, `adjusted-${Date.now()}.png`);

      let inputUrl = null;
      if (profile) inputUrl = await uploadInputImage(currentImage, profile.id);

      addImageToHistory(newImageFile);
      await saveToHistory(adjustedImageUrl, inputUrl);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Bilinmeyen bir hata oluştu.';
      setError(`Ayar uygulanamadı. ${errorMessage}`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [currentImage, addImageToHistory, profile]);

  // Smart Erase - Nesneyi Sil fonksiyonu
  const handleSmartErase = useCallback(async () => {
    if (!currentImage || !editHotspot) return;

    if (!await checkCredits()) return;

    setIsLoading(true);
    setError(null);

    try {
      const erasePrompt = "Remove the object at this location and fill the background naturally with the surrounding texture (inpainting).";
      const erasedImageUrl = await pixshopGenerateEditedImage(currentImage, erasePrompt, editHotspot, outputResolution);
      const newImageFile = dataURLtoFile(erasedImageUrl, `erased-${Date.now()}.png`);

      let inputUrl = null;
      if (profile) inputUrl = await uploadInputImage(currentImage, profile.id);

      addImageToHistory(newImageFile);
      await saveToHistory(erasedImageUrl, inputUrl);
      setEditHotspot(null);
      setDisplayHotspot(null);
    } catch (err) {
      setError('Nesne silinemedi. Lütfen tekrar deneyin.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [currentImage, editHotspot, addImageToHistory, profile]);

  // Add Product/Logo - Ürün veya Logo Ekleme fonksiyonu
  const handleAddProduct = useCallback(async () => {
    if (!currentImage) {
      setError('Lütfen önce bir ana görsel yükleyin.');
      return;
    }

    if (!overlayImage) {
      setError('Lütfen eklemek istediğiniz logo veya ürün görselini yükleyin.');
      return;
    }

    if (!overlayPrompt.trim()) {
      setError('Lütfen ne eklemek istediğinizi açıklayın.');
      return;
    }

    if (!await checkCredits()) return;

    setIsLoading(true);
    setError(null);

    try {
      const compositeImageUrl = await pixshopAddProductOrLogo(
        currentImage,
        overlayImage,
        overlayPrompt,
        editHotspot || undefined,
        outputResolution
      );
      const newImageFile = dataURLtoFile(compositeImageUrl, `with-product-${Date.now()}.png`);

      let inputUrl = null;
      if (profile) inputUrl = await uploadInputImage(currentImage, profile.id);

      addImageToHistory(newImageFile);
      await saveToHistory(compositeImageUrl, inputUrl);
      setOverlayPrompt('');
      setEditHotspot(null);
      setDisplayHotspot(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Bilinmeyen bir hata oluştu.';
      setError(`Ürün/Logo eklenemedi. ${errorMessage}`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [currentImage, overlayImage, overlayPrompt, editHotspot, addImageToHistory, profile]);

  // Arka Planı Kaldır (Galeri'ye ekle versiyonu)
  const handleRemoveBackground = useCallback(async () => {
    if (!currentImage) return;

    if (!await checkCredits()) return;

    setIsLoading(true);
    setError(null);

    try {
      const transparentImageUrl = await pixshopRemoveBackground(currentImage, outputResolution);
      const newImageFile = dataURLtoFile(transparentImageUrl, `nobg-${Date.now()}.png`);

      let inputUrl = null;
      if (profile) inputUrl = await uploadInputImage(currentImage, profile.id);

      addImageToHistory(newImageFile);
      await saveToHistory(transparentImageUrl, inputUrl);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Arka plan kaldırılamadı.';
      setError(`Hata: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [currentImage, addImageToHistory, profile]);

  const handleApplyCrop = useCallback(async () => {
    if (!completedCrop?.width || !completedCrop?.height || !imgRef.current) {
      setError('Lütfen kırpmak için geçerli bir alan seçin.');
      return;
    }

    if (!await checkCredits()) return;

    setIsLoading(true);

    try {
      const image = imgRef.current;
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;

      const cropX = completedCrop.x * scaleX;
      const cropY = completedCrop.y * scaleY;
      const cropWidth = completedCrop.width * scaleX;
      const cropHeight = completedCrop.height * scaleY;

      const canvas = document.createElement('canvas');
      canvas.width = cropWidth;
      canvas.height = cropHeight;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        setError('Kırpma işlemi yapılamadı.');
        return;
      }

      ctx.drawImage(image, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);

      const croppedImageUrl = canvas.toDataURL('image/png');
      const newImageFile = dataURLtoFile(croppedImageUrl, `cropped-${Date.now()}.png`);

      let inputUrl = null;
      if (profile) inputUrl = await uploadInputImage(currentImage, profile.id);

      addImageToHistory(newImageFile);
      await saveToHistory(croppedImageUrl, inputUrl);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Kırpma işlemi sırasında hata oluştu.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [completedCrop, addImageToHistory, profile]);

  const handleUpscale = useCallback(async (size: '2K' | '4K') => {
    if (!currentImage) return;

    // 4K için özel kredi kontrolü
    if (size === '4K') {
      if (!profile) {
        setError('İşlem yapmak için giriş yapmalısınız.');
        return false;
      }
      const result = await checkAndDeductCredits(profile.id, 'pixshop', CREDIT_COSTS.PIXSHOP_4K);
      if (!result.success) {
        setError(result.message || 'Yetersiz kredi. 4K upscale için 2 kredi gereklidir.');
        if (onShowBuyCredits) onShowBuyCredits();
        return;
      }
      onRefreshProfile();
    } else {
      // 2K için normal kredi kontrolü
      if (!await checkCredits()) return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const upscaledImageUrl = await pixshopUpscaleImage(currentImage, size);
      const newImageFile = dataURLtoFile(upscaledImageUrl, `upscaled-${size}-${Date.now()}.png`);

      let inputUrl = null;
      if (profile) inputUrl = await uploadInputImage(currentImage, profile.id);

      addImageToHistory(newImageFile);
      await saveToHistory(upscaledImageUrl, inputUrl);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Bilinmeyen bir hata oluştu.';
      setError(`Yükseltme işlemi başarısız oldu. ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [currentImage, addImageToHistory, profile]);

  const handleUndo = useCallback(() => {
    if (canUndo) {
      setHistoryIndex(historyIndex - 1);
      setEditHotspot(null);
      setDisplayHotspot(null);
      setRotation(0);
      setFlipH(false);
      setFlipV(false);
      setPrompt('');
    }
  }, [canUndo, historyIndex]);

  const handleRedo = useCallback(() => {
    if (canRedo) {
      setHistoryIndex(historyIndex + 1);
      setEditHotspot(null);
      setDisplayHotspot(null);
      setRotation(0);
      setFlipH(false);
      setFlipV(false);
      setPrompt('');
    }
  }, [canRedo, historyIndex]);

  const handleReset = useCallback(() => {
    if (history.length > 0) {
      setHistoryIndex(0);
      setError(null);
      setEditHotspot(null);
      setDisplayHotspot(null);
      setRotation(0);
      setFlipH(false);
      setFlipV(false);
      handleResetView();
      setPrompt('');
    }
  }, [history, handleResetView]);

  const handleUploadNew = useCallback(() => {
    setHistory([]);
    setHistoryIndex(-1);
    setError(null);
    setPrompt('');
    setEditHotspot(null);
    setDisplayHotspot(null);
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
  }, []);

  const handleDownload = useCallback(async () => {
    if (currentImage) {
      const { downloadFile } = await import('../utils/downloadHelper');
      const filename = `pixshop-${currentImage.name}`;
      const url = URL.createObjectURL(currentImage);
      await downloadFile(url, filename);
      URL.revokeObjectURL(url);
    }
  }, [currentImage]);

  const handleDownloadTransparentSvg = useCallback(async () => {
    if (!currentImage) return;

    if (!await checkCredits()) return;

    setIsLoading(true);
    setError(null);

    try {
      const transparentImageUrl = await pixshopRemoveBackground(currentImage, outputResolution);

      const img = new Image();
      img.src = transparentImageUrl;
      await new Promise((resolve) => { img.onload = resolve; });

      const svgContent = `<svg width="${img.naturalWidth}" height="${img.naturalHeight}" xmlns="http://www.w3.org/2000/svg">
  <image href="${transparentImageUrl}" height="${img.naturalHeight}" width="${img.naturalWidth}" />
</svg>`;

      const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);

      const nameParts = currentImage.name.split('.');
      const fileName = nameParts.length > 1 ? nameParts.slice(0, -1).join('.') : currentImage.name;
      const svgFilename = `transparent-${fileName}.svg`;

      const { downloadFile } = await import('../utils/downloadHelper');
      await downloadFile(url, svgFilename);
      URL.revokeObjectURL(url);

      await saveToHistory(transparentImageUrl);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'SVG oluşturulamadı.';
      setError(`Hata: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [currentImage, profile]);

  const handleFileSelect = (files: FileList | null) => {
    if (files && files[0]) {
      handleImageUpload(files[0]);
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0 || activeTab === 'crop') return;
    setIsPanning(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    setPanStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isPanning) {
      setPosition({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    }

    // Magnifier position update
    if (imgRef.current && !isPanning) {
      const rect = imgRef.current.getBoundingClientRect();
      const relX = (e.clientX - rect.left) / rect.width;
      const relY = (e.clientY - rect.top) / rect.height;

      setMagnifierPos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        relX: relX * 100,
        relY: relY * 100
      });
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    const dist = Math.sqrt(
      Math.pow(e.clientX - dragStartRef.current.x, 2) +
      Math.pow(e.clientY - dragStartRef.current.y, 2)
    );

    const isDrag = dist > 5;

    if (!isDrag && activeTab === 'retouch') {
      const img = imgRef.current;
      if (!img) return;

      const rect = img.getBoundingClientRect();

      if (
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom
      ) {
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const relX = x / rect.width;
        const relY = y / rect.height;

        const markerX = img.offsetLeft + (relX * img.offsetWidth);
        const markerY = img.offsetTop + (relY * img.offsetHeight);

        setDisplayHotspot({ unscaledX: markerX, unscaledY: markerY });

        setEditHotspot({
          x: Math.round(relX * img.naturalWidth),
          y: Math.round(relY * img.naturalHeight)
        });
      }
    }
    setIsPanning(false);
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current) return;
    e.preventDefault();
    const scaleAmount = -e.deltaY * 0.001;
    const newScale = Math.min(Math.max(0.5, scale + scaleAmount), 5);

    const rect = imageContainerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const imageX = (mouseX - position.x) / scale;
    const imageY = (mouseY - position.y) / scale;

    const newX = mouseX - imageX * newScale;
    const newY = mouseY - imageY * newScale;

    setScale(newScale);
    setPosition({ x: newX, y: newY });
  };

  const handleZoom = (amount: number) => {
    if (!imageContainerRef.current) return;
    const newScale = Math.min(Math.max(0.5, scale + amount), 5);

    const rect = imageContainerRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const imageX = (centerX - position.x) / scale;
    const imageY = (centerY - position.y) / scale;

    const newX = centerX - imageX * newScale;
    const newY = centerY - imageY * newScale;

    setScale(newScale);
    setPosition({ x: newX, y: newY });
  };

  const getCursorClass = () => {
    if (activeTab === 'crop') return '';
    if (isPanning) return 'cursor-grabbing';
    if (scale > 1) return 'cursor-grab';
    if (activeTab === 'retouch') return 'cursor-crosshair';
    return 'cursor-default';
  };

  const renderContent = () => {
    if (error) {
      return (
        <div className="text-center animate-fade-in bg-red-500/10 border border-red-500/20 p-8 rounded-lg max-w-2xl mx-auto flex flex-col items-center gap-4">
          <h2 className="text-2xl font-bold text-red-300">Bir Hata Oluştu</h2>
          <p className="text-md text-red-400">{error}</p>
          <button
            onClick={() => setError(null)}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-lg text-md transition-colors"
          >
            Tekrar Dene
          </button>
        </div>
      );
    }

    // if (!currentImageUrl) {
    //   return <StartScreen onFileSelect={handleFileSelect} />;
    // }

    const cropImageElement = (
      <img
        ref={imgRef}
        key={cropPreviewUrl || currentImageUrl}
        src={cropPreviewUrl || currentImageUrl}
        alt="Bu resmi kırp"
        className="block max-w-full max-h-[60vh] object-contain mx-auto"
      />
    );


    return (
      <div className="w-full max-w-4xl mx-auto flex flex-col items-center gap-6 animate-fade-in">
        {/* Credit Info */}
        {profile && (
          <div className="w-full flex flex-col gap-3">
            <div className="w-full flex items-center justify-between bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2">
              <span className="text-sm text-slate-400">Her işlem <span className="text-cyan-400 font-bold">{outputResolution === '4K' ? CREDIT_COSTS.PIXSHOP_4K : CREDIT_COSTS.PIXSHOP} kredi</span> harcar</span>
              <span className="text-sm text-slate-300">Mevcut: <span className="text-cyan-400 font-bold">{profile.credits}</span> kredi</span>
            </div>

            {/* Resolution Selector */}
            <div className="w-full bg-slate-800/30 border border-slate-700/50 rounded-lg px-4 py-3">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-slate-300 font-medium">Çıktı Çözünürlüğü:</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setOutputResolution('2K')}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${outputResolution === '2K'
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                      : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                      }`}
                  >
                    2K <span className="text-xs opacity-75">(1 kredi)</span>
                  </button>
                  <button
                    onClick={() => setOutputResolution('4K')}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${outputResolution === '4K'
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                      : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                      }`}
                  >
                    4K <span className="text-xs opacity-75">(2 kredi)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Image Container */}
        <div
          ref={imageContainerRef}
          className="relative w-full shadow-2xl rounded-xl overflow-hidden bg-black/20 flex items-center justify-center min-h-[400px]"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          {!currentImageUrl ? (
            <div className="w-full h-full min-h-[400px] flex items-center justify-center p-8">
              <StartScreen onFileSelect={handleFileSelect} />
            </div>
          ) : (
            <>
              {isLoading && (
                <div className="absolute inset-0 bg-black/70 z-30 flex flex-col items-center justify-center gap-4 animate-fade-in">
                  <Spinner />
                  <p className="text-gray-300">Yapay zeka sihrini konuşturuyor...</p>
                </div>
              )}

              {activeTab === 'crop' ? (
                <div className="w-full h-full flex items-center justify-center p-4">
                  <ReactCrop
                    crop={crop}
                    onChange={c => setCrop(c)}
                    onComplete={c => setCompletedCrop(c)}
                    aspect={aspect}
                    className="max-h-[60vh] max-w-full"
                  >
                    {cropImageElement}
                  </ReactCrop>
                </div>
              ) : (
                <div
                  className={`w-full h-[60vh] ${getCursorClass()} overflow-hidden`}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  onWheel={handleWheel}
                >
                  <div style={{
                    transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                    transformOrigin: 'top left',
                    willChange: 'transform',
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {/* Split Mode Base Layer */}
                    {isSplitMode && originalImageUrl && (
                      <img
                        src={originalImageUrl}
                        alt="Original Base"
                        className="absolute max-w-full max-h-full object-contain m-auto"
                        draggable={false}
                      />
                    )}

                    {/* Original Image (for normal view or peek mode) */}
                    {!isSplitMode && originalImageUrl && (
                      <img
                        key={originalImageUrl}
                        src={originalImageUrl}
                        alt="Orijinal"
                        className="max-w-full max-h-full object-contain pointer-events-none"
                      />
                    )}
                    {/* Edited (Current) Image */}
                    <img
                      ref={imgRef}
                      key={currentImageUrl}
                      src={currentImageUrl}
                      alt="Mevcut"
                      className={`absolute inset-0 max-w-full max-h-full object-contain m-auto transition-opacity duration-200 ease-in-out ${isComparing && !isSplitMode ? 'opacity-0' : 'opacity-100'}`}
                      style={isSplitMode ? { clipPath: `inset(0 0 0 ${splitPos}%)` } : undefined}
                      draggable={false}
                    />

                    {displayHotspot && !isLoading && activeTab === 'retouch' && !isSplitMode && (
                      <div
                        className="absolute rounded-full w-6 h-6 bg-blue-500/50 border-2 border-white pointer-events-none z-10"
                        style={{
                          left: `${displayHotspot.unscaledX}px`,
                          top: `${displayHotspot.unscaledY}px`,
                          transform: `translate(-50%, -50%) scale(${1 / scale})`
                        }}
                      >
                        <div className="absolute inset-0 rounded-full w-6 h-6 animate-ping bg-blue-400"></div>
                      </div>
                    )}

                    {/* Magnifier */}
                    {isHovering && !isPanning && activeTab !== 'crop' && !isLoading && !isSplitMode && imgRef.current && (
                      <div
                        className="absolute z-50 pointer-events-none rounded-full border-4 border-white shadow-2xl overflow-hidden bg-gray-900"
                        style={{
                          left: magnifierPos.x,
                          top: magnifierPos.y,
                          width: '160px',
                          height: '160px',
                          transform: `translate(-50%, -50%) scale(${1 / scale})`,
                          boxShadow: '0 0 0 2px rgba(0,0,0,0.3), 0 25px 50px -12px rgba(0,0,0,0.5)'
                        }}
                      >
                        <div
                          className="absolute inset-0 w-full h-full"
                          style={{
                            backgroundImage: `url(${isComparing ? (originalImageUrl || currentImageUrl) : currentImageUrl})`,
                            backgroundRepeat: 'no-repeat',
                            backgroundSize: `${imgRef.current.width * 2.5}px ${imgRef.current.height * 2.5}px`,
                            backgroundPosition: `${-magnifierPos.x * 2.5 + 80}px ${-magnifierPos.y * 2.5 + 80}px`
                          }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-4 h-[1px] bg-white/50"></div>
                          <div className="h-4 w-[1px] bg-white/50 absolute"></div>
                        </div>
                      </div>
                    )}

                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Split Mode Slider */}
        {isSplitMode && activeTab !== 'crop' && (
          <div className="w-full max-w-lg px-4">
            <input
              type="range"
              min="0"
              max="100"
              value={splitPos}
              onChange={(e) => setSplitPos(Number(e.target.value))}
              className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <div className="flex justify-between text-[10px] text-gray-500 font-bold mt-1">
              <span>ORİJİNAL</span>
              <span>DÜZENLENMİŞ</span>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="w-full bg-gray-800/80 border border-gray-700/80 rounded-lg p-2 flex items-center justify-center gap-2 backdrop-blur-sm overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.id === 'upload') {
                  handleUploadNew();
                } else {
                  setActiveTab(tab.id);
                }
              }}
              className={`min-w-fit capitalize font-semibold py-3 px-5 rounded-md transition-all duration-200 text-base whitespace-nowrap ${activeTab === tab.id
                ? 'bg-gradient-to-br from-blue-500 to-cyan-400 text-white shadow-lg shadow-cyan-500/40'
                : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
            >
              {tab.name}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="w-full">
          {activeTab === 'retouch' && (
            <div className="flex flex-col items-center gap-4 animate-fade-in">
              {/* Remove Background & Smart Erase Buttons */}
              <div className="flex items-center gap-3 w-full max-w-2xl">
                <button
                  onClick={handleRemoveBackground}
                  disabled={isLoading}
                  className="flex-1 bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 font-bold py-4 px-6 rounded-2xl hover:bg-indigo-600/30 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                >
                  <MagicWandIcon className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  {t.buttons.removeBackground}
                </button>

                <button
                  onClick={handleSmartErase}
                  disabled={isLoading || !editHotspot}
                  className="flex-1 bg-red-600/20 border border-red-500/30 text-red-300 font-bold py-4 px-6 rounded-2xl hover:bg-red-600/30 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                >
                  <EraserIcon className="w-5 h-5 group-hover:-rotate-12 transition-transform" />
                  {t.buttons.smartErase}
                </button>
              </div>

              <div className="w-full border-t border-white/5 pt-4">
                <p className="text-md text-gray-400 text-center mb-4">
                  {editHotspot
                    ? (language === 'tr' ? 'Harika! Şimdi yapmak istediğiniz düzenlemeyi aşağıya yazın.' : 'Great! Now type the edit you want to make below.')
                    : (language === 'tr' ? 'Hassas düzenleme için resimde bir noktaya tıklayın.' : 'Click on a point in the image for precise editing.')}
                </p>
                <form onSubmit={(e) => { e.preventDefault(); handleGenerate(); }} className="w-full flex items-center gap-3">
                  <input
                    type="text"
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                    placeholder={editHotspot ? t.placeholders.retouchPrompt : t.placeholders.selectPoint}
                    className="flex-grow bg-gray-900/50 border border-gray-700 text-gray-200 rounded-2xl p-5 text-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition w-full disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={isLoading || !editHotspot}
                  />
                  <button
                    type="submit"
                    className="bg-blue-600 text-white font-bold py-5 px-10 text-lg rounded-2xl shadow-xl hover:bg-blue-500 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isLoading || !prompt.trim() || !editHotspot}
                  >
                    {t.buttons.generate}
                  </button>
                </form>
              </div>
            </div>
          )}
          {activeTab === 'crop' && (
            <CropPanel
              onApplyCrop={handleApplyCrop}
              onSetAspect={handleSetAspect}
              isLoading={isLoading}
              isCropping={!!(completedCrop?.width && completedCrop?.height)}
              rotation={rotation}
              setRotation={setRotation}
              flipH={flipH}
              setFlipH={setFlipH}
              flipV={flipV}
              setFlipV={setFlipV}
            />
          )}
          {activeTab === 'adjust' && <AdjustmentPanel onApplyAdjustment={handleApplyAdjustment} isLoading={isLoading} />}
          {activeTab === 'filters' && <FilterPanel onApplyFilter={handleApplyFilter} isLoading={isLoading} />}
          {activeTab === 'upscale' && (
            <UpscalePanel
              onUpscale={handleUpscale}
              isLoading={isLoading}
              currentWidth={imgRef.current?.naturalWidth}
              currentHeight={imgRef.current?.naturalHeight}
            />
          )}

          {activeTab === 'addproduct' && (
            <div className="flex flex-col items-center gap-6 animate-fade-in">
              {/* Info Text */}
              <div className="w-full max-w-2xl bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-500/30 rounded-xl p-4">
                <h3 className="text-lg font-bold text-purple-300 mb-2">🎨 Logo & Ürün Ekleme</h3>
                <p className="text-sm text-gray-300 leading-relaxed">
                  Ana görselinize logo, marka işareti veya aksesuar (kravat, şal, takı vb.) ekleyin.
                  AI, eklediğiniz öğeyi doğal bir şekilde entegre edecek ve profesyonel bir sonuç üretecektir.
                </p>
              </div>

              {/* Overlay Image Upload */}
              <div className="w-full max-w-2xl">
                <label className="block text-sm font-semibold text-gray-300 mb-3">
                  📤 Logo / Ürün Görseli Yükle
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setOverlayImage(file);
                    }}
                    className="hidden"
                    id="overlay-upload"
                  />
                  <label
                    htmlFor="overlay-upload"
                    className="flex flex-col items-center justify-center w-full h-40 bg-gray-900/50 border-2 border-dashed border-gray-600 rounded-xl cursor-pointer hover:bg-gray-800/50 hover:border-purple-500 transition-all"
                  >
                    {overlayImageUrl ? (
                      <div className="relative w-full h-full p-4">
                        <img
                          src={overlayImageUrl}
                          alt="Overlay Preview"
                          className="w-full h-full object-contain rounded-lg"
                        />
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            setOverlayImage(null);
                          }}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <>
                        <svg className="w-12 h-12 text-gray-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="text-sm text-gray-400 font-medium">Logo veya Ürün Görseli Seçin</p>
                        <p className="text-xs text-gray-500 mt-1">PNG, JPG, WEBP (Şeffaf arka plan önerilir)</p>
                      </>
                    )}
                  </label>
                </div>
              </div>

              {/* Prompt Input */}
              <div className="w-full max-w-2xl">
                <label className="block text-sm font-semibold text-gray-300 mb-3">
                  ✍️ Ne Eklemek İstiyorsunuz?
                </label>
                <textarea
                  value={overlayPrompt}
                  onChange={(e) => setOverlayPrompt(e.target.value)}
                  placeholder="Örnek: 'Bu logoyu sağ üst köşeye ekle' veya 'Bu kravatı kişiye giydir'"
                  rows={4}
                  className="w-full bg-gray-900/50 border border-gray-700 text-gray-200 rounded-xl p-4 text-base focus:ring-2 focus:ring-purple-500 focus:outline-none transition resize-none"
                  disabled={isLoading}
                />
                <p className="text-xs text-gray-500 mt-2">
                  💡 İpucu: Resimde bir nokta seçerek hassas konum belirleyebilirsiniz (opsiyonel)
                </p>
              </div>

              {/* Resolution Selector */}
              <div className="w-full max-w-2xl flex items-center justify-between bg-gray-900/50 border border-gray-700 rounded-xl p-4">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-gray-200">Çıktı Kalitesi</span>
                  <span className="text-xs text-gray-400">4K için +1 kredi eklenir</span>
                </div>
                <div className="flex bg-gray-800 rounded-lg p-1 border border-gray-700">
                  <button
                    onClick={() => setOutputResolution('2K')}
                    className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${outputResolution === '2K'
                      ? 'bg-gray-600 text-white shadow-sm'
                      : 'text-gray-400 hover:text-white'}`}
                  >
                    2K (Standart)
                  </button>
                  <button
                    onClick={() => setOutputResolution('4K')}
                    className={`px-4 py-2 rounded-md text-sm font-semibold transition-all flex items-center gap-1 ${outputResolution === '4K'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-gray-400 hover:text-white'}`}
                  >
                    <span>4K (Ultra)</span>
                    <span className="text-[10px] bg-white/20 px-1 rounded">PRO</span>
                  </button>
                </div>
              </div>

              {/* Add Button */}
              <button
                onClick={handleAddProduct}
                disabled={isLoading || !overlayImage || !overlayPrompt.trim() || !currentImage}
                className="w-full max-w-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-5 px-10 text-lg rounded-2xl shadow-xl hover:shadow-2xl hover:from-purple-500 hover:to-pink-500 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Ekleniyor...' : 'Logo / Ürün Ekle'}
              </button>

              {/* Examples */}
              <div className="w-full max-w-2xl bg-gray-900/30 border border-gray-700/50 rounded-xl p-4">
                <h4 className="text-sm font-bold text-gray-300 mb-3">📋 Örnek Kullanımlar:</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>• <strong>Logo:</strong> "Bu logoyu sağ üst köşeye küçük boyutta ekle"</li>
                  <li>• <strong>Kravat:</strong> "Bu kravatı kişiye doğal bir şekilde giydir"</li>
                  <li>• <strong>Şal:</strong> "Bu şalı omuzlara zarif bir şekilde yerleştir"</li>
                  <li>• <strong>Aksesuar:</strong> "Bu kolye/küpeyi kişiye tak"</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
          <button onClick={handleUndo} disabled={!canUndo || !currentImage} className="flex items-center justify-center text-center bg-white/10 border border-white/20 text-gray-200 font-semibold py-3 px-5 rounded-md transition-all duration-200 ease-in-out hover:bg-white/20 hover:border-white/30 active:scale-95 text-base disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-white/5">
            <UndoIcon className="w-5 h-5 mr-2" />
            Geri Al
          </button>
          <button onClick={handleRedo} disabled={!canRedo || !currentImage} className="flex items-center justify-center text-center bg-white/10 border border-white/20 text-gray-200 font-semibold py-3 px-5 rounded-md transition-all duration-200 ease-in-out hover:bg-white/20 hover:border-white/30 active:scale-95 text-base disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-white/5">
            <RedoIcon className="w-5 h-5 mr-2" />
            İleri Al
          </button>

          {currentImage && (
            <div className="h-6 w-px bg-gray-600 mx-1 hidden sm:block"></div>
          )}

          {canUndo && currentImage && (
            <>
              <button
                onMouseDown={() => { setIsSplitMode(false); setIsComparing(true); }}
                onMouseUp={() => setIsComparing(false)}
                onMouseLeave={() => setIsComparing(false)}
                onTouchStart={() => { setIsSplitMode(false); setIsComparing(true); }}
                onTouchEnd={() => setIsComparing(false)}
                className={`flex items-center justify-center text-center bg-white/10 border border-white/20 text-gray-200 font-semibold py-3 px-5 rounded-md transition-all duration-200 ease-in-out hover:bg-white/20 hover:border-white/30 active:scale-95 text-base ${isComparing ? 'bg-blue-500 text-white' : ''}`}
              >
                <EyeIcon className="w-5 h-5 mr-2" />
                Orijinali Gör
              </button>
              <button
                onClick={() => setIsSplitMode(!isSplitMode)}
                className={`p-3 rounded-md transition-all border ${isSplitMode ? 'bg-blue-500 text-white border-blue-500' : 'bg-white/10 border-white/20 text-gray-400 hover:bg-white/20'}`}
                title="Bölünmüş Görünüm"
              >
                <SplitIcon className="w-5 h-5" />
              </button>
            </>
          )}

          {currentImage && (
            <div className="h-6 w-px bg-gray-600 mx-1 hidden sm:block"></div>
          )}

          <div className="flex items-center bg-white/10 border border-white/20 rounded-md">
            <button onClick={() => handleZoom(-0.2)} disabled={scale <= 0.5 || !currentImage} className="p-3 text-gray-200 hover:bg-white/20 rounded-l-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"><ZoomOutIcon className="w-5 h-5" /></button>
            <span className="w-16 text-center text-base font-semibold text-gray-300">{Math.round(scale * 100)}%</span>
            <button onClick={() => handleZoom(0.2)} disabled={scale >= 5 || !currentImage} className="p-3 text-gray-200 hover:bg-white/20 rounded-r-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"><ZoomInIcon className="w-5 h-5" /></button>
          </div>
          <button onClick={handleResetView} disabled={!currentImage} className="flex items-center justify-center text-center bg-white/10 border border-white/20 text-gray-200 font-semibold py-3 px-5 rounded-md transition-all duration-200 ease-in-out hover:bg-white/20 hover:border-white/30 active:scale-95 text-base disabled:opacity-50 disabled:cursor-not-allowed"><ArrowsPointingOutIcon className="w-5 h-5 mr-2" /> Görünümü Sıfırla</button>


          <button onClick={handleReset} disabled={!canUndo || !currentImage} className="text-center bg-transparent border border-white/20 text-gray-200 font-semibold py-3 px-5 rounded-md transition-all duration-200 ease-in-out hover:bg-white/10 hover:border-white/30 active:scale-95 text-base disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-transparent">
            Sıfırla
          </button>
          <button onClick={handleUploadNew} className="text-center bg-white/10 border border-white/20 text-gray-200 font-semibold py-3 px-5 rounded-md transition-all duration-200 ease-in-out hover:bg-white/20 hover:border-white/30 active:scale-95 text-base">
            Yeni Yükle
          </button>

          <div className="flex-grow sm:flex-grow-0 ml-auto flex gap-2">
            <button onClick={handleDownloadTransparentSvg} disabled={isLoading || !currentImage} className="bg-transparent border border-white/20 text-gray-200 font-semibold py-3 px-5 rounded-md transition-all duration-300 ease-in-out hover:bg-white/10 hover:border-white/30 active:scale-95 text-base flex items-center disabled:opacity-50 disabled:cursor-not-allowed">
              <DownloadIcon className="w-5 h-5 mr-2" />
              SVG (Şeffaf)
            </button>
            <button onClick={handleDownload} disabled={!currentImage} className="bg-gradient-to-br from-green-600 to-green-500 text-white font-bold py-3 px-5 rounded-md transition-all duration-300 ease-in-out shadow-lg shadow-green-500/20 hover:shadow-xl hover:shadow-green-500/40 hover:-translate-y-px active:scale-95 active:shadow-inner text-base flex items-center disabled:opacity-50 disabled:cursor-not-allowed">
              Resmi İndir
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen text-gray-100 flex flex-col py-8 px-4">
      <main className={`flex-grow w-full max-w-[1600px] mx-auto flex justify-center ${currentImage ? 'items-start' : 'items-center'}`}>
        {renderContent()}
      </main>
    </div>
  );
};

export default PixshopPage;
