import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware() {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/expenses/:path*",
    "/budget/:path*",
    "/net-worth/:path*",
    "/goals/:path*",
    "/vehicle/:path*",
    "/analytics/:path*",
    "/insights/:path*",
    "/profile/:path*",
    "/calendar/:path*",
    "/search/:path*",
    "/api/expenses/:path*",
    "/api/budget/:path*",
    "/api/net-worth/:path*",
    "/api/goals/:path*",
    "/api/vehicle/:path*",
    "/api/search/:path*",
    "/api/insights/:path*",
  ],
};
