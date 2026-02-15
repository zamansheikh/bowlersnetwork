'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';

interface SmartNextButtonProps {
    onNext: () => void;
    onMiss: () => void;
    onFoul: () => void;
}

export default function SmartNextButton({ onNext, onMiss, onFoul }: SmartNextButtonProps) {
    const [showMenu, setShowMenu] = useState(false);
    const longPressTimer = useRef<NodeJS.Timeout | null>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    const LONG_PRESS_DURATION = 500; // ms

    const clearLongPressTimer = useCallback(() => {
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
        }
    }, []);

    const handlePointerDown = useCallback((e: React.PointerEvent) => {
        e.preventDefault();
        clearLongPressTimer();
        
        longPressTimer.current = setTimeout(() => {
            setShowMenu(true);
            longPressTimer.current = null;
        }, LONG_PRESS_DURATION);
    }, [clearLongPressTimer]);

    const handlePointerUp = useCallback(() => {
        if (longPressTimer.current) {
            // Short press - trigger Next
            clearLongPressTimer();
            onNext();
        }
        // If timer is null and menu is not shown, it means long press was triggered
    }, [clearLongPressTimer, onNext]);

    const handlePointerLeave = useCallback(() => {
        clearLongPressTimer();
    }, [clearLongPressTimer]);

    const handleMiss = useCallback(() => {
        setShowMenu(false);
        onMiss();
    }, [onMiss]);

    const handleFoul = useCallback(() => {
        setShowMenu(false);
        onFoul();
    }, [onFoul]);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target as Node) &&
                buttonRef.current &&
                !buttonRef.current.contains(event.target as Node)
            ) {
                setShowMenu(false);
            }
        };

        if (showMenu) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showMenu]);

    // Cleanup timer on unmount
    useEffect(() => {
        return () => clearLongPressTimer();
    }, [clearLongPressTimer]);

    return (
        <div className="relative group">
            <button
                ref={buttonRef}
                onPointerDown={handlePointerDown}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerLeave}
                onContextMenu={(e) => e.preventDefault()}
                className={`
                    flex-1 min-w-[120px] py-3 px-6 rounded-xl font-semibold transition-all active:scale-95
                    ${showMenu 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }
                `}
            >
                Next →
            </button>

            {/* Tooltip on hover */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                Hold for more options
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
            </div>

            {/* Long press menu */}
            {showMenu && (
                <div
                    ref={menuRef}
                    className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-2 duration-200"
                >
                    <button
                        onClick={handleMiss}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3 border-b border-gray-100"
                    >
                        <span className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-bold">
                            −
                        </span>
                        <div>
                            <div className="font-medium text-gray-800">Miss</div>
                            <div className="text-xs text-gray-500">No pins knocked</div>
                        </div>
                    </button>
                    <button
                        onClick={handleFoul}
                        className="w-full px-4 py-3 text-left hover:bg-red-50 transition-colors flex items-center gap-3"
                    >
                        <span className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-bold">
                            F
                        </span>
                        <div>
                            <div className="font-medium text-red-600">Foul</div>
                            <div className="text-xs text-gray-500">Stepped over foul line</div>
                        </div>
                    </button>
                </div>
            )}
        </div>
    );
}
