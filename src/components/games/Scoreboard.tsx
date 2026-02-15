'use client';

import React from 'react';
import { FrameEntity } from '@/types';
import { getFrameSymbols, getSplitThrowIndexes } from '@/lib/bowlingUtils';

interface ScoreboardProps {
    frames: FrameEntity[];
    currentFrame: number;
    currentThrow: number;
    cumulativeScores: number[];
}

export default function Scoreboard({
    frames,
    currentFrame,
    currentThrow,
    cumulativeScores,
}: ScoreboardProps) {
    // Ensure we have 10 frames to display
    const displayFrames = frames.length >= 10 
        ? frames 
        : [...frames, ...Array.from({ length: 10 - frames.length }, (_, i) => ({
            number: frames.length + i + 1,
            throws: [],
            isPocketHit: false,
        }))];

    return (
        <div className="bg-white p-2 overflow-x-auto">
            <div className="flex flex-col gap-1 min-w-max">
                {/* Frame numbers row */}
                <div className="flex gap-1">
                    {displayFrames.slice(0, 10).map((frame) => {
                        const isTenth = frame.number === 10;
                        const isActive = currentFrame === frame.number;

                        return (
                            <div
                                key={frame.number}
                                className={`flex items-center justify-center h-6 rounded text-xs font-semibold transition-all ${
                                    isTenth ? 'w-14' : 'w-9'
                                } ${
                                    isActive
                                        ? 'bg-green-500 text-white border-2 border-green-500'
                                        : 'bg-white text-gray-500 border border-gray-200'
                                }`}
                            >
                                {frame.number}
                            </div>
                        );
                    })}
                </div>

                {/* Score tiles row */}
                <div className="flex gap-1">
                    {displayFrames.slice(0, 10).map((frame) => {
                        const cumulative =
                            frame.number <= cumulativeScores.length
                                ? cumulativeScores[frame.number - 1]
                                : null;
                        const isActive = currentFrame === frame.number;
                        const maxIndex = frame.number === 10 ? 2 : 1;
                        const currentIndex = currentThrow - 1;
                        const activeThrowIndex = isActive
                            ? Math.max(0, Math.min(currentIndex, maxIndex))
                            : null;

                        return (
                            <FrameScoreTile
                                key={frame.number}
                                frame={frame}
                                cumulativeScore={cumulative}
                                isActive={isActive}
                                activeThrowIndex={activeThrowIndex}
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

interface FrameScoreTileProps {
    frame: FrameEntity;
    cumulativeScore: number | null;
    isActive: boolean;
    activeThrowIndex: number | null;
}

function FrameScoreTile({
    frame,
    cumulativeScore,
    isActive,
    activeThrowIndex,
}: FrameScoreTileProps) {
    const isTenth = frame.number === 10;
    const slots = isTenth ? 3 : 2;
    const symbols = getFrameSymbols(frame);
    const splitIndexes = getSplitThrowIndexes(frame);

    return (
        <div
            className={`rounded overflow-hidden transition-all ${
                isTenth ? 'w-14' : 'w-9'
            } ${
                isActive
                    ? 'border-2 border-green-500 shadow-md shadow-green-500/20'
                    : 'border border-gray-200'
            }`}
        >
            {/* Throw symbols row */}
            <div className="flex">
                {Array.from({ length: slots }).map((_, index) => {
                    const isActiveThrow = activeThrowIndex === index;
                    const isSplitThrow = splitIndexes.includes(index);

                    return (
                        <div
                            key={index}
                            className={`flex-1 h-6 flex items-center justify-center text-sm font-semibold border-b transition-colors ${
                                index < slots - 1 ? 'border-r border-gray-200' : ''
                            } ${
                                isActiveThrow
                                    ? 'bg-green-500 text-white'
                                    : 'bg-white'
                            } ${
                                isSplitThrow && !isActiveThrow
                                    ? 'text-red-600'
                                    : isActiveThrow
                                    ? ''
                                    : 'text-gray-900'
                            }`}
                        >
                            {symbols[index] || ''}
                        </div>
                    );
                })}
            </div>

            {/* Cumulative score row */}
            <div
                className={`h-6 flex items-center justify-center text-sm font-semibold ${
                    isActive ? 'text-green-600' : 'text-gray-900'
                }`}
            >
                {cumulativeScore !== null ? cumulativeScore : ''}
            </div>
        </div>
    );
}
