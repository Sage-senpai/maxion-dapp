// src/middleware.ts
// Location: src/middleware.ts (root directory)
// Middleware to protect routes

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes that don't need authentication
  const publicRoutes = ['/', '/auth/signin', '/auth/signup'];
  
  // If trying to access /app routes
  if (pathname.startsWith('/app')) {
    // In production, check for actual auth token
    // For now, we'll check localStorage in the client
    // Server-side auth check would go here
    
    // Allow through - client will handle redirect if not authenticated
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/app/:path*'],
};