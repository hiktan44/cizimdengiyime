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
    const [nextIndex, setNextIndex] = useState(-1);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
    const logoRef = useRef<HTMLVideoElement | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const hasInteractedRef = useRef(false);

    const validVideos = videos.filter(v => v && v.trim() !== '');
    const totalItems = logoVideo ? validVideos.length * 2 : validVideos.length;

    const isLogoIndex = (index: number) => logoVideo && index % 2 !== 0;
    const getVideoIndex = (index: number) => logoVideo ? Math.floor(index / 2) : index;

    // Mobil-safe play: muted + catch ile
    const safePlay = useCallback((video: HTMLVideoElement | null) => {
        if (!video) return;
        video.muted = true; // Mobilde autoplay için zorunlu
        const p = video.play();
        if (p) p.catch(() => { });
    }, []);

    const getCurrentDuration = (index: number): number => {
        if (isLogoIndex(index)) {
            if (logoVideo && logoRef.current && logoVideo.match(/\.(mp4|webm|mov)$/i)) {
                const duration = logoRef.current.duration;
                if (duration && !isNaN(duration) && duration > 0) {
                    const effectiveDuration = Math.max(duration - logoSkipStart, 1);
                    return (effectiveDuration + logoHoldEnd) * 1000;
                }
                return logoDisplayDuration;
            }
            return logoDisplayDuration;
        } else {
            const videoIndex = getVideoIndex(index);
            const videoElement = videoRefs.current[videoIndex];
            if (videoElement && videoElement.duration && !isNaN(videoElement.duration) && videoElement.duration > 0) {
                return videoElement.duration * 1000;
            }
            return 8000;
        }
    };

    const transitionToNext = useCallback(() => {
        const next = (currentIndex + 1) % totalItems;
        setNextIndex(next);
        setIsTransitioning(true);

        setTimeout(() => {
            setCurrentIndex(next);
            setNextIndex(-1);
            setIsTransitioning(false);

            // Önceki videoyu durdur
            if (!isLogoIndex(currentIndex)) {
                const prevVideoIndex = getVideoIndex(currentIndex);
                const prevVideo = videoRefs.current[prevVideoIndex];
                if (prevVideo) {
                    try { prevVideo.pause(); } catch (e) { }
                }
            } else {
                if (logoRef.current) {
                    try { logoRef.current.pause(); } catch (e) { }
                }
            }

            // Sonraki videoyu oynat
            if (isLogoIndex(next)) {
                if (logoRef.current && logoVideo?.match(/\.(mp4|webm|mov)$/i)) {
                    logoRef.current.currentTime = logoSkipStart;
                    safePlay(logoRef.current);
                }
            } else {
                const videoIndex = getVideoIndex(next);
                if (videoRefs.current[videoIndex]) {
                    videoRefs.current[videoIndex]!.currentTime = 0;
                    safePlay(videoRefs.current[videoIndex]);
                }
            }
        }, 1000);
    }, [currentIndex, totalItems, safePlay, logoVideo, logoSkipStart]);

    // Carousel timer
    useEffect(() => {
        if (totalItems === 0) return;

        if (timerRef.current) clearTimeout(timerRef.current);

        const setupTimer = () => {
            const duration = getCurrentDuration(currentIndex);
            timerRef.current = setTimeout(() => {
                transitionToNext();
            }, duration);
        };

        if (!isLogoIndex(currentIndex)) {
            const videoIndex = getVideoIndex(currentIndex);
            const video = videoRefs.current[videoIndex];
            if (video && video.readyState >= 1) {
                setupTimer();
            } else if (video) {
                const handleReady = () => {
                    setupTimer();
                    video.removeEventListener('loadedmetadata', handleReady);
                    video.removeEventListener('canplay', handleReady);
                };
                video.addEventListener('loadedmetadata', handleReady);
                video.addEventListener('canplay', handleReady);
                setTimeout(setupTimer, 4000); // Fallback
            } else {
                setupTimer();
            }
        } else {
            setupTimer();
        }

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [currentIndex, totalItems, transitionToNext]);

    // İlk video'yu başlat - mobilde de çalışsın
    useEffect(() => {
        if (validVideos.length === 0) return;

        const startFirstVideo = () => {
            if (!isLogoIndex(0)) {
                const firstVideo = videoRefs.current[0];
                if (firstVideo) {
                    firstVideo.currentTime = 0;
                    safePlay(firstVideo);
                }
            } else if (logoRef.current) {
                logoRef.current.currentTime = logoSkipStart;
                safePlay(logoRef.current);
            }
        };

        // Biraz bekle - ref'ler hazır olsun
        const timer = setTimeout(startFirstVideo, 500);

        // Mobil için: kullanıcı dokunduğunda video başlat (fallback)
        const handleInteraction = () => {
            if (!hasInteractedRef.current) {
                hasInteractedRef.current = true;
                startFirstVideo();
            }
        };

        document.addEventListener('touchstart', handleInteraction, { once: true, passive: true });
        document.addEventListener('click', handleInteraction, { once: true });

        return () => {
            clearTimeout(timer);
            document.removeEventListener('touchstart', handleInteraction);
            document.removeEventListener('click', handleInteraction);
        };
    }, [validVideos.length, safePlay]);

    if (totalItems === 0) {
        return (
            <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50 to-white" />
        );
    }

    const isElementVisible = (type: 'video' | 'logo', index: number) => {
        if (type === 'logo') {
            if (!logoVideo) return 'opacity-0';
            const isCurrentLogo = isLogoIndex(currentIndex);
            const isNextLogo = isTransitioning && isLogoIndex(nextIndex);
            if (isCurrentLogo && !isTransitioning) return 'opacity-100';
            if (isCurrentLogo && isTransitioning) return 'opacity-0';
            if (isNextLogo) return 'opacity-100';
            return 'opacity-0';
        } else {
            const myCarouselIndex = logoVideo ? index * 2 : index;
            const isCurrentMe = currentIndex === myCarouselIndex;
            const isNextMe = isTransitioning && nextIndex === myCarouselIndex;
            if (isCurrentMe && !isTransitioning) return 'opacity-100';
            if (isCurrentMe && isTransitioning) return 'opacity-0';
            if (isNextMe) return 'opacity-100';
            return 'opacity-0';
        }
    };

    return (
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
            {/* Videos - autoPlay YOK, JS ile kontrollü play */}
            {validVideos.map((video, index) => (
                <video
                    key={`video-${index}`}
                    ref={(el) => (videoRefs.current[index] = el)}
                    src={video}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${isElementVisible('video', index)}`}
                    muted
                    playsInline
                    preload={index === 0 ? 'auto' : 'none'}
                >
                    <source src={video} type="video/mp4" />
                </video>
            ))}

            {/* Logo Video/Image */}
            {logoVideo && (
                <>
                    {logoVideo.match(/\.(mp4|webm|mov)$/i) ? (
                        <video
                            ref={logoRef}
                            src={logoVideo}
                            className={`absolute inset-0 w-full h-full object-contain bg-black/90 transition-opacity duration-1000 ease-in-out ${isElementVisible('logo', 0)}`}
                            muted
                            playsInline
                            preload="none"
                        >
                            <source src={logoVideo} type="video/mp4" />
                        </video>
                    ) : (
                        <div
                            className={`absolute inset-0 w-full h-full bg-black/90 flex items-center justify-center transition-opacity duration-1000 ease-in-out ${isElementVisible('logo', 0)}`}
                        >
                            <img
                                src={logoVideo}
                                alt="Logo"
                                className="max-w-[80%] max-h-[80%] object-contain"
                            />
                        </div>
                    )}
                </>
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
