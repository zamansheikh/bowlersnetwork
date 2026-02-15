'use client';

import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Save, Loader, AlertCircle, CheckCircle, Upload, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';

const BASE_URL = 'https://test.bowlersnetwork.com';
const BUCKET_NAME = 'cdn';

interface Video {
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

export default function EditVideoPage({ params }: { params: Promise<{ uid: string }> }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const fromParam = searchParams?.get('from') || null;
    const fileInputRef = useRef<HTMLInputElement>(null);
    const abortControllerRef = useRef<AbortController | null>(null);
    const uploadInfoRef = useRef<{ key: string; public_url: string } | null>(null);

    const [videoId, setVideoId] = useState<number | null>(null);
    const [videoUid, setVideoUid] = useState<string | null>(null);
    const [paramsUid, setParamsUid] = useState<string | null>(null);
    const [video, setVideo] = useState<Video | null>(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [thumbnailUrl, setThumbnailUrl] = useState('');
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const [thumbnailPreview, setThumbnailPreview] = useState('');

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    useEffect(() => {
        const fetchVideo = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // Unwrap params promise
                const resolvedParams = await params;
                if (!resolvedParams.uid) {
                    throw new Error('Video ID not provided');
                }

                setParamsUid(resolvedParams.uid);

                const response = await axios.get<Video>(
                    `/api/tube/large-videos/details/${resolvedParams.uid}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                            'Content-Type': 'application/json',
                        },
                    }
                );
                setVideo(response.data);
                setVideoId(response.data.id);
                setVideoUid(response.data.uid);
                setTitle(response.data.title);
                setDescription(response.data.description);
                setThumbnailUrl(response.data.thumbnail_url);
                setThumbnailPreview(response.data.thumbnail_url);
            } catch (err) {
                console.error('Error fetching video:', err);
                setError('Failed to load video details. Please try again later.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchVideo();
    }, [params]);

    const handleThumbnailSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('Please select a valid image file');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError('Image size must be less than 5MB');
            return;
        }

        setThumbnailFile(file);
        const preview = URL.createObjectURL(file);
        setThumbnailPreview(preview);
        setError(null);
    };

    const uploadThumbnail = async (): Promise<string> => {
        if (!thumbnailFile) throw new Error('No thumbnail file selected');

        setIsUploadingThumbnail(true);
        setUploadProgress(0);

        try {
            abortControllerRef.current = new AbortController();
            
            // Get token from AuthContext if possible, but edit page might not have it loaded yet, so check localStorage
            const token = localStorage.getItem('access_token');
            console.log('[Thumbnail] Token available:', !!token);

            if (!token) {
                throw new Error('You must be logged in to upload a thumbnail. Please sign in again.');
            }

            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            };

            // Step 1: Initiate singlepart upload
            console.log('[Thumbnail] Initiating upload via local proxy...');
            const initiateResponse = await fetch('/api/cloud/upload/singlepart/requests/initiate', {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    bucket: BUCKET_NAME,
                    file_name: thumbnailFile.name
                }),
                signal: abortControllerRef.current.signal
            });

            if (!initiateResponse.ok) {
                let errorMsg = 'Failed to initiate upload';
                try {
                    const errorData = await initiateResponse.json();
                    errorMsg = errorData.errors?.[0] || errorData.message || `Proxy error: ${initiateResponse.status}`;
                } catch (e) {
                    errorMsg = `Proxy error: ${initiateResponse.status} ${initiateResponse.statusText}`;
                }
                throw new Error(errorMsg);
            }

            const data = await initiateResponse.json();
            const { key, public_url, presigned_url } = data;
            
            if (!presigned_url) {
                throw new Error('Server did not provide an upload URL');
            }

            uploadInfoRef.current = { key, public_url };
            console.log('[Thumbnail] Got presigned URL');

            // Step 2: Upload file to presigned URL
            console.log('[Thumbnail] Uploading to presigned URL directly...');
            const uploadResponse = await fetch(presigned_url, {
                method: 'PUT',
                body: thumbnailFile,
                signal: abortControllerRef.current.signal
            });

            if (!uploadResponse.ok) {
                throw new Error(`Failed to upload thumbnail to cloud: ${uploadResponse.status} ${uploadResponse.statusText}`);
            }

            setUploadProgress(100);
            console.log('[Thumbnail] Upload successful:', public_url);
            return public_url;
        } catch (err) {
            console.error('Thumbnail upload error:', err);
            throw err;
        } finally {
            setIsUploadingThumbnail(false);
            abortControllerRef.current = null;
            uploadInfoRef.current = null;
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim()) {
            setError('Please enter a title');
            return;
        }

        if (!videoId) {
            setError('Video ID not found');
            return;
        }

        setIsSaving(true);
        setError(null);
        setSuccess(false);

        try {
            // Upload thumbnail if changed
            let finalThumbnailUrl = thumbnailUrl;
            if (thumbnailFile) {
                try {
                    finalThumbnailUrl = await uploadThumbnail();
                } catch (err) {
                    throw new Error(err instanceof Error ? err.message : 'Failed to upload thumbnail');
                }
            }

            const token = localStorage.getItem('access_token');
            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
            };

            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            // Step 1: Update title and description
            console.log('[Edit] Updating video metadata');
            await axios.post(
                `/api/tube/large-videos/edit/${videoId}`,
                {
                    title: title.trim(),
                    description: description.trim()
                },
                { headers }
            );

            // Step 2: Update thumbnail if changed
            if (thumbnailFile) {
                console.log('[Edit] Updating thumbnail');
                await axios.post(
                    `/api/tube/large-videos/upload-thumbnail/${videoId}`,
                    {
                        thumbnail_url: finalThumbnailUrl
                    },
                    { headers }
                );
            }

            setSuccess(true);
            setThumbnailFile(null);

            // Clear success message after 2 seconds and redirect
            setTimeout(() => {
                router.push('/media/my-media');
            }, 2000);
        } catch (err) {
            console.error('Error saving video:', err);
            const errorMessage = axios.isAxiosError(err)
                ? err.response?.data?.message || 'Failed to save changes'
                : 'Failed to save changes. Please try again.';
            setError(errorMessage);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader className="w-12 h-12 text-green-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Loading video details...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b">
                <div className="max-w-4xl mx-auto px-4 py-6">
                    <button
                        onClick={() => {
                            if (fromParam) {
                                router.push(fromParam);
                            } else if (typeof window !== 'undefined' && window.history.length > 1) {
                                router.back();
                            } else {
                                router.push('/media/my-media');
                            }
                        }}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="font-medium">Back</span>
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900">Edit Video</h1>
                    <p className="text-gray-600 mt-2">Update your video details</p>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 py-8">
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <p className="text-red-700 text-sm">{error}</p>
                    </div>
                )}

                {success && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <p className="text-green-700 text-sm">Video updated successfully! Redirecting...</p>
                    </div>
                )}

                <form onSubmit={handleSave} className="space-y-6">
                    {/* Video Info Section */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Video Information</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Enter video title"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    disabled={isSaving || isUploadingThumbnail}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Enter video description"
                                    rows={4}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                                    disabled={isSaving || isUploadingThumbnail}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Thumbnail Section */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Thumbnail</h2>

                        <div className="space-y-4">
                            {/* Current Thumbnail */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Current Thumbnail
                                </label>
                                <div className="relative w-full max-w-sm bg-gray-200 rounded-lg overflow-hidden">
                                    {thumbnailPreview && (
                                        <img
                                            src={thumbnailPreview}
                                            alt="Current thumbnail"
                                            loading="lazy"
                                            onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/thumbnail.svg'; }}
                                            className="w-full h-40 object-cover"
                                        />
                                    )}
                                    {!thumbnailPreview && (
                                        <div className="w-full h-40 flex items-center justify-center text-gray-500">
                                            No thumbnail available
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Upload New Thumbnail */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Update Thumbnail
                                </label>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-500 hover:bg-green-50 transition-colors cursor-pointer">
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleThumbnailSelect}
                                        className="hidden"
                                        disabled={isSaving || isUploadingThumbnail}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={isSaving || isUploadingThumbnail}
                                        className="w-full"
                                    >
                                        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                        <p className="text-sm font-medium text-gray-700">
                                            Click to upload a new thumbnail
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            PNG, JPG, GIF (max 5MB)
                                        </p>
                                    </button>
                                </div>

                                {thumbnailFile && (
                                    <div className="mt-4">
                                        <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                                            <div className="flex items-center gap-2">
                                                <Upload className="w-5 h-5 text-green-600" />
                                                <span className="text-sm font-medium text-gray-900">{thumbnailFile.name}</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setThumbnailFile(null);
                                                    setThumbnailPreview(video?.thumbnail_url || '');
                                                    if (fileInputRef.current) {
                                                        fileInputRef.current.value = '';
                                                    }
                                                }}
                                                className="text-red-600 hover:text-red-700"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>

                                        {isUploadingThumbnail && (
                                            <div className="mt-3">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-sm text-gray-600">Uploading...</span>
                                                    <span className="text-sm font-medium text-green-600">{uploadProgress}%</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className="bg-green-600 h-2 rounded-full transition-all duration-300"
                                                        style={{ width: `${uploadProgress}%` }}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4">
                        <Link
                            href="/media/my-media"
                            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={isSaving || isUploadingThumbnail}
                            className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isSaving || isUploadingThumbnail ? (
                                <>
                                    <Loader className="w-5 h-5 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
