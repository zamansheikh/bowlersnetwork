'use client';

import { ImageIcon, BarChart3, Calendar, X } from 'lucide-react';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useCloudUpload } from '@/lib/useCloudUpload';
import { api } from '@/lib/api';
import Image from 'next/image';

interface CreatePostProps {
    onPostCreated?: () => void;
}

export default function CreatePost({ onPostCreated }: CreatePostProps) {
    const { user } = useAuth();
    const router = useRouter();
    const [isExpanded, setIsExpanded] = useState(false);
    const [postText, setPostText] = useState('');
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
    const [isPosting, setIsPosting] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
    const [notImplementedMessage, setNotImplementedMessage] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { uploadFile } = useCloudUpload();

    const handleExpandClick = () => {
        setIsExpanded(true);
    };

    const handleCollapse = () => {
        if (!isPosting) {
            setIsExpanded(false);
            setPostText('');
            setSelectedFiles([]);
            setUploadedUrls([]);
            setUploadProgress({});
        }
    };

    const handlePhotoVideoClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const newFiles = Array.from(files);
        setSelectedFiles(prev => [...prev, ...newFiles]);
        setIsExpanded(true);
    };

    const removeFile = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
        setUploadedUrls(prev => prev.filter((_, i) => i !== index));
    };

    const handleNotImplemented = (feature: string) => {
        setNotImplementedMessage(feature);
        setTimeout(() => setNotImplementedMessage(''), 2000);
    };

    const handleEventClick = () => {
        router.push('/events');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation: at least text or files required
        if (!postText.trim() && selectedFiles.length === 0) return;
        if (isPosting) return;

        try {
            setIsPosting(true);

            // Upload files to cloud if any
            const mediaUrls: string[] = [];
            if (selectedFiles.length > 0) {
                for (let i = 0; i < selectedFiles.length; i++) {
                    const file = selectedFiles[i];
                    const fileId = `${file.name}-${i}`;
                    setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));

                    try {
                        const result = await uploadFile(file, 'cdn');

                        if (result.success && result.publicUrl) {
                            mediaUrls.push(result.publicUrl);
                        }
                        
                        setUploadProgress(prev => {
                            const newProgress = { ...prev };
                            delete newProgress[fileId];
                            return newProgress;
                        });
                    } catch (error) {
                        console.error('Upload failed for file:', file.name, error);
                        setUploadProgress(prev => {
                            const newProgress = { ...prev };
                            delete newProgress[fileId];
                            return newProgress;
                        });
                    }
                }
            }

            // Build payload
            const payload: { text?: string; media_urls?: string[] } = {};
            
            if (postText.trim()) {
                payload.text = postText.trim();
            }
            
            if (mediaUrls.length > 0) {
                payload.media_urls = mediaUrls;
            }

            // Post to API
            await api.post('/api/posts/v2', payload);

            // Reset form
            setPostText('');
            setSelectedFiles([]);
            setUploadedUrls([]);
            setUploadProgress({});
            setIsExpanded(false);

            if (onPostCreated) {
                onPostCreated();
            }
        } catch (error) {
            console.error('Error creating post:', error);
        } finally {
            setIsPosting(false);
        }
    };

    const isVideo = (file: File): boolean => {
        return file.type.startsWith('video/');
    };

    const getPreviewUrl = (file: File): string => {
        return URL.createObjectURL(file);
    };

    const isUploadingAny = Object.keys(uploadProgress).length > 0;

    return (
        <div className="bg-white border-b border-gray-200">
            <div className="p-4 md:p-6">
                <form onSubmit={handleSubmit}>
                    <div className="flex gap-4 mb-4">
                        {/* Profile Picture */}
                        <img
                            src={user?.profile_picture_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=Bob"}
                            alt="Profile"
                            className="w-12 h-12 rounded-full object-cover shrink-0"
                        />
                        
                        {/* Input Area */}
                        <div className="flex-1 min-w-0">
                            {/* Not Implemented Message */}
                            {notImplementedMessage && (
                                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700 text-sm">
                                    {notImplementedMessage} is not implemented yet.
                                </div>
                            )}

                            {/* Textarea - Expandable */}
                            {!isExpanded ? (
                                <div
                                    onClick={handleExpandClick}
                                    className="text-xl text-gray-500 placeholder-gray-500 p-2 rounded-2xl hover:bg-gray-50 cursor-pointer transition-colors"
                                >
                                    What&apos;s happening?!
                                </div>
                            ) : (
                                <textarea
                                    value={postText}
                                    onChange={(e) => setPostText(e.target.value)}
                                    placeholder="What's happening?!"
                                    className="w-full text-xl text-gray-800 placeholder-gray-400 border-0 resize-none focus:outline-none min-h-[120px]"
                                    disabled={isPosting}
                                    autoFocus
                                />
                            )}
                        </div>
                    </div>

                    {/* Upload Progress */}
                    {isUploadingAny && (
                        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-sm text-blue-700 mb-2">Uploading media...</p>
                            {Object.entries(uploadProgress).map(([fileId, progress]) => (
                                <div key={fileId} className="mb-2">
                                    <div className="w-full bg-blue-100 rounded-full h-2">
                                        <div
                                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Selected Files Preview */}
                    {selectedFiles.length > 0 && isExpanded && (
                        <div className="mb-4">
                            <div className={`grid gap-2 ${
                                selectedFiles.length === 1 ? 'grid-cols-1' :
                                selectedFiles.length === 2 ? 'grid-cols-2' :
                                selectedFiles.length === 3 ? 'grid-cols-3' :
                                'grid-cols-4'
                            } max-h-96 overflow-y-auto`}>
                                {selectedFiles.map((file, index) => (
                                    <div key={index} className="relative group aspect-square">
                                        {isVideo(file) ? (
                                            <video
                                                src={getPreviewUrl(file)}
                                                className="w-full h-full object-cover rounded-lg border-2 border-gray-200"
                                                muted
                                            />
                                        ) : (
                                            <Image
                                                src={getPreviewUrl(file)}
                                                alt="Preview"
                                                width={200}
                                                height={200}
                                                className="w-full h-full object-cover rounded-lg border-2 border-gray-200"
                                            />
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => removeFile(index)}
                                            className="absolute top-2 right-2 w-7 h-7 bg-black bg-opacity-70 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-opacity-90"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Action Buttons Row - Full Width */}
                    <div className={`flex items-center justify-between gap-2 border-t border-gray-100 pt-3`}>
                        <div className="flex items-center gap-1 sm:gap-4">
                            {/* Image/Video Button */}
                            <button
                                type="button"
                                onClick={handlePhotoVideoClick}
                                disabled={isPosting}
                                className="flex items-center gap-1.5 h-10 px-2 sm:px-3 rounded-full hover:bg-green-50 text-green-500 transition-colors hover:text-green-600 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                                title="Add photo or video"
                            >
                                <ImageIcon className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
                                <span className="text-xs sm:text-sm font-bold">Media</span>
                            </button>

                            {/* Poll Button */}
                            <button
                                type="button"
                                onClick={() => handleNotImplemented('Poll feature')}
                                disabled={isPosting}
                                className="flex items-center gap-1.5 h-10 px-2 sm:px-3 rounded-full hover:bg-green-50 text-green-500 transition-colors hover:text-green-600 disabled:opacity-50 shrink-0"
                                title="Create a poll"
                            >
                                <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
                                <span className="text-xs sm:text-sm font-bold">Poll</span>
                            </button>

                            {/* Event Button */}
                            <button
                                type="button"
                                onClick={handleEventClick}
                                disabled={isPosting}
                                className="flex items-center gap-1.5 h-10 px-2 sm:px-3 rounded-full hover:bg-green-50 text-green-500 transition-colors hover:text-green-600 disabled:opacity-50 shrink-0"
                                title="Go to Events"
                            >
                                <Calendar className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
                                <span className="text-xs sm:text-sm font-bold">Event</span>
                            </button>
                        </div>

                        {/* Post Button */}
                        <button
                            type="submit"
                            disabled={isPosting || isUploadingAny || (!postText.trim() && selectedFiles.length === 0)}
                            className="font-bold py-2 px-6 sm:px-10 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm sm:text-lg whitespace-nowrap"
                            style={{ 
                                backgroundColor: (isPosting || isUploadingAny || (!postText.trim() && selectedFiles.length === 0)) 
                                    ? '#d1d5db' 
                                    : '#8BC342' 
                            }}
                        >
                            {isPosting ? 'Posting...' : 'Post'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Hidden File Input */}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                multiple
                accept="image/*,video/*"
                className="hidden"
            />
        </div>
    );
}
