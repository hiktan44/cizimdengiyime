import React, { useRef, useState } from 'react';
import { UploadIcon } from './icons/UploadIcon';
import { Loader2 } from 'lucide-react';
import { convertHeicToJpeg } from '../utils/heicConverter';

interface ImageUploaderProps {
  onImageUpload: (file: File) => void;
  imagePreviewUrl?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, imagePreviewUrl }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const processFile = async (file: File | undefined) => {
    if (!file) return;
    try {
      setIsProcessing(true);
      const processedFile = await convertHeicToJpeg(file);
      onImageUpload(processedFile);
    } catch (error) {
      console.error('Error processing format:', error);
      onImageUpload(file); // fallback
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    processFile(file);
    // Reset input value so same file can be selected again
    if (event.target) event.target.value = '';
  };

  const handleClick = () => {
    if (!isProcessing) {
      fileInputRef.current?.click();
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (isProcessing) return;

    const file = event.dataTransfer.files?.[0];
    if (file && (file.type.startsWith('image/') || file.name.match(/\.(heic|heif|hevc)$/i))) {
      processFile(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <div
      className={`w-full h-96 md:h-full bg-slate-800 border-2 border-dashed border-slate-600 rounded-2xl flex items-center justify-center transition-all duration-300 p-4 ${isProcessing ? 'opacity-70 cursor-wait' : 'cursor-pointer hover:border-cyan-500 hover:bg-slate-700/50'}`}
      onClick={handleClick}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*,.heic,.heif"
        className="hidden"
      />
      {isProcessing ? (
        <div className="flex flex-col items-center justify-center text-cyan-400">
          <Loader2 className="w-12 h-12 animate-spin mb-4" />
          <p className="font-semibold text-slate-300">Format dönüştürülüyor...</p>
          <p className="text-sm text-slate-500 mt-2">HEIC formatı optimize ediliyor</p>
        </div>
      ) : imagePreviewUrl ? (
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
