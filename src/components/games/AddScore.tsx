'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
    FrameEntity, 
    ThrowEntity, 
    BowlingGameEntity, 
    GameSetupData,
} from '@/types';
import { 
    fullPinSetCopy, 
    standingPinsBefore, 
    calculateCumulativeScores,
    calculateTotalScore,
    isGameComplete,
    createEmptyFrames,
    generateGameId
} from '@/lib/bowlingUtils';
import { saveGame, getGameSettings } from '@/lib/gameStorage';
import PinDeck from './PinDeck';
import Scoreboard from './Scoreboard';
import SmartNextButton from './SmartNextButton';

interface AddScoreProps {
    initialGame?: BowlingGameEntity | null;
    gameSetupData?: GameSetupData | null;
    onComplete?: () => void;
}

export default function AddScore({ initialGame, gameSetupData, onComplete }: AddScoreProps) {
    const router = useRouter();
    const [frames, setFrames] = useState<FrameEntity[]>(() => 
        initialGame?.frames || createEmptyFrames()
    );
    const [currentFrame, setCurrentFrame] = useState(1);
    const [currentThrow, setCurrentThrow] = useState(1);
    const [currentKnockedPins, setCurrentKnockedPins] = useState<Set<number>>(new Set());
    const [currentIsFoul, setCurrentIsFoul] = useState(false);
    const [gameSaved, setGameSaved] = useState(false);
    const [showCompletionDialog, setShowCompletionDialog] = useState(false);
    const [completionScore, setCompletionScore] = useState<number | null>(null);
    
    const [gameId] = useState(() => initialGame?.id || generateGameId());
    const [gameSettings] = useState<GameSetupData>(() => 
        gameSetupData || {
            oilPattern: initialGame?.oilPattern || 'house',
            laneCondition: initialGame?.laneCondition || 'medium',
            gameType: initialGame?.gameType || 'practice',
            laneNumber: initialGame?.laneNumber,
        }
    );

    // Calculate standing pins before current throw
    const getStandingPins = useCallback(() => {
        const frame = frames[currentFrame - 1];
        if (!frame) return fullPinSetCopy();
        return standingPinsBefore(frame, currentThrow - 1);
    }, [frames, currentFrame, currentThrow]);

    // Get pins that are visually standing (not knocked in current throw)
    const getVisuallyStandingPins = useCallback(() => {
        const standing = getStandingPins();
        const visuallyStanding = new Set(standing);
        currentKnockedPins.forEach(pin => visuallyStanding.delete(pin));
        return visuallyStanding;
    }, [getStandingPins, currentKnockedPins]);

    // Calculate cumulative scores
    const cumulativeScores = calculateCumulativeScores(frames);

    // Check if can go to previous throw
    const canGoPrevious = currentFrame > 1 || currentThrow > 1;

    // Handle pin tap - toggle between knocked and standing
    const handlePinTap = useCallback((pin: number) => {
        if (currentIsFoul) return;
        
        // Check if pin was standing before this throw (available to interact with)
        const standing = getStandingPins();
        if (!standing.has(pin)) return; // Pin was already knocked in previous throw
        
        setCurrentKnockedPins(prev => {
            const newSet = new Set(prev);
            if (newSet.has(pin)) {
                // Pin is currently knocked in this throw - stand it back up
                newSet.delete(pin);
            } else {
                // Pin is standing - knock it down
                newSet.add(pin);
            }
            return newSet;
        });
    }, [currentIsFoul, getStandingPins]);

    // Check if game is complete and show dialog
    const checkGameCompletion = useCallback(() => {
        setTimeout(() => {
            setFrames(currentFrames => {
                const complete = isGameComplete(currentFrames);
                if (complete) {
                    const score = calculateTotalScore(currentFrames);
                    setCompletionScore(score);
                    setShowCompletionDialog(true);
                }
                return currentFrames;
            });
        }, 100);
    }, []);

    // Commit throw and advance to next position
    const commitThrow = useCallback((knockedPins: Set<number>, isFoul: boolean) => {
        const newThrow: ThrowEntity = {
            knockedPins: new Set(knockedPins),
            isFoul: isFoul,
        };

        const pins = isFoul ? 0 : knockedPins.size;
        const isTenth = currentFrame === 10;

        setFrames(prev => {
            const newFrames = [...prev];
            const frameIndex = currentFrame - 1;
            const frame = { ...newFrames[frameIndex] };
            
            // Add throw to current frame
            frame.throws = [...frame.throws.slice(0, currentThrow - 1), newThrow];
            newFrames[frameIndex] = frame;
            
            return newFrames;
        });

        // Calculate next position
        if (isTenth) {
            // 10th frame logic
            if (currentThrow === 1) {
                setCurrentThrow(2);
            } else if (currentThrow === 2) {
                const frame = frames[9];
                const firstThrow = frame.throws[0];
                const firstPins = firstThrow?.isFoul ? 0 : (firstThrow?.knockedPins.size || 0);
                const isStrike = firstPins === 10;
                const isSpare = firstPins + pins === 10;
                
                if (isStrike || isSpare) {
                    setCurrentThrow(3);
                } else {
                    // Game complete - open frame in 10th
                    checkGameCompletion();
                }
            } else {
                // After 3rd throw in 10th - game complete
                checkGameCompletion();
            }
        } else {
            // Frames 1-9
            if (pins === 10) {
                // Strike - move to next frame
                setCurrentFrame(currentFrame + 1);
                setCurrentThrow(1);
            } else if (currentThrow === 1) {
                setCurrentThrow(2);
            } else {
                // After 2nd throw - move to next frame
                setCurrentFrame(currentFrame + 1);
                setCurrentThrow(1);
            }
        }

        // Reset current throw state
        setCurrentKnockedPins(new Set());
        setCurrentIsFoul(false);
    }, [currentFrame, currentThrow, frames, checkGameCompletion]);

    // Handle foul - auto commit and advance
    const handleFoul = useCallback(() => {
        commitThrow(new Set(), true);
    }, [commitThrow]);

    // Handle miss (gutter) - auto commit and advance
    const handleMiss = useCallback(() => {
        commitThrow(new Set(), false);
    }, [commitThrow]);

    // Handle strike/spare (knock all remaining pins) - auto commit and advance
    const handleStrikeOrSpare = useCallback(() => {
        const standing = getStandingPins();
        if (standing.size === 0) return;
        
        // Commit strike/spare throw immediately
        commitThrow(standing, false);
    }, [getStandingPins, commitThrow]);

    // Manual next button - commit current selection
    const handleNextThrow = useCallback(() => {
        if (currentKnockedPins.size === 0 && !currentIsFoul) {
            // Nothing selected - treat as miss
            commitThrow(new Set(), false);
            return;
        }
        commitThrow(currentKnockedPins, currentIsFoul);
    }, [currentKnockedPins, currentIsFoul, commitThrow]);

    // Go to previous throw
    const handlePreviousThrow = useCallback(() => {
        if (!canGoPrevious) return;

        if (currentThrow > 1) {
            setCurrentThrow(currentThrow - 1);
        } else if (currentFrame > 1) {
            // Go to previous frame's last throw
            const prevFrame = frames[currentFrame - 2];
            const prevThrowCount = prevFrame.throws.length || 1;
            setCurrentFrame(currentFrame - 1);
            setCurrentThrow(prevThrowCount);
        }

        setCurrentKnockedPins(new Set());
        setCurrentIsFoul(false);
    }, [canGoPrevious, currentFrame, currentThrow, frames]);

    // Save game
    const handleSaveGame = useCallback(() => {
        const settings = getGameSettings();
        const totalScore = calculateTotalScore(frames);
        const complete = isGameComplete(frames);

        const game: BowlingGameEntity = {
            id: gameId,
            frames,
            totalScore,
            date: new Date(),
            isComplete: complete,
            handPreference: settings.defaultHandPreference,
            oilPattern: gameSettings.oilPattern,
            laneCondition: gameSettings.laneCondition,
            gameType: gameSettings.gameType,
            laneNumber: gameSettings.laneNumber,
        };

        saveGame(game);
        setGameSaved(true);
        
        setTimeout(() => {
            if (onComplete) {
                onComplete();
            } else {
                router.push('/games');
            }
        }, 1000);
    }, [frames, gameId, gameSettings, router, onComplete]);

    // Determine strike/spare label
    const strikeOrSpareLabel = (currentThrow === 1 || (currentFrame === 10 && currentThrow === 3)) 
        ? 'Strike' 
        : 'Spare';

    return (
        <div className="min-h-screen bg-white flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <button
                    onClick={() => router.back()}
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                    <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <h1 className="text-lg font-bold text-gray-900">Add Score 🎳</h1>
                <button
                    onClick={handleSaveGame}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors"
                >
                    {gameSaved ? 'Saved!' : 'Save'}
                </button>
            </div>

            {/* Scoreboard */}
            <div className="px-4 py-3">
                <Scoreboard
                    frames={frames}
                    currentFrame={currentFrame}
                    currentThrow={currentThrow}
                    cumulativeScores={cumulativeScores}
                />
            </div>

            {/* Pin Deck */}
            <div className="flex-1 px-4 py-4">
                <PinDeck
                    standingPinsBeforeThrow={getStandingPins()}
                    currentKnockedPins={currentKnockedPins}
                    currentIsFoul={currentIsFoul}
                    onPinTap={handlePinTap}
                />
            </div>

            {/* Main Action - Strike/Spare button (auto advances) */}
            <div className="px-4 py-3 flex justify-center gap-3">
                <button
                    onClick={handleStrikeOrSpare}
                    className="px-8 py-3 bg-green-500 text-white rounded-xl font-bold text-lg hover:bg-green-600 transition-all active:scale-95 shadow-lg shadow-green-500/30"
                >
                    {strikeOrSpareLabel}
                </button>
                <SmartNextButton
                    onNext={handleNextThrow}
                    onMiss={handleMiss}
                    onFoul={handleFoul}
                />
            </div>

            {/* Bottom Controls */}
            <div className="px-4 py-4 flex justify-between gap-4 border-t border-gray-100">
                <button
                    onClick={handlePreviousThrow}
                    disabled={!canGoPrevious}
                    className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                        canGoPrevious
                            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            : 'bg-gray-50 text-gray-300 cursor-not-allowed'
                    }`}
                >
                    ← Previous
                </button>
                <button
                    onClick={handleNextThrow}
                    className="flex-1 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-all"
                >
                    Next →
                </button>
            </div>

            {/* Completion Dialog */}
            {showCompletionDialog && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Game Complete! 🎉</h2>
                        <p className="text-gray-600 mb-6">
                            Your total score is <span className="font-bold text-green-600">{completionScore}</span>
                        </p>
                        <button
                            onClick={() => {
                                setShowCompletionDialog(false);
                                handleSaveGame();
                            }}
                            className="w-full py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-all"
                        >
                            Great!
                        </button>
                    </div>
                </div>
            )}

            {/* Saved Toast */}
            {gameSaved && (
                <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-xl font-semibold shadow-lg">
                    Game saved successfully!
                </div>
            )}
        </div>
    );
}
