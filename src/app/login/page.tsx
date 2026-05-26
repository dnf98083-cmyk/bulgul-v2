'use client'

import { useState, useEffect, useRef } from 'react'
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
  const [showList, setShowList] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  const filtered = nickname.trim()
    ? nicknames.filter(n => n.toLowerCase().includes(nickname.toLowerCase()))
    : nicknames

  useEffect(() => {
    supabase
      .from('users')
      .select('nickname')
      .order('nickname')
      .then(({ data }) => {
        if (data) setNicknames(data.map(u => u.nickname))
      })
  }, [])

  // 바깥 클릭 시 목록 닫기
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowList(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function selectNickname(n: string) {
    setNickname(n)
    setShowList(false)
  }

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault()
    if (!nickname) { setError('닉네임을 선택하거나 입력해주세요.'); return }
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
    <div className="min-h-screen flex items-center justify-center bg-[#0c0c1e]">
      <div className="w-full max-w-sm p-8 rounded-2xl bg-[#0f0f26] border border-amber-900/30">
        <p className="text-amber-500 text-xs font-medium tracking-widest uppercase text-center mb-1">Seven Knights Reverse</p>
        <h1 className="text-2xl font-bold text-white text-center mb-1">불굴 길드</h1>
        <p className="text-slate-500 text-center text-sm mb-8">닉네임과 입장코드를 입력해주세요</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 닉네임 — 타이핑 + 목록 선택 */}
          <div>
            <label className="block text-sm text-slate-400 mb-1">닉네임</label>
            <div ref={wrapperRef} className="relative">
              <input
                type="text"
                value={nickname}
                onChange={e => { setNickname(e.target.value); setShowList(true) }}
                onFocus={() => setShowList(true)}
                placeholder="닉네임 입력 또는 선택"
                autoComplete="off"
                className="w-full px-4 py-2 rounded-lg bg-[#16163a] border border-amber-900/30 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                required
              />
              {showList && filtered.length > 0 && (
                <ul className="absolute z-50 w-full mt-1 rounded-lg bg-[#16163a] border border-amber-900/30 max-h-52 overflow-y-auto shadow-xl">
                  {filtered.map(n => (
                    <li key={n}>
                      <button
                        type="button"
                        onMouseDown={() => selectNickname(n)}
                        className="w-full text-left px-4 py-2 text-sm text-slate-200 hover:bg-amber-500/10 hover:text-amber-300 transition-colors"
                      >
                        {n}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* 입장코드 */}
          <div>
            <label className="block text-sm text-slate-400 mb-1">입장코드</label>
            <input
              type="password"
              value={entryCode}
              onChange={e => setEntryCode(e.target.value)}
              maxLength={6}
              placeholder="6자리 코드"
              className="w-full px-4 py-2 rounded-lg bg-[#16163a] border border-amber-900/30 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
              required
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-semibold transition-colors"
          >
            {loading ? '확인 중...' : '입장'}
          </button>
        </form>
      </div>
    </div>
  )
}
