import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const COOKIE = 'XSRF-TOKEN';
const HEADER = 'x-xsrf-token';
const MUTATING = ['POST', 'PUT', 'PATCH', 'DELETE'];

// These are cookie-free, cross-origin-friendly public endpoints.
// They are rate-limited in their handlers; CSRF does not apply (no ambient authority).
const PUBLIC_PATHS = ['/api/booking', '/api/plugin-lead', '/api/auth/'];

function randomToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isMutating = MUTATING.includes(req.method);

  if (!isMutating) {
    // Set the CSRF cookie on any non-mutating request (page loads and API GETs).
    const res = NextResponse.next();
    if (!req.cookies.get(COOKIE)?.value) {
      res.cookies.set(COOKIE, randomToken(), {
        path: '/',
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      });
    }
    return res;
  }

  // Mutating requests are only enforced on API routes.
  if (!pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const tokenCookie = req.cookies.get(COOKIE)?.value;
  const headerToken = req.headers.get(HEADER);
  if (!tokenCookie || !headerToken || headerToken !== tokenCookie) {
    return NextResponse.json({ error: 'CSRF token mismatch' }, { status: 403 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
