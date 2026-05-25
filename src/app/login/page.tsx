'use client'

import { useState, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [nicknames, setNicknames] = useState<string[]>([])
  const [nickname, setNickname] = useState('')
  const [entryCode, setEntryCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function fetchNicknames() {
      const { data } = await supabase
        .from('users')
        .select('nickname')
        .order('nickname')
      if (data) setNicknames(data.map((u) => u.nickname))
    }
    fetchNicknames()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await signIn('credentials', {
      nickname,
      entry_code: entryCode,
      redirect: false,
    })

    setLoading(false)

    if (result?.error) {
      setError('닉네임 또는 입장코드가 올바르지 않아요.')
    } else {
      router.push('/')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="w-full max-w-sm p-8 rounded-2xl bg-gray-900 border border-gray-800">
        <h1 className="text-2xl font-bold text-white text-center mb-2">불굴 길드</h1>
        <p className="text-gray-400 text-center text-sm mb-8">닉네임과 입장코드를 입력해주세요</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">닉네임</label>
            <select
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-blue-500"
              required
            >
              <option value="">닉네임 선택</option>
              {nicknames.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">입장코드</label>
            <input
              type="password"
              value={entryCode}
              onChange={(e) => setEntryCode(e.target.value)}
              maxLength={6}
              placeholder="6자리 코드"
              className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium transition-colors"
          >
            {loading ? '확인 중...' : '입장'}
          </button>
        </form>
      </div>
    </div>
  )
}
