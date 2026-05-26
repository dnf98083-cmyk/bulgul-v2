'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { UserCog, Trash2, RefreshCw, Shield } from 'lucide-react'

type User = {
  id: string
  nickname: string
  entry_code: string
  role: '일반' | '연구원' | '관리자'
  created_at: string
}

const ROLE_OPTIONS = ['일반', '연구원', '관리자'] as const

export default function AdminUsersPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  const myRole = (session?.user as any)?.role

  useEffect(() => {
    if (myRole && myRole !== '관리자') router.replace('/')
  }, [myRole, router])

  useEffect(() => {
    fetchUsers()
  }, [])

  async function fetchUsers() {
    setLoading(true)
    const { data } = await supabase
      .from('users')
      .select('*')
      .order('nickname')
    if (data) setUsers(data as User[])
    setLoading(false)
  }

  async function changeRole(nickname: string, role: string) {
    await supabase.from('users').update({ role }).eq('nickname', nickname)
    setUsers(prev => prev.map(u => u.nickname === nickname ? { ...u, role: role as User['role'] } : u))
  }

  async function regenerateCode(nickname: string) {
    const newCode = String(Math.floor(100000 + Math.random() * 900000))
    await supabase.from('users').update({ entry_code: newCode }).eq('nickname', nickname)
    setUsers(prev => prev.map(u => u.nickname === nickname ? { ...u, entry_code: newCode } : u))
    alert(`${nickname}의 새 코드: ${newCode}`)
  }

  async function deleteUser(nickname: string) {
    if (!confirm(`${nickname}을 삭제할까요?`)) return
    await supabase.from('users').delete().eq('nickname', nickname)
    setUsers(prev => prev.filter(u => u.nickname !== nickname))
  }

  if (myRole !== '관리자') return null

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Shield size={22} className="text-amber-400" />
        <h1 className="text-xl font-bold text-white">길드원 관리</h1>
        <span className="ml-auto text-sm text-slate-500">{users.length}명</span>
      </div>

      {loading ? (
        <p className="text-slate-500 text-center py-12">불러오는 중...</p>
      ) : (
        <div className="space-y-2">
          {users.map(user => (
            <div
              key={user.id}
              className="bg-[#0f0f26] border border-amber-900/20 rounded-xl px-4 py-3 flex items-center gap-3"
            >
              {/* 닉네임 + 코드 */}
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm">{user.nickname}</p>
                <p className="text-slate-600 text-xs font-mono mt-0.5">코드: {user.entry_code}</p>
              </div>

              {/* 역할 변경 */}
              <select
                value={user.role}
                onChange={e => changeRole(user.nickname, e.target.value)}
                className={`text-xs px-2 py-1 rounded-lg border bg-[#16163a] focus:outline-none
                  ${user.role === '관리자' ? 'text-amber-400 border-amber-500/40' :
                    user.role === '연구원' ? 'text-blue-400 border-blue-500/40' :
                    'text-slate-400 border-slate-700'}`}
              >
                {ROLE_OPTIONS.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>

              {/* 코드 재발급 */}
              <button
                onClick={() => regenerateCode(user.nickname)}
                title="코드 재발급"
                className="p-1.5 rounded-lg text-slate-500 hover:text-amber-400 hover:bg-amber-500/10 transition-colors"
              >
                <RefreshCw size={15} />
              </button>

              {/* 삭제 */}
              <button
                onClick={() => deleteUser(user.nickname)}
                title="삭제"
                className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
