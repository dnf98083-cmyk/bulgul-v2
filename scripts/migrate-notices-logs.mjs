// Firebase notices + guild_war_logs → Supabase 마이그레이션
// 실행: node scripts/migrate-notices-logs.mjs

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pkrzpohigiwdralsscdy.supabase.co'
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } })
const raw = JSON.parse(readFileSync(join(__dirname, 'bulgul-guild-default-rtdb-export .json'), 'utf-8'))

// ── 공지사항 마이그레이션 ─────────────────────────────────────────────────
const noticeRows = Object.values(raw.notices || {}).map(n => ({
  title: n.title ?? '',
  body: n.body ?? '',
  author: n.author ?? '',
  created_at: n.createdAt ? new Date(n.createdAt).toISOString() : new Date().toISOString(),
  updated_at: n.createdAt ? new Date(n.createdAt).toISOString() : new Date().toISOString(),
}))

console.log(`공지사항 ${noticeRows.length}개 삽입 중...`)
const { error: noticeErr } = await supabase.from('notices').insert(noticeRows)
if (noticeErr) console.error('notices 실패:', noticeErr.message)
else console.log(`✅ 공지사항 ${noticeRows.length}개 완료`)

// ── 길드전 로그 마이그레이션 ─────────────────────────────────────────────
// Firebase defenseTeams에서 id→name 매핑 생성
const defNameMap = {}
for (const [id, def] of Object.entries(raw.defenseTeams || {})) {
  defNameMap[id] = def.name ?? '알 수 없음'
}

const logRows = Object.values(raw.logs || {}).map(l => ({
  attack_name:  l.attackName ?? '알 수 없음',
  attack_type:  l.attackType ?? '',
  defense_name: defNameMap[l.defense] ?? '알 수 없음',
  nickname:     l.nick ?? '알 수 없음',
  result:       l.result === 'win' ? 'win' : 'lose',
  log_date:     l.date ?? new Date().toISOString().split('T')[0],
}))

console.log(`\n길드전 로그 ${logRows.length}개 삽입 중...`)
// 배치 처리 (100개씩)
for (let i = 0; i < logRows.length; i += 100) {
  const batch = logRows.slice(i, i + 100)
  const { error } = await supabase.from('guild_war_logs').insert(batch)
  if (error) { console.error(`배치 ${i}~${i+100} 실패:`, error.message); break }
  process.stdout.write(`  ${Math.min(i + 100, logRows.length)}/${logRows.length}\r`)
}
console.log(`\n✅ 길드전 로그 ${logRows.length}개 완료`)
