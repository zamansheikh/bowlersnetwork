'use client';

import React, { useState, useCallback, useRef } from 'react';
import Image from 'next/image';

interface PinDeckProps {
    standingPinsBeforeThrow: Set<number>; // Pins that were standing before this throw
    currentKnockedPins: Set<number>; // Pins knocked in current throw (togglable)
    currentIsFoul: boolean;
    onPinTap: (pin: number) => void;
}

export interface PinDeckPropsExport extends PinDeckProps {}

// Pin positions as percentage of container (matching Flutter layout)
const PIN_POSITIONS: Record<number, { x: number; y: number }> = {
    1: { x: 50, y: 85 },
    2: { x: 37, y: 60 },
    3: { x: 63, y: 60 },
    4: { x: 25, y: 35 },
    5: { x: 50, y: 35 },
    6: { x: 75, y: 35 },
    7: { x: 15, y: 10 },
    8: { x: 37, y: 10 },
    9: { x: 63, y: 10 },
    10: { x: 85, y: 10 },
};

export default function PinDeck({
    standingPinsBeforeThrow,
    currentKnockedPins,
    currentIsFoul,
    onPinTap,
}: PinDeckProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [swipedPins, setSwipedPins] = useState<Set<number>>(new Set());

    const checkPinAtPosition = useCallback(
        (clientX: number, clientY: number) => {
            if (!containerRef.current) return;

            const rect = containerRef.current.getBoundingClientRect();
            const x = clientX - rect.left;
            const y = clientY - rect.top;
            const width = rect.width;
            const height = rect.height;
            const radius = Math.min(width / 8, 40);

            for (const [pinStr, pos] of Object.entries(PIN_POSITIONS)) {
                const pinNumber = parseInt(pinStr);
                const pinX = (pos.x / 100) * width;
                const pinY = (pos.y / 100) * height;
                const distance = Math.sqrt(Math.pow(x - pinX, 2) + Math.pow(y - pinY, 2));

                if (distance <= radius * 1.2 && !swipedPins.has(pinNumber)) {
                    // A pin is available if it was standing before this throw
                    const isAvailable = standingPinsBeforeThrow.has(pinNumber);
                    const isDisabled = currentIsFoul || !isAvailable;

                    if (!isDisabled) {
                        setSwipedPins((prev) => new Set([...prev, pinNumber]));
                        onPinTap(pinNumber);
                    }
                    break;
                }
            }
        },
        [standingPinsBeforeThrow, currentIsFoul, swipedPins, onPinTap]
    );

    const handlePointerDown = (e: React.PointerEvent) => {
        setSwipedPins(new Set());
        checkPinAtPosition(e.clientX, e.clientY);
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (e.buttons !== 1) return;
        checkPinAtPosition(e.clientX, e.clientY);
    };

    const handlePointerUp = () => {
        setSwipedPins(new Set());
    };

    return (
        <div
            ref={containerRef}
            className="relative w-full aspect-4/3 max-w-md mx-auto bg-white rounded-2xl border border-gray-200 shadow-sm touch-none select-none"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
        >
            {Object.entries(PIN_POSITIONS).map(([pinStr, pos]) => {
                const pinNumber = parseInt(pinStr);
                // A pin is available if it was standing before this throw
                const isAvailable = standingPinsBeforeThrow.has(pinNumber);
                const isKnocked = currentKnockedPins.has(pinNumber);
                const isStanding = isAvailable && !isKnocked;
                // Disabled only if foul or if pin wasn't standing before this throw
                const isDisabled = currentIsFoul || !isAvailable;

                return (
                    <Pin
                        key={pinNumber}
                        number={pinNumber}
                        position={pos}
                        isStanding={isStanding}
                        isKnocked={isKnocked}
                        isDisabled={isDisabled}
                        onTap={() => !isDisabled && onPinTap(pinNumber)}
                    />
                );
            })}
        </div>
    );
}

interface PinProps {
    number: number;
    position: { x: number; y: number };
    isStanding: boolean;
    isKnocked: boolean;
    isDisabled: boolean;
    onTap: () => void;
}

function Pin({ number, position, isStanding, isKnocked, isDisabled, onTap }: PinProps) {
    const size = 48; // Pin size in pixels

    if (!isStanding) {
        // Knocked down or unavailable pin
        return (
            <button
                onClick={onTap}
                disabled={isDisabled}
                className={`absolute flex items-center justify-center rounded-full transition-all duration-200 ${
                    isKnocked
                        ? 'bg-gray-50 border-2 border-green-500 shadow-sm'
                        : 'bg-gray-100 border-2 border-gray-300'
                } ${isDisabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:scale-105'}`}
                style={{
                    width: size,
                    height: size,
                    left: `calc(${position.x}% - ${size / 2}px)`,
                    top: `calc(${position.y}% - ${size / 2}px)`,
                }}
            >
                <span
                    className={`font-bold text-sm ${
                        isKnocked ? 'text-green-600' : 'text-gray-400'
                    }`}
                >
                    {number}
                </span>
            </button>
        );
    }

    // Standing pin
    return (
        <button
            onClick={onTap}
            disabled={isDisabled}
            className={`absolute flex flex-col items-center justify-center rounded-full transition-all duration-200 ${
                isKnocked
                    ? 'bg-green-50 border-2 border-green-500 shadow-md'
                    : 'bg-white border-2 border-green-500 shadow-md hover:shadow-lg'
            } ${isDisabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:scale-105 active:scale-95'}`}
            style={{
                width: size,
                height: size,
                left: `calc(${position.x}% - ${size / 2}px)`,
                top: `calc(${position.y}% - ${size / 2}px)`,
            }}
        >
            <Image
                src="/icons/bowling_pin.svg"
                alt="Bowling Pin"
                width={36}
                height={36}
                unoptimized
                className={`${isKnocked ? 'text-red-500' : 'text-green-500'}`}
                style={{
                    filter: isKnocked
                        ? 'invert(28%) sepia(75%) saturate(1826%) hue-rotate(332deg) brightness(94%) contrast(91%)'
                        : 'invert(58%) sepia(84%) saturate(387%) hue-rotate(58deg) brightness(94%) contrast(85%)',
                }}
            />
            <span
                className={`absolute bottom-1 font-bold text-xs ${
                    isKnocked ? 'text-green-700' : 'text-gray-600'
                }`}
            >
                {number}
            </span>
        </button>
    );
}
