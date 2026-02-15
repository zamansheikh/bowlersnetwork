// Bowling Pin Utilities for calculating scores and managing pin state
import { FrameEntity, ThrowEntity, ThrowData, FrameData, BowlingGameEntity, BowlingGameData } from '@/types';

export const FULL_PIN_SET = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

// Pin neighbor relationships for split detection
const PIN_NEIGHBORS: Record<number, number[]> = {
    1: [2, 3, 5],
    2: [1, 3, 4, 5],
    3: [1, 2, 5, 6],
    4: [2, 5, 7, 8],
    5: [1, 2, 3, 4, 6, 8, 9],
    6: [3, 5, 9, 10],
    7: [4, 8],
    8: [4, 5, 7, 9],
    9: [5, 6, 8, 10],
    10: [6, 9],
};

export function fullPinSetCopy(): Set<number> {
    return new Set(FULL_PIN_SET);
}

export function clipToStanding(throwEntity: ThrowEntity, standingBefore: Set<number>): ThrowEntity {
    if (throwEntity.isFoul) {
        return { knockedPins: new Set<number>(), isFoul: true };
    }
    const clipped = new Set<number>(
        Array.from(throwEntity.knockedPins).filter(pin => standingBefore.has(pin))
    );
    return { knockedPins: clipped, isFoul: false };
}

export function applyThrowToStanding(standing: Set<number>, throwEntity: ThrowEntity): Set<number> {
    const nextStanding = new Set(standing);
    if (!throwEntity.isFoul) {
        throwEntity.knockedPins.forEach(pin => nextStanding.delete(pin));
    }
    return nextStanding;
}

export function standingPinsBefore(frame: FrameEntity, throwIndex: number): Set<number> {
    let standing = fullPinSetCopy();
    
    if (frame.number < 10) {
        for (let i = 0; i < throwIndex && i < frame.throws.length; i++) {
            standing = applyThrowToStanding(
                standing,
                clipToStanding(frame.throws[i], standing)
            );
        }
        return standing;
    }

    // 10th frame logic
    if (throwIndex <= 0) {
        return standing;
    }

    const first = frame.throws.length > 0
        ? clipToStanding(frame.throws[0], standing)
        : { knockedPins: new Set<number>(), isFoul: false };
    
    if (throwIndex === 1) {
        return standingBeforeSecondInTenth(first);
    }

    const secondStanding = standingBeforeSecondInTenth(first);
    const second = frame.throws.length > 1
        ? clipToStanding(frame.throws[1], secondStanding)
        : { knockedPins: new Set<number>(), isFoul: false };
    
    return standingBeforeThirdInTenth(first, second);
}

function standingBeforeSecondInTenth(first: ThrowEntity): Set<number> {
    if (first.knockedPins.size === 10 && !first.isFoul) {
        return fullPinSetCopy(); // Strike, reset pins
    }
    return applyThrowToStanding(fullPinSetCopy(), first);
}

function standingBeforeThirdInTenth(first: ThrowEntity, second: ThrowEntity): Set<number> {
    const firstIsStrike = first.knockedPins.size === 10 && !first.isFoul;
    const secondIsStrike = second.knockedPins.size === 10 && !second.isFoul;
    
    if (firstIsStrike && secondIsStrike) {
        return fullPinSetCopy();
    }
    
    if (firstIsStrike) {
        // First was strike, second wasn't - check for spare
        const afterSecond = applyThrowToStanding(fullPinSetCopy(), second);
        if (afterSecond.size === 0) {
            return fullPinSetCopy(); // Spare, reset pins
        }
        return afterSecond;
    }
    
    // First wasn't strike - check if we made a spare
    const afterFirst = applyThrowToStanding(fullPinSetCopy(), first);
    const afterSecond = applyThrowToStanding(afterFirst, second);
    if (afterSecond.size === 0) {
        return fullPinSetCopy(); // Spare, reset pins
    }
    
    return afterSecond; // No third throw in this case
}

export function standingPinsAfter(frame: FrameEntity, throwIndex: number): Set<number> {
    if (throwIndex < 0 || throwIndex >= frame.throws.length) {
        return fullPinSetCopy();
    }
    const before = standingPinsBefore(frame, throwIndex);
    const clipped = clipToStanding(frame.throws[throwIndex], before);
    return applyThrowToStanding(before, clipped);
}

function countClusters(pins: Set<number>): number {
    if (pins.size === 0) return 0;
    
    const visited = new Set<number>();
    let clusters = 0;
    
    for (const pin of pins) {
        if (!visited.has(pin)) {
            clusters++;
            // BFS to mark all connected pins
            const queue = [pin];
            while (queue.length > 0) {
                const current = queue.shift()!;
                if (visited.has(current)) continue;
                visited.add(current);
                
                const neighbors = PIN_NEIGHBORS[current] || [];
                for (const neighbor of neighbors) {
                    if (pins.has(neighbor) && !visited.has(neighbor)) {
                        queue.push(neighbor);
                    }
                }
            }
        }
    }
    
    return clusters;
}

export function isSplitLeave(frame: FrameEntity, throwIndex: number): boolean {
    if (throwIndex < 0 || throwIndex >= frame.throws.length) {
        return false;
    }
    if (frame.number < 10 && throwIndex !== 0) {
        return false;
    }
    if (frame.number === 10 && throwIndex > 1) {
        return false;
    }

    const throwEntity = frame.throws[throwIndex];
    if (throwEntity.isFoul || throwEntity.knockedPins.size === 0) {
        return false;
    }

    const standingAfter = standingPinsAfter(frame, throwIndex);
    if (standingAfter.size < 2) {
        return false;
    }
    if (standingAfter.has(1)) {
        return false;
    }
    return countClusters(standingAfter) > 1;
}

// Calculate cumulative scores for all frames
export function calculateCumulativeScores(frames: FrameEntity[]): number[] {
    const scores: number[] = [];
    let cumulative = 0;
    
    for (let i = 0; i < frames.length && i < 10; i++) {
        const frame = frames[i];
        const frameScore = calculateFrameScore(frames, i);
        
        if (frameScore !== null) {
            cumulative += frameScore;
            scores.push(cumulative);
        } else {
            // Frame not yet scorable
            break;
        }
    }
    
    return scores;
}

// Calculate the score for a single frame (with lookahead for strikes/spares)
function calculateFrameScore(frames: FrameEntity[], frameIndex: number): number | null {
    const frame = frames[frameIndex];
    if (!frame || frame.throws.length === 0) return null;
    
    const throws = frame.throws;
    
    // 10th frame - special handling
    if (frameIndex === 9) {
        if (throws.length < 2) return null;
        const first = throws[0].isFoul ? 0 : throws[0].knockedPins.size;
        const second = throws[1].isFoul ? 0 : throws[1].knockedPins.size;
        
        // Need third throw if strike or spare
        if (first === 10 || first + second >= 10) {
            if (throws.length < 3) return null;
            const third = throws[2].isFoul ? 0 : throws[2].knockedPins.size;
            return first + second + third;
        }
        
        return first + second;
    }
    
    // Frames 1-9
    const firstPins = throws[0].isFoul ? 0 : throws[0].knockedPins.size;
    
    // Strike
    if (firstPins === 10) {
        const nextTwo = getNextTwoThrows(frames, frameIndex);
        if (nextTwo === null) return null;
        return 10 + nextTwo;
    }
    
    // Need second throw
    if (throws.length < 2) return null;
    const secondPins = throws[1].isFoul ? 0 : throws[1].knockedPins.size;
    
    // Spare
    if (firstPins + secondPins === 10) {
        const nextOne = getNextOneThrow(frames, frameIndex);
        if (nextOne === null) return null;
        return 10 + nextOne;
    }
    
    // Open frame
    return firstPins + secondPins;
}

function getNextTwoThrows(frames: FrameEntity[], currentFrameIndex: number): number | null {
    const throws: number[] = [];
    
    for (let i = currentFrameIndex + 1; i < frames.length && throws.length < 2; i++) {
        const frame = frames[i];
        for (const t of frame.throws) {
            throws.push(t.isFoul ? 0 : t.knockedPins.size);
            if (throws.length >= 2) break;
        }
    }
    
    if (throws.length < 2) return null;
    return throws[0] + throws[1];
}

function getNextOneThrow(frames: FrameEntity[], currentFrameIndex: number): number | null {
    for (let i = currentFrameIndex + 1; i < frames.length; i++) {
        const frame = frames[i];
        if (frame.throws.length > 0) {
            const t = frame.throws[0];
            return t.isFoul ? 0 : t.knockedPins.size;
        }
    }
    return null;
}

// Get frame display symbols (X, /, -, number)
export function getFrameSymbols(frame: FrameEntity): string[] {
    const isTenth = frame.number === 10;
    const slots = isTenth ? 3 : 2;
    const result = Array(slots).fill('');
    const throws = frame.throws;
    
    if (throws.length === 0) return result;
    
    const first = throws[0];
    result[0] = symbolForFirstThrow(first);
    
    if (!isTenth) {
        if (first.knockedPins.size === 10 && !first.isFoul) {
            return result; // Strike only shows X
        }
        
        if (throws.length >= 2) {
            const second = throws[1];
            if (second.isFoul) {
                result[1] = 'F';
            } else if (!first.isFoul && first.knockedPins.size + second.knockedPins.size === 10) {
                result[1] = '/';
            } else if (second.knockedPins.size === 0) {
                result[1] = '-';
            } else {
                result[1] = `${second.knockedPins.size}`;
            }
        }
        return result;
    }
    
    // 10th frame
    if (throws.length >= 2) {
        const second = throws[1];
        const firstIsStrike = first.knockedPins.size === 10 && !first.isFoul;
        
        if (second.isFoul) {
            result[1] = 'F';
        } else if (second.knockedPins.size === 10) {
            result[1] = 'X';
        } else if (!firstIsStrike && !first.isFoul && 
                   first.knockedPins.size + second.knockedPins.size === 10) {
            result[1] = '/';
        } else if (second.knockedPins.size === 0) {
            result[1] = '-';
        } else {
            result[1] = `${second.knockedPins.size}`;
        }
    }
    
    if (throws.length >= 3) {
        const second = throws[1];
        const third = throws[2];
        const firstIsStrike = first.knockedPins.size === 10 && !first.isFoul;
        const secondIsStrike = second.knockedPins.size === 10 && !second.isFoul;
        
        if (third.isFoul) {
            result[2] = 'F';
        } else if (third.knockedPins.size === 10) {
            result[2] = 'X';
        } else if (firstIsStrike && !secondIsStrike && 
                   second.knockedPins.size + third.knockedPins.size === 10) {
            result[2] = '/';
        } else if (third.knockedPins.size === 0) {
            result[2] = '-';
        } else {
            result[2] = `${third.knockedPins.size}`;
        }
    }
    
    return result;
}

function symbolForFirstThrow(t: ThrowEntity): string {
    if (t.isFoul) return 'F';
    if (t.knockedPins.size === 10) return 'X';
    if (t.knockedPins.size === 0) return '-';
    return `${t.knockedPins.size}`;
}

// Calculate total score for a game
export function calculateTotalScore(frames: FrameEntity[]): number {
    const cumulative = calculateCumulativeScores(frames);
    return cumulative.length > 0 ? cumulative[cumulative.length - 1] : 0;
}

// Check if a game is complete
export function isGameComplete(frames: FrameEntity[]): boolean {
    if (frames.length < 10) return false;
    
    const tenthFrame = frames[9];
    if (!tenthFrame) return false;
    
    const throws = tenthFrame.throws;
    if (throws.length < 2) return false;
    
    const first = throws[0];
    const second = throws[1];
    
    // If strike or spare in 10th, need 3 throws
    if (first.knockedPins.size === 10 || 
        first.knockedPins.size + second.knockedPins.size === 10) {
        return throws.length >= 3;
    }
    
    return true;
}

// Convert ThrowEntity to JSON-serializable ThrowData
export function throwToData(t: ThrowEntity): ThrowData {
    return {
        knockedPins: Array.from(t.knockedPins),
        isFoul: t.isFoul
    };
}

// Convert ThrowData to ThrowEntity
export function dataToThrow(data: ThrowData): ThrowEntity {
    return {
        knockedPins: new Set(data.knockedPins),
        isFoul: data.isFoul
    };
}

// Convert FrameEntity to JSON-serializable FrameData
export function frameToData(frame: FrameEntity): FrameData {
    return {
        number: frame.number,
        throws: frame.throws.map(throwToData),
        isPocketHit: frame.isPocketHit
    };
}

// Convert FrameData to FrameEntity
export function dataToFrame(data: FrameData): FrameEntity {
    return {
        number: data.number,
        throws: data.throws.map(dataToThrow),
        isPocketHit: data.isPocketHit
    };
}

// Convert BowlingGameEntity to JSON-serializable BowlingGameData
export function gameToData(game: BowlingGameEntity): BowlingGameData {
    return {
        id: game.id,
        frames: game.frames.map(frameToData),
        totalScore: game.totalScore,
        date: game.date.toISOString(),
        isComplete: game.isComplete,
        handPreference: game.handPreference,
        oilPattern: game.oilPattern,
        laneCondition: game.laneCondition,
        gameType: game.gameType,
        laneNumber: game.laneNumber
    };
}

// Convert BowlingGameData to BowlingGameEntity
export function dataToGame(data: BowlingGameData): BowlingGameEntity {
    return {
        id: data.id,
        frames: data.frames.map(dataToFrame),
        totalScore: data.totalScore,
        date: new Date(data.date),
        isComplete: data.isComplete,
        handPreference: data.handPreference,
        oilPattern: data.oilPattern,
        laneCondition: data.laneCondition,
        gameType: data.gameType,
        laneNumber: data.laneNumber
    };
}

// Get split throw indexes for a frame
export function getSplitThrowIndexes(frame: FrameEntity): number[] {
    const indexes: number[] = [];
    for (let i = 0; i < frame.throws.length; i++) {
        if (isSplitLeave(frame, i)) {
            indexes.push(i);
        }
    }
    return indexes;
}

// Generate unique game ID
export function generateGameId(): string {
    return `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Create empty frames for a new game
export function createEmptyFrames(): FrameEntity[] {
    return Array.from({ length: 10 }, (_, i) => ({
        number: i + 1,
        throws: [],
        isPocketHit: false
    }));
}
