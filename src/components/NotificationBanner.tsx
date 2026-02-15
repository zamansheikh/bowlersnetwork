'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

// Toggle this to show/hide the banner
const SHOW_BANNER = false;

export default function NotificationBanner() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (!SHOW_BANNER) return;

        const isBannerDismissed = localStorage.getItem('access_link_banner_dismissed');
        if (!isBannerDismissed) {
            setIsVisible(true);
        }
    }, []);

    const handleClose = () => {
        setIsVisible(false);
        localStorage.setItem('access_link_banner_dismissed', 'true');
    };

    if (!isVisible) return null;

    return (
        <div className="bg-blue-100 border-b border-blue-200 text-blue-800 px-4 py-3 relative transition-all duration-300">
            <div className="max-w-7xl mx-auto flex items-center pr-8">
                <p className="text-sm md:text-base font-medium">
                    A wrong access link went out earlier and caused some profile glitches. The issue is already fixed and cleanup is in progress. Thanks for your patience. Apologies for the inconvenience.
                </p>
            </div>
            <button
                onClick={handleClose}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-blue-200 rounded-full transition-colors text-blue-600"
                aria-label="Close"
            >
                <X size={20} />
            </button>
        </div>
    );
}
