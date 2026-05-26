'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { supabase } from '@/lib/supabase/client'
import { Bell, Plus, Pencil, Trash2, X, Check, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

type Notice = {
  id: string
  title: string
  body: string
  author: string
  created_at: string
  updated_at: string
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1)  return '방금'
  if (m < 60) return `${m}분 전`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}시간 전`
  const d = Math.floor(h / 24)
  if (d < 7)  return `${d}일 전`
  return new Date(iso).toLocaleDateString('ko-KR')
}

export default function NoticesPage() {
  const { data: session } = useSession()
  const isAdmin = ['관리자', '연구원'].includes(((session?.user as { role?: string })?.role) ?? '')

  const [notices, setNotices]     = useState<Notice[]>([])
  const [loading, setLoading]     = useState(true)
  const [expanded, setExpanded]   = useState<string | null>(null)

  // 작성/수정 폼
  const [editId, setEditId]       = useState<string | null>(null) // null=new
  const [showForm, setShowForm]   = useState(false)
  const [formTitle, setFormTitle] = useState('')
  const [formBody, setFormBody]   = useState('')
  const [saving, setSaving]       = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from('notices').select('*').order('created_at', { ascending: false })
    if (data) setNotices(data as Notice[])
    setLoading(false)
  }, [])

  useEffect(() => { void load() }, [load])

  function openNew() {
    setEditId(null)
    setFormTitle('')
    setFormBody('')
    setShowForm(true)
  }

  function openEdit(n: Notice) {
    setEditId(n.id)
    setFormTitle(n.title)
    setFormBody(n.body)
    setShowForm(true)
    setExpanded(null)
  }

  function cancelForm() {
    setShowForm(false)
    setEditId(null)
  }

  async function save() {
    if (!formBody.trim()) { toast.error('내용을 입력해주세요'); return }
    setSaving(true)
    const now = new Date().toISOString()

    if (editId) {
      await supabase.from('notices').update({
        title: formTitle.trim(),
        body: formBody.trim(),
        updated_at: now,
      }).eq('id', editId)
      toast.success('공지 수정 완료')
    } else {
      await supabase.from('notices').insert({
        title: formTitle.trim(),
        body: formBody.trim(),
        author: session?.user?.name ?? '관리자',
        created_at: now,
        updated_at: now,
      })
      toast.success('공지 등록 완료')
    }

    await load()
    setShowForm(false)
    setEditId(null)
    setSaving(false)
  }

  async function deleteNotice(id: string) {
    if (!confirm('공지를 삭제할까요?')) return
    await supabase.from('notices').delete().eq('id', id)
    setNotices(prev => prev.filter(n => n.id !== id))
    toast.success('삭제됨')
  }

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto">
      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-5">
        <Bell size={22} className="text-amber-400" />
        <h1 className="text-xl font-bold text-white">공지사항</h1>
        {isAdmin && !showForm && (
          <button
            onClick={openNew}
            className="ml-auto flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium bg-amber-500/10 text-amber-400 border border-amber-500/25 hover:bg-amber-500/20 transition-colors"
          >
            <Plus size={15} /> 공지 작성
          </button>
        )}
      </div>

      {/* 작성/수정 폼 */}
      {showForm && isAdmin && (
        <div className="bg-[#0f0f26] border border-amber-500/25 rounded-xl p-4 mb-5">
          <p className="text-xs font-bold text-amber-400 mb-3">{editId ? '공지 수정' : '새 공지 작성'}</p>
          <input
            className="w-full bg-[#0c0c1e] border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500/50 mb-2"
            placeholder="제목 (선택)"
            value={formTitle}
            onChange={e => setFormTitle(e.target.value)}
          />
          <textarea
            rows={6}
            className="w-full bg-[#0c0c1e] border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500/50 resize-y mb-3"
            placeholder="공지 내용을 입력하세요"
            value={formBody}
            onChange={e => setFormBody(e.target.value)}
          />
          <div className="flex gap-2">
            <button
              onClick={() => void save()}
              disabled={saving || !formBody.trim()}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 hover:bg-amber-500/25 transition-colors disabled:opacity-50"
            >
              <Check size={14} /> {saving ? '저장 중...' : '저장'}
            </button>
            <button onClick={cancelForm} className="px-4 py-2 rounded-xl text-sm text-slate-500 border border-slate-700 hover:text-slate-300 transition-colors">
              취소
            </button>
          </div>
        </div>
      )}

      {/* 공지 목록 */}
      {loading ? (
        <p className="text-slate-500 text-center py-12">불러오는 중...</p>
      ) : notices.length === 0 ? (
        <p className="text-slate-600 text-center py-12">등록된 공지가 없어요</p>
      ) : (
        <div className="space-y-2">
          {notices.map((n, idx) => {
            const isOpen = expanded === n.id
            const isNew  = idx === 0

            return (
              <div
                key={n.id}
                className={cn(
                  'rounded-xl border transition-all overflow-hidden',
                  isNew ? 'border-amber-500/25 bg-amber-500/5' : 'border-amber-900/15 bg-[#0f0f26]'
                )}
              >
                {/* 제목 행 */}
                <button
                  className="w-full flex items-center gap-3 px-4 py-3 text-left"
                  onClick={() => setExpanded(isOpen ? null : n.id)}
                >
                  {isNew && (
                    <span className="text-[9px] font-black bg-amber-500 text-black px-1.5 py-0.5 rounded-full shrink-0">NEW</span>
                  )}
                  <div className="flex-1 min-w-0">
                    {n.title && (
                      <p className="text-sm font-bold text-white truncate">{n.title}</p>
                    )}
                    {!isOpen && (
                      <p className={cn('text-xs text-slate-400 truncate', n.title && 'mt-0.5')}>
                        {n.body.split('\n')[0]}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] text-slate-600">{n.author} · {timeAgo(n.created_at)}</span>
                    {isOpen ? <ChevronUp size={14} className="text-slate-500" /> : <ChevronDown size={14} className="text-slate-500" />}
                  </div>
                </button>

                {/* 본문 */}
                {isOpen && (
                  <div className="px-4 pb-4">
                    <p className="text-sm text-slate-300 whitespace-pre-line leading-relaxed border-t border-amber-900/10 pt-3">
                      {n.body}
                    </p>
                    {isAdmin && (
                      <div className="flex gap-2 mt-3 pt-3 border-t border-amber-900/10">
                        <button
                          onClick={() => openEdit(n)}
                          className="flex items-center gap-1 text-xs text-slate-500 hover:text-amber-400 transition-colors"
                        >
                          <Pencil size={12} /> 수정
                        </button>
                        <button
                          onClick={() => void deleteNotice(n.id)}
                          className="flex items-center gap-1 text-xs text-slate-500 hover:text-red-400 transition-colors"
                        >
                          <Trash2 size={12} /> 삭제
                        </button>
                      </div>
                    )}
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
