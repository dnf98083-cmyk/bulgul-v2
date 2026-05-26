'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { Swords, Trophy, LayoutGrid, Target, BookOpen, TrendingUp, Shield, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

const DAY_KO = ['일', '월', '화', '수', '목', '금', '토'] as const


type AttackTeam = { win: number; lose: number }
type DefenseTeam = { id: string }
type PveScore = { id: string; nickname: string; score: number }

function fmtScore(n: number) { return n.toLocaleString('ko-KR') }

export default function HomePage() {
  const { data: session } = useSession()
  const todayKo = DAY_KO[new Date().getDay()]

  const [defCount, setDefCount]       = useState<number | null>(null)
  const [attacks, setAttacks]         = useState<AttackTeam[]>([])
  const [todayScores, setTodayScores] = useState<PveScore[]>([])
  const [loading, setLoading]         = useState(true)

  useEffect(() => {
    const todayKey = todayKo
    Promise.all([
      supabase.from('defense_teams').select('id'),
      supabase.from('attack_teams').select('win, lose'),
      supabase.from('pve_scores')
        .select('id, nickname, score')
        .eq('type', 'siege')
        .eq('key', todayKey)
        .eq('season', 'this')
        .order('score', { ascending: false })
        .limit(3),
    ]).then(([{ data: defs }, { data: atks }, { data: scores }]) => {
      if (defs) setDefCount((defs as DefenseTeam[]).length)
      if (atks) setAttacks(atks as AttackTeam[])
      if (scores) setTodayScores(scores as PveScore[])
      setLoading(false)
    })
  }, [todayKo])

  const totalWin  = attacks.reduce((s, a) => s + a.win,  0)
  const totalLose = attacks.reduce((s, a) => s + a.lose, 0)
  const totalGames = totalWin + totalLose
  const winRate = totalGames > 0 ? Math.round(totalWin / totalGames * 100) : null

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto">
      {/* 인사말 */}
      <div className="mb-6 pt-2">
        <p className="text-amber-500 text-xs font-semibold tracking-widest uppercase mb-1">Seven Knights Reverse</p>
        <h2 className="text-2xl font-bold text-white">
          {session?.user?.name}님, 환영합니다
        </h2>
        <p className="text-slate-500 mt-1 text-sm">불굴 길드 전용 공략 서비스</p>
      </div>

      {/* 길드 현황 위젯 */}
      <div className="grid grid-cols-3 gap-2 mb-5">
        <div className="bg-[#0f0f26] border border-amber-900/15 rounded-xl p-3 text-center">
          <Shield size={16} className="text-purple-400 mx-auto mb-1" />
          <p className="text-lg font-black text-white">
            {loading ? '—' : defCount ?? '—'}
          </p>
          <p className="text-[10px] text-slate-500">방어팀</p>
        </div>
        <div className="bg-[#0f0f26] border border-amber-900/15 rounded-xl p-3 text-center">
          <Zap size={16} className="text-amber-400 mx-auto mb-1" />
          <p className="text-lg font-black text-white">
            {loading ? '—' : winRate !== null ? `${winRate}%` : '—'}
          </p>
          <p className="text-[10px] text-slate-500">길드전 승률</p>
        </div>
        <div className="bg-[#0f0f26] border border-amber-900/15 rounded-xl p-3 text-center">
          <TrendingUp size={16} className="text-emerald-400 mx-auto mb-1" />
          <p className="text-lg font-black text-white">
            {loading ? '—' : totalGames}
          </p>
          <p className="text-[10px] text-slate-500">총 기록 전적</p>
        </div>
      </div>

      {/* 오늘의 공성전 top 3 */}
      <div className="bg-[#0f0f26] border border-amber-900/15 rounded-xl p-4 mb-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-bold text-slate-400">
            ⚔️ 오늘의 공성전 <span className="text-amber-400">{todayKo}요일</span> TOP 3
          </p>
          <Link href="/pve" className="text-[10px] text-slate-600 hover:text-slate-400 transition-colors">
            더보기 →
          </Link>
        </div>
        {loading ? (
          <p className="text-slate-600 text-xs text-center py-2">불러오는 중...</p>
        ) : todayScores.length === 0 ? (
          <p className="text-slate-600 text-xs text-center py-2">오늘 등록된 점수가 없어요</p>
        ) : (
          <div className="space-y-1.5">
            {todayScores.map((s, i) => (
              <div key={s.id} className="flex items-center gap-3">
                <span className={cn(
                  'text-xs font-bold w-5 text-center shrink-0',
                  i === 0 ? 'text-amber-400' : i === 1 ? 'text-slate-400' : 'text-amber-700'
                )}>
                  {i + 1}
                </span>
                <span className="flex-1 text-sm text-white">{s.nickname}</span>
                <span className="text-sm font-bold text-emerald-400 font-mono">{fmtScore(s.score)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 길드전 전적 요약 */}
      {!loading && totalGames > 0 && (
        <div className="bg-[#0f0f26] border border-amber-900/15 rounded-xl p-4 mb-5">
          <p className="text-xs font-bold text-slate-400 mb-3">⚔️ 길드전 전체 전적</p>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-[#0c0c1e] rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all"
                style={{ width: `${winRate ?? 0}%` }}
              />
            </div>
            <span className="text-sm font-bold text-emerald-400 w-12 text-right">{winRate}%</span>
          </div>
          <div className="flex gap-4 mt-2 text-xs text-slate-500">
            <span className="text-emerald-400 font-medium">{totalWin}승</span>
            <span className="text-red-400 font-medium">{totalLose}패</span>
            <span className="ml-auto">{totalGames}전</span>
          </div>
        </div>
      )}

      {/* 메뉴 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {[
          { href: '/guild-war', icon: Swords,     title: '길드전',   desc: '방어팀별 공격덱 & 전적',    from: '#1a1040', to: '#2d1b6e', border: 'border-purple-700/40', ic: 'text-purple-300' },
          { href: '/pve',       icon: BookOpen,    title: 'PVE 공략', desc: '공성전 · 강림 · 레이드 빌드', from: '#001a0e', to: '#003320', border: 'border-emerald-700/40', ic: 'text-emerald-300' },
          { href: '/ranking',   icon: Trophy,      title: '랭킹',     desc: '공성전 · 파괴신 랭킹',       from: '#1c1200', to: '#3d2800', border: 'border-amber-700/40',   ic: 'text-amber-300' },
          { href: '/deck-plan', icon: LayoutGrid,  title: '덱편성',   desc: '공/방 배정 및 반지 관리',    from: '#001428', to: '#002a50', border: 'border-blue-700/40',   ic: 'text-blue-300' },
          { href: '/totalwar',  icon: Target,      title: '총력전',   desc: '총력전 공략 및 기록',        from: '#1a0800', to: '#3d1500', border: 'border-orange-700/40', ic: 'text-orange-300' },
        ].map(({ href, icon: Icon, title, desc, from, to, border, ic }) => (
          <Link
            key={href}
            href={href}
            style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
            className={`rounded-2xl p-4 flex flex-col gap-2.5 border ${border} hover:brightness-125 transition-all`}
          >
            <Icon size={22} className={ic} />
            <div>
              <p className="text-white font-semibold text-sm">{title}</p>
              <p className="text-slate-400 text-xs mt-0.5 leading-relaxed">{desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
