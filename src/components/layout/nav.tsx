'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { Home, Swords, Trophy, LayoutGrid, Target, LogOut, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/',          icon: Home,       label: '홈' },
  { href: '/guild-war', icon: Swords,     label: '길드전' },
  { href: '/pve',       icon: Target,     label: 'PVE' },
  { href: '/ranking',   icon: Trophy,     label: '랭킹' },
  { href: '/deck-plan', icon: LayoutGrid, label: '덱편성' },
]

export default function Nav() {
  const pathname = usePathname()
  const { data: session } = useSession()

  return (
    <>
      {/* 모바일: 하단 네비게이션 바 */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0f0f26] border-t border-amber-900/40">
        <div className="flex items-center justify-around h-16">
          {navItems.map(({ href, icon: Icon, label }) => {
            const isActive = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg transition-colors',
                  isActive ? 'text-amber-400' : 'text-slate-500'
                )}
              >
                <Icon size={22} />
                <span className="text-[10px]">{label}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* PC: 왼쪽 사이드바 */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-56 flex-col bg-[#0f0f26] border-r border-amber-900/30">
        {/* 로고 */}
        <div className="px-6 py-5 border-b border-amber-900/30">
          <h1 className="text-lg font-bold text-amber-400 tracking-wide">불굴 길드</h1>
          <p className="text-xs text-slate-500 mt-0.5">세븐나이츠 리버스</p>
        </div>

        {/* 메뉴 */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ href, icon: Icon, label }) => {
            const isActive = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
                  isActive
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                )}
              >
                <Icon size={18} />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* 유저 정보 + 관리자 메뉴 + 로그아웃 */}
        <div className="px-3 py-4 border-t border-amber-900/30">
          <div className="px-3 py-2 mb-1">
            <p className="text-sm text-slate-200 font-medium">{session?.user?.name}</p>
            <p className="text-xs text-amber-600">{(session?.user as any)?.role}</p>
          </div>
          {(session?.user as any)?.role === '관리자' && (
            <Link
              href="/admin/users"
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors mb-1',
                pathname === '/admin/users'
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
              )}
            >
              <Shield size={18} />
              길드원 관리
            </Link>
          )}
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-slate-500 hover:bg-white/5 hover:text-slate-300 transition-colors"
          >
            <LogOut size={18} />
            로그아웃
          </button>
        </div>
      </aside>
    </>
  )
}
