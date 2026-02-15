'use client';

import React, { useState } from 'react';
import { 
    GameSetupData, 
    GameType, 
    LaneCondition, 
    OilPattern,
    GameTypeDisplay,
    LaneConditionDisplay,
    LaneConditionDescription,
    OilPatternDisplay,
    OilPatternDescription,
    HandPreference,
    HandPreferenceDisplay
} from '@/types';
import { getGameSettings, setDefaultHandPreference } from '@/lib/gameStorage';

interface GameSetupDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: GameSetupData) => void;
}

export default function GameSetupDialog({ isOpen, onClose, onSubmit }: GameSetupDialogProps) {
    const settings = getGameSettings();
    const [showHandPreference, setShowHandPreference] = useState(!settings.hasSetHandPreference);
    
    const [gameType, setGameType] = useState<GameType>('practice');
    const [oilPattern, setOilPattern] = useState<OilPattern>('house');
    const [laneCondition, setLaneCondition] = useState<LaneCondition>('medium');
    const [laneNumber, setLaneNumber] = useState('');
    const [handPreference, setHandPreference] = useState<HandPreference>(settings.defaultHandPreference);

    const handleHandPreferenceSubmit = () => {
        setDefaultHandPreference(handPreference);
        setShowHandPreference(false);
    };

    const handleSubmit = () => {
        onSubmit({
            gameType,
            oilPattern,
            laneCondition,
            laneNumber: laneNumber || undefined,
        });
    };

    if (!isOpen) return null;

    // Hand Preference Dialog
    if (showHandPreference) {
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Hand Preference</h2>
                    <p className="text-gray-600 mb-6">
                        Which hand do you use for bowling?
                    </p>
                    
                    <div className="space-y-3 mb-6">
                        {(['right', 'left'] as HandPreference[]).map((pref) => (
                            <button
                                key={pref}
                                onClick={() => setHandPreference(pref)}
                                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                                    handPreference === pref
                                        ? 'border-green-500 bg-green-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                }`}
                            >
                                <span className="font-semibold text-gray-900">
                                    {HandPreferenceDisplay[pref]}
                                </span>
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={handleHandPreferenceSubmit}
                        className="w-full py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-colors"
                    >
                        Continue
                    </button>
                </div>
            </div>
        );
    }

    // Game Setup Dialog
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">New Game Setup</h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Game Type */}
                <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Game Type
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        {(['practice', 'tournament'] as GameType[]).map((type) => (
                            <button
                                key={type}
                                onClick={() => setGameType(type)}
                                className={`p-3 rounded-xl border-2 text-center transition-all ${
                                    gameType === type
                                        ? 'border-green-500 bg-green-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                }`}
                            >
                                <span className={`font-semibold ${
                                    gameType === type ? 'text-green-700' : 'text-gray-700'
                                }`}>
                                    {GameTypeDisplay[type]}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Oil Pattern */}
                <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Oil Pattern
                    </label>
                    <div className="space-y-2">
                        {(['house', 'sport', 'challenge'] as OilPattern[]).map((pattern) => (
                            <button
                                key={pattern}
                                onClick={() => setOilPattern(pattern)}
                                className={`w-full p-3 rounded-xl border-2 text-left transition-all ${
                                    oilPattern === pattern
                                        ? 'border-green-500 bg-green-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                }`}
                            >
                                <span className={`font-semibold block ${
                                    oilPattern === pattern ? 'text-green-700' : 'text-gray-700'
                                }`}>
                                    {OilPatternDisplay[pattern]}
                                </span>
                                <span className="text-sm text-gray-500">
                                    {OilPatternDescription[pattern]}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Lane Condition */}
                <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Lane Condition
                    </label>
                    <div className="space-y-2">
                        {(['medium', 'oily', 'dry'] as LaneCondition[]).map((condition) => (
                            <button
                                key={condition}
                                onClick={() => setLaneCondition(condition)}
                                className={`w-full p-3 rounded-xl border-2 text-left transition-all ${
                                    laneCondition === condition
                                        ? 'border-green-500 bg-green-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                }`}
                            >
                                <span className={`font-semibold block ${
                                    laneCondition === condition ? 'text-green-700' : 'text-gray-700'
                                }`}>
                                    {LaneConditionDisplay[condition]}
                                </span>
                                <span className="text-sm text-gray-500">
                                    {LaneConditionDescription[condition]}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Lane Number (Optional) */}
                <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Lane Number (Optional)
                    </label>
                    <input
                        type="text"
                        value={laneNumber}
                        onChange={(e) => setLaneNumber(e.target.value)}
                        placeholder="e.g., 12"
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:ring-0 outline-none transition-colors"
                    />
                </div>

                {/* Submit Button */}
                <button
                    onClick={handleSubmit}
                    className="w-full py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-colors"
                >
                    Start Game
                </button>
            </div>
        </div>
    );
}
