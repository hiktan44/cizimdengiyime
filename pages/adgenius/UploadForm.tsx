import React, { useState, DragEvent, useRef, useEffect } from 'react';
import { FormData, AdStyle, VideoModel, AspectRatio } from '../AdgeniusPage';
import { Upload, ShoppingBag, Type, Palette, X, Check, Image as ImageIcon, Video, Layers, Camera, Clapperboard, Zap, Sparkles, MessageSquarePlus, ImagePlus, Sliders, PaintBucket, Plus, ChevronDown, Monitor, Smartphone, Square, Tv } from 'lucide-react';

interface Props {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  onSubmit: () => void;
  isSubmitting: boolean;
  t: any;
}

const UploadForm: React.FC<Props> = ({ formData, setFormData, onSubmit, isSubmitting, t }) => {
  const [mainDragActive, setMainDragActive] = useState(false);
  const [optDragActive, setOptDragActive] = useState(false);
  const [patternDragActive, setPatternDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  // Color Picker State
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [pickerColor, setPickerColor] = useState("#3b82f6");
  const pickerRef = useRef<HTMLDivElement>(null);
  const mainInputRef = useRef<HTMLInputElement>(null);
  const optInputRef = useRef<HTMLInputElement>(null);
  const patternInputRef = useRef<HTMLInputElement>(null);

  // Close picker when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setShowColorPicker(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Generic File Handler
  const handleFile = (file: File, type: 'main' | 'optional' | 'pattern') => {
    if (file && file.type.startsWith('image/')) {
      if (type === 'main') {
        // Main Image with progress simulation
        setUploadProgress(0);
        const duration = 1000;
        const intervalTime = 50;
        const steps = duration / intervalTime;
        let currentStep = 0;

        const timer = setInterval(() => {
          currentStep++;
          const progress = Math.min((currentStep / steps) * 100, 100);
          setUploadProgress(progress);

          if (currentStep >= steps) {
            clearInterval(timer);
            setFormData(prev => ({ ...prev, productImage: file }));
            setTimeout(() => setUploadProgress(null), 200);
          }
        }, intervalTime);
      } else if (type === 'optional') {
        setFormData(prev => ({ ...prev, optionalImage: file }));
      } else if (type === 'pattern') {
        setFormData(prev => ({ ...prev, ecommercePatternImage: file }));
      }
    }
  };

  // Drag Handlers
  const handleDrag = (e: DragEvent<HTMLDivElement>, type: 'main' | 'optional' | 'pattern', status: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    if (type === 'main') setMainDragActive(status);
    else if (type === 'optional') setOptDragActive(status);
    else if (type === 'pattern') setPatternDragActive(status);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>, type: 'main' | 'optional' | 'pattern') => {
    e.preventDefault();
    e.stopPropagation();
    if (type === 'main') setMainDragActive(false);
    else if (type === 'optional') setOptDragActive(false);
    else if (type === 'pattern') setPatternDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0], type);
    }
  };

  const removeFile = (e: React.MouseEvent, type: 'main' | 'optional' | 'pattern') => {
    e.stopPropagation();
    if (type === 'main') {
      setFormData(prev => ({ ...prev, productImage: null }));
      if (mainInputRef.current) mainInputRef.current.value = "";
    } else if (type === 'optional') {
      setFormData(prev => ({ ...prev, optionalImage: null }));
      if (optInputRef.current) optInputRef.current.value = "";
    } else if (type === 'pattern') {
      setFormData(prev => ({ ...prev, ecommercePatternImage: null }));
      if (patternInputRef.current) patternInputRef.current.value = "";
    }
  };

  const addColorToInput = (colorToAdd: string) => {
    setFormData(prev => {
      const current = prev.ecommerceColorVariations;
      // If empty, just set it. If not empty, append with comma.
      const newValue = current.trim().length === 0
        ? colorToAdd
        : `${current}, ${colorToAdd}`;
      return { ...prev, ecommerceColorVariations: newValue };
    });
    // Optional: Close picker after selection if desired, or keep open for multi-select.
    // setShowColorPicker(false); 
  };

  const fashionPresets = [
    { color: '#000000', name: t.upload?.colorBlack || 'Black' },
    { color: '#FFFFFF', name: t.upload?.colorWhite || 'White' },
    { color: '#800020', name: t.upload?.colorBurgundy || 'Burgundy' },
    { color: '#000080', name: t.upload?.colorNavy || 'Navy' },
    { color: '#F5F5DC', name: t.upload?.colorBeige || 'Beige' },
    { color: '#50C878', name: t.upload?.colorEmerald || 'Emerald' },
    { color: '#FFD700', name: t.upload?.colorGold || 'Gold' },
    { color: '#C0C0C0', name: t.upload?.colorSilver || 'Silver' },
    { color: '#FF0000', name: t.upload?.colorRed || 'Red' },
    { color: '#FFC0CB', name: t.upload?.colorPink || 'Pink' },
  ];

  const adStyles: AdStyle[] = [
    t.upload?.styleLuxury || 'Luxury & Premium',
    t.upload?.styleMinimalist || 'Minimalist Studio',
    t.upload?.styleLuxuryStore || 'Luxury Store Atmosphere',
    t.upload?.styleNaturalLight || 'Natural Daylight',
    t.upload?.styleVintage || 'Vintage & Retro',
    t.upload?.styleNeon || 'Neon & Cyberpunk',
    t.upload?.styleCinematic || 'Cinematic & Dramatic',
    t.upload?.stylePopArt || 'Colorful & Pop Art',
    t.upload?.styleArtDeco || 'Art Deco',
    t.upload?.styleGothic || 'Gothic',
    t.upload?.styleSciFi || 'Sci-Fi',
    t.upload?.styleRetroFuturism || 'Retro Futurism',
    t.upload?.styleAbstract || 'Abstract',
    t.upload?.styleSteampunk || 'Steampunk',
    t.upload?.styleVaporwave || 'Vaporwave',
    t.upload?.styleBauhaus || 'Bauhaus',
    t.upload?.styleRustic || 'Rustic & Bohemian'
  ];

  const videoOptions: { id: VideoModel; name: string; description: string; icon: React.FC<any> }[] = [
    { id: 'veo-3.1-generate-preview', name: t.upload?.videoHighQuality || 'High Quality', description: t.upload?.videoHighDesc || 'Cinematic quality, best details (Slow)', icon: Sparkles },
    { id: 'veo-3.1-fast-generate-preview', name: t.upload?.videoFast || 'Fast', description: t.upload?.videoFastDesc || 'Fast generation, standard quality', icon: Zap },
  ];

  const aspectRatios: { id: AspectRatio, label: string, icon: any }[] = [
    { id: '1:1', label: t.upload?.ratioSquare || 'Square (1:1)', icon: Square },
    { id: '9:16', label: t.upload?.ratioStory || 'Story (9:16)', icon: Smartphone },
    { id: '16:9', label: t.upload?.ratioLandscape169 || 'Landscape (16:9)', icon: Monitor },
    { id: '3:4', label: t.upload?.ratioPortrait || 'Portrait (3:4)', icon: Smartphone },
    { id: '4:3', label: t.upload?.ratioLandscape43 || 'Landscape (4:3)', icon: Tv },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto bg-slate-800/50 backdrop-blur-lg rounded-2xl p-8 border border-slate-700 shadow-2xl">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          {t.labels.productName}
        </h2>
        <p className="text-slate-400 mt-2">
          {t.subtitle}
        </p>
      </div>

      <div className="space-y-6">
        {/* Mode Selection */}
        <div className="bg-slate-900/50 p-1.5 rounded-xl flex gap-1 border border-slate-700">
          <button
            onClick={() => setFormData(prev => ({ ...prev, mode: 'campaign' }))}
            className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${formData.mode === 'campaign'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
          >
            <Layers className="w-4 h-4" />
            {t.upload?.modeCampaign || 'Ad Campaign'}
            <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded ml-1">{t.upload?.modeCampaignBadge || '4-10 Styles'}</span>
          </button>
          <button
            onClick={() => setFormData(prev => ({ ...prev, mode: 'ecommerce' }))}
            className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${formData.mode === 'ecommerce'
              ? 'bg-purple-600 text-white shadow-lg'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
          >
            <Camera className="w-4 h-4" />
            {t.upload?.modeEcommerce || 'E-Commerce Package'}
            <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded ml-1">{t.upload?.modeEcommerceBadge || '6-12 Poses'}</span>
          </button>
        </div>

        {/* Configuration Sliders based on Mode */}
        <div className="bg-slate-900/30 rounded-xl p-4 border border-slate-700/50 transition-all">
          {formData.mode === 'campaign' ? (
            <div>
              <label className="flex justify-between text-sm font-medium text-slate-300 mb-2">
                <span className="flex items-center gap-2"><Sliders className="w-4 h-4" /> {t.labels.campaignCount}</span>
                <span className="text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded">{formData.campaignStyleCount} {t.upload?.countUnit || 'Items'}</span>
              </label>
              <input
                type="range"
                min="4"
                max="10"
                step="1"
                value={formData.campaignStyleCount}
                onChange={(e) => setFormData(prev => ({ ...prev, campaignStyleCount: parseInt(e.target.value) }))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>{t.upload?.defaultLabel || '4 (Default)'}</span>
                <span>{t.upload?.maxLabel || '10 (Max)'}</span>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Photo Count Slider */}
              <div>
                <label className="flex justify-between text-sm font-medium text-slate-300 mb-2">
                  <span className="flex items-center gap-2"><Camera className="w-4 h-4" /> {t.labels.photoCount}</span>
                  <span className="text-purple-400 bg-purple-400/10 px-2 py-0.5 rounded">{formData.ecommercePhotoCount} {t.upload?.countUnit || 'Items'}</span>
                </label>
                <input
                  type="range"
                  min="6"
                  max="12"
                  step="1"
                  value={formData.ecommercePhotoCount}
                  onChange={(e) => setFormData(prev => ({ ...prev, ecommercePhotoCount: parseInt(e.target.value) }))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>{t.upload?.minLabel || '6 (Min)'}</span>
                  <span>{t.upload?.maxLabel12 || '12 (Max)'}</span>
                </div>
              </div>
            </div>
          )}

          {/* SHARED CONFIGURATION SECTION (Colors & Pattern) */}
          <div className="mt-4 pt-4 border-t border-slate-700/50 grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* ADVANCED COLOR VARIATIONS PICKER */}
            <div ref={pickerRef} className="relative">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <span className="flex items-center gap-2"><PaintBucket className="w-4 h-4" /> {t.labels.colors}</span>
              </label>

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={formData.ecommerceColorVariations}
                    onChange={(e) => setFormData(prev => ({ ...prev, ecommerceColorVariations: e.target.value }))}
                    placeholder={t.upload?.placeholderColor || 'E.g: Red, #0000FF, Navy'}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg pl-3 pr-10 py-2 text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none text-sm h-10"
                  />
                  {formData.ecommerceColorVariations && (
                    <button
                      onClick={() => setFormData(prev => ({ ...prev, ecommerceColorVariations: '' }))}
                      className="absolute right-2 top-2.5 text-slate-500 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  className={`
                      border rounded-lg px-3 flex items-center gap-2 transition-all h-10 min-w-[100px] justify-between
                      ${showColorPicker
                      ? 'bg-purple-600 border-purple-500 text-white'
                      : 'bg-slate-700 hover:bg-slate-600 border-slate-600 text-slate-200'}
                    `}
                >
                  <span className="flex items-center gap-2 text-sm">
                    <Palette className="w-4 h-4" />
                    {t.upload?.colorButton || 'Color'}
                  </span>
                  <ChevronDown className={`w-3 h-3 transition-transform ${showColorPicker ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {/* Color Picker Popover */}
              {showColorPicker && (
                <div className="absolute z-50 top-full right-0 mt-2 w-72 bg-slate-800 rounded-xl shadow-2xl border border-slate-600 p-4 animate-fade-in-up backdrop-blur-xl">
                  {/* Header */}
                  <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-700">
                    <span className="text-xs font-bold text-slate-400 uppercase">{t.labels.colors}</span>
                    <button onClick={() => setShowColorPicker(false)} className="text-slate-500 hover:text-white">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Presets Grid */}
                  <div className="mb-4">
                    <span className="text-[10px] text-slate-500 mb-2 block">{t.upload?.popularFashionColors || 'POPULAR FASHION COLORS'}</span>
                    <div className="grid grid-cols-5 gap-2">
                      {fashionPresets.map((preset) => (
                        <button
                          key={preset.color}
                          onClick={() => addColorToInput(preset.color)}
                          title={preset.name}
                          className="group relative w-full aspect-square rounded-full border border-slate-600 hover:border-white transition-all hover:scale-110 overflow-hidden"
                          style={{ backgroundColor: preset.color }}
                        >
                          {/* Tooltip on hover is handled by title, simpler */}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Picker */}
                  <div>
                    <span className="text-[10px] text-slate-500 mb-2 block">{t.upload?.customSelection || 'CUSTOM SELECTION'}</span>
                    <div className="flex gap-2">
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-slate-500 flex-shrink-0">
                        <input
                          type="color"
                          value={pickerColor}
                          onChange={(e) => setPickerColor(e.target.value)}
                          className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer p-0 border-0"
                        />
                      </div>
                      <div className="flex-1 flex gap-2">
                        <input
                          type="text"
                          value={pickerColor}
                          readOnly
                          className="w-full bg-slate-900 border border-slate-700 rounded text-xs px-2 text-slate-300 font-mono uppercase"
                        />
                        <button
                          onClick={() => addColorToInput(pickerColor)}
                          className="bg-blue-600 hover:bg-blue-500 text-white rounded px-3 flex items-center justify-center transition-colors"
                          title={t.upload?.addToList || 'Add to List'}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Pattern/Texture Upload */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <span className="flex items-center gap-2"><ImagePlus className="w-4 h-4" /> {t.labels.pattern}</span>
              </label>
              <div
                onDragEnter={(e) => handleDrag(e, 'pattern', true)}
                onDragLeave={(e) => handleDrag(e, 'pattern', false)}
                onDragOver={(e) => handleDrag(e, 'pattern', true)}
                onDrop={(e) => handleDrop(e, 'pattern')}
                onClick={() => !formData.ecommercePatternImage && patternInputRef.current?.click()}
                className={`
                    relative h-10 rounded-lg border border-dashed flex items-center justify-center text-center transition-all cursor-pointer bg-slate-900/50
                    ${formData.ecommercePatternImage ? 'border-purple-500/50 bg-purple-500/10' : 'border-slate-700 hover:border-slate-500 hover:bg-slate-800'}
                    ${patternDragActive ? 'border-purple-500 bg-purple-500/10' : ''}
                  `}
              >
                <input
                  ref={patternInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp"
                  onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0], 'pattern')}
                  className="hidden"
                />

                {formData.ecommercePatternImage ? (
                  <div className="flex items-center gap-2 px-2 w-full justify-between">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <img
                        src={URL.createObjectURL(formData.ecommercePatternImage)}
                        alt="Pattern"
                        className="w-6 h-6 object-cover rounded bg-slate-900 flex-shrink-0"
                      />
                      <span className="text-xs text-slate-200 truncate">{formData.ecommercePatternImage.name}</span>
                    </div>
                    <button
                      onClick={(e) => removeFile(e, 'pattern')}
                      className="p-1 hover:bg-red-500 rounded transition-colors text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <span className="text-xs text-slate-500">{t.upload?.uploadPattern || 'Upload pattern'}</span>
                )}
              </div>
            </div>
          </div>
          <p className="text-[10px] text-slate-500 mt-1 pl-1">
            {t.upload?.colorPatternHint || 'Colors are applied to generated images in order. If you upload a pattern, the product will be generated with that pattern.'}
          </p>
        </div>

        {/* ASPECT RATIO SELECTION */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            <span className="flex items-center gap-2"><Monitor className="w-4 h-4" /> {t.labels.aspectRatio}</span>
          </label>
          <div className="grid grid-cols-5 gap-2">
            {aspectRatios.map((ratio) => (
              <button
                key={ratio.id}
                onClick={() => setFormData(prev => ({ ...prev, aspectRatio: ratio.id }))}
                className={`
                     flex flex-col items-center justify-center p-2 rounded-lg border transition-all gap-1
                     ${formData.aspectRatio === ratio.id
                    ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                    : 'bg-slate-900/50 border-slate-700 text-slate-500 hover:border-slate-500 hover:bg-slate-800'
                  }`}
              >
                <ratio.icon className="w-5 h-5" />
                <span className="text-[10px] font-medium whitespace-nowrap">{ratio.id}</span>
              </button>
            ))}
          </div>
        </div>

        {/* MAIN PRODUCT UPLOAD */}
        <div className="relative group">
          <label className="block text-sm font-medium text-slate-300 mb-2">{t.labels.productImage}</label>

          <div
            onDragEnter={(e) => handleDrag(e, 'main', true)}
            onDragLeave={(e) => handleDrag(e, 'main', false)}
            onDragOver={(e) => handleDrag(e, 'main', true)}
            onDrop={(e) => handleDrop(e, 'main')}
            onClick={!formData.productImage ? () => mainInputRef.current?.click() : undefined}
            className={`
              relative overflow-hidden
                border-2 border-dashed rounded-xl h-64 flex flex-col items-center justify-center text-center transition-all duration-300
                ${!formData.productImage && !uploadProgress ? 'cursor-pointer' : ''}
                ${mainDragActive ? 'border-blue-500 bg-blue-500/10 scale-[1.01] shadow-xl shadow-blue-500/10' : 'border-slate-600 hover:border-blue-500/50 hover:bg-slate-700/30'}
                ${formData.productImage ? 'border-green-500/50 bg-green-500/5' : ''}
            `}
          >
            <input
              ref={mainInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0], 'main')}
              className="hidden"
            />

            <div className="w-full px-8 relative z-10">
              {uploadProgress !== null ? (
                <div className="w-full max-w-xs mx-auto">
                  <div className="flex items-center justify-between mb-2 text-sm text-blue-300 font-medium">
                    <span>{t.messages.processing}</span>
                    <span>{Math.round(uploadProgress)}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 transition-all duration-75 ease-out"
                      style={{ width: `${uploadProgress} % ` }}
                    ></div>
                  </div>
                </div>
              ) : formData.productImage ? (
                <div className="w-full relative animate-fade-in">
                  <div className="relative inline-block group/preview">
                    <img
                      src={URL.createObjectURL(formData.productImage)}
                      alt={t.upload?.preview || 'Preview'}
                      className="h-40 object-contain rounded-lg shadow-xl mb-3 bg-slate-900/50 mx-auto"
                    />
                    <button
                      onClick={(e) => removeFile(e, 'main')}
                      className="absolute -top-3 -right-3 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg transition-transform hover:scale-110"
                      title={t.upload?.removeImage || 'Remove Image'}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-green-400 font-medium bg-green-500/10 py-1.5 px-4 rounded-full mx-auto w-fit border border-green-500/20">
                    <Check className="w-4 h-4" />
                    <span className="truncate max-w-[200px]">{formData.productImage.name}</span>
                  </div>
                </div>
              ) : (
                <>
                  <div className={`
                    w - 16 h - 16 rounded - full flex items - center justify - center mb - 4 mx - auto transition - transform duration - 300
                    ${mainDragActive ? 'bg-blue-500 scale-110' : 'bg-slate-700 group-hover:scale-110'}
              `}>
                    <Upload className="w-8 h-8 text-blue-400" />
                  </div>
                  <p className="text-slate-200 text-lg font-medium mb-1">
                    {mainDragActive ? t.messages.uploadProductImage : (t.upload?.dragOrSelect || 'Drag & drop photo or click to browse')}
                  </p>
                  <p className="text-slate-500 text-sm">{t.upload?.formatHint || 'PNG, JPG, WEBP (Max 10MB)'}</p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Product Details Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              <span className="flex items-center gap-2"><ShoppingBag className="w-4 h-4" /> {t.labels.productName}</span>
            </label>
            <input
              type="text"
              value={formData.productName}
              onChange={(e) => setFormData(prev => ({ ...prev, productName: e.target.value }))}
              placeholder={t.upload?.placeholderProductName || 'E.g: Silk Satin Dress'}
              className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              <span className="flex items-center gap-2"><Type className="w-4 h-4" /> {t.labels.brand}</span>
            </label>
            <div className="space-y-2">
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                placeholder={t.upload?.placeholderBrand || 'E.g: Vakko, Zara'}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 cursor-pointer group select-none">
                  <input
                    type="checkbox"
                    checked={formData.renderTextOnImage}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      renderTextOnImage: e.target.checked,
                      // If enabling and overlay text is empty, pre-fill with brand if available
                      imageOverlayText: e.target.checked && !prev.imageOverlayText ? prev.brand : prev.imageOverlayText
                    }))}
                    className="w-4 h-4 rounded border-slate-600 bg-slate-900/50 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-900"
                  />
                  <span className={`text - xs ${formData.renderTextOnImage ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-400'} transition - colors`}>
                    {t.upload?.addBrandOverlay || 'Add text/brand overlay on image'}
                  </span>
                </label>

                {/* Custom Text Input - conditionally rendered */}
                <div className={`transition - all duration - 300 overflow - hidden ${formData.renderTextOnImage ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <input
                    type="text"
                    value={formData.imageOverlayText}
                    onChange={(e) => setFormData(prev => ({ ...prev, imageOverlayText: e.target.value }))}
                    placeholder={t.upload?.placeholderOverlayText || 'Text to display on image (E.g: Brand Name)'}
                    className="w-full bg-slate-900/30 border border-slate-700 rounded-md px-3 py-2 text-xs text-slate-200 focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* OPTIONAL IMAGE UPLOAD & CUSTOM PROMPT GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Optional Image */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              <span className="flex items-center gap-2"><ImagePlus className="w-4 h-4" /> {t.labels.optionalImage}</span>
            </label>
            <div
              onDragEnter={(e) => handleDrag(e, 'optional', true)}
              onDragLeave={(e) => handleDrag(e, 'optional', false)}
              onDragOver={(e) => handleDrag(e, 'optional', true)}
              onDrop={(e) => handleDrop(e, 'optional')}
              onClick={() => !formData.optionalImage && optInputRef.current?.click()}
              className={`
                relative h - [120px] rounded - lg border - 2 border - dashed flex items - center justify - center text - center transition - all cursor - pointer
                ${formData.optionalImage ? 'border-purple-500/50 bg-purple-500/5' : 'border-slate-700 hover:border-slate-500 hover:bg-slate-800'}
                ${optDragActive ? 'border-purple-500 bg-purple-500/10' : ''}
              `}
            >
              <input
                ref={optInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0], 'optional')}
                className="hidden"
              />

              {formData.optionalImage ? (
                <div className="flex items-center gap-3 px-4 w-full">
                  <img
                    src={URL.createObjectURL(formData.optionalImage)}
                    alt="Ref"
                    className="w-16 h-16 object-cover rounded bg-slate-900"
                  />
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-sm text-slate-200 truncate">{formData.optionalImage.name}</p>
                    <p className="text-xs text-slate-500">{t.upload?.imageAdded || 'Image added'}</p>
                  </div>
                  <button
                    onClick={(e) => removeFile(e, 'optional')}
                    className="p-1.5 bg-slate-700 hover:bg-red-500 rounded-md transition-colors text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center text-slate-500">
                  <ImagePlus className="w-6 h-6 mb-1 opacity-50" />
                  <span className="text-xs">{t.upload?.uploadBackView || 'Upload back view or accessory image'}</span>
                </div>
              )}
            </div>
          </div>

          {/* Custom Prompt */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              <span className="flex items-center gap-2"><MessageSquarePlus className="w-4 h-4" /> {t.labels.customPrompt}</span>
            </label>
            <div className="relative">
              <textarea
                value={formData.customPrompt}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, customPrompt: e.target.value }));
                }}
                placeholder={t.upload?.placeholderCustomPrompt || 'E.g: "Model slightly looking right", "Soft city lights in background" or "Place the accessory naturally in model\'s hand".'}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-y min-h-[120px] text-sm"
              />
              <div className="absolute bottom-2 right-2 text-slate-600 pointer-events-none">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 13v6m0 0h-6m6 0L13 13" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Video Toggle */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            <span className="flex items-center gap-2"><Clapperboard className="w-4 h-4" /> {t.labels.outputPreference}</span>
          </label>
          <div className="bg-slate-900/50 p-1.5 rounded-lg flex gap-1 border border-slate-700">
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, includeVideo: false }))}
              className={`flex-1 py-2 px-3 rounded-md text-xs font-medium transition-all flex items-center justify-center gap-2 ${!formData.includeVideo
                ? 'bg-slate-700 text-white shadow-lg'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
            >
              <ImageIcon className="w-3 h-3" />
              {t.upload?.photoOnly || 'Photo Only'}
            </button>
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, includeVideo: true }))}
              className={`flex-1 py-2 px-3 rounded-md text-xs font-medium transition-all flex items-center justify-center gap-2 ${formData.includeVideo
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
            >
              <Video className="w-3 h-3" />
              {t.upload?.photoAndVideo || 'Photo + Video'}
            </button>
          </div>
        </div>

        {/* Video Quality */}
        <div className={`transition-all duration-300 ${!formData.includeVideo ? 'opacity-40 pointer-events-none grayscale' : 'opacity-100'}`}>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            <span className="flex items-center gap-2"><Video className="w-4 h-4" /> {t.upload?.videoQuality || 'Video Quality'}</span>
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {videoOptions.map((option) => (
              <div
                key={option.id}
                onClick={() => setFormData(prev => ({ ...prev, videoModel: option.id }))}
                className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${formData.videoModel === option.id
                  ? 'bg-purple-600/20 border-purple-500'
                  : 'bg-slate-900/30 border-slate-700 hover:border-slate-500'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${formData.videoModel === option.id ? 'bg-purple-500/20 text-purple-400' : 'bg-slate-800 text-slate-400'}`}>
                    <option.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className={`font-medium text-sm ${formData.videoModel === option.id ? 'text-purple-300' : 'text-slate-200'}`}>{option.name}</div>
                    <div className="text-xs text-slate-500">{option.description}</div>
                  </div>
                </div>
                {formData.videoModel === option.id && <Check className="w-4 h-4 text-purple-400" />}
              </div>
            ))}
          </div>
        </div>

        {/* Style Selection */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            <span className="flex items-center gap-2"><Palette className="w-4 h-4" />
              {formData.mode === 'ecommerce' ? t.labels.style : (t.upload?.adStyle || 'Ad Style')}
            </span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {adStyles.map((style) => (
              <button
                key={style}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, adStyle: style }))}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all text-left truncate ${formData.adStyle === style
                  ? formData.mode === 'ecommerce' ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30' : 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                  : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                  }`}
                title={style}
              >
                {style}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={onSubmit}
          disabled={!formData.productImage || !formData.productName || isSubmitting}
          className={`w-full py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] ${!formData.productImage || !formData.productName || isSubmitting
            ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
            : formData.mode === 'ecommerce'
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-xl shadow-purple-600/20'
              : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-xl shadow-blue-600/20'
            }`}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
              {t.messages.processing}
            </span>
          ) : (
            formData.mode === 'ecommerce' ? t.buttons.start : (t.gallery?.startCampaign || 'Start Campaign')
          )}
        </button>
      </div>
    </div >
  );
};

export default UploadForm;

