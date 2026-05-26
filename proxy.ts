import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(req: NextRequest) {
  // NextAuth.js가 로그인 시 저장하는 세션 쿠키
  // localhost(HTTP)  → next-auth.session-token
  // 배포(HTTPS)      → __Secure-next-auth.session-token
  const sessionToken =
    req.cookies.get('next-auth.session-token')?.value ??
    req.cookies.get('__Secure-next-auth.session-token')?.value

  const isLoginPage = req.nextUrl.pathname === '/login'

  if (!sessionToken && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', req.url))
  }
  if (sessionToken && isLoginPage) {
    return NextResponse.redirect(new URL('/', req.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
