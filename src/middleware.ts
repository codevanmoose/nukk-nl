import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip if it's already a known route
  const knownRoutes = [
    '/',
    '/analyse',
    '/adverteren', 
    '/dashboard',
    '/admin',
    '/api'
  ];
  
  const isKnownRoute = knownRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );
  
  if (isKnownRoute) {
    return NextResponse.next();
  }
  
  // Check if this looks like a nu.nl article path
  // Pattern: /category/id/article-slug-with-hyphens.html
  const nuUrlPattern = /^\/[a-z-]+\/\d+\/[a-z0-9-]+\.html?$/i;
  
  if (nuUrlPattern.test(pathname)) {
    // This is a nu.nl article path - redirect to analyze page
    const nuUrl = `https://www.nu.nl${pathname}`;
    const analyzeUrl = new URL('/analyse', request.url);
    analyzeUrl.searchParams.set('url', nuUrl);
    
    return NextResponse.redirect(analyzeUrl);
  }
  
  // Let other requests through
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};