import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export const PROTECTED_PREFIXES = ["/user", "/post-property/details"] as const;

export const isProtectedPath = (pathname: string) =>
  PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));

function decodeJwtPayload(token: string): { exp?: number } | null {
  const payloadPart = token.split(".")[1];
  if (!payloadPart) return null;

  // base64url -> base64
  const base64 = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(
    base64.length + ((4 - (base64.length % 4)) % 4),
    "=",
  );

  try {
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    const json = new TextDecoder().decode(bytes);
    return JSON.parse(json) as { exp?: number };
  } catch {
    return null;
  }
}

function isPublicFile(pathname: string) {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/robots.txt") ||
    pathname.startsWith("/sitemap.xml") ||
    pathname.match(/\.(png|jpg|jpeg|svg|webp|ico|css|js|map|txt)$/)
  );
}

function redirectToHomeAfterSignout(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  const homeUrl =
    "/" +
    `?auth=1&callbackUrl=${encodeURIComponent(pathname + (search || ""))}`;

  const url = req.nextUrl.clone();
  url.pathname = "/api/auth/signout";
  url.searchParams.set("callbackUrl", homeUrl);

  return NextResponse.redirect(url);
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/api")) return NextResponse.next();
  if (isPublicFile(pathname)) return NextResponse.next();

  if (!isProtectedPath(pathname)) return NextResponse.next();

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token) return redirectToHomeAfterSignout(req);

  const userToken = (token as any)?.userToken as string | undefined;
  if (!userToken) return redirectToHomeAfterSignout(req);

  try {
    const decoded = decodeJwtPayload(userToken);
    if (!decoded) return redirectToHomeAfterSignout(req);

    const now = Math.floor(Date.now() / 1000);
    if (decoded?.exp && decoded.exp < now)
      return redirectToHomeAfterSignout(req);
  } catch {
    return redirectToHomeAfterSignout(req);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/user/:path*", "/post-property/details"],
};
