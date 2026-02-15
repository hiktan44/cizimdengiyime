/**
 * Pixshop Start Screen Component
 */

import React, { useState } from 'react';
import { UploadIcon, MagicWandIcon, PaletteIcon, SunIcon } from './icons';

interface StartScreenTranslations {
  heroTitle?: string;
  heroHighlight?: string;
  heroDescription?: string;
  uploadBtn?: string;
  dragDrop?: string;
  featureRetouch?: string;
  featureRetouchDesc?: string;
  featureFilters?: string;
  featureFiltersDesc?: string;
  featureAdjust?: string;
  featureAdjustDesc?: string;
}

interface StartScreenProps {
  onFileSelect: (files: FileList | null) => void;
  t?: StartScreenTranslations;
}

const StartScreen: React.FC<StartScreenProps> = ({ onFileSelect, t = {} }) => {
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFileSelect(e.target.files);
  };

  return (
    <div
      className={`w-full max-w-5xl mx-auto text-center p-8 transition-all duration-300 rounded-2xl border-2 ${isDraggingOver ? 'bg-blue-500/10 border-dashed border-blue-400' : 'border-transparent'}`}
      onDragOver={(e) => { e.preventDefault(); setIsDraggingOver(true); }}
      onDragLeave={() => setIsDraggingOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDraggingOver(false);
        onFileSelect(e.dataTransfer.files);
      }}
    >
      <div className="flex flex-col items-center gap-6 animate-fade-in">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-100 sm:text-5xl md:text-6xl">
          {t.heroTitle || 'AI Photo Editing'} <span className="text-blue-400">{t.heroHighlight || 'Made Easy'}</span>.
        </h1>
        <p className="max-w-2xl text-lg text-gray-400 md:text-xl">
          {t.heroDescription || 'Retouch your photos with text commands, add creative filters and make professional adjustments. Say goodbye to complex tools.'}
        </p>

        <div className="mt-6 flex flex-col items-center gap-4">
          <label htmlFor="pixshop-image-upload-start" className="relative inline-flex items-center justify-center px-10 py-5 text-xl font-bold text-white bg-blue-600 rounded-full cursor-pointer group hover:bg-blue-500 transition-colors">
            <UploadIcon className="w-6 h-6 mr-3 transition-transform duration-500 ease-in-out group-hover:rotate-[360deg] group-hover:scale-110" />
            {t.uploadBtn || 'Upload Photo'}
          </label>
          <input id="pixshop-image-upload-start" type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
          <p className="text-sm text-gray-500">{t.dragDrop || 'or drag and drop'}</p>
        </div>

        <div className="mt-16 w-full">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-black/20 p-6 rounded-lg border border-gray-700/50 flex flex-col items-center text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-gray-700 rounded-full mb-4">
                <MagicWandIcon className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-100">{t.featureRetouch || 'Precision Retouch'}</h3>
              <p className="mt-2 text-gray-400">{t.featureRetouchDesc || 'Click on any point in your image to remove blemishes, change colors, or add new objects.'}</p>
            </div>
            <div className="bg-black/20 p-6 rounded-lg border border-gray-700/50 flex flex-col items-center text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-gray-700 rounded-full mb-4">
                <PaletteIcon className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-100">{t.featureFilters || 'Creative Filters'}</h3>
              <p className="mt-2 text-gray-400">{t.featureFiltersDesc || 'Add an artistic touch to your photos. From vintage to futuristic styles, create your own filter or use presets.'}</p>
            </div>
            <div className="bg-black/20 p-6 rounded-lg border border-gray-700/50 flex flex-col items-center text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-gray-700 rounded-full mb-4">
                <SunIcon className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-100">{t.featureAdjust || 'Professional Adjustments'}</h3>
              <p className="mt-2 text-gray-400">{t.featureAdjustDesc || 'Adjust lighting, blur backgrounds and change the atmosphere of your photo. Studio-quality results at your fingertips.'}</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default StartScreen;
