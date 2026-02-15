'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Camera, Play, MapPin, UserCheck, Heart, AlertCircle, Lock, Globe, Mail, Video, Building2, Dumbbell, UserPlus, UserMinus, Loader } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';

interface UserProfile {
    user_id: number;
    name: string;
    first_name: string;
    last_name: string;
    username: string;
    email: string;
    roles: {
        is_pro: boolean;
        is_center_admin: boolean;
        is_tournament_director: boolean;
    };
    xp: number;
    level: number;
    contact_info: {
        email: string;
        is_public: boolean;
        is_added: boolean;
    };
    gender_data: {
        role: string;
        is_public: boolean;
        is_added: boolean;
    };
    bio: {
        content: string;
        is_public: boolean;
        is_added: boolean;
    };
    birthdate_data: {
        date: string;
        age: number;
        is_public: boolean;
        is_added: boolean;
    };
    address_data: {
        address_str: string;
        zipcode: string;
        is_public: boolean;
        is_added: boolean;
    };
    profile_media: {
        profile_picture_url: string;
        cover_picture_url: string;
        intro_video_url: string;
    };
    home_center_data: {
        center: {
            id: number;
            name: string;
            logo: string;
            lanes: number;
            address_str: string;
            lat: string;
            long: string;
            zipcode: string;
            website_url: string;
            email: string;
            phone_number: string;
            admin: any;
        } | null;
        is_public: boolean;
        is_added: boolean;
    };
    ball_handling_style: {
        description: string;
        is_public: boolean;
        is_added: boolean;
    };
    follow_info: {
        follwers: number;
        followings: number;
    };
    favorite_brands: Array<{
        brand_id: number;
        brandType: string;
        name: string;
        formal_name: string;
        logo_url: string;
    }>;
    is_followable: boolean;
    is_following: boolean;
}

export default function UserProfilePage() {
    const params = useParams();
    const router = useRouter();
    const { user: currentUser } = useAuth();
    const username = params.username as string;

    const [profileUser, setProfileUser] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isFollowing, setIsFollowing] = useState(false);
    const [followerCount, setFollowerCount] = useState(0);
    const [isFollowLoading, setIsFollowLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'info' | 'cards' | 'stats' | 'posts' | 'media'>('info');

    // Fetch user profile by username
    useEffect(() => {
        const fetchProfile = async () => {
            if (!username) return;

            try {
                setIsLoading(true);
                setError(null);

                const response = await axios.get(`https://test.bowlersnetwork.com/api/profile/${username}`, {
                    headers: {
                        'Authorization': `Bearer ${currentUser?.access_token}`,
                    },
                });

                const data = response.data;
                setProfileUser(data);
                setIsFollowing(data.is_following);
                setFollowerCount(data.follow_info.follwers);

                // If user is viewing their own profile, redirect to /profile
                if (currentUser?.username === username) {
                    router.replace('/profile');
                }
            } catch (err: any) {
                console.error('Error fetching profile:', err);
                setError(err.response?.data?.message || 'Failed to load profile');
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfile();
    }, [username, currentUser?.access_token, currentUser?.username, router]);

    // Handle follow/unfollow
    const handleFollowToggle = async () => {
        if (!profileUser || !currentUser?.access_token) return;

        try {
            setIsFollowLoading(true);
            const response = await axios.get(`https://test.bowlersnetwork.com/api/follow/${profileUser.user_id}`, {
                headers: {
                    'Authorization': `Bearer ${currentUser.access_token}`,
                },
            });

            const data = response.data;
            
            if (data.errors) {
                // Handle error (e.g., trying to follow yourself)
                alert(data.errors[0]);
            } else {
                setIsFollowing(data.is_following);
                setFollowerCount(data.follower_count);
            }
        } catch (err: any) {
            console.error('Error toggling follow:', err);
            alert(err.response?.data?.message || 'Failed to update follow status');
        } finally {
            setIsFollowLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader className="w-8 h-8 animate-spin text-green-600" />
            </div>
        );
    }

    if (error || !profileUser) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-4">
                <AlertCircle className="w-12 h-12 text-red-500" />
                <p className="text-lg text-gray-700">{error || 'User not found'}</p>
                <button
                    onClick={() => router.back()}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="relative">
                {/* Cover Photo */}
                <div className="relative h-64 lg:h-80 bg-gradient-to-br from-green-600 to-green-800 group">
                    {profileUser.profile_media?.cover_picture_url ? (
                        <img
                            src={profileUser.profile_media.cover_picture_url}
                            alt="Cover"
                            className="w-full h-full object-cover"
                        />
                    ) : null}
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
                                            {profileUser.profile_media?.profile_picture_url ? (
                                                <img 
                                                    src={profileUser.profile_media.profile_picture_url} 
                                                    alt={profileUser.name} 
                                                    className="w-full h-full object-cover" 
                                                />
                                            ) : (
                                                <span style={{ color: '#8BC342' }} className="text-5xl font-bold">
                                                    {profileUser.name?.[0] || 'P'}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Basic Info */}
                                    <div className="flex-1 min-w-0 pt-2 max-w-3xl">
                                        <div className="flex items-center gap-3 mb-1">
                                            <h1 className="text-3xl font-bold text-gray-900">{profileUser.name}</h1>
                                            {profileUser.roles.is_pro && (
                                                <div className="flex items-center">
                                                    <svg className="w-6 h-6 text-[#8BC342]" viewBox="0 0 24 24" fill="currentColor">
                                                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                                                        <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.2"/>
                                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                                                    </svg>
                                                </div>
                                            )}
                                            {/* Follow Button - Desktop */}
                                            {profileUser.is_followable && (
                                                <button
                                                    onClick={handleFollowToggle}
                                                    disabled={isFollowLoading}
                                                    className={`ml-auto hidden sm:flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition disabled:opacity-50 ${
                                                        isFollowing
                                                            ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                                            : 'bg-green-600 text-white hover:bg-green-700'
                                                    }`}
                                                >
                                                    {isFollowLoading ? (
                                                        <Loader className="w-5 h-5 animate-spin" />
                                                    ) : isFollowing ? (
                                                        <>
                                                            <UserCheck className="w-5 h-5" />
                                                            Following
                                                        </>
                                                    ) : (
                                                        <>
                                                            <UserPlus className="w-5 h-5" />
                                                            Follow
                                                        </>
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                        <p className="text-gray-500 text-lg mb-4">@{profileUser.username}</p>

                                        {/* Bio Section */}
                                        <div className="mb-6 group relative max-w-2xl">
                                            <p className="text-gray-700 leading-relaxed">{profileUser.bio?.content || 'No bio added yet'}</p>
                                        </div>

                                        {/* Stats */}
                                        <div className="flex gap-8 mb-6 border-t border-b border-gray-100 py-4 w-fit">
                                            <div className="text-center min-w-20">
                                                <div className="text-2xl font-bold text-gray-900">{followerCount}</div>
                                                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Followers</div>
                                            </div>
                                            <div className="text-center min-w-20">
                                                <div className="text-2xl font-bold text-gray-900">{profileUser.follow_info.followings}</div>
                                                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Following</div>
                                            </div>
                                            <div className="text-center min-w-20">
                                                <div className="text-2xl font-bold text-gray-900">{profileUser.xp}</div>
                                                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">XP</div>
                                            </div>
                                        </div>

                                        {/* Favorite Brands */}
                                        {profileUser.favorite_brands && profileUser.favorite_brands.length > 0 && (
                                            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100 mb-6">
                                                <h3 className="text-lg font-bold mb-4">Favorite Brands</h3>
                                                <div className="flex flex-wrap gap-2 items-center">
                                                    {profileUser.favorite_brands.map((brand) => (
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
                                            </div>
                                            {profileUser.profile_media?.intro_video_url ? (
                                                <div className="relative rounded-lg overflow-hidden bg-black aspect-video max-w-md">
                                                    <video
                                                        src={profileUser.profile_media.intro_video_url}
                                                        controls
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center h-40 flex flex-col items-center justify-center max-w-md">
                                                    <Video className="w-10 h-10 text-gray-400 mb-2" />
                                                    <p className="text-gray-600 text-sm mb-1">No intro video yet</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Follow Button - Mobile */}
                                        {profileUser.is_followable && (
                                            <button
                                                onClick={handleFollowToggle}
                                                disabled={isFollowLoading}
                                                className={`sm:hidden w-full flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg font-medium transition disabled:opacity-50 ${
                                                    isFollowing
                                                        ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                                        : 'bg-green-600 text-white hover:bg-green-700'
                                                }`}
                                            >
                                                {isFollowLoading ? (
                                                    <Loader className="w-5 h-5 animate-spin" />
                                                ) : isFollowing ? (
                                                    <>
                                                        <UserCheck className="w-5 h-5" />
                                                        Following
                                                    </>
                                                ) : (
                                                    <>
                                                        <UserPlus className="w-5 h-5" />
                                                        Follow
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
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
                                    className={`px-6 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition ${
                                        activeTab === 'info'
                                            ? 'border-green-600 text-green-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    Info
                                </button>
                                <button
                                    onClick={() => setActiveTab('cards')}
                                    className={`px-6 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition ${
                                        activeTab === 'cards'
                                            ? 'border-green-600 text-green-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    Cards
                                </button>
                                <button
                                    onClick={() => setActiveTab('stats')}
                                    className={`px-6 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition ${
                                        activeTab === 'stats'
                                            ? 'border-green-600 text-green-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    Stats
                                </button>
                                <button
                                    onClick={() => setActiveTab('posts')}
                                    className={`px-6 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition ${
                                        activeTab === 'posts'
                                            ? 'border-green-600 text-green-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    Posts
                                </button>
                                <button
                                    onClick={() => setActiveTab('media')}
                                    className={`px-6 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition ${
                                        activeTab === 'media'
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
                    {activeTab === 'info' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Personal Information */}
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <h2 className="text-xl font-bold mb-6">Personal Information</h2>
                                <div className="space-y-6">
                                    {/* Email */}
                                    {profileUser.contact_info?.is_added && profileUser.contact_info?.is_public && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-500 flex items-center gap-2 mb-2">
                                                <Mail className="w-4 h-4" />
                                                Email
                                            </label>
                                            <div className="flex items-center justify-between">
                                                <p className="text-gray-900">{profileUser.contact_info.email}</p>
                                                <span className="text-xs flex items-center gap-1 text-green-600">
                                                    <Globe className="w-3 h-3" /> Public
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Gender */}
                                    {profileUser.gender_data?.is_added && profileUser.gender_data?.is_public && profileUser.gender_data?.role && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-500 mb-2 block">Gender</label>
                                            <div className="flex items-center justify-between">
                                                <p className="text-gray-900">{profileUser.gender_data.role}</p>
                                                <span className="text-xs flex items-center gap-1 text-green-600">
                                                    <Globe className="w-3 h-3" /> Public
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Birthdate */}
                                    {profileUser.birthdate_data?.is_added && profileUser.birthdate_data?.is_public && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-500 mb-2 block">Date of Birth</label>
                                            <div className="flex items-center justify-between">
                                                <p className="text-gray-900">
                                                    {new Date(profileUser.birthdate_data.date).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric',
                                                    })} ({profileUser.birthdate_data.age} years old)
                                                </p>
                                                <span className="text-xs flex items-center gap-1 text-green-600">
                                                    <Globe className="w-3 h-3" /> Public
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Address */}
                                    {profileUser.address_data?.is_added && profileUser.address_data?.is_public && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-500 flex items-center gap-2 mb-2">
                                                <MapPin className="w-4 h-4" />
                                                Location
                                            </label>
                                            <div className="flex items-center justify-between">
                                                <p className="text-gray-900">{profileUser.address_data.address_str}</p>
                                                <span className="text-xs flex items-center gap-1 text-green-600">
                                                    <Globe className="w-3 h-3" /> Public
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Ball Handling Style */}
                                    {profileUser.ball_handling_style?.is_added && profileUser.ball_handling_style?.is_public && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-500 flex items-center gap-2 mb-2">
                                                <Dumbbell className="w-4 h-4" />
                                                Ball Handling Style
                                            </label>
                                            <div className="flex items-center justify-between">
                                                <p className="text-gray-900">{profileUser.ball_handling_style.description}</p>
                                                <span className="text-xs flex items-center gap-1 text-green-600">
                                                    <Globe className="w-3 h-3" /> Public
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Home Center */}
                                    {profileUser.home_center_data?.is_added && profileUser.home_center_data?.is_public && profileUser.home_center_data?.center && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-500 flex items-center gap-2 mb-2">
                                                <Building2 className="w-4 h-4" />
                                                Home Center
                                            </label>
                                            <div className="space-y-2">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <p className="text-gray-900 font-medium">{profileUser.home_center_data.center.name}</p>
                                                        <p className="text-sm text-gray-600">{profileUser.home_center_data.center.address_str}</p>
                                                    </div>
                                                    <span className="text-xs flex items-center gap-1 text-green-600">
                                                        <Globe className="w-3 h-3" /> Public
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'cards' && (
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <p className="text-gray-500 text-center py-12">Trading cards feature coming soon...</p>
                        </div>
                    )}

                    {activeTab === 'stats' && (
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <p className="text-gray-500 text-center py-12">Bowling statistics feature coming soon...</p>
                        </div>
                    )}

                    {activeTab === 'posts' && (
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <p className="text-gray-500 text-center py-12">Posts feature coming soon...</p>
                        </div>
                    )}

                    {activeTab === 'media' && (
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <p className="text-gray-500 text-center py-12">Media gallery feature coming soon...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
