'use client';

import Image from 'next/image';
import { useState } from 'react';

interface PlayerStats {
    label: string;
    value: string | number;
}

interface PlayerProfileCardProps {
    player: {
        id: number;
        name: string;
        level: number;
        avatar?: string;
        isFollowing?: boolean;
        stats: PlayerStats[];
    };
    onFollow?: (playerId: number) => void;
    className?: string;
}

export default function PlayerProfileCard({ player, onFollow, className = '' }: PlayerProfileCardProps) {
    const [isFollowing, setIsFollowing] = useState(player.isFollowing || false);
    const [isLoading, setIsLoading] = useState(false);

    const handleFollowClick = async () => {
        if (isLoading) return;

        setIsLoading(true);
        try {
            if (onFollow) {
                await onFollow(player.id);
            }
            setIsFollowing(!isFollowing);
        } catch (error) {
            console.error('Error following player:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Generate initials for fallback avatar
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <div className={`relative ${className}`}>
            {/* Shield Shape Container */}
            <div className="relative w-80 h-96 mx-auto">
                {/* Main Shield Background */}
                <div
                    className="absolute inset-0 bg-white shadow-2xl border-4 border-blue-900"
                    style={{
                        borderRadius: '40px 40px 20px 20px',
                        clipPath: 'polygon(0 0, 100% 0, 100% 75%, 50% 100%, 0 75%)'
                    }}
                >

                    {/* Level Badge */}
                    <div className="absolute top-6 left-6 z-10">
                        <div className="text-blue-900 font-semibold text-base">Level</div>
                        <div className="text-blue-900 font-bold text-5xl leading-none">{player.level}</div>
                    </div>

                    {/* Player Avatar */}
                    <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-10">
                        <div className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-lg">
                            {player.avatar ? (
                                <Image
                                    src={player.avatar}
                                    alt={`${player.name} avatar`}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-yellow-400 to-yellow-600 text-white text-xl font-bold">
                                    {getInitials(player.name)}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Player Name */}
                    <div className="absolute top-48 left-0 right-0 px-6 z-10">
                        <h3 className="text-blue-900 font-bold text-xl text-center leading-tight">
                            {player.name}
                        </h3>
                    </div>

                    {/* Follow Button */}
                    <div className="absolute top-60 right-6 z-10">
                        <button
                            onClick={handleFollowClick}
                            disabled={isLoading}
                            className={`px-3 py-1.5 rounded-lg font-semibold text-sm transition-all duration-200 ${isFollowing
                                    ? 'bg-green-600 text-white hover:bg-green-700'
                                    : 'bg-transparent text-blue-600 border-2 border-blue-600 hover:bg-blue-50'
                                } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
                        >
                            {isLoading ? (
                                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mx-auto"></div>
                            ) : isFollowing ? (
                                '✓ Following'
                            ) : (
                                '+ Follow'
                            )}
                        </button>
                    </div>

                    {/* Stats Section */}
                    <div className="absolute bottom-12 left-0 right-0 px-6 z-10">
                        <div className="border-t-2 border-blue-900 pt-3">
                            <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                                {player.stats.slice(0, 6).map((stat, index) => (
                                    <div key={index} className="text-center">
                                        <div className="text-blue-900 font-bold text-base">
                                            {stat.value}
                                        </div>
                                        <div className="text-blue-700 text-xs font-medium">
                                            {stat.label}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Decorative Elements */}
                    <div className="absolute top-6 right-6 w-8 h-8 opacity-20">
                        <div className="w-full h-full bg-blue-900 rounded-full"></div>
                    </div>
                    <div className="absolute top-10 right-10 w-4 h-4 opacity-20">
                        <div className="w-full h-full bg-blue-900 rounded-full"></div>
                    </div>
                </div>

                {/* Subtle Shadow Effect */}
                <div
                    className="absolute inset-0 bg-blue-900 opacity-5 transform translate-y-1 translate-x-0.5 -z-10"
                    style={{
                        borderRadius: '40px 40px 20px 20px',
                        clipPath: 'polygon(0 0, 100% 0, 100% 75%, 50% 100%, 0 75%)'
                    }}
                >
                </div>
            </div>
        </div>
    );
}

// Usage Example Component
export function PlayerProfileCardExample() {
    const samplePlayer = {
        id: 1,
        name: "Jason Belmonte",
        level: 3,
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jason",
        isFollowing: false,
        stats: [
            { label: "PAC", value: "97" },
            { label: "SHO", value: "89" },
            { label: "PAS", value: "92" },
            { label: "DRB", value: "85" },
            { label: "DEF", value: "78" },
            { label: "PHY", value: "88" }
        ]
    };

    const handleFollow = async (playerId: number) => {
        console.log(`Following player ${playerId}`);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
    };

    return (
        <div className="p-8 bg-gray-100 min-h-screen flex items-center justify-center">
            <PlayerProfileCard
                player={samplePlayer}
                onFollow={handleFollow}
                className="hover:scale-105 transition-transform duration-300"
            />
        </div>
    );
}
