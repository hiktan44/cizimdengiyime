import React, { useState, useEffect } from 'react';
import { GenerationResult } from '../AdgeniusPage';
import { Download, AlertCircle, Loader2, Video, LayoutGrid, Image as ImageIcon, RefreshCw, PackageOpen, Images } from 'lucide-react';

interface Props {
  results: GenerationResult[];
  onRegenerate: (id: number) => void;
  t: any;
}

const ResultsGallery: React.FC<Props> = ({ results, onRegenerate, t }) => {
  const [collageUrl, setCollageUrl] = useState<string | null>(null);
  const [isGeneratingCollage, setIsGeneratingCollage] = useState(false);
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState('');

  // Filter only successfully generated images
  const completedImages = results.filter(r => r.imageUrl && (r.status === 'completed' || r.status === 'generating_video'));
  const completedVideos = results.filter(r => r.videoUrl && r.status === 'completed');
  const allFinished = results.every(r => r.status === 'completed' || r.status === 'failed');

  const handleDownload = async (url: string, suggestedFilename: string) => {
    const { downloadFile } = await import('../../utils/downloadHelper');
    const success = await downloadFile(url, suggestedFilename);

    if (!success) {
      alert('İndirme başarısız oldu. Lütfen tekrar deneyin.');
    }
  };

  const getExtension = (url: string) => {
    if (url.includes('image/jpeg')) return '.jpg';
    if (url.includes('image/webp')) return '.webp';
    return '.png';
  };

  // === BULK DOWNLOAD: All Images ===
  const handleDownloadAllImages = async () => {
    if (completedImages.length === 0) return;
    setIsDownloadingAll(true);

    try {
      const { downloadFile } = await import('../../utils/downloadHelper');

      for (let i = 0; i < completedImages.length; i++) {
        const item = completedImages[i];
        setDownloadProgress(`Görseller: ${i + 1}/${completedImages.length}`);

        const ext = getExtension(item.imageUrl!);
        const filename = `adgenius-gorsel-${i + 1}-${item.type?.replace(/[^a-zA-Z0-9]/g, '_') || i}${ext}`;
        await downloadFile(item.imageUrl!, filename);

        // Small delay between downloads to prevent browser blocking
        if (i < completedImages.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      setDownloadProgress('');
    } catch (e) {
      console.error("Bulk image download error:", e);
    } finally {
      setIsDownloadingAll(false);
    }
  };

  // === BULK DOWNLOAD: All Videos ===
  const handleDownloadAllVideos = async () => {
    if (completedVideos.length === 0) return;
    setIsDownloadingAll(true);

    try {
      const { downloadFile } = await import('../../utils/downloadHelper');

      for (let i = 0; i < completedVideos.length; i++) {
        const item = completedVideos[i];
        setDownloadProgress(`Videolar: ${i + 1}/${completedVideos.length}`);

        const filename = `adgenius-video-${i + 1}-${item.type?.replace(/[^a-zA-Z0-9]/g, '_') || i}.mp4`;
        await downloadFile(item.videoUrl!, filename);

        if (i < completedVideos.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      setDownloadProgress('');
    } catch (e) {
      console.error("Bulk video download error:", e);
    } finally {
      setIsDownloadingAll(false);
    }
  };

  // === BULK DOWNLOAD: All Images + Videos ===
  const handleDownloadEverything = async () => {
    if (completedImages.length === 0 && completedVideos.length === 0) return;
    setIsDownloadingAll(true);

    try {
      const { downloadFile } = await import('../../utils/downloadHelper');
      const totalItems = completedImages.length + completedVideos.length;
      let current = 0;

      // Download images
      for (let i = 0; i < completedImages.length; i++) {
        current++;
        const item = completedImages[i];
        setDownloadProgress(`${current}/${totalItems} indiriliyor...`);

        const ext = getExtension(item.imageUrl!);
        const filename = `adgenius-gorsel-${i + 1}-${item.type?.replace(/[^a-zA-Z0-9]/g, '_') || i}${ext}`;
        await downloadFile(item.imageUrl!, filename);
        await new Promise(resolve => setTimeout(resolve, 400));
      }

      // Download videos
      for (let i = 0; i < completedVideos.length; i++) {
        current++;
        const item = completedVideos[i];
        setDownloadProgress(`${current}/${totalItems} indiriliyor...`);

        const filename = `adgenius-video-${i + 1}-${item.type?.replace(/[^a-zA-Z0-9]/g, '_') || i}.mp4`;
        await downloadFile(item.videoUrl!, filename);
        await new Promise(resolve => setTimeout(resolve, 400));
      }

      setDownloadProgress('');
    } catch (e) {
      console.error("Bulk download error:", e);
    } finally {
      setIsDownloadingAll(false);
    }
  };

  const generateCollage = async () => {
    if (completedImages.length === 0) return;
    setIsGeneratingCollage(true);

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const gap = 20;
      const padding = 40;
      const headerHeight = 0;
      const count = completedImages.length;

      let cols = 3;
      if (count <= 2) cols = 2;
      else if (count === 4) cols = 2;
      else if (count >= 5) cols = 3;

      const rows = Math.ceil(count / cols);

      const loadImage = (src: string) => new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        if (!src.startsWith('data:')) {
          img.crossOrigin = "Anonymous";
        }
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
      });

      const firstImg = await loadImage(completedImages[0].imageUrl!);
      const imgAspect = firstImg.width / firstImg.height;
      const targetImageWidth = 800;
      const targetImageHeight = targetImageWidth / imgAspect;

      const totalWidth = (cols * targetImageWidth) + ((cols - 1) * gap) + (padding * 2);
      const totalHeight = (rows * targetImageHeight) + ((rows - 1) * gap) + (padding * 2) + headerHeight;

      canvas.width = totalWidth;
      canvas.height = totalHeight;

      const gradient = ctx.createLinearGradient(0, 0, 0, totalHeight);
      gradient.addColorStop(0, '#0f172a');
      gradient.addColorStop(1, '#1e293b');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, totalWidth, totalHeight);

      await Promise.all(completedImages.map(async (item, index) => {
        const img = await loadImage(item.imageUrl!);
        const colIndex = index % cols;
        const rowIndex = Math.floor(index / cols);

        const x = padding + (colIndex * (targetImageWidth + gap));
        const y = headerHeight + padding + (rowIndex * (targetImageHeight + gap));

        ctx.save();
        ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
        ctx.shadowBlur = 20;
        ctx.shadowOffsetX = 10;
        ctx.shadowOffsetY = 10;

        const radius = 16;
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + targetImageWidth - radius, y);
        ctx.quadraticCurveTo(x + targetImageWidth, y, x + targetImageWidth - radius, y + radius);
        ctx.lineTo(x + targetImageWidth, y + targetImageHeight - radius);
        ctx.quadraticCurveTo(x, y + targetImageHeight, x + radius, y + targetImageHeight - radius);
        ctx.lineTo(x + radius, y + targetImageHeight - radius);
        ctx.quadraticCurveTo(x, y, x + radius, y + targetImageHeight - radius);
        ctx.closePath();
        ctx.clip();

        ctx.drawImage(img, x, y, targetImageWidth, targetImageHeight);
        ctx.restore();
      }));

      setCollageUrl(canvas.toDataURL('image/png'));
    } catch (e) {
      console.error("Collage generation error:", e);
    } finally {
      setIsGeneratingCollage(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto pb-20 space-y-8">

      {/* ===== BULK DOWNLOAD ACTION BAR ===== */}
      {completedImages.length > 0 && (
        <div className="bg-gradient-to-r from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-slate-700 rounded-2xl p-5 animate-fade-in">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <PackageOpen className="w-7 h-7 text-cyan-400" />
              <div>
                <h3 className="text-white font-bold text-lg">Toplu İndirme</h3>
                <p className="text-slate-400 text-xs">
                  {completedImages.length} görsel{completedVideos.length > 0 ? `, ${completedVideos.length} video` : ''} hazır
                  {isDownloadingAll && downloadProgress && (
                    <span className="ml-2 text-cyan-400 animate-pulse">• {downloadProgress}</span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Download All Images */}
              <button
                onClick={handleDownloadAllImages}
                disabled={isDownloadingAll || completedImages.length === 0}
                className="bg-cyan-600/20 hover:bg-cyan-600/40 text-cyan-300 px-4 py-2.5 rounded-xl text-xs font-medium transition-all flex items-center gap-2 border border-cyan-500/30 hover:border-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Images className="w-4 h-4" />
                Tüm Görselleri İndir ({completedImages.length})
              </button>

              {/* Download All Videos (if any) */}
              {completedVideos.length > 0 && (
                <button
                  onClick={handleDownloadAllVideos}
                  disabled={isDownloadingAll}
                  className="bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 px-4 py-2.5 rounded-xl text-xs font-medium transition-all flex items-center gap-2 border border-purple-500/30 hover:border-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Video className="w-4 h-4" />
                  Tüm Videoları İndir ({completedVideos.length})
                </button>
              )}

              {/* Download Everything */}
              {(completedImages.length + completedVideos.length) > 1 && (
                <button
                  onClick={handleDownloadEverything}
                  disabled={isDownloadingAll}
                  className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDownloadingAll ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> İndiriliyor...</>
                  ) : (
                    <><Download className="w-4 h-4" /> Hepsini İndir</>
                  )}
                </button>
              )}

              {/* Album / Collage */}
              {allFinished && completedImages.length >= 2 && (
                <>
                  {!collageUrl ? (
                    <button
                      onClick={generateCollage}
                      disabled={isGeneratingCollage}
                      className="bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 px-4 py-2.5 rounded-xl text-xs font-medium transition-all flex items-center gap-2 border border-blue-500/30 hover:border-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isGeneratingCollage ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Albüm...</>
                      ) : (
                        <><LayoutGrid className="w-4 h-4" /> Albüm Oluştur</>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={() => collageUrl && handleDownload(collageUrl, 'adgenius-kampanya-albumu.png')}
                      className="bg-green-600/20 hover:bg-green-600/40 text-green-300 px-4 py-2.5 rounded-xl text-xs font-medium transition-all flex items-center gap-2 border border-green-500/30 hover:border-green-500/50"
                    >
                      <Download className="w-4 h-4" /> Albümü İndir
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Collage Preview (if generated) */}
          {collageUrl && (
            <div className="mt-4 animate-fade-in-up">
              <div className="relative group rounded-xl overflow-hidden shadow-2xl border border-slate-700 max-w-4xl mx-auto">
                <img src={collageUrl} alt="Kampanya Albümü" className="w-full h-auto" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                  <button
                    onClick={() => collageUrl && handleDownload(collageUrl, 'adgenius-kampanya-albumu.png')}
                    className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-6 py-3 rounded-xl flex items-center gap-3 transition-all transform hover:scale-105 border border-white/20 font-medium"
                  >
                    <Download className="w-5 h-5" /> Albümü İndir (PNG)
                  </button>
                </div>
              </div>
              <div className="text-center mt-2">
                <button
                  onClick={() => setCollageUrl(null)}
                  className="text-slate-500 hover:text-slate-300 text-xs underline"
                >
                  Albümü Gizle / Yeniden Oluştur
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-6 pl-4 border-l-4 border-blue-500">Üretilen İçerikler</h2>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-8">
        {results.map((result) => (
          <div key={result.id} className="bg-slate-800 rounded-2xl overflow-hidden shadow-2xl border border-slate-700 flex flex-col relative">

            {/* Progress Bar Overlay (if actively generating) */}
            {result.status !== 'completed' && result.status !== 'failed' && result.progress !== undefined && (
              <div className="absolute top-0 left-0 right-0 z-20">
                <div className="h-1 bg-slate-700 w-full">
                  <div
                    className="h-full bg-blue-500 transition-all duration-300 ease-out"
                    style={{ width: `${result.progress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Header */}
            <div className="p-4 border-b border-slate-700 bg-slate-900/50 flex justify-between items-center relative z-10">
              <div className="flex flex-col">
                <span className="font-semibold text-blue-300 text-sm">{result.type}</span>
                {result.progress !== undefined && result.progress > 0 && result.progress < 100 && (
                  <span className="text-[10px] text-slate-400 font-mono">
                    {result.status === 'generating_image' ? t.buttons.downloadImage || 'Görsel' : 'Video'}: %{result.progress}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {/* Partial Success Warning */}
                {(result.status === 'completed' && result.error) && (
                  <div className="flex items-center gap-1 bg-yellow-500/10 text-yellow-400 px-2 py-1 rounded-full text-xs border border-yellow-500/20" title={result.error}>
                    <AlertCircle className="w-3 h-3" />
                    <span className="hidden sm:inline">Video Hatası</span>
                  </div>
                )}
                <span className={`text-xs px-2 py-1 rounded-full ${result.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                  result.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                    'bg-blue-500/20 text-blue-400 animate-pulse'
                  }`}>
                  {result.status === 'completed' ? 'Hazır' :
                    result.status === 'generating_image' ? 'Görsel Üretiliyor...' :
                      result.status === 'generating_video' ? 'Video Üretiliyor...' : 'Bekliyor'}
                </span>
              </div>
            </div>

            {/* Content Area */}
            <div className={`relative bg-black/40 group ${'aspect-video'}`}>
              {result.imageUrl ? (
                <div className="flex h-full w-full">
                  {/* Image Half */}
                  <div className={`${(result.videoUrl || result.status === 'generating_video' || result.error) ? 'w-1/2 border-r border-slate-700' : 'w-full'} relative h-full bg-slate-900`}>
                    <img
                      src={result.imageUrl}
                      alt="Oluşturulan Reklam"
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {/* Video Half */}
                  {(result.videoUrl || result.status === 'generating_video' || (result.status === 'completed' && result.error)) && result.status !== 'generating_image' && (
                    <div className="w-1/2 relative flex items-center justify-center bg-slate-900 h-full border-l border-slate-700">
                      {result.videoUrl ? (
                        <div className="relative w-full h-full group/video">
                          <video
                            src={result.videoUrl}
                            className="w-full h-full object-contain"
                            autoPlay
                            loop
                            muted
                            playsInline
                          />
                        </div>
                      ) : result.status === 'generating_video' ? (
                        <div className="text-center p-4 w-full">
                          <div className="relative w-12 h-12 mx-auto mb-2">
                            <svg className="animate-spin w-full h-full text-slate-700" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-slate-400">
                              {result.progress}%
                            </div>
                          </div>
                          <p className="text-xs text-blue-400 font-medium">Veo Video Oluşturuyor...</p>
                        </div>
                      ) : result.error ? (
                        <div className="text-center p-4 flex flex-col items-center">
                          <AlertCircle className="w-8 h-8 text-yellow-500/50 mb-2" />
                          <p className="text-xs text-yellow-500/70 text-center font-medium">Video Oluşturulamadı</p>
                          <p className="text-[10px] text-slate-500 mt-2 max-w-[150px] leading-tight opacity-70">
                            {result.error.length > 80 ? result.error.substring(0, 80) + '...' : result.error}
                          </p>
                        </div>
                      ) : (
                        <div className="text-center p-4">
                          <Video className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-500">
                  {result.status === 'failed' ? (
                    <>
                      <AlertCircle className="w-10 h-10 text-red-500 mb-2" />
                      <p className="text-red-400 text-sm">Hata: {result.error}</p>
                    </>
                  ) : (
                    <>
                      <div className="relative w-16 h-16 mb-3">
                        <div className="absolute inset-0 border-4 border-slate-700 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center font-bold text-slate-300">
                          {result.progress || 0}%
                        </div>
                      </div>
                      <p className="animate-pulse text-blue-400">Görsel Oluşturuluyor...</p>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="p-4 bg-slate-900 border-t border-slate-700 flex flex-col gap-3 flex-grow justify-end">
              <div className="flex gap-2">
                {result.imageUrl && (
                  <button
                    onClick={() => result.imageUrl && handleDownload(result.imageUrl, `reklam-gorsel-${result.id}${getExtension(result.imageUrl)}`)}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors border border-slate-700 hover:border-slate-500"
                  >
                    <Download className="w-3 h-3" /> Resmi İndir
                  </button>
                )}

                {result.videoUrl && (
                  <button
                    onClick={() => result.videoUrl && handleDownload(result.videoUrl, `reklam-video-${result.id}.mp4`)}
                    className="flex-1 bg-purple-900/20 hover:bg-purple-900/40 text-purple-300 text-xs py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors border border-purple-500/20 hover:border-purple-500/40"
                  >
                    <Video className="w-3 h-3" /> Videoyu İndir
                  </button>
                )}
              </div>

              {allFinished && (
                <button
                  onClick={() => onRegenerate(result.id)}
                  className="w-full bg-slate-800 hover:bg-blue-900/40 text-slate-400 hover:text-blue-300 text-[10px] py-1.5 rounded-md flex items-center justify-center gap-2 transition-all border border-slate-700 hover:border-blue-500/30 font-medium"
                >
                  <RefreshCw className="w-3 h-3" /> Bu Görseli Yeniden Üret
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResultsGallery;

