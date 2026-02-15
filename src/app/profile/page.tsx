'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Camera, Play, MapPin, UserCheck, Heart, Share2, AlertCircle, X, Lock, Globe, Edit2, Mail, Shield, Video, ImageIcon, Upload, Loader, Search, ChevronDown, Dumbbell, Building2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCloudUpload } from '@/lib/useCloudUpload';
import { useMapboxGeocoding } from '@/lib/useMapboxGeocoding';
import { GeocodingResult } from '@/lib/mapboxGeocodingService';
import { BowlingCenter, FeedPost } from '@/types';
import AddressModal from '@/components/AddressModal';
import HomeCenterModal from '@/components/HomeCenterModal';
import FollowersModal from '@/components/FollowersModal';
import FeedPostCard from '@/components/FeedPostCard';
import ImageCropperModal from '@/components/ImageCropperModal';
import { api } from '@/lib/api';
import axios from 'axios';

export default function ProfilePage() {
    const { user, refreshUser } = useAuth();
    const profileUpload = useCloudUpload();
    const coverUpload = useCloudUpload();
    const videoUpload = useCloudUpload();
    const { geocodeMultiple, results: addressSuggestions, isLoading: isGeocodingLoading } = useMapboxGeocoding();

    const [editMode, setEditMode] = useState({
        name: false,
        bio: false,
        gender: false,
        birthdate: false,
        address: false,
        ballHandling: false
    });
    const [addressModalOpen, setAddressModalOpen] = useState(false);
    const [homeCenterModalOpen, setHomeCenterModalOpen] = useState(false);
    const [followersModalOpen, setFollowersModalOpen] = useState(false);
    const [followingModalOpen, setFollowingModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [uploadMessage, setUploadMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [activeTab, setActiveTab] = useState<'info' | 'cards' | 'stats' | 'posts' | 'media'>('info');
    const [bowlingStats, setBowlingStats] = useState({
        average: 0,
        high_game: 0,
        high_series: 0,
        experience: 0
    });
    const [editingStats, setEditingStats] = useState(false);
    const [showAddressSuggestions, setShowAddressSuggestions] = useState(false);
    const [addressSearchQuery, setAddressSearchQuery] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const coverFileInputRef = useRef<HTMLInputElement>(null);
    const videoInputRef = useRef<HTMLInputElement>(null);
    const addressDebounceTimer = useRef<NodeJS.Timeout | undefined>(undefined);
    const addressSuggestionsRef = useRef<HTMLDivElement>(null);

    // Image cropping state
    const [cropModalOpen, setCropModalOpen] = useState(false);
    const [tempImageSrc, setTempImageSrc] = useState<string | null>(null);
    const [activeCropType, setActiveCropType] = useState<'profile' | 'cover'>('profile');

    // Optimistic UI state
    const [displayAddress, setDisplayAddress] = useState<{ address: string, zipcode: string } | null>(null);
    const [displayHomeCenter, setDisplayHomeCenter] = useState<{ name: string, address: string, id: number, is_public: boolean } | null>(null);

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        bio: '',
        gender: '',
        birthdate: '',
        address: '',
        zipcode: '',
        latitude: '',
        longitude: '',
        handedness: '',
        ball_carry: '',
    });

    const [privacySettings, setPrivacySettings] = useState({
        bio: true,
        gender: true,
        birthdate: true,
        address: false,
        ballHandling: true
    });

    const [expandedSections, setExpandedSections] = useState({
        stats: false,
        personal: false,
        account: false
    });

    const [posts, setPosts] = useState<FeedPost[]>([]);
    const [postsLoading, setPostsLoading] = useState(false);

    const fetchUserPosts = async () => {
        try {
            setPostsLoading(true);
            const response = await api.get('/api/posts/v2');
            setPosts(response.data || []);
        } catch (err) {
            console.error('Error fetching user posts:', err);
        } finally {
            setPostsLoading(false);
        }
    };

    const toggleSection = (section: keyof typeof expandedSections) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    // Load user data when component mounts
    useEffect(() => {
        if (user && user.authenticated) {
            // Parse ball handling description if available
            let handedness = '';
            let ball_carry = '';
            if (user.ball_handling_style?.description) {
                const desc = user.ball_handling_style.description;
                if (desc.includes('Righty')) handedness = 'Righty';
                else if (desc.includes('Lefty')) handedness = 'Lefty';

                if (desc.includes('One handed')) ball_carry = 'One handed';
                else if (desc.includes('Two handed')) ball_carry = 'Two handed';
            }

            setFormData(prev => ({
                ...prev,
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                bio: user.bio?.content || '',
                gender: (user.gender_data?.role === 'Women' ? 'Female' : user.gender_data?.role) || '',
                birthdate: user.birthdate_data?.date || '',
                address: user.address_data?.address_str || '',
                zipcode: user.address_data?.zipcode || '',
                latitude: '',
                longitude: '',
                handedness: handedness,
                ball_carry: ball_carry,
            }));

            setPrivacySettings(prev => ({
                ...prev,
                bio: user.bio?.is_public ?? true,
                gender: user.gender_data?.is_public ?? true,
                birthdate: user.birthdate_data?.is_public ?? true,
                address: user.address_data?.is_public ?? false,
                ballHandling: user.ball_handling_style?.is_public ?? true,
            }));

            // Initialize optimistic UI state
            if (user.address_data) {
                setDisplayAddress({
                    address: user.address_data.address_str,
                    zipcode: user.address_data.zipcode
                });
            }

            if (user.home_center_data?.center) {
                setDisplayHomeCenter({
                    name: user.home_center_data.center.name,
                    address: user.home_center_data.center.address_str || '',
                    id: user.home_center_data.center.id,
                    is_public: user.home_center_data.is_public
                });
            }

            // Fetch bowling stats
            fetchBowlingStats();
        }
    }, [user]);

    useEffect(() => {
        if (activeTab === 'posts') {
            fetchUserPosts();
        }
    }, [activeTab]);

    // Fetch bowling stats
    const fetchBowlingStats = async () => {
        if (!user || !user.authenticated) return;

        try {
            const baseUrl = 'https://test.bowlersnetwork.com';
            const headers = {
                'Authorization': `Bearer ${user.access_token}`,
                'Content-Type': 'application/json',
            };

            const response = await axios.get(`${baseUrl}/api/stats/bowling`, { headers });

            if (response.data && response.data.bowling_stat) {
                setBowlingStats(response.data.bowling_stat);
            }
        } catch (error) {
            console.error('Error fetching bowling stats:', error);
        }
    };

    const handleSaveField = async (field: 'name' | 'bio' | 'gender' | 'birthdate' | 'address' | 'ballHandling') => {
        if (!user || !user.authenticated) return;

        setIsSaving(true);
        try {
            const baseUrl = 'https://test.bowlersnetwork.com';
            const headers = {
                'Authorization': `Bearer ${user.access_token}`,
                'Content-Type': 'application/json',
            };

            if (field === 'name') {
                await axios.post(
                    `${baseUrl}/api/profile/update/name`,
                    {
                        first_name: formData.first_name,
                        last_name: formData.last_name
                    },
                    { headers }
                );
            } else if (field === 'bio') {
                await axios.post(
                    `${baseUrl}/api/profile/bio`,
                    {
                        content: formData.bio,
                        is_public: privacySettings.bio
                    },
                    { headers }
                );
            } else if (field === 'gender') {
                await axios.post(
                    `${baseUrl}/api/profile/gender`,
                    {
                        role: formData.gender,
                        is_public: privacySettings.gender
                    },
                    { headers }
                );
            } else if (field === 'ballHandling') {
                await axios.post(
                    `${baseUrl}/api/profile/ball-handling-style`,
                    {
                        handedness: formData.handedness,
                        ball_carry: formData.ball_carry,
                        is_public: privacySettings.ballHandling
                    },
                    { headers }
                );
            } else if (field === 'birthdate') {
                await axios.post(
                    `${baseUrl}/api/profile/birth-date`,
                    {
                        date: formData.birthdate,
                        is_public: privacySettings.birthdate
                    },
                    { headers }
                );
            } else if (field === 'address') {
                await axios.post(
                    `${baseUrl}/api/profile/address`,
                    {
                        location: {
                            address_str: formData.address,
                            zipcode: formData.zipcode || '',
                            lat: formData.latitude || '0',
                            long: formData.longitude || '0'
                        },
                        is_public: privacySettings.address
                    },
                    { headers }
                );
            }

            await refreshUser();
            setUploadMessage({ type: 'success', text: `${field.charAt(0).toUpperCase() + field.slice(1)} updated successfully!` });
            setEditMode(prev => ({ ...prev, [field]: false }));

            // Clear success message after 3 seconds
            setTimeout(() => setUploadMessage(null), 3000);
        } catch (error: any) {
            console.error(`Error updating ${field}:`, error);
            const errorMsg = error.response?.data?.message || `Failed to update ${field}`;
            setUploadMessage({ type: 'error', text: errorMsg });
        } finally {
            setIsSaving(false);
        }
    };

    const toggleEditMode = (field: keyof typeof editMode) => {
        setEditMode(prev => ({ ...prev, [field]: !prev[field] }));
    };

    if (!user || !user.authenticated) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-xl text-red-600 mb-4">Please log in to access your profile</div>
                    <a href="/signin" className="text-white px-4 py-2 rounded-lg inline-block" style={{ backgroundColor: '#8BC342' }}>
                        Go to Sign In
                    </a>
                </div>
            </div>
        );
    }

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'cover') => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setUploadMessage({ type: 'error', text: 'Please select a valid image file' });
            return;
        }

        // Validate file size (10MB for images)
        if (file.size > 10 * 1024 * 1024) {
            setUploadMessage({ type: 'error', text: 'Image size must be less than 10MB' });
            return;
        }

        const reader = new FileReader();
        reader.addEventListener('load', () => {
            setTempImageSrc(reader.result?.toString() || null);
            setActiveCropType(type);
            setCropModalOpen(true);
        });
        reader.readAsDataURL(file);

        // Clear input value so selecting the same file works again
        e.target.value = '';
    };

    const handleCropComplete = async (croppedBlob: Blob) => {
        const type = activeCropType;
        const uploadService = type === 'profile' ? profileUpload : coverUpload;
        const apiEndpoint = type === 'profile' ? '/api/profile/media/profile-picture' : '/api/profile/media/cover-picture';
        const urlField = type === 'profile' ? 'profile_picture_url' : 'cover_picture_url';

        // Create a File object from the Blob
        const file = new File([croppedBlob], `cropped-${type}.jpg`, { type: 'image/jpeg' });

        try {
            // Step 1: Upload to cloud storage
            const uploadResult = await uploadService.uploadFile(file, 'cdn');

            if (!uploadResult.success) {
                setUploadMessage({ type: 'error', text: `Failed to upload: ${uploadResult.error}` });
                return;
            }

            // Step 2: Update profile with cloud URL
            const response = await axios.post(
                `https://test.bowlersnetwork.com${apiEndpoint}`,
                { [urlField]: uploadResult.publicUrl },
                {
                    headers: {
                        'Authorization': `Bearer ${user.access_token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (response.status === 200 || response.status === 201) {
                await refreshUser();
                setUploadMessage({ type: 'success', text: `${type === 'profile' ? 'Profile picture' : 'Cover photo'} updated successfully!` });

                // Clear success message after 3 seconds
                setTimeout(() => setUploadMessage(null), 3000);
            }
        } catch (error: any) {
            console.error('Error updating profile media:', error);
            const errorMsg = error.response?.data?.message || error.message || 'Failed to update';
            setUploadMessage({ type: 'error', text: errorMsg });
        } finally {
            uploadService.reset();
        }
    };

    const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('video/')) {
            setUploadMessage({ type: 'error', text: 'Please select a valid video file' });
            return;
        }

        // Validate file size (100MB for videos)
        if (file.size > 100 * 1024 * 1024) {
            setUploadMessage({ type: 'error', text: 'Video size must be less than 100MB' });
            return;
        }

        try {
            // Step 1: Upload to cloud storage
            const uploadResult = await videoUpload.uploadFile(file, 'cdn');

            if (!uploadResult.success) {
                setUploadMessage({ type: 'error', text: `Failed to upload video: ${uploadResult.error}` });
                return;
            }

            // Step 2: Update profile with video URL
            const response = await axios.post(
                'https://test.bowlersnetwork.com/api/profile/media/intro-video',
                { intro_video_url: uploadResult.publicUrl },
                {
                    headers: {
                        'Authorization': `Bearer ${user.access_token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (response.status === 200 || response.status === 201) {
                await refreshUser();
                setUploadMessage({ type: 'success', text: 'Intro video updated successfully!' });

                // Clear success message after 3 seconds
                setTimeout(() => setUploadMessage(null), 3000);
            }
        } catch (error: any) {
            console.error('Error updating intro video:', error);
            const errorMsg = error.response?.data?.message || error.message || 'Failed to update video';
            setUploadMessage({ type: 'error', text: errorMsg });
        } finally {
            videoUpload.reset();
        }
    };

    const getPrivacyIcon = (isPublic: boolean) => {
        return isPublic ? <Globe className="w-3 h-3 text-blue-500" /> : <Lock className="w-3 h-3 text-gray-400" />;
    };

    const togglePrivacy = (field: keyof typeof privacySettings) => {
        if (editMode[field as keyof typeof editMode]) {
            setPrivacySettings(prev => ({
                ...prev,
                [field]: !prev[field]
            }));
        }
    };

    // Address search with debounce
    const handleAddressSearch = async (query: string) => {
        setAddressSearchQuery(query);

        if (addressDebounceTimer.current) {
            clearTimeout(addressDebounceTimer.current);
        }

        if (query.trim().length < 2) {
            setShowAddressSuggestions(false);
            return;
        }

        addressDebounceTimer.current = setTimeout(async () => {
            const results = await geocodeMultiple(query, {
                types: ['address', 'place', 'postcode'],
                limit: 5
            });

            if (results.length > 0) {
                setShowAddressSuggestions(true);
            }
        }, 300);
    };

    // Handle address suggestion selection
    const handleSelectAddress = (result: GeocodingResult) => {
        setFormData(prev => ({
            ...prev,
            address: result.address || '',
            zipcode: result.zipcode || '',
            latitude: result.latitude?.toString() || '',
            longitude: result.longitude?.toString() || ''
        }));
        setAddressSearchQuery(result.address || '');
        setShowAddressSuggestions(false);
    };

    // Close suggestions when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                addressSuggestionsRef.current &&
                !addressSuggestionsRef.current.contains(event.target as Node)
            ) {
                setShowAddressSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Handle bowling stats save
    const handleSaveBowlingStats = async () => {
        if (!user || !user.authenticated) return;

        setIsSaving(true);
        try {
            const baseUrl = 'https://test.bowlersnetwork.com';
            const headers = {
                'Authorization': `Bearer ${user.access_token}`,
                'Content-Type': 'application/json',
            };

            await axios.post(
                `${baseUrl}/api/stats/bowling`,
                {
                    average: parseFloat(bowlingStats.average.toString()),
                    high_game: parseInt(bowlingStats.high_game.toString()),
                    high_series: parseInt(bowlingStats.high_series.toString()),
                    experience: parseInt(bowlingStats.experience.toString())
                },
                { headers }
            );

            await refreshUser();
            setUploadMessage({ type: 'success', text: 'Bowling stats updated successfully!' });
            setTimeout(() => setUploadMessage(null), 3000);
            setEditingStats(false);
        } catch (error) {
            console.error('Error saving bowling stats:', error);
            setUploadMessage({ type: 'error', text: 'Failed to update bowling stats. Please try again.' });
            setTimeout(() => setUploadMessage(null), 5000);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Success/Error Message */}
            {uploadMessage && (
                <div className={`fixed top-4 right-4 px-6 py-3 rounded-lg text-white z-50 flex items-center gap-2 ${uploadMessage.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
                    {uploadMessage.text}
                </div>
            )}

            {/* Cover Photo Section */}
            <div className="relative h-64 bg-linear-to-r from-green-600 to-green-400 overflow-hidden group">
                {user?.cover_photo_url && (
                    <img
                        src={user.cover_photo_url}
                        alt="Cover"
                        className="w-full h-full object-cover"
                    />
                )}
                <button
                    onClick={() => document.getElementById('cover-input')?.click()}
                    disabled={coverUpload.isUploading}
                    className="absolute bottom-4 right-4 bg-white text-gray-800 p-2 rounded-lg shadow-md hover:bg-gray-100 transition disabled:opacity-50 flex items-center gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
                >
                    {coverUpload.isUploading ? (
                        <>
                            <Loader className="w-5 h-5 animate-spin" />
                            <span className="text-sm">{coverUpload.progress}%</span>
                        </>
                    ) : (
                        <Camera className="w-5 h-5" />
                    )}
                </button>
                {coverUpload.isUploading && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-3">
                        <div className="flex items-center justify-between text-white text-sm mb-2">
                            <span>Uploading cover photo...</span>
                            <span>{coverUpload.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                            <div
                                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${coverUpload.progress}%` }}
                            />
                        </div>
                        <p className="text-xs text-gray-300 mt-1">Speed: {coverUpload.speed}</p>
                    </div>
                )}
                <input
                    id="cover-input"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'cover')}
                    className="hidden"
                />
            </div>

            {/* Profile Content */}
            <div className="relative">
                {/* Profile Picture and Header */}
                <div className="bg-white border-b border-gray-200">
                    <div className="max-w-6xl mx-auto px-4 py-8">
                        <div className="flex flex-col gap-6 mb-6">
                            {/* Profile Pic + Info */}
                            <div className="flex flex-col sm:flex-row items-start gap-6">
                                {/* Profile Picture */}
                                <div className="relative -mt-24 sm:-mt-32 group shrink-0">
                                    <div className="w-40 h-40 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white flex items-center justify-center">
                                        {user?.profile_picture_url ? (
                                            <img
                                                src={user.profile_picture_url}
                                                alt={user.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <span style={{ color: '#8BC342' }} className="text-5xl font-bold">
                                                {user?.name?.[0] || 'P'}
                                            </span>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => document.getElementById('profile-input')?.click()}
                                        disabled={profileUpload.isUploading}
                                        className="absolute bottom-2 right-2 bg-green-500 text-white p-2 rounded-full border-2 border-white hover:bg-green-600 transition disabled:opacity-50 opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
                                    >
                                        {profileUpload.isUploading ? (
                                            <Loader className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Camera className="w-4 h-4" />
                                        )}
                                    </button>
                                    {profileUpload.isUploading && (
                                        <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded-lg text-xs whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <Loader className="w-3 h-3 animate-spin" />
                                                <span>Uploading {profileUpload.progress}%</span>
                                            </div>
                                        </div>
                                    )}
                                    <input
                                        id="profile-input"
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleImageUpload(e, 'profile')}
                                        className="hidden"
                                    />
                                </div>

                                {/* Basic Info */}
                                <div className="flex-1 min-w-0 pt-2 max-w-3xl">
                                    {/* Name Edit Section */}
                                    {editMode.name ? (
                                        <div className="mb-4 space-y-3">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                <input
                                                    type="text"
                                                    value={formData.first_name}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                                                    placeholder="First Name"
                                                    className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                                                />
                                                <input
                                                    type="text"
                                                    value={formData.last_name}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                                                    placeholder="Last Name"
                                                    className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                                                />
                                            </div>
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => setEditMode(prev => ({ ...prev, name: false }))}
                                                    className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={() => handleSaveField('name')}
                                                    disabled={isSaving}
                                                    className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                                                >
                                                    {isSaving ? 'Saving...' : 'Save'}
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-3 mb-1 group">
                                            <h1 className="text-3xl font-bold text-gray-900">{user?.name}</h1>
                                            {user?.is_pro && (
                                                <div className="flex items-center">
                                                    <svg className="w-6 h-6 text-[#8BC342]" viewBox="0 0 24 24" fill="currentColor">
                                                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                                                        <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.2" />
                                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                                                    </svg>
                                                </div>
                                            )}
                                            <button
                                                onClick={() => setEditMode(prev => ({ ...prev, name: true }))}
                                                className="opacity-100 lg:opacity-0 lg:group-hover:opacity-100 p-1 hover:bg-gray-100 rounded transition text-gray-500"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}
                                    <p className="text-gray-500 text-lg mb-4">@{user?.username}</p>

                                    {/* Bio Section */}
                                    <div className="mb-6 group relative max-w-2xl">
                                        {editMode.bio ? (
                                            <div className="space-y-2">
                                                <textarea
                                                    value={formData.bio}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                                                    rows={3}
                                                    placeholder="Write your bio..."
                                                />
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => setEditMode(prev => ({ ...prev, bio: false }))}
                                                        className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        onClick={() => handleSaveField('bio')}
                                                        className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                                                    >
                                                        Save
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-start gap-2">
                                                <p className="text-gray-700 leading-relaxed">{user?.bio?.content || 'No bio added yet'}</p>
                                                <button
                                                    onClick={() => setEditMode(prev => ({ ...prev, bio: true }))}
                                                    className="opacity-100 lg:opacity-0 lg:group-hover:opacity-100 p-1 hover:bg-gray-100 rounded transition text-gray-500"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Stats */}
                                    <div className="flex gap-8 mb-6 border-t border-b border-gray-100 py-4 w-fit">
                                        <button
                                            onClick={() => setFollowersModalOpen(true)}
                                            className="text-center min-w-20 hover:opacity-80 transition-opacity cursor-pointer"
                                        >
                                            <div className="text-2xl font-bold text-gray-900">{user?.follow_info?.follwers || user?.follower_count || 0}</div>
                                            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Followers</div>
                                        </button>
                                        <button
                                            onClick={() => setFollowingModalOpen(true)}
                                            className="text-center min-w-20 hover:opacity-80 transition-opacity cursor-pointer"
                                        >
                                            <div className="text-2xl font-bold text-gray-900">{user?.follow_info?.followings || user?.following_count || 0}</div>
                                            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Following</div>
                                        </button>
                                        <div className="text-center min-w-20">
                                            <div className="text-2xl font-bold text-gray-900">{user?.xp || 0}</div>
                                            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">XP</div>
                                        </div>
                                    </div>

                                    {/* Favorite Brands */}
                                    {user?.favorite_brands && user.favorite_brands.length > 0 && (
                                        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100 mb-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="text-lg font-bold">Favorite Brands</h3>
                                                <Link href="/brand-feed" className="text-sm text-green-600 hover:text-green-700 font-medium">
                                                    See all brands
                                                </Link>
                                            </div>
                                            <div className="flex flex-wrap gap-2 items-center">
                                                {user.favorite_brands.map((brand) => (
                                                    <div key={brand.brand_id} className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition group cursor-pointer">
                                                        <img
                                                            src={brand.logo_url}
                                                            alt={brand.name}
                                                            className="w-5 h-5 object-contain grayscale group-hover:grayscale-0 transition-all"
                                                        />
                                                        <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900">{brand.name}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Intro Video - Moved from right side */}
                                    <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100 group relative mb-6">
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 className="text-lg font-bold flex items-center gap-2">
                                                <Play className="w-5 h-5" />
                                                Intro Video
                                            </h3>
                                            <button
                                                onClick={() => videoInputRef.current?.click()}
                                                disabled={videoUpload.isUploading}
                                                className="px-3 py-1.5 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 flex items-center gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
                                            >
                                                {videoUpload.isUploading ? (
                                                    <>
                                                        <Loader className="w-3 h-3 animate-spin" />
                                                        Uploading...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Upload className="w-3 h-3" />
                                                        {user?.intro_video_url ? 'Change' : 'Upload'}
                                                    </>
                                                )}
                                            </button>
                                            <input
                                                ref={videoInputRef}
                                                type="file"
                                                accept="video/*"
                                                onChange={handleVideoUpload}
                                                className="hidden"
                                            />
                                        </div>
                                        {user?.intro_video_url ? (
                                            <div className="relative rounded-lg overflow-hidden bg-black aspect-video w-full">
                                                <video
                                                    src={user.intro_video_url}
                                                    controls
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        ) : (
                                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center h-40 flex flex-col items-center justify-center w-full">
                                                <Video className="w-10 h-10 text-gray-400 mb-2" />
                                                <p className="text-gray-600 text-sm mb-1">No intro video yet</p>
                                                <p className="text-xs text-gray-500 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">Click "Upload" to add</p>
                                            </div>
                                        )}
                                        {videoUpload.isUploading && (
                                            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                                                <div className="flex justify-between text-xs mb-1">
                                                    <span className="text-blue-700">Uploading...</span>
                                                    <span className="font-medium text-blue-900">{videoUpload.progress}%</span>
                                                </div>
                                                <div className="w-full bg-blue-200 rounded-full h-1.5 mb-1">
                                                    <div
                                                        className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                                                        style={{ width: `${videoUpload.progress}%` }}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>


                                </div>
                            </div>
                        </div>

                        {/* Upload Message */}
                        {uploadMessage && (
                            <div className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${uploadMessage.type === 'success'
                                ? 'bg-green-50 border border-green-200 text-green-700'
                                : 'bg-red-50 border border-red-200 text-red-700'
                                }`}>
                                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                                <p className="text-sm">{uploadMessage.text}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Profile Details Section with Tabs */}
                <div className="max-w-6xl mx-auto px-4 py-8">
                    {/* Tabs */}
                    <div className="bg-white rounded-lg shadow-sm mb-6">
                        <div className="border-b border-gray-200">
                            <div className="flex overflow-x-auto">
                                <button
                                    onClick={() => setActiveTab('info')}
                                    className={`px-6 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition ${activeTab === 'info'
                                        ? 'border-green-600 text-green-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    Info
                                </button>
                                <button
                                    onClick={() => setActiveTab('cards')}
                                    className={`px-6 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition ${activeTab === 'cards'
                                        ? 'border-green-600 text-green-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    Cards
                                </button>
                                <button
                                    onClick={() => setActiveTab('stats')}
                                    className={`px-6 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition ${activeTab === 'stats'
                                        ? 'border-green-600 text-green-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    Stats
                                </button>
                                <button
                                    onClick={() => setActiveTab('posts')}
                                    className={`px-6 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition ${activeTab === 'posts'
                                        ? 'border-green-600 text-green-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    Posts
                                </button>
                                <button
                                    onClick={() => setActiveTab('media')}
                                    className={`px-6 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition ${activeTab === 'media'
                                        ? 'border-green-600 text-green-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    Media
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Tab Content */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        {/* Info Tab */}
                        {activeTab === 'info' && (
                            <div className="space-y-6">
                                {/* Email */}
                                <div className="flex items-start justify-between pb-6 border-b border-gray-200 last:border-0">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Mail className="w-4 h-4 text-gray-500" />
                                            <label className="text-sm font-semibold text-gray-700">Email</label>
                                        </div>
                                        <p className="text-gray-600">{user?.email || 'Not provided'}</p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="text-xs text-gray-500">Private (cannot be changed)</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Gender */}
                                <div className="flex items-start justify-between pb-6 border-b border-gray-200 last:border-0 group">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <label className="text-sm font-semibold text-gray-700">Gender</label>
                                        </div>
                                        {editMode.gender ? (
                                            <div className="space-y-2">
                                                <select
                                                    value={formData.gender}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                                >
                                                    <option value="">Select gender</option>
                                                    <option value="Male">Male</option>
                                                    <option value="Female">Female</option>
                                                </select>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <input
                                                        type="checkbox"
                                                        id="gender-privacy"
                                                        checked={privacySettings.gender}
                                                        onChange={(e) => setPrivacySettings(prev => ({ ...prev, gender: e.target.checked }))}
                                                        className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                                                    />
                                                    <label htmlFor="gender-privacy" className="text-sm text-gray-600 flex items-center gap-1">
                                                        {privacySettings.gender ? (
                                                            <><Globe className="w-3 h-3 text-green-600" /> Make this public</>
                                                        ) : (
                                                            <><Lock className="w-3 h-3 text-gray-500" /> Make this public</>
                                                        )}
                                                    </label>
                                                </div>
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => setEditMode(prev => ({ ...prev, gender: false }))}
                                                        className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        onClick={() => handleSaveField('gender')}
                                                        className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                                                    >
                                                        Save
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div>
                                                <div className="flex items-center justify-between">
                                                    <p className="text-gray-600">{(user?.gender_data?.role === 'Women' ? 'Female' : user?.gender_data?.role) || 'Not provided'}</p>
                                                    <button
                                                        onClick={() => setEditMode(prev => ({ ...prev, gender: true }))}
                                                        className="opacity-100 lg:opacity-0 lg:group-hover:opacity-100 p-1 hover:bg-gray-100 rounded transition text-gray-500"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <span className="text-xs flex items-center gap-1">
                                                        {privacySettings.gender ? (
                                                            <><Globe className="w-3 h-3 text-green-600" /> <span className="text-green-600 font-medium">Public</span></>
                                                        ) : (
                                                            <><Lock className="w-3 h-3 text-gray-500" /> <span className="text-gray-500 font-medium">Private</span></>
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Birthdate */}
                                <div className="flex items-start justify-between pb-6 border-b border-gray-200 last:border-0 group">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <label className="text-sm font-semibold text-gray-700">Birthdate</label>
                                        </div>
                                        {editMode.birthdate ? (
                                            <div className="space-y-2">
                                                <input
                                                    type="date"
                                                    value={formData.birthdate}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, birthdate: e.target.value }))}
                                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                                />
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        id="birthdate-privacy"
                                                        checked={privacySettings.birthdate}
                                                        onChange={(e) => setPrivacySettings(prev => ({ ...prev, birthdate: e.target.checked }))}
                                                        className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                                                    />
                                                    <label htmlFor="birthdate-privacy" className="text-sm text-gray-600 flex items-center gap-1">
                                                        {privacySettings.birthdate ? (
                                                            <><Globe className="w-3 h-3 text-green-600" /> Make this public</>
                                                        ) : (
                                                            <><Lock className="w-3 h-3 text-gray-500" /> Make this public</>
                                                        )}
                                                    </label>
                                                </div>
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => setEditMode(prev => ({ ...prev, birthdate: false }))}
                                                        className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        onClick={() => handleSaveField('birthdate')}
                                                        className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                                                    >
                                                        Save
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div>
                                                <div className="flex items-center justify-between">
                                                    <p className="text-gray-600">{user?.birthdate_data?.date || 'Not provided'}</p>
                                                    <button
                                                        onClick={() => setEditMode(prev => ({ ...prev, birthdate: true }))}
                                                        className="opacity-100 lg:opacity-0 lg:group-hover:opacity-100 p-1 hover:bg-gray-100 rounded transition text-gray-500"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <span className="text-xs flex items-center gap-1">
                                                        {privacySettings.birthdate ? (
                                                            <><Globe className="w-3 h-3 text-green-600" /> <span className="text-green-600 font-medium">Public</span></>
                                                        ) : (
                                                            <><Lock className="w-3 h-3 text-gray-500" /> <span className="text-gray-500 font-medium">Private</span></>
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Address */}
                                <div className="flex items-start justify-between pb-6 border-b border-gray-200 last:border-0 group">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <MapPin className="w-4 h-4 text-gray-500" />
                                            <label className="text-sm font-semibold text-gray-700">Address</label>
                                        </div>
                                        <div>
                                            <div className="flex items-center justify-between">
                                                <div className="space-y-1">
                                                    <p className="text-gray-600">{displayAddress?.address || user?.address_data?.address_str || 'Not provided'}</p>
                                                    {(displayAddress?.zipcode || user?.address_data?.zipcode) && (
                                                        <p className="text-sm text-gray-500">Zipcode: {displayAddress?.zipcode || user?.address_data?.zipcode}</p>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => setAddressModalOpen(true)}
                                                    className="opacity-100 lg:opacity-0 lg:group-hover:opacity-100 p-1 hover:bg-gray-100 rounded transition text-gray-500"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className="text-xs flex items-center gap-1">
                                                    {privacySettings.address ? (
                                                        <><Globe className="w-3 h-3 text-green-600" /> <span className="text-green-600 font-medium">Public</span></>
                                                    ) : (
                                                        <><Lock className="w-3 h-3 text-gray-500" /> <span className="text-gray-500 font-medium">Private</span></>
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Ball Handling Style */}
                                <div className="flex items-start justify-between pb-6 border-b border-gray-200 last:border-0 group">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Dumbbell className="w-4 h-4 text-gray-500" />
                                            <label className="text-sm font-semibold text-gray-700">Ball Handling</label>
                                        </div>
                                        {editMode.ballHandling ? (
                                            <div className="space-y-3">
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="text-xs text-gray-500 mb-1 block">Handedness</label>
                                                        <select
                                                            value={formData.handedness}
                                                            onChange={(e) => setFormData(prev => ({ ...prev, handedness: e.target.value }))}
                                                            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                                                        >
                                                            <option value="">Select</option>
                                                            <option value="Righty">Righty</option>
                                                            <option value="Lefty">Lefty</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="text-xs text-gray-500 mb-1 block">Style</label>
                                                        <select
                                                            value={formData.ball_carry}
                                                            onChange={(e) => setFormData(prev => ({ ...prev, ball_carry: e.target.value }))}
                                                            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                                                        >
                                                            <option value="">Select</option>
                                                            <option value="One handed">One handed</option>
                                                            <option value="Two handed">Two handed</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <input
                                                        type="checkbox"
                                                        id="ballHandling-privacy"
                                                        checked={privacySettings.ballHandling}
                                                        onChange={(e) => setPrivacySettings(prev => ({ ...prev, ballHandling: e.target.checked }))}
                                                        className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                                                    />
                                                    <label htmlFor="ballHandling-privacy" className="text-sm text-gray-600 flex items-center gap-1">
                                                        {privacySettings.ballHandling ? (
                                                            <><Globe className="w-3 h-3 text-green-600" /> Make this public</>
                                                        ) : (
                                                            <><Lock className="w-3 h-3 text-gray-500" /> Make this public</>
                                                        )}
                                                    </label>
                                                </div>
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => setEditMode(prev => ({ ...prev, ballHandling: false }))}
                                                        className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        onClick={() => handleSaveField('ballHandling')}
                                                        className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                                                    >
                                                        Save
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div>
                                                <div className="flex items-center justify-between">
                                                    <p className="text-gray-600">
                                                        {user?.ball_handling_style?.description ||
                                                            (formData.ball_carry && formData.handedness ? `${formData.ball_carry} ${formData.handedness}` : 'Not provided')}
                                                    </p>
                                                    <button
                                                        onClick={() => setEditMode(prev => ({ ...prev, ballHandling: true }))}
                                                        className="opacity-100 lg:opacity-0 lg:group-hover:opacity-100 p-1 hover:bg-gray-100 rounded transition text-gray-500"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <span className="text-xs flex items-center gap-1">
                                                        {privacySettings.ballHandling ? (
                                                            <><Globe className="w-3 h-3 text-green-600" /> <span className="text-green-600 font-medium">Public</span></>
                                                        ) : (
                                                            <><Lock className="w-3 h-3 text-gray-500" /> <span className="text-gray-500 font-medium">Private</span></>
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Home Center */}
                                <div className="flex items-start justify-between pb-6 border-b border-gray-200 last:border-0 group">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Building2 className="w-4 h-4 text-gray-500" />
                                            <label className="text-sm font-semibold text-gray-700">Home Center</label>
                                        </div>
                                        <div>
                                            <div className="flex items-center justify-between">
                                                <div className="space-y-1">
                                                    <p className="text-gray-600">{displayHomeCenter?.name || user?.home_center_data?.center?.name || 'Not selected'}</p>
                                                    {(displayHomeCenter?.address || user?.home_center_data?.center?.address_str) && (
                                                        <p className="text-sm text-gray-500 flex items-center gap-1">
                                                            <MapPin className="w-3 h-3" />
                                                            {displayHomeCenter?.address || user?.home_center_data?.center?.address_str}
                                                        </p>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => setHomeCenterModalOpen(true)}
                                                    className="opacity-100 lg:opacity-0 lg:group-hover:opacity-100 p-1 hover:bg-gray-100 rounded transition text-gray-500"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className="text-xs flex items-center gap-1">
                                                    {(displayHomeCenter?.is_public ?? user?.home_center_data?.is_public) ? (
                                                        <><Globe className="w-3 h-3 text-green-600" /> <span className="text-green-600 font-medium">Public</span></>
                                                    ) : (
                                                        <><Lock className="w-3 h-3 text-gray-500" /> <span className="text-gray-500 font-medium">Private</span></>
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Cards Tab */}
                        {activeTab === 'cards' && (
                            <div className="text-center py-12">
                                <p className="text-gray-500">Trading cards feature coming soon...</p>
                            </div>
                        )}

                        {/* Stats Tab */}
                        {activeTab === 'stats' && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-bold">Bowling Statistics</h3>
                                    {!editingStats && (
                                        <button
                                            onClick={() => setEditingStats(true)}
                                            className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                            Edit Stats
                                        </button>
                                    )}
                                </div>

                                {editingStats ? (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Average Score
                                                </label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={bowlingStats.average}
                                                    onChange={(e) => setBowlingStats(prev => ({ ...prev, average: parseFloat(e.target.value) || 0 }))}
                                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                                    placeholder="e.g., 185.5"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    High Game
                                                </label>
                                                <input
                                                    type="number"
                                                    value={bowlingStats.high_game}
                                                    onChange={(e) => setBowlingStats(prev => ({ ...prev, high_game: parseInt(e.target.value) || 0 }))}
                                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                                    placeholder="e.g., 300"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    High Series
                                                </label>
                                                <input
                                                    type="number"
                                                    value={bowlingStats.high_series}
                                                    onChange={(e) => setBowlingStats(prev => ({ ...prev, high_series: parseInt(e.target.value) || 0 }))}
                                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                                    placeholder="e.g., 900"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Experience (Years)
                                                </label>
                                                <input
                                                    type="number"
                                                    value={bowlingStats.experience}
                                                    onChange={(e) => setBowlingStats(prev => ({ ...prev, experience: parseInt(e.target.value) || 0 }))}
                                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                                    placeholder="e.g., 5"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex justify-end gap-2 pt-4">
                                            <button
                                                onClick={() => {
                                                    setEditingStats(false);
                                                    fetchBowlingStats();
                                                }}
                                                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleSaveBowlingStats}
                                                disabled={isSaving}
                                                className="px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-300"
                                            >
                                                {isSaving ? 'Saving...' : 'Save Stats'}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="bg-green-50 p-6 rounded-lg border border-green-100">
                                            <div className="text-sm text-gray-600 mb-1">Average Score</div>
                                            <div className="text-3xl font-bold text-green-600">{bowlingStats.average.toFixed(1)}</div>
                                        </div>
                                        <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
                                            <div className="text-sm text-gray-600 mb-1">High Game</div>
                                            <div className="text-3xl font-bold text-blue-600">{bowlingStats.high_game}</div>
                                        </div>
                                        <div className="bg-purple-50 p-6 rounded-lg border border-purple-100">
                                            <div className="text-sm text-gray-600 mb-1">High Series</div>
                                            <div className="text-3xl font-bold text-purple-600">{bowlingStats.high_series}</div>
                                        </div>
                                        <div className="bg-orange-50 p-6 rounded-lg border border-orange-100">
                                            <div className="text-sm text-gray-600 mb-1">Experience</div>
                                            <div className="text-3xl font-bold text-orange-600">{bowlingStats.experience} years</div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Posts Tab */}
                        {activeTab === 'posts' && (
                            <div className="space-y-6">
                                {postsLoading ? (
                                    <div className="text-center py-12">
                                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-green-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
                                            <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
                                        </div>
                                    </div>
                                ) : posts.length > 0 ? (
                                    <div className="space-y-6 max-w-2xl mx-auto">
                                        {posts.map((post) => (
                                            <FeedPostCard
                                                key={post.post_id}
                                                post={post}
                                                onPostChange={(updatedPost) => {
                                                    setPosts(prevPosts =>
                                                        prevPosts.map(p => p.post_id === updatedPost.post_id ? updatedPost : p)
                                                    );
                                                }}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <div className="bg-gray-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                            <Edit2 className="w-8 h-8 text-gray-400" />
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
                                        <p className="text-gray-500 mb-6">Share your bowling journey with the community!</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Media Tab */}
                        {activeTab === 'media' && (
                            <div className="text-center py-12">
                                <p className="text-gray-500">Media gallery coming soon...</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Address Modal */}
                <AddressModal
                    isOpen={addressModalOpen}
                    onClose={() => setAddressModalOpen(false)}
                    onSave={handleAddressSave}
                    initialAddress={formData.address}
                    initialZipcode={formData.zipcode}
                    title="Update Address"
                />

                {/* Home Center Modal */}
                <HomeCenterModal
                    isOpen={homeCenterModalOpen}
                    onClose={() => setHomeCenterModalOpen(false)}
                    onSave={handleHomeCenterSave}
                    currentCenterId={user?.home_center_data?.center?.id}
                    accessToken={user?.access_token || ''}
                />

                {/* Followers Modal */}
                <FollowersModal
                    isOpen={followersModalOpen}
                    onClose={() => setFollowersModalOpen(false)}
                    type="followers"
                    accessToken={user?.access_token || ''}
                />

                {/* Following Modal */}
                <FollowersModal
                    isOpen={followingModalOpen}
                    onClose={() => setFollowingModalOpen(false)}
                    type="following"
                    accessToken={user?.access_token || ''}
                />

                <ImageCropperModal
                    isOpen={cropModalOpen}
                    onClose={() => setCropModalOpen(false)}
                    imageSrc={tempImageSrc}
                    onCropComplete={handleCropComplete}
                    aspectRatio={activeCropType === 'profile' ? 1 : 2.62}
                    title={activeCropType === 'profile' ? 'Crop Profile Picture' : 'Crop Cover Photo'}
                />
            </div>
        </div>
    );

    // Handle address save from modal
    async function handleAddressSave(address: {
        address: string;
        zipcode: string;
        latitude: string;
        longitude: string;
    }) {
        if (!user || !user.authenticated) return;

        // Optimistic update
        setDisplayAddress({
            address: address.address,
            zipcode: address.zipcode
        });

        setFormData(prev => ({
            ...prev,
            address: address.address,
            zipcode: address.zipcode,
            latitude: address.latitude,
            longitude: address.longitude
        }));

        setIsSaving(true);
        try {
            const baseUrl = 'https://test.bowlersnetwork.com';
            const headers = {
                'Authorization': `Bearer ${user.access_token}`,
                'Content-Type': 'application/json',
            };

            await axios.post(
                `${baseUrl}/api/profile/address`,
                {
                    location: {
                        address_str: address.address,
                        zipcode: address.zipcode,
                        lat: address.latitude,
                        long: address.longitude
                    },
                    is_public: privacySettings.address
                },
                { headers }
            );

            setUploadMessage({ type: 'success', text: 'Address updated successfully!' });
            setTimeout(() => setUploadMessage(null), 3000);
        } catch (error) {
            console.error('Error saving address:', error);
            setUploadMessage({ type: 'error', text: 'Failed to update address. Please try again.' });
            setTimeout(() => setUploadMessage(null), 5000);
        } finally {
            setIsSaving(false);
        }
    }

    // Handle home center save from modal
    async function handleHomeCenterSave(centerId: number, isPublic: boolean, center?: BowlingCenter) {
        if (!user || !user.authenticated) return;

        // Optimistic update
        if (center) {
            setDisplayHomeCenter({
                name: center.name,
                address: center.address_str || '',
                id: center.id,
                is_public: isPublic
            });
        }

        setIsSaving(true);
        try {
            const baseUrl = 'https://test.bowlersnetwork.com';
            const headers = {
                'Authorization': `Bearer ${user.access_token}`,
                'Content-Type': 'application/json',
            };

            await axios.post(
                `${baseUrl}/api/profile/home-center`,
                {
                    center_id: centerId,
                    is_public: isPublic
                },
                { headers }
            );

            setUploadMessage({ type: 'success', text: 'Home center updated successfully!' });
            setTimeout(() => setUploadMessage(null), 3000);

            // Optionally refresh user data to show updated center
            // You might want to call a refresh function here
        } catch (error) {
            console.error('Error saving home center:', error);
            setUploadMessage({ type: 'error', text: 'Failed to update home center. Please try again.' });
            setTimeout(() => setUploadMessage(null), 5000);
        } finally {
            setIsSaving(false);
        }
    }
}
