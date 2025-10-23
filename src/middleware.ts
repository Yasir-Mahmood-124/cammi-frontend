import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that require authentication
const protectedRoutes = ["/dashboard"];

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;

  // If user is trying to access a protected route without a token
  if (protectedRoutes.some((path) => request.nextUrl.pathname.startsWith(path))) {
    if (!token) {
      const loginUrl = new URL("/sign-in", request.url);
      loginUrl.searchParams.set("from", request.nextUrl.pathname); // optional: redirect back after login
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"], // apply middleware to dashboard
};
