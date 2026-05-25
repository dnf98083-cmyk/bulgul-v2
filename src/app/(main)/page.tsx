'use client'

import { useSession } from 'next-auth/react'
import { Swords, Trophy, LayoutGrid, Target, BookOpen } from 'lucide-react'
import Link from 'next/link'

const menuCards = [
  {
    href: '/guild-war',
    icon: Swords,
    title: '길드전',
    description: '방어팀별 공격덱 & 전적 기록',
    from: '#1a1040',
    to: '#2d1b6e',
    border: 'border-purple-700/40',
    iconColor: 'text-purple-300',
  },
  {
    href: '/ranking',
    icon: Trophy,
    title: '랭킹',
    description: '길드전 · 공성전 · 파괴신 랭킹',
    from: '#1c1200',
    to: '#3d2800',
    border: 'border-amber-700/40',
    iconColor: 'text-amber-300',
  },
  {
    href: '/deck-plan',
    icon: LayoutGrid,
    title: '덱편성',
    description: '팀별 공/방 배정 및 반지 관리',
    from: '#001428',
    to: '#002a50',
    border: 'border-blue-700/40',
    iconColor: 'text-blue-300',
  },
  {
    href: '/totalwar',
    icon: Target,
    title: '총력전',
    description: '총력전 공략 및 기록',
    from: '#1a0800',
    to: '#3d1500',
    border: 'border-orange-700/40',
    iconColor: 'text-orange-300',
  },
  {
    href: '/pve',
    icon: BookOpen,
    title: 'PVE 공략',
    description: '스테이지별 공략 정보',
    from: '#001a0e',
    to: '#003320',
    border: 'border-emerald-700/40',
    iconColor: 'text-emerald-300',
  },
]

export default function HomePage() {
  const { data: session } = useSession()

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto">
      {/* 인사말 */}
      <div className="mb-8 pt-2">
        <p className="text-amber-500 text-sm font-medium tracking-widest uppercase mb-1">Seven Knights Reverse</p>
        <h2 className="text-2xl font-bold text-white">
          {session?.user?.name}님, 환영합니다
        </h2>
        <p className="text-slate-500 mt-1 text-sm">불굴 길드 전용 공략 서비스</p>
      </div>

      {/* 메뉴 카드 그리드 */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {menuCards.map(({ href, icon: Icon, title, description, from, to, border, iconColor }) => (
          <Link
            key={href}
            href={href}
            style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
            className={`rounded-2xl p-5 flex flex-col gap-3 border ${border} hover:brightness-125 transition-all`}
          >
            <Icon size={26} className={iconColor} />
            <div>
              <p className="text-white font-semibold text-sm">{title}</p>
              <p className="text-slate-400 text-xs mt-0.5 leading-relaxed">{description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
