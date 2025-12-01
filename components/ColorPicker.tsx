
import React from 'react';
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
  
  const handleColorClick = (colorName: string) => {
    if (selectedColor === colorName) {
      onColorChange(''); // Deselect if clicked again
    } else {
      onColorChange(colorName);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="font-medium text-slate-300 text-sm flex justify-between">
        {label}
        {selectedColor && <span className="text-cyan-400 font-normal">{selectedColor}</span>}
      </label>
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
    </div>
  );
};
