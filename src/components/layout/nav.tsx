'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { Home, Swords, Trophy, LayoutGrid, Target, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/',           icon: Home,        label: '홈' },
  { href: '/guild-war',  icon: Swords,      label: '길드전' },
  { href: '/ranking',    icon: Trophy,      label: '랭킹' },
  { href: '/deck-plan',  icon: LayoutGrid,  label: '덱편성' },
  { href: '/totalwar',   icon: Target,      label: '총력전' },
]

export default function Nav() {
  const pathname = usePathname()
  const { data: session } = useSession()

  return (
    <>
      {/* 모바일: 하단 네비게이션 바 */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-gray-900 border-t border-gray-800">
        <div className="flex items-center justify-around h-16">
          {navItems.map(({ href, icon: Icon, label }) => {
            const isActive = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg transition-colors',
                  isActive ? 'text-blue-400' : 'text-gray-500'
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
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-56 flex-col bg-gray-900 border-r border-gray-800">
        {/* 로고 */}
        <div className="px-6 py-5 border-b border-gray-800">
          <h1 className="text-lg font-bold text-white">불굴 길드</h1>
          <p className="text-xs text-gray-500 mt-0.5">세븐나이츠 리버스</p>
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
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                )}
              >
                <Icon size={18} />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* 유저 정보 + 로그아웃 */}
        <div className="px-3 py-4 border-t border-gray-800">
          <div className="px-3 py-2 mb-1">
            <p className="text-sm text-white font-medium">{session?.user?.name}</p>
            <p className="text-xs text-gray-500">{(session?.user as any)?.role}</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
          >
            <LogOut size={18} />
            로그아웃
          </button>
        </div>
      </aside>
    </>
  )
}
