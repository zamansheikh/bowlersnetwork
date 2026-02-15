'use client';

import { useState, useEffect } from 'react';
import { X, Loader, User } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';

interface FollowUser {
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
}

interface FollowersModalProps {
    isOpen: boolean;
    onClose: () => void;
    type: 'followers' | 'following';
    accessToken: string;
}

export default function FollowersModal({ isOpen, onClose, type, accessToken }: FollowersModalProps) {
    const [users, setUsers] = useState<FollowUser[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            fetchFollowList();
        }
    }, [isOpen, type]);

    const fetchFollowList = async () => {
        setLoading(true);
        setError(null);
        try {
            const endpoint = type === 'followers' ? '/api/profile/followers' : '/api/profile/followings';
            const response = await axios.get(`https://test.bowlersnetwork.com${endpoint}`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            });
            setUsers(response.data || []);
        } catch (err) {
            console.error(`Error fetching ${type}:`, err);
            setError(`Failed to load ${type}`);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900 capitalize">
                        {type === 'followers' ? 'Followers' : 'Following'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="flex items-center justify-center h-40">
                            <Loader className="w-6 h-6 text-[#8BC342] animate-spin" />
                        </div>
                    ) : error ? (
                        <div className="p-6 text-center text-red-600">{error}</div>
                    ) : users.length === 0 ? (
                        <div className="p-6 text-center text-gray-500">
                            No {type === 'followers' ? 'followers' : 'following'} yet
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {users.map(user => (
                                <div key={user.user_id} className="p-4 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center justify-between gap-3">
                                        {/* User Info */}
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <div className="flex-shrink-0">
                                                {user.profile_picture_url ? (
                                                    <img
                                                        src={user.profile_picture_url}
                                                        alt={user.name}
                                                        className="w-10 h-10 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8BC342] to-[#6fa332] flex items-center justify-center text-white font-bold text-sm">
                                                        {user.name.charAt(0)}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-gray-900 truncate">{user.name}</p>
                                                <p className="text-xs text-gray-500 truncate">@{user.username}</p>
                                                {user.roles.is_pro && (
                                                    <div className="flex items-center gap-1 mt-1 text-xs bg-green-50 text-[#8BC342] px-2 py-0.5 rounded-full w-fit">
                                                        <span className="font-medium">Pro</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Visit Profile Button */}
                                        <Link
                                            href={`/profile/${user.username}`}
                                            onClick={onClose}
                                            className="px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex-shrink-0 flex items-center gap-1 bg-[#8BC342] text-white hover:bg-[#6fa332]"
                                        >
                                            <User className="w-3 h-3" />
                                            Visit Profile
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
