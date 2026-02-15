'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Home, BarChart3, MessageCircle, Settings, Package, Menu, CalendarDays, X, LogOut, Users, Trophy, Target, MessageSquare, Play, Gift, ShoppingCart, Zap, Map, Lightbulb, MapPin, Tag } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import GlobalHeader from '@/components/GlobalHeader';
import NotificationBanner from '@/components/NotificationBanner';

// Profile Completion Check Component
function ProfileCompletionCheck({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        // Skip check if on complete-profile page or if still loading
        if (pathname === '/complete-profile' || isLoading) {
            return;
        }

        // Check if user exists, is authenticated, and profile is incomplete
        if (user && user.authenticated && user.is_complete === false) {
            router.push('/complete-profile');
        }
    }, [user, isLoading, pathname, router]);

    // If user's profile is incomplete and not on complete-profile page, show loading
    if (!isLoading && user && user.authenticated && user.is_complete === false && pathname !== '/complete-profile') {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-xl text-green-600">Redirecting to complete your profile...</div>
            </div>
        );
    }

    return <>{children}</>;
}

const navigation = [
    { name: 'Newsfeed', href: '/feedv3', icon: Home },
    // { name: 'Pro Players', href: '/pro-players', icon: Trophy },
    { name: 'Chatter', href: '/chatter', icon: Lightbulb },
    { name: 'Trading Cards', href: '/trading-cards', icon: Zap },
    // { name: 'Roadmap', href: '/roadmap', icon: Map },
    { name: 'Overview', href: '/overview', icon: BarChart3 },
    { name: 'Pros', href: '/pros', icon: Trophy },
    { name: 'Brands', href: '/brand-feed', icon: Tag },
    { name: 'Events', href: '/events', icon: CalendarDays },
    { name: 'Media', href: '/media', icon: Play },
    // { name: 'Products', href: '/products', icon: Package },
    // { name: 'Feedv3', href: '/feedv3', icon: Home },
    { name: 'Games', href: '/games', icon: Target },
    { name: 'Centers', href: '/centers', icon: MapPin },
    { name: 'Xchange', href: '/xchange', icon: ShoppingCart },
    { name: 'Perks', href: '/perks', icon: Gift },
    { name: 'Messages', href: '/messages', icon: MessageCircle },
    { name: 'My Teams', href: '/teams', icon: Users },
    { name: 'Analytics', href: '/analytics', icon: Target },
    { name: 'Tournaments', href: '/tournaments', icon: Settings },
    { name: 'Feedback', href: '/feedback', icon: MessageSquare },
];

export default function Navigation({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { user, signout, isLoading } = useAuth();

    // Public routes that don't require authentication
    const publicRoutes = ['/landing', '/select-your-role', '/complete-profile', '/signin', '/signup', '/'];

    // Check if it's a pro player public route
    const isProPlayerRoute = pathname.startsWith('/pro/');

    // Check if it's a private access route (for beta launch)
    const isPrivateAccessRoute = pathname.startsWith('/private-access/');

    // Combined public route check
    const isPublicRoute = publicRoutes.includes(pathname) || isProPlayerRoute || isPrivateAccessRoute;

    // Landing page route - show only the landing page without navigation
    if (pathname === '/landing' || pathname === '/select-your-role') {
        return <>{children}</>;
    }



    // Pro player public routes - handle all cases for pro routes
    if (isProPlayerRoute) {
        if (isLoading) {
            // Show loading state while auth is loading
            return (
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-xl text-green-600">Loading...</div>
                </div>
            );
        } else if (!user || !user.authenticated) {
            // Unauthenticated user - show simplified navigation
            return (
                <div className="flex h-screen bg-gray-100">
                    {/* Simplified Desktop sidebar for public pro routes */}
                    <div className="hidden lg:flex lg:flex-shrink-0">
                        <div className="flex flex-col w-64">
                            <div className="flex flex-col flex-grow border-r border-gray-800" style={{ backgroundColor: '#111B05' }}>
                                {/* Logo */}
                                <div className="flex items-center gap-3 px-6 py-6 border-b border-gray-800">
                                    <Image
                                        src="/logo/logo_for_dark.png"
                                        alt="Bowlers Network Logo"
                                        width={40}
                                        height={40}
                                        unoptimized
                                        className="rounded"
                                    />
                                    <span className="text-xl font-bold text-white">BowlersNetwork</span>
                                </div>

                                {/* Welcome Message */}
                                <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
                                    <div className="mb-6">
                                        <h3 className="text-white text-lg font-semibold mb-2">Welcome to BowlersNetwork</h3>
                                        <p className="text-gray-300 text-sm">Login for full access to connect with players, view exclusive content, and join the community.</p>
                                    </div>

                                    <Link
                                        href="/signin"
                                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors w-full text-center"
                                    >
                                        Login for Full Access
                                    </Link>

                                    <Link
                                        href="/signup"
                                        className="text-green-400 hover:text-green-300 text-sm mt-3 transition-colors"
                                    >
                                        Don&apos;t have an account? Sign up
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Mobile header for public pro routes */}
                    <div className="lg:hidden border-b border-gray-800 px-4 py-3 flex items-center justify-between" style={{ backgroundColor: '#111B05' }}>
                        <span className="text-lg font-bold text-white">BowlersNetwork</span>
                        <Link
                            href="/signin"
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                        >
                            Login
                        </Link>
                    </div>

                    {/* Main content */}
                    <div className="flex flex-col flex-1 overflow-hidden bg-gray-50">
                        <main className="flex-1 overflow-y-auto">
                            {children}
                        </main>
                    </div>
                </div>
            );
        }
        // If authenticated user visits pro route, continue to full navigation (fall through)
    }

    // Authentication pages and private access - show without navigation
    if (publicRoutes.includes(pathname) || isPrivateAccessRoute) {
        return <>{children}</>;
    }

    return (
        <ProtectedRoute>
            <ProfileCompletionCheck>
                <div className="flex h-screen bg-gray-100">
                    {/* Mobile sidebar */}
                    {sidebarOpen && (
                        <div className="fixed inset-0 z-40 lg:hidden">
                            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
                            <div className="relative flex flex-col w-64 h-full bg-gray-900 shadow-xl overflow-y-auto">
                                <div className="flex items-center justify-between px-4 py-4 border-b border-gray-700 flex-shrink-0">
                                    <div className="flex items-center gap-3">
                                        <Image
                                            src="/logo/logo_for_dark.png"
                                            alt="Bowlers Network Logo"
                                            width={32}
                                            height={32}
                                            unoptimized
                                            className="rounded"
                                        />
                                        <span className="text-xl font-bold">
                                            <span className="text-white">Bowlers </span>
                                            <span className="text-green-400">Network</span>
                                        </span>
                                    </div>
                                    <button onClick={() => setSidebarOpen(false)} className="p-2 text-gray-400 hover:text-gray-300">
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>

                                <nav className="flex-1 px-4 py-6 space-y-2">
                                    {navigation.map((item) => {
                                        const isActive = pathname === item.href;
                                        return (
                                            <Link
                                                key={item.name}
                                                href={item.href}
                                                onClick={() => setSidebarOpen(false)}
                                                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive
                                                    ? 'bg-green-600 text-white'
                                                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                                                    }`}
                                            >
                                                <item.icon className="w-5 h-5" />
                                                {item.name}
                                            </Link>
                                        );
                                    })}
                                </nav>

                                {/* User Profile */}
                                <div className="px-4 py-4 border-t border-gray-700">
                                    <Link
                                        href="/profile"
                                        onClick={() => setSidebarOpen(false)}
                                        className="block transition-colors"
                                    >
                                        <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors">
                                            {user?.profile_picture_url ? (
                                                <Image
                                                    src={user.profile_picture_url}
                                                    alt={user?.name || "Profile"}
                                                    width={32}
                                                    height={32}
                                                    className="w-8 h-8 rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                                                    <span className="font-medium text-sm text-gray-900">
                                                        {user?.name ? user.name.split(' ').map((n: string) => n[0]).join('') : 'U'}
                                                    </span>
                                                </div>
                                            )}
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-white">{user?.name}</p>
                                                <span className="text-xs text-gray-400">
                                                    View Profile
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                </div>

                                {/* Logout Button */}
                                <div className="px-4 pb-4">
                                    <button
                                        onClick={() => {
                                            signout();
                                            setSidebarOpen(false);
                                        }}
                                        className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-gray-300 hover:bg-red-600 hover:text-white w-full text-sm font-medium"
                                    >
                                        <LogOut className="w-5 h-5" />
                                        Sign Out
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Desktop sidebar */}
                    <div className="hidden lg:flex lg:flex-shrink-0">
                        <div className="flex flex-col w-64 h-full">
                            <div className="flex flex-col h-full border-r border-gray-800 overflow-hidden" style={{ backgroundColor: '#111B05' }}>
                                {/* Logo */}
                                <div className="flex items-center gap-3 px-6 py-6 border-b border-gray-800">
                                    <Image
                                        src="/logo/logo_for_dark.png"
                                        alt="Bowlers Network Logo"
                                        width={40}
                                        height={40}
                                        unoptimized
                                        className="rounded"
                                    />
                                    <span className="text-xl font-bold text-white">BowlersNetwork</span>
                                </div>

                                {/* Navigation */}
                                <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto scrollbar-thin min-h-0">
                                    {navigation.map((item) => {
                                        const isActive = pathname === item.href;
                                        return (
                                            <Link
                                                key={item.name}
                                                href={item.href}
                                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium ${isActive
                                                    ? 'text-white' : 'text-green-100 hover:text-white'
                                                    }`}
                                                style={isActive ? { backgroundColor: 'rgba(255,255,255,0.1)' } : {}}
                                                onMouseEnter={(e) => {
                                                    if (!isActive) {
                                                        e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                                                    }
                                                }}
                                                onMouseLeave={(e) => {
                                                    if (!isActive) {
                                                        e.currentTarget.style.backgroundColor = '';
                                                    }
                                                }}
                                            >
                                                <item.icon className="w-5 h-5" />
                                                {item.name}
                                            </Link>
                                        );
                                    })}
                                </nav>

                                {/* User Profile */}
                                <div className="px-4 py-4 border-t border-gray-800">
                                    <Link
                                        href="/profile"
                                        className="block transition-colors"
                                    >
                                        <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-white hover:bg-opacity-10 transition-colors">
                                            {user?.profile_picture_url ? (
                                                <Image
                                                    src={user.profile_picture_url}
                                                    alt={user?.name || "Profile"}
                                                    width={32}
                                                    height={32}
                                                    className="w-8 h-8 rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                                                    <span className="font-medium text-sm" style={{ color: '#111B05' }}>
                                                        {user?.name ? user.name.split(' ').map((n: string) => n[0]).join('') : 'U'}
                                                    </span>
                                                </div>
                                            )}
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-white">{user?.name}</p>
                                                <span className="text-xs text-gray-400 hover:text-white">
                                                    View Profile
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                </div>

                                {/* Logout Button */}
                                <div className="px-4 pb-4">
                                    <button
                                        onClick={signout}
                                        className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-gray-300 hover:bg-red-600 hover:text-white w-full text-sm font-medium"
                                    >
                                        <LogOut className="w-5 h-5" />
                                        Sign Out
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main content */}
                    <div className="flex flex-col flex-1 overflow-hidden bg-gray-50">
                        {/* Mobile header */}
                        <div className="lg:hidden border-b border-gray-800 px-4 py-3 flex items-center justify-between" style={{ backgroundColor: '#111B05' }}>
                            <button onClick={() => setSidebarOpen(true)} className="p-2 text-gray-300 hover:text-white">
                                <Menu className="w-6 h-6" />
                            </button>
                            <span className="text-lg font-bold text-white">BowlersNetwork</span>
                            <button
                                onClick={signout}
                                className="p-2 text-gray-300 hover:text-red-400 transition-colors"
                                title="Sign out"
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>

                        <main className="flex-1 overflow-y-auto">
                            <NotificationBanner />
                            <GlobalHeader />
                            {children}
                        </main>
                    </div>
                </div>
            </ProfileCompletionCheck>
        </ProtectedRoute>
    );
}
