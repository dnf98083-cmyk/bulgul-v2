'use client'

import { useEffect, useState, useMemo, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { supabase } from '@/lib/supabase/client'
import { ChevronDown, Swords, Search, X, Plus, Send, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { FormationGrid } from '@/components/FormationGrid'
import { toast } from 'sonner'

type DefenseTeam = { id: string; name: string; order_idx: number }
type AttackTeam = {
  id: string; defense_team_id: string; name: string
  characters: string[]; formation: string; type: string
  ring: string; skill: string; pet: string; armor: string
  win: number; lose: number
}
type DefWithStats = DefenseTeam & { totalWin: number; totalLose: number; winRate: number }

const TYPE_OPTIONS = ['확실한 승', '내줘도 됨', '위험', '보통', '속공 따야 함'] as const
const TYPE_STYLE: Record<string, string> = {
  '확실한 승': 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  '내줘도 됨':  'bg-blue-500/15    text-blue-400    border-blue-500/30',
  '위험':       'bg-red-500/15     text-red-400     border-red-500/30',
  '보통':       'bg-slate-500/15   text-slate-400   border-slate-500/30',
}
type SortKey = 'winRate' | 'usage' | 'games'

function pct(win: number, lose: number) {
  const t = win + lose; return t === 0 ? null : Math.round(win / t * 100)
}

function matches(atk: AttackTeam, q: string): boolean {
  const hay = [atk.name, atk.ring, atk.formation, atk.pet, atk.armor, atk.skill, ...(atk.characters ?? [])]
    .filter(Boolean).join(' ').toLowerCase()
  return hay.includes(q.toLowerCase())
}

// ── 공격덱 추가 모달 ──────────────────────────────────────────────────────
function AddAttackModal({
  defenseTeams, onClose, onAdded,
}: {
  defenseTeams: DefenseTeam[]
  onClose: () => void
  onAdded: () => void
}) {
  const [defId, setDefId]         = useState(defenseTeams[0]?.id ?? '')
  const [name, setName]           = useState('')
  const [charsRaw, setCharsRaw]   = useState('')
  const [formation, setFormation] = useState('')
  const [type, setType]           = useState<string>(TYPE_OPTIONS[0])
  const [ring, setRing]           = useState('')
  const [pet, setPet]             = useState('')
  const [skill, setSkill]         = useState('')
  const [armor, setArmor]         = useState('')
  const [saving, setSaving]       = useState(false)

  async function save() {
    if (!name.trim() || !defId) return
    setSaving(true)
    const chars = charsRaw.split(/[,\s]+/).map(s => s.trim()).filter(Boolean)
    const { error } = await supabase.from('attack_teams').insert({
      defense_team_id: defId, name: name.trim(),
      characters: chars, formation, type, ring, pet, skill, armor,
      win: 0, lose: 0,
    })
    if (error) { toast.error('등록 실패: ' + error.message); setSaving(false); return }
    toast.success(`"${name}" 공격덱 등록 완료`)
    onAdded()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-black/60" onClick={onClose}>
      <div className="w-full md:max-w-lg bg-[#0f0f26] border border-amber-500/25 rounded-t-2xl md:rounded-2xl p-5 max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <p className="text-white font-bold">공격덱 추가</p>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300"><X size={18} /></button>
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-[10px] text-slate-500 font-bold mb-1">방어팀 *</p>
            <select value={defId} onChange={e => setDefId(e.target.value)}
              className="w-full bg-[#0c0c1e] border border-slate-700 rounded-lg px-2.5 py-2 text-sm text-slate-200 focus:outline-none">
              {defenseTeams.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-bold mb-1">공격덱 이름 *</p>
            <input value={name} onChange={e => setName(e.target.value)}
              className="w-full bg-[#0c0c1e] border border-slate-700 rounded-lg px-2.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500/50"
              placeholder="예: 프레이야 초선 레긴레이프" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-bold mb-1">캐릭터 (쉼표 또는 공백으로 구분)</p>
            <input value={charsRaw} onChange={e => setCharsRaw(e.target.value)}
              className="w-full bg-[#0c0c1e] border border-slate-700 rounded-lg px-2.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500/50"
              placeholder="예: 프레이야, 초선, 레긴레이프" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-bold mb-1">진형</p>
            <input value={formation} onChange={e => setFormation(e.target.value)}
              className="w-full bg-[#0c0c1e] border border-slate-700 rounded-lg px-2.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500/50"
              placeholder="예: 기본 레이첼 아라곤 트루드" />
            {formation && <div className="mt-1.5"><FormationGrid text={formation} /></div>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] text-slate-500 font-bold mb-1">유형</p>
              <select value={type} onChange={e => setType(e.target.value)}
                className="w-full bg-[#0c0c1e] border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-slate-200 focus:outline-none">
                {TYPE_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-bold mb-1">펫</p>
              <input value={pet} onChange={e => setPet(e.target.value)}
                className="w-full bg-[#0c0c1e] border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-slate-200 focus:outline-none"
                placeholder="펫 이름" />
            </div>
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-bold mb-1">반지</p>
            <input value={ring} onChange={e => setRing(e.target.value)}
              className="w-full bg-[#0c0c1e] border border-slate-700 rounded-lg px-2.5 py-2 text-sm text-slate-200 focus:outline-none"
              placeholder="반지 세팅" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-bold mb-1">스킬 순서</p>
            <input value={skill} onChange={e => setSkill(e.target.value)}
              className="w-full bg-[#0c0c1e] border border-slate-700 rounded-lg px-2.5 py-2 text-sm text-slate-200 focus:outline-none"
              placeholder="스킬 순서" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-bold mb-1">장비 세팅</p>
            <textarea rows={3} value={armor} onChange={e => setArmor(e.target.value)}
              className="w-full bg-[#0c0c1e] border border-slate-700 rounded-lg px-2.5 py-2 text-sm text-slate-200 focus:outline-none resize-y"
              placeholder="장비 세팅 설명" />
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <button onClick={() => void save()} disabled={saving || !name.trim()}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 hover:bg-amber-500/25 transition-colors disabled:opacity-50">
            <Check size={14} className="inline mr-1" />{saving ? '등록 중...' : '등록'}
          </button>
          <button onClick={onClose} className="px-4 py-2.5 rounded-xl text-sm text-slate-500 border border-slate-700 hover:text-slate-300 transition-colors">취소</button>
        </div>
      </div>
    </div>
  )
}

// ── 제보 모달 ────────────────────────────────────────────────────────────
function ReportModal({
  defenseTeams, onClose,
}: {
  defenseTeams: DefenseTeam[]
  session: { user?: { name?: string | null } } | null
  onClose: () => void
}) {
  const { data: session } = useSession()
  const [defId, setDefId]         = useState(defenseTeams[0]?.id ?? '')
  const [atkName, setAtkName]     = useState('')
  const [charsRaw, setCharsRaw]   = useState('')
  const [formation, setFormation] = useState('')
  const [ring, setRing]           = useState('')
  const [pet, setPet]             = useState('')
  const [skill, setSkill]         = useState('')
  const [armor, setArmor]         = useState('')
  const [result, setResult]       = useState<'win' | 'lose'>('win')
  const [note, setNote]           = useState('')
  const [saving, setSaving]       = useState(false)

  const selectedDef = defenseTeams.find(d => d.id === defId)

  async function submit() {
    if (!atkName.trim()) { toast.error('공격덱 이름을 입력해주세요'); return }
    setSaving(true)
    const chars = charsRaw.split(/[,\s]+/).map(s => s.trim()).filter(Boolean)
    const { error } = await supabase.from('attack_reports').insert({
      defense_team_id: defId || null,
      defense_name: selectedDef?.name ?? null,
      attack_name: atkName.trim(),
      characters: chars,
      formation, ring, pet, skill, armor,
      attack_type: '',
      result,
      nickname: session?.user?.name ?? '알 수 없음',
      note,
    })
    if (error) { toast.error('제보 실패: ' + error.message); setSaving(false); return }
    toast.success('제보가 접수됐어요! 관리자 검토 후 등록됩니다.')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-black/60" onClick={onClose}>
      <div className="w-full md:max-w-lg bg-[#0f0f26] border border-blue-500/25 rounded-t-2xl md:rounded-2xl p-5 max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-white font-bold">공격덱 제보</p>
            <p className="text-xs text-slate-500 mt-0.5">제보 내용은 관리자 검토 후 등록돼요</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300"><X size={18} /></button>
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-[10px] text-slate-500 font-bold mb-1">상대 방어팀</p>
            <select value={defId} onChange={e => setDefId(e.target.value)}
              className="w-full bg-[#0c0c1e] border border-slate-700 rounded-lg px-2.5 py-2 text-sm text-slate-200 focus:outline-none">
              {defenseTeams.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-bold mb-1">내가 쓴 공격덱 이름 *</p>
            <input value={atkName} onChange={e => setAtkName(e.target.value)}
              className="w-full bg-[#0c0c1e] border border-slate-700 rounded-lg px-2.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500/50"
              placeholder="예: 프레이야 초선 레긴레이프" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-bold mb-1">캐릭터</p>
            <input value={charsRaw} onChange={e => setCharsRaw(e.target.value)}
              className="w-full bg-[#0c0c1e] border border-slate-700 rounded-lg px-2.5 py-2 text-sm text-slate-200 focus:outline-none"
              placeholder="쉼표 또는 공백으로 구분" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-bold mb-1">진형</p>
            <input value={formation} onChange={e => setFormation(e.target.value)}
              className="w-full bg-[#0c0c1e] border border-slate-700 rounded-lg px-2.5 py-2 text-sm text-slate-200 focus:outline-none"
              placeholder="예: 기본 캐릭1 캐릭2..." />
            {formation && <div className="mt-1.5"><FormationGrid text={formation} /></div>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] text-slate-500 font-bold mb-1">반지</p>
              <input value={ring} onChange={e => setRing(e.target.value)}
                className="w-full bg-[#0c0c1e] border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-slate-200 focus:outline-none"
                placeholder="반지 세팅" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-bold mb-1">펫</p>
              <input value={pet} onChange={e => setPet(e.target.value)}
                className="w-full bg-[#0c0c1e] border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-slate-200 focus:outline-none"
                placeholder="펫" />
            </div>
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-bold mb-1">스킬 순서</p>
            <input value={skill} onChange={e => setSkill(e.target.value)}
              className="w-full bg-[#0c0c1e] border border-slate-700 rounded-lg px-2.5 py-2 text-sm text-slate-200 focus:outline-none"
              placeholder="스킬 순서" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-bold mb-1">장비 세팅</p>
            <textarea rows={2} value={armor} onChange={e => setArmor(e.target.value)}
              className="w-full bg-[#0c0c1e] border border-slate-700 rounded-lg px-2.5 py-2 text-sm text-slate-200 focus:outline-none resize-y"
              placeholder="장비 세팅 (선택)" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-bold mb-1">결과 *</p>
            <div className="flex gap-2">
              {(['win', 'lose'] as const).map(r => (
                <button key={r} onClick={() => setResult(r)}
                  className={cn('flex-1 py-2 rounded-lg text-sm font-bold border transition-colors',
                    r === 'win'
                      ? result === 'win' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' : 'text-slate-500 border-slate-700'
                      : result === 'lose' ? 'bg-red-500/20 text-red-400 border-red-500/40' : 'text-slate-500 border-slate-700')}>
                  {r === 'win' ? '🏆 승리' : '💀 패배'}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-bold mb-1">메모 (선택)</p>
            <textarea rows={2} value={note} onChange={e => setNote(e.target.value)}
              className="w-full bg-[#0c0c1e] border border-slate-700 rounded-lg px-2.5 py-2 text-sm text-slate-200 focus:outline-none resize-y"
              placeholder="추가 설명..." />
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <button onClick={() => void submit()} disabled={saving || !atkName.trim()}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30 hover:bg-blue-500/25 transition-colors disabled:opacity-50">
            <Send size={13} className="inline mr-1" />{saving ? '제출 중...' : '제보 제출'}
          </button>
          <button onClick={onClose} className="px-4 py-2.5 rounded-xl text-sm text-slate-500 border border-slate-700 hover:text-slate-300 transition-colors">취소</button>
        </div>
      </div>
    </div>
  )
}

// ── 메인 ────────────────────────────────────────────────────────────────
export default function GuildWarPage() {
  const { data: session } = useSession()
  const isAdmin = ['관리자', '연구원'].includes(((session?.user as { role?: string })?.role) ?? '')

  const [defenseTeams, setDefenseTeams] = useState<DefenseTeam[]>([])
  const [allAttacks, setAllAttacks]     = useState<AttackTeam[]>([])
  const [loading, setLoading]           = useState(true)

  const [charSearch, setCharSearch]     = useState('')
  const [selectedDef, setSelectedDef]   = useState<DefenseTeam | null>(null)
  const [selectedAtk, setSelectedAtk]   = useState<AttackTeam | null>(null)
  const [defSearch, setDefSearch]       = useState('')
  const [showDrop, setShowDrop]         = useState(false)
  const [sort, setSort]                 = useState<SortKey>('winRate')

  const [showAddModal, setShowAddModal]     = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)

  const dropRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setShowDrop(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  async function loadAll() {
    const [{ data: defs }, { data: atks }] = await Promise.all([
      supabase.from('defense_teams').select('*').order('order_idx'),
      supabase.from('attack_teams').select('*'),
    ])
    if (defs) setDefenseTeams(defs)
    if (atks) setAllAttacks(atks)
    setLoading(false)
  }

  useEffect(() => { void loadAll() }, [])

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

  const validAtk = selectedAtk && displayAttacks.find(a => a.id === selectedAtk.id) ? selectedAtk : null

  async function recordResult(atkId: string, result: 'win' | 'lose') {
    const atk = allAttacks.find(a => a.id === atkId)
    if (!atk) return
    if (result === 'lose' && !confirm(`"${atk.name}" 패배로 기록할까요?`)) return

    const update = result === 'win' ? { win: atk.win + 1 } : { lose: atk.lose + 1 }
    await supabase.from('attack_teams').update(update).eq('id', atkId)
    setAllAttacks(prev => prev.map(a => a.id === atkId ? { ...a, ...update } : a))
    setSelectedAtk(prev => prev?.id === atkId ? { ...prev, ...update } : prev)

    // 오늘의 길드전 로그 기록
    const defTeam = selectedDef ?? defenseTeams.find(d => d.id === atk.defense_team_id)
    await supabase.from('guild_war_logs').insert({
      attack_team_id: atkId,
      attack_name: atk.name,
      attack_type: atk.type,
      defense_team_id: defTeam?.id ?? null,
      defense_name: defTeam?.name ?? '알 수 없음',
      nickname: session?.user?.name ?? '알 수 없음',
      result,
    })

    if (result === 'win') toast.success(`🏆 ${atk.name} 승리 기록!`)
    else toast.error(`💀 ${atk.name} 패배 기록`)
  }

  function selectDef(def: DefWithStats) {
    setSelectedDef(def); setSelectedAtk(null)
    setShowDrop(false); setDefSearch(''); setCharSearch('')
  }

  if (loading) return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <p className="text-slate-500 text-center py-16">불러오는 중...</p>
    </div>
  )

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      {/* 모달 */}
      {showAddModal && (
        <AddAttackModal
          defenseTeams={defenseTeams}
          onClose={() => setShowAddModal(false)}
          onAdded={loadAll}
        />
      )}
      {showReportModal && (
        <ReportModal
          defenseTeams={defenseTeams}
          session={session}
          onClose={() => setShowReportModal(false)}
        />
      )}

      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-5">
        <Swords size={22} className="text-amber-400" />
        <h1 className="text-xl font-bold text-white">길드전 공격</h1>
        <span className="text-sm text-slate-500 ml-1">{defenseTeams.length}개 방어팀</span>
        <div className="flex gap-2 ml-auto">
          {/* 제보 버튼 (모든 길드원) */}
          <button
            onClick={() => setShowReportModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/25 hover:bg-blue-500/20 transition-colors"
          >
            <Send size={12} /> 제보
          </button>
          {/* 공격덱 추가 (관리자/연구원) */}
          {isAdmin && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/25 hover:bg-amber-500/20 transition-colors"
            >
              <Plus size={12} /> 추가
            </button>
          )}
        </div>
      </div>

      {/* 전체 검색 */}
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
          <button onClick={() => { setCharSearch(''); setSelectedAtk(null) }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
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
                <input type="text" value={defSearch} onChange={e => setDefSearch(e.target.value)}
                  placeholder="검색..." autoFocus
                  className="w-full px-3 py-1.5 rounded-lg bg-[#0f0f26] text-white text-sm placeholder-slate-600 focus:outline-none border border-amber-900/20 focus:border-amber-500/30" />
              </div>
              <ul className="max-h-64 overflow-y-auto">
                {filteredDefs.map(def => (
                  <li key={def.id}>
                    <button onMouseDown={() => selectDef(def)}
                      className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-amber-500/5 transition-colors">
                      <span className="text-sm text-white text-left">{def.name}</span>
                      {def.totalWin + def.totalLose > 0 && (
                        <span className="text-xs text-slate-500 shrink-0 ml-3">
                          {Math.round(def.winRate * 100)}% · {def.totalWin}승{def.totalLose}패
                        </span>
                      )}
                    </button>
                  </li>
                ))}
                {filteredDefs.length === 0 && <li className="px-4 py-4 text-sm text-slate-600 text-center">결과 없음</li>}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* 정렬 */}
      {selectedDef && !isSearch && (
        <div className="flex items-center gap-2 mb-4">
          {([['winRate', '승률순'], ['usage', '사용횟수'], ['games', '전적순']] as [SortKey, string][]).map(([key, label]) => (
            <button key={key} onClick={() => setSort(key)}
              className={cn('px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors',
                sort === key ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' : 'text-slate-500 border-slate-800 hover:text-slate-300')}>
              {label}
            </button>
          ))}
          <button onClick={() => { setSelectedDef(null); setSelectedAtk(null) }}
            className="ml-auto flex items-center gap-1 text-xs text-slate-600 hover:text-slate-400 transition-colors">
            <X size={12} /> 해제
          </button>
        </div>
      )}

      {isSearch && (
        <p className="text-sm text-slate-500 mb-3">
          <span className="text-amber-400 font-medium">"{charSearch}"</span> 검색결과 {displayAttacks.length}개
        </p>
      )}

      {!isSearch && !selectedDef ? (
        <p className="text-slate-600 text-center py-12 text-sm">방어팀을 선택하거나 검색하세요</p>
      ) : displayAttacks.length === 0 ? (
        <p className="text-slate-600 text-center py-12 text-sm">결과가 없어요</p>
      ) : (
        <div className="md:grid md:grid-cols-[1fr_340px] md:gap-4 md:items-start">
          <div className="grid grid-cols-2 gap-2 mb-4 md:mb-0">
            {displayAttacks.map(atk => {
              const p = pct(atk.win, atk.lose)
              const isHot    = p !== null && p >= 70
              const isActive = validAtk?.id === atk.id
              const defTeam  = isSearch ? defenseTeams.find(d => d.id === atk.defense_team_id) : null
              return (
                <button key={atk.id} onClick={() => setSelectedAtk(isActive ? null : atk)}
                  className={cn('text-left p-3 rounded-xl border transition-colors',
                    isActive ? 'bg-amber-500/10 border-amber-500/40' : 'bg-[#0f0f26] border-amber-900/20 hover:border-amber-500/25')}>
                  {defTeam && <p className="text-[10px] text-amber-600/80 font-medium mb-0.5">{defTeam.name}</p>}
                  <p className="text-sm font-bold text-white leading-tight">
                    {isHot && <span className="text-orange-400">🔥 </span>}{atk.name}
                  </p>
                  {atk.type && (
                    <span className={cn('inline-block text-[9px] font-bold px-1.5 py-0.5 rounded-full border mt-1',
                      TYPE_STYLE[atk.type] || 'bg-slate-500/15 text-slate-400 border-slate-500/30')}>
                      {atk.type}
                    </span>
                  )}
                  <p className="text-xs text-slate-500 mt-1">{p !== null ? `${p}%` : '-'} · {atk.win}승{atk.lose}패</p>
                </button>
              )
            })}
          </div>

          {validAtk ? (
            <div className="sticky top-4">
              <AttackDetailCard atk={validAtk} isAdmin={isAdmin}
                onRecord={recordResult} onClose={() => setSelectedAtk(null)} />
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

// ── 공격 상세 카드 ──────────────────────────────────────────────────────
function AttackDetailCard({
  atk, isAdmin, onRecord, onClose,
}: {
  atk: AttackTeam; isAdmin: boolean
  onRecord: (id: string, result: 'win' | 'lose') => void
  onClose: () => void
}) {
  const p     = pct(atk.win, atk.lose)
  const isHot = p !== null && p >= 70
  return (
    <div className="bg-[#0f0f26] border border-amber-500/20 rounded-xl p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-white font-bold text-base leading-tight">
            {isHot && <span className="text-orange-400">🔥 </span>}{atk.name}
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
          <button onClick={onClose} className="text-slate-600 hover:text-slate-400 mt-0.5"><X size={16} /></button>
        </div>
      </div>
      {atk.type && (
        <span className={cn('inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border mb-3',
          TYPE_STYLE[atk.type] || 'bg-slate-500/15 text-slate-400 border-slate-500/30')}>
          {atk.type}
        </span>
      )}
      {atk.characters?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {atk.characters.map((c, i) => (
            <span key={i} className="text-xs px-2 py-0.5 rounded-md bg-[#16163a] text-slate-300">{c}</span>
          ))}
        </div>
      )}
      {atk.formation && (
        <div className="mb-3">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide mb-2">진형</p>
          <FormationGrid text={atk.formation} />
        </div>
      )}
      <div className="space-y-1.5 text-xs mb-3">
        {atk.ring  && <p><span className="text-slate-600 w-10 inline-block">반지</span> <span className="text-slate-300">{atk.ring}</span></p>}
        {atk.skill && <p><span className="text-slate-600 w-10 inline-block">스킬순</span> <span className="text-slate-300">{atk.skill}</span></p>}
        {atk.pet   && <p><span className="text-slate-600 w-10 inline-block">펫</span> <span className="text-slate-300">{atk.pet}</span></p>}
        {atk.armor && <p className="text-slate-300 whitespace-pre-line border-t border-amber-900/10 pt-2 mt-2">{atk.armor}</p>}
      </div>
      {isAdmin && (
        <div className="flex gap-2 pt-3 border-t border-amber-900/10">
          <button onClick={() => onRecord(atk.id, 'win')}
            className="flex-1 py-2.5 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25 transition-colors text-sm font-bold">
            🏆 승
          </button>
          <button onClick={() => onRecord(atk.id, 'lose')}
            className="flex-1 py-2.5 rounded-lg bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25 transition-colors text-sm font-bold">
            💀 패
          </button>
        </div>
      )}
    </div>
  )
}
