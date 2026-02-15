import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Public routes that don't require authentication
    const publicRoutes = ['/landing', '/', '/land2', '/signin', '/signup'];

    // Pro player routes are also public (for viewing pro profiles without login)
    const isProPlayerRoute = pathname.startsWith('/pro/');

    // Private access routes are public (for beta launch access)
    const isPrivateAccessRoute = pathname.startsWith('/private-access/');

    // Check if the current path is a public route
    const isPublicRoute = publicRoutes.includes(pathname) || isProPlayerRoute || isPrivateAccessRoute;

    // Get the access token from cookies or headers
    const token = request.cookies.get('access_token')?.value ||
        request.headers.get('authorization')?.replace('Bearer ', '');

    // If it's a public route and user is authenticated (except private-access), don't redirect (allow access)
    if (publicRoutes.includes(pathname) && token && pathname !== '/') {
        return NextResponse.redirect(new URL('/home', request.url));
    }

    // If it's a protected route and user is not authenticated, redirect to signin
    if (!isPublicRoute && !token) {
        // For client-side navigation, we'll let the AuthContext handle this
        // But for direct URL access, we redirect here
        const isDirectAccess = !request.headers.get('referer');
        if (isDirectAccess) {
            return NextResponse.redirect(new URL('/signin', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};