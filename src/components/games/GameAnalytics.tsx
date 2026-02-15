'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
    BowlingGameEntity, 
    FrameEntity,
    AnalyticsStats,
    GameTypeDisplay,
    OilPatternDisplay,
    LaneConditionDisplay,
    HandPreferenceDisplay
} from '@/types';
import { 
    getFrameSymbols, 
    calculateCumulativeScores,
    getSplitThrowIndexes,
    isSplitLeave
} from '@/lib/bowlingUtils';

interface GameAnalyticsProps {
    game: BowlingGameEntity;
}

export default function GameAnalytics({ game }: GameAnalyticsProps) {
    const router = useRouter();
    const [selectedTab, setSelectedTab] = useState(0);

    const cumulativeScores = useMemo(() => calculateCumulativeScores(game.frames), [game.frames]);
    const stats = useMemo(() => calculateStats(game.frames), [game.frames]);

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        }).format(date);
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
                    <h1 className="text-lg font-bold">Game Analytics</h1>
                    <div className="w-10" />
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="bg-green-500/10 px-4 py-3">
                <div className="flex gap-3">
                    {['Overview', 'Details', 'Frames'].map((tab, index) => (
                        <button
                            key={tab}
                            onClick={() => setSelectedTab(index)}
                            className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
                                selectedTab === index
                                    ? 'bg-green-500 text-white'
                                    : 'text-green-700 hover:bg-green-100'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="p-4">
                {selectedTab === 0 && (
                    <OverviewTab game={game} stats={stats} formatDate={formatDate} />
                )}
                {selectedTab === 1 && (
                    <DetailsTab stats={stats} frames={game.frames} />
                )}
                {selectedTab === 2 && (
                    <FramesTab frames={game.frames} cumulativeScores={cumulativeScores} />
                )}
            </div>
        </div>
    );
}

// Calculate analytics stats from frames
function calculateStats(frames: FrameEntity[]): AnalyticsStats {
    let strikes = 0;
    let spares = 0;
    let splits = 0;
    let splitConversions = 0;
    let openFrames = 0;
    let completedFrames = 0;
    let totalFirstBallPins = 0;
    let firstBallCount = 0;
    let pocketHits = 0;

    frames.forEach((frame, index) => {
        if (frame.throws.length === 0) return;

        completedFrames++;
        const first = frame.throws[0];
        const firstPins = first.isFoul ? 0 : first.knockedPins.size;
        totalFirstBallPins += firstPins;
        firstBallCount++;

        // Check for pocket hit
        if (frame.isPocketHit) pocketHits++;

        // Strike
        if (firstPins === 10 && !first.isFoul) {
            strikes++;
            return;
        }

        // Check for split
        if (isSplitLeave(frame, 0)) {
            splits++;
        }

        // Check second throw
        if (frame.throws.length >= 2) {
            const second = frame.throws[1];
            const secondPins = second.isFoul ? 0 : second.knockedPins.size;

            if (firstPins + secondPins === 10 && !first.isFoul && !second.isFoul) {
                spares++;
                // Check if converted a split
                if (isSplitLeave(frame, 0)) {
                    splitConversions++;
                }
            } else if (index < 9) {
                // Open frame (not in 10th)
                openFrames++;
            }
        }

        // 10th frame extra throws
        if (index === 9) {
            if (frame.throws.length >= 2) {
                const second = frame.throws[1];
                if (!second.isFoul && second.knockedPins.size === 10) {
                    strikes++;
                }
            }
            if (frame.throws.length >= 3) {
                const third = frame.throws[2];
                if (!third.isFoul && third.knockedPins.size === 10) {
                    strikes++;
                }
            }
        }
    });

    return {
        strikes,
        spares,
        splits,
        splitConversions,
        openFrames,
        completedFrames,
        avgFirstBallPins: firstBallCount > 0 ? Math.round((totalFirstBallPins / firstBallCount) * 10) / 10 : 0,
        pocketHits,
        totalPocketOpportunities: firstBallCount,
    };
}

// Overview Tab
function OverviewTab({ 
    game, 
    stats, 
    formatDate 
}: { 
    game: BowlingGameEntity; 
    stats: AnalyticsStats; 
    formatDate: (date: Date) => string;
}) {
    return (
        <div className="space-y-4">
            {/* Score Summary Card */}
            <div className="bg-white rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className={`w-20 h-20 rounded-full flex flex-col items-center justify-center ${
                        game.isComplete
                            ? 'bg-gradient-to-br from-green-500 to-green-600'
                            : 'bg-gradient-to-br from-amber-500 to-amber-600'
                    }`}>
                        <span className="text-3xl font-bold text-white">{game.totalScore}</span>
                        <span className="text-xs text-white/70">Total</span>
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-1">
                            {game.isComplete ? 'Game Complete' : 'In Progress'}
                        </h3>
                        <p className="text-sm text-gray-500">{formatDate(game.date)}</p>
                        <p className="text-sm text-gray-500 mt-1">
                            {stats.completedFrames}/10 frames completed
                        </p>
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3">
                <StatCard label="Strikes" value={stats.strikes} icon="🎯" color="green" />
                <StatCard label="Spares" value={stats.spares} icon="✓" color="blue" />
                <StatCard label="Splits" value={stats.splits} icon="⚡" color="red" />
                <StatCard label="Open Frames" value={stats.openFrames} icon="○" color="gray" />
            </div>

            {/* Game Settings */}
            <div className="bg-white rounded-2xl p-5 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Game Settings</h3>
                <div className="space-y-3">
                    <div className="flex justify-between">
                        <span className="text-gray-500">Game Type</span>
                        <span className="font-semibold text-gray-900">{GameTypeDisplay[game.gameType]}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Oil Pattern</span>
                        <span className="font-semibold text-gray-900">{OilPatternDisplay[game.oilPattern]}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Lane Condition</span>
                        <span className="font-semibold text-gray-900">{LaneConditionDisplay[game.laneCondition]}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Hand</span>
                        <span className="font-semibold text-gray-900">{HandPreferenceDisplay[game.handPreference]}</span>
                    </div>
                    {game.laneNumber && (
                        <div className="flex justify-between">
                            <span className="text-gray-500">Lane Number</span>
                            <span className="font-semibold text-gray-900">{game.laneNumber}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// Stat Card Component
function StatCard({ 
    label, 
    value, 
    icon, 
    color 
}: { 
    label: string; 
    value: number; 
    icon: string; 
    color: string;
}) {
    const colorClasses: Record<string, string> = {
        green: 'bg-green-50 text-green-600',
        blue: 'bg-blue-50 text-blue-600',
        red: 'bg-red-50 text-red-600',
        gray: 'bg-gray-50 text-gray-600',
    };

    return (
        <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${colorClasses[color]}`}>
                <span className="text-lg">{icon}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500">{label}</p>
        </div>
    );
}

// Details Tab
function DetailsTab({ stats, frames }: { stats: AnalyticsStats; frames: FrameEntity[] }) {
    const strikePercentage = stats.completedFrames > 0 
        ? Math.round((stats.strikes / stats.completedFrames) * 100) 
        : 0;
    const sparePercentage = stats.completedFrames > 0 && stats.completedFrames > stats.strikes
        ? Math.round((stats.spares / (stats.completedFrames - stats.strikes)) * 100)
        : 0;
    const splitConversionRate = stats.splits > 0
        ? Math.round((stats.splitConversions / stats.splits) * 100)
        : 0;

    return (
        <div className="space-y-4">
            {/* Performance Metrics */}
            <div className="bg-white rounded-2xl p-5 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Performance Metrics</h3>
                
                <div className="space-y-4">
                    <MetricBar label="Strike %" value={strikePercentage} color="green" />
                    <MetricBar label="Spare %" value={sparePercentage} color="blue" />
                    <MetricBar label="Split Conversion" value={splitConversionRate} color="red" />
                </div>
            </div>

            {/* Detailed Stats */}
            <div className="bg-white rounded-2xl p-5 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Detailed Statistics</h3>
                
                <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-gray-50 rounded-xl">
                        <p className="text-2xl font-bold text-gray-900">{stats.avgFirstBallPins}</p>
                        <p className="text-sm text-gray-500">Avg First Ball</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-xl">
                        <p className="text-2xl font-bold text-gray-900">{stats.pocketHits}</p>
                        <p className="text-sm text-gray-500">Pocket Hits</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-xl">
                        <p className="text-2xl font-bold text-gray-900">{stats.splits}</p>
                        <p className="text-sm text-gray-500">Splits Left</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-xl">
                        <p className="text-2xl font-bold text-gray-900">{stats.splitConversions}</p>
                        <p className="text-sm text-gray-500">Splits Converted</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Metric Bar Component
function MetricBar({ label, value, color }: { label: string; value: number; color: string }) {
    const colorClasses: Record<string, string> = {
        green: 'bg-green-500',
        blue: 'bg-blue-500',
        red: 'bg-red-500',
    };

    return (
        <div>
            <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">{label}</span>
                <span className="text-sm font-semibold text-gray-900">{value}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                    className={`h-full rounded-full transition-all ${colorClasses[color]}`}
                    style={{ width: `${value}%` }}
                />
            </div>
        </div>
    );
}

// Frames Tab
function FramesTab({ 
    frames, 
    cumulativeScores 
}: { 
    frames: FrameEntity[]; 
    cumulativeScores: number[];
}) {
    return (
        <div className="space-y-3">
            {frames.map((frame, index) => {
                const symbols = getFrameSymbols(frame);
                const score = index < cumulativeScores.length ? cumulativeScores[index] : null;
                const splitIndexes = getSplitThrowIndexes(frame);

                return (
                    <div key={frame.number} className="bg-white rounded-xl p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                                    <span className="font-bold text-green-700">{frame.number}</span>
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900">Frame {frame.number}</p>
                                    <div className="flex gap-2 mt-1">
                                        {symbols.map((symbol, i) => (
                                            <span 
                                                key={i} 
                                                className={`px-2 py-0.5 rounded text-sm font-semibold ${
                                                    symbol === 'X' 
                                                        ? 'bg-green-100 text-green-700'
                                                        : symbol === '/'
                                                        ? 'bg-blue-100 text-blue-700'
                                                        : splitIndexes.includes(i)
                                                        ? 'bg-red-100 text-red-700'
                                                        : 'bg-gray-100 text-gray-700'
                                                }`}
                                            >
                                                {symbol || '-'}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold text-gray-900">{score ?? '-'}</p>
                                <p className="text-sm text-gray-500">cumulative</p>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
