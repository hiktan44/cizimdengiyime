/**
 * Fotomatik Upload Area Component
 */

import React, { useRef } from 'react';
import { FotomatikImageFile } from '../../types/fotomatik';
import { processFile } from './fileUtils';

interface UploadAreaProps {
  selectedImage: FotomatikImageFile | null;
  onImageSelected: (image: FotomatikImageFile | null) => void;
  onEditStart: () => void;
}

export const UploadArea: React.FC<UploadAreaProps> = ({ selectedImage, onImageSelected, onEditStart }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const processedImage = await processFile(file);
        onImageSelected(processedImage);
      } catch (error) {
        console.error("Dosya işlenirken hata oluştu", error);
        alert("Görüntü dosyası işlenemedi.");
      }
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onImageSelected(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-slate-300 mb-2">
        Kaynak Görüntü
      </label>
      
      {!selectedImage ? (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-600 hover:border-blue-500 bg-slate-800/50 rounded-xl h-64 flex flex-col items-center justify-center cursor-pointer transition-all group"
        >
          <div className="bg-slate-700/50 p-4 rounded-full mb-3 group-hover:bg-blue-500/20 transition-colors">
            <svg className="w-8 h-8 text-slate-400 group-hover:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <p className="text-slate-300 font-medium">Fotoğraf yüklemek için tıklayın</p>
          <p className="text-slate-500 text-sm mt-1">JPG, PNG desteklenir</p>
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/png, image/jpeg, image/webp"
            className="hidden"
          />
        </div>
      ) : (
        <div className="relative rounded-xl overflow-hidden border border-slate-700 h-64 bg-black/40 flex items-center justify-center group">
          <img 
            src={selectedImage.previewUrl} 
            alt="Source" 
            className="h-full w-full object-contain"
          />
          
          {/* Controls Overlay */}
          <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={onEditStart}
              className="bg-black/70 hover:bg-blue-600 text-white p-2 rounded-full backdrop-blur-md transition-colors"
              title="Görüntüyü Düzenle"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
            <button 
              onClick={handleClear}
              className="bg-black/70 hover:bg-red-500 text-white p-2 rounded-full backdrop-blur-md transition-colors"
              title="Görüntüyü Kaldır"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

