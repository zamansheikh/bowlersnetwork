'use client';

import { useState, useRef, useEffect } from 'react';
import { Upload, AlertCircle, Check, X, Loader, Play, ArrowLeft, Video, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const BASE_URL = 'https://test.bowlersnetwork.com';
const BUCKET_NAME = 'cdn';

interface UploadState {
    step: 'idle' | 'uploading' | 'success' | 'error';
    error: string | null;
    uploadProgress: number;
    videoFile: File | null;
    videoPreviewUrl: string | null;
    videoDuration: number | null; // duration in seconds
}

export default function MediaUploadPage() {
    const router = useRouter();
    const { user } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const abortControllerRef = useRef<AbortController | null>(null);
    const uploadInfoRef = useRef<{ key: string; public_url: string } | null>(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isValidatingTitle, setIsValidatingTitle] = useState(false);
    const [titleError, setTitleError] = useState<string | null>(null);
    const [isTitleValid, setIsTitleValid] = useState(false);
    const [uploadState, setUploadState] = useState<UploadState>({
        step: 'idle',
        error: null,
        uploadProgress: 0,
        videoFile: null,
        videoPreviewUrl: null,
        videoDuration: null,
    });

    // Auto-validate title when user stops typing (with 1.5 second debounce)
    useEffect(() => {
        if (!title.trim() || isTitleValid) {
            return; // Don't validate if title is empty or already validated
        }

        const timer = setTimeout(() => {
            autoValidateTitle(title.trim());
        }, 1500); // Wait 1.5 seconds after user stops typing

        return () => clearTimeout(timer);
    }, [title]);

    // Get video duration
    const getVideoDuration = (file: File): Promise<number> => {
        return new Promise((resolve, reject) => {
            const video = document.createElement('video');
            const objectUrl = URL.createObjectURL(file);
            
            video.onloadedmetadata = () => {
                URL.revokeObjectURL(objectUrl);
                resolve(video.duration);
            };
            
            video.onerror = () => {
                URL.revokeObjectURL(objectUrl);
                reject(new Error('Failed to load video metadata'));
            };
            
            video.src = objectUrl;
        });
    };

    // Handle file selection
    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file size (max 100MB)
        if (file.size > 100 * 1024 * 1024) {
            setUploadState({
                ...uploadState,
                step: 'error',
                error: 'Video size must be less than 100MB',
            });
            return;
        }

        // Validate file type
        if (!file.type.startsWith('video/')) {
            setUploadState({
                ...uploadState,
                step: 'error',
                error: 'Please select a valid video file',
            });
            return;
        }

        // Get video duration
        try {
            const duration = await getVideoDuration(file);

            // Create preview URL
            const previewUrl = URL.createObjectURL(file);

            setUploadState({
                step: 'idle',
                error: null,
                uploadProgress: 0,
                videoFile: file,
                videoPreviewUrl: previewUrl,
                videoDuration: duration,
            });

            // Auto-validate title when video is selected (if title exists and hasn't been validated yet)
            if (title.trim() && !isTitleValid) {
                autoValidateTitle(title.trim());
            }
        } catch (error) {
            setUploadState({
                ...uploadState,
                step: 'error',
                error: 'Failed to read video duration. Please try another file.',
            });
        }
    };

    // Auto-validate title (called when video is selected)
    const autoValidateTitle = async (titleToValidate: string) => {
        setIsValidatingTitle(true);
        setTitleError(null);

        try {
            const response = await axios.post(
                `${BASE_URL}/api/tube/large-videos/validate-metadata`,
                { title: titleToValidate },
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            // If status is 200, title is unique
            if (response.status === 200) {
                setIsTitleValid(true);
                setTitleError(null);
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 409 || error.response?.status === 400) {
                    setTitleError('This title already exists. Please choose a different one.');
                } else {
                    setTitleError(error.response?.data?.message || 'Failed to validate title');
                }
            } else {
                setTitleError('Network error. Please try again.');
            }
            setIsTitleValid(false);
        } finally {
            setIsValidatingTitle(false);
        }
    };

    const handleAbort = async () => {
        const uploadInfo = uploadInfoRef.current;

        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        if (uploadInfo) {
            try {
                const token = localStorage.getItem('access_token');
                const headers: Record<string, string> = {
                    'Content-Type': 'application/json',
                };
                if (token) {
                    headers['Authorization'] = `Bearer ${token}`;
                }

                await fetch('/api/cloud/upload/singlepart/requests/abort', {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({
                        bucket: BUCKET_NAME,
                        params: {
                            key: uploadInfo.key
                        }
                    })
                });
                console.log('Upload aborted on server');
            } catch (error) {
                console.error('Failed to abort upload on server:', error);
            }
        }
    };

    // Validate title uniqueness
    const validateTitle = async () => {
        if (!title.trim()) {
            setTitleError('Please enter a title');
            return;
        }

        setIsValidatingTitle(true);
        setTitleError(null);

        try {
            const response = await axios.post(
                `${BASE_URL}/api/tube/large-videos/validate-metadata`,
                { title: title.trim() },
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            // If status is 200, title is unique
            if (response.status === 200) {
                setIsTitleValid(true);
                setTitleError(null);
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 409 || error.response?.status === 400) {
                    setTitleError('This title already exists. Please choose a different one.');
                } else {
                    setTitleError(error.response?.data?.message || 'Failed to validate title');
                }
            } else {
                setTitleError('Network error. Please try again.');
            }
            setIsTitleValid(false);
        } finally {
            setIsValidatingTitle(false);
        }
    };

    // Handle video upload
    const handleVideoUpload = async () => {
        if (!uploadState.videoFile) {
            setUploadState({
                ...uploadState,
                step: 'error',
                error: 'Please select a video file',
            });
            return;
        }

        if (!isTitleValid) {
            setUploadState({
                ...uploadState,
                step: 'error',
                error: 'Please validate the title before uploading',
            });
            return;
        }

        setUploadState({
            ...uploadState,
            step: 'uploading',
            error: null,
            uploadProgress: 0,
        });

        try {
            abortControllerRef.current = new AbortController();
            
            // Get token from AuthContext first, then localStorage
            const token = user?.access_token || localStorage.getItem('access_token');
            console.log('[Upload] Token available:', !!token);

            if (!token) {
                throw new Error('You must be logged in to upload videos. Please sign in again.');
            }

            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            };

            // Step 1: Initiate singlepart upload
            console.log('[Upload] Initiating singlepart upload to local proxy...');
            const initiateResponse = await fetch('/api/cloud/upload/singlepart/requests/initiate', {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    bucket: BUCKET_NAME,
                    file_name: uploadState.videoFile.name
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
                console.error('[Upload] Missing presigned_url in response:', data);
                throw new Error('Server did not provide an upload URL');
            }

            uploadInfoRef.current = { key, public_url };
            console.log('[Upload] Successfully initiated. Got key:', key);

            // Step 2: Upload video file to presigned URL
            console.log('[Upload] Uploading video to presigned URL directly...');
            const uploadResponse = await fetch(presigned_url, {
                method: 'PUT',
                body: uploadState.videoFile,
                signal: abortControllerRef.current.signal
            });

            if (!uploadResponse.ok) {
                const errorText = await uploadResponse.text();
                throw new Error(`Failed to upload video to cloud: ${uploadResponse.status} ${uploadResponse.statusText}`);
            }

            setUploadState(prev => ({
                ...prev,
                uploadProgress: 100,
            }));

            console.log('[Upload] Video uploaded to cloud successfully');

            // Step 3: Save video metadata to database
            console.log('[Upload] Saving video metadata via local proxy...');
            const metadataResponse = await fetch('/api/tube/large-videos', {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    title: title.trim(),
                    description: description.trim() || 'Video uploaded via BowlersNetwork',
                    video_type: 'Split',
                    duration: uploadState.videoDuration || 0,
                    url: public_url,
                }),
                signal: abortControllerRef.current.signal
            });

            if (!metadataResponse.ok) {
                let errorMsg = 'Failed to save video metadata';
                try {
                    const errorData = await metadataResponse.json();
                    errorMsg = errorData.errors?.[0] || errorData.message || `Metadata error: ${metadataResponse.status}`;
                } catch (e) {
                    errorMsg = `Metadata error: ${metadataResponse.status} ${metadataResponse.statusText}`;
                }
                throw new Error(errorMsg);
            }

            console.log('[Upload] Video metadata saved successfully');

            // Success!
            setUploadState({
                step: 'success',
                error: null,
                uploadProgress: 100,
                videoFile: null,
                videoPreviewUrl: null,
                videoDuration: null,
            });

            // Reset form and redirect to media page (Splits tab) after a short delay to show success state
            setTimeout(() => {
                setTitle('');
                setDescription('');
                setIsTitleValid(false);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
                router.push('/media?tab=splits');
            }, 1500);
        } catch (error: any) {
            if (error.name === 'AbortError') {
                console.log('Upload cancelled by user');
                setUploadState({
                    step: 'idle',
                    error: 'Upload cancelled',
                    uploadProgress: 0,
                    videoFile: uploadState.videoFile,
                    videoPreviewUrl: uploadState.videoPreviewUrl,
                    videoDuration: uploadState.videoDuration,
                });
                return;
            }

            console.error('Upload error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to upload video. Please try again.';

            setUploadState({
                step: 'error',
                error: errorMessage,
                uploadProgress: 0,
                videoFile: uploadState.videoFile,
                videoPreviewUrl: uploadState.videoPreviewUrl,
                videoDuration: uploadState.videoDuration,
            });
        } finally {
            abortControllerRef.current = null;
            uploadInfoRef.current = null;
        }
    };

    // Check if user is authenticated
    if (!user || !user.authenticated) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-xl text-red-600 mb-4">Please log in to upload media</div>
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
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-4xl mx-auto px-4 py-6">
                    <Link
                        href="/media"
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="font-medium">Back to Media</span>
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">Upload Video</h1>
                    <p className="text-gray-600 mt-2">Share your bowling videos with the community</p>
                </div>
            </div>

            {/* Upload Form */}
            <div className="max-w-4xl mx-auto px-4 py-8">
                <form onSubmit={(e) => { e.preventDefault(); handleVideoUpload(); }} className="space-y-6">
                    {/* Video Details */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Video Details</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Title <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => {
                                            const newTitle = e.target.value;
                                            setTitle(newTitle);
                                            if (newTitle.trim() !== title.trim()) {
                                                setIsTitleValid(false);
                                                setTitleError(null);
                                            }
                                        }}
                                        placeholder="Enter a unique title for your video"
                                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${isTitleValid ? 'border-green-400 bg-green-50' : titleError ? 'border-red-400 bg-red-50' : 'border-gray-300'
                                            }`}
                                        disabled={uploadState.step === 'uploading'}
                                    />
                                    {isValidatingTitle && (
                                        <Loader className="absolute right-3 top-3 w-5 h-5 text-blue-600 animate-spin" />
                                    )}
                                    {isTitleValid && !isValidatingTitle && (
                                        <CheckCircle className="absolute right-3 top-3 w-5 h-5 text-green-600" />
                                    )}
                                    {titleError && !isValidatingTitle && (
                                        <X className="absolute right-3 top-3 w-5 h-5 text-red-600" />
                                    )}
                                </div>
                                {titleError && (
                                    <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
                                        <X className="w-4 h-4" />
                                        {titleError}
                                    </p>
                                )}
                                {isTitleValid && !isValidatingTitle && (
                                    <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                                        <CheckCircle className="w-4 h-4" />
                                        Title is unique and available
                                    </p>
                                )}
                                {isValidatingTitle && (
                                    <p className="text-sm text-blue-600 mt-2 flex items-center gap-1">
                                        <Loader className="w-4 h-4 animate-spin" />
                                        Checking title availability...
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Add a description for your video (optional)"
                                    rows={4}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                                    disabled={uploadState.step === 'uploading'}
                                />
                            </div>
                        </div>
                    </div>

                    {/* File Upload Area */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Video File</h2>

                        {!uploadState.videoFile ? (
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-green-500 hover:bg-green-50 transition-colors"
                            >
                                <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <p className="text-lg font-medium text-gray-700 mb-2">
                                    Click to upload or drag and drop
                                </p>
                                <p className="text-sm text-gray-500">
                                    Supported formats: MP4, WebM, MOV, and other common video formats
                                </p>
                                <p className="text-xs text-gray-400 mt-2">
                                    Maximum file size: 100MB
                                </p>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="video/*"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />
                            </div>
                        ) : (
                            <div className="border border-gray-200 rounded-lg p-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                                        <Video className="w-6 h-6 text-green-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-900 truncate">{uploadState.videoFile.name}</p>
                                        <p className="text-sm text-gray-500">{(uploadState.videoFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                                        {uploadState.videoDuration && (
                                            <p className="text-sm text-gray-500">Duration: {Math.round(uploadState.videoDuration)}s</p>
                                        )}

                                        {uploadState.step === 'uploading' && (
                                            <div className="mt-3">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-sm text-gray-600">Uploading...</span>
                                                    <div className="flex items-center gap-3">
                                                        <button
                                                            type="button"
                                                            onClick={handleAbort}
                                                            className="text-xs text-red-600 hover:text-red-700 font-medium"
                                                        >
                                                            Cancel
                                                        </button>
                                                        <span className="text-sm font-medium text-green-600">{uploadState.uploadProgress}%</span>
                                                    </div>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className="bg-green-600 h-2 rounded-full transition-all duration-300"
                                                        style={{ width: `${uploadState.uploadProgress}%` }}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {uploadState.step === 'success' && (
                                            <div className="flex items-center gap-2 mt-2 text-green-600">
                                                <CheckCircle className="w-4 h-4" />
                                                <span className="text-sm font-medium">Upload complete!</span>
                                            </div>
                                        )}
                                    </div>
                                    {uploadState.step !== 'uploading' && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (uploadState.videoPreviewUrl) {
                                                    URL.revokeObjectURL(uploadState.videoPreviewUrl);
                                                }
                                                setUploadState({
                                                    ...uploadState,
                                                    videoFile: null,
                                                    videoPreviewUrl: null,
                                                });
                                                if (fileInputRef.current) {
                                                    fileInputRef.current.value = '';
                                                }
                                            }}
                                            className="text-gray-400 hover:text-red-600 transition-colors"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    )}
                                    {uploadState.step === 'uploading' && (
                                        <button
                                            type="button"
                                            onClick={handleAbort}
                                            className="text-gray-400 hover:text-red-600 transition-colors"
                                            title="Cancel Upload"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Error Message */}
                    {uploadState.error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                            <p className="text-sm text-red-800">{uploadState.error}</p>
                        </div>
                    )}

                    {/* Success Message */}
                    {uploadState.step === 'success' && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-green-800 mb-1">Video uploaded successfully!</p>
                                    <p className="text-xs text-green-700">Your video has been uploaded and is ready to share.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Submit Button */}
                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={() => router.push('/media')}
                            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                            disabled={uploadState.step === 'uploading'}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={uploadState.step === 'uploading' || !uploadState.videoFile || !isTitleValid || uploadState.step === 'success'}
                            className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {uploadState.step === 'uploading' ? 'Uploading...' : uploadState.step === 'success' ? 'Upload Complete' : 'Upload Video'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
