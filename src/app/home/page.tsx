
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/feedv3');
    }, [router]);

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="text-xl text-green-600">Redirecting to feed...</div>
        </div>
    );
}
