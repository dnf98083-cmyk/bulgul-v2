'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { ClipboardList, Check, X, Trash2, Trophy, Skull } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { FormationGrid } from '@/components/FormationGrid'

type Report = {
  id: string
  defense_team_id: string | null
  defense_name: string | null
  attack_name: string
  characters: string[]
  formation: string
  ring: string
  pet: string
  armor: string
  skill: string
  attack_type: string
  result: 'win' | 'lose'
  nickname: string
  note: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
}

const STATUS_STYLE = {
  pending:  'bg-amber-500/10 text-amber-400 border-amber-500/25',
  approved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
  rejected: 'bg-red-500/10 text-red-400 border-red-500/25',
}
const STATUS_LABEL = { pending: '검토중', approved: '승인', rejected: '거절' }

export default function ReportsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const role = ((session?.user as { role?: string })?.role) ?? ''

  useEffect(() => {
    if (role && !['관리자', '연구원'].includes(role)) router.replace('/')
  }, [role, router])

  const [reports, setReports]   = useState<Report[]>([])
  const [loading, setLoading]   = useState(true)
  const [filter, setFilter]     = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending')
  const [expanded, setExpanded] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    let q = supabase.from('attack_reports').select('*').order('created_at', { ascending: false })
    if (filter !== 'all') q = q.eq('status', filter)
    const { data } = await q
    if (data) setReports(data as Report[])
    setLoading(false)
  }, [filter])

  useEffect(() => { void load() }, [load])

  async function updateStatus(id: string, status: 'approved' | 'rejected') {
    await supabase.from('attack_reports').update({ status }).eq('id', id)
    setReports(prev => prev.map(r => r.id === id ? { ...r, status } : r))
    toast.success(status === 'approved' ? '승인됨' : '거절됨')
  }

  async function approveAndAdd(r: Report) {
    if (!r.defense_team_id) { toast.error('방어팀이 지정되지 않았어요'); return }
    // 공격팀으로 등록
    const { error } = await supabase.from('attack_teams').insert({
      defense_team_id: r.defense_team_id,
      name: r.attack_name,
      characters: r.characters ?? [],
      formation: r.formation,
      ring: r.ring,
      pet: r.pet,
      armor: r.armor,
      skill: r.skill,
      type: r.attack_type,
      win: r.result === 'win' ? 1 : 0,
      lose: r.result === 'lose' ? 1 : 0,
    })
    if (error) { toast.error('등록 실패: ' + error.message); return }
    await updateStatus(r.id, 'approved')
    toast.success(`"${r.attack_name}" 공격덱으로 등록됨`)
  }

  async function deleteReport(id: string) {
    if (!confirm('삭제할까요?')) return
    await supabase.from('attack_reports').delete().eq('id', id)
    setReports(prev => prev.filter(r => r.id !== id))
    toast.success('삭제됨')
  }

  if (!['관리자', '연구원'].includes(role)) return null

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-5">
        <ClipboardList size={22} className="text-amber-400" />
        <h1 className="text-xl font-bold text-white">제보 관리</h1>
      </div>

      {/* 필터 탭 */}
      <div className="flex gap-2 mb-5">
        {(['pending', 'approved', 'rejected', 'all'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={cn('px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors',
              filter === f ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' : 'text-slate-500 border-slate-800 hover:text-slate-300')}>
            {f === 'pending' ? '검토중' : f === 'approved' ? '승인' : f === 'rejected' ? '거절' : '전체'}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-slate-500 text-center py-12">불러오는 중...</p>
      ) : reports.length === 0 ? (
        <p className="text-slate-600 text-center py-12">제보가 없어요</p>
      ) : (
        <div className="space-y-2">
          {reports.map(r => {
            const isOpen = expanded === r.id
            return (
              <div key={r.id} className="bg-[#0f0f26] border border-amber-900/15 rounded-xl overflow-hidden">
                <button
                  className="w-full flex items-center gap-3 px-4 py-3 text-left"
                  onClick={() => setExpanded(isOpen ? null : r.id)}
                >
                  {r.result === 'win'
                    ? <Trophy size={14} className="text-emerald-400 shrink-0" />
                    : <Skull size={14} className="text-red-400 shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{r.attack_name}</p>
                    <p className="text-xs text-slate-500">
                      {r.nickname} · vs {r.defense_name ?? '미정'} ·{' '}
                      {new Date(r.created_at).toLocaleDateString('ko-KR')}
                    </p>
                  </div>
                  <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0', STATUS_STYLE[r.status])}>
                    {STATUS_LABEL[r.status]}
                  </span>
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 border-t border-amber-900/10 pt-3 space-y-2">
                    {r.formation && (
                      <div>
                        <p className="text-[10px] text-slate-600 mb-1">진형</p>
                        <FormationGrid text={r.formation} />
                      </div>
                    )}
                    <div className="space-y-1 text-xs">
                      {r.ring    && <p><span className="text-slate-600 w-10 inline-block">반지</span> <span className="text-slate-300">{r.ring}</span></p>}
                      {r.pet     && <p><span className="text-slate-600 w-10 inline-block">펫</span> <span className="text-slate-300">{r.pet}</span></p>}
                      {r.skill   && <p><span className="text-slate-600 w-10 inline-block">스킬순</span> <span className="text-slate-300">{r.skill}</span></p>}
                      {r.armor   && <p className="text-slate-300 whitespace-pre-line">{r.armor}</p>}
                      {r.note    && <p className="text-amber-400/70 italic">{r.note}</p>}
                    </div>

                    {r.status === 'pending' && (
                      <div className="flex gap-2 pt-2">
                        <button onClick={() => void approveAndAdd(r)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/20 transition-colors">
                          <Check size={12} /> 승인 + 공격덱 등록
                        </button>
                        <button onClick={() => void updateStatus(r.id, 'approved')}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs bg-slate-700/30 text-slate-400 border border-slate-700 hover:text-slate-200 transition-colors">
                          <Check size={12} /> 승인만
                        </button>
                        <button onClick={() => void updateStatus(r.id, 'rejected')}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs bg-red-500/10 text-red-400 border border-red-500/25 hover:bg-red-500/20 transition-colors">
                          <X size={12} /> 거절
                        </button>
                      </div>
                    )}
                    <button onClick={() => void deleteReport(r.id)}
                      className="flex items-center gap-1 text-xs text-slate-600 hover:text-red-400 transition-colors pt-1">
                      <Trash2 size={11} /> 삭제
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
