/**
 * Firebase → Supabase 마이그레이션 스크립트
 * 실행: node scripts/migrate.js
 *
 * 필요한 환경변수 (.env.local):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY  ← Supabase 대시보드 > Settings > API > service_role
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// 환경변수 직접 로드
require('dotenv').config({ path: path.join(__dirname, '../.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ .env.local 에 SUPABASE_SERVICE_ROLE_KEY 가 없어요!')
  console.error('   Supabase 대시보드 → Settings → API → service_role 키를 복사해서 추가하세요.')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

const raw = fs.readFileSync(
  path.join(__dirname, 'bulgul-guild-default-rtdb-export .json'),
  'utf8'
)
const db = JSON.parse(raw)

// ── 유틸 ──────────────────────────────────────────
function chunk(arr, size) {
  const chunks = []
  for (let i = 0; i < arr.length; i += size) chunks.push(arr.slice(i, i + size))
  return chunks
}

async function upsertChunked(table, rows, chunkSize = 100) {
  for (const ch of chunk(rows, chunkSize)) {
    const { error } = await supabase.from(table).upsert(ch)
    if (error) console.error(`  ⚠️  ${table} 오류:`, error.message)
  }
}

// ── 1. 사용자 마이그레이션 ─────────────────────────
async function migrateUsers() {
  console.log('\n👤 사용자 마이그레이션...')
  const allowedUsers = db.allowedUsers || {}
  const roles = db.roles || {}

  const rows = Object.entries(allowedUsers).map(([nickname, val]) => ({
    nickname,
    entry_code: String(val.code),
    role: roles[nickname] || '일반',
    created_at: val.createdAt
      ? new Date(val.createdAt).toISOString()
      : new Date().toISOString(),
  }))

  await upsertChunked('users', rows)
  console.log(`  ✅ ${rows.length}명 완료`)
}

// ── 2. 캐릭터 마이그레이션 ────────────────────────
async function migrateCharacters() {
  console.log('\n⚔️  캐릭터 마이그레이션...')
  const characters = db.characters || {}

  const rows = Object.entries(characters).map(([name, val]) => ({
    name,
    category: val.category || 'hero',
    type: val.type || null,
  }))

  await upsertChunked('characters', rows)
  console.log(`  ✅ ${rows.length}개 완료`)
}

// ── 3. 방어팀 + 공격팀 마이그레이션 ───────────────
async function migrateDefenseTeams() {
  console.log('\n🛡️  방어팀 마이그레이션...')
  const defenseTeams = db.defenseTeams || {}

  const defRows = []
  const atkRows = []

  Object.entries(defenseTeams).forEach(([defId, defVal], idx) => {
    defRows.push({ id: defId, name: defVal.name, order_idx: idx })

    const attackTeams = defVal.attackTeams || {}
    Object.entries(attackTeams).forEach(([atkId, atkVal]) => {
      atkRows.push({
        id: atkId,
        defense_team_id: defId,
        name: atkVal.name || null,
        characters: Array.isArray(atkVal.characters) ? atkVal.characters : [],
        formation: atkVal.formation || null,
        type: atkVal.type || null,
        ring: atkVal.ring || null,
        skill: atkVal.skill || null,
        pet: atkVal.pet || null,
        armor: atkVal.armor || null,
        win: atkVal.win || 0,
        lose: atkVal.lose || 0,
      })
    })
  })

  await upsertChunked('defense_teams', defRows)
  console.log(`  ✅ 방어팀 ${defRows.length}개 완료`)

  await upsertChunked('attack_teams', atkRows)
  console.log(`  ✅ 공격팀 ${atkRows.length}개 완료`)
}

// ── 4. 공지사항 마이그레이션 ──────────────────────
async function migrateNotices() {
  console.log('\n📢 공지사항 마이그레이션...')
  const notices = db.notices || {}

  const rows = Object.entries(notices).map(([id, val]) => ({
    id,
    title: val.title,
    body: val.body,
    author: val.author,
    date: val.date || null,
    created_at: val.createdAt
      ? new Date(val.createdAt).toISOString()
      : new Date().toISOString(),
  }))

  await upsertChunked('notices', rows)
  console.log(`  ✅ ${rows.length}개 완료`)

  // 읽음 여부
  const noticeReads = db.noticeReads || {}
  const readRows = []
  Object.entries(noticeReads).forEach(([noticeId, readers]) => {
    if (typeof readers === 'object') {
      Object.keys(readers).forEach(nickname => {
        readRows.push({ notice_id: noticeId, nickname })
      })
    }
  })
  if (readRows.length > 0) {
    await upsertChunked('notice_reads', readRows)
    console.log(`  ✅ 읽음 기록 ${readRows.length}개 완료`)
  }
}

// ── 5. 오늘의 길드전 ──────────────────────────────
async function migrateTodayGuildWar() {
  console.log('\n📅 오늘의 길드전 마이그레이션...')
  const tgw = db.todayGuildWar || {}

  const { error } = await supabase.from('today_guild_war').upsert({
    id: 1,
    date: tgw.date || null,
    data: tgw,
  })
  if (error) console.error('  ⚠️ 오류:', error.message)
  else console.log('  ✅ 완료')
}

// ── 6. PVE 점수 마이그레이션 ──────────────────────
async function migratePveScores() {
  console.log('\n🏆 PVE 점수 마이그레이션...')
  const pveScores = db.pveScores || {}
  const rows = []

  Object.entries(pveScores).forEach(([type, typeData]) => {
    // type: 'advent' | 'siege'
    Object.entries(typeData).forEach(([key, keyData]) => {
      // key: 요일 or 보스명
      Object.entries(keyData).forEach(([season, seasonData]) => {
        // season: 'this' | 'last'
        if (typeof seasonData !== 'object') return
        Object.values(seasonData).forEach(entry => {
          if (!entry || !entry.nick) return
          rows.push({
            type,
            key,
            season,
            nickname: entry.nick,
            score: entry.score || null,
            date: entry.date || null,
            created_at: entry.createdAt
              ? new Date(entry.createdAt).toISOString()
              : new Date().toISOString(),
          })
        })
      })
    })
  })

  await upsertChunked('pve_scores', rows)
  console.log(`  ✅ ${rows.length}개 완료`)
}

// ── 7. 덱편성 마이그레이션 ────────────────────────
async function migrateDeckPlans() {
  console.log('\n🃏 덱편성 마이그레이션...')
  const deckPlan = db.deckPlan || {}

  const rows = Object.entries(deckPlan).map(([nickname, val]) => ({
    nickname,
    teams: val.teams || [],
    updated_at: new Date().toISOString(),
  }))

  await upsertChunked('deck_plans', rows)
  console.log(`  ✅ ${rows.length}명 완료`)
}

// ── 8. 총력전 마이그레이션 ────────────────────────
async function migrateTotalwar() {
  console.log('\n⚡ 총력전 마이그레이션...')
  const totalwar = db.totalwar || {}
  const teams = totalwar.teams || {}

  const rows = Object.entries(teams).map(([nickname, data]) => ({
    nickname,
    data,
    updated_at: new Date().toISOString(),
  }))

  await upsertChunked('totalwar_teams', rows)
  console.log(`  ✅ ${rows.length}명 완료`)
}

// ── 9. PVE 빌드 마이그레이션 ─────────────────────
async function migratePveBuilds() {
  console.log('\n📖 PVE 빌드 마이그레이션...')
  const pve = db.pve || {}
  const rows = []

  Object.entries(pve).forEach(([category, categoryData]) => {
    Object.entries(categoryData).forEach(([key, keyData]) => {
      Object.entries(keyData).forEach(([subKey, subData]) => {
        rows.push({ category, key, sub_key: subKey, data: subData })
      })
    })
  })

  await upsertChunked('pve_builds', rows)
  console.log(`  ✅ ${rows.length}개 완료`)
}

// ── 실행 ──────────────────────────────────────────
async function main() {
  console.log('🚀 Firebase → Supabase 마이그레이션 시작')
  console.log('=' .repeat(45))

  await migrateUsers()
  await migrateCharacters()
  await migrateDefenseTeams()
  await migrateNotices()
  await migrateTodayGuildWar()
  await migratePveScores()
  await migrateDeckPlans()
  await migrateTotalwar()
  await migratePveBuilds()

  console.log('\n' + '='.repeat(45))
  console.log('✅ 마이그레이션 완료!')
}

main().catch(console.error)
