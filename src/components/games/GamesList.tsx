'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { BowlingGameEntity, GameTypeDisplay, LaneConditionDisplay, OilPatternDisplay } from '@/types';
import { getGames, deleteGame, calculateGameStats, GameStats } from '@/lib/gameStorage';

interface GamesListProps {
    onAddGame?: () => void;
}

export default function GamesList({ onAddGame }: GamesListProps) {
    const [games, setGames] = useState<BowlingGameEntity[]>([]);
    const [stats, setStats] = useState<GameStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

    useEffect(() => {
        loadGames();
    }, []);

    const loadGames = () => {
        setLoading(true);
        const loadedGames = getGames();
        setGames(loadedGames);
        setStats(calculateGameStats());
        setLoading(false);
    };

    const handleDeleteGame = (id: string) => {
        deleteGame(id);
        setDeleteConfirmId(null);
        loadGames();
    };

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        }).format(date);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Stats Summary */}
            {stats && stats.totalGames > 0 && (
                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-5 text-white">
                    <h3 className="text-lg font-bold mb-4">Your Stats</h3>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                            <p className="text-3xl font-bold">{stats.averageScore}</p>
                            <p className="text-sm text-green-100">Average</p>
                        </div>
                        <div className="text-center">
                            <p className="text-3xl font-bold">{stats.highGame}</p>
                            <p className="text-sm text-green-100">High Game</p>
                        </div>
                        <div className="text-center">
                            <p className="text-3xl font-bold">{stats.totalGames}</p>
                            <p className="text-sm text-green-100">Games</p>
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-white/20 grid grid-cols-3 gap-4">
                        <div className="text-center">
                            <p className="text-2xl font-bold">{stats.totalStrikes}</p>
                            <p className="text-xs text-green-100">Strikes</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold">{stats.totalSpares}</p>
                            <p className="text-xs text-green-100">Spares</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold">{stats.perfectGames}</p>
                            <p className="text-xs text-green-100">300 Games</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Games List */}
            {games.length === 0 ? (
                <div className="text-center py-16">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/25">
                        <span className="text-4xl">🎳</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">No games yet</h3>
                    <p className="text-gray-500 mb-6">Get started by adding your first game</p>
                    {onAddGame && (
                        <button
                            onClick={onAddGame}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add First Game
                        </button>
                    )}
                </div>
            ) : (
                <div className="space-y-3">
                    {games.map((game, index) => (
                        <GameCard
                            key={game.id}
                            game={game}
                            gameNumber={games.length - index}
                            formatDate={formatDate}
                            onDelete={() => setDeleteConfirmId(game.id)}
                        />
                    ))}
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            {deleteConfirmId && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Delete Game?</h2>
                        <p className="text-gray-600 mb-6">
                            This action cannot be undone. Are you sure you want to delete this game?
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteConfirmId(null)}
                                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDeleteGame(deleteConfirmId)}
                                className="flex-1 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

interface GameCardProps {
    game: BowlingGameEntity;
    gameNumber: number;
    formatDate: (date: Date) => string;
    onDelete: () => void;
}

function GameCard({ game, gameNumber, formatDate, onDelete }: GameCardProps) {
    return (
        <Link href={`/games/${game.id}`}>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all">
                <div className="flex items-center gap-4">
                    {/* Score Circle */}
                    <div
                        className={`w-16 h-16 rounded-full flex flex-col items-center justify-center shadow-lg ${
                            game.isComplete
                                ? 'bg-gradient-to-br from-green-500 to-green-600 shadow-green-500/25'
                                : 'bg-gradient-to-br from-amber-500 to-amber-600 shadow-amber-500/25'
                        }`}
                    >
                        <span className="text-2xl font-bold text-white">{game.totalScore}</span>
                        <span className="text-xs text-white/70">Score</span>
                    </div>

                    {/* Game Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-bold text-gray-900">Game #{gameNumber}</h3>
                            {!game.isComplete && (
                                <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                                    In Progress
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-gray-500 mb-2">{formatDate(game.date)}</p>
                        <div className="flex flex-wrap gap-2">
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-lg">
                                {GameTypeDisplay[game.gameType]}
                            </span>
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-lg">
                                {OilPatternDisplay[game.oilPattern]}
                            </span>
                            {game.laneNumber && (
                                <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs font-medium rounded-lg">
                                    Lane {game.laneNumber}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Delete Button */}
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onDelete();
                        }}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            </div>
        </Link>
    );
}
