'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Home, BarChart3, MessageCircle, Settings, Package, Menu, CalendarDays, X, LogOut, Users, Trophy, Target, MessageSquare, Play, Gift, ShoppingCart, Zap, Map, Lightbulb, MapPin, Tag, ChevronLeft, ChevronRight } from 'lucide-react';
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
    { name: 'Chatter', href: '/chatter', icon: Lightbulb, status: 'BETA' },
    { name: 'ChatterV3', href: '/chatterv3', icon: Lightbulb, status: 'BETA' },
    { name: 'Trading Cards', href: '/trading-cards', icon: Zap, status: 'BETA' },
    // { name: 'Roadmap', href: '/roadmap', icon: Map },
    { name: 'Overview', href: '/overview', icon: BarChart3, status: 'UPCOMING' },
    { name: 'Pros', href: '/pros', icon: Trophy },
    { name: 'Brands', href: '/brand-feed', icon: Tag },
    { name: 'Events', href: '/events', icon: CalendarDays },
    { name: 'Media', href: '/media', icon: Play },
    // { name: 'Products', href: '/products', icon: Package },
    // { name: 'Feedv3', href: '/feedv3', icon: Home },
    { name: 'Games', href: '/games', icon: Target, status: 'BETA' },
    { name: 'Centers', href: '/centers', icon: MapPin },
    { name: 'Xchange', href: '/xchange', icon: ShoppingCart, status: 'UPCOMING' },
    { name: 'Perks', href: '/perks', icon: Gift, status: 'UPCOMING' },
    { name: 'Messages', href: '/messages', icon: MessageCircle, status: 'BETA' },
    { name: 'My Teams', href: '/teams', icon: Users },
    { name: 'Analytics', href: '/analytics', icon: Target, status: 'UPCOMING' },
    { name: 'Tournaments', href: '/tournaments', icon: Settings, status: 'UPCOMING' },
    { name: 'Feedback', href: '/feedback', icon: MessageSquare },
];

export default function Navigation({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(false);
    const { user, signout, isLoading } = useAuth();

    // Public routes that don't require authentication
    const publicRoutes = ['/landing', '/select-your-role', '/complete-profile', '/signin', '/signup', '/', '/terms-of-service'];

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
                        <div className="fixed inset-0 z-[60] lg:hidden">
                            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
                            <div className="fixed inset-y-0 left-0 flex flex-col w-64 h-full bg-white shadow-xl overflow-y-auto z-[61]">
                                <div className="flex items-center justify-between px-4 py-4 border-b border-[#f3f4f6] flex-shrink-0">
                                    <div className="flex items-center gap-3">
                                        <Image
                                            src="/logo/logo.png"
                                            alt="Bowlers Network Logo"
                                            width={32}
                                            height={32}
                                            unoptimized
                                            className="rounded"
                                        />
                                        <span className="text-xl font-bold">
                                            <span className="text-[#1e2939]">Bowlers </span>
                                            <span className="text-[#1e2939]">Network</span>
                                        </span>
                                    </div>
                                    <button onClick={() => setSidebarOpen(false)} className="p-2 text-gray-500 hover:text-gray-900">
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
                                                className={`flex items-center justify-between px-3 py-2 rounded-xl transition-all border border-transparent ${isActive
                                                        ? 'bg-gradient-to-r from-[rgba(81,69,205,0.1)] to-[rgba(124,111,232,0.05)] text-[#5145cd] shadow-[0_1px_3px_rgba(0,0,0,0.1)] relative'
                                                        : 'text-[#364153] hover:bg-gray-50 hover:text-[#1e2939]'
                                                    }`}
                                            >
                                                {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 h-[24px] w-[4px] bg-gradient-to-b from-[#5145cd] to-[#7c6fe8] rounded-[33554400px]" />}
                                                <div className="flex items-center gap-3 relative z-10">
                                                    <item.icon className="w-5 h-5" />
                                                    {item.name}
                                                </div>
                                                {item.status && (
                                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${item.status === 'BETA'
                                                        ? 'text-amber-500 border-amber-500'
                                                        : 'text-blue-400 border-blue-400'
                                                        }`}>
                                                        {item.status}
                                                    </span>
                                                )}
                                            </Link>
                                        );
                                    })}
                                </nav>

                                {/* User Profile */}
                                <div className="px-4 py-4 border-t border-[#f3f4f6]">
                                    <Link
                                        href="/profile"
                                        onClick={() => setSidebarOpen(false)}
                                        className="block transition-colors"
                                    >
                                        <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors">
                                            {user?.profile_picture_url ? (
                                                <Image
                                                    src={user.profile_picture_url}
                                                    alt={user?.name || "Profile"}
                                                    width={32}
                                                    height={32}
                                                    className="w-8 h-8 rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                                                    <span className="font-medium text-sm text-[#1e2939]">
                                                        {user?.name ? user.name.split(' ').map((n: string) => n[0]).join('') : 'U'}
                                                    </span>
                                                </div>
                                            )}
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-[#1e2939]">{user?.name}</p>
                                                <span className="text-xs text-[#364153]">
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
                                        className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-[#364153] hover:bg-red-50 hover:text-red-600 w-full text-sm font-medium"
                                    >
                                        <LogOut className="w-5 h-5" />
                                        Sign Out
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Desktop sidebar */}
                    <div className={`hidden lg:flex lg:flex-shrink-0 transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}>
                        <div className={`flex flex-col h-full transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}>
                            <div className="flex flex-col h-full border-r border-[#f3f4f6] overflow-hidden bg-white">
                                {/* Logo + collapse toggle */}
                                <div className={`flex border-b border-[#f3f4f6] ${collapsed ? 'flex-col items-center justify-center py-3 gap-3' : 'items-center py-5 gap-2 px-3'}`}>
                                    <Image
                                        src="/logo/logo.png"
                                        alt="Bowlers Network Logo"
                                        width={32}
                                        height={32}
                                        unoptimized
                                        className="rounded flex-shrink-0"
                                    />
                                    {!collapsed && (
                                        <span className="text-lg font-bold text-[#1e2939] flex-1 truncate min-w-0">BowlersNetwork</span>
                                    )}
                                    <button
                                        onClick={() => setCollapsed(!collapsed)}
                                        className="flex-shrink-0 p-1.5 rounded-md text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                                        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                                    >
                                        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                                    </button>
                                </div>

                                {/* Navigation */}
                                <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto scrollbar-thin min-h-0">
                                    {navigation.map((item) => {
                                        const isActive = pathname === item.href;
                                        return (
                                            <Link
                                                key={item.name}
                                                href={item.href}
                                                title={collapsed ? item.name : undefined}
                                                className={`flex items-center py-2.5 rounded-xl transition-all text-sm font-medium border border-transparent ${collapsed ? 'justify-center px-2' : 'justify-between px-3'
                                                    } ${isActive ? 'text-[#5145cd] bg-gradient-to-r from-[rgba(81,69,205,0.1)] to-[rgba(124,111,232,0.05)] shadow-[0_1px_3px_rgba(0,0,0,0.1)] relative' : 'text-[#364153] hover:bg-gray-50'
                                                    }`}
                                                style={{}}
                                                onMouseEnter={(e) => {
                                                    if (!isActive) e.currentTarget.style.backgroundColor = '#f3f4f6';
                                                }}
                                                onMouseLeave={(e) => {
                                                    if (!isActive) e.currentTarget.style.backgroundColor = '';
                                                }}
                                            >
                                                {isActive && !collapsed && <div className="absolute left-0 top-1/2 -translate-y-1/2 h-[24px] w-[4px] bg-gradient-to-b from-[#5145cd] to-[#7c6fe8] rounded-[33554400px]" />}
                                                <div className={`flex items-center ${collapsed ? '' : 'gap-3 ml-1'}`}>
                                                    <item.icon className="w-5 h-5 flex-shrink-0" />
                                                    {!collapsed && item.name}
                                                </div>
                                                {!collapsed && item.status && (
                                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${item.status === 'BETA'
                                                        ? 'text-amber-500 border-amber-500'
                                                        : 'text-blue-400 border-blue-400'
                                                        }`}>
                                                        {item.status}
                                                    </span>
                                                )}
                                            </Link>
                                        );
                                    })}
                                </nav>

                                {/* User Profile */}
                                <div className="px-2 py-3 border-t border-[#f3f4f6]">
                                    <Link
                                        href="/profile"
                                        title={collapsed ? (user?.name || 'Profile') : undefined}
                                        className="block transition-colors"
                                    >
                                        <div className={`flex items-center p-2 rounded-lg hover:bg-gray-100 transition-colors ${collapsed ? 'justify-center' : 'gap-3'}`}>
                                            {user?.profile_picture_url ? (
                                                <Image
                                                    src={user.profile_picture_url}
                                                    alt={user?.name || "Profile"}
                                                    width={32}
                                                    height={32}
                                                    className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                                                />
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                                                    <span className="font-medium text-sm text-[#1e2939]">
                                                        {user?.name ? user.name.split(' ').map((n: string) => n[0]).join('') : 'U'}
                                                    </span>
                                                </div>
                                            )}
                                            {!collapsed && (
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-[#1e2939] truncate">{user?.name}</p>
                                                    <span className="text-xs text-[#364153] hover:text-[#1e2939]">View Profile</span>
                                                </div>
                                            )}
                                        </div>
                                    </Link>
                                </div>

                                {/* Logout Button */}
                                <div className="px-2 pb-3">
                                    <button
                                        onClick={signout}
                                        title={collapsed ? 'Sign Out' : undefined}
                                        className={`flex items-center py-2.5 rounded-lg transition-colors text-[#364153] hover:bg-red-50 hover:text-red-600 w-full text-sm font-medium ${collapsed ? 'justify-center px-2' : 'gap-3 px-3'
                                            }`}
                                    >
                                        <LogOut className="w-5 h-5 flex-shrink-0" />
                                        {!collapsed && 'Sign Out'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main content */}
                    <div className="flex flex-col flex-1 overflow-hidden bg-gray-50">
                        {/* Mobile header */}
                        <div className="lg:hidden border-b border-[#f3f4f6] px-4 py-3 flex items-center justify-between" style={{ backgroundColor: '#ffffff' }}>
                            <button onClick={() => setSidebarOpen(true)} className="p-2 text-gray-500 hover:text-gray-900">
                                <Menu className="w-6 h-6" />
                            </button>
                            <span className="text-lg font-bold text-[#1e2939]">BowlersNetwork</span>
                            <button
                                onClick={signout}
                                className="p-2 text-gray-500 hover:text-red-500 transition-colors"
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
