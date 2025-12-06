/**
 * Fotomatik Result Area Component
 */

import React from 'react';
import { FotomatikAppStatus } from '../../types/fotomatik';

interface ResultAreaProps {
  status: FotomatikAppStatus;
  generatedImageUrl: string | null;
}

export const ResultArea: React.FC<ResultAreaProps> = ({ status, generatedImageUrl }) => {
  
  if (status === FotomatikAppStatus.IDLE && !generatedImageUrl) {
    return (
      <div className="w-full h-full min-h-[300px] bg-slate-800/30 border border-slate-700 rounded-xl flex flex-col items-center justify-center text-slate-500">
        <svg className="w-12 h-12 mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
        </svg>
        <p>Oluşturulan görüntü burada görünecek</p>
        <p className="text-xs text-slate-600 mt-2">1K, 2K veya 4K kalitesinde</p>
      </div>
    );
  }

  if (status === FotomatikAppStatus.LOADING) {
    return (
      <div className="w-full h-full min-h-[300px] bg-slate-800/30 border border-slate-700 rounded-xl flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-blue-300 font-medium animate-pulse">Fotoğrafınız dönüştürülüyor...</p>
        <p className="text-slate-500 text-sm mt-2">Bu işlem çözünürlüğe bağlı olarak biraz zaman alabilir</p>
      </div>
    );
  }

  if (generatedImageUrl) {
    return (
      <div className="w-full flex flex-col animate-in fade-in duration-500">
         <label className="block text-sm font-medium text-slate-300 mb-2">
          Dönüştürülen Sonuç
        </label>
        <div className="relative group rounded-xl overflow-hidden border border-slate-700 bg-black/40 min-h-[300px] flex items-center justify-center">
          <img 
            src={generatedImageUrl} 
            alt="Generated AI Result" 
            className="w-full h-auto max-h-[600px] object-contain"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-end p-4">
            <a 
              href={generatedImageUrl} 
              download="fotomatik-result.png"
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-lg"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Görüntüyü İndir
            </a>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

