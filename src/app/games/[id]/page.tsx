'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { GameAnalytics } from '@/components/games';
import { BowlingGameEntity } from '@/types';
import { getGameById } from '@/lib/gameStorage';

export default function GameDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [game, setGame] = useState<BowlingGameEntity | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const gameId = params.id as string;
        if (gameId) {
            const foundGame = getGameById(gameId);
            if (foundGame) {
                setGame(foundGame);
            } else {
                setError(true);
            }
        }
        setLoading(false);
    }, [params.id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (error || !game) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center p-6">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                        <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Game Not Found</h2>
                    <p className="text-gray-500 mb-6">The game you&apos;re looking for doesn&apos;t exist.</p>
                    <button
                        onClick={() => router.push('/games')}
                        className="px-6 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-colors"
                    >
                        Back to Games
                    </button>
                </div>
            </div>
        );
    }

    return <GameAnalytics game={game} />;
}
