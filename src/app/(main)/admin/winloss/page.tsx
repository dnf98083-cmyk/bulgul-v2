'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { BarChart2, Trash2, Trophy, Skull } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

type Log = {
  id: string
  attack_name: string
  attack_type: string | null
  defense_name: string
  nickname: string
  result: 'win' | 'lose'
  log_date: string
  created_at: string
}

function today() { return new Date().toISOString().split('T')[0] }
function weekAgo() {
  const d = new Date()
  d.setDate(d.getDate() - 7)
  return d.toISOString().split('T')[0]
}

export default function WinLossPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const role = ((session?.user as { role?: string })?.role) ?? ''

  useEffect(() => {
    if (role && !['관리자', '연구원'].includes(role)) router.replace('/')
  }, [role, router])

  const [logs, setLogs]         = useState<Log[]>([])
  const [loading, setLoading]   = useState(true)
  const [dateFrom, setDateFrom] = useState(weekAgo())
  const [dateTo, setDateTo]     = useState(today())
  const [filterNick, setFilterNick] = useState('')
  const [filterResult, setFilterResult] = useState<'all' | 'win' | 'lose'>('all')

  const load = useCallback(async () => {
    setLoading(true)
    let q = supabase.from('guild_war_logs').select('*')
      .gte('log_date', dateFrom)
      .lte('log_date', dateTo)
      .order('log_date', { ascending: false })
      .order('created_at', { ascending: false })
    const { data } = await q
    if (data) setLogs(data as Log[])
    setLoading(false)
  }, [dateFrom, dateTo])

  useEffect(() => { void load() }, [load])

  async function deleteLog(id: string) {
    if (!confirm('삭제할까요?')) return
    await supabase.from('guild_war_logs').delete().eq('id', id)
    setLogs(prev => prev.filter(l => l.id !== id))
    toast.success('삭제됨')
  }

  const filtered = logs.filter(l => {
    if (filterNick && !l.nickname.includes(filterNick)) return false
    if (filterResult !== 'all' && l.result !== filterResult) return false
    return true
  })

  const wins  = filtered.filter(l => l.result === 'win').length
  const loses = filtered.filter(l => l.result === 'lose').length
  const total = wins + loses
  const rate  = total > 0 ? Math.round(wins / total * 100) : null

  if (!['관리자', '연구원'].includes(role)) return null

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-5">
        <BarChart2 size={22} className="text-amber-400" />
        <h1 className="text-xl font-bold text-white">승패 관리</h1>
      </div>

      {/* 필터 */}
      <div className="bg-[#0f0f26] border border-amber-900/15 rounded-xl p-4 mb-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <p className="text-[10px] text-slate-600 mb-1">시작일</p>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
              className="w-full bg-[#0c0c1e] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none" />
          </div>
          <div>
            <p className="text-[10px] text-slate-600 mb-1">종료일</p>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
              className="w-full bg-[#0c0c1e] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none" />
          </div>
          <div>
            <p className="text-[10px] text-slate-600 mb-1">닉네임</p>
            <input value={filterNick} onChange={e => setFilterNick(e.target.value)} placeholder="전체"
              className="w-full bg-[#0c0c1e] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none placeholder-slate-600" />
          </div>
          <div>
            <p className="text-[10px] text-slate-600 mb-1">결과</p>
            <select value={filterResult} onChange={e => setFilterResult(e.target.value as 'all'|'win'|'lose')}
              className="w-full bg-[#0c0c1e] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none">
              <option value="all">전체</option>
              <option value="win">승리</option>
              <option value="lose">패배</option>
            </select>
          </div>
        </div>
      </div>

      {/* 요약 */}
      {!loading && total > 0 && (
        <div className="flex items-center gap-4 mb-4 text-sm">
          <span className="text-emerald-400 font-bold">{wins}승</span>
          <span className="text-red-400 font-bold">{loses}패</span>
          <span className="text-slate-500">{total}전</span>
          {rate !== null && <span className="text-amber-400 font-bold ml-auto">{rate}%</span>}
        </div>
      )}

      {/* 목록 */}
      {loading ? (
        <p className="text-slate-500 text-center py-12">불러오는 중...</p>
      ) : filtered.length === 0 ? (
        <p className="text-slate-600 text-center py-12">기록이 없어요</p>
      ) : (
        <div className="space-y-1.5">
          {filtered.map(log => (
            <div key={log.id}
              className={cn('flex items-center gap-3 px-4 py-2.5 rounded-xl border',
                log.result === 'win' ? 'bg-emerald-500/5 border-emerald-500/15' : 'bg-red-500/5 border-red-500/15')}>
              {log.result === 'win'
                ? <Trophy size={14} className="text-emerald-400 shrink-0" />
                : <Skull size={14} className="text-red-400 shrink-0" />}
              <p className="text-xs font-bold text-slate-300 w-16 shrink-0 truncate">{log.nickname}</p>
              <p className="flex-1 text-xs text-white truncate">{log.attack_name}</p>
              <p className="text-xs text-slate-500 shrink-0 truncate max-w-[100px]">vs {log.defense_name}</p>
              <p className="text-[10px] text-slate-600 shrink-0 w-20 text-right">{log.log_date}</p>
              <button onClick={() => void deleteLog(log.id)}
                className="shrink-0 p-1 rounded text-slate-700 hover:text-red-400 transition-colors">
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
