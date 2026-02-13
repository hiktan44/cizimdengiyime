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
    // If logo exists, total items is videos * 2 (Video -> Logo -> Video -> Logo...)
    const totalItems = logoVideo ? validVideos.length * 2 : validVideos.length;

    // Helper to check if current index should show logo
    const isLogoIndex = (index: number) => logoVideo && index % 2 !== 0;

    // Helper to get video index from carousel index
    const getVideoIndex = (index: number) => logoVideo ? Math.floor(index / 2) : index;

    const getCurrentDuration = (index: number): number => {
        if (isLogoIndex(index)) {
            if (logoVideo && logoRef.current && logoVideo.match(/\.(mp4|webm|mov)$/i)) {
                const duration = logoRef.current.duration;
                // If duration is valid use it, otherwise fallback
                return duration && !isNaN(duration) && duration > 0 ? duration * 1000 : logoDisplayDuration;
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
                const videoIndex = getVideoIndex(next);
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
            // console.log(`⏱️ Timer: ${duration}ms (Index: ${currentIndex} - ${isLogoIndex(currentIndex) ? 'Logo' : `Video ${getVideoIndex(currentIndex)}`})`);

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
                const handleLoadedMetadata = () => {
                    setupTimer();
                    video.removeEventListener('loadedmetadata', handleLoadedMetadata);
                };
                video.addEventListener('loadedmetadata', handleLoadedMetadata);
                // Fallback timeout to prevent stuck if metadata never loads
                setTimeout(setupTimer, 2000);
            } else {
                setupTimer();
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
        if (validVideos.length > 0 && videoRefs.current[0] && !isLogoIndex(0)) {
            videoRefs.current[0]!.play().catch(e => console.log('Initial video play error:', e));
        }
    }, [validVideos.length]);

    if (totalItems === 0) {
        return (
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900" />
        );
    }

    const getOpacity = (carouselIndex: number) => {
        // Map logical carousel index (0..totalItems) to view opacity

        let isVisible = false;

        // 1. Is this the current item?
        if (carouselIndex === currentIndex) isVisible = true;

        // 2. Is this the next item transitioning in?
        if (isTransitioning && carouselIndex === nextIndex) isVisible = true;

        // 3. Logic:
        // If we are transitioning:
        //   Current fading out (opacity 0)? No, usually crossfade means overlap. 
        //   Let's keep it simple: Active one 1, Next one 1 (if layered on top).

        // Better:
        // Start: Current 1, Next 0
        // Transition Start: Check transition CSS duration.
        // Actually CSS handles opacity transition.

        if (carouselIndex === currentIndex) {
            return isTransitioning ? 'opacity-0' : 'opacity-100';
        }
        if (carouselIndex === nextIndex) {
            return isTransitioning ? 'opacity-100' : 'opacity-0';
        }
        return 'opacity-0';
    };

    // New helper to determine if a specific video/logo element is visible
    const isElementVisible = (type: 'video' | 'logo', index: number) => {
        // Reverse check: Find which carousel index corresponds to this content
        // For video[i], it matches carousel index: 
        // If logo exists: 2*i
        // If no logo: i

        // For logo, it matches carousel indices: 1, 3, 5... (all odd indices)

        // THIS IS TRICKY because multiple logical indices map to same Logo Element.
        // But we only have ONE logo element in DOM.

        if (type === 'logo') {
            // Logo is visible if current CA index is ODD (Logo mapped)
            // OR if next CA index is ODD and transitioning

            if (!logoVideo) return 'opacity-0';

            const isCurrentLogo = isLogoIndex(currentIndex);
            const isNextLogo = isTransitioning && isLogoIndex(nextIndex);

            if (isCurrentLogo && !isTransitioning) return 'opacity-100'; // Steady state
            if (isCurrentLogo && isTransitioning) return 'opacity-0'; // Fading out
            if (isNextLogo) return 'opacity-100'; // Fading in

            return 'opacity-0';
        } else {
            // Video[i]
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
            {/* Regular Videos */}
            {validVideos.map((video, index) => (
                <video
                    key={`video-${index}`}
                    ref={(el) => (videoRefs.current[index] = el)}
                    src={video}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${isElementVisible('video', index)}`}
                    muted
                    playsInline
                    preload="metadata"
                >
                    <source src={video} type="video/mp4" />
                </video>
            ))}

            {/* Logo Video/Image */}
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
                            preload="metadata"
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
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-transparent to-slate-900 pointer-events-none" />

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
