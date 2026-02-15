'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Trash2, AlertCircle, Loader, ImageIcon, Calendar, Heart, MessageCircle } from 'lucide-react';
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

interface Photo {
    id: number;
    uid: string;
    title: string;
    description: string;
    url: string;
    uploaded_at: string;
    user: User;
}

export default function MyPhotosPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        const fetchMyPhotos = async () => {
            if (!user || !user.authenticated) return;

            setIsLoading(true);
            setError(null);
            try {
                const response = await axios.get<Photo[]>('/api/photos', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                    },
                });
                setPhotos(response.data || []);
            } catch (err) {
                console.error('Error fetching my photos:', err);
                setError('Failed to load your photos. Please try again later.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchMyPhotos();
    }, [user]);

    const handleDelete = async (uid: string) => {
        if (!confirm('Are you sure you want to delete this photo? This action cannot be undone.')) {
            return;
        }

        setDeletingId(uid);
        try {
            await axios.delete(`/api/photos/${uid}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                },
            });
            
            // Remove from state
            setPhotos(prev => prev.filter(p => p.uid !== uid));
        } catch (err) {
            console.error('Error deleting photo:', err);
            alert('Failed to delete photo. Please try again.');
        } finally {
            setDeletingId(null);
        }
    };

    // Check if user is authenticated
    if (!user || !user.authenticated) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-xl text-red-600 mb-4">Please log in to view your photos</div>
                    <Link href="/signin" className="text-white px-4 py-2 rounded-lg inline-block" style={{ backgroundColor: '#8BC342' }}>
                        Go to Sign In
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/media"
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <ArrowLeft className="w-6 h-6 text-gray-600" />
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-900">My Photos</h1>
                    </div>
                    <Link
                        href="/media/upload-photo"
                        className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
                    >
                        <ImageIcon className="w-4 h-4" />
                        Upload New
                    </Link>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                        <p className="text-red-700 text-sm">{error}</p>
                    </div>
                )}

                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="text-center">
                            <Loader className="w-12 h-12 text-green-600 animate-spin mx-auto mb-2" />
                            <p className="text-gray-500">Loading your photos...</p>
                        </div>
                    </div>
                ) : photos.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-lg shadow-sm border border-gray-200">
                        <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No photos yet</h3>
                        <p className="text-gray-500 mb-6">Share your bowling moments with the community!</p>
                        <Link
                            href="/media/upload-photo"
                            className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
                        >
                            Upload Your First Photo
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {photos.map((photo) => (
                            <div key={photo.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden group hover:shadow-md transition-shadow">
                                <div className="relative aspect-square bg-gray-100">
                                    <Link href={`/media/photos/${photo.uid}`}>
                                        <img
                                            src={photo.url}
                                            alt={photo.title}
                                            className="w-full h-full object-cover"
                                            loading="lazy"
                                        />
                                    </Link>
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleDelete(photo.uid);
                                        }}
                                        disabled={deletingId === photo.uid}
                                        className="absolute top-2 right-2 p-2 bg-white/90 text-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 disabled:opacity-50"
                                        title="Delete photo"
                                    >
                                        {deletingId === photo.uid ? (
                                            <Loader className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Trash2 className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>
                                <div className="p-4">
                                    <Link href={`/media/photos/${photo.uid}`} className="block">
                                        <h3 className="font-semibold text-gray-900 mb-1 truncate hover:text-green-600 transition-colors">
                                            {photo.title}
                                        </h3>
                                    </Link>
                                    <p className="text-sm text-gray-500 line-clamp-2 mb-3 h-10">
                                        {photo.description || 'No description'}
                                    </p>
                                    <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-gray-100">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            <span>{photo.uploaded_at}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
