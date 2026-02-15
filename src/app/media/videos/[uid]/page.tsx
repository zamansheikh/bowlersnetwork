'use client';

import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Play, Loader, AlertCircle, Share2, ThumbsUp, MessageCircle, Send, Heart } from 'lucide-react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import axios from 'axios';
import { ProVideo, VideoComment } from '@/types';
import { useParams } from 'next/navigation';

const BASE_URL = 'https://test.bowlersnetwork.com';

export default function VideoPage() {
    const params = useParams();
    const uid = params?.uid as string;
    const router = useRouter();
    const pathname = usePathname();

    const [video, setVideo] = useState<ProVideo | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const videoRef = useRef<HTMLVideoElement | null>(null);

    // Like & Comment state
    const [isLiked, setIsLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(0);
    const [comments, setComments] = useState<VideoComment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);
    const [isLiking, setIsLiking] = useState(false);

    // Fetch video details
    useEffect(() => {
        if (!uid) return;

        const fetchVideoDetails = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const token = localStorage.getItem('access_token');
                if (!token) {
                    setError('Please log in to view videos');
                    setIsLoading(false);
                    return;
                }

                console.log('Fetching video with uid:', uid);
                const response = await axios.get<ProVideo>(
                    `${BASE_URL}/api/tube/large-videos/details/${uid}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                    }
                );
                console.log('Video data received:', response.data);
                setVideo(response.data);
                // Set like and comment state from response
                setIsLiked(response.data.viewer_liked || false);
                setLikesCount(response.data.likes_count || 0);
                setComments(response.data.comments || []);
            } catch (err) {
                console.error('Error fetching video details:', err);
                if (axios.isAxiosError(err)) {
                    if (err.response?.status === 404) {
                        setError('Video not found');
                    } else if (err.response?.status === 401) {
                        setError('Authentication failed. Please log in again.');
                    } else {
                        setError(err.response?.data?.message || 'Failed to load video. Please try again later.');
                    }
                } else {
                    setError('Network error. Please check your connection.');
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchVideoDetails();
    }, [uid]);

    // Handle like/unlike
    const handleLike = async () => {
        if (!video || isLiking) return;
        
        setIsLiking(true);
        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                setError('Please log in to like videos');
                return;
            }

            const response = await axios.get(
                `${BASE_URL}/api/tube/large-videos/like/${video.id}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
            
            setIsLiked(response.data.is_liked);
            setLikesCount(response.data.likes_count);
        } catch (err) {
            console.error('Error liking video:', err);
        } finally {
            setIsLiking(false);
        }
    };

    // Handle comment submission
    const handleSubmitComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!video || !newComment.trim() || isSubmittingComment) return;
        
        setIsSubmittingComment(true);
        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                setError('Please log in to comment');
                return;
            }

            const response = await axios.post(
                `${BASE_URL}/api/tube/large-videos/comment/${video.id}`,
                { comment: newComment.trim() },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
            
            // Add new comment to the top of the list
            setComments(prev => [response.data, ...prev]);
            setNewComment('');
        } catch (err) {
            console.error('Error submitting comment:', err);
        } finally {
            setIsSubmittingComment(false);
        }
    };

    // Auto-play effect
    useEffect(() => {
        if (video && videoRef.current) {
            const playVideo = async () => {
                try {
                    await videoRef.current?.play();
                    setIsPlaying(true);
                } catch (err) {
                    console.log('Autoplay failed (likely blocked by browser), falling back to controls', err);
                    setIsPlaying(false);
                }
            };
            playVideo();
        }
    }, [video]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <Loader className="w-12 h-12 text-green-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-300 text-lg">Loading video...</p>
                </div>
            </div>
        );
    }

    if (error || !video) {
        return (
            <div className="min-h-screen bg-gray-900">
                <div className="px-4 py-8">
                    <Link
                        href="/media"
                        className="inline-flex items-center gap-2 text-green-600 hover:text-green-500 font-medium mb-8"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Media
                    </Link>
                </div>
                <div className="px-4">
                    <div className="max-w-4xl mx-auto bg-gray-800 rounded-lg p-8 text-center">
                        <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
                        <p className="text-red-600 text-lg font-medium">{error || 'Video not found'}</p>
                        <Link
                            href="/media"
                            className="mt-4 inline-block px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                        >
                            Return to Media
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900">
            {/* Header */}
            <div className="px-4 py-8 border-b border-gray-800">
                <div className="max-w-6xl mx-auto">
                    <button
                        onClick={() => {
                            if (typeof window !== 'undefined' && window.history.length > 1) {
                                router.back();
                            } else {
                                router.push('/media');
                            }
                        }}
                        className="inline-flex items-center gap-2 text-green-600 hover:text-green-500 font-medium mb-6 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="px-4 py-8">
                <div className="max-w-6xl mx-auto">
                    {/* Video Player — show poster (thumbnail) until play */}
                    <div className="bg-black rounded-lg overflow-hidden mb-8 shadow-2xl">
                        <div className="relative w-full bg-gray-800">
                            <video
                                ref={videoRef}
                                src={video.url || video.url}
                                poster={video.thumbnail_url || '/thumbnail.svg'}
                                controls
                                autoPlay
                                playsInline
                                muted
                                preload="auto"
                                className="w-full h-auto"
                                style={{ maxHeight: '600px' }}
                                controlsList="nodownload"
                                onPlay={() => setIsPlaying(true)}
                                onPause={() => setIsPlaying(false)}
                            >
                                Your browser does not support the video tag.
                            </video>

                            {/* Overlay play button when not playing */}
                            {!isPlaying && (
                                <button
                                    aria-label="Play video"
                                    className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 hover:bg-opacity-30 transition-colors"
                                    onClick={() => {
                                        try {
                                            if (videoRef.current) {
                                                videoRef.current.muted = false; // Unmute on manual click
                                                videoRef.current.play();
                                            }
                                        } catch (e) {
                                            console.error('Play prevented', e);
                                        }
                                    }}
                                >
                                    <div className="w-24 h-24 bg-green-600 rounded-full flex items-center justify-center">
                                        <Play className="w-12 h-12 text-white ml-1" />
                                    </div>
                                </button>
                            )}
                            {/* Duration badge */}
                            {video.duration_str && (
                                <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                                    {video.duration_str}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Video Info */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Info */}
                        <div className="lg:col-span-2">
                            {/* Title */}
                            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                                {video.title}
                            </h1>

                            {/* Metadata Bar */}
                            <div className="flex flex-wrap items-center gap-6 py-4 border-b border-gray-800 mb-6">
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-400 text-sm">Uploaded</span>
                                    <span className="text-white font-medium">{video.uploaded}</span>
                                </div>
                                {video.duration_str && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-400 text-sm">Duration</span>
                                        <span className="text-white font-medium">{video.duration_str}</span>
                                    </div>
                                )}
                                {video.is_public && (
                                    <div className="flex items-center gap-2">
                                        <span className="inline-block w-2 h-2 bg-green-600 rounded-full"></span>
                                        <span className="text-gray-400 text-sm">Public</span>
                                    </div>
                                )}
                            </div>



                            {/* Like & Share Actions */}
                            <div className="flex items-center gap-4 mb-6">
                                <button
                                    onClick={handleLike}
                                    disabled={isLiking}
                                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-medium transition-all ${
                                        isLiked 
                                            ? 'bg-red-600 text-white hover:bg-red-700' 
                                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                    } ${isLiking ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                                    <span>{likesCount}</span>
                                </button>
                                <button className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gray-700 text-gray-300 hover:bg-gray-600 transition-all font-medium">
                                    <MessageCircle className="w-5 h-5" />
                                    <span>{comments.length}</span>
                                </button>
                                <button className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gray-700 text-gray-300 hover:bg-gray-600 transition-all font-medium">
                                    <Share2 className="w-5 h-5" />
                                    <span>Share</span>
                                </button>
                            </div>

                            {/* Description */}
                            <div className="bg-gray-800 rounded-lg p-6 mb-8">
                                <h2 className="text-lg font-bold text-white mb-3">About this video</h2>
                                <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                                    {video.description}
                                </p>
                            </div>

                            {/* Comments Section */}
                            <div className="bg-gray-800 rounded-lg p-6">
                                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    <MessageCircle className="w-5 h-5" />
                                    Comments ({comments.length})
                                </h2>

                                {/* Comment Input */}
                                <form onSubmit={handleSubmitComment} className="mb-6">
                                    <div className="flex gap-3">
                                        <div className="flex-1">
                                            <input
                                                type="text"
                                                value={newComment}
                                                onChange={(e) => setNewComment(e.target.value)}
                                                placeholder="Add a comment..."
                                                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={!newComment.trim() || isSubmittingComment}
                                            className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                        >
                                            {isSubmittingComment ? (
                                                <Loader className="w-5 h-5 animate-spin" />
                                            ) : (
                                                <Send className="w-5 h-5" />
                                            )}
                                        </button>
                                    </div>
                                </form>

                                {/* Comments List */}
                                <div className="space-y-4">
                                    {comments.length === 0 ? (
                                        <p className="text-gray-400 text-center py-6">No comments yet. Be the first to comment!</p>
                                    ) : (
                                        comments.map((comment) => (
                                            <div key={comment.comment_id} className="flex gap-3 p-4 bg-gray-700/50 rounded-lg">
                                                {/* User Avatar */}
                                                <div className="flex-shrink-0">
                                                    {comment.user.profile_picture_url ? (
                                                        <img
                                                            src={comment.user.profile_picture_url}
                                                            alt={comment.user.name}
                                                            className="w-10 h-10 rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white font-bold">
                                                            {comment.user.name?.[0] || 'U'}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Comment Content */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="font-semibold text-white">{comment.user.name}</span>
                                                        <span className="text-gray-500 text-sm">@{comment.user.username}</span>
                                                        <span className="text-gray-500 text-sm">•</span>
                                                        <span className="text-gray-500 text-sm">{comment.created}</span>
                                                    </div>
                                                    <p className="text-gray-300">{comment.comment}</p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Sidebar (if needed for related videos later) */}
                        <div className="lg:col-span-1">
                            {/* Reserved for related videos or other content */}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
