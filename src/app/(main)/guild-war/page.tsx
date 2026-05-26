'use client'

import { useEffect, useState, useMemo, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { supabase } from '@/lib/supabase/client'
import { ChevronDown, Swords, Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'

type DefenseTeam = { id: string; name: string; order_idx: number }
type AttackTeam = {
  id: string
  defense_team_id: string
  name: string
  characters: string[]
  formation: string
  type: string
  ring: string
  skill: string
  pet: string
  armor: string
  win: number
  lose: number
}
type DefWithStats = DefenseTeam & { totalWin: number; totalLose: number; winRate: number }

const TYPE_STYLE: Record<string, string> = {
  '확실한 승': 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  '내줘도 됨':  'bg-blue-500/15    text-blue-400    border-blue-500/30',
  '위험':       'bg-red-500/15     text-red-400     border-red-500/30',
  '보통':       'bg-slate-500/15   text-slate-400   border-slate-500/30',
}

type SortKey = 'winRate' | 'usage' | 'wins'

function pct(win: number, lose: number) {
  const t = win + lose
  return t === 0 ? null : Math.round(win / t * 100)
}

export default function GuildWarPage() {
  const { data: session } = useSession()
  const isAdmin = ['관리자', '연구원'].includes((session?.user as any)?.role)

  const [defenseTeams, setDefenseTeams]     = useState<DefenseTeam[]>([])
  const [allAttacks, setAllAttacks]         = useState<AttackTeam[]>([])
  const [loading, setLoading]               = useState(true)

  const [charSearch, setCharSearch]         = useState('')
  const [selectedDef, setSelectedDef]       = useState<DefenseTeam | null>(null)
  const [defSearch, setDefSearch]           = useState('')
  const [showDrop, setShowDrop]             = useState(false)
  const [sort, setSort]                     = useState<SortKey>('winRate')

  const dropRef = useRef<HTMLDivElement>(null)

  // 드롭다운 바깥 클릭 시 닫기
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setShowDrop(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // 전체 데이터 한 번에 로드
  useEffect(() => {
    Promise.all([
      supabase.from('defense_teams').select('*').order('order_idx'),
      supabase.from('attack_teams').select('*'),
    ]).then(([{ data: defs }, { data: atks }]) => {
      if (defs) setDefenseTeams(defs)
      if (atks) setAllAttacks(atks)
      setLoading(false)
    })
  }, [])

  // 방어팀 + 통계
  const defsWithStats = useMemo<DefWithStats[]>(() =>
    defenseTeams.map(def => {
      const atks = allAttacks.filter(a => a.defense_team_id === def.id)
      const totalWin  = atks.reduce((s, a) => s + a.win, 0)
      const totalLose = atks.reduce((s, a) => s + a.lose, 0)
      const t = totalWin + totalLose
      return { ...def, totalWin, totalLose, winRate: t > 0 ? totalWin / t : 0 }
    }),
  [defenseTeams, allAttacks])

  const filteredDefs = useMemo(() =>
    defSearch.trim()
      ? defsWithStats.filter(d => d.name.includes(defSearch))
      : defsWithStats,
  [defsWithStats, defSearch])

  // 표시할 공격팀 목록
  const displayAttacks = useMemo<AttackTeam[]>(() => {
    const q = charSearch.trim()
    if (q) {
      // 캐릭터 검색: 전체 공격덱에서 검색
      return allAttacks.filter(a =>
        a.characters?.some(c => c.includes(q))
      )
    }
    if (!selectedDef) return []
    const atks = allAttacks.filter(a => a.defense_team_id === selectedDef.id)
    return [...atks].sort((a, b) => {
      if (sort === 'winRate') {
        const ap = pct(a.win, a.lose) ?? -1
        const bp = pct(b.win, b.lose) ?? -1
        return bp - ap
      }
      if (sort === 'usage') return (b.win + b.lose) - (a.win + a.lose)
      return b.win - a.win
    })
  }, [charSearch, selectedDef, allAttacks, sort])

  async function recordResult(atkId: string, result: 'win' | 'lose') {
    const atk = allAttacks.find(a => a.id === atkId)
    if (!atk) return
    const update = result === 'win' ? { win: atk.win + 1 } : { lose: atk.lose + 1 }
    await supabase.from('attack_teams').update(update).eq('id', atkId)
    setAllAttacks(prev => prev.map(a => a.id === atkId ? { ...a, ...update } : a))
  }

  function selectDef(def: DefWithStats) {
    setSelectedDef(def)
    setShowDrop(false)
    setDefSearch('')
    setCharSearch('')
  }

  const isSearch = charSearch.trim().length > 0

  if (loading) return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto">
      <p className="text-slate-500 text-center py-16">불러오는 중...</p>
    </div>
  )

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto">
      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-5">
        <Swords size={22} className="text-amber-400" />
        <h1 className="text-xl font-bold text-white">길드전 공격</h1>
        <span className="ml-auto text-sm text-slate-500">{defenseTeams.length}개 방어팀</span>
      </div>

      {/* 캐릭터 검색 */}
      <div className="relative mb-3">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
        <input
          type="text"
          value={charSearch}
          onChange={e => { setCharSearch(e.target.value); setSelectedDef(null) }}
          placeholder="캐릭터로 공격덱 검색..."
          className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-[#0f0f26] border border-amber-900/20 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-amber-500/40"
        />
        {charSearch && (
          <button
            onClick={() => setCharSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* 방어팀 드롭다운 (검색 모드 아닐 때) */}
      {!isSearch && (
        <div ref={dropRef} className="relative mb-4">
          <button
            onClick={() => setShowDrop(v => !v)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-[#0f0f26] border border-amber-900/20 hover:border-amber-500/30 transition-colors text-sm"
          >
            <span className={selectedDef ? 'text-white font-medium' : 'text-slate-500'}>
              {selectedDef ? selectedDef.name : '방어팀 선택'}
            </span>
            <div className="flex items-center gap-2">
              {selectedDef && (() => {
                const stats = defsWithStats.find(d => d.id === selectedDef.id)
                const p = stats ? pct(stats.totalWin, stats.totalLose) : null
                return p !== null
                  ? <span className="text-xs text-slate-500">{p}% · {stats!.totalWin}승{stats!.totalLose}패</span>
                  : null
              })()}
              <ChevronDown size={16} className={cn('text-slate-500 transition-transform', showDrop && 'rotate-180')} />
            </div>
          </button>

          {showDrop && (
            <div className="absolute z-50 w-full mt-1 rounded-xl bg-[#16163a] border border-amber-900/20 shadow-2xl overflow-hidden">
              <div className="p-2 border-b border-amber-900/10">
                <input
                  type="text"
                  value={defSearch}
                  onChange={e => setDefSearch(e.target.value)}
                  placeholder="검색..."
                  autoFocus
                  className="w-full px-3 py-1.5 rounded-lg bg-[#0f0f26] text-white text-sm placeholder-slate-600 focus:outline-none border border-amber-900/20 focus:border-amber-500/30"
                />
              </div>
              <ul className="max-h-64 overflow-y-auto">
                {filteredDefs.map(def => (
                  <li key={def.id}>
                    <button
                      onMouseDown={() => selectDef(def)}
                      className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-amber-500/5 transition-colors"
                    >
                      <span className="text-sm text-white text-left">{def.name}</span>
                      {def.totalWin + def.totalLose > 0 && (
                        <span className="text-xs text-slate-500 shrink-0 ml-3">
                          {Math.round(def.winRate * 100)}% · {def.totalWin}승{def.totalLose}패
                        </span>
                      )}
                    </button>
                  </li>
                ))}
                {filteredDefs.length === 0 && (
                  <li className="px-4 py-4 text-sm text-slate-600 text-center">결과 없음</li>
                )}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* 정렬 + 선택 해제 */}
      {selectedDef && !isSearch && (
        <div className="flex items-center gap-2 mb-4">
          {([['winRate', '승률순'], ['usage', '사용횟수'], ['wins', '승수순']] as [SortKey, string][]).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setSort(key)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors',
                sort === key
                  ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                  : 'text-slate-500 border-slate-800 hover:text-slate-300'
              )}
            >
              {label}
            </button>
          ))}
          <button
            onClick={() => setSelectedDef(null)}
            className="ml-auto flex items-center gap-1 text-xs text-slate-600 hover:text-slate-400 transition-colors"
          >
            <X size={12} /> 해제
          </button>
        </div>
      )}

      {/* 검색 결과 헤더 */}
      {isSearch && (
        <p className="text-sm text-slate-500 mb-3">
          <span className="text-amber-400 font-medium">"{charSearch}"</span> 검색결과 {displayAttacks.length}개
        </p>
      )}

      {/* 공격덱 목록 */}
      {!isSearch && !selectedDef ? (
        <p className="text-slate-600 text-center py-12 text-sm">방어팀을 선택하거나 캐릭터명으로 검색하세요</p>
      ) : displayAttacks.length === 0 ? (
        <p className="text-slate-600 text-center py-12 text-sm">결과가 없어요</p>
      ) : (
        <div className="space-y-3">
          {displayAttacks.map(atk => {
            const defTeam = isSearch ? defenseTeams.find(d => d.id === atk.defense_team_id) : null
            const p = pct(atk.win, atk.lose)
            return (
              <div key={atk.id} className="bg-[#0f0f26] border border-amber-900/20 rounded-xl p-4">
                {/* 검색 모드: 방어팀 이름 표시 */}
                {defTeam && (
                  <p className="text-[11px] text-amber-600/80 font-medium mb-1.5">{defTeam.name}</p>
                )}

                {/* 공격팀 이름 + 타입 */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <p className="text-white font-semibold text-sm">{atk.name}</p>
                  {atk.type && (
                    <span className={cn(
                      'text-[10px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap shrink-0',
                      TYPE_STYLE[atk.type] || 'bg-slate-500/15 text-slate-400 border-slate-500/30'
                    )}>
                      {atk.type}
                    </span>
                  )}
                </div>

                {/* 캐릭터 — 검색어 매칭 하이라이트 */}
                {atk.characters?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {atk.characters.map((c, i) => (
                      <span
                        key={i}
                        className={cn(
                          'text-xs px-2 py-0.5 rounded-md',
                          isSearch && c.includes(charSearch)
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-[#16163a] text-slate-300'
                        )}
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                )}

                {/* 세팅 정보 */}
                <div className="space-y-1 text-xs">
                  {atk.formation && <p><span className="text-slate-600">진형</span> <span className="text-slate-400">{atk.formation}</span></p>}
                  {atk.ring      && <p><span className="text-slate-600">반지</span> <span className="text-slate-400">{atk.ring}</span></p>}
                  {atk.skill     && <p><span className="text-slate-600">스킬순</span> <span className="text-slate-400">{atk.skill}</span></p>}
                  {atk.pet       && <p><span className="text-slate-600">펫</span> <span className="text-slate-400">{atk.pet}</span></p>}
                  {atk.armor     && (
                    <p className="text-slate-400 whitespace-pre-line border-t border-amber-900/10 pt-2 mt-2">
                      {atk.armor}
                    </p>
                  )}
                </div>

                {/* 승패 + 승률 */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-amber-900/10">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-emerald-400 font-bold">{atk.win}승</span>
                    <span className="text-slate-600">|</span>
                    <span className="text-red-400 font-bold">{atk.lose}패</span>
                    {p !== null && (
                      <span className="text-slate-500 text-xs">({p}%)</span>
                    )}
                  </div>
                  {isAdmin && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => recordResult(atk.id, 'win')}
                        className="text-xs px-3 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25 transition-colors font-medium"
                      >승</button>
                      <button
                        onClick={() => recordResult(atk.id, 'lose')}
                        className="text-xs px-3 py-1 rounded-lg bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25 transition-colors font-medium"
                      >패</button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
