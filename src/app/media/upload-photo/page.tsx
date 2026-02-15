'use client';

import { useState, useRef, useEffect } from 'react';
import { Upload, AlertCircle, Check, X, Loader, ArrowLeft, Image as ImageIcon, CheckCircle } from 'lucide-react';
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
    uploadSpeed: string; // e.g., "2.5 Mbps", "1024 Kbps"
    photoFile: File | null;
    photoPreviewUrl: string | null;
}

export default function PhotoUploadPage() {
    const router = useRouter();
    const { user } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const abortControllerRef = useRef<AbortController | null>(null);
    const uploadInfoRef = useRef<{ key: string; public_url: string } | null>(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [uploadState, setUploadState] = useState<UploadState>({
        step: 'idle',
        error: null,
        uploadProgress: 0,
        uploadSpeed: '0 Kbps',
        photoFile: null,
        photoPreviewUrl: null,
    });

    // Handle file selection
    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setUploadState({
                ...uploadState,
                step: 'error',
                error: 'Please select a valid image file',
                uploadSpeed: '0 Kbps',
            });
            return;
        }

        // Create preview URL
        const previewUrl = URL.createObjectURL(file);

        setUploadState({
            step: 'idle',
            error: null,
            uploadProgress: 0,
            uploadSpeed: '0 Kbps',
            photoFile: file,
            photoPreviewUrl: previewUrl,
        });
    };

    // Format bytes to human-readable speed (Kbps, Mbps, Gbps)
    const formatSpeed = (bytesPerSecond: number): string => {
        const bitsPerSecond = bytesPerSecond * 8;
        
        if (bitsPerSecond >= 1_000_000_000) {
            return (bitsPerSecond / 1_000_000_000).toFixed(2) + ' Gbps';
        } else if (bitsPerSecond >= 1_000_000) {
            return (bitsPerSecond / 1_000_000).toFixed(2) + ' Mbps';
        } else {
            return (bitsPerSecond / 1_000).toFixed(2) + ' Kbps';
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

    // Upload file with progress tracking
    const uploadWithProgress = (file: File, presignedUrl: string): Promise<void> => {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            let lastLoaded = 0;
            let lastSpeedCalculationTime = Date.now();
            let currentLoaded = 0; // Track current loaded bytes
            let speedUpdateInterval: NodeJS.Timeout | null = null;

            // Track upload progress
            xhr.upload.addEventListener('progress', (e) => {
                if (e.lengthComputable) {
                    currentLoaded = e.loaded; // Update current loaded bytes
                    const percentComplete = Math.round((e.loaded / e.total) * 100);
                    console.log(`[Upload] Progress: ${percentComplete}%`);
                    setUploadState(prev => ({
                        ...prev,
                        uploadProgress: percentComplete,
                    }));
                }
            });

            // Calculate speed every 1 second (stable average)
            speedUpdateInterval = setInterval(() => {
                const currentTime = Date.now();
                const timeElapsedSeconds = (currentTime - lastSpeedCalculationTime) / 1000;
                const bytesTransferred = Math.max(0, currentLoaded - lastLoaded);

                const bytesPerSecond = bytesTransferred / Math.max(timeElapsedSeconds, 1);
                const speed = formatSpeed(bytesPerSecond);

                console.log(`[Upload] Speed: ${speed} (${bytesTransferred} bytes in ${timeElapsedSeconds}s)`);
                setUploadState(prev => ({
                    ...prev,
                    uploadSpeed: speed,
                }));

                lastLoaded = currentLoaded;
                lastSpeedCalculationTime = currentTime;
            }, 1000); // Update every 1 second

            // Handle completion
            xhr.addEventListener('load', () => {
                if (speedUpdateInterval) clearInterval(speedUpdateInterval);
                if (xhr.status >= 200 && xhr.status < 300) {
                    console.log('[Upload] File uploaded successfully');
                    resolve();
                } else {
                    reject(new Error(`Upload failed with status ${xhr.status}: ${xhr.statusText}`));
                }
            });

            // Handle errors
            xhr.addEventListener('error', () => {
                if (speedUpdateInterval) clearInterval(speedUpdateInterval);
                reject(new Error('Upload failed: Network error'));
            });

            // Handle abort
            xhr.addEventListener('abort', () => {
                if (speedUpdateInterval) clearInterval(speedUpdateInterval);
                reject(new Error('Upload aborted'));
            });

            // Set up abort signal
            const abortHandler = () => {
                if (speedUpdateInterval) clearInterval(speedUpdateInterval);
                xhr.abort();
            };
            abortControllerRef.current?.signal.addEventListener('abort', abortHandler);

            // Start upload
            xhr.open('PUT', presignedUrl);
            xhr.send(file);
        });
    };

    // Handle photo upload
    const handlePhotoUpload = async () => {
        if (!uploadState.photoFile) {
            setUploadState({
                ...uploadState,
                step: 'error',
                error: 'Please select a photo file',
            });
            return;
        }

        if (!title.trim()) {
            setUploadState({
                ...uploadState,
                step: 'error',
                error: 'Please enter a title',
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
                throw new Error('You must be logged in to upload photos. Please sign in again.');
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
                    file_name: uploadState.photoFile.name
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

            // Step 2: Upload photo file to presigned URL with progress tracking
            console.log('[Upload] Uploading photo to presigned URL directly...');
            await uploadWithProgress(uploadState.photoFile, presigned_url);

            // Step 3: Save photo metadata to database
            console.log('[Upload] Saving photo metadata via local proxy...');
            const metadataResponse = await fetch('/api/photos', {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    title: title.trim(),
                    description: description.trim() || 'Photo uploaded via BowlersNetwork',
                    url: public_url,
                }),
                signal: abortControllerRef.current.signal
            });

            if (!metadataResponse.ok) {
                let errorMsg = 'Failed to save photo metadata';
                try {
                    const errorData = await metadataResponse.json();
                    errorMsg = errorData.errors?.[0] || errorData.message || `Metadata error: ${metadataResponse.status}`;
                } catch (e) {
                    errorMsg = `Metadata error: ${metadataResponse.status} ${metadataResponse.statusText}`;
                }
                throw new Error(errorMsg);
            }

            console.log('[Upload] Photo metadata saved successfully');

            const responseData = await metadataResponse.json();
            const photoUid = responseData.uid;

            // Success!
            setUploadState({
                step: 'success',
                error: null,
                uploadProgress: 100,
                uploadSpeed: '0 Kbps',
                photoFile: null,
                photoPreviewUrl: null,
            });

            // Reset form and redirect to photo details page after a short delay to show success state
            setTimeout(() => {
                setTitle('');
                setDescription('');
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
                if (photoUid) {
                    router.push(`/media/photos/${photoUid}`);
                } else {
                    router.push('/media?tab=photos');
                }
            }, 1500);
        } catch (error: any) {
            if (error.name === 'AbortError') {
                console.log('Upload cancelled by user');
                setUploadState({
                    step: 'idle',
                    error: 'Upload cancelled',
                    uploadProgress: 0,
                    uploadSpeed: '0 Kbps',
                    photoFile: uploadState.photoFile,
                    photoPreviewUrl: uploadState.photoPreviewUrl,
                });
                return;
            }

            console.error('Upload error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to upload photo. Please try again.';

            setUploadState({
                step: 'error',
                error: errorMessage,
                uploadProgress: 0,
                uploadSpeed: '0 Kbps',
                photoFile: uploadState.photoFile,
                photoPreviewUrl: uploadState.photoPreviewUrl,
            });
        } finally {
            abortControllerRef.current = null;
            uploadInfoRef.current = null;
        }
    };

    // Check if user is authenticated
    if (!user || !user.authenticated) {
        return (
            <div className="min-h-screen bg-linear-to-br from-green-50 to-green-100 flex items-center justify-center">
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
                    <h1 className="text-3xl font-bold text-gray-900">Upload Photo</h1>
                    <p className="text-gray-600 mt-2">Share your bowling photos with the community</p>
                </div>
            </div>

            {/* Upload Form */}
            <div className="max-w-4xl mx-auto px-4 py-8">
                <form onSubmit={(e) => { e.preventDefault(); handlePhotoUpload(); }} className="space-y-6">
                    {/* Photo Details */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Photo Details</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Enter a title for your photo"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    disabled={uploadState.step === 'uploading'}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Add a description for your photo (optional)"
                                    rows={4}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                                    disabled={uploadState.step === 'uploading'}
                                />
                            </div>
                        </div>
                    </div>

                    {/* File Upload Area */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Photo File</h2>

                        {!uploadState.photoFile ? (
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-green-500 hover:bg-green-50 transition-colors"
                            >
                                <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <p className="text-lg font-medium text-gray-700 mb-2">
                                    Click to upload or drag and drop
                                </p>
                                <p className="text-sm text-gray-500">
                                    Supported formats: JPG, PNG, GIF, WEBP
                                </p>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />
                            </div>
                        ) : (
                            <div className="border border-gray-200 rounded-lg p-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                                        {uploadState.photoPreviewUrl ? (
                                            <img src={uploadState.photoPreviewUrl} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <ImageIcon className="w-6 h-6 text-green-600" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-900 truncate">{uploadState.photoFile.name}</p>
                                        <p className="text-sm text-gray-500">{(uploadState.photoFile.size / (1024 * 1024)).toFixed(2)} MB</p>

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
                                                        <span className="text-xs text-blue-600 font-medium">{uploadState.uploadSpeed}</span>
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
                                                if (uploadState.photoPreviewUrl) {
                                                    URL.revokeObjectURL(uploadState.photoPreviewUrl);
                                                }
                                                setUploadState({
                                                    ...uploadState,
                                                    photoFile: null,
                                                    photoPreviewUrl: null,
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
                                    <p className="text-sm font-medium text-green-800 mb-1">Photo uploaded successfully!</p>
                                    <p className="text-xs text-green-700">Your photo has been uploaded and is ready to share.</p>
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
                            disabled={uploadState.step === 'uploading' || !uploadState.photoFile || !title.trim() || uploadState.step === 'success'}
                            className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {uploadState.step === 'uploading' ? 'Uploading...' : uploadState.step === 'success' ? 'Upload Complete' : 'Upload Photo'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
