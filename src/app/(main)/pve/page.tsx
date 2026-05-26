'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Target, Trophy, BookOpen, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'

// ── 타입 ──────────────────────────────────────────
type PveScore = {
  id: string
  type: string
  key: string
  season: string
  nickname: string
  score: number
  date: string | null
}

type Formation = { pet?: string; val: string; label?: string }

type BuildData = {
  buildName?: string
  deck?: string
  equip?: string
  skill?: string
  maker?: string
  formations?: Formation[]
  formation?: string
  details?: Record<string, { name?: string; deck?: string; equip?: string; skill?: string; formations?: Formation[] }>
  [key: string]: unknown
}

type PveBuild = {
  id: string
  category: string
  key: string
  sub_key: string
  data: BuildData | Record<string, BuildData>
}

// ── 상수 ──────────────────────────────────────────
const DAYS = ['월', '화', '수', '목', '금', '토', '일'] as const
const DAY_KEY: Record<string, string> = { 월: 'mon', 화: 'tue', 수: 'wed', 목: 'thu', 금: 'fri', 토: 'sat', 일: 'sun' }

const ADVENT_TABS = [
  { key: 'destruct1', label: '파괴신 1라' },
  { key: 'destruct2', label: '파괴신 2라' },
  { key: 'teo',       label: '태오' },
  { key: 'karma',     label: '카르마' },
  { key: 'kyle',      label: '카일' },
  { key: 'yeonhee',   label: '연희' },
]

const RAID_TABS = [
  { key: 'astraea',    label: '아스트라에아', cat: 'event_raid' },
  { key: 'callistra',  label: '칼리스트라',   cat: 'event_raid' },
  { key: 'leonid',     label: '레오니드',     cat: 'event_raid' },
  { key: 'eye_of_doom',label: '멸망의 눈',    cat: 'normal_raid' },
]

const DESTRUCT_TURNS = ['4', '8', '12', '16', '20']

function fmtScore(n: number) {
  return n.toLocaleString('ko-KR')
}

// ── 빌드 카드 컴포넌트 ─────────────────────────────
function BuildCard({ build, label }: { build: BuildData; label?: string }) {
  const [open, setOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState<Record<string, boolean>>({})

  const formations = build.formations ?? (build.formation ? [{ val: build.formation }] : [])
  const hasContent = build.deck || build.equip || build.skill
  const hasDetails = build.details && Object.keys(build.details).length > 0

  return (
    <div className="bg-[#0f0f26] border border-amber-900/20 rounded-xl overflow-hidden">
      {/* 헤더 */}
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-amber-500/5 transition-colors"
      >
        <div className="text-left">
          <p className="text-white font-semibold text-sm">{label ?? build.buildName ?? '빌드'}</p>
          {formations.length > 0 && (
            <p className="text-xs text-amber-400/80 mt-0.5 font-mono">{formations[0].val}</p>
          )}
          {formations[0]?.pet && (
            <p className="text-xs text-slate-500">펫: {formations[0].pet}</p>
          )}
        </div>
        {open ? <ChevronUp size={16} className="text-slate-500 shrink-0" /> : <ChevronDown size={16} className="text-slate-500 shrink-0" />}
      </button>

      {open && hasContent && (
        <div className="px-4 pb-4 space-y-3 border-t border-amber-900/10">
          {formations.length > 1 && (
            <div className="pt-3 space-y-1">
              {formations.map((f, i) => (
                <p key={i} className="text-xs text-amber-400/80 font-mono">{f.val}{f.pet ? ` (펫: ${f.pet})` : ''}</p>
              ))}
            </div>
          )}
          {build.deck && (
            <div className="pt-3">
              <p className="text-[11px] text-amber-500 font-medium mb-1">덱 구성</p>
              <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed">{build.deck}</p>
            </div>
          )}
          {build.skill && (
            <div>
              <p className="text-[11px] text-amber-500 font-medium mb-1">스킬 순서</p>
              <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed font-mono">{build.skill}</p>
            </div>
          )}
          {build.equip && (
            <div>
              <p className="text-[11px] text-amber-500 font-medium mb-1">장비 세팅</p>
              <p className="text-xs text-slate-400 whitespace-pre-line leading-relaxed">{build.equip}</p>
            </div>
          )}
          {build.maker && (
            <p className="text-[11px] text-slate-600">작성: {build.maker}</p>
          )}

          {/* 세부 빌드 */}
          {hasDetails && (
            <div className="space-y-2 pt-1">
              <p className="text-[11px] text-slate-500 font-medium">세부 빌드 변형</p>
              {Object.entries(build.details!).map(([dId, d]) => (
                <div key={dId} className="border border-amber-900/15 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setDetailOpen(v => ({ ...v, [dId]: !v[dId] }))}
                    className="w-full flex items-center justify-between px-3 py-2 hover:bg-amber-500/5 transition-colors"
                  >
                    <p className="text-xs text-slate-300 text-left">{d.name ?? '변형 빌드'}</p>
                    {detailOpen[dId] ? <ChevronUp size={14} className="text-slate-600 shrink-0" /> : <ChevronDown size={14} className="text-slate-600 shrink-0" />}
                  </button>
                  {detailOpen[dId] && (
                    <div className="px-3 pb-3 space-y-2 border-t border-amber-900/10">
                      {d.formations?.map((f, i) => (
                        <p key={i} className="text-xs text-amber-400/70 font-mono pt-2">{f.val}{f.pet ? ` (펫: ${f.pet})` : ''}</p>
                      ))}
                      {d.skill && <p className="text-xs text-slate-300 whitespace-pre-line font-mono">{d.skill}</p>}
                      {d.equip && <p className="text-xs text-slate-400 whitespace-pre-line">{d.equip}</p>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── 메인 페이지 ────────────────────────────────────
export default function PvePage() {
  const [mainTab, setMainTab]       = useState<'score' | 'build'>('score')
  const [scoreType, setScoreType]   = useState<'siege' | 'advent'>('siege')
  const [selectedDay, setSelectedDay] = useState<string>('월')
  const [season, setSeason]         = useState<'this' | 'last'>('this')

  const [buildCat, setBuildCat]     = useState<'siege' | 'advent' | 'raid'>('siege')
  const [buildDay, setBuildDay]     = useState<string>('월')
  const [adventKey, setAdventKey]   = useState<string>('destruct1')
  const [raidKey, setRaidKey]       = useState<string>('astraea')
  const [destructTurn, setDestructTurn] = useState<string>('8')

  const [scores, setScores]         = useState<PveScore[]>([])
  const [builds, setBuilds]         = useState<PveBuild[]>([])
  const [scLoading, setScLoading]   = useState(false)
  const [bdLoading, setBdLoading]   = useState(false)

  // ── 점수 로드 ──────────────────────────────────
  useEffect(() => {
    if (mainTab !== 'score') return
    setScLoading(true)
    const type = scoreType
    const key  = type === 'siege' ? selectedDay : '파괴신'
    supabase
      .from('pve_scores')
      .select('*')
      .eq('type', type)
      .eq('key', key)
      .eq('season', season)
      .order('score', { ascending: false })
      .then(({ data }) => {
        if (data) setScores(data as PveScore[])
        setScLoading(false)
      })
  }, [mainTab, scoreType, selectedDay, season])

  // ── 빌드 로드 ──────────────────────────────────
  useEffect(() => {
    if (mainTab !== 'build') return
    setBdLoading(true)
    let query = supabase.from('pve_builds').select('*')

    if (buildCat === 'siege') {
      query = query.eq('category', 'siege').eq('key', DAY_KEY[buildDay])
    } else if (buildCat === 'advent') {
      query = query.eq('category', 'advent').eq('key', adventKey)
      if (adventKey === 'destruct1' || adventKey === 'destruct2') {
        query = query.eq('sub_key', destructTurn)
      }
    } else {
      const raidTab = RAID_TABS.find(t => t.key === raidKey)
      if (raidTab) query = query.eq('category', raidTab.cat).eq('key', raidKey)
    }

    query.then(({ data }) => {
      if (data) setBuilds(data as PveBuild[])
      setBdLoading(false)
    })
  }, [mainTab, buildCat, buildDay, adventKey, destructTurn, raidKey])

  // ── 빌드 렌더 헬퍼 ────────────────────────────
  function renderBuilds() {
    if (bdLoading) return <p className="text-slate-500 text-center py-12">불러오는 중...</p>
    if (builds.length === 0) return <p className="text-slate-600 text-center py-12">등록된 빌드가 없어요</p>

    const items: { key: string; build: BuildData; label: string }[] = []

    builds.forEach(b => {
      const d = b.data as Record<string, unknown>

      // buildOrder가 있으면 그 순서로, 없으면 buildN 순서로
      const order: string[] = (d.buildOrder as string[] | undefined) ?? []
      const buildKeys = Object.keys(d).filter(k => k.startsWith('build') && k !== 'buildOrder')
      const sorted = order.length > 0
        ? [...new Set([...order, ...buildKeys])]
        : buildKeys.sort()

      if (sorted.length > 0) {
        sorted.forEach(bk => {
          const bd = d[bk] as BuildData | undefined
          if (!bd || typeof bd !== 'object') return
          items.push({ key: `${b.id}-${bk}`, build: bd, label: bd.buildName ?? bk })
        })
      } else {
        // build 키가 없는 경우 직접 렌더
        items.push({ key: b.id, build: d as BuildData, label: (d.buildName as string) ?? `빌드 ${b.sub_key}` })
      }
    })

    return (
      <div className="space-y-3">
        {items.map(it => (
          <BuildCard key={it.key} build={it.build} label={it.label} />
        ))}
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto">
      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-6">
        <Target size={22} className="text-amber-400" />
        <h1 className="text-xl font-bold text-white">PVE</h1>
      </div>

      {/* 메인 탭 */}
      <div className="flex gap-2 mb-6">
        {(['score', 'build'] as const).map(t => (
          <button
            key={t}
            onClick={() => setMainTab(t)}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              mainTab === t
                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                : 'text-slate-400 border border-transparent hover:text-slate-200 hover:bg-white/5'
            )}
          >
            {t === 'score' ? <><Trophy size={15} /> 점수</> : <><BookOpen size={15} /> 빌드</>}
          </button>
        ))}
      </div>

      {/* ── 점수 탭 ── */}
      {mainTab === 'score' && (
        <div>
          {/* 공성전 / 파괴신 */}
          <div className="flex gap-2 mb-4">
            {(['siege', 'advent'] as const).map(t => (
              <button
                key={t}
                onClick={() => setScoreType(t)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border',
                  scoreType === t
                    ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                    : 'text-slate-500 border-slate-800 hover:text-slate-300'
                )}
              >
                {t === 'siege' ? '공성전' : '파괴신'}
              </button>
            ))}
          </div>

          {/* 공성전: 요일 선택 */}
          {scoreType === 'siege' && (
            <div className="flex gap-1.5 mb-4 flex-wrap">
              {DAYS.map(d => (
                <button
                  key={d}
                  onClick={() => setSelectedDay(d)}
                  className={cn(
                    'w-9 h-9 rounded-lg text-sm font-bold transition-colors border',
                    selectedDay === d
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                      : 'text-slate-500 border-slate-800 hover:text-slate-300'
                  )}
                >
                  {d}
                </button>
              ))}
            </div>
          )}

          {/* 시즌 토글 */}
          <div className="flex gap-2 mb-5">
            {(['this', 'last'] as const).map(s => (
              <button
                key={s}
                onClick={() => setSeason(s)}
                className={cn(
                  'px-3 py-1 rounded-full text-xs font-medium transition-colors',
                  season === s
                    ? 'bg-slate-600 text-slate-200'
                    : 'text-slate-600 hover:text-slate-400'
                )}
              >
                {s === 'this' ? '이번 시즌' : '지난 시즌'}
              </button>
            ))}
          </div>

          {/* 점수 목록 */}
          {scLoading ? (
            <p className="text-slate-500 text-center py-12">불러오는 중...</p>
          ) : scores.length === 0 ? (
            <p className="text-slate-600 text-center py-12">등록된 점수가 없어요</p>
          ) : (
            <div className="space-y-1.5">
              {scores.map((s, i) => (
                <div
                  key={s.id}
                  className={cn(
                    'flex items-center gap-3 px-4 py-2.5 rounded-xl border',
                    i === 0 ? 'bg-amber-500/10 border-amber-500/30' :
                    i === 1 ? 'bg-slate-700/20 border-slate-700/30' :
                    i === 2 ? 'bg-amber-900/10 border-amber-900/20' :
                    'bg-[#0f0f26] border-amber-900/10'
                  )}
                >
                  <span className={cn(
                    'text-sm font-bold w-6 text-center',
                    i === 0 ? 'text-amber-400' : i === 1 ? 'text-slate-400' : i === 2 ? 'text-amber-700' : 'text-slate-600'
                  )}>
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

      {/* ── 빌드 탭 ── */}
      {mainTab === 'build' && (
        <div>
          {/* 카테고리 선택 */}
          <div className="flex gap-2 mb-4 flex-wrap">
            {(['siege', 'advent', 'raid'] as const).map(t => (
              <button
                key={t}
                onClick={() => setBuildCat(t)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border',
                  buildCat === t
                    ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                    : 'text-slate-500 border-slate-800 hover:text-slate-300'
                )}
              >
                {t === 'siege' ? '공성전' : t === 'advent' ? '강림' : '레이드'}
              </button>
            ))}
          </div>

          {/* 공성전: 요일 */}
          {buildCat === 'siege' && (
            <div className="flex gap-1.5 mb-5 flex-wrap">
              {DAYS.map(d => (
                <button
                  key={d}
                  onClick={() => setBuildDay(d)}
                  className={cn(
                    'w-9 h-9 rounded-lg text-sm font-bold transition-colors border',
                    buildDay === d
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                      : 'text-slate-500 border-slate-800 hover:text-slate-300'
                  )}
                >
                  {d}
                </button>
              ))}
            </div>
          )}

          {/* 강림: 보스 + 파괴신 턴수 */}
          {buildCat === 'advent' && (
            <div className="space-y-3 mb-5">
              <div className="flex gap-2 flex-wrap">
                {ADVENT_TABS.map(t => (
                  <button
                    key={t.key}
                    onClick={() => setAdventKey(t.key)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border',
                      adventKey === t.key
                        ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                        : 'text-slate-500 border-slate-800 hover:text-slate-300'
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              {(adventKey === 'destruct1' || adventKey === 'destruct2') && (
                <div className="flex gap-2">
                  {DESTRUCT_TURNS.map(t => (
                    <button
                      key={t}
                      onClick={() => setDestructTurn(t)}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border',
                        destructTurn === t
                          ? 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                          : 'text-slate-500 border-slate-800 hover:text-slate-300'
                      )}
                    >
                      {t}턴
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 레이드: 보스 */}
          {buildCat === 'raid' && (
            <div className="flex gap-2 mb-5 flex-wrap">
              {RAID_TABS.map(t => (
                <button
                  key={t.key}
                  onClick={() => setRaidKey(t.key)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border',
                    raidKey === t.key
                      ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                      : 'text-slate-500 border-slate-800 hover:text-slate-300'
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          )}

          {renderBuilds()}
        </div>
      )}
    </div>
  )
}
