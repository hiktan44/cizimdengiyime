/**
 * Pixshop Page - Fotoğraf Düzenleme Aracı
 * Kredi sistemi ve geçmiş kayıt entegrasyonuyla
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import ReactCrop, { type Crop, type PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { pixshopGenerateEditedImage, pixshopGenerateFilteredImage, pixshopGenerateAdjustedImage, pixshopRemoveBackground, pixshopUpscaleImage } from '../services/pixshopService';
import Spinner from '../components/pixshop/Spinner';
import FilterPanel from '../components/pixshop/FilterPanel';
import AdjustmentPanel from '../components/pixshop/AdjustmentPanel';
import CropPanel from '../components/pixshop/CropPanel';
import UpscalePanel from '../components/pixshop/UpscalePanel';
import StartScreen from '../components/pixshop/StartScreen';
import { UndoIcon, RedoIcon, EyeIcon, ZoomInIcon, ZoomOutIcon, ArrowsPointingOutIcon, DownloadIcon } from '../components/pixshop/icons';
import { checkAndDeductCredits, saveGeneration, uploadBase64ToStorage } from '../lib/database';
import { CREDIT_COSTS, Profile } from '../lib/supabase';

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
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, {type:mime});
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

type Tab = 'retouch' | 'adjust' | 'filters' | 'crop' | 'upscale';

const TABS: { id: Tab, name: string }[] = [
    { id: 'retouch', name: 'Rötuş' },
    { id: 'crop', name: 'Kırp' },
    { id: 'adjust', name: 'Ayarla' },
    { id: 'filters', name: 'Filtreler' },
    { id: 'upscale', name: 'Yükselt' },
];

export const PixshopPage: React.FC<PixshopPageProps> = ({ profile, onRefreshProfile, onShowBuyCredits }) => {
  const [history, setHistory] = useState<File[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [prompt, setPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
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
  
  // Zoom & Pan state
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  
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
    const result = await checkAndDeductCredits(profile.id, 'pixshop');
    if (!result.success) {
      setError(result.message || 'Yetersiz kredi.');
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
        const editedImageUrl = await pixshopGenerateEditedImage(currentImage, prompt, editHotspot);
        const newImageFile = dataURLtoFile(editedImageUrl, `edited-${Date.now()}.png`);
        addImageToHistory(newImageFile);
        await saveToHistory(editedImageUrl);
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
        const filteredImageUrl = await pixshopGenerateFilteredImage(currentImage, filterPrompt);
        const newImageFile = dataURLtoFile(filteredImageUrl, `filtered-${Date.now()}.png`);
        addImageToHistory(newImageFile);
        await saveToHistory(filteredImageUrl);
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
        const adjustedImageUrl = await pixshopGenerateAdjustedImage(currentImage, adjustmentPrompt);
        const newImageFile = dataURLtoFile(adjustedImageUrl, `adjusted-${Date.now()}.png`);
        addImageToHistory(newImageFile);
        await saveToHistory(adjustedImageUrl);
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Bilinmeyen bir hata oluştu.';
        setError(`Ayar uygulanamadı. ${errorMessage}`);
        console.error(err);
    } finally {
        setIsLoading(false);
    }
  }, [currentImage, addImageToHistory, profile]);

  const handleApplyCrop = useCallback(() => {
    if (!completedCrop?.width || !completedCrop?.height || !imgRef.current) {
        setError('Lütfen kırpmak için geçerli bir alan seçin.');
        return;
    }

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
    addImageToHistory(newImageFile);
  }, [completedCrop, addImageToHistory]);
  
  const handleUpscale = useCallback(async (size: '2K' | '4K') => {
      if (!currentImage) return;
      
      if (!await checkCredits()) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
          const upscaledImageUrl = await pixshopUpscaleImage(currentImage, size);
          const newImageFile = dataURLtoFile(upscaledImageUrl, `upscaled-${size}-${Date.now()}.png`);
          addImageToHistory(newImageFile);
          await saveToHistory(upscaledImageUrl);
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

  const handleDownload = useCallback(() => {
      if (currentImage) {
          const link = document.createElement('a');
          link.href = URL.createObjectURL(currentImage);
          link.download = `pixshop-${currentImage.name}`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(link.href);
      }
  }, [currentImage]);

  const handleDownloadTransparentSvg = useCallback(async () => {
    if (!currentImage) return;
    
    if (!await checkCredits()) return;
    
    setIsLoading(true);
    setError(null);

    try {
        const transparentImageUrl = await pixshopRemoveBackground(currentImage);
        
        const img = new Image();
        img.src = transparentImageUrl;
        await new Promise((resolve) => { img.onload = resolve; });
        
        const svgContent = `<svg width="${img.naturalWidth}" height="${img.naturalHeight}" xmlns="http://www.w3.org/2000/svg">
  <image href="${transparentImageUrl}" height="${img.naturalHeight}" width="${img.naturalWidth}" />
</svg>`;
        
        const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        const nameParts = currentImage.name.split('.');
        const fileName = nameParts.length > 1 ? nameParts.slice(0, -1).join('.') : currentImage.name;
        link.download = `transparent-${fileName}.svg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
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
      if (!isPanning) return;
      setPosition({
          x: e.clientX - panStart.x,
          y: e.clientY - panStart.y,
      });
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
    
    if (!currentImageUrl) {
      return <StartScreen onFileSelect={handleFileSelect} />;
    }
    
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
          <div className="w-full flex items-center justify-between bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2">
            <span className="text-sm text-slate-400">Her işlem <span className="text-cyan-400 font-bold">{CREDIT_COSTS.PIXSHOP} kredi</span> harcar</span>
            <span className="text-sm text-slate-300">Mevcut: <span className="text-cyan-400 font-bold">{profile.credits}</span> kredi</span>
          </div>
        )}

        {/* Main Image Container */}
        <div ref={imageContainerRef} className="relative w-full shadow-2xl rounded-xl overflow-hidden bg-black/20 flex items-center justify-center min-h-[400px]">
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
                  {originalImageUrl && (
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
                      className={`absolute inset-0 max-w-full max-h-full object-contain m-auto transition-opacity duration-200 ease-in-out ${isComparing ? 'opacity-0' : 'opacity-100'}`}
                      draggable={false}
                  />
                  
                  {displayHotspot && !isLoading && activeTab === 'retouch' && (
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

                </div>
              </div>
            )}
        </div>
        
        {/* Tabs */}
        <div className="w-full bg-gray-800/80 border border-gray-700/80 rounded-lg p-2 flex items-center justify-center gap-2 backdrop-blur-sm overflow-x-auto">
            {TABS.map(tab => (
                 <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`min-w-fit capitalize font-semibold py-3 px-5 rounded-md transition-all duration-200 text-base whitespace-nowrap ${
                        activeTab === tab.id 
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
                <div className="flex flex-col items-center gap-4">
                    <p className="text-md text-gray-400">
                        {editHotspot ? 'Harika! Şimdi yapmak istediğiniz düzenlemeyi aşağıya yazın.' : 'Hassas düzenleme için resimde bir noktaya tıklayın.'}
                    </p>
                    <form onSubmit={(e) => { e.preventDefault(); handleGenerate(); }} className="w-full flex items-center gap-2">
                        <input
                            type="text"
                            value={prompt}
                            onChange={e => setPrompt(e.target.value)}
                            placeholder={editHotspot ? "ör., 'gömleğimin rengini mavi yap'" : "Önce resimde bir nokta seçin"}
                            className="flex-grow bg-gray-800 border border-gray-700 text-gray-200 rounded-lg p-5 text-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition w-full disabled:cursor-not-allowed disabled:opacity-60"
                            disabled={isLoading || !editHotspot}
                        />
                        <button 
                            type="submit"
                            className="bg-gradient-to-br from-blue-600 to-blue-500 text-white font-bold py-5 px-8 text-lg rounded-lg transition-all duration-300 ease-in-out shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-px active:scale-95 active:shadow-inner disabled:from-blue-800 disabled:to-blue-700 disabled:shadow-none disabled:cursor-not-allowed disabled:transform-none"
                            disabled={isLoading || !prompt.trim() || !editHotspot}
                        >
                            Oluştur
                        </button>
                    </form>
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
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
            <button onClick={handleUndo} disabled={!canUndo} className="flex items-center justify-center text-center bg-white/10 border border-white/20 text-gray-200 font-semibold py-3 px-5 rounded-md transition-all duration-200 ease-in-out hover:bg-white/20 hover:border-white/30 active:scale-95 text-base disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-white/5">
                <UndoIcon className="w-5 h-5 mr-2" />
                Geri Al
            </button>
            <button onClick={handleRedo} disabled={!canRedo} className="flex items-center justify-center text-center bg-white/10 border border-white/20 text-gray-200 font-semibold py-3 px-5 rounded-md transition-all duration-200 ease-in-out hover:bg-white/20 hover:border-white/30 active:scale-95 text-base disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-white/5">
                <RedoIcon className="w-5 h-5 mr-2" />
                İleri Al
            </button>
            
            <div className="h-6 w-px bg-gray-600 mx-1 hidden sm:block"></div>

            {canUndo && (
              <button 
                  onMouseDown={() => setIsComparing(true)}
                  onMouseUp={() => setIsComparing(false)}
                  onMouseLeave={() => setIsComparing(false)}
                  onTouchStart={() => setIsComparing(true)}
                  onTouchEnd={() => setIsComparing(false)}
                  className="flex items-center justify-center text-center bg-white/10 border border-white/20 text-gray-200 font-semibold py-3 px-5 rounded-md transition-all duration-200 ease-in-out hover:bg-white/20 hover:border-white/30 active:scale-95 text-base"
              >
                  <EyeIcon className="w-5 h-5 mr-2" />
                  Karşılaştır
              </button>
            )}

            <div className="h-6 w-px bg-gray-600 mx-1 hidden sm:block"></div>
            
            <div className="flex items-center bg-white/10 border border-white/20 rounded-md">
              <button onClick={() => handleZoom(-0.2)} disabled={scale <= 0.5} className="p-3 text-gray-200 hover:bg-white/20 rounded-l-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"><ZoomOutIcon className="w-5 h-5"/></button>
              <span className="w-16 text-center text-base font-semibold text-gray-300">{Math.round(scale * 100)}%</span>
              <button onClick={() => handleZoom(0.2)} disabled={scale >= 5} className="p-3 text-gray-200 hover:bg-white/20 rounded-r-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"><ZoomInIcon className="w-5 h-5"/></button>
            </div>
            <button onClick={handleResetView} className="flex items-center justify-center text-center bg-white/10 border border-white/20 text-gray-200 font-semibold py-3 px-5 rounded-md transition-all duration-200 ease-in-out hover:bg-white/20 hover:border-white/30 active:scale-95 text-base"><ArrowsPointingOutIcon className="w-5 h-5 mr-2" /> Görünümü Sıfırla</button>


            <button onClick={handleReset} disabled={!canUndo} className="text-center bg-transparent border border-white/20 text-gray-200 font-semibold py-3 px-5 rounded-md transition-all duration-200 ease-in-out hover:bg-white/10 hover:border-white/30 active:scale-95 text-base disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-transparent">
                Sıfırla
            </button>
            <button onClick={handleUploadNew} className="text-center bg-white/10 border border-white/20 text-gray-200 font-semibold py-3 px-5 rounded-md transition-all duration-200 ease-in-out hover:bg-white/20 hover:border-white/30 active:scale-95 text-base">
                Yeni Yükle
            </button>

            <div className="flex-grow sm:flex-grow-0 ml-auto flex gap-2">
                <button onClick={handleDownloadTransparentSvg} disabled={isLoading} className="bg-transparent border border-white/20 text-gray-200 font-semibold py-3 px-5 rounded-md transition-all duration-300 ease-in-out hover:bg-white/10 hover:border-white/30 active:scale-95 text-base flex items-center disabled:opacity-50 disabled:cursor-not-allowed">
                    <DownloadIcon className="w-5 h-5 mr-2" />
                    SVG (Şeffaf)
                </button>
                <button onClick={handleDownload} className="bg-gradient-to-br from-green-600 to-green-500 text-white font-bold py-3 px-5 rounded-md transition-all duration-300 ease-in-out shadow-lg shadow-green-500/20 hover:shadow-xl hover:shadow-green-500/40 hover:-translate-y-px active:scale-95 active:shadow-inner text-base flex items-center">
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

