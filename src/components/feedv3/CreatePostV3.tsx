'use client';

import { ImageIcon, BarChart3, Smile, X, Plus, Minus, Clock } from 'lucide-react';
import { useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCloudUpload } from '@/lib/useCloudUpload';
import { api } from '@/lib/api';
import Image from 'next/image';
import { CreateDefaultPostRequest, CreatePollRequest } from '@/types/feedv3';

interface CreatePostV3Props {
    onPostCreated?: () => void;
}

type PostMode = 'default' | 'poll';

export default function CreatePostV3({ onPostCreated }: CreatePostV3Props) {
    const { user } = useAuth();
    const [isExpanded, setIsExpanded] = useState(false);
    const [postMode, setPostMode] = useState<PostMode>('default');

    // Default post state
    const [postText, setPostText] = useState('');
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});

    // Poll state
    const [pollTitle, setPollTitle] = useState('');
    const [pollDescription, setPollDescription] = useState('');
    const [pollOptions, setPollOptions] = useState<string[]>(['', '']);
    const [pollType, setPollType] = useState<'single' | 'multiple'>('single');
    const [pollExpiryHours, setPollExpiryHours] = useState(24);

    const [isPosting, setIsPosting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { uploadFile } = useCloudUpload();

    const handleExpandClick = () => {
        setIsExpanded(true);
    };

    const handleCollapse = () => {
        if (!isPosting) {
            setIsExpanded(false);
            resetForm();
        }
    };

    const resetForm = () => {
        setPostMode('default');
        setPostText('');
        setSelectedFiles([]);
        setUploadProgress({});
        setPollTitle('');
        setPollDescription('');
        setPollOptions(['', '']);
        setPollType('single');
        setPollExpiryHours(24);
    };

    const handlePhotoVideoClick = () => {
        setPostMode('default');
        fileInputRef.current?.click();
    };

    const handlePollClick = () => {
        setPostMode('poll');
        setIsExpanded(true);
    };

    const handleEmojiClick = () => {
        setPostMode('default');
        setIsExpanded(true);
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
    };

    // Poll option handlers
    const addPollOption = () => {
        if (pollOptions.length < 10) {
            setPollOptions([...pollOptions, '']);
        }
    };

    const removePollOption = (index: number) => {
        if (pollOptions.length > 2) {
            setPollOptions(pollOptions.filter((_, i) => i !== index));
        }
    };

    const updatePollOption = (index: number, value: string) => {
        const newOptions = [...pollOptions];
        newOptions[index] = value;
        setPollOptions(newOptions);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (isPosting) return;

        try {
            setIsPosting(true);

            if (postMode === 'poll') {
                // Validation for poll
                if (!pollTitle.trim()) {
                    alert('Please enter a poll title');
                    return;
                }
                const validOptions = pollOptions.filter(opt => opt.trim());
                if (validOptions.length < 2) {
                    alert('Please enter at least 2 poll options');
                    return;
                }

                const payload: CreatePollRequest = {
                    title: pollTitle.trim(),
                    options: validOptions,
                    poll_type: pollType,
                    expiry_hours: pollExpiryHours,
                };

                if (pollDescription.trim()) {
                    payload.description = pollDescription.trim();
                }

                await api.post('/api/newsfeed/v1/create/poll/', payload);
            } else {
                // Validation for default post
                if (!postText.trim() && selectedFiles.length === 0) return;

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
                const payload: CreateDefaultPostRequest = {};

                if (postText.trim()) {
                    payload.text = postText.trim();
                }

                if (mediaUrls.length > 0) {
                    payload.media_urls = mediaUrls;
                }

                // Post to FeedV3 API
                await api.post('/api/newsfeed/v1/create/default/', payload);
            }

            // Reset form and collapse
            resetForm();
            setIsExpanded(false);

            if (onPostCreated) {
                onPostCreated();
            }
        } catch (error) {
            console.error('Error creating post:', error);
            alert('Failed to create post. Please try again.');
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

    const canSubmit = postMode === 'poll'
        ? pollTitle.trim() && pollOptions.filter(opt => opt.trim()).length >= 2
        : postText.trim() || selectedFiles.length > 0;

    return (
        <div className="bg-white rounded-2xl border border-[#f3f4f6] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)] overflow-hidden">
            <div className="px-4 pt-4 pb-0">
                <form onSubmit={handleSubmit}>
                    <div className="flex items-start gap-3 mb-4">
                        {/* Profile Picture */}
                        <img
                            src={user?.profile_media?.profile_picture_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=Bob"}
                            alt="Profile"
                            className="w-12 h-12 rounded-full object-cover shrink-0"
                        />

                        {/* Input Area */}
                        <div className="flex-1 min-w-0">
                            {/* Default Post Input */}
                            {postMode === 'default' && (
                                <>
                                    {!isExpanded ? (
                                        <div
                                            onClick={handleExpandClick}
                                            className="h-12 w-full rounded-[14px] bg-[#f9fafb] px-4 flex items-center text-[16px] text-[#6a7282] cursor-pointer"
                                        >
                                            What&apos;s happening?
                                        </div>
                                    ) : (
                                        <textarea
                                            value={postText}
                                            onChange={(e) => setPostText(e.target.value)}
                                            placeholder="What's happening?"
                                            className="w-full rounded-[14px] bg-[#f9fafb] px-4 py-3 text-[16px] leading-6 text-[#364153] placeholder:text-[#6a7282] border-0 resize-none focus:outline-none min-h-[120px]"
                                            disabled={isPosting}
                                            autoFocus
                                        />
                                    )}
                                </>
                            )}

                            {/* Poll Input */}
                            {postMode === 'poll' && isExpanded && (
                                <div className="space-y-4">
                                    {/* Poll Title */}
                                    <input
                                        type="text"
                                        value={pollTitle}
                                        onChange={(e) => setPollTitle(e.target.value)}
                                        placeholder="Ask a question..."
                                        maxLength={100}
                                        className="w-full text-xl text-gray-800 placeholder-gray-400 border-0 focus:outline-none"
                                        disabled={isPosting}
                                        autoFocus
                                    />

                                    {/* Poll Description */}
                                    <textarea
                                        value={pollDescription}
                                        onChange={(e) => setPollDescription(e.target.value)}
                                        placeholder="Add a description (optional)"
                                        className="w-full text-sm text-gray-600 placeholder-gray-400 border border-gray-200 rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-[#8BC342]"
                                        rows={2}
                                        disabled={isPosting}
                                    />

                                    {/* Poll Options */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Options</label>
                                        {pollOptions.map((option, index) => (
                                            <div key={index} className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={option}
                                                    onChange={(e) => updatePollOption(index, e.target.value)}
                                                    placeholder={`Option ${index + 1}`}
                                                    maxLength={100}
                                                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8BC342]"
                                                    disabled={isPosting}
                                                />
                                                {pollOptions.length > 2 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removePollOption(index)}
                                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                    >
                                                        <Minus className="w-5 h-5" />
                                                    </button>
                                                )}
                                            </div>
                                        ))}

                                        {pollOptions.length < 10 && (
                                            <button
                                                type="button"
                                                onClick={addPollOption}
                                                className="flex items-center gap-2 text-[#8BC342] hover:text-[#6fa332] text-sm font-medium"
                                            >
                                                <Plus className="w-4 h-4" />
                                                Add option
                                            </button>
                                        )}
                                    </div>

                                    {/* Poll Settings */}
                                    <div className="flex flex-wrap gap-4 pt-2 border-t border-gray-100">
                                        {/* Poll Type */}
                                        <div className="flex items-center gap-2">
                                            <label className="text-sm text-gray-600">Type:</label>
                                            <select
                                                value={pollType}
                                                onChange={(e) => setPollType(e.target.value as 'single' | 'multiple')}
                                                className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#8BC342]"
                                                disabled={isPosting}
                                            >
                                                <option value="single">Single choice</option>
                                                <option value="multiple">Multiple choice</option>
                                            </select>
                                        </div>

                                        {/* Expiry */}
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-gray-400" />
                                            <label className="text-sm text-gray-600">Expires in:</label>
                                            <select
                                                value={pollExpiryHours}
                                                onChange={(e) => setPollExpiryHours(Number(e.target.value))}
                                                className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#8BC342]"
                                                disabled={isPosting}
                                            >
                                                <option value={1}>1 hour</option>
                                                <option value={6}>6 hours</option>
                                                <option value={12}>12 hours</option>
                                                <option value={24}>24 hours</option>
                                                <option value={48}>2 days</option>
                                                <option value={72}>3 days</option>
                                                <option value={168}>1 week</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
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

                    {/* Selected Files Preview (Default mode only) */}
                    {postMode === 'default' && selectedFiles.length > 0 && isExpanded && (
                        <div className="mb-4">
                            <div className={`grid gap-2 ${selectedFiles.length === 1 ? 'grid-cols-1' :
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

                    {/* Action Buttons Row */}
                    <div className="h-[57px] border-t border-[#f3f4f6] flex items-center justify-between pt-px">
                        <div className="flex items-center gap-4 sm:gap-5">
                            {/* Image/Video Button */}
                            <button
                                type="button"
                                onClick={handlePhotoVideoClick}
                                disabled={isPosting || postMode === 'poll'}
                                className={`flex items-center gap-2 text-[14px] leading-5 text-[#4a5565] transition-colors hover:text-[#1e2939] disabled:opacity-50 disabled:cursor-not-allowed shrink-0 ${postMode === 'poll' ? 'opacity-50' : ''}`}
                                title="Add photo or video"
                            >
                                <ImageIcon className="w-5 h-5 shrink-0" />
                                <span>Media</span>
                            </button>

                            {/* Poll Button */}
                            <button
                                type="button"
                                onClick={handlePollClick}
                                disabled={isPosting}
                                className={`flex items-center gap-2 text-[14px] leading-5 transition-colors shrink-0 ${postMode === 'poll'
                                    ? 'text-[#1e2939]'
                                    : 'text-[#4a5565] hover:text-[#1e2939]'
                                    } disabled:opacity-50`}
                                title="Create a poll"
                            >
                                <BarChart3 className="w-5 h-5 shrink-0" />
                                <span>Poll</span>
                            </button>

                            {/* Emoji Button */}
                            <button
                                type="button"
                                onClick={handleEmojiClick}
                                disabled={isPosting}
                                className="flex items-center justify-center text-[#4a5565] hover:text-[#1e2939] transition-colors disabled:opacity-50 shrink-0"
                                title="Add emoji"
                            >
                                <Smile className="w-5 h-5" />
                            </button>

                        </div>

                        {/* Post Button */}
                        <button
                            type="submit"
                            disabled={isPosting || isUploadingAny || !canSubmit}
                            className={`h-10 px-7 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-white text-[16px] leading-6 whitespace-nowrap ${postMode === 'poll' ? 'bg-[#00c950] hover:bg-[#00b347]' : ''
                                }`}
                            style={{
                                backgroundColor: (isPosting || isUploadingAny || !canSubmit)
                                    ? '#d1d5db'
                                    : postMode === 'poll' ? undefined : '#00c950'
                            }}
                        >
                            {isPosting ? 'Posting...' : postMode === 'poll' ? 'Create Poll' : 'Post'}
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
