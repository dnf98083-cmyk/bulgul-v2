'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { supabase } from '@/lib/supabase/client'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts'
import { Crown } from 'lucide-react'
import { toast } from 'sonner'

type Season = {
  id: string
  season_name: string
  total_score: number
  member_count: number
  recorded_at: string
}

function fmtScore(n: number) { return n.toLocaleString('ko-KR') }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload as { score: number; delta: number | null }
  const wan = d.delta !== null ? Math.round(d.delta / 10000) : null
  return (
    <div className="bg-[#16163a] border border-amber-900/20 rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="text-amber-400 font-bold mb-1">{label}</p>
      <p className="text-emerald-400 font-mono">{fmtScore(d.score)}점</p>
      {wan !== null && (
        <p className={wan >= 0 ? 'text-emerald-400' : 'text-red-400'}>
          {wan >= 0 ? '+' : ''}{wan.toLocaleString()}만
        </p>
      )}
    </div>
  )
}

// recharts 커스텀 라벨 (변화량 표시)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function DeltaLabel(props: any) {
  const { x, y, index, data } = props
  const d = data?.[index]
  if (!d || d.delta === null) return null
  const wan = Math.round(d.delta / 10000)
  return (
    <text
      x={x}
      y={y - 12}
      fill={wan >= 0 ? '#4ade80' : '#f87171'}
      fontSize={10}
      textAnchor="middle"
    >
      {wan >= 0 ? '+' : ''}{wan.toLocaleString()}만
    </text>
  )
}

export default function DestructPage() {
  const { data: session } = useSession()
  const isAdmin = ['관리자', '연구원'].includes(((session?.user as { role?: string })?.role) ?? '')

  const [seasons, setSeasons]             = useState<Season[]>([])
  const [loading, setLoading]             = useState(true)
  const [settleSeasonName, setSettleSeasonName] = useState('')
  const [settling, setSettling]           = useState(false)
  const [directName, setDirectName]       = useState('')
  const [directScore, setDirectScore]     = useState('')
  const [directSaving, setDirectSaving]   = useState(false)

  const loadSeasons = useCallback(async () => {
    const { data } = await supabase
      .from('destruct_seasons')
      .select('*')
      .order('recorded_at', { ascending: true })
    if (data) setSeasons(data as Season[])
    setLoading(false)
  }, [])

  useEffect(() => { void loadSeasons() }, [loadSeasons])

  const chartData = seasons.map((s, i) => ({
    name: s.season_name,
    score: s.total_score,
    delta: i === 0 ? null : s.total_score - seasons[i - 1].total_score,
  }))

  async function settle() {
    if (!settleSeasonName.trim()) return
    setSettling(true)

    const { data: scores } = await supabase
      .from('pve_scores')
      .select('nickname, score')
      .eq('type', 'advent')
      .eq('key', '파괴신')
      .eq('season', 'this')

    if (!scores || scores.length === 0) {
      toast.error('현재 시즌 파괴신 점수가 없어요')
      setSettling(false)
      return
    }

    const distinctNicks = [...new Set(scores.map((s: { nickname: string }) => s.nickname))]
    const totalScore    = scores.reduce((sum: number, s: { score: number }) => sum + s.score, 0)

    const { error } = await supabase.from('destruct_seasons').insert({
      season_name:  settleSeasonName.trim(),
      total_score:  totalScore,
      member_count: distinctNicks.length,
      recorded_at:  new Date().toISOString().split('T')[0],
    })

    if (error) {
      toast.error('저장 실패: ' + error.message)
    } else {
      toast.success(`${settleSeasonName} 결산 완료! 총 ${fmtScore(totalScore)}점`)
      setSettleSeasonName('')
      await loadSeasons()
    }
    setSettling(false)
  }

  async function addDirect() {
    if (!directName.trim() || !directScore.trim()) return
    const score = parseInt(directScore.replace(/[^0-9]/g, ''))
    if (isNaN(score)) { toast.error('숫자만 입력해주세요'); return }
    setDirectSaving(true)

    const { error } = await supabase.from('destruct_seasons').insert({
      season_name:  directName.trim(),
      total_score:  score,
      member_count: 0,
      recorded_at:  new Date().toISOString().split('T')[0],
    })

    if (error) {
      toast.error('저장 실패')
    } else {
      toast.success(`${directName} 등록 완료`)
      setDirectName('')
      setDirectScore('')
      await loadSeasons()
    }
    setDirectSaving(false)
  }

  async function deleteSeason(id: string, name: string) {
    if (!confirm(`"${name}" 시즌을 삭제할까요?`)) return
    await supabase.from('destruct_seasons').delete().eq('id', id)
    toast.success(`${name} 삭제됨`)
    await loadSeasons()
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-5">
        <Crown size={22} className="text-amber-400" />
        <h1 className="text-xl font-bold text-white">파괴신</h1>
        {seasons.length > 0 && (
          <span className="ml-auto text-sm text-amber-400 font-bold font-mono">
            최신: {fmtScore(seasons[seasons.length - 1].total_score)}
          </span>
        )}
      </div>

      {/* 라인 차트 */}
      <div className="bg-[#0f0f26] border border-amber-900/15 rounded-xl p-4 mb-5">
        <p className="text-xs text-slate-500 font-bold mb-4">🏅 길드 총합 점수</p>
        {loading || seasons.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-slate-600 text-sm">
            {loading ? '불러오는 중...' : '시즌 데이터가 없어요'}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData} margin={{ top: 24, right: 24, left: 8, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(245,158,11,0.08)" />
              <XAxis
                dataKey="name"
                tick={{ fill: '#64748b', fontSize: 11 }}
                axisLine={{ stroke: 'rgba(245,158,11,0.15)' }}
                tickLine={false}
              />
              <YAxis hide />
              <Tooltip content={<ChartTooltip />} />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#22c55e"
                strokeWidth={2}
                dot={{ fill: '#22c55e', r: 5, strokeWidth: 0 }}
                activeDot={{ r: 7, fill: '#4ade80' }}
                label={<DeltaLabel data={chartData} />}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* 관리자 전용 */}
      {isAdmin && (
        <>
          {/* 시즌 결산 */}
          <div className="bg-[#0f0f26] border border-amber-900/15 rounded-xl p-4 mb-3">
            <p className="text-xs font-bold text-slate-400 mb-1">🏁 시즌 결산</p>
            <p className="text-[11px] text-slate-600 mb-3">
              이번주 길드원 점수를 합산해서 시즌 기록으로 저장해요
            </p>
            <div className="flex gap-2">
              <input
                className="flex-1 bg-[#0c0c1e] border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500/50"
                placeholder="시즌명 (예: 불굴시즌6)"
                value={settleSeasonName}
                onChange={e => setSettleSeasonName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && void settle()}
              />
              <button
                onClick={() => void settle()}
                disabled={settling || !settleSeasonName.trim()}
                className="px-5 py-2.5 rounded-xl bg-amber-500 text-black font-bold text-sm hover:bg-amber-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
              >
                {settling ? '결산 중...' : '🏁 결산'}
              </button>
            </div>
          </div>

          {/* 직접 입력 */}
          <div className="mb-5">
            <p className="text-[10px] text-slate-600 font-medium mb-2">직접 입력</p>
            <div className="flex gap-2">
              <input
                className="flex-1 bg-[#0f0f26] border border-amber-900/15 rounded-xl px-3 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500/40"
                placeholder="시즌명"
                value={directName}
                onChange={e => setDirectName(e.target.value)}
              />
              <input
                className="w-36 bg-[#0f0f26] border border-amber-900/15 rounded-xl px-3 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500/40"
                placeholder="총점"
                value={directScore}
                onChange={e => setDirectScore(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && void addDirect()}
              />
              <button
                onClick={() => void addDirect()}
                disabled={directSaving || !directName.trim() || !directScore.trim()}
                className="px-5 py-2.5 rounded-xl bg-amber-500 text-black font-bold text-sm hover:bg-amber-400 transition-colors disabled:opacity-50 shrink-0"
              >
                등록
              </button>
            </div>
          </div>
        </>
      )}

      {/* 등록된 시즌 목록 */}
      {seasons.length > 0 && (
        <div>
          {isAdmin && (
            <p className="text-[10px] text-slate-600 font-medium mb-2">📋 등록된 시즌 (삭제 가능)</p>
          )}
          <div className="space-y-2">
            {[...seasons].reverse().map(s => (
              <div key={s.id} className="flex items-center gap-3 bg-[#0f0f26] border border-amber-900/15 rounded-xl px-4 py-3">
                <p className="font-bold text-white text-sm w-28 shrink-0">{s.season_name}</p>
                <p className="flex-1 font-bold text-amber-400 font-mono text-sm">{fmtScore(s.total_score)}</p>
                <p className="text-xs text-slate-600 shrink-0">
                  {s.member_count > 0 ? `${s.member_count}명 · ` : ''}{s.recorded_at}
                </p>
                {isAdmin && (
                  <button
                    onClick={() => void deleteSeason(s.id, s.season_name)}
                    className="px-3 py-1.5 rounded-lg bg-red-500/15 text-red-400 border border-red-500/25 hover:bg-red-500/25 transition-colors text-xs font-bold shrink-0"
                  >
                    취소
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
