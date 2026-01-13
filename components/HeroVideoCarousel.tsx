import React, { useState, useEffect, useRef } from 'react';

interface HeroVideoCarouselProps {
    videos: string[];
    logoVideo?: string;
    interval?: number;
}

export const HeroVideoCarousel: React.FC<HeroVideoCarouselProps> = ({
    videos,
    logoVideo,
    interval = 8000 // 8 seconds per video
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [showLogo, setShowLogo] = useState(false);
    const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
    const logoRef = useRef<HTMLVideoElement | null>(null);

    // Filter out empty videos
    const validVideos = videos.filter(v => v && v.trim() !== '');

    // Total items: videos + logo (if exists)
    const totalItems = logoVideo ? validVideos.length + 1 : validVideos.length;

    useEffect(() => {
        if (totalItems === 0) return;

        const timer = setInterval(() => {
            setIsTransitioning(true);

            // After fade out (500ms), change video
            setTimeout(() => {
                const nextIndex = (currentIndex + 1) % totalItems;

                // Check if next is logo
                if (logoVideo && nextIndex === validVideos.length) {
                    setShowLogo(true);
                    // Play logo video
                    if (logoRef.current) {
                        logoRef.current.currentTime = 0;
                        logoRef.current.play().catch(e => console.log('Logo video play error:', e));
                    }
                } else {
                    setShowLogo(false);
                    // Play next video
                    const videoIndex = showLogo ? 0 : nextIndex;
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
        }, interval);

        return () => clearInterval(timer);
    }, [currentIndex, totalItems, interval, logoVideo, validVideos.length, showLogo]);

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
                    loop
                    muted
                    playsInline
                    preload="auto"
                >
                    <source src={video} type="video/mp4" />
                </video>
            ))}

            {/* Logo Video */}
            {logoVideo && (
                <video
                    ref={logoRef}
                    src={logoVideo}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${showLogo && !isTransitioning ? 'opacity-90' : 'opacity-0'
                        }`}
                    muted
                    playsInline
                    preload="auto"
                >
                    <source src={logoVideo} type="video/mp4" />
                </video>
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
