/**
 * Pixshop Filter Panel Component - Gelişmiş Versiyon
 */

import React, { useState, useMemo } from 'react';

interface FilterPanelProps {
  onApplyFilter: (prompt: string) => void;
  isLoading: boolean;
}

interface FilterAdjustments {
  intensity: number;
  saturation: number;
  contrast: number;
  hue: number;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ onApplyFilter, isLoading }) => {
  const [selectedPresetPrompt, setSelectedPresetPrompt] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const [adjustments, setAdjustments] = useState<FilterAdjustments>({
    intensity: 100,
    saturation: 0,
    contrast: 0,
    hue: 0,
  });

  const presets = [
    { name: 'Synthwave', prompt: 'Apply a vibrant 80s synthwave aesthetic with neon magenta and cyan glows, and subtle scan lines.' },
    { name: 'Anime', prompt: 'Give the image a vibrant Japanese anime style, with bold outlines, cel-shading, and saturated colors.' },
    { name: 'Lomo', prompt: 'Apply a Lomography-style cross-processing film effect with high-contrast, oversaturated colors, and dark vignetting.' },
    { name: 'Glitch', prompt: 'Transform the image into a futuristic holographic projection with digital glitch effects and chromatic aberration.' },
    { name: 'Vintage', prompt: 'Apply a 1970s analog film look with warm tones, slight grain, and faded shadows.' },
    { name: 'Cyberpunk', prompt: 'Apply a rainy night cyberpunk look with high contrast and dominant neon blue and pink lights.' },
  ];

  const handleAdjustmentChange = (name: keyof FilterAdjustments, value: number) => {
    setAdjustments(prev => ({ ...prev, [name]: value }));
  };

  const handleReset = () => {
    setAdjustments({ intensity: 100, saturation: 0, contrast: 0, hue: 0 });
    setSelectedPresetPrompt(null);
    setCustomPrompt('');
  };

  const activePrompt = useMemo(() => {
    const base = selectedPresetPrompt || customPrompt;
    if (!base) return '';

    const parts: string[] = [base];
    
    // Convert slider values to descriptive instructions for the AI
    if (adjustments.intensity !== 100) {
      parts.push(`The effect should be applied with ${adjustments.intensity}% intensity.`);
    }
    if (adjustments.saturation !== 0) {
      parts.push(`Make colors ${adjustments.saturation > 0 ? 'more vibrant and saturated' : 'more muted and desaturated'} by ${Math.abs(adjustments.saturation)}%.`);
    }
    if (adjustments.contrast !== 0) {
      parts.push(`Adjust contrast ${adjustments.contrast > 0 ? 'higher' : 'lower'} by ${Math.abs(adjustments.contrast)}%.`);
    }
    if (adjustments.hue !== 0) {
      parts.push(`Shift the color palette slightly ${adjustments.hue > 0 ? 'towards warmer' : 'towards cooler'} tones.`);
    }

    return parts.join(' ');
  }, [selectedPresetPrompt, customPrompt, adjustments]);

  const handlePresetClick = (prompt: string) => {
    setSelectedPresetPrompt(prompt);
    setCustomPrompt('');
  };
  
  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomPrompt(e.target.value);
    setSelectedPresetPrompt(null);
  };

  const handleApply = () => {
    if (activePrompt) {
      onApplyFilter(activePrompt);
    }
  };

  const renderSlider = (label: string, name: keyof FilterAdjustments, min: number, max: number, unit: string = '%') => (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest px-1">
        <span className="text-gray-500">{label}</span>
        <span className={adjustments[name] !== (name === 'intensity' ? 100 : 0) ? 'text-blue-400' : 'text-gray-600'}>
          {adjustments[name] > 0 && name !== 'intensity' ? '+' : ''}{adjustments[name]}{unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={adjustments[name]}
        onChange={(e) => handleAdjustmentChange(name, parseInt(e.target.value))}
        disabled={isLoading}
        className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-cyan-400 transition-all"
      />
    </div>
  );

  const hasAnySelection = selectedPresetPrompt || customPrompt;

  return (
    <div className="w-full bg-gray-800/50 border border-gray-700 rounded-2xl p-5 flex flex-col gap-6 animate-fade-in backdrop-blur-md">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400">Filtre Seçimi</h3>
        {hasAnySelection && (
          <button onClick={handleReset} className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors uppercase">Sıfırla</button>
        )}
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
        {presets.map(preset => (
          <button
            key={preset.name}
            onClick={() => handlePresetClick(preset.prompt)}
            disabled={isLoading}
            className={`w-full text-center py-3 px-4 rounded-xl transition-all duration-200 border text-sm font-bold ${
              selectedPresetPrompt === preset.prompt 
              ? 'bg-blue-600/20 border-blue-500/50 text-blue-100 shadow-[0_0_15px_rgba(59,130,246,0.2)]' 
              : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10 hover:text-gray-200'
            } active:scale-95 disabled:opacity-50`}
          >
            {preset.name}
          </button>
        ))}
      </div>

      <div className="space-y-4 bg-black/20 p-5 rounded-2xl border border-white/5">
        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-2">Filtre Karakterini Özelleştir</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
          {renderSlider('Yoğunluk', 'intensity', 0, 100)}
          {renderSlider('Doygunluk', 'saturation', -100, 100)}
          {renderSlider('Kontrast', 'contrast', -100, 100)}
          {renderSlider('Renk Tonu', 'hue', -50, 50, '°')}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <input
          type="text"
          value={customPrompt}
          onChange={handleCustomChange}
          placeholder="Veya özel bir stil yazın (örn: Pastel rüyası)"
          className="w-full bg-gray-900/50 border border-gray-700 text-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-blue-500 focus:outline-none transition disabled:opacity-60 text-base placeholder:text-gray-600 shadow-inner"
          disabled={isLoading}
        />
        
        <button
          onClick={handleApply}
          className={`w-full py-4 px-6 rounded-xl font-bold transition-all duration-300 shadow-xl flex items-center justify-center gap-2 ${
            hasAnySelection && !isLoading
            ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:scale-[1.01] active:scale-95 shadow-blue-500/20'
            : 'bg-gray-800 text-gray-600 cursor-not-allowed border border-gray-700'
          }`}
          disabled={isLoading || !hasAnySelection}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              İşleniyor...
            </span>
          ) : (
            <>
              Filtreyi Uygula
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default FilterPanel;
