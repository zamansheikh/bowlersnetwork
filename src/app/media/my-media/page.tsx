'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Video, Loader, AlertCircle, Edit2, Trash2, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const BASE_URL = 'https://test.bowlersnetwork.com';

interface MyVideo {
    id: number;
    uid: string;
    title: string;
    description: string;
    url: string;
    thumbnail_url: string;
    duration_str: string;
    uploaded: string;
    is_public: boolean;
}

export default function MyMediaPage() {
    const router = useRouter();
    const [videos, setVideos] = useState<MyVideo[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [confirmDeleteVideo, setConfirmDeleteVideo] = useState<MyVideo | null>(null);

    useEffect(() => {
        fetchMyVideos();
    }, []);

    const fetchMyVideos = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await axios.get<MyVideo[]>(
                `/api/tube/large-videos`,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
            setVideos(response.data || []);
        } catch (err) {
            console.error('Error fetching my videos:', err);
            setError('Failed to load your videos. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    const promptDelete = (video: MyVideo) => {
        setConfirmDeleteVideo(video);
    };

    const cancelDelete = () => {
        setConfirmDeleteVideo(null);
    };

    const confirmDelete = async () => {
        if (!confirmDeleteVideo) return;
        const id = confirmDeleteVideo.id;
        setDeletingId(id);
        try {
            await axios.delete(`/api/tube/large-videos/delete/${id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                    'Content-Type': 'application/json',
                },
            });
            // Remove video from list
            setVideos(videos.filter(v => v.id !== id));
            setConfirmDeleteVideo(null);
        } catch (err) {
            console.error('Error deleting video:', err);
            alert('Failed to delete video. Please try again.');
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b">
                <div className="max-w-6xl mx-auto px-4 py-6">
                    <Link
                        href="/media"
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="font-medium">Back to Media</span>
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">My Media</h1>
                    <p className="text-gray-600 mt-2">Manage your uploaded videos</p>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-6xl mx-auto px-4 py-8">
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <p className="text-red-700 text-sm">{error}</p>
                    </div>
                )}

                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="text-center">
                            <Loader className="w-12 h-12 text-green-600 animate-spin mx-auto mb-4" />
                            <p className="text-gray-600">Loading your videos...</p>
                        </div>
                    </div>
                ) : videos.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-md p-12 text-center">
                        <Video className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No videos yet</h3>
                        <p className="text-gray-600 mb-6">Start sharing your content with the community</p>
                        <Link
                            href="/media/upload-video"
                            className="inline-flex items-center gap-2 bg-green-600 text-white hover:bg-green-700 px-6 py-3 rounded-lg font-semibold transition-colors"
                        >
                            <Video className="w-5 h-5" />
                            Upload Your First Video
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {videos.map((video) => (
                            <div
                                key={video.id}
                                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                            >
                                <div className="flex flex-col md:flex-row">
                                    {/* Thumbnail */}
                                    <div className="relative w-full md:w-48 h-40 bg-gray-900 flex-shrink-0 group">
                                        {video.thumbnail_url ? (
                                            <img
                                                src={video.thumbnail_url}
                                                alt={video.title}
                                                loading="lazy"
                                                onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/thumbnail.svg'; }}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                No thumbnail
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
                                            <Video className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                        {!video.is_public && (
                                            <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
                                                Private
                                            </div>
                                        )}
                                    </div>

                                    {/* Video Details */}
                                    <div className="flex-1 p-4 flex flex-col justify-between">
                                        <div>
                                            <Link
                                                href={`/media/videos/${video.uid}`}
                                                className="text-lg font-semibold text-gray-900 hover:text-green-600 transition-colors line-clamp-2"
                                            >
                                                {video.title}
                                            </Link>
                                            <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                                                {video.description}
                                            </p>
                                            <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                                                    Uploaded {video.uploaded}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                                                    Duration: {video.duration_str}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    {video.is_public ? (
                                                        <>
                                                            <Eye className="w-3.5 h-3.5" />
                                                            Public
                                                        </>
                                                    ) : (
                                                        <>
                                                            <EyeOff className="w-3.5 h-3.5" />
                                                            Private
                                                        </>
                                                    )}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-2 mt-4">
                                            <Link
                                                href={`/media/videos/${video.uid}`}
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 hover:bg-green-100 rounded font-medium text-sm transition-colors"
                                            >
                                                <Eye className="w-4 h-4" />
                                                View
                                            </Link>
                                            <Link
                                                href={`/media/videos/${video.uid}/edit?from=${encodeURIComponent('/media/my-media')}`}
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded font-medium text-sm transition-colors"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                                Edit
                                            </Link>
                                            <button
                                                onClick={() => promptDelete(video)}
                                                disabled={deletingId === video.id}
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {deletingId === video.id ? (
                                                    <>
                                                        <Loader className="w-4 h-4 animate-spin" />
                                                        Deleting...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Trash2 className="w-4 h-4" />
                                                        Delete
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Confirmation Modal for Deletion */}
            {confirmDeleteVideo && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div
                        className="fixed inset-0 bg-black opacity-40"
                        onClick={cancelDelete}
                    />
                    <div className="bg-white rounded-lg shadow-lg z-50 max-w-md w-full p-6 mx-4">
                        <h3 className="text-lg font-semibold text-gray-900">Delete video</h3>
                        <p className="text-gray-600 mt-2">Are you sure you want to delete <strong>{confirmDeleteVideo.title}</strong>? This action cannot be undone.</p>
                        <div className="flex justify-end gap-2 mt-6">
                            <button
                                onClick={cancelDelete}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                disabled={deletingId === confirmDeleteVideo.id}
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {deletingId === confirmDeleteVideo.id ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
