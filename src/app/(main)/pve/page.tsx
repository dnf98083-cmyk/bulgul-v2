'use client'

import { useEffect, useState, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { supabase } from '@/lib/supabase/client'
import { Target, Trophy, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'
import { FormationGrid } from '@/components/FormationGrid'

// ── 타입 ──────────────────────────────────────────────────────────────────
type PveScore = {
  id: string; type: string; key: string
  season: string; nickname: string; score: number; date: string | null
}
type Formation = { pet?: string; val: string; label?: string }
type BuildData = {
  buildName?: string; baseName?: string
  deck?: string; equip?: string; skill?: string; maker?: string
  formations?: Formation[]; formation?: string
  details?: Record<string, { name?: string; deck?: string; equip?: string; skill?: string; formations?: Formation[] }>
  [key: string]: unknown
}
type PveBuild = { id: string; category: string; key: string; sub_key: string; data: Record<string, unknown> }

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
    { key:'eye_of_doom', cat:'normal_raid', name:'파멸의 눈동자' },
    { key:'umawang',     cat:'normal_raid', name:'우마왕' },
    { key:'iron_predator',cat:'normal_raid',name:'강철의 포식자' },
  ]},
  { group:'돌발 레이드', items:[
    { key:'leonid',    cat:'event_raid', name:'레오니드' },
    { key:'astraea',   cat:'event_raid', name:'아스트레이아' },
    { key:'callistra', cat:'event_raid', name:'칼리스트라' },
  ]},
]
const DESTRUCT_TURNS = ['4','8','12','16','20']

function fmtScore(n: number) { return n.toLocaleString('ko-KR') }

// ── 메인 ──────────────────────────────────────────────────────────────────
export default function PvePage() {
  const { data: session } = useSession()
  void session // 추후 빌드 수정 권한 체크에 사용

  const [mainTab, setMainTab] = useState<'score' | 'build'>('score')

  // 점수 탭 상태
  const [scoreType, setScoreType]   = useState<'siege' | 'advent'>('siege')
  const [selectedDay, setSelectedDay] = useState('월')
  const [season, setSeason]         = useState<'this' | 'last'>('this')
  const [scores, setScores]         = useState<PveScore[]>([])
  const [scLoading, setScLoading]   = useState(false)

  // 빌드 탭 상태
  const [buildCat, setBuildCat]     = useState<'siege' | 'advent' | 'raid'>('siege')
  const [selectedBoss, setSelectedBoss] = useState<{ key: string; cat: string; name: string } | null>(null)
  const [turn, setTurn]             = useState('8')

  const [rawBuilds, setRawBuilds]   = useState<PveBuild[]>([])
  const [bdLoading, setBdLoading]   = useState(false)

  // 빌드 탭 내 선택 상태
  const [activeBuildKey, setActiveBuildKey] = useState('build1')
  const [activeDetail, setActiveDetail]     = useState<string | ''>('')

  // ── 점수 로드 ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (mainTab !== 'score') return
    setScLoading(true)
    const key = scoreType === 'siege' ? selectedDay : '파괴신'
    supabase.from('pve_scores').select('*')
      .eq('type', scoreType).eq('key', key).eq('season', season)
      .order('score', { ascending: false })
      .then(({ data }) => { if (data) setScores(data as PveScore[]); setScLoading(false) })
  }, [mainTab, scoreType, selectedDay, season])

  // ── 빌드 로드 ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (mainTab !== 'build' || !selectedBoss) return
    setBdLoading(true)
    setActiveBuildKey('build1')
    setActiveDetail('')
    let q = supabase.from('pve_builds').select('*')
      .eq('category', selectedBoss.cat).eq('key', selectedBoss.key)
    if (selectedBoss.cat === 'advent' && (selectedBoss.key === 'destruct1' || selectedBoss.key === 'destruct2')) {
      q = q.eq('sub_key', turn)
    }
    q.then(({ data }) => { if (data) setRawBuilds(data as PveBuild[]); setBdLoading(false) })
  }, [mainTab, selectedBoss, turn])

  // ── 빌드 데이터 파싱 ─────────────────────────────────────────────────────
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

  function selectBoss(key: string, cat: string, name: string) {
    setSelectedBoss({ key, cat, name })
    setActiveBuildKey('build1')
    setActiveDetail('')
  }

  // 카테고리 변경 시 보스 선택 초기화
  function changeCat(cat: 'siege' | 'advent' | 'raid') {
    setBuildCat(cat)
    setSelectedBoss(null)
    setRawBuilds([])
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

      {/* ── 점수 탭 ────────────────────────────────────────────────────────── */}
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

      {/* ── 빌드 탭 (V1 스타일: 왼쪽 보스 목록 + 오른쪽 상세) ────────────── */}
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
            {/* 왼쪽: 보스 버튼 그리드 */}
            <div>
              {/* 공성전: 요일 버튼 */}
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

              {/* 강림: 보스 버튼 */}
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

              {/* 레이드: 그룹별 보스 */}
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
                  {/* 보스 이름 */}
                  <p className="text-white font-bold text-base mb-3">{selectedBoss.name}</p>

                  {/* 파괴신 턴 수 선택 */}
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
                  ) : buildSlots.length === 0 ? (
                    <p className="text-slate-600 text-sm py-8 text-center">등록된 빌드가 없어요</p>
                  ) : (
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

                      {/* 진형 (FormationGrid) */}
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

                      {/* 덱·스킬·장비 */}
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
