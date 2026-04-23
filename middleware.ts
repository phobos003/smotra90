import { NextResponse, type NextRequest } from "next/server"
import { verifyAdminCookieValue, ADMIN_COOKIE_NAME } from "@/lib/auth"

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  const isAdminArea = pathname.startsWith("/admin")
  const isAdminApi = pathname.startsWith("/api/admin") && pathname !== "/api/admin/login"
  const isLoginPage = pathname === "/admin/login"

  if (!isAdminArea && !isAdminApi) return NextResponse.next()
  if (isLoginPage) return NextResponse.next()

  const raw = req.cookies.get(ADMIN_COOKIE_NAME)?.value
  if (verifyAdminCookieValue(raw)) return NextResponse.next()

  if (isAdminApi) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }
  const url = req.nextUrl.clone()
  url.pathname = "/admin/login"
  return NextResponse.redirect(url)
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
  runtime: "nodejs",
}
