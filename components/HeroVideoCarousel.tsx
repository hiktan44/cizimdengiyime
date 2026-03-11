import React, { useState, useEffect, useRef, useCallback } from 'react';

interface HeroVideoCarouselProps {
    videos: string[];
    logoVideo?: string;
    logoDisplayDuration?: number;
    logoSkipStart?: number;
    logoHoldEnd?: number;
}

export const HeroVideoCarousel: React.FC<HeroVideoCarouselProps> = ({
    videos,
    logoVideo,
    logoDisplayDuration = 5000,
    logoSkipStart = 2,
    logoHoldEnd = 1
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFading, setIsFading] = useState(false);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const validVideos = videos.filter(v => v && v.trim() !== '');
    // carousel sırası: video0, logo, video1, logo, video2, logo, video3, logo...
    const totalItems = logoVideo ? validVideos.length * 2 : validVideos.length;

    const isLogoIndex = (index: number) => logoVideo && index % 2 !== 0;
    const getVideoIndex = (index: number) => logoVideo ? Math.floor(index / 2) : index;

    // Mevcut index'e göre hangi video URL'si gösterilecek
    const getCurrentSrc = useCallback((index: number) => {
        if (isLogoIndex(index)) return logoVideo || '';
        return validVideos[getVideoIndex(index)] || '';
    }, [validVideos, logoVideo]);

    // Mevcut index logo mu yoksa normal video mu
    const isCurrentLogo = isLogoIndex(currentIndex);

    // Video oynatma
    const playCurrentVideo = useCallback(() => {
        const video = videoRef.current;
        if (!video) return;

        const src = getCurrentSrc(currentIndex);
        if (!src) return;

        const startPlayback = () => {
            if (isLogoIndex(currentIndex) && logoVideo?.match(/\.(mp4|webm|mov)$/i)) {
                video.currentTime = logoSkipStart;
            } else {
                video.currentTime = 0;
            }
            video.muted = true;
            const p = video.play();
            if (p) p.catch(() => { });
        };

        // Src değişti mi kontrol et
        const srcChanged = video.src !== src && !video.src.endsWith(src);
        if (srcChanged) {
            video.oncanplay = null;
            video.oncanplay = () => {
                video.oncanplay = null;
                startPlayback();
            };
            video.src = src;
            video.load();
            // Fallback: 3sn içinde canplay gelmezse dene
            setTimeout(() => {
                if (video.paused) startPlayback();
            }, 3000);
        } else {
            startPlayback();
        }
    }, [currentIndex, getCurrentSrc, logoSkipStart, logoVideo]);

    // Sonraki video'ya geçiş
    const transitionToNext = useCallback(() => {
        setIsFading(true); // Fade out

        setTimeout(() => {
            const next = (currentIndex + 1) % totalItems;
            setCurrentIndex(next);
            setIsFading(false); // Fade in
        }, 500); // 500ms fade
    }, [currentIndex, totalItems]);

    // currentIndex değiştiğinde video'yu oynat
    useEffect(() => {
        if (totalItems === 0) return;
        playCurrentVideo();
    }, [currentIndex, playCurrentVideo, totalItems]);

    // Timer: video bitince veya süre dolunca geç
    useEffect(() => {
        if (totalItems <= 1) return;
        if (timerRef.current) clearTimeout(timerRef.current);

        const video = videoRef.current;

        const getDuration = () => {
            if (isLogoIndex(currentIndex)) {
                if (video && video.duration && !isNaN(video.duration) && video.duration > 0) {
                    const effectiveDuration = Math.max(video.duration - logoSkipStart, 1);
                    return (effectiveDuration + logoHoldEnd) * 1000;
                }
                return logoDisplayDuration;
            }
            if (video && video.duration && !isNaN(video.duration) && video.duration > 0) {
                return video.duration * 1000;
            }
            return 8000;
        };

        const startTimer = () => {
            const duration = getDuration();
            timerRef.current = setTimeout(transitionToNext, duration);
        };

        if (video && video.readyState >= 1) {
            startTimer();
        } else if (video) {
            const onReady = () => {
                startTimer();
                video.removeEventListener('loadedmetadata', onReady);
                video.removeEventListener('canplay', onReady);
            };
            video.addEventListener('loadedmetadata', onReady);
            video.addEventListener('canplay', onReady);
            // Fallback
            setTimeout(startTimer, 5000);
        } else {
            setTimeout(startTimer, 1000);
        }

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [currentIndex, totalItems, transitionToNext, logoSkipStart, logoHoldEnd, logoDisplayDuration]);

    // Mobil için: sayfa yüklenince veya dokunulunca ilk video'yu oynat
    useEffect(() => {
        const startVideo = () => playCurrentVideo();

        // Biraz bekle
        const timer = setTimeout(startVideo, 800);

        // Mobil fallback
        const onTouch = () => {
            playCurrentVideo();
            document.removeEventListener('touchstart', onTouch);
            document.removeEventListener('click', onTouch);
        };
        document.addEventListener('touchstart', onTouch, { passive: true });
        document.addEventListener('click', onTouch);

        return () => {
            clearTimeout(timer);
            document.removeEventListener('touchstart', onTouch);
            document.removeEventListener('click', onTouch);
        };
    }, []);

    if (totalItems === 0) {
        return (
            <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50 to-white" />
        );
    }

    return (
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
            {/* Tek video elementi - mobilde sorunsuz çalışır */}
            <video
                ref={videoRef}
                className={`absolute inset-0 w-full h-full ${isCurrentLogo ? 'object-contain bg-black/90' : 'object-cover'} transition-opacity duration-500 ease-in-out ${isFading ? 'opacity-0' : 'opacity-100'}`}
                muted
                playsInline
                preload="auto"
            />

            {/* Logo resim ise (video değilse) */}
            {logoVideo && !logoVideo.match(/\.(mp4|webm|mov)$/i) && isCurrentLogo && (
                <div
                    className={`absolute inset-0 w-full h-full bg-black/90 flex items-center justify-center transition-opacity duration-500 ease-in-out ${isFading ? 'opacity-0' : 'opacity-100'}`}
                >
                    <img
                        src={logoVideo}
                        alt="Logo"
                        className="max-w-[80%] max-h-[80%] object-contain"
                    />
                </div>
            )}

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-transparent to-white/80 pointer-events-none" />

            {/* Progress Indicators */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
                {Array.from({ length: totalItems }).map((_, index) => (
                    <div
                        key={index}
                        className={`h-1 rounded-full transition-all duration-500 ${index === currentIndex
                            ? 'w-12 bg-white'
                            : 'w-4 bg-white/30'
                            }`}
                        title={isLogoIndex(index) ? 'Logo Transition' : `Video ${getVideoIndex(index) + 1}`}
                    />
                ))}
            </div>
        </div>
    );
};
