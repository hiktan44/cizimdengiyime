
import React, { useRef } from 'react';
import { UploadIcon } from './icons/UploadIcon';

interface ImageUploaderProps {
  onImageUpload: (file: File) => void;
  imagePreviewUrl?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, imagePreviewUrl }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageUpload(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const file = event.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
        onImageUpload(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
  };

  return (
    <div 
        className="w-full h-96 md:h-full bg-slate-800 border-2 border-dashed border-slate-600 rounded-2xl flex items-center justify-center cursor-pointer hover:border-cyan-500 hover:bg-slate-700/50 transition-all duration-300 p-4"
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      {imagePreviewUrl ? (
        <img src={imagePreviewUrl} alt="Teknik Çizim Önizlemesi" className="max-w-full max-h-full object-contain rounded-lg" />
      ) : (
        <div className="text-center text-slate-500">
            <div className="flex justify-center mb-4">
                <UploadIcon />
            </div>
            <p className="font-semibold">Bir resim dosyası sürükleyip bırakın</p>
            <p className="text-sm">veya seçmek için tıklayın</p>
        </div>
      )}
    </div>
  );
};
