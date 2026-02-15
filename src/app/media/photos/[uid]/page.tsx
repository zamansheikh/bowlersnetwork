'use client';

import { useState, useEffect, use } from 'react';
import { ArrowLeft, Calendar, Heart, MessageCircle, Share2, MoreVertical, Trash2, Loader, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface User {
    user_id: number;
    username: string;
    name: string;
    first_name: string;
    last_name: string;
    email: string;
    profile_picture_url: string;
}

interface PhotoDetail {
    id: number;
    uid: string;
    title: string;
    description: string;
    url: string;
    uploaded_at: string;
    user: User;
    likes_count?: number;
    comments_count?: number;
    viewer_liked?: boolean;
}

export default function PhotoDetailPage({ params }: { params: Promise<{ uid: string }> }) {
    const router = useRouter();
    const { user } = useAuth();
    const [photo, setPhoto] = useState<PhotoDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    
    // Unwrap params using React.use()
    const { uid } = use(params);

    useEffect(() => {
        const fetchPhotoDetails = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await axios.get<PhotoDetail>(`/api/photos/${uid}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                    },
                });
                setPhoto(response.data);
            } catch (err) {
                console.error('Error fetching photo details:', err);
                setError('Failed to load photo details. It may have been deleted or does not exist.');
            } finally {
                setIsLoading(false);
            }
        };

        if (uid) {
            fetchPhotoDetails();
        }
    }, [uid]);

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this photo? This action cannot be undone.')) {
            return;
        }

        setIsDeleting(true);
        try {
            await axios.delete(`/api/photos/${uid}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                },
            });
            router.push('/media/my-photos');
        } catch (err) {
            console.error('Error deleting photo:', err);
            alert('Failed to delete photo. Please try again.');
            setIsDeleting(false);
        }
    };

    const handleShare = async () => {
        if (!photo) return;
        
        const shareData = {
            title: photo.title,
            text: photo.description,
            url: window.location.href,
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.error('Share failed:', err);
            }
        } else {
            await navigator.clipboard.writeText(window.location.href);
            alert('Link copied to clipboard!');
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center">
                    <Loader className="w-12 h-12 text-green-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-400">Loading photo...</p>
                </div>
            </div>
        );
    }

    if (error || !photo) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
                <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
                <h1 className="text-2xl font-bold text-white mb-2">Error Loading Photo</h1>
                <p className="text-gray-400 mb-6 text-center max-w-md">{error || 'Photo not found'}</p>
                <Link 
                    href="/media" 
                    className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                    Back to Media
                </Link>
            </div>
        );
    }

    const isOwner = user?.authenticated && user.username === photo.user.username; // Assuming username match implies ownership, or check ID if available in user context

    return (
        <div className="min-h-screen bg-black text-white flex flex-col">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-md border-b border-gray-800">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <button 
                        onClick={() => router.back()} 
                        className="p-2 hover:bg-gray-800 rounded-full transition-colors text-gray-300 hover:text-white"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div className="font-medium text-lg truncate max-w-md px-4">
                        {photo.title}
                    </div>
                    <div className="flex items-center gap-2">
                        {isOwner && (
                            <button 
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="p-2 hover:bg-red-900/30 text-red-400 hover:text-red-300 rounded-full transition-colors"
                                title="Delete Photo"
                            >
                                {isDeleting ? <Loader className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                            </button>
                        )}
                        <button 
                            onClick={handleShare}
                            className="p-2 hover:bg-gray-800 rounded-full transition-colors text-gray-300 hover:text-white"
                        >
                            <Share2 className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col lg:flex-row max-w-7xl mx-auto w-full">
                {/* Image Container */}
                <div className="flex-1 bg-gray-900 flex items-center justify-center p-4 lg:p-8 min-h-[50vh] lg:min-h-[calc(100vh-73px)]">
                    <img 
                        src={photo.url} 
                        alt={photo.title} 
                        className="max-w-full max-h-[80vh] object-contain shadow-2xl rounded-lg"
                    />
                </div>

                {/* Sidebar / Details */}
                <div className="w-full lg:w-96 bg-black border-l border-gray-800 p-6 flex flex-col h-auto lg:h-[calc(100vh-73px)] overflow-y-auto">
                    {/* User Info */}
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 rounded-full bg-gray-800 overflow-hidden border border-gray-700">
                            {photo.user.profile_picture_url ? (
                                <img src={photo.user.profile_picture_url} alt={photo.user.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-lg">
                                    {photo.user.name.charAt(0)}
                                </div>
                            )}
                        </div>
                        <div>
                            <h3 className="font-bold text-white">{photo.user.name}</h3>
                            <p className="text-sm text-gray-400">@{photo.user.username}</p>
                        </div>
                    </div>

                    {/* Photo Details */}
                    <div className="space-y-4 mb-8">
                        <div>
                            <h1 className="text-2xl font-bold text-white mb-2">{photo.title}</h1>
                            <p className="text-gray-300 whitespace-pre-wrap">{photo.description}</p>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Calendar className="w-4 h-4" />
                            <span>Uploaded {photo.uploaded_at}</span>
                        </div>
                    </div>

                    {/* Stats / Actions */}
                    <div className="flex items-center justify-between py-4 border-t border-gray-800 mb-6">
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2 text-gray-300">
                                <Heart className={`w-6 h-6 ${photo.viewer_liked ? 'fill-red-500 text-red-500' : ''}`} />
                                <span className="font-medium">{photo.likes_count || 0}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-300">
                                <MessageCircle className="w-6 h-6" />
                                <span className="font-medium">{photo.comments_count || 0}</span>
                            </div>
                        </div>
                    </div>

                    {/* Comments Placeholder */}
                    <div className="flex-1">
                        <h3 className="font-semibold text-gray-400 mb-4 text-sm uppercase tracking-wider">Comments</h3>
                        <div className="text-center py-8 text-gray-500 bg-gray-900/50 rounded-lg border border-gray-800 border-dashed">
                            <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p>No comments yet.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
