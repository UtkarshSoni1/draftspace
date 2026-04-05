import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from '@/lib/jwt';

// Routes that don't require authentication
const publicRoutes = ['/login', '/signup', '/api/auth'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if it's a public route
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  if (isPublicRoute) {
    // If user is already logged in and trying to access login/signup, redirect to home
    const token = request.cookies.get('auth-token')?.value;
    if (token && (pathname === '/login' || pathname === '/signup')) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // For protected routes, check authentication
  const token = request.cookies.get('auth-token')?.value;

  if (!token) {
    // No token, redirect to login
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Verify token
  const verified = jwtVerify(token);
  if (!verified) {
    // Invalid token, redirect to login
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
