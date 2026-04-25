import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export const config = {
  matcher: ["/admin/:path*"],
};

export async function middleware(request: NextRequest) {
  const { response, user } = await updateSession(request);

  // /admin/login is the only /admin/* route that doesn't require auth
  if (request.nextUrl.pathname === "/admin/login") {
    if (user) {
      return NextResponse.redirect(new URL("/admin/bulletins", request.url));
    }
    return response;
  }

  if (!user) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}
