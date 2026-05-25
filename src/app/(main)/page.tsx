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
    color: 'from-blue-600 to-blue-800',
  },
  {
    href: '/ranking',
    icon: Trophy,
    title: '랭킹',
    description: '길드전 · 공성전 · 파괴신 랭킹',
    color: 'from-yellow-600 to-yellow-800',
  },
  {
    href: '/deck-plan',
    icon: LayoutGrid,
    title: '덱편성',
    description: '팀별 공/방 배정 및 반지 관리',
    color: 'from-purple-600 to-purple-800',
  },
  {
    href: '/totalwar',
    icon: Target,
    title: '총력전',
    description: '총력전 공략 및 기록',
    color: 'from-red-600 to-red-800',
  },
  {
    href: '/pve',
    icon: BookOpen,
    title: 'PVE 공략',
    description: '스테이지별 공략 정보',
    color: 'from-green-600 to-green-800',
  },
]

export default function HomePage() {
  const { data: session } = useSession()

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto">
      {/* 인사말 */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white">
          안녕하세요, {session?.user?.name}님 👋
        </h2>
        <p className="text-gray-400 mt-1">불굴 길드 웹앱에 오신 걸 환영해요.</p>
      </div>

      {/* 메뉴 카드 그리드 */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {menuCards.map(({ href, icon: Icon, title, description, color }) => (
          <Link
            key={href}
            href={href}
            className={`bg-gradient-to-br ${color} rounded-2xl p-5 flex flex-col gap-3 hover:opacity-90 transition-opacity`}
          >
            <Icon size={28} className="text-white/80" />
            <div>
              <p className="text-white font-semibold">{title}</p>
              <p className="text-white/60 text-xs mt-0.5 leading-relaxed">{description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
