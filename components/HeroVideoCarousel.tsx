import React, { useState, useEffect, useRef } from 'react';

interface HeroVideoCarouselProps {
    videos: string[];
    logoVideo?: string;
    logoDisplayDuration?: number;
}

export const HeroVideoCarousel: React.FC<HeroVideoCarouselProps> = ({
    videos,
    logoVideo,
    logoDisplayDuration = 5000
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [nextIndex, setNextIndex] = useState(-1);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
    const logoRef = useRef<HTMLVideoElement | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const validVideos = videos.filter(v => v && v.trim() !== '');
    const totalItems = logoVideo ? validVideos.length + 1 : validVideos.length;

    const isLogoIndex = (index: number) => logoVideo && index === validVideos.length;

    const getCurrentDuration = (index: number): number => {
        if (isLogoIndex(index)) {
            if (logoVideo && logoRef.current && logoVideo.match(/\.(mp4|webm|mov)$/i)) {
                const duration = logoRef.current.duration;
                return duration && !isNaN(duration) && duration > 0 ? duration * 1000 : logoDisplayDuration;
            }
            return logoDisplayDuration;
        } else {
            const videoIndex = index >= validVideos.length ? 0 : index;
            const videoElement = videoRefs.current[videoIndex];
            if (videoElement && videoElement.duration && !isNaN(videoElement.duration) && videoElement.duration > 0) {
                return videoElement.duration * 1000;
            }
            return 8000;
        }
    };

    const transitionToNext = () => {
        const next = (currentIndex + 1) % totalItems;
        setNextIndex(next);
        setIsTransitioning(true);

        // Start fading out current and fading in next
        setTimeout(() => {
            setCurrentIndex(next);
            setNextIndex(-1);
            setIsTransitioning(false);

            // Play next video/logo
            if (isLogoIndex(next)) {
                if (logoRef.current && logoVideo?.match(/\.(mp4|webm|mov)$/i)) {
                    logoRef.current.currentTime = 0;
                    logoRef.current.play().catch(e => console.log('Logo video play error:', e));
                }
            } else {
                const videoIndex = next >= validVideos.length ? 0 : next;
                if (videoRefs.current[videoIndex]) {
                    videoRefs.current[videoIndex]!.currentTime = 0;
                    videoRefs.current[videoIndex]!.play().catch(e => console.log('Video play error:', e));
                }
            }
        }, 1000); // 1 second crossfade
    };

    useEffect(() => {
        if (totalItems === 0) return;

        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }

        const setupTimer = () => {
            const duration = getCurrentDuration(currentIndex);
            console.log(`⏱️ Timer: ${duration}ms (${isLogoIndex(currentIndex) ? 'Logo' : `Video ${currentIndex + 1}`})`);

            timerRef.current = setTimeout(() => {
                transitionToNext();
            }, duration);
        };

        if (!isLogoIndex(currentIndex) && videoRefs.current[currentIndex]) {
            const video = videoRefs.current[currentIndex];
            if (video && video.readyState >= 1) {
                setupTimer();
            } else if (video) {
                const handleLoadedMetadata = () => {
                    setupTimer();
                    video.removeEventListener('loadedmetadata', handleLoadedMetadata);
                };
                video.addEventListener('loadedmetadata', handleLoadedMetadata);
                setTimeout(setupTimer, 1000);
            }
        } else {
            setupTimer();
        }

        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, [currentIndex, totalItems]);

    useEffect(() => {
        if (validVideos.length > 0 && videoRefs.current[0]) {
            videoRefs.current[0]!.play().catch(e => console.log('Initial video play error:', e));
        }
    }, [validVideos.length]);

    if (totalItems === 0) {
        return (
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900" />
        );
    }

    const getOpacity = (index: number) => {
        if (isTransitioning) {
            if (index === currentIndex) return 'opacity-0';
            if (index === nextIndex) return 'opacity-80';
            return 'opacity-0';
        }
        return index === currentIndex ? 'opacity-80' : 'opacity-0';
    };

    return (
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
            {/* Regular Videos */}
            {validVideos.map((video, index) => (
                <video
                    key={`video-${index}`}
                    ref={(el) => (videoRefs.current[index] = el)}
                    src={video}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${getOpacity(index)}`}
                    muted
                    playsInline
                    preload="metadata"
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
                            className={`absolute inset-0 w-full h-full object-contain bg-black/90 transition-opacity duration-1000 ease-in-out ${getOpacity(validVideos.length)}`}
                            muted
                            playsInline
                            preload="metadata"
                        >
                            <source src={logoVideo} type="video/mp4" />
                        </video>
                    ) : (
                        <div
                            className={`absolute inset-0 w-full h-full bg-black/90 flex items-center justify-center transition-opacity duration-1000 ease-in-out ${getOpacity(validVideos.length)}`}
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
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-transparent to-slate-900 pointer-events-none" />

            {/* Progress Indicators */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
                {Array.from({ length: totalItems }).map((_, index) => (
                    <div
                        key={index}
                        className={`h-1 rounded-full transition-all duration-500 ${index === currentIndex
                                ? 'w-12 bg-white'
                                : 'w-8 bg-white/30'
                            }`}
                    />
                ))}
            </div>
        </div>
    );
};
