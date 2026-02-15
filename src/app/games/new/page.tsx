'use client';

import React, { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { AddScore } from '@/components/games';
import { GameSetupData, GameType, OilPattern, LaneCondition } from '@/types';

function NewGameContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const gameSetupData: GameSetupData = {
        gameType: (searchParams.get('gameType') as GameType) || 'practice',
        oilPattern: (searchParams.get('oilPattern') as OilPattern) || 'house',
        laneCondition: (searchParams.get('laneCondition') as LaneCondition) || 'medium',
        laneNumber: searchParams.get('laneNumber') || undefined,
    };

    return (
        <AddScore
            gameSetupData={gameSetupData}
            onComplete={() => router.push('/games')}
        />
    );
}

export default function NewGamePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
            </div>
        }>
            <NewGameContent />
        </Suspense>
    );
}
