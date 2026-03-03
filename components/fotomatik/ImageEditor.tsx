/**
 * Fotomatik Image Editor Component
 */

import React, { useState, useEffect } from 'react';
import { FotomatikImageFile, FotomatikEditConfig } from '../../types/fotomatik';
import { processImage, getProcessedDimensions } from './imageUtils';
import { fotomatikSuggestEnhancements } from '../../services/fotomatikService';
import { useI18n } from '../../lib/i18n';

interface ImageEditorProps {
  image: FotomatikImageFile;
  onSave: (newImageBase64: string) => void;
  onCancel: () => void;
}

export const ImageEditor: React.FC<ImageEditorProps> = ({ image, onSave, onCancel }) => {
  const { language } = useI18n();
  const isEn = language === 'en';
  const [config, setConfig] = useState<FotomatikEditConfig>({
    rotation: 0,
    brightness: 100,
    contrast: 100,
    saturation: 100,
    sharpness: 0,
    highlights: 0,
    shadows: 0,
    cropRatio: 0,
    flipHorizontal: false,
    flipVertical: false,
    cropCenter: { x: 0.5, y: 0.5 },
    resize: undefined,
  });

  const [previewUrl, setPreviewUrl] = useState<string>(image.previewUrl);
  const [activeTab, setActiveTab] = useState<'crop' | 'adjust' | 'resize'>('crop');
  const [originalDims, setOriginalDims] = useState<{ width: number, height: number }>({ width: 0, height: 0 });
  const [aspectLock, setAspectLock] = useState(true);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [customRatioVals, setCustomRatioVals] = useState({ w: 4, h: 3 });
  const [isCustomMode, setIsCustomMode] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setOriginalDims({ width: img.width, height: img.height });
    };
    img.src = image.previewUrl;
  }, [image.previewUrl]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        const processed = await processImage(image.base64, config);
        setPreviewUrl(processed);
      } catch (e) {
        console.error("Error generating preview", e);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [config, image.base64]);

  const handleSave = async () => {
    const processed = await processImage(image.base64, config);
    const base64Data = processed.split(',')[1];
    onSave(base64Data);
  };

  const handleRotate = () => {
    setConfig(prev => ({
      ...prev,
      rotation: (prev.rotation + 90) % 360
    }));
  };

  const resetEdits = () => {
    setConfig({
      rotation: 0,
      brightness: 100,
      contrast: 100,
      saturation: 100,
      sharpness: 0,
      highlights: 0,
      shadows: 0,
      cropRatio: 0,
      flipHorizontal: false,
      flipVertical: false,
      cropCenter: { x: 0.5, y: 0.5 },
      resize: undefined
    });
    setIsCustomMode(false);
  };

  const handleCustomRatioChange = (key: 'w' | 'h', value: string) => {
    const num = parseFloat(value);
    const newVals = { ...customRatioVals, [key]: isNaN(num) ? 0 : num };
    setCustomRatioVals(newVals);

    if (newVals.w > 0 && newVals.h > 0) {
      setConfig(prev => ({ ...prev, cropRatio: newVals.w / newVals.h }));
    }
  };

  const handleCropPosition = (axis: 'x' | 'y', val: string) => {
    const num = parseInt(val) / 100;
    setConfig(prev => ({
      ...prev,
      cropCenter: {
        ...prev.cropCenter!,
        [axis]: num
      }
    }));
  };

  const naturalDims = getProcessedDimensions(originalDims.width, originalDims.height, config);
  const currentWidth = config.resize?.width || naturalDims.width;
  const currentHeight = config.resize?.height || naturalDims.height;

  const handleResizeChange = (dimension: 'width' | 'height', value: string) => {
    const numValue = parseInt(value);
    if (isNaN(numValue)) return;

    let newWidth = dimension === 'width' ? numValue : currentWidth;
    let newHeight = dimension === 'height' ? numValue : currentHeight;

    if (aspectLock) {
      const ratio = naturalDims.width / naturalDims.height;
      if (dimension === 'width') {
        newHeight = Math.round(newWidth / ratio);
      } else {
        newWidth = Math.round(newHeight * ratio);
      }
    }

    setConfig(prev => ({
      ...prev,
      resize: { width: newWidth, height: newHeight }
    }));
  };

  const handleAutoEnhance = async () => {
    setIsEnhancing(true);
    try {
      const suggestions = await fotomatikSuggestEnhancements(image.base64, image.mimeType);
      setConfig(prev => ({
        ...prev,
        brightness: suggestions.brightness,
        contrast: suggestions.contrast,
        saturation: suggestions.saturation,
        sharpness: suggestions.sharpness,
        highlights: suggestions.highlights,
        shadows: suggestions.shadows,
      }));
    } catch (error) {
      console.error("Enhancement failed", error);
    } finally {
      setIsEnhancing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
      <div className="bg-slate-900 w-full max-w-5xl h-[90vh] rounded-2xl border border-slate-700 flex flex-col shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <h3 className="text-lg font-semibold text-white">{isEn ? 'Edit Image' : 'Resmi Düzenle'}</h3>
          <div className="flex items-center gap-3">
            <button
              onClick={resetEdits}
              className="p-2 text-slate-400 hover:text-white transition-colors"
              title={isEn ? 'Reset' : 'Sıfırla'}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
            </button>
            <div className="h-6 w-px bg-slate-700 mx-1" />
            <button
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              {isEn ? 'Cancel' : 'İptal'}
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {isEn ? 'Apply' : 'Uygula'}
            </button>
          </div>
        </div>

        {/* Main Workspace */}
        <div className="flex-1 flex overflow-hidden">

          {/* Preview Area */}
          <div className="flex-1 bg-[#0f172a] relative flex items-center justify-center p-8 overflow-hidden">
            <div className="absolute inset-0 opacity-10 pointer-events-none"
              style={{ backgroundImage: 'radial-gradient(#475569 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
            </div>

            <img
              src={previewUrl}
              alt="Preview"
              className="max-w-full max-h-full object-contain shadow-2xl border border-slate-700/50"
            />

            <div className="absolute bottom-4 left-4 bg-black/70 text-white text-xs px-2 py-1 rounded font-mono backdrop-blur-sm">
              {currentWidth} x {currentHeight} px
            </div>
          </div>

          {/* Sidebar Controls */}
          <div className="w-96 bg-slate-800 border-l border-slate-700 flex flex-col">

            <div className="flex border-b border-slate-700">
              <button
                onClick={() => setActiveTab('crop')}
                className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === 'crop'
                    ? 'text-blue-400 border-b-2 border-blue-400 bg-slate-700/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/20'
                  }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V20M17 4V20M3 8H10M14 8H21M3 16H10M14 16H21" />
                </svg>
                <span className="text-xs">{isEn ? 'Crop' : 'Kırp'}</span>
              </button>
              <button
                onClick={() => setActiveTab('resize')}
                className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === 'resize'
                    ? 'text-blue-400 border-b-2 border-blue-400 bg-slate-700/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/20'
                  }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
                <span className="text-xs">{isEn ? 'Resize' : 'Boyut'}</span>
              </button>
              <button
                onClick={() => setActiveTab('adjust')}
                className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === 'adjust'
                    ? 'text-blue-400 border-b-2 border-blue-400 bg-slate-700/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/20'
                  }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
                <span className="text-xs">{isEn ? 'Adjust' : 'Ayarla'}</span>
              </button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">

              {activeTab === 'crop' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">

                  {/* Rotation & Flip */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                      {isEn ? 'Orientation' : 'Yönlendirme'}
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={handleRotate}
                        className="py-3 px-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl flex flex-col items-center justify-center gap-1 transition-colors text-xs"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        {isEn ? 'Rotate' : 'Döndür'}
                      </button>
                      <button
                        onClick={() => setConfig(prev => ({ ...prev, flipHorizontal: !prev.flipHorizontal }))}
                        className={`py-3 px-2 rounded-xl flex flex-col items-center justify-center gap-1 transition-colors text-xs ${config.flipHorizontal ? 'bg-blue-600 text-white' : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                          }`}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                        {isEn ? 'Horizontal' : 'Yatay'}
                      </button>
                      <button
                        onClick={() => setConfig(prev => ({ ...prev, flipVertical: !prev.flipVertical }))}
                        className={`py-3 px-2 rounded-xl flex flex-col items-center justify-center gap-1 transition-colors text-xs ${config.flipVertical ? 'bg-blue-600 text-white' : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                          }`}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                        </svg>
                        {isEn ? 'Vertical' : 'Dikey'}
                      </button>
                    </div>
                  </div>

                  {/* Aspect Ratio */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                      {isEn ? 'Aspect Ratio' : 'En Boy Oranı'}
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: isEn ? 'Original' : 'Orijinal', value: 0 },
                        { label: isEn ? 'Square (1:1)' : 'Kare (1:1)', value: 1 },
                        { label: isEn ? 'Vertical (3:4)' : 'Dikey (3:4)', value: 3 / 4 },
                        { label: isEn ? 'Horizontal (4:3)' : 'Yatay (4:3)', value: 4 / 3 },
                        { label: isEn ? 'Wide (16:9)' : 'Geniş (16:9)', value: 16 / 9 },
                      ].map((ratio) => (
                        <button
                          key={ratio.label}
                          onClick={() => {
                            setIsCustomMode(false);
                            setConfig(prev => ({ ...prev, cropRatio: ratio.value }));
                          }}
                          className={`py-2 px-3 text-sm rounded-lg border transition-all ${!isCustomMode && config.cropRatio === ratio.value
                              ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/20'
                              : 'bg-slate-700 border-slate-600 text-slate-300 hover:border-slate-500'
                            }`}
                        >
                          {ratio.label}
                        </button>
                      ))}
                      <button
                        onClick={() => {
                          setIsCustomMode(true);
                          if (customRatioVals.w > 0 && customRatioVals.h > 0) {
                            setConfig(prev => ({ ...prev, cropRatio: customRatioVals.w / customRatioVals.h }));
                          }
                        }}
                        className={`py-2 px-3 text-sm rounded-lg border transition-all ${isCustomMode
                            ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/20'
                            : 'bg-slate-700 border-slate-600 text-slate-300 hover:border-slate-500'
                          }`}
                      >
                        {isEn ? 'Custom' : 'Özel'}
                      </button>
                    </div>

                    {isCustomMode && (
                      <div className="mt-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={customRatioVals.w || ''}
                            onChange={(e) => handleCustomRatioChange('w', e.target.value)}
                            placeholder={isEn ? 'W' : 'G'}
                            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-slate-200 text-center focus:border-blue-500 focus:outline-none"
                          />
                          <span className="text-slate-500 font-bold">:</span>
                          <input
                            type="number"
                            value={customRatioVals.h || ''}
                            onChange={(e) => handleCustomRatioChange('h', e.target.value)}
                            placeholder={isEn ? 'H' : 'Y'}
                            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-slate-200 text-center focus:border-blue-500 focus:outline-none"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {config.cropRatio > 0 && (
                    <div className="animate-in fade-in slide-in-from-top-2">
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                        {isEn ? 'Crop Position' : 'Kırpma Konumu'}
                      </label>
                      <div className="space-y-4 bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
                        <div>
                          <div className="flex justify-between text-xs text-slate-400 mb-1">
                            <span>{isEn ? 'Horizontal' : 'Yatay'}</span>
                            <span>{Math.round((config.cropCenter?.x ?? 0.5) * 100)}%</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={(config.cropCenter?.x ?? 0.5) * 100}
                            onChange={(e) => handleCropPosition('x', e.target.value)}
                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                          />
                        </div>
                        <div>
                          <div className="flex justify-between text-xs text-slate-400 mb-1">
                            <span>{isEn ? 'Vertical' : 'Dikey'}</span>
                            <span>{Math.round((config.cropCenter?.y ?? 0.5) * 100)}%</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={(config.cropCenter?.y ?? 0.5) * 100}
                            onChange={(e) => handleCropPosition('y', e.target.value)}
                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              )}

              {activeTab === 'resize' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        {isEn ? 'Pixel Dimensions' : 'Piksel Boyutları'}
                      </label>
                      <button
                        onClick={() => setAspectLock(!aspectLock)}
                        className={`p-1.5 rounded-lg transition-colors ${aspectLock ? 'bg-blue-600/20 text-blue-400' : 'text-slate-500 hover:text-slate-300'}`}
                        title={aspectLock ? (isEn ? 'Lock Ratio' : 'Oranı Kilitle') : (isEn ? 'Unlock' : 'Kilidi Aç')}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          {aspectLock ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                          )}
                        </svg>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-slate-500 mb-1.5">{isEn ? 'Width' : 'Genişlik'}</label>
                        <input
                          type="number"
                          value={currentWidth}
                          onChange={(e) => handleResizeChange('width', e.target.value)}
                          className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-slate-200 focus:border-blue-500 focus:outline-none font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-500 mb-1.5">{isEn ? 'Height' : 'Yükseklik'}</label>
                        <input
                          type="number"
                          value={currentHeight}
                          onChange={(e) => handleResizeChange('height', e.target.value)}
                          className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-slate-200 focus:border-blue-500 focus:outline-none font-mono"
                        />
                      </div>
                    </div>

                    {config.resize && (
                      <button
                        onClick={() => setConfig(prev => ({ ...prev, resize: undefined }))}
                        className="mt-4 text-xs text-red-400 hover:text-red-300 underline"
                      >
                        {isEn ? 'Reset' : 'Sıfırla'} ({naturalDims.width} x {naturalDims.height})
                      </button>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'adjust' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">

                  {/* Auto Enhance */}
                  <button
                    onClick={handleAutoEnhance}
                    disabled={isEnhancing}
                    className="w-full py-3 px-4 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed text-white rounded-xl shadow-lg shadow-emerald-900/20 font-medium text-sm flex items-center justify-center gap-2 transition-all"
                  >
                    {isEnhancing ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                    )}
                    {isEnhancing ? (isEn ? 'Analyzing...' : 'Analiz Ediliyor...') : (isEn ? 'Auto Enhance (AI)' : 'Otomatik İyileştir (AI)')}
                  </button>

                  <div className="h-px bg-slate-700 w-full my-4" />

                  {/* Adjustment Sliders */}
                  <div className="space-y-6">

                    {/* Brightness */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-semibold text-slate-400 flex items-center gap-2">
                          {isEn ? 'Brightness' : 'Parlaklık'}
                        </label>
                        <span className="text-xs text-slate-500 font-mono">{config.brightness}%</span>
                      </div>
                      <input
                        type="range"
                        min="50"
                        max="150"
                        value={config.brightness}
                        onChange={(e) => setConfig(prev => ({ ...prev, brightness: parseInt(e.target.value) }))}
                        className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                      />
                    </div>

                    {/* Contrast */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-semibold text-slate-400 flex items-center gap-2">
                          {isEn ? 'Contrast' : 'Kontrast'}
                        </label>
                        <span className="text-xs text-slate-500 font-mono">{config.contrast}%</span>
                      </div>
                      <input
                        type="range"
                        min="50"
                        max="150"
                        value={config.contrast}
                        onChange={(e) => setConfig(prev => ({ ...prev, contrast: parseInt(e.target.value) }))}
                        className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                      />
                    </div>

                    {/* Saturation */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-semibold text-slate-400 flex items-center gap-2">
                          {isEn ? 'Saturation' : 'Doygunluk'}
                        </label>
                        <span className="text-xs text-slate-500 font-mono">{config.saturation}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="200"
                        value={config.saturation}
                        onChange={(e) => setConfig(prev => ({ ...prev, saturation: parseInt(e.target.value) }))}
                        className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                      />
                    </div>

                    {/* Sharpness */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-semibold text-slate-400 flex items-center gap-2">
                          {isEn ? 'Sharpness' : 'Keskinlik'}
                        </label>
                        <span className="text-xs text-slate-500 font-mono">{config.sharpness}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={config.sharpness}
                        onChange={(e) => setConfig(prev => ({ ...prev, sharpness: parseInt(e.target.value) }))}
                        className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                      />
                    </div>

                    {/* Highlights */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-semibold text-slate-400 flex items-center gap-2">
                          {isEn ? 'Highlights' : 'Vurgular'}
                        </label>
                        <span className="text-xs text-slate-500 font-mono">{config.highlights}</span>
                      </div>
                      <input
                        type="range"
                        min="-100"
                        max="100"
                        value={config.highlights}
                        onChange={(e) => setConfig(prev => ({ ...prev, highlights: parseInt(e.target.value) }))}
                        className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-yellow-400"
                      />
                    </div>

                    {/* Shadows */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-semibold text-slate-400 flex items-center gap-2">
                          {isEn ? 'Shadows' : 'Gölgeler'}
                        </label>
                        <span className="text-xs text-slate-500 font-mono">{config.shadows}</span>
                      </div>
                      <input
                        type="range"
                        min="-100"
                        max="100"
                        value={config.shadows}
                        onChange={(e) => setConfig(prev => ({ ...prev, shadows: parseInt(e.target.value) }))}
                        className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-400"
                      />
                    </div>

                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

