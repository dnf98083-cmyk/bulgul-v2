'use client'

import { useEffect, useState, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { supabase } from '@/lib/supabase/client'
import { Target, Trophy, BookOpen, Plus, Trash2, Pencil, X, Check, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { FormationGrid } from '@/components/FormationGrid'

// ── 타입 ──────────────────────────────────────────────────────────────────
type PveScore = {
  id: string; type: string; key: string
  season: string; nickname: string; score: number; date: string | null
}
type Formation = { pet?: string; val: string; label?: string }
type SubDetail = { name?: string; deck?: string; equip?: string; skill?: string; formations?: Formation[] }
type BuildData = {
  buildName?: string; baseName?: string
  deck?: string; equip?: string; skill?: string; maker?: string
  formations?: Formation[]; formation?: string
  details?: Record<string, SubDetail>
  [key: string]: unknown
}
type RawData = { buildOrder?: string[] } & Record<string, BuildData | string[] | undefined>
type PveBuild = { id: string; category: string; key: string; sub_key: string; data: RawData }

// ── 상수 ──────────────────────────────────────────────────────────────────
const DAYS     = ['월', '화', '수', '목', '금', '토', '일'] as const
const DAY_KEY: Record<string, string> = { 월:'mon', 화:'tue', 수:'wed', 목:'thu', 금:'fri', 토:'sat', 일:'sun' }
const ADVENT_ITEMS = [
  { key:'destruct1', name:'🔥 파괴신 1라', isTurn:true },
  { key:'destruct2', name:'🔥 파괴신 2라', isTurn:true },
  { key:'teo',       name:'태오' },
  { key:'kyle',      name:'카일' },
  { key:'yeonhee',   name:'연희' },
  { key:'karma',     name:'카르마' },
]
const RAID_GROUPS = [
  { group:'일반 레이드', items:[
    { key:'eye_of_doom',   cat:'normal_raid', name:'파멸의 눈동자' },
    { key:'umawang',       cat:'normal_raid', name:'우마왕' },
    { key:'iron_predator', cat:'normal_raid', name:'강철의 포식자' },
  ]},
  { group:'돌발 레이드', items:[
    { key:'leonid',    cat:'event_raid', name:'레오니드' },
    { key:'astraea',   cat:'event_raid', name:'아스트레이아' },
    { key:'callistra', cat:'event_raid', name:'칼리스트라' },
  ]},
]
const DESTRUCT_TURNS = ['4','8','12','16','20']

function fmtScore(n: number) { return n.toLocaleString('ko-KR') }

// ── FormationEditor ────────────────────────────────────────────────────────
function FormationEditor({
  formations, onChange
}: {
  formations: Formation[]
  onChange: (f: Formation[]) => void
}) {
  function update(i: number, field: keyof Formation, val: string) {
    const next = formations.map((f, idx) => idx === i ? { ...f, [field]: val } : f)
    onChange(next)
  }
  function add() { onChange([...formations, { val: '' }]) }
  function remove(i: number) { onChange(formations.filter((_, idx) => idx !== i)) }

  return (
    <div className="space-y-2">
      {formations.map((f, i) => (
        <div key={i} className="space-y-1.5">
          <div className="flex gap-2 items-center">
            <input
              className="flex-1 bg-[#0c0c1e] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500/50"
              placeholder="진형 (예: 기본 브브 여포 카이린 카밀레아 수퍼리어)"
              value={f.val}
              onChange={e => update(i, 'val', e.target.value)}
            />
            <button onClick={() => remove(i)} className="text-slate-600 hover:text-red-400 shrink-0">
              <X size={14} />
            </button>
          </div>
          {f.val && <div className="pl-1"><FormationGrid text={f.val} /></div>}
          <input
            className="w-full bg-[#0c0c1e] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-400 focus:outline-none focus:border-amber-500/50"
            placeholder="펫 (선택)"
            value={f.pet ?? ''}
            onChange={e => update(i, 'pet', e.target.value)}
          />
        </div>
      ))}
      <button
        onClick={add}
        className="flex items-center gap-1 text-xs text-amber-500/70 hover:text-amber-400 transition-colors"
      >
        <Plus size={12} /> 진형 추가
      </button>
    </div>
  )
}

// ── ContentEditor: 덱/스킬/장비 공통 폼 ───────────────────────────────────
function ContentEditor({
  data, onChange
}: {
  data: { formations?: Formation[]; deck?: string; skill?: string; equip?: string }
  onChange: (d: typeof data) => void
}) {
  return (
    <div className="space-y-3">
      <div>
        <p className="text-[10px] text-slate-500 font-bold mb-1.5">🗺️ 진형</p>
        <FormationEditor
          formations={data.formations ?? []}
          onChange={f => onChange({ ...data, formations: f })}
        />
      </div>
      <div>
        <p className="text-[10px] text-slate-500 font-bold mb-1">⚔️ 덱 조합</p>
        <textarea
          rows={3}
          className="w-full bg-[#0c0c1e] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500/50 resize-y"
          placeholder="덱 조합 설명"
          value={data.deck ?? ''}
          onChange={e => onChange({ ...data, deck: e.target.value })}
        />
      </div>
      <div>
        <p className="text-[10px] text-slate-500 font-bold mb-1">📜 스킬 순서</p>
        <textarea
          rows={3}
          className="w-full bg-[#0c0c1e] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-amber-500/50 resize-y"
          placeholder="스킬 순서"
          value={data.skill ?? ''}
          onChange={e => onChange({ ...data, skill: e.target.value })}
        />
      </div>
      <div>
        <p className="text-[10px] text-slate-500 font-bold mb-1">🛡️ 장비 세팅</p>
        <textarea
          rows={3}
          className="w-full bg-[#0c0c1e] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500/50 resize-y"
          placeholder="장비 세팅"
          value={data.equip ?? ''}
          onChange={e => onChange({ ...data, equip: e.target.value })}
        />
      </div>
    </div>
  )
}

// ── 메인 ──────────────────────────────────────────────────────────────────
export default function PvePage() {
  const { data: session } = useSession()
  const isAdmin = ['관리자', '연구원'].includes((session?.user as { role?: string })?.role ?? '')

  const [mainTab, setMainTab] = useState<'score' | 'build'>('score')

  // 점수 탭 상태
  const [scoreType, setScoreType]     = useState<'siege' | 'advent'>('siege')
  const [selectedDay, setSelectedDay] = useState('월')
  const [season, setSeason]           = useState<'this' | 'last'>('this')
  const [scores, setScores]           = useState<PveScore[]>([])
  const [scLoading, setScLoading]     = useState(false)

  // 빌드 탭 상태
  const [buildCat, setBuildCat]         = useState<'siege' | 'advent' | 'raid'>('siege')
  const [selectedBoss, setSelectedBoss] = useState<{ key: string; cat: string; name: string } | null>(null)
  const [turn, setTurn]                 = useState('8')
  const [rawBuilds, setRawBuilds]       = useState<PveBuild[]>([])
  const [bdLoading, setBdLoading]       = useState(false)

  // 빌드 탭 내 선택 상태
  const [activeBuildKey, setActiveBuildKey] = useState('build1')
  const [activeDetail, setActiveDetail]     = useState<string>('')

  // ── 편집 상태 ──────────────────────────────────────────────────────────
  const [editMode, setEditMode]             = useState(false)
  const [editBuild, setEditBuild]           = useState<BuildData>({})
  const [editingDetail, setEditingDetail]   = useState<string>('')  // '' = base, key = sub-detail
  const [newDetailName, setNewDetailName]   = useState('')
  const [showAddDetail, setShowAddDetail]   = useState(false)
  const [saving, setSaving]                 = useState(false)
  const [newBuildName, setNewBuildName]     = useState('')
  const [showAddBuild, setShowAddBuild]     = useState(false)

  // ── 점수 로드 ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (mainTab !== 'score') return
    setScLoading(true)
    const key = scoreType === 'siege' ? selectedDay : '파괴신'
    supabase.from('pve_scores').select('*')
      .eq('type', scoreType).eq('key', key).eq('season', season)
      .order('score', { ascending: false })
      .then(({ data }) => { if (data) setScores(data as PveScore[]); setScLoading(false) })
  }, [mainTab, scoreType, selectedDay, season])

  // ── 빌드 로드 ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (mainTab !== 'build' || !selectedBoss) return
    setBdLoading(true)
    setActiveBuildKey('build1')
    setActiveDetail('')
    setEditMode(false)
    let q = supabase.from('pve_builds').select('*')
      .eq('category', selectedBoss.cat).eq('key', selectedBoss.key)
    if (selectedBoss.cat === 'advent' && (selectedBoss.key === 'destruct1' || selectedBoss.key === 'destruct2')) {
      q = q.eq('sub_key', turn)
    }
    q.then(({ data }) => { if (data) setRawBuilds(data as PveBuild[]); setBdLoading(false) })
  }, [mainTab, selectedBoss, turn])

  // ── 빌드 데이터 파싱 ───────────────────────────────────────────────────
  const buildSlots = useMemo(() => {
    if (!rawBuilds.length) return []
    const d = rawBuilds[0].data
    const order = (d.buildOrder as string[] | undefined) ?? []
    const keys  = Object.keys(d).filter(k => k.startsWith('build') && k !== 'buildOrder')
    const sorted = order.length > 0 ? [...new Set([...order, ...keys])] : keys.sort()
    return sorted.map(bk => {
      const bd = d[bk] as BuildData | undefined
      if (!bd || typeof bd !== 'object') return null
      return { key: bk, label: (bd.buildName as string) || bk, data: bd }
    }).filter(Boolean) as { key: string; label: string; data: BuildData }[]
  }, [rawBuilds])

  const currentBuild = useMemo(() =>
    buildSlots.find(b => b.key === activeBuildKey)?.data ?? buildSlots[0]?.data ?? null,
  [buildSlots, activeBuildKey])

  const currentData = useMemo(() => {
    if (!currentBuild) return null
    if (activeDetail && currentBuild.details?.[activeDetail]) return currentBuild.details[activeDetail]
    return currentBuild
  }, [currentBuild, activeDetail])

  const formations = useMemo(() => {
    if (!currentData) return []
    const bd = currentData as BuildData
    return bd.formations ?? (bd.formation ? [{ val: bd.formation } as Formation] : [])
  }, [currentData])

  // ── 편집 모드 진입 ─────────────────────────────────────────────────────
  function enterEdit() {
    const base = currentBuild ?? { buildName: '새 빌드', baseName: '기본', formations: [], details: {} }
    setEditBuild(JSON.parse(JSON.stringify(base)))
    setEditingDetail('')
    setShowAddDetail(false)
    setEditMode(true)
  }

  function cancelEdit() {
    setEditMode(false)
    setEditingDetail('')
    setShowAddDetail(false)
  }

  // ── 저장 ───────────────────────────────────────────────────────────────
  async function saveEdit() {
    if (!selectedBoss) return
    setSaving(true)

    const currentData = rawBuilds.length > 0 ? { ...rawBuilds[0].data } : {} as RawData
    const bk = activeBuildKey
    currentData[bk] = editBuild as unknown as BuildData

    // buildOrder 동기화
    const existing = (currentData.buildOrder as string[] | undefined) ?? []
    if (!existing.includes(bk)) currentData.buildOrder = [...existing, bk]

    if (rawBuilds.length > 0) {
      await supabase.from('pve_builds').update({ data: currentData }).eq('id', rawBuilds[0].id)
    } else {
      const sub = (selectedBoss.key === 'destruct1' || selectedBoss.key === 'destruct2') ? turn : ''
      await supabase.from('pve_builds').insert({
        category: selectedBoss.cat,
        key: selectedBoss.key,
        sub_key: sub,
        data: currentData,
      })
    }

    // 리로드
    let q = supabase.from('pve_builds').select('*')
      .eq('category', selectedBoss.cat).eq('key', selectedBoss.key)
    if (selectedBoss.cat === 'advent' && (selectedBoss.key === 'destruct1' || selectedBoss.key === 'destruct2')) {
      q = q.eq('sub_key', turn)
    }
    const { data } = await q
    if (data) setRawBuilds(data as PveBuild[])
    setSaving(false)
    setEditMode(false)
    setEditingDetail('')
  }

  // ── 빌드 슬롯 추가 ─────────────────────────────────────────────────────
  async function addBuildSlot() {
    if (!selectedBoss || !newBuildName.trim()) return
    setSaving(true)
    const currentRawData = rawBuilds.length > 0 ? { ...rawBuilds[0].data } : {} as RawData
    const existingKeys = Object.keys(currentRawData).filter(k => k.startsWith('build') && k !== 'buildOrder')
    const nextNum = existingKeys.length + 1
    const newKey = `build${nextNum}`
    currentRawData[newKey] = { buildName: newBuildName.trim(), formations: [], details: {} } as unknown as BuildData
    const order = (currentRawData.buildOrder as string[] | undefined) ?? []
    currentRawData.buildOrder = [...order, newKey]

    if (rawBuilds.length > 0) {
      await supabase.from('pve_builds').update({ data: currentRawData }).eq('id', rawBuilds[0].id)
    } else {
      const sub = (selectedBoss.key === 'destruct1' || selectedBoss.key === 'destruct2') ? turn : ''
      await supabase.from('pve_builds').insert({
        category: selectedBoss.cat, key: selectedBoss.key, sub_key: sub, data: currentRawData,
      })
    }

    let q = supabase.from('pve_builds').select('*')
      .eq('category', selectedBoss.cat).eq('key', selectedBoss.key)
    if (selectedBoss.cat === 'advent' && (selectedBoss.key === 'destruct1' || selectedBoss.key === 'destruct2')) {
      q = q.eq('sub_key', turn)
    }
    const { data } = await q
    if (data) setRawBuilds(data as PveBuild[])
    setActiveBuildKey(newKey)
    setNewBuildName('')
    setShowAddBuild(false)
    setSaving(false)
  }

  // ── 빌드 슬롯 삭제 ─────────────────────────────────────────────────────
  async function deleteBuildSlot(bk: string) {
    if (!rawBuilds.length || !confirm(`"${bk}" 빌드를 삭제할까요?`)) return
    setSaving(true)
    const d = { ...rawBuilds[0].data }
    delete d[bk]
    d.buildOrder = ((d.buildOrder as string[] | undefined) ?? []).filter(k => k !== bk)
    await supabase.from('pve_builds').update({ data: d }).eq('id', rawBuilds[0].id)
    const remaining = buildSlots.filter(b => b.key !== bk)
    setActiveBuildKey(remaining[0]?.key ?? 'build1')
    let q = supabase.from('pve_builds').select('*')
      .eq('category', selectedBoss!.cat).eq('key', selectedBoss!.key)
    if (selectedBoss!.cat === 'advent' && (selectedBoss!.key === 'destruct1' || selectedBoss!.key === 'destruct2')) {
      q = q.eq('sub_key', turn)
    }
    const { data } = await q
    if (data) setRawBuilds(data as PveBuild[])
    setSaving(false)
  }

  // ── 세부사항 추가 ──────────────────────────────────────────────────────
  function addDetail() {
    if (!newDetailName.trim()) return
    const key = `detail_${Date.now()}`
    const next: BuildData = {
      ...editBuild,
      details: { ...(editBuild.details ?? {}), [key]: { name: newDetailName.trim(), formations: [], deck: '', skill: '', equip: '' } }
    }
    setEditBuild(next)
    setEditingDetail(key)
    setNewDetailName('')
    setShowAddDetail(false)
  }

  // ── 세부사항 삭제 ──────────────────────────────────────────────────────
  function deleteDetail(key: string) {
    const next = { ...editBuild }
    const details = { ...(next.details ?? {}) }
    delete details[key]
    next.details = details
    setEditBuild(next)
    if (editingDetail === key) setEditingDetail('')
  }

  // ── 편집 중인 content data ─────────────────────────────────────────────
  const editContent = useMemo(() => {
    if (editingDetail && editBuild.details?.[editingDetail]) {
      return editBuild.details[editingDetail]
    }
    return editBuild
  }, [editBuild, editingDetail])

  function updateEditContent(patch: Partial<BuildData | SubDetail>) {
    if (editingDetail) {
      setEditBuild(prev => ({
        ...prev,
        details: { ...(prev.details ?? {}), [editingDetail]: { ...(prev.details?.[editingDetail] ?? {}), ...patch } }
      }))
    } else {
      setEditBuild(prev => ({ ...prev, ...patch }))
    }
  }

  function selectBoss(key: string, cat: string, name: string) {
    setSelectedBoss({ key, cat, name })
    setActiveBuildKey('build1')
    setActiveDetail('')
    setEditMode(false)
  }

  function changeCat(cat: 'siege' | 'advent' | 'raid') {
    setBuildCat(cat)
    setSelectedBoss(null)
    setRawBuilds([])
    setEditMode(false)
  }

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-5">
        <Target size={22} className="text-amber-400" />
        <h1 className="text-xl font-bold text-white">PVE 공략</h1>
      </div>

      {/* 메인 탭 */}
      <div className="flex gap-2 mb-5">
        {(['score', 'build'] as const).map(t => (
          <button key={t} onClick={() => setMainTab(t)}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              mainTab === t
                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                : 'text-slate-400 border border-transparent hover:text-slate-200 hover:bg-white/5'
            )}>
            {t === 'score' ? <><Trophy size={15} /> 점수</> : <><BookOpen size={15} /> 빌드</>}
          </button>
        ))}
      </div>

      {/* ── 점수 탭 ──────────────────────────────────────────────────────── */}
      {mainTab === 'score' && (
        <div>
          <div className="flex gap-2 mb-4">
            {(['siege', 'advent'] as const).map(t => (
              <button key={t} onClick={() => setScoreType(t)}
                className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border',
                  scoreType === t ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' : 'text-slate-500 border-slate-800 hover:text-slate-300')}>
                {t === 'siege' ? '공성전' : '파괴신'}
              </button>
            ))}
          </div>

          {scoreType === 'siege' && (
            <div className="flex gap-1.5 mb-4 flex-wrap">
              {DAYS.map(d => (
                <button key={d} onClick={() => setSelectedDay(d)}
                  className={cn('w-9 h-9 rounded-lg text-sm font-bold transition-colors border',
                    selectedDay === d ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' : 'text-slate-500 border-slate-800 hover:text-slate-300')}>
                  {d}
                </button>
              ))}
            </div>
          )}

          <div className="flex gap-2 mb-5">
            {(['this', 'last'] as const).map(s => (
              <button key={s} onClick={() => setSeason(s)}
                className={cn('px-3 py-1 rounded-full text-xs font-medium transition-colors',
                  season === s ? 'bg-slate-600 text-slate-200' : 'text-slate-600 hover:text-slate-400')}>
                {s === 'this' ? '이번 시즌' : '지난 시즌'}
              </button>
            ))}
          </div>

          {scLoading ? (
            <p className="text-slate-500 text-center py-12">불러오는 중...</p>
          ) : scores.length === 0 ? (
            <p className="text-slate-600 text-center py-12">등록된 점수가 없어요</p>
          ) : (
            <div className="space-y-1.5">
              {scores.map((s, i) => (
                <div key={s.id} className={cn('flex items-center gap-3 px-4 py-2.5 rounded-xl border',
                  i === 0 ? 'bg-amber-500/10 border-amber-500/30' :
                  i === 1 ? 'bg-slate-700/20 border-slate-700/30' :
                  i === 2 ? 'bg-amber-900/10 border-amber-900/20' :
                  'bg-[#0f0f26] border-amber-900/10')}>
                  <span className={cn('text-sm font-bold w-6 text-center',
                    i === 0 ? 'text-amber-400' : i === 1 ? 'text-slate-400' : i === 2 ? 'text-amber-700' : 'text-slate-600')}>
                    {i + 1}
                  </span>
                  <p className="flex-1 text-sm text-white font-medium">{s.nickname}</p>
                  <p className="text-sm font-bold text-emerald-400 font-mono">{fmtScore(s.score)}</p>
                  {s.date && <p className="text-xs text-slate-600">{s.date}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── 빌드 탭 ──────────────────────────────────────────────────────── */}
      {mainTab === 'build' && (
        <div>
          {/* 카테고리 탭 */}
          <div className="flex gap-2 mb-4">
            {(['siege', 'advent', 'raid'] as const).map(t => (
              <button key={t} onClick={() => changeCat(t)}
                className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border',
                  buildCat === t ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' : 'text-slate-500 border-slate-800 hover:text-slate-300')}>
                {t === 'siege' ? '공성전' : t === 'advent' ? '강림' : '레이드'}
              </button>
            ))}
          </div>

          <div className="md:grid md:grid-cols-[160px_1fr] md:gap-4 md:items-start">
            {/* 왼쪽: 보스 버튼 */}
            <div>
              {buildCat === 'siege' && (
                <div className="grid grid-cols-4 md:grid-cols-2 gap-1.5 mb-4 md:mb-0">
                  {DAYS.map(d => (
                    <button key={d}
                      onClick={() => selectBoss(DAY_KEY[d], 'siege', `${d}요일`)}
                      className={cn('py-2.5 rounded-xl text-sm font-bold transition-colors border',
                        selectedBoss?.key === DAY_KEY[d]
                          ? 'bg-amber-500/15 text-amber-400 border-amber-500/40'
                          : 'bg-[#0f0f26] border-amber-900/20 text-slate-400 hover:border-amber-500/25 hover:text-slate-300')}>
                      {d}
                    </button>
                  ))}
                </div>
              )}

              {buildCat === 'advent' && (
                <div className="flex flex-wrap md:flex-col gap-1.5 mb-4 md:mb-0">
                  {ADVENT_ITEMS.map(item => (
                    <button key={item.key}
                      onClick={() => selectBoss(item.key, 'advent', item.name)}
                      className={cn('px-3 py-2 rounded-xl text-xs font-bold transition-colors border text-left',
                        selectedBoss?.key === item.key
                          ? 'bg-amber-500/15 text-amber-400 border-amber-500/40'
                          : 'bg-[#0f0f26] border-amber-900/20 text-slate-400 hover:border-amber-500/25 hover:text-slate-300')}>
                      {item.name}
                    </button>
                  ))}
                </div>
              )}

              {buildCat === 'raid' && (
                <div className="space-y-3 mb-4 md:mb-0">
                  {RAID_GROUPS.map(g => (
                    <div key={g.group}>
                      <p className="text-[10px] text-slate-600 font-bold uppercase tracking-wide mb-1.5">{g.group}</p>
                      <div className="flex flex-wrap md:flex-col gap-1.5">
                        {g.items.map(item => (
                          <button key={item.key}
                            onClick={() => selectBoss(item.key, item.cat, item.name)}
                            className={cn('px-3 py-2 rounded-xl text-xs font-bold transition-colors border text-left',
                              selectedBoss?.key === item.key
                                ? 'bg-amber-500/15 text-amber-400 border-amber-500/40'
                                : 'bg-[#0f0f26] border-amber-900/20 text-slate-400 hover:border-amber-500/25 hover:text-slate-300')}>
                            {item.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 오른쪽: 상세 카드 */}
            {!selectedBoss ? (
              <div className="hidden md:flex items-center justify-center h-48 rounded-xl border border-amber-900/10 text-slate-600 text-sm">
                보스를 선택하세요
              </div>
            ) : (
              <div className="mt-4 md:mt-0">
                <div className="bg-[#0f0f26] border border-amber-500/20 rounded-xl p-4">
                  {/* 보스 이름 + 수정 버튼 */}
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-white font-bold text-base">{selectedBoss.name}</p>
                    {isAdmin && !editMode && !bdLoading && (
                      <button
                        onClick={enterEdit}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/25 hover:bg-blue-500/20 transition-colors"
                      >
                        <Pencil size={11} /> 수정
                      </button>
                    )}
                  </div>

                  {/* 파괴신 턴 수 */}
                  {(selectedBoss.key === 'destruct1' || selectedBoss.key === 'destruct2') && (
                    <div className="mb-3">
                      <p className="text-[10px] text-slate-500 font-bold mb-1.5">⏳ 턴 수</p>
                      <div className="flex gap-1.5">
                        {DESTRUCT_TURNS.map(t => (
                          <button key={t} onClick={() => setTurn(t)}
                            className={cn('px-2.5 py-1 rounded-lg text-xs font-medium transition-colors border',
                              turn === t ? 'bg-blue-500/15 text-blue-400 border-blue-500/30' : 'text-slate-500 border-slate-800 hover:text-slate-300')}>
                            {t}턴
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {bdLoading ? (
                    <p className="text-slate-500 text-sm py-8 text-center">불러오는 중...</p>
                  ) : editMode ? (
                    /* ── 편집 모드 ──────────────────────────────────── */
                    <div>
                      {/* 빌드 탭 (편집 모드에서도 탭 전환 가능) */}
                      <div className="flex gap-1.5 overflow-x-auto pb-1 mb-3 items-center">
                        {buildSlots.map(b => (
                          <div key={b.key} className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => { setActiveBuildKey(b.key); setEditBuild(JSON.parse(JSON.stringify(b.data))); setEditingDetail('') }}
                              className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border',
                                activeBuildKey === b.key
                                  ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                                  : 'text-slate-500 border-slate-800 hover:text-slate-300')}>
                              {b.label}
                            </button>
                            <button onClick={() => deleteBuildSlot(b.key)} className="text-slate-600 hover:text-red-400">
                              <Trash2 size={11} />
                            </button>
                          </div>
                        ))}
                        {/* 빌드 추가 */}
                        {showAddBuild ? (
                          <div className="flex items-center gap-1 shrink-0">
                            <input
                              autoFocus
                              className="w-24 bg-[#0c0c1e] border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-200 focus:outline-none"
                              placeholder="빌드 이름"
                              value={newBuildName}
                              onChange={e => setNewBuildName(e.target.value)}
                              onKeyDown={e => { if (e.key === 'Enter') addBuildSlot(); if (e.key === 'Escape') setShowAddBuild(false) }}
                            />
                            <button onClick={addBuildSlot} className="text-emerald-400 hover:text-emerald-300"><Check size={13} /></button>
                            <button onClick={() => setShowAddBuild(false)} className="text-slate-600 hover:text-slate-400"><X size={13} /></button>
                          </div>
                        ) : (
                          <button onClick={() => setShowAddBuild(true)} className="flex items-center gap-0.5 text-xs text-amber-500/70 hover:text-amber-400 shrink-0">
                            <Plus size={12} /> 빌드
                          </button>
                        )}
                      </div>

                      {/* 빌드 기본 정보 */}
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <div>
                          <p className="text-[10px] text-slate-500 font-bold mb-1">빌드 이름</p>
                          <input
                            className="w-full bg-[#0c0c1e] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500/50"
                            value={editBuild.buildName ?? ''}
                            onChange={e => setEditBuild(prev => ({ ...prev, buildName: e.target.value }))}
                          />
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-500 font-bold mb-1">기본 탭 이름</p>
                          <input
                            className="w-full bg-[#0c0c1e] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500/50"
                            value={editBuild.baseName ?? '기본'}
                            onChange={e => setEditBuild(prev => ({ ...prev, baseName: e.target.value }))}
                          />
                        </div>
                      </div>

                      {/* 세부사항 선택 탭 (편집) */}
                      <div className="flex flex-wrap gap-1.5 mb-3 items-center">
                        <button
                          onClick={() => setEditingDetail('')}
                          className={cn('px-2.5 py-1 rounded-full text-xs font-medium transition-colors border',
                            editingDetail === '' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 'text-slate-500 border-slate-700 hover:text-slate-300')}>
                          {editBuild.baseName ?? '기본'}
                        </button>
                        {Object.entries(editBuild.details ?? {}).map(([k, v]) => (
                          <div key={k} className="flex items-center gap-0.5">
                            <button
                              onClick={() => setEditingDetail(k)}
                              className={cn('px-2.5 py-1 rounded-full text-xs font-medium transition-colors border',
                                editingDetail === k ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 'text-slate-500 border-slate-700 hover:text-slate-300')}>
                              {v.name ?? '세부사항'}
                            </button>
                            <button onClick={() => deleteDetail(k)} className="text-slate-600 hover:text-red-400">
                              <Trash2 size={10} />
                            </button>
                          </div>
                        ))}
                        {/* 세부사항 추가 */}
                        {showAddDetail ? (
                          <div className="flex items-center gap-1">
                            <input
                              autoFocus
                              className="w-24 bg-[#0c0c1e] border border-slate-700 rounded-lg px-2 py-0.5 text-xs text-slate-200 focus:outline-none"
                              placeholder="이름"
                              value={newDetailName}
                              onChange={e => setNewDetailName(e.target.value)}
                              onKeyDown={e => { if (e.key === 'Enter') addDetail(); if (e.key === 'Escape') setShowAddDetail(false) }}
                            />
                            <button onClick={addDetail} className="text-emerald-400 hover:text-emerald-300"><Check size={13} /></button>
                            <button onClick={() => setShowAddDetail(false)} className="text-slate-600 hover:text-slate-400"><X size={13} /></button>
                          </div>
                        ) : (
                          <button onClick={() => setShowAddDetail(true)} className="flex items-center gap-0.5 text-xs text-amber-500/70 hover:text-amber-400">
                            <Plus size={11} /> 세부사항
                          </button>
                        )}
                      </div>

                      {/* 세부사항 이름 수정 (선택 시) */}
                      {editingDetail && (
                        <div className="mb-3">
                          <p className="text-[10px] text-slate-500 font-bold mb-1">세부사항 이름</p>
                          <input
                            className="w-full bg-[#0c0c1e] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500/50"
                            value={(editBuild.details?.[editingDetail]?.name) ?? ''}
                            onChange={e => updateEditContent({ name: e.target.value })}
                          />
                        </div>
                      )}

                      {/* 내용 편집 */}
                      <ContentEditor
                        data={editContent}
                        onChange={patch => updateEditContent(patch)}
                      />

                      {/* 저장/취소 */}
                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={saveEdit}
                          disabled={saving}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 hover:bg-amber-500/25 transition-colors disabled:opacity-50"
                        >
                          <Check size={14} /> {saving ? '저장 중...' : '저장'}
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="px-4 py-2 rounded-xl text-sm font-medium text-slate-500 border border-slate-700 hover:text-slate-300 transition-colors"
                        >
                          취소
                        </button>
                      </div>
                    </div>
                  ) : buildSlots.length === 0 ? (
                    /* ── 빌드 없음 ──────────────────────────────────── */
                    <div className="py-8 text-center">
                      <p className="text-slate-600 text-sm mb-3">등록된 빌드가 없어요</p>
                      {isAdmin && (
                        <button
                          onClick={enterEdit}
                          className="flex items-center gap-1.5 mx-auto px-4 py-2 rounded-xl text-sm font-medium bg-amber-500/10 text-amber-400 border border-amber-500/25 hover:bg-amber-500/20 transition-colors"
                        >
                          <Plus size={14} /> 빌드 등록
                        </button>
                      )}
                    </div>
                  ) : (
                    /* ── 보기 모드 ──────────────────────────────────── */
                    <>
                      {/* 빌드 탭 */}
                      {buildSlots.length > 1 && (
                        <div className="flex gap-1.5 overflow-x-auto pb-1 mb-3">
                          {buildSlots.map(b => (
                            <button key={b.key}
                              onClick={() => { setActiveBuildKey(b.key); setActiveDetail('') }}
                              className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border whitespace-nowrap shrink-0',
                                activeBuildKey === b.key
                                  ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                                  : 'text-slate-500 border-slate-800 hover:text-slate-300')}>
                              {b.label}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* 세부사항 칩 */}
                      {currentBuild?.details && Object.keys(currentBuild.details).length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          <button
                            onClick={() => setActiveDetail('')}
                            className={cn('px-2.5 py-1 rounded-full text-xs font-medium transition-colors border',
                              activeDetail === '' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 'text-slate-500 border-slate-700 hover:text-slate-300')}>
                            {currentBuild.baseName ?? '기본'}
                          </button>
                          {Object.entries(currentBuild.details).map(([k, v]) => (
                            <button key={k}
                              onClick={() => setActiveDetail(k)}
                              className={cn('px-2.5 py-1 rounded-full text-xs font-medium transition-colors border',
                                activeDetail === k ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 'text-slate-500 border-slate-700 hover:text-slate-300')}>
                              {v.name ?? '세부사항'}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* 진형 */}
                      {formations.length > 0 && (
                        <div className="mb-3">
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide mb-2">🗺️ 진형</p>
                          <div className="space-y-3">
                            {formations.map((f: Formation, i) => (
                              <div key={i}>
                                {f.label && <p className="text-[10px] text-amber-500/70 mb-1">{f.label}</p>}
                                <FormationGrid text={f.val} />
                                {f.pet && <p className="text-xs text-slate-500 mt-1">펫: {f.pet}</p>}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {currentData?.deck && (
                        <div className="mb-2">
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide mb-1">⚔️ 덱 조합</p>
                          <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed">{currentData.deck}</p>
                        </div>
                      )}
                      {currentData?.skill && (
                        <div className="mb-2">
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide mb-1">📜 스킬 순서</p>
                          <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed font-mono">{currentData.skill}</p>
                        </div>
                      )}
                      {currentData?.equip && (
                        <div className="mb-2">
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide mb-1">🛡️ 장비 세팅</p>
                          <p className="text-xs text-slate-400 whitespace-pre-line leading-relaxed">{currentData.equip}</p>
                        </div>
                      )}
                      {currentBuild?.maker && (
                        <p className="text-[10px] text-slate-600 mt-2">작성: {currentBuild.maker}</p>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
