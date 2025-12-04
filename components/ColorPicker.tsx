
import React, { useState } from 'react';
import { XCircleIcon } from './icons/XCircleIcon';

export const colors = [
  { name: 'Siyah', value: '#000000' },
  { name: 'Beyaz', value: '#ffffff', border: true },
  { name: 'Antrasit', value: '#374151' },
  { name: 'Gri', value: '#9ca3af' },
  { name: 'Lacivert', value: '#1e3a8a' },
  { name: 'Mavi', value: '#3b82f6' },
  { name: 'Bebek Mavisi', value: '#bfdbfe' },
  { name: 'Kırmızı', value: '#ef4444' },
  { name: 'Bordo', value: '#7f1d1d' },
  { name: 'Yeşil', value: '#22c55e' },
  { name: 'Zümrüt', value: '#064e3b' },
  { name: 'Haki', value: '#57534e' }, // Olive/Khaki tone simulation
  { name: 'Sarı', value: '#eab308' },
  { name: 'Hardal', value: '#a16207' },
  { name: 'Bej', value: '#f5f5dc', border: true },
  { name: 'Kahverengi', value: '#78350f' },
  { name: 'Taba', value: '#c2410c' },
  { name: 'Pembe', value: '#ec4899' },
  { name: 'Pudra', value: '#fbcfe8' },
  { name: 'Mor', value: '#8b5cf6' },
  { name: 'Lila', value: '#e9d5ff' },
  { name: 'Turuncu', value: '#f97316' },
  { name: 'Pastel', value: 'linear-gradient(to right, #fbcfe8, #fef08a, #bbf7d0)'},
];

interface ColorPickerProps {
  label?: string;
  selectedColor: string;
  onColorChange: (color: string) => void;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ label = "Renk Önerisi:", selectedColor, onColorChange }) => {
  const [customColorHex, setCustomColorHex] = useState('#3b82f6');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showLargeModal, setShowLargeModal] = useState(false);
  
  const handleColorClick = (colorName: string) => {
    if (selectedColor === colorName) {
      onColorChange(''); // Deselect if clicked again
    } else {
      onColorChange(colorName);
    }
  };

  const handleCustomColorSelect = () => {
    // Create a custom color name with hex value
    const customColorName = `Özel Renk (${customColorHex})`;
    onColorChange(customColorName);
    setShowColorPicker(false);
  };

  const handleColorInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomColorHex(e.target.value);
  };

  const handleLargeModalColorSelect = (colorName: string) => {
    onColorChange(colorName);
    setShowLargeModal(false);
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="font-medium text-slate-300 text-sm flex justify-between items-center">
        {label}
        <div className="flex items-center gap-2">
          {selectedColor && <span className="text-cyan-400 font-normal text-xs">{selectedColor}</span>}
          <button
            type="button"
            onClick={() => setShowLargeModal(true)}
            className="text-xs bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1 rounded-full transition-all font-semibold"
          >
            Büyük Pencere
          </button>
        </div>
      </label>
      
      {/* Compact color selector */}
      <div className="flex items-center gap-2 flex-wrap bg-slate-900/50 p-3 rounded-lg border border-slate-700">
        {colors.map((color) => (
          <button
            key={color.name}
            type="button"
            title={color.name}
            onClick={() => handleColorClick(color.name)}
            className={`w-6 h-6 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-cyan-500 relative ${selectedColor === color.name ? 'scale-125 ring-2 ring-white' : 'hover:scale-110'}`}
            style={{ 
                background: color.value,
                border: color.border ? '1px solid #cbd5e1' : 'none'
            }}
            aria-label={`Renk seç: ${color.name}`}
          />
        ))}
        
        {/* Custom Color Picker Button */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="w-6 h-6 rounded-full transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-cyan-500 flex items-center justify-center"
            style={{ 
                background: `conic-gradient(from 0deg, red, yellow, lime, aqua, blue, magenta, red)`,
                border: '2px solid #fff'
            }}
            title="Özel Renk Seç"
            aria-label="Özel renk paleti aç"
          >
            <span className="text-white text-xs font-bold drop-shadow">+</span>
          </button>
          
          {showColorPicker && (
            <div className="absolute top-8 left-0 z-50 bg-slate-800 p-3 rounded-lg border border-slate-600 shadow-2xl flex flex-col gap-2">
              <label className="text-xs text-slate-400 font-medium">Özel Renk Ton Seç</label>
              <input
                type="color"
                value={customColorHex}
                onChange={handleColorInputChange}
                className="w-20 h-20 cursor-pointer border-2 border-slate-600 rounded"
              />
              <div className="text-xs text-slate-400 font-mono text-center">{customColorHex}</div>
              <button
                onClick={handleCustomColorSelect}
                className="bg-cyan-600 text-white px-3 py-1.5 rounded text-xs font-semibold hover:bg-cyan-500 transition"
              >
                Kullan
              </button>
              <button
                onClick={() => setShowColorPicker(false)}
                className="bg-slate-700 text-slate-300 px-3 py-1 rounded text-xs hover:bg-slate-600 transition"
              >
                İptal
              </button>
            </div>
          )}
        </div>

         {selectedColor && (
          <button 
            onClick={() => onColorChange('')} 
            className="text-slate-500 hover:text-red-400 transition-colors ml-auto"
            title="Rengi Temizle"
            aria-label="Renk seçimini temizle"
          >
            <XCircleIcon />
          </button>
        )}
      </div>

      {/* Large Color Selection Modal */}
      {showLargeModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowLargeModal(false)}>
          <div className="bg-slate-800 rounded-2xl border-2 border-slate-600 shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-slate-800 border-b border-slate-700 p-6 flex items-center justify-between z-10">
              <h3 className="text-xl font-bold text-white">Renk Seçin</h3>
              <button
                onClick={() => setShowLargeModal(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6">
              {/* Color Grid */}
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                {colors.map((color) => (
                  <button
                    key={color.name}
                    type="button"
                    onClick={() => handleLargeModalColorSelect(color.name)}
                    className={`group relative flex flex-col items-center gap-3 p-4 rounded-xl transition-all duration-200 hover:scale-105 ${
                      selectedColor === color.name
                        ? 'bg-cyan-600/20 ring-2 ring-cyan-500 shadow-lg shadow-cyan-500/30'
                        : 'bg-slate-700/50 hover:bg-slate-700 border border-slate-600'
                    }`}
                  >
                    <div
                      className="w-16 h-16 rounded-lg shadow-lg transition-transform group-hover:scale-110"
                      style={{
                        background: color.value,
                        border: color.border ? '2px solid #cbd5e1' : 'none',
                      }}
                    />
                    <span className="text-xs font-semibold text-slate-300 text-center leading-tight">
                      {color.name}
                    </span>
                    {selectedColor === color.name && (
                      <div className="absolute top-2 right-2">
                        <svg className="w-5 h-5 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}

                {/* Custom Color Button in Large Modal */}
                <button
                  type="button"
                  onClick={() => {
                    setShowLargeModal(false);
                    setShowColorPicker(true);
                  }}
                  className="group relative flex flex-col items-center gap-3 p-4 rounded-xl transition-all duration-200 hover:scale-105 bg-slate-700/50 hover:bg-slate-700 border border-slate-600"
                >
                  <div
                    className="w-16 h-16 rounded-lg shadow-lg transition-transform group-hover:scale-110 flex items-center justify-center"
                    style={{
                      background: `conic-gradient(from 0deg, red, yellow, lime, aqua, blue, magenta, red)`,
                      border: '2px solid #fff',
                    }}
                  >
                    <span className="text-white text-2xl font-bold drop-shadow-lg">+</span>
                  </div>
                  <span className="text-xs font-semibold text-slate-300 text-center leading-tight">
                    Özel Renk
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
