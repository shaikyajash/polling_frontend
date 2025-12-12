import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const token = request.cookies.get('session_token')
    const { pathname } = request.nextUrl

    // Define public routes
    const isPublicRoute =
        pathname === '/login' ||
        pathname === '/register' ||
        pathname === '/' || // Home might be public
        pathname.startsWith('/polls/') && pathname.endsWith('/results') // Results might be public
    // Add other public routes as needed

    // If token is missing and route is protected (not public), redirect to login
    // Note: This is an optimistic check. Real validation happens on backend/server actions.
    // We can refine this logic. For now, let's protect everything except auth routes.

    if (!token && !isPublicRoute) {
        const loginUrl = new URL('/login', request.url)
        // redirecting...
        // return NextResponse.redirect(loginUrl)
    }

    // Actually, let's be more specific to avoid redirect loops or blocking static assets
    // Only protect specific paths or everything BUT public paths + static assets

    if (!token) {
        if (pathname.startsWith('/polls/new') || pathname === '/dashboard') {
            return NextResponse.redirect(new URL('/login', request.url))
        }
    }

    // If token exists and trying to access auth pages, redirect to dashboard?
    if (token && (pathname === '/login' || pathname === '/register')) {
        return NextResponse.redirect(new URL('/', request.url))
    }

    return NextResponse.next()
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
}
