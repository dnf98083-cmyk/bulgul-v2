'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { supabase } from '@/lib/supabase/client'
import { CalendarDays, Trash2, Trophy, Skull } from 'lucide-react'
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

const TYPE_STYLE: Record<string, string> = {
  '확실한 승': 'text-emerald-400',
  '내줘도 됨':  'text-blue-400',
  '위험':       'text-red-400',
  '보통':       'text-slate-400',
}

function today() { return new Date().toISOString().split('T')[0] }

export default function TodayPage() {
  const { data: session } = useSession()
  const isAdmin = ['관리자', '연구원'].includes(((session?.user as { role?: string })?.role) ?? '')

  const [logs, setLogs]       = useState<Log[]>([])
  const [date, setDate]       = useState(today())
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('guild_war_logs')
      .select('*')
      .eq('log_date', date)
      .order('created_at', { ascending: false })
    if (data) setLogs(data as Log[])
    setLoading(false)
  }, [date])

  useEffect(() => { void load() }, [load])

  async function deleteLog(id: string) {
    if (!confirm('이 기록을 삭제할까요?')) return
    await supabase.from('guild_war_logs').delete().eq('id', id)
    setLogs(prev => prev.filter(l => l.id !== id))
    toast.success('삭제됨')
  }

  const wins  = logs.filter(l => l.result === 'win').length
  const loses = logs.filter(l => l.result === 'lose').length

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto">
      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-5">
        <CalendarDays size={22} className="text-amber-400" />
        <h1 className="text-xl font-bold text-white">오늘의 길드전</h1>
      </div>

      {/* 날짜 선택 + 통계 */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="bg-[#0f0f26] border border-amber-900/20 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/40"
        />
        <button
          onClick={() => setDate(today())}
          className="px-3 py-2 rounded-xl text-xs text-slate-500 border border-slate-800 hover:text-slate-300 transition-colors"
        >
          오늘
        </button>
        {logs.length > 0 && (
          <div className="flex items-center gap-3 ml-auto text-sm font-bold">
            <span className="text-emerald-400">{wins}승</span>
            <span className="text-red-400">{loses}패</span>
            <span className="text-slate-500 font-normal text-xs">{logs.length}전</span>
          </div>
        )}
      </div>

      {/* 로그 목록 */}
      {loading ? (
        <p className="text-slate-500 text-center py-12">불러오는 중...</p>
      ) : logs.length === 0 ? (
        <div className="text-center py-16">
          <CalendarDays size={32} className="text-slate-700 mx-auto mb-3" />
          <p className="text-slate-600 text-sm">{date === today() ? '오늘 기록이 없어요' : '이 날 기록이 없어요'}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {logs.map(log => (
            <div
              key={log.id}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors',
                log.result === 'win'
                  ? 'bg-emerald-500/5 border-emerald-500/20'
                  : 'bg-red-500/5 border-red-500/20'
              )}
            >
              {/* 결과 아이콘 */}
              <div className="shrink-0">
                {log.result === 'win'
                  ? <Trophy size={16} className="text-emerald-400" />
                  : <Skull size={16} className="text-red-400" />}
              </div>

              {/* 닉네임 */}
              <p className="text-sm font-bold text-slate-300 w-16 shrink-0 truncate">{log.nickname}</p>

              {/* 공격덱 */}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white font-medium truncate">{log.attack_name}</p>
                {log.attack_type && (
                  <p className={cn('text-[10px]', TYPE_STYLE[log.attack_type] ?? 'text-slate-500')}>
                    {log.attack_type}
                  </p>
                )}
              </div>

              {/* vs 방어팀 */}
              <div className="text-right shrink-0 max-w-[120px]">
                <p className="text-[10px] text-slate-600">vs</p>
                <p className="text-xs text-slate-400 truncate">{log.defense_name}</p>
              </div>

              {/* 삭제 (관리자) */}
              {isAdmin && (
                <button
                  onClick={() => void deleteLog(log.id)}
                  className="shrink-0 p-1.5 rounded-lg text-slate-700 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
