'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { supabase } from '@/lib/supabase/client'
import { ChevronLeft, Swords, Trophy, Shield, AlertTriangle } from 'lucide-react'
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

const TYPE_STYLE: Record<string, string> = {
  '확실한 승': 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  '내줘도 됨':  'bg-blue-500/15    text-blue-400    border-blue-500/30',
  '위험':       'bg-red-500/15     text-red-400     border-red-500/30',
  '보통':       'bg-slate-500/15   text-slate-400   border-slate-500/30',
}

export default function GuildWarPage() {
  const { data: session } = useSession()
  const myRole = (session?.user as any)?.role
  const isAdmin = myRole === '관리자' || myRole === '연구원'

  const [defenseTeams, setDefenseTeams] = useState<DefenseTeam[]>([])
  const [selectedDef, setSelectedDef] = useState<DefenseTeam | null>(null)
  const [attackTeams, setAttackTeams] = useState<AttackTeam[]>([])
  const [loading, setLoading] = useState(true)
  const [atkLoading, setAtkLoading] = useState(false)

  useEffect(() => {
    supabase
      .from('defense_teams')
      .select('*')
      .order('order_idx')
      .then(({ data }) => {
        if (data) setDefenseTeams(data)
        setLoading(false)
      })
  }, [])

  async function selectDefense(def: DefenseTeam) {
    setSelectedDef(def)
    setAtkLoading(true)
    const { data } = await supabase
      .from('attack_teams')
      .select('*')
      .eq('defense_team_id', def.id)
      .order('win', { ascending: false })
    if (data) setAttackTeams(data)
    setAtkLoading(false)
  }

  async function recordResult(atkId: string, result: 'win' | 'lose') {
    const atk = attackTeams.find(a => a.id === atkId)
    if (!atk) return
    const update = result === 'win'
      ? { win: atk.win + 1 }
      : { lose: atk.lose + 1 }
    await supabase.from('attack_teams').update(update).eq('id', atkId)
    setAttackTeams(prev =>
      prev.map(a => a.id === atkId ? { ...a, ...update } : a)
    )
  }

  // ── 방어팀 목록 화면 ──────────────────────────
  if (!selectedDef) {
    return (
      <div className="p-4 md:p-8 max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Swords size={22} className="text-amber-400" />
          <h1 className="text-xl font-bold text-white">길드전 공격</h1>
          <span className="ml-auto text-sm text-slate-500">{defenseTeams.length}개 방어팀</span>
        </div>

        {loading ? (
          <p className="text-slate-500 text-center py-16">불러오는 중...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {defenseTeams.map(def => (
              <button
                key={def.id}
                onClick={() => selectDefense(def)}
                className="text-left bg-[#0f0f26] border border-amber-900/20 rounded-xl px-4 py-3.5 hover:border-amber-500/40 hover:bg-amber-500/5 transition-all group"
              >
                <p className="text-white font-medium text-sm group-hover:text-amber-300 transition-colors">
                  {def.name}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  // ── 공격팀 목록 화면 ──────────────────────────
  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto">
      {/* 헤더 */}
      <button
        onClick={() => setSelectedDef(null)}
        className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm mb-4 transition-colors"
      >
        <ChevronLeft size={18} /> 방어팀 목록
      </button>
      <div className="mb-6">
        <p className="text-amber-500 text-xs font-medium mb-1">방어팀</p>
        <h2 className="text-xl font-bold text-white">{selectedDef.name}</h2>
      </div>

      {atkLoading ? (
        <p className="text-slate-500 text-center py-16">불러오는 중...</p>
      ) : attackTeams.length === 0 ? (
        <p className="text-slate-600 text-center py-16">등록된 공격덱이 없어요</p>
      ) : (
        <div className="space-y-3">
          {attackTeams.map(atk => (
            <div
              key={atk.id}
              className="bg-[#0f0f26] border border-amber-900/20 rounded-xl p-4"
            >
              {/* 공격팀 이름 + 타입 */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <p className="text-white font-semibold text-sm">{atk.name}</p>
                {atk.type && (
                  <span className={cn(
                    'text-[10px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap',
                    TYPE_STYLE[atk.type] || 'bg-slate-500/15 text-slate-400 border-slate-500/30'
                  )}>
                    {atk.type}
                  </span>
                )}
              </div>

              {/* 캐릭터 목록 */}
              {atk.characters?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {atk.characters.map((c, i) => (
                    <span key={i} className="text-xs bg-[#16163a] text-slate-300 px-2 py-0.5 rounded-md">
                      {c}
                    </span>
                  ))}
                </div>
              )}

              {/* 세팅 정보 */}
              <div className="space-y-1 text-xs text-slate-500">
                {atk.formation && <p><span className="text-slate-600">진형</span> <span className="text-slate-400">{atk.formation}</span></p>}
                {atk.ring      && <p><span className="text-slate-600">반지</span> <span className="text-slate-400">{atk.ring}</span></p>}
                {atk.skill     && <p><span className="text-slate-600">스킬순</span> <span className="text-slate-400">{atk.skill}</span></p>}
                {atk.pet       && <p><span className="text-slate-600">펫</span> <span className="text-slate-400">{atk.pet}</span></p>}
                {atk.armor     && (
                  <p className="text-slate-500 leading-relaxed whitespace-pre-line border-t border-amber-900/10 pt-2 mt-2">
                    {atk.armor}
                  </p>
                )}
              </div>

              {/* 승패 */}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-amber-900/10">
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-emerald-400 font-bold">{atk.win}승</span>
                  <span className="text-slate-600">|</span>
                  <span className="text-red-400 font-bold">{atk.lose}패</span>
                </div>
                {isAdmin && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => recordResult(atk.id, 'win')}
                      className="text-xs px-3 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25 transition-colors font-medium"
                    >
                      승
                    </button>
                    <button
                      onClick={() => recordResult(atk.id, 'lose')}
                      className="text-xs px-3 py-1 rounded-lg bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25 transition-colors font-medium"
                    >
                      패
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
