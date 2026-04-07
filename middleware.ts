import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  const pathname = request.nextUrl.pathname;

  // "/" is always public
  if (pathname === '/') {
    return NextResponse.next();
  }

  // /login and /signup are public
  if (pathname === '/login' || pathname === '/signup') {
    // Redirect to "/" if user is already authenticated
    if (token) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // Protected routes: /collaboration/*, /live/*, /room/*
  if (pathname.startsWith('/collaboration') || pathname.startsWith('/live') || pathname.startsWith('/room')) {
    if (!token) {
      const callbackUrl = encodeURIComponent(pathname + request.nextUrl.search);
      return NextResponse.redirect(new URL(`/login?callbackUrl=${callbackUrl}`, request.url));
    }
    return NextResponse.next();
  }

  // All other routes are public by default
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
