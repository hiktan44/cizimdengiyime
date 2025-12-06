/**
 * Pixshop Crop Panel Component
 */

import React, { useState } from 'react';
import { RotateLeftIcon, RotateRightIcon, FlipHorizontalIcon, FlipVerticalIcon } from './icons';

interface CropPanelProps {
  onApplyCrop: () => void;
  onSetAspect: (aspect: number | undefined) => void;
  isLoading: boolean;
  isCropping: boolean;
  rotation: number;
  setRotation: (rotation: number | ((prev: number) => number)) => void;
  flipH: boolean;
  setFlipH: (flip: boolean | ((prev: boolean) => boolean)) => void;
  flipV: boolean;
  setFlipV: (flip: boolean | ((prev: boolean) => boolean)) => void;
}

type AspectRatio = 'Serbest' | '1:1' | '4:3' | '16:9' | '9:16' | 'Custom';

const CropPanel: React.FC<CropPanelProps> = ({ 
    onApplyCrop, 
    onSetAspect, 
    isLoading, 
    isCropping, 
    rotation, 
    setRotation,
    flipH,
    setFlipH,
    flipV,
    setFlipV
}) => {
  const [activeAspect, setActiveAspect] = useState<AspectRatio>('Serbest');
  const [customAspectValue, setCustomAspectValue] = useState<number>(1);
  
  const handleAspectChange = (aspect: AspectRatio, value: number | undefined) => {
    setActiveAspect(aspect);
    onSetAspect(value);
    if (value) {
        setCustomAspectValue(value);
    }
  }
  
  const handleCustomAspectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = parseFloat(e.target.value);
      setCustomAspectValue(val);
      setActiveAspect('Custom');
      onSetAspect(val);
  };
  
  const rotateLeft = () => setRotation((prev) => prev - 90);
  const rotateRight = () => setRotation((prev) => prev + 90);

  const aspects: { name: AspectRatio, value: number | undefined }[] = [
    { name: 'Serbest', value: undefined },
    { name: '1:1', value: 1 / 1 },
    { name: '4:3', value: 4 / 3 },
    { name: '16:9', value: 16 / 9 },
    { name: '9:16', value: 9 / 16 },
  ];

  return (
    <div className="w-full bg-gray-800/50 border border-gray-700 rounded-lg p-4 flex flex-col items-center gap-4 animate-fade-in backdrop-blur-sm">
      <div className="flex justify-between w-full items-center">
         <h3 className="text-lg font-semibold text-gray-300">Kırp & Döndür</h3>
      </div>
      
      {/* Rotation Controls */}
      <div className="w-full bg-black/20 p-3 rounded-lg flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
             <span className="text-sm font-medium text-gray-400">Döndür:</span>
             <div className="flex gap-2">
                <button onClick={rotateLeft} className="p-2 bg-white/10 hover:bg-white/20 rounded-md text-gray-300 transition-colors" title="Sola 90° Döndür">
                    <RotateLeftIcon className="w-5 h-5" />
                </button>
                <button onClick={rotateRight} className="p-2 bg-white/10 hover:bg-white/20 rounded-md text-gray-300 transition-colors" title="Sağa 90° Döndür">
                    <RotateRightIcon className="w-5 h-5" />
                </button>
             </div>
          </div>
          
          <div className="flex items-center gap-3">
            <input 
                type="range" 
                min="-180" 
                max="180" 
                value={rotation} 
                onChange={(e) => setRotation(Number(e.target.value))}
                className="flex-grow h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                disabled={isLoading}
            />
            <span className="text-sm font-mono text-gray-300 w-12 text-right">{rotation}°</span>
          </div>
      </div>

       {/* Flip Controls */}
      <div className="w-full flex items-center gap-4 bg-black/20 p-3 rounded-lg">
          <span className="text-sm font-medium text-gray-400">Çevir:</span>
          <div className="flex gap-2">
            <button 
                onClick={() => setFlipH(p => !p)} 
                className={`p-2 rounded-md transition-colors flex items-center gap-2 text-sm ${flipH ? 'bg-blue-600 text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}
            >
                <FlipHorizontalIcon className="w-5 h-5" /> Yatay
            </button>
            <button 
                onClick={() => setFlipV(p => !p)} 
                className={`p-2 rounded-md transition-colors flex items-center gap-2 text-sm ${flipV ? 'bg-blue-600 text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}
            >
                <FlipVerticalIcon className="w-5 h-5" /> Dikey
            </button>
          </div>
      </div>

      {/* Aspect Ratio Buttons */}
      <div className="flex items-center flex-wrap justify-center gap-2 w-full">
        {aspects.map(({ name, value }) => (
          <button
            key={name}
            onClick={() => handleAspectChange(name, value)}
            disabled={isLoading}
            className={`px-3 py-2 rounded-md text-sm font-semibold transition-all duration-200 active:scale-95 disabled:opacity-50 ${
              activeAspect === name 
              ? 'bg-gradient-to-br from-blue-600 to-blue-500 text-white shadow-md shadow-blue-500/20' 
              : 'bg-white/10 hover:bg-white/20 text-gray-200'
            }`}
          >
            {name}
          </button>
        ))}
      </div>
      
      {/* Custom Aspect Ratio Slider */}
      <div className="w-full flex items-center gap-4 bg-black/20 p-3 rounded-lg">
          <span className="text-sm font-medium text-gray-400 w-16">Oran:</span>
          <input 
            type="range" 
            min="0.5" 
            max="2.5" 
            step="0.01"
            value={customAspectValue} 
            onChange={handleCustomAspectChange}
            className="flex-grow h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500"
            disabled={isLoading}
          />
          <span className="text-sm font-mono text-gray-300 w-12 text-right">{customAspectValue.toFixed(2)}</span>
      </div>

      <button
        onClick={onApplyCrop}
        disabled={isLoading || !isCropping}
        className="w-full max-w-xs mt-2 bg-gradient-to-br from-green-600 to-green-500 text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 ease-in-out shadow-lg shadow-green-500/20 hover:shadow-xl hover:shadow-green-500/40 hover:-translate-y-px active:scale-95 active:shadow-inner text-base disabled:from-green-800 disabled:to-green-700 disabled:shadow-none disabled:cursor-not-allowed disabled:transform-none"
      >
        Kırp ve Kaydet
      </button>
    </div>
  );
};

export default CropPanel;

