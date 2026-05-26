// PVE 빌드 Firebase → Supabase 마이그레이션
// 실행: node scripts/migrate-pve.mjs

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pkrzpohigiwdralsscdy.supabase.co'
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
})

const raw = readFileSync(join(__dirname, 'bulgul-guild-default-rtdb-export .json'), 'utf-8')
const json = JSON.parse(raw)
const pve = json.pve

function cleanBuild(bd) {
  // updatedAt 제거, 구조만 남김
  const { updatedAt, ...rest } = bd
  return rest
}

function cleanData(data) {
  const result = {}
  const buildKeys = []

  for (const [k, v] of Object.entries(data)) {
    if (k === 'buildOrder') {
      result.buildOrder = v
    } else if (typeof v === 'object' && v !== null) {
      result[k] = cleanBuild(v)
      buildKeys.push(k)
    }
  }

  // buildOrder 없으면 자동 생성 (build1, build2... 순서)
  if (!result.buildOrder) {
    result.buildOrder = buildKeys.sort((a, b) => {
      const numA = parseInt(a.replace(/\D/g, '')) || 0
      const numB = parseInt(b.replace(/\D/g, '')) || 0
      return numA - numB
    })
  }

  return result
}

const rows = []

for (const [category, bosses] of Object.entries(pve)) {
  for (const [key, bossData] of Object.entries(bosses)) {
    const isDestruct = category === 'advent' && (key === 'destruct1' || key === 'destruct2')

    if (isDestruct) {
      // 턴별로 row 분리
      for (const [subKey, turnData] of Object.entries(bossData)) {
        rows.push({
          category,
          key,
          sub_key: subKey,
          data: cleanData(turnData),
        })
      }
    } else {
      rows.push({
        category,
        key,
        sub_key: '',
        data: cleanData(bossData),
      })
    }
  }
}

console.log(`\n총 ${rows.length}개 row 삽입 예정:\n`)
for (const r of rows) {
  const buildCount = Object.keys(r.data).filter(k => k !== 'buildOrder').length
  console.log(`  [${r.category}] ${r.key} (sub: "${r.sub_key}") — 빌드 ${buildCount}개`)
}

console.log('\n삽입 중...')

// 기존 데이터 삭제 후 삽입 (중복 방지)
const { error: delErr } = await supabase.from('pve_builds').delete().neq('id', '00000000-0000-0000-0000-000000000000')
if (delErr) {
  console.error('기존 데이터 삭제 실패:', delErr.message)
  process.exit(1)
}

const { data: inserted, error } = await supabase.from('pve_builds').insert(rows).select()
if (error) {
  console.error('삽입 실패:', error.message)
  process.exit(1)
}

console.log(`\n✅ 완료! ${inserted.length}개 row 삽입됨`)
