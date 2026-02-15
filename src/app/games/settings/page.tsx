'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
    HandPreference, 
    HandPreferenceDisplay 
} from '@/types';
import { 
    getGameSettings, 
    setDefaultHandPreference, 
    clearAllGames,
    GameSettings 
} from '@/lib/gameStorage';

export default function GameSettingsPage() {
    const router = useRouter();
    const [settings, setSettings] = useState<GameSettings | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    useEffect(() => {
        setSettings(getGameSettings());
    }, []);

    const handleHandPreferenceChange = (pref: HandPreference) => {
        setDefaultHandPreference(pref);
        setSettings(getGameSettings());
    };

    const handleClearAllGames = () => {
        clearAllGames();
        setShowDeleteConfirm(false);
        router.push('/games');
    };

    if (!settings) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

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
                    <h1 className="text-lg font-bold">Game Settings</h1>
                    <div className="w-10" />
                </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-6">
                {/* Hand Preference */}
                <div className="bg-white rounded-2xl p-5 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Hand Preference</h3>
                    <div className="space-y-3">
                        {(['right', 'left'] as HandPreference[]).map((pref) => (
                            <button
                                key={pref}
                                onClick={() => handleHandPreferenceChange(pref)}
                                className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center justify-between ${
                                    settings.defaultHandPreference === pref
                                        ? 'border-green-500 bg-green-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                }`}
                            >
                                <span className={`font-semibold ${
                                    settings.defaultHandPreference === pref 
                                        ? 'text-green-700' 
                                        : 'text-gray-700'
                                }`}>
                                    {HandPreferenceDisplay[pref]}
                                </span>
                                {settings.defaultHandPreference === pref && (
                                    <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Data Management */}
                <div className="bg-white rounded-2xl p-5 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Data Management</h3>
                    <p className="text-sm text-gray-500 mb-4">
                        Delete all your bowling statistics and game history
                    </p>
                    <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="w-full p-4 rounded-xl border-2 border-red-200 text-red-600 font-semibold hover:bg-red-50 transition-colors"
                    >
                        Clear All Games
                    </button>
                </div>

                {/* About */}
                <div className="bg-white rounded-2xl p-5 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">About</h3>
                    <p className="text-sm text-gray-500">
                        Track your bowling games and analyze your performance. All data is stored locally on your device.
                    </p>
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 text-center mb-2">Delete All Games?</h2>
                        <p className="text-gray-500 text-center mb-6">
                            This will permanently delete all your bowling games and statistics. This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleClearAllGames}
                                className="flex-1 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-colors"
                            >
                                Delete All
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
