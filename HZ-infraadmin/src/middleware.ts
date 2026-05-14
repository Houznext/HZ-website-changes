import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function isPublicPath(pathname: string): boolean {
  return (
    pathname === '/login' ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname === '/favicon.ico'
  );
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (isPublicPath(pathname)) return NextResponse.next();

  const loggedIn = req.cookies.get('infra_admin_logged_in')?.value;

  if (!loggedIn) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/listings',
    '/listings/:path*',
    '/new-property',
    '/new-property/:path*',
    '/pending',
    '/pending/:path*',
    '/projects',
    '/projects/:path*',
    '/crm',
    '/crm/:path*',
    '/enquiries',
    '/enquiries/:path*',
    '/site-visits',
    '/site-visits/:path*',
    '/branches',
    '/branches/:path*',
    '/users',
    '/users/:path*',
    '/roles',
    '/roles/:path*',
    '/settings',
    '/settings/:path*',
    '/hero-cms',
    '/hero-cms/:path*',
    '/rera-docs',
    '/rera-docs/:path*',
    '/developer-submissions',
    '/developer-submissions/:path*',
  ],
};
