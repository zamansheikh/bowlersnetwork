'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function RootPage() {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading) {
            if (user?.authenticated) {
                // Redirect authenticated users to the feed page
                router.replace('/feedv3');
            } else {
                // Redirect non-authenticated users to landing
                router.replace('/landing');
            }
        }
    }, [user, isLoading, router]);

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="text-xl text-green-600">Redirecting...</div>
        </div>
    );
}

