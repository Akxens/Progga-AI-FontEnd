import { NextResponse, type NextRequest } from "next/server";

// Fast redirect for signed-out visitors. The API still verifies the token on
// every request; this only avoids flashing a protected page.
const PROTECTED = ["/home", "/tutor", "/lessons", "/lab", "/arena", "/battle", "/rewards", "/leaderboard", "/profile", "/guardian", "/admin"];

function isTokenExpired(token: string | undefined): boolean {
  if (!token) return true;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return true;
    const json = JSON.parse(atob(parts[1]));
    return typeof json.exp === "number" && json.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("progga_token")?.value;
  const expired = isTokenExpired(token);
  const hasValidToken = Boolean(token && !expired);

  if (PROTECTED.some((p) => pathname === p || pathname.startsWith(`${p}/`)) && !hasValidToken) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname + req.nextUrl.search);
    return NextResponse.redirect(url);
  }
  if ((pathname === "/login" || pathname === "/signup") && hasValidToken) {
    if (!req.nextUrl.searchParams.has("expired") && !req.nextUrl.searchParams.has("logout")) {
      return NextResponse.redirect(new URL("/home", req.url));
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next|brand|favicon|icon|health).*)"],
};
