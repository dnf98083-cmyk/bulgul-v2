'use client'

import { useEffect, useState, useMemo, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { supabase } from '@/lib/supabase/client'
import { ChevronDown, Swords, Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { FormationGrid } from '@/components/FormationGrid'

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

type SortKey = 'winRate' | 'usage' | 'games'

function pct(win: number, lose: number) {
  const t = win + lose
  return t === 0 ? null : Math.round(win / t * 100)
}

// V1 방식: 이름·반지·진형·펫·장비·스킬·캐릭터 전체에서 검색
function matches(atk: AttackTeam, q: string): boolean {
  const hay = [atk.name, atk.ring, atk.formation, atk.pet, atk.armor, atk.skill, ...(atk.characters ?? [])]
    .filter(Boolean).join(' ').toLowerCase()
  return hay.includes(q.toLowerCase())
}

export default function GuildWarPage() {
  const { data: session } = useSession()
  const isAdmin = ['관리자', '연구원'].includes((session?.user as any)?.role)

  const [defenseTeams, setDefenseTeams] = useState<DefenseTeam[]>([])
  const [allAttacks, setAllAttacks]     = useState<AttackTeam[]>([])
  const [loading, setLoading]           = useState(true)

  const [charSearch, setCharSearch]     = useState('')
  const [selectedDef, setSelectedDef]   = useState<DefenseTeam | null>(null)
  const [selectedAtk, setSelectedAtk]   = useState<AttackTeam | null>(null)
  const [defSearch, setDefSearch]       = useState('')
  const [showDrop, setShowDrop]         = useState(false)
  const [sort, setSort]                 = useState<SortKey>('winRate')

  const dropRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setShowDrop(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

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
    defSearch.trim() ? defsWithStats.filter(d => d.name.includes(defSearch)) : defsWithStats,
  [defsWithStats, defSearch])

  const isSearch = charSearch.trim().length > 0

  const displayAttacks = useMemo<AttackTeam[]>(() => {
    const q = charSearch.trim()
    if (q) return allAttacks.filter(a => matches(a, q))
    if (!selectedDef) return []
    const atks = allAttacks.filter(a => a.defense_team_id === selectedDef.id)
    return [...atks].sort((a, b) => {
      if (sort === 'winRate') return (pct(b.win, b.lose) ?? -1) - (pct(a.win, a.lose) ?? -1)
      return (b.win + b.lose) - (a.win + a.lose)
    })
  }, [charSearch, selectedDef, allAttacks, sort])

  // selectedAtk가 현재 목록에 없으면 null 처리
  const validAtk = selectedAtk && displayAttacks.find(a => a.id === selectedAtk.id)
    ? selectedAtk : null

  async function recordResult(atkId: string, result: 'win' | 'lose') {
    const atk = allAttacks.find(a => a.id === atkId)
    if (!atk) return
    const update = result === 'win' ? { win: atk.win + 1 } : { lose: atk.lose + 1 }
    await supabase.from('attack_teams').update(update).eq('id', atkId)
    setAllAttacks(prev => prev.map(a => a.id === atkId ? { ...a, ...update } : a))
    setSelectedAtk(prev => prev?.id === atkId ? { ...prev, ...update } : prev)
  }

  function selectDef(def: DefWithStats) {
    setSelectedDef(def)
    setSelectedAtk(null)
    setShowDrop(false)
    setDefSearch('')
    setCharSearch('')
  }

  if (loading) return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <p className="text-slate-500 text-center py-16">불러오는 중...</p>
    </div>
  )

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-5">
        <Swords size={22} className="text-amber-400" />
        <h1 className="text-xl font-bold text-white">길드전 공격</h1>
        <span className="ml-auto text-sm text-slate-500">{defenseTeams.length}개 방어팀</span>
      </div>

      {/* 전체 검색 (V1: 이름·반지·진형·펫·장비·스킬·캐릭터) */}
      <div className="relative mb-3">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
        <input
          type="text"
          value={charSearch}
          onChange={e => { setCharSearch(e.target.value); setSelectedDef(null); setSelectedAtk(null) }}
          placeholder="이름 · 캐릭터 · 반지 · 진형 · 펫 · 장비로 검색..."
          className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-[#0f0f26] border border-amber-900/20 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-amber-500/40"
        />
        {charSearch && (
          <button
            onClick={() => { setCharSearch(''); setSelectedAtk(null) }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* 방어팀 드롭다운 */}
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
          {([['winRate', '승률순'], ['usage', '사용횟수'], ['games', '전적순']] as [SortKey, string][]).map(([key, label]) => (
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
            onClick={() => { setSelectedDef(null); setSelectedAtk(null) }}
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

      {/* 메인: 컴팩트 버튼 목록 + 상세 카드 (V1 2-컬럼) */}
      {!isSearch && !selectedDef ? (
        <p className="text-slate-600 text-center py-12 text-sm">방어팀을 선택하거나 검색하세요</p>
      ) : displayAttacks.length === 0 ? (
        <p className="text-slate-600 text-center py-12 text-sm">결과가 없어요</p>
      ) : (
        <div className="md:grid md:grid-cols-[1fr_340px] md:gap-4 md:items-start">
          {/* 왼쪽: 컴팩트 공격덱 버튼 목록 */}
          <div className="grid grid-cols-2 gap-2 mb-4 md:mb-0">
            {displayAttacks.map(atk => {
              const p = pct(atk.win, atk.lose)
              const isHot    = p !== null && p >= 70
              const isActive = validAtk?.id === atk.id
              const defTeam  = isSearch ? defenseTeams.find(d => d.id === atk.defense_team_id) : null

              return (
                <button
                  key={atk.id}
                  onClick={() => setSelectedAtk(isActive ? null : atk)}
                  className={cn(
                    'text-left p-3 rounded-xl border transition-colors',
                    isActive
                      ? 'bg-amber-500/10 border-amber-500/40'
                      : 'bg-[#0f0f26] border-amber-900/20 hover:border-amber-500/25'
                  )}
                >
                  {defTeam && (
                    <p className="text-[10px] text-amber-600/80 font-medium mb-0.5">{defTeam.name}</p>
                  )}
                  <p className="text-sm font-bold text-white leading-tight">
                    {isHot && <span className="text-orange-400">🔥 </span>}
                    {atk.name}
                  </p>
                  {atk.type && (
                    <span className={cn(
                      'inline-block text-[9px] font-bold px-1.5 py-0.5 rounded-full border mt-1',
                      TYPE_STYLE[atk.type] || 'bg-slate-500/15 text-slate-400 border-slate-500/30'
                    )}>
                      {atk.type}
                    </span>
                  )}
                  <p className="text-xs text-slate-500 mt-1">
                    {p !== null ? `${p}%` : '-'} · {atk.win}승{atk.lose}패
                  </p>
                </button>
              )
            })}
          </div>

          {/* 오른쪽: 상세 카드 */}
          {validAtk ? (
            <div className="sticky top-4">
              <AttackDetailCard
                atk={validAtk}
                isAdmin={isAdmin}
                onRecord={recordResult}
                onClose={() => setSelectedAtk(null)}
              />
            </div>
          ) : (
            <div className="hidden md:flex items-center justify-center h-40 rounded-xl border border-amber-900/10 text-slate-600 text-sm">
              공격덱을 선택하세요
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── 공격 상세 카드 ─────────────────────────────────────────────────────────
function AttackDetailCard({
  atk, isAdmin, onRecord, onClose,
}: {
  atk: AttackTeam
  isAdmin: boolean
  onRecord: (id: string, result: 'win' | 'lose') => void
  onClose: () => void
}) {
  const p     = pct(atk.win, atk.lose)
  const isHot = p !== null && p >= 70

  return (
    <div className="bg-[#0f0f26] border border-amber-500/20 rounded-xl p-4">
      {/* 헤더: 이름 + 승률 */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-white font-bold text-base leading-tight">
            {isHot && <span className="text-orange-400">🔥 </span>}
            {atk.name}
          </p>
          <p className="text-sm text-slate-400 mt-0.5">{atk.win}승 {atk.lose}패</p>
        </div>
        <div className="flex items-start gap-2">
          {p !== null && (
            <div className="text-right">
              <p className="text-2xl font-black text-amber-400 leading-none">{p}%</p>
              <p className="text-[9px] text-slate-500 mt-0.5">승률</p>
            </div>
          )}
          <button onClick={onClose} className="text-slate-600 hover:text-slate-400 mt-0.5">
            <X size={16} />
          </button>
        </div>
      </div>

      {/* 타입 배지 */}
      {atk.type && (
        <span className={cn(
          'inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border mb-3',
          TYPE_STYLE[atk.type] || 'bg-slate-500/15 text-slate-400 border-slate-500/30'
        )}>
          {atk.type}
        </span>
      )}

      {/* 캐릭터 칩 */}
      {atk.characters?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {atk.characters.map((c, i) => (
            <span key={i} className="text-xs px-2 py-0.5 rounded-md bg-[#16163a] text-slate-300">{c}</span>
          ))}
        </div>
      )}

      {/* 진형 비주얼 (V1 스타일) */}
      {atk.formation && (
        <div className="mb-3">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide mb-2">진형</p>
          <FormationGrid text={atk.formation} />
        </div>
      )}

      {/* 나머지 세팅 */}
      <div className="space-y-1.5 text-xs mb-3">
        {atk.ring  && <p><span className="text-slate-600 w-10 inline-block">반지</span> <span className="text-slate-300">{atk.ring}</span></p>}
        {atk.skill && <p><span className="text-slate-600 w-10 inline-block">스킬순</span> <span className="text-slate-300">{atk.skill}</span></p>}
        {atk.pet   && <p><span className="text-slate-600 w-10 inline-block">펫</span> <span className="text-slate-300">{atk.pet}</span></p>}
        {atk.armor && (
          <p className="text-slate-300 whitespace-pre-line border-t border-amber-900/10 pt-2 mt-2">
            {atk.armor}
          </p>
        )}
      </div>

      {/* 관리자: 승패 버튼 */}
      {isAdmin && (
        <div className="flex gap-2 pt-3 border-t border-amber-900/10">
          <button
            onClick={() => onRecord(atk.id, 'win')}
            className="flex-1 py-2.5 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25 transition-colors text-sm font-bold"
          >
            🏆 승
          </button>
          <button
            onClick={() => onRecord(atk.id, 'lose')}
            className="flex-1 py-2.5 rounded-lg bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25 transition-colors text-sm font-bold"
          >
            💀 패
          </button>
        </div>
      )}
    </div>
  )
}
