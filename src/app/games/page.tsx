'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GamesList, GameSetupDialog } from '@/components/games';
import { GameSetupData } from '@/types';

export default function GamesPage() {
    const router = useRouter();
    const [showSetupDialog, setShowSetupDialog] = useState(false);

    const handleAddGame = () => {
        setShowSetupDialog(true);
    };

    const handleSetupSubmit = (data: GameSetupData) => {
        setShowSetupDialog(false);
        // Navigate to add score page with setup data
        const params = new URLSearchParams({
            gameType: data.gameType,
            oilPattern: data.oilPattern,
            laneCondition: data.laneCondition,
            ...(data.laneNumber && { laneNumber: data.laneNumber }),
        });
        router.push(`/games/new?${params.toString()}`);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-green-500 text-white">
                <div className="flex items-center justify-between px-4 py-3">
                    <button
                        onClick={() => router.back()}
                        className="p-2 rounded-full hover:bg-white/20 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <h1 className="text-lg font-bold">My Games 🎳</h1>
                    <button
                        onClick={() => router.push('/games/settings')}
                        className="p-2 rounded-full hover:bg-white/20 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="p-4">
                <GamesList onAddGame={handleAddGame} />
            </div>

            {/* FAB */}
            <button
                onClick={handleAddGame}
                className="fixed bottom-6 right-6 flex items-center gap-2 px-5 py-3 bg-green-500 text-white rounded-full font-semibold shadow-lg shadow-green-500/30 hover:bg-green-600 transition-all hover:scale-105"
            >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Score
            </button>

            {/* Game Setup Dialog */}
            <GameSetupDialog
                isOpen={showSetupDialog}
                onClose={() => setShowSetupDialog(false)}
                onSubmit={handleSetupSubmit}
            />
        </div>
    );
}
