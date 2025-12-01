import React, { useState, useRef, useEffect, useCallback } from 'react';

interface BeforeAfterSliderProps {
  beforeImageUrl: string | null;
  afterImageUrl: string | null;
}

export const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({
  beforeImageUrl,
  afterImageUrl,
}) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = (x / rect.width) * 100;
    setSliderPosition(percent);
  }, []);

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) handleMove(e.clientX);
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (isDragging) handleMove(e.touches[0].clientX);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchend', handleMouseUp);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, handleMove]);

  const hasBothImages = beforeImageUrl && afterImageUrl;

  return (
    <div 
        ref={containerRef}
        className="relative w-full aspect-[4/5] max-w-lg mx-auto select-none rounded-2xl overflow-hidden shadow-2xl shadow-slate-950/50 border-4 border-slate-700"
        onMouseDown={hasBothImages ? handleMouseDown : undefined}
        onTouchStart={hasBothImages ? handleMouseDown : undefined}
        style={{ cursor: hasBothImages ? 'ew-resize' : 'default' }}
    >
      {hasBothImages ? (
        <>
          <div className="relative w-full h-full bg-slate-800">
            <img
              src={beforeImageUrl!}
              alt="ÖNCE"
              className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
            />
            
            <div 
                className="absolute top-0 left-0 w-full h-full overflow-hidden" 
                style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
            >
              <img
                src={afterImageUrl!}
                alt="SONRA"
                className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
              />
            </div>
          </div>

          <div 
              className="absolute top-0 bottom-0 w-1 bg-white/50 backdrop-blur-sm cursor-ew-resize"
              style={{ left: `calc(${sliderPosition}% - 2px)` }}
              onMouseDown={handleMouseDown}
              onTouchStart={handleMouseDown}
          >
            <div className="absolute top-1/2 -translate-y-1/2 -left-4 bg-white rounded-full h-9 w-9 flex items-center justify-center shadow-lg pointer-events-none">
              <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4"></path>
              </svg>
            </div>
          </div>
        </>
      ) : (
         <div className="w-full h-full bg-slate-800 flex items-center justify-center">
            <p className="text-slate-500">Görseller yükleniyor veya mevcut değil.</p>
        </div>
      )}
    </div>
  );
};