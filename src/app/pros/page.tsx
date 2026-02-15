'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { api } from '@/lib/api';
import { Loader, User, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface ProPlayer {
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
    cover_picture_url?: string;
    is_followable: boolean;
    is_following: boolean;
    follower_count: number;
}

export default function ProsPage() {
    const { user } = useAuth();
    const [players, setPlayers] = useState<ProPlayer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPros = async () => {
            try {
                // Using the api helper which handles the base URL and auth headers if needed
                const response = await api.get('/api/pros');
                setPlayers(response.data || []);
            } catch (err) {
                console.error('Error fetching pros:', err);
                setError('Failed to load professional players.');
            } finally {
                setLoading(false);
            }
        };

        fetchPros();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
                <Loader className="w-8 h-8 text-[#8BC342] animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-500 font-medium mb-4">{error}</p>
                    <button 
                        onClick={() => window.location.reload()} 
                        className="px-4 py-2 bg-[#8BC342] text-white rounded-lg hover:bg-[#7ac85a] transition"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-20 pb-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Pro Players</h1>
                    <p className="text-gray-500 mt-2">Connect with professional players and follow their journey.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {players.map((player) => (
                        <div key={player.user_id} className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden border border-gray-100 flex flex-col">
                            {/* Card Header / Banner */}
                            <div className="h-24 bg-gradient-to-r from-gray-800 to-gray-900 relative">
                                {player.cover_picture_url ? (
                                    <Image
                                        src={player.cover_picture_url}
                                        alt={`${player.name} cover`}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="absolute inset-0 bg-[#8BC342] opacity-10 pattern-grid"></div>
                                )}
                            </div>

                            {/* Profile Content */}
                            <div className="px-6 pb-6 flex-1 flex flex-col items-center -mt-12 text-center">
                                {/* Profile Picture */}
                                <div className="relative mb-4">
                                    <div className="w-24 h-24 rounded-full border-4 border-white shadow-md overflow-hidden bg-white">
                                        <Image
                                            src={player.profile_picture_url || '/default-avatar.png'}
                                            alt={player.name}
                                            width={96}
                                            height={96}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    {player.roles.is_pro && (
                                        <div className="absolute bottom-1 right-1 bg-[#8BC342] text-white p-1 rounded-full border-2 border-white" title="Pro Player">
                                            <Shield className="w-3 h-3 fill-current" />
                                        </div>
                                    )}
                                </div>

                                {/* Names */}
                                <h3 className="text-xl font-bold text-gray-900 mb-1">{player.name}</h3>
                                <p className="text-sm text-gray-500 mb-4">@{player.username}</p>

                                {/* Stats / Role Badge */}
                                <div className="flex gap-2 mb-6">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        Pro
                                    </span>
                                    {player.follower_count > 0 && (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                            {player.follower_count} Followers
                                        </span>
                                    )}
                                </div>

                                {/* Action Button */}
                                <div className="mt-auto w-full">
                                    <Link 
                                        href={`/profile/${player.username}`}
                                        className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-[#8BC342] text-white font-medium rounded-xl hover:bg-[#7ac85a] transition-colors focus:ring-4 focus:ring-green-500/20"
                                    >
                                        <User className="w-4 h-4" />
                                        Visit Profile
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {players.length === 0 && (
                    <div className="text-center py-20">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <User className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">No players found</h3>
                        <p className="text-gray-500">Check back later for updates.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
