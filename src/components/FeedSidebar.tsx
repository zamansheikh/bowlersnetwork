'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, User, TrendingUp, Hash, Gift, Star, ArrowRight, Calendar, Trophy, Loader2, MapPin, ThumbsUp } from 'lucide-react';
import { api } from '@/lib/api';
import { tournamentApi } from '@/lib/api';
import { Tournament } from '@/types';
import EventCard from './EventCard';
import ReachEngagementCard from './ReachEngagementCard';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';

interface SuggestedUser {
    user_id: number;
    name: string;
    profile_picture_url: string;
    is_following: boolean;
    role?: string;
}

interface TrendingTopic {
    hashtag: string;
    posts_count: number;
    category: string;
}

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
    profile_picture_url: string;
    is_followable: boolean;
    is_following: boolean;
    follower_count: number;
}

export default function FeedSidebar() {
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestedUsers, setSuggestedUsers] = useState<SuggestedUser[]>([]);
    const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([]);
    const [followingUsers, setFollowingUsers] = useState<Set<number>>(new Set());
    const [tournaments, setTournaments] = useState<Tournament[]>([]);
    const [tournamentsLoading, setTournamentsLoading] = useState(true);

    // Upcoming Event state
    const [upcomingEvent, setUpcomingEvent] = useState<any>(null);
    const [upcomingEventLoading, setUpcomingEventLoading] = useState(true);
    const [interestLoading, setInterestLoading] = useState(false);

    // Search related state
    const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
    const [isSearchLoading, setIsSearchLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    const router = useRouter();
    const { user } = useAuth();

    // Fetch all users for search
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setIsSearchLoading(true);
                const response = await axios.get('https://test.bowlersnetwork.com/api/profile/all', {
                    headers: {
                        'Authorization': `Bearer ${user?.access_token}`,
                    },
                });
                setAllUsers(response.data);
            } catch (err) {
                console.error('Error fetching users for search:', err);
            } finally {
                setIsSearchLoading(false);
            }
        };

        if (user?.access_token) {
            fetchUsers();
        }
    }, [user?.access_token]);

    // Handle click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Filter users when search query changes
    useEffect(() => {
        if (!searchQuery.trim()) {
            setFilteredUsers([]);
            setShowDropdown(false);
            return;
        }

        const query = searchQuery.toLowerCase();
        const filtered = allUsers.filter(u =>
            u.name.toLowerCase().includes(query) ||
            u.username.toLowerCase().includes(query) ||
            u.email.toLowerCase().includes(query) ||
            u.user_id.toString().includes(query)
        ).slice(0, 5); // Limit to 5 results

        setFilteredUsers(filtered);
        setShowDropdown(true);
    }, [searchQuery, allUsers]);

    // Mock data - replace with real API calls
    useEffect(() => {
        // Fetch tournaments
        const fetchTournaments = async () => {
            try {
                setTournamentsLoading(true);
                const data = await tournamentApi.getTournaments();
                // Show only upcoming tournaments (next 3 for sidebar)
                const upcomingTournaments = data
                    .filter((t: Tournament) => new Date(t.reg_deadline) > new Date())
                    .sort((a: Tournament, b: Tournament) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
                    .slice(0, 3);
                setTournaments(upcomingTournaments);
            } catch (err) {
                console.error('Error fetching tournaments:', err);
            } finally {
                setTournamentsLoading(false);
            }
        };

        fetchTournaments();

        // Fetch upcoming event
        const fetchUpcomingEvent = async () => {
            try {
                setUpcomingEventLoading(true);
                const response = await api.get('/api/events/v1/upcoming');
                if (response.data?.event) {
                    setUpcomingEvent(response.data.event);
                }
            } catch (err) {
                console.error('Error fetching upcoming event:', err);
            } finally {
                setUpcomingEventLoading(false);
            }
        };

        fetchUpcomingEvent();

        // Mock suggested users
        setSuggestedUsers([
            {
                user_id: 1,
                name: "Jennifer",
                profile_picture_url: "/playercard1.png",
                is_following: false,
                role: "Pro Player"
            },
            {
                user_id: 2,
                name: "Jennifer",
                profile_picture_url: "/playercard2.png",
                is_following: false,
                role: "Pro Player"
            },
            {
                user_id: 3,
                name: "Jennifer",
                profile_picture_url: "/playercard3.png",
                is_following: false,
                role: "Pro Player"
            },
            {
                user_id: 4,
                name: "Jennifer",
                profile_picture_url: "/playercard4.png",
                is_following: false,
                role: "Pro Player"
            },
            {
                user_id: 5,
                name: "Jennifer",
                profile_picture_url: "/playercard1.png",
                is_following: false,
                role: "Pro Player"
            }
        ]);

        // Mock trending topics
        setTrendingTopics([
            {
                hashtag: "#worldnews",
                posts_count: 100,
                category: "Pro Player"
            },
            {
                hashtag: "#worldnews",
                posts_count: 100,
                category: "Pro Player"
            },
            {
                hashtag: "#worldnews",
                posts_count: 100,
                category: "Pro Player"
            }
        ]);
    }, []);

    const handleFollow = async (userId: number) => {
        try {
            // Mock API call - replace with real endpoint
            // await api.post(`/api/users/${userId}/follow`);

            // Update local state
            setFollowingUsers(prev => new Set(prev).add(userId));
            setSuggestedUsers(prev =>
                prev.map(user =>
                    user.user_id === userId
                        ? { ...user, is_following: true }
                        : user
                )
            );
        } catch (error) {
            console.error('Error following user:', error);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        // If user presses enter and there are results, go to the first one
        if (filteredUsers.length > 0) {
            router.push(`/profile/${filteredUsers[0].username}`);
            setShowDropdown(false);
            setSearchQuery('');
        }
    };

    const handleUserClick = (userId: number) => {
        router.push(`/player/${userId}`);
    };

    const handleSearchResultClick = (username: string) => {
        router.push(`/profile/${username}`);
        setShowDropdown(false);
        setSearchQuery('');
    };

    // Handle interest toggle for upcoming event
    const handleInterestToggle = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) {
            alert("Please login to show interest");
            return;
        }

        if (!upcomingEvent || interestLoading) return;

        const currentInterested = upcomingEvent.is_interested;

        // Optimistic update
        setUpcomingEvent((prev: any) => ({
            ...prev,
            is_interested: !currentInterested,
            total_interested: currentInterested
                ? Math.max(0, prev.total_interested - 1)
                : prev.total_interested + 1
        }));

        setInterestLoading(true);

        try {
            await api.get(`/api/events/v1/interest/${upcomingEvent.event_id}`);
        } catch (err) {
            console.error("Error toggling interest:", err);
            // Revert on error
            setUpcomingEvent((prev: any) => ({
                ...prev,
                is_interested: currentInterested,
                total_interested: currentInterested
                    ? prev.total_interested + 1
                    : Math.max(0, prev.total_interested - 1)
            }));
            alert("Failed to update interest status.");
        } finally {
            setInterestLoading(false);
        }
    };

    return (
        <div className="w-80 space-y-6">
            {/* Search Bar */}
            <div className="bg-white rounded-xl p-4 shadow-sm relative" ref={searchRef}>
                <form onSubmit={handleSearch} className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => searchQuery.trim() && setShowDropdown(true)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8BC342] focus:border-transparent"
                    />
                    {isSearchLoading && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <Loader2 className="w-4 h-4 animate-spin text-[#8BC342]" />
                        </div>
                    )}
                </form>

                {/* Search Dropdown */}
                {showDropdown && searchQuery.trim() && (
                    <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
                        {filteredUsers.length > 0 ? (
                            <div className="py-2">
                                {filteredUsers.map((user) => (
                                    <div
                                        key={user.user_id}
                                        onClick={() => handleSearchResultClick(user.username)}
                                        className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center gap-3 transition-colors"
                                    >
                                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                                            {user.profile_picture_url ? (
                                                <img
                                                    src={user.profile_picture_url}
                                                    alt={user.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-lime-100 text-[#8BC342]">
                                                    <User className="w-5 h-5" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-1">
                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                    {user.name}
                                                </p>
                                                {user.roles.is_pro && (
                                                    <span className="bg-lime-100 text-[#8BC342] text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                                                        PRO
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-500 truncate">@{user.username}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-4 text-center text-gray-500 text-sm">
                                No users found
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Who to Follow Section */}
            {/* <div className="bg-white rounded-xl p-4 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Who to Follow</h3>
                <div className="space-y-3">
                    {suggestedUsers.slice(0, 5).map((user) => (
                        <div key={user.user_id} className="flex items-center justify-between">
                            <div
                                className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors flex-1"
                                onClick={() => handleUserClick(user.user_id)}
                            >
                                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                                    <img
                                        src={user.profile_picture_url}
                                        alt={user.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.style.display = 'none';
                                            target.parentElement!.innerHTML = `
                                                <div class="w-full h-full bg-green-100 flex items-center justify-center">
                                                    <span class="text-green-600 font-medium text-sm">
                                                        ${user.name.split(' ').map(n => n[0]).join('')}
                                                    </span>
                                                </div>
                                            `;
                                        }}
                                    />
                                </div>
                                <div>
                                    <div className="flex items-center gap-1">
                                        <span className="font-medium text-gray-900">{user.name}</span>
                                        <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                                            <span className="text-white text-xs">✓</span>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-500">{user.role || 'Pro Player'}</p>
                                </div>
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleFollow(user.user_id);
                                }}
                                disabled={followingUsers.has(user.user_id)}
                                className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${followingUsers.has(user.user_id)
                                        ? 'bg-green-100 text-green-700 cursor-not-allowed'
                                        : 'bg-green-600 text-white hover:bg-green-700'
                                    }`}
                            >
                                {followingUsers.has(user.user_id) ? 'Following' : 'Follow'}
                            </button>
                        </div>
                    ))}
                </div>
                <button className="w-full text-green-600 hover:text-green-700 text-sm font-medium mt-4">
                    Show more
                </button>
            </div> */}

            {/* Reach & Engagement Card */}
            <ReachEngagementCard />

            {/* Upcoming Events Section */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-[#8BC342]" />
                        <h3 className="text-lg font-semibold text-gray-900">Upcoming Events</h3>
                    </div>
                    <Link
                        href="/events"
                        className="text-[#8BC342] hover:text-[#6fa332] text-sm flex items-center gap-1"
                    >
                        View All <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                {upcomingEventLoading ? (
                    <div className="flex items-center justify-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#8BC342]"></div>
                    </div>
                ) : upcomingEvent ? (
                    <Link href={`/events/${upcomingEvent.event_id}`} className="block">
                        <div className="border border-gray-100 rounded-lg p-3 hover:shadow-md transition-all hover:border-lime-200 cursor-pointer">
                            {/* Event Header */}
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-gray-900 text-sm line-clamp-1">
                                        {upcomingEvent.title}
                                    </h4>
                                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                        <MapPin className="w-3 h-3" />
                                        <span className="truncate">
                                            {upcomingEvent.location?.address_str || 'Location TBD'}
                                        </span>
                                    </div>
                                </div>
                                <span className="text-[#8BC342] text-xs font-semibold whitespace-nowrap ml-2">
                                    {new Date(upcomingEvent.event_datetime).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric'
                                    })} • {new Date(upcomingEvent.event_datetime).toLocaleTimeString('en-US', {
                                        hour: 'numeric',
                                        minute: '2-digit',
                                        hour12: true
                                    })}
                                </span>
                            </div>

                            {/* Event Host */}
                            <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-200">
                                        {upcomingEvent.user?.profile_picture_url ? (
                                            <img
                                                src={upcomingEvent.user.profile_picture_url}
                                                alt={upcomingEvent.user.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-lime-100 text-[#8BC342]">
                                                <User className="w-3 h-3" />
                                            </div>
                                        )}
                                    </div>
                                    <span className="text-xs text-gray-600">
                                        {upcomingEvent.user?.name || 'Unknown Host'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                    <button
                                        onClick={handleInterestToggle}
                                        disabled={!user || interestLoading}
                                        className={`flex items-center gap-1 px-2 py-1 rounded-lg font-bold transition-all ${upcomingEvent.is_interested
                                            ? 'bg-lime-100 text-[#8BC342]'
                                            : 'bg-gray-100 text-gray-600 hover:bg-lime-50 hover:text-[#8BC342]'
                                            } ${interestLoading ? 'opacity-50' : ''}`}
                                    >
                                        <ThumbsUp className={`w-3 h-3 ${upcomingEvent.is_interested ? 'fill-current' : ''}`} />
                                        <span>{upcomingEvent.is_interested ? 'Interested' : 'Interested?'} ({upcomingEvent.total_interested || 0})</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </Link>
                ) : (
                    <div className="text-center py-4">
                        <Calendar className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500 text-sm">No upcoming events</p>
                        <Link
                            href="/events"
                            className="text-[#8BC342] hover:text-[#6fa332] font-medium text-sm mt-1 inline-block"
                        >
                            Browse all →
                        </Link>
                    </div>
                )}
            </div>

            {/* Featured Partners */}
            {/* <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Featured Partners</h3>
                    <button
                        onClick={() => router.push('/perks')}
                        className="text-green-600 hover:text-green-700 text-sm flex items-center gap-1"
                    >
                        View All <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
                <div className="space-y-3">
                    <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm">Mario&apos;s Italian Kitchen</p>
                        <p className="text-xs text-green-600 font-medium">25% OFF with BOWLERS25</p>
                    </div>
                    <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-400 fill-current" />
                        <span className="text-xs">4.8</span>
                    </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                        <Trophy className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm">Pro Shop Gear</p>
                        <p className="text-xs text-green-600 font-medium">Buy 2 Get 1 Free on Bowling Tape</p>
                    </div>
                    <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-400 fill-current" />
                        <span className="text-xs">4.9</span>
                    </div>                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <Gift className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 text-sm">FitZone Gym</p>
                            <p className="text-xs text-blue-600 font-medium">30% OFF First Month</p>
                        </div>
                        <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-400 fill-current" />
                            <span className="text-xs">4.6</span>
                        </div>
                    </div>
                </div>
            </div> */}

            {/* What's happening Section */}
            {/* <div className="bg-white rounded-xl p-4 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">What&apos;s happening</h3>
                <div className="space-y-3">
                    {trendingTopics.map((topic, index) => (
                        <div key={index} className="cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
                            <p className="text-sm text-gray-500">{topic.category}</p>
                            <p className="font-semibold text-gray-900">{topic.hashtag}</p>
                            <p className="text-sm text-gray-500">
                                {topic.posts_count.toLocaleString()} Tweets
                            </p>
                        </div>
                    ))}
                </div>
                <button className="w-full text-green-600 hover:text-green-700 text-sm font-medium mt-4">
                    Show more
                </button>
            </div> */}

        </div>
    );
}
