import createIntlMiddleware from 'next-intl/middleware';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { routing } from './i18n/routing';

const ALLOWED_METHODS = 'GET,POST,PUT,PATCH,DELETE,OPTIONS';
const ALLOWED_HEADERS = 'Content-Type, Authorization';

const intlMiddleware = createIntlMiddleware(routing);

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // CORS for /api/* — reflect the request origin so the same code works
  // on localhost, Vercel preview URLs, and custom domains without extra env vars.
  if (pathname.startsWith('/api/')) {
    const origin = req.headers.get('origin') ?? '*';
    if (req.method === 'OPTIONS') {
      const res = new NextResponse(null, { status: 204 });
      res.headers.set('Access-Control-Allow-Origin', origin);
      res.headers.set('Access-Control-Allow-Credentials', 'true');
      res.headers.set('Access-Control-Allow-Methods', ALLOWED_METHODS);
      res.headers.set('Access-Control-Allow-Headers', ALLOWED_HEADERS);
      res.headers.set('Vary', 'Origin');
      return res;
    }
    const res = NextResponse.next();
    res.headers.set('Access-Control-Allow-Origin', origin);
    res.headers.set('Access-Control-Allow-Credentials', 'true');
    res.headers.set('Access-Control-Allow-Methods', ALLOWED_METHODS);
    res.headers.set('Access-Control-Allow-Headers', ALLOWED_HEADERS);
    res.headers.set('Vary', 'Origin');
    return res;
  }

  // next-intl for everything else
  return intlMiddleware(req);
}

export const config = {
  matcher: [
    '/api/:path*',
    '/((?!_next|_vercel|.*\\..*).*)',
  ],
};
