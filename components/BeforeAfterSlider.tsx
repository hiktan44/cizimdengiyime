import React, { useState, useRef, useEffect, useCallback } from 'react';

interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
}

export const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({
  beforeImage,
  afterImage,
  beforeLabel = 'BEFORE',
  afterLabel = 'AFTER',
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

  const hasBothImages = beforeImage && afterImage;

  return (
    <div 
        ref={containerRef}
        className="relative w-full h-full select-none overflow-hidden"
        onMouseDown={hasBothImages ? handleMouseDown : undefined}
        onTouchStart={hasBothImages ? handleMouseDown : undefined}
        style={{ cursor: hasBothImages ? 'ew-resize' : 'default' }}
    >
      {hasBothImages ? (
        <>
          <div className="relative w-full h-full bg-slate-900">
            {/* Before Image */}
            <img
              src={beforeImage}
              alt={beforeLabel}
              className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
            />
            
            {/* After Image (clipped) */}
            <div 
                className="absolute top-0 left-0 w-full h-full overflow-hidden" 
                style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
            >
              <img
                src={afterImage}
                alt={afterLabel}
                className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
              />
            </div>

            {/* Labels */}
            <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-slate-600">
              <span className="text-xs font-bold text-white">{beforeLabel}</span>
            </div>
            <div className="absolute top-4 right-4 bg-cyan-600/80 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-cyan-400">
              <span className="text-xs font-bold text-white">{afterLabel}</span>
            </div>
          </div>

          {/* Slider Handle */}
          <div 
              className="absolute top-0 bottom-0 w-1 bg-white shadow-lg cursor-ew-resize z-10"
              style={{ left: `${sliderPosition}%` }}
              onMouseDown={handleMouseDown}
              onTouchStart={handleMouseDown}
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-full h-10 w-10 flex items-center justify-center shadow-xl border-2 border-slate-300 pointer-events-none">
              <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
              </svg>
            </div>
          </div>
        </>
      ) : (
         <div className="w-full h-full bg-slate-800 flex items-center justify-center">
            <p className="text-slate-500">Görseller yükleniyor...</p>
        </div>
      )}
    </div>
  );
};