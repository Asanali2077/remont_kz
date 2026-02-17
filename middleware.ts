import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const ALLOWED_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173";
const ALLOWED_METHODS = "GET,POST,PUT,PATCH,DELETE,OPTIONS";
const ALLOWED_HEADERS = "Content-Type, Authorization";

export function middleware(req: NextRequest) {
  if (req.method === "OPTIONS") {
    const res = new NextResponse(null, { status: 204 });
    res.headers.set("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
    res.headers.set("Access-Control-Allow-Credentials", "true");
    res.headers.set("Access-Control-Allow-Methods", ALLOWED_METHODS);
    res.headers.set("Access-Control-Allow-Headers", ALLOWED_HEADERS);
    res.headers.set("Vary", "Origin");
    return res;
  }

  const res = NextResponse.next();
  res.headers.set("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
  res.headers.set("Access-Control-Allow-Credentials", "true");
  res.headers.set("Access-Control-Allow-Methods", ALLOWED_METHODS);
  res.headers.set("Access-Control-Allow-Headers", ALLOWED_HEADERS);
  res.headers.set("Vary", "Origin");
  return res;
}

export const config = {
  matcher: "/api/:path*",
};
