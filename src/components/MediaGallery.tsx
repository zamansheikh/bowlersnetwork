'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { Play, X, ChevronLeft, ChevronRight, Volume2, VolumeX } from 'lucide-react';

interface MediaGalleryProps {
    media: string[];
    className?: string;
    enableLightbox?: boolean; // New prop to control lightbox functionality
    maxHeight?: string; // New prop to control maximum height for feed posts
}

export default function MediaGallery({ media, className = "", enableLightbox = true, maxHeight }: MediaGalleryProps) {
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);
    const [isMuted, setIsMuted] = useState(true);

    // Determine if we're in a flexible height context (feed) or fixed height context (grid)
    const isFlexibleHeight = !!maxHeight;

    const videoRef = useRef<HTMLVideoElement>(null);

    const toggleMute = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent opening lightbox
        if (videoRef.current) {
            const newMutedState = !isMuted;
            videoRef.current.muted = newMutedState;
            setIsMuted(newMutedState);
        }
    };

    // Auto-play video when in view
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        videoRef.current?.play().catch(() => { });
                    } else {
                        videoRef.current?.pause();
                    }
                });
            },
            { threshold: 0.5 }
        );

        if (videoRef.current) {
            observer.observe(videoRef.current);
        }

        return () => observer.disconnect();
    }, [media]);

    const closeLightbox = useCallback(() => {
        setLightboxOpen(false);
        document.body.style.overflow = 'unset'; // Restore scroll
    }, []);

    const nextMedia = useCallback(() => {
        if (media && media.length > 0) {
            setCurrentMediaIndex((prev) => (prev + 1) % media.length);
        }
    }, [media]);

    const prevMedia = useCallback(() => {
        if (media && media.length > 0) {
            setCurrentMediaIndex((prev) => (prev - 1 + media.length) % media.length);
        }
    }, [media]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (!lightboxOpen || !media || media.length === 0) return;
            
            switch (e.key) {
                case 'Escape':
                    closeLightbox();
                    break;
                case 'ArrowLeft':
                    if (media.length > 1) prevMedia();
                    break;
                case 'ArrowRight':
                    if (media.length > 1) nextMedia();
                    break;
            }
        };

        document.addEventListener('keydown', handleKeyPress);
        return () => document.removeEventListener('keydown', handleKeyPress);
    }, [lightboxOpen, closeLightbox, nextMedia, prevMedia, media]);

    // Early return after all hooks
    if (!media || media.length === 0) {
        if (isFlexibleHeight) {
            return null; // Don't show placeholder in feed context
        }
        return (
            <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-md">
                <div className="text-center text-gray-400">
                    <div className="w-8 h-8 mx-auto mb-2 opacity-30">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                        </svg>
                    </div>
                    <p className="text-xs">No media</p>
                </div>
            </div>
        );
    }

    // Helper function to check if a media URL is a video
    const isVideo = (url: string): boolean => {
        return url.toLowerCase().includes('.mp4') || 
               url.toLowerCase().includes('.webm') || 
               url.toLowerCase().includes('.mov') || 
               url.toLowerCase().includes('.avi') ||
               url.toLowerCase().includes('.mkv');
    };

    const openLightbox = (index: number) => {
        if (!enableLightbox) return; // Don't open lightbox if disabled
        setCurrentMediaIndex(index);
        setLightboxOpen(true);
        document.body.style.overflow = 'hidden'; // Prevent background scroll
    };

    // Touch/swipe navigation
    const minSwipeDistance = 50;

    const onTouchStart = (e: React.TouchEvent) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe && media.length > 1) {
            nextMedia();
        }
        if (isRightSwipe && media.length > 1) {
            prevMedia();
        }
    };

    // Component to render a single media item
    const renderMediaItem = (mediaUrl: string, index: number, className: string) => {
        const baseStyles = `relative ${className} transition-opacity`;
        const clickableStyles = enableLightbox ? 'cursor-pointer hover:opacity-95' : '';
        const combinedStyles = `${baseStyles} ${clickableStyles}`;

        if (isVideo(mediaUrl)) {
            // Only autoplay the first item if it is a video (index === 0)
            const isFirstVideo = index === 0;

            return (
                <div
                    key={index}
                    className={combinedStyles}
                    onClick={enableLightbox ? () => openLightbox(index) : undefined}
                >
                    <video
                        ref={isFirstVideo ? videoRef : null}
                        src={mediaUrl}
                        className="w-full h-full object-cover rounded-md border border-green-200"
                        muted={isMuted}
                        loop
                        playsInline
                        preload="metadata"
                    />
                    
                    {/* Mute/Unmute Toggle for the first video */}
                    {isFirstVideo && (
                        <button
                            onClick={toggleMute}
                            className="absolute bottom-3 right-3 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all z-10"
                        >
                            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                        </button>
                    )}

                    {/* Show play icon only for non-autoplay videos (index > 0) */}
                    {!isFirstVideo && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded-md">
                            <div className="w-10 h-10 bg-white bg-opacity-90 rounded-full flex items-center justify-center hover:bg-opacity-100 transition-opacity">
                                <Play className="w-5 h-5 text-gray-800 ml-0.5" />
                            </div>
                        </div>
                    )}
                </div>
            );
        } else {
            return (
                <Image
                    key={index}
                    src={mediaUrl}
                    alt={`Post content ${index + 1}`}
                    width={500}
                    height={300}
                    className={`${className} object-cover rounded-md border border-green-200 transition-opacity ${clickableStyles}`}
                    onClick={enableLightbox ? () => openLightbox(index) : undefined}
                />
            );
        }
    };

    const renderSingleMedia = () => {
        if (isFlexibleHeight) {
            return (
                <div className="relative w-full max-h-[400px] overflow-hidden">
                    {renderMediaItem(media[0], 0, "w-full h-auto max-h-[400px]")}
                </div>
            );
        }
        return (
            <div className="relative w-full h-full">
                {renderMediaItem(media[0], 0, "w-full h-full")}
            </div>
        );
    };

    const renderTwoMedia = () => {
        const heightClass = isFlexibleHeight ? "h-60" : "h-full";
        return (
            <div className={`grid grid-cols-2 gap-1 ${heightClass}`}>
                {media.slice(0, 2).map((mediaUrl, index) => 
                    renderMediaItem(mediaUrl, index, `w-full ${heightClass}`)
                )}
            </div>
        );
    };

    const renderThreeMedia = () => {
        const heightClass = isFlexibleHeight ? "h-60" : "h-full";
        return (
            <div className={`grid grid-cols-2 gap-1 ${heightClass}`}>
                {renderMediaItem(media[0], 0, `w-full ${heightClass}`)}
                <div className={`grid grid-rows-2 gap-1 ${heightClass}`}>
                    {media.slice(1, 3).map((mediaUrl, index) => 
                        renderMediaItem(mediaUrl, index + 1, `w-full ${heightClass}`)
                    )}
                </div>
            </div>
        );
    };

    const renderFourMedia = () => {
        const heightClass = isFlexibleHeight ? "h-60" : "h-full";
        return (
            <div className={`grid grid-cols-2 grid-rows-2 gap-1 ${heightClass}`}>
                {media.slice(0, 4).map((mediaUrl, index) => 
                    renderMediaItem(mediaUrl, index, `w-full ${heightClass}`)
                )}
            </div>
        );
    };

    const renderFiveOrMoreMedia = () => {
        const remainingCount = media.length - 4;
        const heightClass = isFlexibleHeight ? "h-60" : "h-full";
        
        return (
            <div className={`grid grid-cols-2 grid-rows-2 gap-1 ${heightClass}`}>
                {media.slice(0, 3).map((mediaUrl, index) => 
                    renderMediaItem(mediaUrl, index, `w-full ${heightClass}`)
                )}
                <div className={`relative w-full ${heightClass}`}>
                    {renderMediaItem(media[3], 3, `w-full ${heightClass}`)}
                    {remainingCount > 0 && (
                        <div 
                            className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center rounded-md cursor-pointer hover:bg-opacity-70 transition-opacity border border-green-200"
                            onClick={() => openLightbox(3)}
                        >
                            <span className="text-white text-sm font-semibold">
                                +{remainingCount}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const renderMediaGrid = () => {
        const count = media.length;
        
        if (count === 1) return renderSingleMedia();
        if (count === 2) return renderTwoMedia();
        if (count === 3) return renderThreeMedia();
        if (count === 4) return renderFourMedia();
        return renderFiveOrMoreMedia();
    };

    return (
        <>
            <div className={`w-full ${isFlexibleHeight ? '' : 'h-full'} ${className}`}>
                {renderMediaGrid()}
            </div>

            {/* Lightbox - Only render if enableLightbox is true */}
            {enableLightbox && lightboxOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50"
                    onTouchStart={onTouchStart}
                    onTouchMove={onTouchMove}
                    onTouchEnd={onTouchEnd}
                >
                    <div className="relative max-w-5xl max-h-full p-4 w-full h-full flex items-center justify-center">
                        {isVideo(media[currentMediaIndex]) ? (
                            <video
                                src={media[currentMediaIndex]}
                                controls
                                autoPlay
                                className="max-w-full max-h-full object-contain rounded-lg"
                            />
                        ) : (
                            <Image
                                src={media[currentMediaIndex]}
                                alt={`Post content ${currentMediaIndex + 1}`}
                                width={800}
                                height={600}
                                className="max-w-full max-h-full object-contain rounded-lg"
                            />
                        )}
                        
                        {/* Close button - Improved styling */}
                        <button
                            onClick={closeLightbox}
                            className="absolute top-4 right-4 w-12 h-12 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full flex items-center justify-center transition-all duration-200 backdrop-blur-sm border border-white border-opacity-20"
                            aria-label="Close"
                        >
                            <X className="w-6 h-6" />
                        </button>
                        
                        {/* Navigation arrows - Improved styling */}
                        {media.length > 1 && (
                            <>
                                <button
                                    onClick={prevMedia}
                                    className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full flex items-center justify-center transition-all duration-200 backdrop-blur-sm border border-white border-opacity-20"
                                    aria-label="Previous"
                                >
                                    <ChevronLeft className="w-6 h-6" />
                                </button>
                                <button
                                    onClick={nextMedia}
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full flex items-center justify-center transition-all duration-200 backdrop-blur-sm border border-white border-opacity-20"
                                    aria-label="Next"
                                >
                                    <ChevronRight className="w-6 h-6" />
                                </button>
                            </>
                        )}
                        
                        {/* Media counter - Improved styling */}
                        {media.length > 1 && (
                            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm border border-white border-opacity-20">
                                {currentMediaIndex + 1} / {media.length}
                            </div>
                        )}

                        {/* Swipe instruction for mobile */}
                        {media.length > 1 && (
                            <div className="absolute bottom-6 right-6 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-xs backdrop-blur-sm border border-white border-opacity-20 md:hidden">
                                Swipe to navigate
                            </div>
                        )}

                        {/* Keyboard instruction for desktop */}
                        {media.length > 1 && (
                            <div className="absolute bottom-6 left-6 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-xs backdrop-blur-sm border border-white border-opacity-20 hidden md:block">
                                Use ← → keys or click arrows
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
