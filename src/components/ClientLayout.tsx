'use client';

import Navigation from '@/components/Navigation';
import { AuthProvider } from '@/contexts/AuthContext';

interface ClientLayoutProps {
    children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
    return (
        <AuthProvider>
            <Navigation>
                {children}
            </Navigation>
        </AuthProvider>
    );
}
