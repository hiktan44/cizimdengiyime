/**
 * Pixshop Adjustment Panel Component - Gelişmiş Versiyon
 */

import React, { useState, useMemo } from 'react';

interface AdjustmentPanelProps {
  onApplyAdjustment: (prompt: string) => void;
  isLoading: boolean;
}

interface SliderState {
  brightness: number;
  contrast: number;
  saturation: number;
  exposure: number;
  vibrance: number;
  highlights: number;
  shadows: number;
}

const AdjustmentPanel: React.FC<AdjustmentPanelProps> = ({ onApplyAdjustment, isLoading }) => {
  const [selectedPresetPrompt, setSelectedPresetPrompt] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const [sliders, setSliders] = useState<SliderState>({
    brightness: 0,
    contrast: 0,
    saturation: 0,
    exposure: 0,
    vibrance: 0,
    highlights: 0,
    shadows: 0,
  });

  const presets = [
    { name: 'Arka Planı Bulanıklaştır', prompt: 'Apply a realistic depth-of-field effect, making the background blurry while keeping the main subject in sharp focus.' },
    { name: 'Detayları Keskinleştir', prompt: 'Slightly enhance the sharpness and details of the image without making it look unnatural.' },
    { name: 'Daha Sıcak Tonlar', prompt: 'Adjust the color temperature to give the image warmer, golden-hour style lighting.' },
    { name: 'Stüdyo Işığı', prompt: 'Add dramatic, professional studio lighting to the main subject.' },
  ];

  const handleSliderChange = (name: keyof SliderState, value: number) => {
    setSliders(prev => ({ ...prev, [name]: value }));
    setSelectedPresetPrompt(null);
  };

  const handleResetSliders = () => {
    setSliders({ 
      brightness: 0, 
      contrast: 0, 
      saturation: 0, 
      exposure: 0,
      vibrance: 0,
      highlights: 0,
      shadows: 0
    });
  };

  const manualPromptPart = useMemo(() => {
    const parts: string[] = [];
    if (sliders.brightness !== 0) parts.push(`brightness ${sliders.brightness > 0 ? 'increased' : 'decreased'} by ${Math.abs(sliders.brightness)}%`);
    if (sliders.contrast !== 0) parts.push(`contrast ${sliders.contrast > 0 ? 'boosted' : 'reduced'} by ${Math.abs(sliders.contrast)}%`);
    if (sliders.saturation !== 0) parts.push(`saturation ${sliders.saturation > 0 ? 'enhanced' : 'muted'} by ${Math.abs(sliders.saturation)}%`);
    if (sliders.exposure !== 0) parts.push(`exposure ${sliders.exposure > 0 ? 'raised' : 'lowered'} by ${Math.abs(sliders.exposure)}%`);
    if (sliders.vibrance !== 0) parts.push(`vibrance ${sliders.vibrance > 0 ? 'boosted to enrich muted colors' : 'lowered'} by ${Math.abs(sliders.vibrance)}%`);
    if (sliders.highlights !== 0) parts.push(`highlights ${sliders.highlights > 0 ? 'brightened' : 'recovered/darkened'} by ${Math.abs(sliders.highlights)}%`);
    if (sliders.shadows !== 0) parts.push(`shadows ${sliders.shadows > 0 ? 'lifted for more detail' : 'deepened for more drama'} by ${Math.abs(sliders.shadows)}%`);
    
    if (parts.length === 0) return '';
    return `Apply these manual photographic adjustments: ${parts.join(', ')}. Ensure a professional, balanced output.`;
  }, [sliders]);

  const activePrompt = useMemo(() => {
    if (selectedPresetPrompt) return selectedPresetPrompt;
    
    const combined = [manualPromptPart, customPrompt].filter(Boolean).join('. ');
    return combined;
  }, [selectedPresetPrompt, manualPromptPart, customPrompt]);

  const handlePresetClick = (prompt: string) => {
    setSelectedPresetPrompt(prompt);
    setCustomPrompt('');
    handleResetSliders();
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomPrompt(e.target.value);
    setSelectedPresetPrompt(null);
  };

  const handleApply = () => {
    if (activePrompt) {
      onApplyAdjustment(activePrompt);
    }
  };

  const renderSlider = (label: string, name: keyof SliderState, colorClass: string) => (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-[11px] font-medium px-1 mb-0.5">
        <span className="text-gray-400">{label}</span>
        <span className={`font-mono ${sliders[name] !== 0 ? colorClass : 'text-gray-500'}`}>
          {sliders[name] > 0 ? '+' : ''}{sliders[name]}%
        </span>
      </div>
      <input
        type="range"
        min="-100"
        max="100"
        value={sliders[name]}
        onChange={(e) => handleSliderChange(name, parseInt(e.target.value))}
        disabled={isLoading}
        className={`w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-cyan-400 transition-all`}
      />
    </div>
  );

  const hasAdjustments = Object.values(sliders).some(val => val !== 0);

  return (
    <div className="w-full bg-gray-800/50 border border-gray-700 rounded-lg p-4 flex flex-col gap-6 animate-fade-in backdrop-blur-sm">
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 px-1">Hazır Modlar</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {presets.map(preset => (
            <button
              key={preset.name}
              onClick={() => handlePresetClick(preset.prompt)}
              disabled={isLoading}
              className={`w-full text-center bg-white/5 border border-white/5 text-gray-300 py-2.5 px-3 rounded-xl transition-all duration-200 hover:bg-white/10 active:scale-95 text-sm disabled:opacity-50 ${selectedPresetPrompt === preset.prompt ? 'bg-blue-600/20 border-blue-500/50 text-blue-300 ring-1 ring-blue-500/30' : ''}`}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-5 bg-black/20 p-5 rounded-xl border border-white/5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">Manuel Ayarlar</h3>
          {hasAdjustments && (
            <button 
              onClick={handleResetSliders}
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors font-semibold"
            >
              Sıfırla
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
          {renderSlider('Parlaklık', 'brightness', 'text-yellow-400')}
          {renderSlider('Kontrast', 'contrast', 'text-orange-400')}
          {renderSlider('Doygunluk', 'saturation', 'text-pink-400')}
          {renderSlider('Pozlama', 'exposure', 'text-blue-400')}
          {renderSlider('Canlılık', 'vibrance', 'text-emerald-400')}
          {renderSlider('Açık Tonlar', 'highlights', 'text-gray-100')}
          {renderSlider('Gölgeler', 'shadows', 'text-gray-500')}
        </div>
      </div>

      <div className="space-y-3">
        <input
          type="text"
          value={customPrompt}
          onChange={handleCustomChange}
          placeholder="Özel bir efekt veya ek düzeltme yazın..."
          className="w-full bg-gray-900/50 border border-gray-700 text-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-blue-500 focus:outline-none transition disabled:opacity-60 text-base placeholder:text-gray-600 shadow-inner"
          disabled={isLoading}
        />

        {activePrompt && (
          <div className="animate-fade-in pt-1">
            <button
              onClick={handleApply}
              className="w-full bg-gradient-to-br from-blue-600 to-blue-500 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-px active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group"
              disabled={isLoading}
            >
              <div className="flex items-center justify-center gap-2">
                <span>{isLoading ? 'Uygulanıyor...' : 'Değişiklikleri Yapay Zeka ile İşle'}</span>
                {!isLoading && (
                   <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                   </svg>
                )}
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdjustmentPanel;
