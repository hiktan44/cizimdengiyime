/**
 * Pixshop Upscale Panel Component
 */

import React from 'react';
import { ScaleUpIcon } from './icons';

interface UpscalePanelProps {
  onUpscale: (size: '2K' | '4K') => void;
  isLoading: boolean;
  currentWidth?: number;
  currentHeight?: number;
}

const UpscalePanel: React.FC<UpscalePanelProps> = ({ onUpscale, isLoading, currentWidth, currentHeight }) => {
  return (
    <div className="w-full bg-gray-800/50 border border-gray-700 rounded-lg p-6 flex flex-col items-center gap-6 animate-fade-in backdrop-blur-sm">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-200 flex items-center justify-center gap-2">
          <ScaleUpIcon className="w-5 h-5 text-blue-400" />
          Çözünürlük Yükseltme
        </h3>
        <p className="text-sm text-gray-400 mt-2 max-w-md mx-auto">
          Yapay zeka kullanarak görselinizi netleştirin ve çözünürlüğünü 2K veya 4K kalitesine yükseltin.
        </p>
      </div>

      {(currentWidth && currentHeight) && (
        <div className="bg-black/20 px-4 py-2 rounded-md border border-gray-700/50">
          <span className="text-gray-400 text-sm">Mevcut Boyut: </span>
          <span className="text-gray-200 font-mono font-semibold">{currentWidth} x {currentHeight} px</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg">
        <button
          onClick={() => onUpscale('2K')}
          disabled={isLoading}
          className="flex flex-col items-center justify-center p-6 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-blue-500/50 transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="text-2xl font-bold text-blue-400 group-hover:text-blue-300 transition-colors">2K</span>
          <span className="text-sm text-gray-400 mt-1">Yükseltme</span>
          <span className="text-xs text-gray-500 mt-2">~2048px</span>
          <span className="text-xs text-blue-400 font-semibold mt-2 bg-blue-500/10 px-2 py-1 rounded">⚡ 1 Kredi</span>
        </button>

        <button
          onClick={() => onUpscale('4K')}
          disabled={isLoading}
          className="flex flex-col items-center justify-center p-6 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-purple-500/50 transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="text-2xl font-bold text-purple-400 group-hover:text-purple-300 transition-colors">4K</span>
          <span className="text-sm text-gray-400 mt-1">Yükseltme</span>
          <span className="text-xs text-gray-500 mt-2">~4096px</span>
          <span className="text-xs text-amber-400 font-semibold mt-2 bg-amber-500/10 px-2 py-1 rounded">⚡ 2 Kredi</span>
        </button>
      </div>
    </div>
  );
};

export default UpscalePanel;

