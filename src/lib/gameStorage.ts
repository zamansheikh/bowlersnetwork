// Game Storage Service - handles localStorage persistence for bowling games
import { BowlingGameData, BowlingGameEntity, GameSetupData, HandPreference } from '@/types';
import { gameToData, dataToGame, generateGameId, createEmptyFrames, calculateTotalScore, isGameComplete } from './bowlingUtils';

const GAMES_STORAGE_KEY = 'bowlersnetwork_games';
const SETTINGS_STORAGE_KEY = 'bowlersnetwork_game_settings';

export interface GameSettings {
    defaultHandPreference: HandPreference;
    hasSetHandPreference: boolean;
}

const defaultSettings: GameSettings = {
    defaultHandPreference: 'right',
    hasSetHandPreference: false,
};

// Get all games from storage
export function getGames(): BowlingGameEntity[] {
    if (typeof window === 'undefined') return [];
    
    try {
        const stored = localStorage.getItem(GAMES_STORAGE_KEY);
        if (!stored) return [];
        
        const gamesData: BowlingGameData[] = JSON.parse(stored);
        return gamesData.map(dataToGame).sort((a, b) => b.date.getTime() - a.date.getTime());
    } catch (error) {
        console.error('Failed to load games:', error);
        return [];
    }
}

// Get a single game by ID
export function getGameById(id: string): BowlingGameEntity | null {
    const games = getGames();
    return games.find(g => g.id === id) || null;
}

// Save a game (create or update)
export function saveGame(game: BowlingGameEntity): void {
    if (typeof window === 'undefined') return;
    
    try {
        const games = getGames();
        const existingIndex = games.findIndex(g => g.id === game.id);
        
        if (existingIndex >= 0) {
            games[existingIndex] = game;
        } else {
            games.push(game);
        }
        
        const gamesData = games.map(gameToData);
        localStorage.setItem(GAMES_STORAGE_KEY, JSON.stringify(gamesData));
    } catch (error) {
        console.error('Failed to save game:', error);
    }
}

// Delete a game
export function deleteGame(id: string): void {
    if (typeof window === 'undefined') return;
    
    try {
        const games = getGames();
        const filtered = games.filter(g => g.id !== id);
        const gamesData = filtered.map(gameToData);
        localStorage.setItem(GAMES_STORAGE_KEY, JSON.stringify(gamesData));
    } catch (error) {
        console.error('Failed to delete game:', error);
    }
}

// Clear all games
export function clearAllGames(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(GAMES_STORAGE_KEY);
}

// Get game settings
export function getGameSettings(): GameSettings {
    if (typeof window === 'undefined') return defaultSettings;
    
    try {
        const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
        if (!stored) return defaultSettings;
        return { ...defaultSettings, ...JSON.parse(stored) };
    } catch (error) {
        console.error('Failed to load game settings:', error);
        return defaultSettings;
    }
}

// Save game settings
export function saveGameSettings(settings: Partial<GameSettings>): void {
    if (typeof window === 'undefined') return;
    
    try {
        const current = getGameSettings();
        const updated = { ...current, ...settings };
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
        console.error('Failed to save game settings:', error);
    }
}

// Set default hand preference
export function setDefaultHandPreference(preference: HandPreference): void {
    saveGameSettings({
        defaultHandPreference: preference,
        hasSetHandPreference: true,
    });
}

// Create a new game with setup data
export function createNewGame(setupData: GameSetupData): BowlingGameEntity {
    const settings = getGameSettings();
    
    return {
        id: generateGameId(),
        frames: createEmptyFrames(),
        totalScore: 0,
        date: new Date(),
        isComplete: false,
        handPreference: settings.defaultHandPreference,
        oilPattern: setupData.oilPattern,
        laneCondition: setupData.laneCondition,
        gameType: setupData.gameType,
        laneNumber: setupData.laneNumber,
    };
}

// Get game statistics
export interface GameStats {
    totalGames: number;
    averageScore: number;
    highGame: number;
    lowGame: number;
    totalStrikes: number;
    totalSpares: number;
    perfectGames: number;
}

export function calculateGameStats(): GameStats {
    const games = getGames().filter(g => g.isComplete);
    
    if (games.length === 0) {
        return {
            totalGames: 0,
            averageScore: 0,
            highGame: 0,
            lowGame: 0,
            totalStrikes: 0,
            totalSpares: 0,
            perfectGames: 0,
        };
    }
    
    const scores = games.map(g => g.totalScore);
    const totalScore = scores.reduce((a, b) => a + b, 0);
    
    let totalStrikes = 0;
    let totalSpares = 0;
    
    games.forEach(game => {
        game.frames.forEach((frame, frameIndex) => {
            if (frame.throws.length > 0) {
                const first = frame.throws[0];
                if (!first.isFoul && first.knockedPins.size === 10) {
                    totalStrikes++;
                } else if (frame.throws.length >= 2) {
                    const second = frame.throws[1];
                    if (!first.isFoul && !second.isFoul &&
                        first.knockedPins.size + second.knockedPins.size === 10) {
                        totalSpares++;
                    }
                }
                
                // Handle extra throws in 10th frame
                if (frameIndex === 9 && frame.throws.length >= 2) {
                    const second = frame.throws[1];
                    if (!second.isFoul && second.knockedPins.size === 10) {
                        totalStrikes++;
                    }
                    if (frame.throws.length >= 3) {
                        const third = frame.throws[2];
                        if (!third.isFoul && third.knockedPins.size === 10) {
                            totalStrikes++;
                        }
                    }
                }
            }
        });
    });
    
    return {
        totalGames: games.length,
        averageScore: Math.round(totalScore / games.length),
        highGame: Math.max(...scores),
        lowGame: Math.min(...scores),
        totalStrikes,
        totalSpares,
        perfectGames: scores.filter(s => s === 300).length,
    };
}
