import React, { useState, useEffect } from 'react';
import { DownloadIcon } from './icons/DownloadIcon';
import { VideoIcon } from './icons/VideoIcon';
import { ShareIcon } from './icons/ShareIcon';
import { UpscaleIcon } from './icons/UpscaleIcon';
import { upscaleImage } from '../services/geminiService';
import { BeforeAfterSlider } from './BeforeAfterSlider';

interface ResultDisplayProps {
  isLoading: boolean;
  loadingText?: string;
  progress?: number;
  generatedImageUrl?: string | null;
  beforeImageUrl?: string | null; // Product image for comparison
  sketchImageUrl?: string | null; // Sketch image for gallery
  generatedVideoUrl?: string | null;
  onDownload: () => void;
  onConvertToVideo: () => void;
  onShare: () => void;
  isShareSupported: boolean;
}

const LoadingState: React.FC<{text: string, progress: number}> = ({text, progress}) => (
    <div className="flex flex-col items-center justify-center gap-6 text-center w-full max-w-md px-6">
        <div className="relative">
             <div className="w-20 h-20 border-4 border-slate-700 border-t-cyan-400 rounded-full animate-spin"></div>
             <div className="absolute inset-0 flex items-center justify-center font-bold text-cyan-400 text-sm">
                 {progress}%
             </div>
        </div>
       
        <div className="w-full space-y-2">
            <p className="text-slate-300 font-medium animate-pulse">{text}</p>
            <div className="w-full bg-slate-700/50 rounded-full h-3 overflow-hidden border border-slate-600">
                <div 
                    className="bg-gradient-to-r from-cyan-500 to-purple-500 h-full rounded-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                    style={{ width: `${Math.max(5, progress)}%` }}
                />
            </div>
            <p className="text-xs text-slate-500">İşlem yoğunluğuna göre süre değişebilir.</p>
        </div>
    </div>
);


export const ResultDisplay: React.FC<ResultDisplayProps> = ({ 
    isLoading, 
    loadingText = 'Yapay zeka düşünüyor...', 
    progress = 0,
    generatedImageUrl, 
    beforeImageUrl,
    sketchImageUrl,
    generatedVideoUrl,
    onDownload,
    onConvertToVideo,
    onShare,
    isShareSupported
}) => {
  const [activeTab, setActiveTab] = useState<'image' | 'comparison' | 'gallery' | 'video'>('image');
  const [isUpscaling, setIsUpscaling] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(generatedImageUrl || null);
  const [isUpscaled, setIsUpscaled] = useState(false);

  // Update internal image state when prop changes
  useEffect(() => {
      setCurrentImageUrl(generatedImageUrl || null);
      setIsUpscaled(false);
  }, [generatedImageUrl]);
  
  const hasImage = !!currentImageUrl;
  const hasVideo = !!generatedVideoUrl;
  
  // Switch to video tab automatically when video is ready
  useEffect(() => {
      if (hasVideo) setActiveTab('video');
  }, [hasVideo]);

  // Switch to image tab automatically when image is ready
  useEffect(() => {
      if (hasImage && !hasVideo) setActiveTab('image');
  }, [hasImage, hasVideo]);

  const handleUpscale = async () => {
      if (!currentImageUrl) return;
      setIsUpscaling(true);
      try {
          // Convert current base64/url to File object
          const res = await fetch(currentImageUrl);
          const blob = await res.blob();
          const file = new File([blob], "image.png", { type: blob.type });
          
          const upscaledUrl = await upscaleImage(file);
          setCurrentImageUrl(upscaledUrl);
          setIsUpscaled(true);
      } catch (e) {
          alert("Upscale işlemi başarısız oldu.");
      } finally {
          setIsUpscaling(false);
      }
  };

  const handleDownloadGallery = async () => {
      if (!currentImageUrl) return;
      
      try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) return;

          // Load images
          const images = await Promise.all([
              sketchImageUrl ? loadImage(sketchImageUrl) : null,
              beforeImageUrl ? loadImage(beforeImageUrl) : null,
              loadImage(currentImageUrl)
          ].filter(Boolean) as Promise<HTMLImageElement>[]);

          if (images.length === 0) return;

          // Calculate canvas dimensions (3:4 aspect ratio per image)
          const imageWidth = 800;
          const imageHeight = Math.round(imageWidth * 4 / 3);
          const gap = 20;
          const padding = 40;
          
          canvas.width = (imageWidth * images.length) + (gap * (images.length - 1)) + (padding * 2);
          canvas.height = imageHeight + (padding * 2);

          // Fill background
          ctx.fillStyle = '#0f172a'; // slate-900
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Draw images
          let xOffset = padding;
          const labels = ['1. Çizim', '2. Ürün', '3. Model (Sonuç)'];
          const labelColors = ['#94a3b8', '#c084fc', '#22d3ee']; // slate-400, purple-400, cyan-400
          
          images.forEach((img, index) => {
              // Draw image
              ctx.drawImage(img, xOffset, padding, imageWidth, imageHeight);
              
              // Draw border
              ctx.strokeStyle = index === images.length - 1 ? '#22d3ee' : '#475569'; // cyan or slate-600
              ctx.lineWidth = index === images.length - 1 ? 4 : 2;
              ctx.strokeRect(xOffset, padding, imageWidth, imageHeight);
              
              // Draw label
              ctx.fillStyle = labelColors[labels.length - images.length + index];
              ctx.font = 'bold 24px Inter, sans-serif';
              ctx.fillText(labels[labels.length - images.length + index], xOffset + 10, padding - 10);
              
              xOffset += imageWidth + gap;
          });

          // Download
          canvas.toBlob((blob) => {
              if (!blob) return;
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'galeri-cizim-urun-model.png';
              a.click();
              URL.revokeObjectURL(url);
          }, 'image/png');
      } catch (e) {
          console.error('Galeri indirme hatası:', e);
          alert('Galeri indirilemedi.');
      }
  };

  const loadImage = (src: string): Promise<HTMLImageElement> => {
      return new Promise((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = src;
      });
  };

  const tabs = [
      { id: 'image', label: 'Sonuç' },
      { id: 'comparison', label: 'Karşılaştırma', disabled: !beforeImageUrl || !currentImageUrl },
      { id: 'gallery', label: 'Galeri', disabled: !currentImageUrl },
      { id: 'video', label: 'Video', disabled: !hasVideo }
  ];

  return (
    <div className="w-full h-full min-h-[500px] bg-slate-800 border-2 border-slate-700 rounded-2xl flex flex-col p-4 relative overflow-hidden">
      
      {/* Tabs */}
      {hasImage && !isLoading && (
          <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-600">
              {tabs.map(tab => (
                  <button
                      key={tab.id}
                      onClick={() => !tab.disabled && setActiveTab(tab.id as any)}
                      disabled={Boolean(tab.disabled)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                          activeTab === tab.id 
                              ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/40' 
                              : tab.disabled 
                                  ? 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700'
                                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600 border border-slate-600'
                      }`}
                  >
                      {tab.label}
                  </button>
              ))}
          </div>
      )}

      <div className="flex-grow flex items-center justify-center relative bg-slate-900/50 rounded-xl overflow-hidden border border-slate-700/50">
        {isLoading ? (
            <LoadingState text={loadingText} progress={progress} />
        ) : isUpscaling ? (
             <LoadingState text="Çözünürlük ve detaylar artırılıyor (Upscaling)..." progress={75} />
        ) : hasImage ? (
            <>
                {activeTab === 'image' && (
                    <div className="relative w-full h-full">
                        <img src={currentImageUrl!} alt="Oluşturulan Canlı Model" className="w-full h-full object-contain animate-fade-in" />
                        
                        {/* Quality Badge */}
                        <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 flex items-center gap-2">
                             <div className={`w-2 h-2 rounded-full ${isUpscaled ? 'bg-cyan-400 shadow-[0_0_8px_cyan]' : 'bg-green-400'}`}></div>
                             <span className="text-xs font-bold text-white tracking-wide">
                                 {isUpscaled ? '4K ULTRA DETAY' : 'HD READY'}
                             </span>
                        </div>
                    </div>
                )}

                {activeTab === 'comparison' && (
                     <div className="w-full h-full flex items-center justify-center p-4">
                        <BeforeAfterSlider 
                            beforeImageUrl={beforeImageUrl} 
                            afterImageUrl={currentImageUrl} 
                        />
                     </div>
                )}
                
                {activeTab === 'gallery' && (
                    <div className="w-full h-full p-4 flex flex-col gap-4">
                        {/* Gallery Grid */}
                        <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-4 overflow-y-auto">
                            {sketchImageUrl && (
                                <div className="flex flex-col gap-2">
                                    <span className="text-xs text-slate-400 font-semibold uppercase">1. Çizim</span>
                                    <img src={sketchImageUrl} alt="Sketch" className="w-full aspect-[3/4] object-cover rounded-lg border border-slate-600" />
                                </div>
                            )}
                            {beforeImageUrl && (
                                <div className="flex flex-col gap-2">
                                    <span className="text-xs text-purple-400 font-semibold uppercase">2. Ürün</span>
                                    <img src={beforeImageUrl} alt="Product" className="w-full aspect-[3/4] object-cover rounded-lg border border-slate-600" />
                                </div>
                            )}
                             <div className="flex flex-col gap-2">
                                <span className="text-xs text-cyan-400 font-semibold uppercase">3. Model (Sonuç)</span>
                                <img src={currentImageUrl!} alt="Model" className="w-full aspect-[3/4] object-cover rounded-lg border-2 border-cyan-500/50 shadow-lg shadow-cyan-900/20" />
                            </div>
                        </div>
                        
                        {/* Gallery Download Button */}
                        <div className="flex justify-center pt-2 border-t border-slate-700">
                            <button
                                onClick={handleDownloadGallery}
                                className="bg-gradient-to-r from-cyan-600 to-purple-600 text-white px-6 py-3 rounded-full hover:from-cyan-500 hover:to-purple-500 transition-all shadow-lg flex items-center gap-2 font-semibold"
                                title="Galeriyi Tek Görsel Olarak İndir"
                            >
                                <DownloadIcon />
                                Galeriyi Tek Görsel Olarak İndir
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'video' && hasVideo && (
                    <video src={generatedVideoUrl!} controls autoPlay loop className="max-w-full max-h-full object-contain" />
                )}
                
                {/* Actions Bar (Overlay on Image/Video mode, Static elsewhere) */}
                <div className={`absolute bottom-4 right-4 flex gap-3 transition-opacity duration-300 ${activeTab === 'gallery' || activeTab === 'comparison' ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                    
                    {/* Upscale Button (Only on Image Tab and if not already upscaled) */}
                    {activeTab === 'image' && !isUpscaled && (
                         <button
                            onClick={handleUpscale}
                            className="bg-indigo-600/90 text-white p-3 rounded-full hover:bg-indigo-500 transition-all shadow-lg backdrop-blur-sm group relative"
                            title="4K Yükselt (Upscale)"
                        >
                            <UpscaleIcon />
                            <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black/80 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                4K Yap
                            </span>
                        </button>
                    )}

                    {isShareSupported && (
                        <button
                            onClick={onShare}
                            className="bg-green-600/90 text-white p-3 rounded-full hover:bg-green-500 transition-all shadow-lg backdrop-blur-sm"
                            title="Paylaş"
                        >
                            <ShareIcon />
                        </button>
                    )}
                    {(activeTab === 'image') && (
                        <button
                            onClick={onConvertToVideo}
                            className="bg-purple-600/90 text-white p-3 rounded-full hover:bg-purple-500 transition-all shadow-lg backdrop-blur-sm"
                            title="Videoya Dönüştür"
                        >
                            <VideoIcon />
                        </button>
                    )}
                    <button
                        onClick={onDownload}
                        className="bg-cyan-600/90 text-white p-3 rounded-full hover:bg-cyan-500 transition-all shadow-lg backdrop-blur-sm"
                        title="İndir"
                    >
                        <DownloadIcon />
                    </button>
                </div>
            </>
        ) : (
            <div className="text-center text-slate-500 p-8">
                <div className="mb-4 text-slate-600">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                </div>
                <p>Oluşturulan canlı model ve görüntüleri burada görünecek.</p>
            </div>
        )}
      </div>
    </div>
  );
};