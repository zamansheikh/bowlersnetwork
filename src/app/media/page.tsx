'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Play, Mic, Camera, Trophy, Star, ChevronRight, Upload, Loader, 
  AlertCircle, Heart, ChevronDown, ChevronUp, MessageCircle, Share2, 
  Volume2, VolumeX, ImageIcon, ArrowLeft, ArrowUpCircle
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import axios from 'axios';
import { useSearchParams } from 'next/navigation';

const BASE_URL = 'https://test.bowlersnetwork.com';

// --- Types ---
interface ProVideo {
  id: number;
  uid: string;
  title: string;
  description: string;
  thumbnail_url: string;
  video_url?: string;
  url?: string; // Splits uses 'url', Videos might use this too
  duration: number;
  duration_str: string;
  views_count: number;
  likes_count: number;
  comments_count?: number;
  comments?: any[];
  created_at: string;
  uploaded?: string; // Formatted date string
  pro_player: {
    uid: string;
    name: string;
    avatar_url: string;
    username: string;
  };
  video_type: string;
  viewer_liked?: boolean;
}

// --- Sub-Component: AutoPlay Video Card ---
const AutoPlayVideoCard = ({ video }: { video: ProVideo }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    setIsTouch(window.matchMedia('(pointer: coarse)').matches);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.6 } 
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const shouldPlay = isTouch ? isInView : isHovered;
    
    if (shouldPlay) {
        if (videoRef.current && videoRef.current.paused) {
            videoRef.current.play()
                .then(() => setIsPlaying(true))
                .catch(() => setIsPlaying(false));
        }
    } else {
        if (videoRef.current && !videoRef.current.paused) {
            videoRef.current.pause();
            videoRef.current.currentTime = 0;
            setIsPlaying(false);
        }
    }
  }, [isTouch, isInView, isHovered]);

  return (
    <Link
      href={`/media/videos/${video.uid}`}
      className="bg-gray-900 rounded-lg overflow-hidden hover:bg-gray-800 transition-all duration-200 transform hover:scale-105 cursor-pointer group block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div ref={containerRef} className="relative h-40">
        <video
           ref={videoRef}
           src={video.video_url || video.url}
           muted
           loop
           playsInline
           className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${isPlaying ? 'opacity-100' : 'opacity-0'}`}
        />
        <img
          src={video.thumbnail_url || '/thumbnail.svg'}
          alt={video.title}
          loading="lazy"
          onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/thumbnail.svg'; }}
          className={`w-full h-full object-cover transition-opacity duration-300 ${isPlaying ? 'opacity-0' : 'opacity-100'}`}
        />
        
        {/* Play Icon Overlays - Hide when playing */}
        <div className={`absolute inset-0 bg-gradient-to-br from-green-600/30 to-emerald-700/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none ${isPlaying ? '!opacity-0' : ''}`}>
           <Play className="w-12 h-12 text-white/80 group-hover:scale-110 transition-transform" />
        </div>
        
        <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
          {video.duration_str}
        </div>
        
        {video.viewer_liked && (
          <div className="absolute bottom-2 right-2 bg-red-600 text-white p-1.5 rounded-full">
            <Heart className="w-4 h-4 fill-current" />
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h4 className="text-white font-semibold mb-2 line-clamp-2 group-hover:text-green-400 transition-colors">
          {video.title}
        </h4>
        <p className="text-gray-400 text-sm line-clamp-2 mb-2">{video.description}</p>
        <div className="flex items-center justify-between">
          <p className="text-gray-500 text-xs">{video.uploaded}</p>
          {(video.likes_count !== undefined && video.likes_count > 0) && (
            <div className="flex items-center gap-1 text-gray-400 text-xs">
              <Heart className={`w-3 h-3 ${video.viewer_liked ? 'text-red-500 fill-current' : ''}`} />
              <span>{video.likes_count}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

// --- Sub-Component: Featured AutoPlay Video Card ---
const FeaturedAutoPlayVideo = ({ video }: { video: ProVideo }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    setIsTouch(window.matchMedia('(pointer: coarse)').matches);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.6 } 
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const shouldPlay = isTouch ? isInView : isHovered;
    
    if (shouldPlay) {
        if (videoRef.current && videoRef.current.paused) {
            videoRef.current.play()
                .then(() => setIsPlaying(true))
                .catch(() => setIsPlaying(false));
        }
    } else {
        if (videoRef.current && !videoRef.current.paused) {
            videoRef.current.pause();
            videoRef.current.currentTime = 0;
            setIsPlaying(false);
        }
    }
  }, [isTouch, isInView, isHovered]);

  return (
    <div className="bg-gray-900 rounded-lg overflow-hidden shadow-2xl">
      <div 
        ref={containerRef} 
        className="relative h-96 md:h-[500px]"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Link href={`/media/videos/${video.uid}`} className="absolute inset-0 block group">
          <video
             ref={videoRef}
             src={video.video_url || video.url}
             muted
             loop
             playsInline
             className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${isPlaying ? 'opacity-100' : 'opacity-0'}`}
          />
          <img
            src={video.thumbnail_url || '/thumbnail.svg'}
            alt={video.title}
            loading="lazy"
            onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/thumbnail.svg'; }}
            className={`w-full h-full object-cover transition-opacity duration-300 ${isPlaying ? 'opacity-0' : 'opacity-100'}`}
          />
          
          <div className={`absolute inset-0 bg-black/10 group-hover:bg-black/30 flex items-center justify-center pointer-events-none transition-all duration-300 ${isPlaying ? '!bg-transparent' : ''}`}>
            <div className={`text-center text-white px-6 transition-opacity duration-300 ${isPlaying ? 'opacity-0' : 'opacity-100'}`}>
              <div className="w-24 h-24 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4 scale-100 transition-transform duration-300">
                <Play className="w-12 h-12 text-white ml-1 opacity-80 group-hover:opacity-100 transition-opacity" />
              </div>
              <h3 className="text-2xl font-bold mb-2 line-clamp-2">{video.title}</h3>
              <p className="text-gray-300 line-clamp-3">{video.description}</p>
              <button className="mt-4 bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-medium transition-colors pointer-events-auto">
                Watch Now
              </button>
            </div>
          </div>
        </Link>
      </div>
      <div className="p-6 text-white bg-gray-900">
          <h4 className="text-xl font-bold mb-2">{video.title}</h4>
          <p className="text-gray-300">{video.description}</p>
      </div>
    </div>
  );
};

// --- Sub-Component: Videos Tab ---
const VideosTab = () => {
  const [proVideos, setProVideos] = useState<ProVideo[]>([]);
  const [isLoadingVideos, setIsLoadingVideos] = useState(true);
  const [videoError, setVideoError] = useState<string | null>(null);

  // Fetch Pro videos on component mount
  useEffect(() => {
    const fetchProVideos = async () => {
      setIsLoadingVideos(true);
      setVideoError(null);
      try {
        const response = await axios.get<ProVideo[]>(
          `${BASE_URL}/api/tube/large-vidoes/feed`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
              'Content-Type': 'application/json',
            },
          }
        );
        const proVideos = response.data.filter(video => video.video_type === 'Large');
        setProVideos(proVideos || []);
      } catch (error) {
        console.error('Error fetching pro videos:', error);
        setVideoError('Failed to load pro videos. Please try again later.');
      } finally {
        setIsLoadingVideos(false);
      }
    };

    fetchProVideos();
  }, []);

  const featuredVideo = proVideos.length > 0 ? proVideos[0] : null;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0a0a0a' }}>
      {/* Header with Trending Title */}
      <div className="relative">
        <div className="h-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-400"></div>
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
          <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500 opacity-20 transform -skew-x-12 -translate-x-20 -translate-y-20"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-400 opacity-20 transform skew-x-12 translate-x-20 -translate-y-20"></div>

          <div className="relative z-10 flex flex-col items-center justify-center h-full px-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-16 h-16 bg-black bg-opacity-80 rounded-full flex items-center justify-center">
                <Image
                  src="/logo/logo_for_dark.png"
                  alt="Bowlers Network"
                  width={32}
                  height={32}
                  unoptimized
                  className="rounded"
                />
              </div>
              <div className="text-white">
                <h1 className="text-3xl font-bold tracking-wider">TRENDING ON BOWLERS NETWORK</h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Media Content Section */}
      <div className="px-4 py-6 bg-linear-to-r from-green-600 to-emerald-600 border-b border-green-700">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-green-700 bg-opacity-80 rounded-lg flex items-center justify-center">
                  <Camera className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">Share Your Moment</h2>
              </div>
            </div>
            <div className="flex gap-3 items-center">
              <Link
                href="/media/upload"
                className="inline-flex items-center gap-2 bg-white text-green-600 hover:bg-green-50 px-6 py-3 rounded-lg transition-all font-semibold shadow-lg hover:shadow-xl shrink-0"
              >
                <Upload className="w-5 h-5" />
                Upload Video
              </Link>
              <Link
                href="/media/my-media"
                className="inline-flex items-center gap-2 bg-white text-green-600 hover:bg-green-50 px-6 py-3 rounded-lg transition-all font-semibold shadow-lg hover:shadow-xl shrink-0"
              >
                <Loader className="w-5 h-5" />
                My Media
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Video Section */}
      <div className="px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {isLoadingVideos ? (
             <div className="bg-gray-900 rounded-lg overflow-hidden shadow-2xl animate-pulse">
                <div className="h-96 md:h-[500px] bg-gray-800 flex items-center justify-center">
                    <Loader className="w-12 h-12 text-green-600 animate-spin" />
                </div>
                 <div className="p-6">
                    <div className="h-6 bg-gray-800 rounded w-1/3 mb-4"></div>
                    <div className="h-4 bg-gray-800 rounded w-2/3"></div>
                 </div>
             </div>
          ) : featuredVideo ? (
             <FeaturedAutoPlayVideo video={featuredVideo} />
          ) : null}
        </div>
      </div>

      {/* Pro Videos Section */}
      <div className="px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-2xl font-bold text-white mb-6 tracking-wide">Pro</h3>

          {videoError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm">{videoError}</p>
            </div>
          )}

          {isLoadingVideos ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader className="w-12 h-12 text-green-600 animate-spin mx-auto mb-2" />
                <p className="text-gray-400">Loading pro videos...</p>
              </div>
            </div>
          ) : proVideos.length === 0 ? (
            <div className="text-center py-12 bg-gray-900 rounded-lg">
              <Play className="w-12 h-12 text-gray-500 mx-auto mb-2" />
              <p className="text-gray-400">No videos available yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {proVideos.map((video) => (
                <AutoPlayVideoCard key={video.uid} video={video} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-500 text-sm">
            © 2025 Bowlers Network. All Rights Reserved. | Powered by Bowlers Network
          </p>
        </div>
      </div>
    </div>
  );
};

// --- Sub-Component: Splits Tab ---

// Helper components for Splits
interface ActionButtonProps {
  label: string;
  count?: number;
  active?: boolean;
  onClick?: () => void;
  icon: React.ReactNode;
  variant?: 'default' | 'primary';
}

function getActionClasses(variant: 'default' | 'primary', active?: boolean) {
  if (variant === 'primary') {
    return 'w-full flex flex-col items-center gap-2 rounded-2xl px-4 py-3 transition-all backdrop-blur bg-green-600 text-white hover:bg-green-500';
  }
  if (active) {
    return 'w-full flex flex-col items-center gap-2 rounded-2xl px-4 py-3 transition-all backdrop-blur bg-red-600 text-white';
  }
  return 'w-full flex flex-col items-center gap-2 rounded-2xl px-4 py-3 transition-all backdrop-blur bg-white/5 text-gray-200 hover:bg-white/10';
}

const ActionCard = ({ label, count, icon }: { label: string; count?: number; icon: React.ReactNode }) => (
  <>
    <span className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center">
      {icon}
    </span>
    <div className="text-center">
      <p className="text-sm font-medium">{label}</p>
      {typeof count === 'number' && (
        <p className="text-xs text-gray-400">{count}</p>
      )}
    </div>
  </>
);

function ActionButton({ label, count, active, onClick, icon, variant = 'default' }: ActionButtonProps) {
  return (
    <button onClick={onClick} className={getActionClasses(variant, active)}>
      <ActionCard label={label} count={count} icon={icon} />
    </button>
  );
}

interface ActionLinkProps extends Omit<ActionButtonProps, 'onClick'> {
  href: string;
}

function ActionLink({ href, label, count, icon, variant = 'default', active }: ActionLinkProps) {
  return (
    <Link href={href} className={getActionClasses(variant, active)}>
      <ActionCard label={label} count={count} icon={icon} />
    </Link>
  );
}

interface SplitsTabProps {
  onBack?: () => void;
}

const SplitsTab = ({ onBack }: SplitsTabProps) => {
  const [splits, setSplits] = useState<ProVideo[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [likedSplits, setLikedSplits] = useState<Set<number>>(new Set());
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showSwipeHint, setShowSwipeHint] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const touchStartY = useRef<number | null>(null);

  // Show swipe hint for 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowSwipeHint(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(() => { });
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMuted(prev => !prev);
  }

  // Fetch splits (using same API as video feed)
  useEffect(() => {
    const fetchSplits = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await axios.get<ProVideo[]>(
          `${BASE_URL}/api/tube/large-vidoes/feed`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
              'Content-Type': 'application/json',
            },
          }
        );
        const splitVideos = response.data.filter(video => video.video_type === 'Split');
        setSplits(splitVideos || []);
        // Initialize liked splits based on viewer_liked
        const initialLiked = new Set<number>();
        splitVideos?.forEach((video) => {
          if (video.viewer_liked) {
            initialLiked.add(video.id);
          }
        });
        setLikedSplits(initialLiked);
      } catch (err) {
        console.error('Error fetching splits:', err);
        setError('Failed to load splits. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSplits();
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') {
        handlePrevious();
      } else if (e.key === 'ArrowDown') {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentIndex, splits.length]);

  // Auto-play video when it comes into view
  useEffect(() => {
    if (videoRef.current && splits.length > 0) {
      setCurrentTime(0);
      setDuration(0);
      setIsPlaying(true);
      // Fallback for url property variations
      videoRef.current.src = splits[currentIndex].video_url || splits[currentIndex].url || '';
      videoRef.current.play().catch(() => {
        // Auto-play might be blocked, user can click to play
        setIsPlaying(false);
      });
    }
  }, [currentIndex, splits]);

  // Track progress updates
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime || 0);
    const handleLoaded = () => setDuration(video.duration || 0);

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoaded);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoaded);
    };
  }, [currentIndex]);

  const handleNext = () => {
    if (currentIndex < splits.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleLike = async () => {
    if (splits.length === 0) return;

    const currentSplit = splits[currentIndex];
    try {
      const response = await axios.get(
        `${BASE_URL}/api/tube/large-videos/like/${currentSplit.id}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const isLikedResponse = response.data.is_liked;
      setLikedSplits(prev => {
        const updated = new Set(prev);
        if (isLikedResponse) {
          updated.add(currentSplit.id);
        } else {
          updated.delete(currentSplit.id);
        }
        return updated;
      });

      // Update visible like count optimistically
      setSplits(prev =>
        prev.map((video, idx) =>
          idx === currentIndex
            ? {
              ...video,
              likes_count: response.data.likes_count ?? video.likes_count,
              viewer_liked: isLikedResponse,
            }
            : video
        )
      );
    } catch (err) {
      console.error('Error liking short:', err);
    }
  };

  const handleShare = async () => {
    const currentSplit = splits[currentIndex];
    const shareData = {
      title: currentSplit.title,
      text: currentSplit.description,
      url: `${window.location.origin}/media/videos/${currentSplit.uid}`,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('Share cancelled or failed:', err);
      }
    } else {
      await navigator.clipboard.writeText(shareData.url);
      alert('Link copied to clipboard!');
    }
  };

  const progressPercentage = duration ? Math.min((currentTime / duration) * 100, 100) : 0;

  const formatTime = (time: number) => {
    if (!time || Number.isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSwipeStart = (y: number) => {
    touchStartY.current = y;
  };

  const handleSwipeEnd = (y: number) => {
    if (touchStartY.current === null) return;
    const delta = y - touchStartY.current;
    if (Math.abs(delta) > 50) {
      if (delta > 0) {
        handlePrevious();
      } else {
        handleNext();
      }
    }
    touchStartY.current = null;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    handleSwipeStart(e.touches[0].clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    handleSwipeEnd(e.changedTouches[0].clientY);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    handleSwipeStart(e.clientY);
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    handleSwipeEnd(e.clientY);
  };

  if (isLoading) {
    return (
      <div className="w-full h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-green-600 animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Loading Splits...</p>
        </div>
      </div>
    );
  }

  if (error || splits.length === 0) {
    return (
      <div className="w-full min-h-screen bg-black flex flex-col">
        {/* Mobile/Desktop Header for Splits */}
        <div className="w-full px-4 py-4 flex items-center justify-between bg-black/90 backdrop-blur-sm sticky top-0 z-50">
          <div className="flex items-center gap-4">
            {/* Back Button (Mobile Only) */}
            <button 
              onClick={onBack}
              className="md:hidden p-2 -ml-2 text-white hover:bg-white/10 rounded-full transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-bold text-white hidden md:block">Splits</h2>
          </div>
          
          <div className="flex gap-4 items-center">
            <Link
              href="/media/upload-video"
              className="text-white hover:text-green-400 transition-colors p-2"
              title="Upload Split"
            >
              <Upload className="w-6 h-6" />
            </Link>
            <Link
              href="/media/my-media"
              className="text-white hover:text-green-400 transition-colors p-2"
               title="My Splits"
            >
              <Loader className="w-6 h-6" />
            </Link>
          </div>
        </div>

        {/* Error Message */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-white">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-lg mb-4">{error || 'No splits available'}</p>
          </div>
        </div>
      </div>
    );
  }

  const currentSplit = splits[currentIndex];
  const isLiked = likedSplits.has(currentSplit.id);

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col">
      {/* Mobile/Desktop Header for Splits */}
      <div className="w-full px-4 py-4 flex items-center justify-between bg-black/90 backdrop-blur-sm sticky top-0 z-50 border-b border-gray-800/50">
        <div className="flex items-center gap-4">
          {/* Back Button (Visible on all screens in full screen mode) */}
          <button 
            onClick={onBack}
            className="p-2 -ml-2 text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          
          <div className="flex items-center gap-2">
            <div className="md:hidden w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
               <Camera className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white hidden md:block">Splits</h2>
          </div>
        </div>
        
        <div className="flex gap-2 items-center">
          <Link
            href="/media/upload-video"
             className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full transition-all text-sm font-medium backdrop-blur-sm"
          >
            <Upload className="w-4 h-4" />
            <span className="hidden md:inline">Upload</span>
          </Link>
          <Link
            href="/media/my-media"
             className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full transition-all text-sm font-medium backdrop-blur-sm"
          >
            <Loader className="w-4 h-4" />
             <span className="hidden md:inline">My Splits</span>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden bg-gradient-to-b from-gray-950 via-gray-900 to-black text-white">
        <div className="h-full max-w-6xl mx-auto px-4 py-4 flex flex-col lg:flex-row gap-6 overflow-hidden">
          {/* Left section: context + video */}
          <div className="flex-1 flex flex-col items-center overflow-hidden">
            {/* Header */}
            <div className="w-full max-w-xl flex items-center justify-between mb-4 shrink-0">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Now Playing</p>
                <h1 className="text-2xl font-bold">Splits</h1>
              </div>
              <div className="flex items-center gap-3 text-gray-400 text-sm">
                <span>{currentIndex + 1} / {splits.length}</span>
                <span className="hidden md:inline">Use ↑ ↓ to navigate</span>
              </div>
            </div>

            {/* Video Card */}
            <div
              className="relative w-full max-w-[420px] rounded-[32px] overflow-hidden shadow-[0px_20px_60px_rgba(0,0,0,0.55)] border border-white/10 bg-black flex-1 cursor-pointer select-none"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onClick={togglePlay}
            >
              {/* Swipe Hint Overlay */}
              {showSwipeHint && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 pointer-events-none animate-fade-out">
                  <div className="flex flex-col items-center animate-bounce">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mb-3 shadow-xl border border-white/10">
                      <ArrowUpCircle className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-white font-bold text-lg drop-shadow-md tracking-wider">Swipe Up</p>
                  </div>
                </div>
              )}

              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                loop
                playsInline
                muted={isMuted}
                controls={false}
              />

              {/* Play/Pause Overlay Icon */}
              {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
                    <Play className="w-8 h-8 text-white fill-white ml-1" />
                  </div>
                </div>
              )}

              {/* Gradient overlays for readability */}
              <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />
              <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none" />

              {/* Metadata */}
              <div className="absolute bottom-0 left-0 right-0 px-6 pb-6">
                <div className="mb-3 flex items-center justify-between text-sm text-gray-300">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={toggleMute}
                      className="w-9 h-9 rounded-full bg-white/10 backdrop-blur border border-white/10 flex items-center justify-center hover:bg-white/20 transition z-10"
                    >
                      {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                    <div>
                      <p className="text-xs text-gray-400">{currentSplit.duration_str || 'Short clip'}</p>
                      <p className="text-xs text-gray-500">{formatTime(currentTime)} / {formatTime(duration)}</p>
                    </div>
                  </div>
                </div>

                <div className="w-full bg-white/20 h-1 rounded-full overflow-hidden">
                  <div className="h-full bg-white" style={{ width: `${progressPercentage}%` }} />
                </div>

                <Link href={`/media/videos/${currentSplit.uid}`} className="block group mt-4">
                  <p className="text-sm text-gray-300 mb-1">{currentSplit.uploaded}</p>
                  <h2 className="text-2xl font-semibold mb-2 group-hover:text-green-400 transition-colors line-clamp-2">
                    {currentSplit.title}
                  </h2>
                  <p className="text-sm text-gray-300 line-clamp-2">
                    {currentSplit.description}
                  </p>
                </Link>

                {/* Mobile action rail */}
                <div className="lg:hidden absolute bottom-24 right-3 flex flex-col gap-2">
                  <button
                    onClick={handleLike}
                    className={`flex items-center gap-2 px-3 py-2 rounded-2xl text-sm font-medium ${isLiked ? 'bg-red-600 text-white' : 'bg-white/15 text-white'} backdrop-blur`}
                  >
                    <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                    {currentSplit.likes_count || 0}
                  </button>
                  <Link
                    href={`/media/videos/${currentSplit.uid}`}
                    className="flex items-center gap-2 px-3 py-2 rounded-2xl text-sm font-medium bg-white/15 text-white backdrop-blur"
                  >
                    <MessageCircle className="w-5 h-5" />
                    {currentSplit.comments?.length || 0}
                  </Link>
                  <button
                    onClick={handleShare}
                    className="flex items-center gap-2 px-3 py-2 rounded-2xl text-sm font-medium bg-white/15 text-white backdrop-blur"
                  >
                    <Share2 className="w-5 h-5" />
                    Share
                  </button>
                </div>
              </div>

              {/* Navigation controls */}
              {currentIndex > 0 && (
                <button
                  onClick={handlePrevious}
                  className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full transition"
                  aria-label="Previous short"
                >
                  <ChevronUp className="w-5 h-5" />
                </button>
              )}
              {currentIndex < splits.length - 1 && (
                <button
                  onClick={handleNext}
                  className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full transition"
                  aria-label="Next short"
                >
                  <ChevronDown className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Action sidebar */}
          <div className="hidden lg:flex flex-col justify-center items-center gap-4 w-32">
            <ActionButton
              label="Like"
              count={currentSplit.likes_count || 0}
              active={isLiked}
              onClick={handleLike}
              icon={<Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />}
            />
            <ActionLink
              label="Comments"
              count={currentSplit.comments?.length || 0}
              href={`/media/videos/${currentSplit.uid}`}
              icon={<MessageCircle className="w-5 h-5" />}
            />
            <ActionButton
              label="Share"
              onClick={handleShare}
              icon={<Share2 className="w-5 h-5" />}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Sub-Component: Images Tab ---
interface Photo {
  id: number;
  uid: string;
  title: string;
  description: string;
  url: string;
  uploaded_at: string;
  user: {
    name: string;
    avatar_url?: string;
    profile_picture_url?: string;
  };
  likes_count: number;
  comments_count: number;
  viewer_liked: boolean;
}

const PhotosTab = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPhotos = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await axios.get<Photo[]>(
          `${BASE_URL}/api/photos/feed`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
              'Content-Type': 'application/json',
            },
          }
        );
        setPhotos(response.data || []);
      } catch (err) {
        console.error('Error fetching photos:', err);
        setError('Failed to load photos. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPhotos();
  }, []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0a0a0a' }}>
      {/* Header with Trending Title */}
      <div className="relative">
        <div className="h-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-r from-purple-600 via-purple-500 to-pink-400"></div>
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
          <div className="absolute top-0 left-0 w-64 h-64 bg-purple-500 opacity-20 transform -skew-x-12 -translate-x-20 -translate-y-20"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-pink-400 opacity-20 transform skew-x-12 translate-x-20 -translate-y-20"></div>

          <div className="relative z-10 flex flex-col items-center justify-center h-full px-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-16 h-16 bg-black bg-opacity-80 rounded-full flex items-center justify-center">
                <Image
                  src="/logo/logo_for_dark.png"
                  alt="Bowlers Network"
                  width={32}
                  height={32}
                  unoptimized
                  className="rounded"
                />
              </div>
              <div className="text-white">
                <h1 className="text-3xl font-bold tracking-wider">COMMUNITY PHOTOS</h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Media Content Section */}
      <div className="px-4 py-6 bg-linear-to-r from-green-600 to-emerald-600 border-b border-green-700">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-green-700 bg-opacity-80 rounded-lg flex items-center justify-center">
                  <Camera className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">Share Your Photos</h2>
              </div>
            </div>
            <div className="flex gap-3 items-center">
              <Link
                href="/media/upload-photo"
                className="inline-flex items-center gap-2 bg-white text-green-600 hover:bg-green-50 px-6 py-3 rounded-lg transition-all font-semibold shadow-lg hover:shadow-xl shrink-0"
              >
                <Upload className="w-5 h-5" />
                Upload Photo
              </Link>
              <Link
                href="/media/my-photos"
                className="inline-flex items-center gap-2 bg-white text-green-600 hover:bg-green-50 px-6 py-3 rounded-lg transition-all font-semibold shadow-lg hover:shadow-xl shrink-0"
              >
                <ImageIcon className="w-5 h-5" />
                My Photos
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Photos Grid */}
      <div className="px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader className="w-12 h-12 text-green-600 animate-spin mx-auto mb-2" />
                <p className="text-gray-400">Loading photos...</p>
              </div>
            </div>
          ) : photos.length === 0 ? (
            <div className="text-center py-12 bg-gray-900 rounded-lg">
              <ImageIcon className="w-12 h-12 text-gray-500 mx-auto mb-2" />
              <p className="text-gray-400">No photos available yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {photos.map((photo) => (
                <Link 
                  href={`/media/photos/${photo.uid}`} 
                  key={photo.id} 
                  className="group relative block bg-gray-900 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Image Container */}
                  <div className="relative aspect-4/5 overflow-hidden">
                    <img
                      src={photo.url}
                      alt={photo.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                    
                    {/* Top Right Stats */}
                    <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-x-4 group-hover:translate-x-0">
                      <div className="bg-black/50 backdrop-blur-md p-2 rounded-full text-white">
                        <Heart className={`w-5 h-5 ${photo.viewer_liked ? 'fill-red-500 text-red-500' : ''}`} />
                      </div>
                      <div className="bg-black/50 backdrop-blur-md p-2 rounded-full text-white">
                        <MessageCircle className="w-5 h-5" />
                      </div>
                    </div>
                  </div>

                  {/* Content Overlay (Bottom) */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full border-2 border-white/20 overflow-hidden shrink-0">
                        {(photo.user.profile_picture_url || photo.user.avatar_url) ? (
                          <img 
                            src={photo.user.profile_picture_url || photo.user.avatar_url} 
                            alt={photo.user.name} 
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-700 flex items-center justify-center text-white text-xs font-bold">
                            {photo.user.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-white font-semibold text-sm truncate">{photo.user.name}</p>
                        <p className="text-gray-400 text-xs">{photo.uploaded_at}</p>
                      </div>
                    </div>
                    
                    <h4 className="text-white font-bold text-lg mb-1 line-clamp-1 group-hover:text-green-400 transition-colors">
                      {photo.title}
                    </h4>
                    {photo.description && (
                      <p className="text-gray-300 text-sm line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 h-0 group-hover:h-auto">
                        {photo.description}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-4 mt-3 text-xs font-medium text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">
                      <span>{photo.likes_count} Likes</span>
                      <span>{photo.comments_count} Comments</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Main Page Component ---
type TabType = 'videos' | 'splits' | 'photos';

export default function MediaPage() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabType>('videos');

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['videos', 'splits', 'photos'].includes(tab)) {
      setActiveTab(tab as TabType);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-black">
      {/* Page Header (Tabs) - Hidden when in Splits mode (Full Screen) */}
      <div className={`sticky top-0 z-30 bg-black/95 backdrop-blur-sm border-b border-gray-800 ${activeTab === 'splits' ? 'hidden' : ''}`}>
        <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex gap-1 bg-gray-900 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('videos')}
              className={`flex-1 py-2.5 px-4 rounded-lg font-medium text-[15px] transition-all ${
                activeTab === 'videos' 
                  ? 'bg-[#8BC342] text-white font-bold shadow-md' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              Videos
            </button>
            <button
              onClick={() => setActiveTab('splits')}
              className={`flex-1 py-2.5 px-4 rounded-lg font-medium text-[15px] transition-all ${
                activeTab === 'splits' 
                  ? 'bg-[#8BC342] text-white font-bold shadow-md' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              Splits
            </button>
            <button
              onClick={() => setActiveTab('photos')}
              className={`flex-1 py-2.5 px-4 rounded-lg font-medium text-[15px] transition-all ${
                activeTab === 'photos' 
                  ? 'bg-[#8BC342] text-white font-bold shadow-md' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              Photos
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="">
        {activeTab === 'videos' && <VideosTab />}
        {activeTab === 'splits' && <SplitsTab onBack={() => setActiveTab('videos')} />}
        {activeTab === 'photos' && <PhotosTab />}
      </div>
    </div>
  );
}