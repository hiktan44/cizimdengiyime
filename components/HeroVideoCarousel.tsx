import React, { useState, useEffect, useRef } from 'react';

interface HeroVideoCarouselProps {
    videos: string[];
    logoVideo?: string;
    logoDisplayDuration?: number; // Logo için özel süre (ms), default 5000
}

export const HeroVideoCarousel: React.FC<HeroVideoCarouselProps> = ({
    videos,
    logoVideo,
    logoDisplayDuration = 5000 // 5 seconds for logo/image
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [showLogo, setShowLogo] = useState(false);
    const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
    const logoRef = useRef<HTMLVideoElement | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Filter out empty videos
    const validVideos = videos.filter(v => v && v.trim() !== '');

    // Total items: videos + logo (if exists)
    const totalItems = logoVideo ? validVideos.length + 1 : validVideos.length;

    // Get duration of current video or use logo duration
    const getCurrentDuration = (): number => {
        if (showLogo) {
            // For logo, check if it's a video or image
            if (logoVideo && logoRef.current && logoVideo.match(/\.(mp4|webm|mov)$/i)) {
                const duration = logoRef.current.duration;
                // If duration is available and valid, use it; otherwise use default
                return duration && !isNaN(duration) && duration > 0 ? duration * 1000 : logoDisplayDuration;
            }
            // For images, use the specified duration
            return logoDisplayDuration;
        } else {
            // For regular videos
            const videoIndex = currentIndex >= validVideos.length ? 0 : currentIndex;
            const videoElement = videoRefs.current[videoIndex];
            if (videoElement && videoElement.duration && !isNaN(videoElement.duration) && videoElement.duration > 0) {
                return videoElement.duration * 1000; // Convert to milliseconds
            }
            // Fallback duration if video duration not available yet
            return 8000;
        }
    };

    const transitionToNext = () => {
        setIsTransitioning(true);

        // After fade out (500ms), change video
        setTimeout(() => {
            const nextIndex = (currentIndex + 1) % totalItems;

            // Check if next is logo
            if (logoVideo && nextIndex === validVideos.length) {
                setShowLogo(true);
                // Play logo video if it's a video
                if (logoRef.current && logoVideo.match(/\.(mp4|webm|mov)$/i)) {
                    logoRef.current.currentTime = 0;
                    logoRef.current.play().catch(e => console.log('Logo video play error:', e));
                }
            } else {
                setShowLogo(false);
                // Play next video
                const videoIndex = nextIndex >= validVideos.length ? 0 : nextIndex;
                if (videoRefs.current[videoIndex]) {
                    videoRefs.current[videoIndex]!.currentTime = 0;
                    videoRefs.current[videoIndex]!.play().catch(e => console.log('Video play error:', e));
                }
            }

            setCurrentIndex(nextIndex);

            // Fade in
            setTimeout(() => {
                setIsTransitioning(false);
            }, 100);
        }, 500);
    };

    // Setup timer based on current video/logo duration
    useEffect(() => {
        if (totalItems === 0) return;

        // Clear existing timer
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }

        // Wait a bit for video metadata to load
        const setupTimer = () => {
            const duration = getCurrentDuration();
            console.log(`⏱️ Setting timer for ${duration}ms (${showLogo ? 'Logo' : `Video ${currentIndex + 1}`})`);

            timerRef.current = setTimeout(() => {
                transitionToNext();
            }, duration);
        };

        // If it's a video, wait for metadata to be loaded
        if (!showLogo && videoRefs.current[currentIndex]) {
            const video = videoRefs.current[currentIndex];
            if (video && video.readyState >= 1) {
                // Metadata already loaded
                setupTimer();
            } else if (video) {
                // Wait for metadata
                const handleLoadedMetadata = () => {
                    setupTimer();
                    video.removeEventListener('loadedmetadata', handleLoadedMetadata);
                };
                video.addEventListener('loadedmetadata', handleLoadedMetadata);

                // Fallback timeout
                setTimeout(setupTimer, 1000);
            }
        } else {
            // For logo or when video ref not ready
            setupTimer();
        }

        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, [currentIndex, showLogo, totalItems]);

    // Preload and play first video on mount
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

    return (
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
            {/* Regular Videos */}
            {validVideos.map((video, index) => (
                <video
                    key={`video-${index}`}
                    ref={(el) => (videoRefs.current[index] = el)}
                    src={video}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${!showLogo && currentIndex === index && !isTransitioning
                            ? 'opacity-80'
                            : 'opacity-0'
                        }`}
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
                        // Logo is a video
                        <video
                            ref={logoRef}
                            src={logoVideo}
                            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${showLogo && !isTransitioning ? 'opacity-90' : 'opacity-0'
                                }`}
                            muted
                            playsInline
                            preload="metadata"
                        >
                            <source src={logoVideo} type="video/mp4" />
                        </video>
                    ) : (
                        // Logo is an image
                        <div
                            className={`absolute inset-0 w-full h-full transition-opacity duration-500 ${showLogo && !isTransitioning ? 'opacity-90' : 'opacity-0'
                                }`}
                        >
                            <img
                                src={logoVideo}
                                alt="Logo"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}
                </>
            )}

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-transparent to-slate-900 pointer-events-none" />

            {/* Transition Overlay - Creates smooth fade effect */}
            <div
                className={`absolute inset-0 bg-black transition-opacity duration-500 pointer-events-none ${isTransitioning ? 'opacity-50' : 'opacity-0'
                    }`}
            />

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
