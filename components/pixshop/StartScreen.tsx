/**
 * Pixshop Start Screen Component
 */

import React, { useState } from 'react';
import { UploadIcon, MagicWandIcon, PaletteIcon, SunIcon } from './icons';

interface StartScreenProps {
  onFileSelect: (files: FileList | null) => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onFileSelect }) => {
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
          Yapay Zeka ile Fotoğraf Düzenleme <span className="text-blue-400">Artık Çok Kolay</span>.
        </h1>
        <p className="max-w-2xl text-lg text-gray-400 md:text-xl">
          Metin komutlarıyla fotoğraflarınızı rötuşlayın, yaratıcı filtreler ekleyin ve profesyonel ayarlar yapın. Karmaşık araçlara elveda deyin.
        </p>

        <div className="mt-6 flex flex-col items-center gap-4">
            <label htmlFor="pixshop-image-upload-start" className="relative inline-flex items-center justify-center px-10 py-5 text-xl font-bold text-white bg-blue-600 rounded-full cursor-pointer group hover:bg-blue-500 transition-colors">
                <UploadIcon className="w-6 h-6 mr-3 transition-transform duration-500 ease-in-out group-hover:rotate-[360deg] group-hover:scale-110" />
                Fotoğraf Yükle
            </label>
            <input id="pixshop-image-upload-start" type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
            <p className="text-sm text-gray-500">veya sürükleyip bırakın</p>
        </div>

        <div className="mt-16 w-full">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-black/20 p-6 rounded-lg border border-gray-700/50 flex flex-col items-center text-center">
                    <div className="flex items-center justify-center w-12 h-12 bg-gray-700 rounded-full mb-4">
                       <MagicWandIcon className="w-6 h-6 text-blue-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-100">Hassas Rötuş</h3>
                    <p className="mt-2 text-gray-400">Resminizde istediğiniz bir noktaya tıklayarak lekeleri giderin, renkleri değiştirin veya yeni nesneler ekleyin.</p>
                </div>
                <div className="bg-black/20 p-6 rounded-lg border border-gray-700/50 flex flex-col items-center text-center">
                    <div className="flex items-center justify-center w-12 h-12 bg-gray-700 rounded-full mb-4">
                       <PaletteIcon className="w-6 h-6 text-blue-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-100">Yaratıcı Filtreler</h3>
                    <p className="mt-2 text-gray-400">Fotoğraflarınıza sanatsal bir dokunuş katın. Vintage'dan fütüristik tarzlara, kendi filtrenizi yaratın veya hazır olanları kullanın.</p>
                </div>
                <div className="bg-black/20 p-6 rounded-lg border border-gray-700/50 flex flex-col items-center text-center">
                    <div className="flex items-center justify-center w-12 h-12 bg-gray-700 rounded-full mb-4">
                       <SunIcon className="w-6 h-6 text-blue-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-100">Profesyonel Ayarlar</h3>
                    <p className="mt-2 text-gray-400">Işığı ayarlayın, arka planı bulanıklaştırın ve fotoğrafın atmosferini değiştirin. Stüdyo kalitesinde sonuçlar parmaklarınızın ucunda.</p>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default StartScreen;

