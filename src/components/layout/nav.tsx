'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { Home, Swords, Target, LogOut, Shield, Crown, Bell, CalendarDays, BarChart2, ClipboardList } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/',          icon: Home,         label: '홈' },
  { href: '/guild-war', icon: Swords,       label: '길드전' },
  { href: '/today',     icon: CalendarDays, label: '오늘의 길드전' },
  { href: '/pve',       icon: Target,       label: 'PVE' },
  { href: '/destruct',  icon: Crown,        label: '파괴신' },
  { href: '/notices',   icon: Bell,         label: '공지사항' },
]

const adminItems = [
  { href: '/admin/users',   icon: Shield,        label: '길드원 관리' },
  { href: '/admin/winloss', icon: BarChart2,     label: '승패 관리' },
  { href: '/admin/reports', icon: ClipboardList, label: '제보 관리' },
]

// 모바일 하단 바에 보여줄 5개만 (자주 쓰는 것)
const mobileNav = [
  { href: '/',          icon: Home,         label: '홈' },
  { href: '/guild-war', icon: Swords,       label: '길드전' },
  { href: '/today',     icon: CalendarDays, label: '오늘' },
  { href: '/pve',       icon: Target,       label: 'PVE' },
  { href: '/notices',   icon: Bell,         label: '공지' },
]

export default function Nav() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const role = (session?.user as { role?: string })?.role ?? ''
  const isAdmin = ['관리자', '연구원'].includes(role)

  return (
    <>
      {/* 모바일: 하단 네비게이션 바 */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0f0f26] border-t border-amber-900/40">
        <div className="flex items-center justify-around h-16">
          {mobileNav.map(({ href, icon: Icon, label }) => {
            const isActive = pathname === href
            return (
              <Link key={href} href={href}
                className={cn('flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg transition-colors',
                  isActive ? 'text-amber-400' : 'text-slate-500')}>
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

        {/* 메인 메뉴 */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ href, icon: Icon, label }) => {
            const isActive = pathname === href
            return (
              <Link key={href} href={href}
                className={cn('flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
                  isActive
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200')}>
                <Icon size={18} />
                {label}
              </Link>
            )
          })}

          {/* 관리자 메뉴 */}
          {isAdmin && (
            <>
              <div className="pt-3 pb-1 px-3">
                <p className="text-[10px] text-slate-700 font-bold uppercase tracking-widest">관리자</p>
              </div>
              {adminItems.map(({ href, icon: Icon, label }) => {
                const isActive = pathname === href
                return (
                  <Link key={href} href={href}
                    className={cn('flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
                      isActive
                        ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                        : 'text-slate-400 hover:bg-white/5 hover:text-slate-200')}>
                    <Icon size={18} />
                    {label}
                  </Link>
                )
              })}
            </>
          )}
        </nav>

        {/* 유저 정보 + 로그아웃 */}
        <div className="px-3 py-4 border-t border-amber-900/30">
          <div className="px-3 py-2 mb-2">
            <p className="text-sm text-slate-200 font-medium">{session?.user?.name}</p>
            <p className="text-xs text-amber-600">{role}</p>
          </div>
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
