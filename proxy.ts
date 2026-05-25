import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function proxy(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  const isLoginPage = req.nextUrl.pathname === '/login'

  // 비로그인 상태에서 보호된 페이지 접근 → /login으로 이동
  if (!token && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // 이미 로그인된 상태에서 /login 접근 → / 로 이동
  if (token && isLoginPage) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
