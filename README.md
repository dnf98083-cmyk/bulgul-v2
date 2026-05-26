# bulgul-v2
세븐나이츠 리버스 불굴 길드 웹앱 V2 - Next.js 풀스택 리빌드

이 프로젝트는 실제로 세븐나이츠리버스 의 길드원들이 사용하고있는 세븐나이츠리버스 게임의 공략 공유 서비스입니다.

# 🔥 불굴 길드 V2

> 세븐나이츠 리버스 불굴 길드 전용 웹앱을 모던 풀스택으로 리빌드하는 프로젝트

**V1 (기존 버전)**: [dnf98083-cmyk/bulgul-guild](https://github.com/dnf98083-cmyk/bulgul-guild)

---

## 🎯 V2를 만드는 이유

### 기술적 성장
- Vanilla JavaScript 8,800줄 → **모던 풀스택 아키텍처**로 전환
- 다양한 최신 기술 스택 학습 및 실전 적용
- 확장 가능하고 유지보수하기 쉬운 코드베이스 구축

### 현재 V1의 한계
- ❌ 단일 HTML 파일 (8,800줄)
- ❌ 타입 안정성 부족
- ❌ 컴포넌트 재사용 어려움
- ❌ 성능 최적화 한계
- ❌ 테스트 코드 없음

### V2에서 개선할 점
- ✅ 컴포넌트 기반 아키텍처
- ✅ TypeScript로 타입 안정성 확보
- ✅ 성능 최적화 (코드 스플리팅, 캐싱)
- ✅ 테스트 코드 작성
- ✅ 확장 가능한 구조

---

## 🛠 사용할 기술 스택

### Frontend
```
📦 Core
├─ Next.js 14 (App Router)    # React 프레임워크, SSR/SSG
├─ TypeScript                  # 타입 안정성
├─ React 18                    # UI 라이브러리
└─ Tailwind CSS                # 유틸리티 CSS

🎨 UI Components
├─ shadcn/ui                   # 고품질 컴포넌트
└─ Lucide Icons                # 아이콘

📊 State Management
├─ Zustand                     # 전역 상태 관리
└─ React Query (TanStack)     # 서버 상태 관리
```

### Backend
```
🔧 API & Database
├─ Next.js API Routes          # RESTful API
├─ Supabase                    # PostgreSQL + 실시간 DB
├─ Prisma ORM                  # 타입 안전 쿼리
└─ NextAuth.js                 # 인증/인가

📡 Real-time
└─ Supabase Realtime           # 실시간 동기화
```

### DevOps & Tools
```
🚀 Deployment
├─ Vercel                      # 자동 배포
└─ GitHub Actions              # CI/CD

🧪 Testing
├─ Jest                        # 단위 테스트
└─ React Testing Library       # 컴포넌트 테스트

📝 Code Quality
├─ ESLint                      # 린팅
├─ Prettier                    # 포매팅
└─ Husky                       # Git Hooks
```

---

## 📋 마이그레이션 계획

### Phase 1: 기초 설정 (Week 1)
- [x] 프로젝트 초기 세팅
- [x] Next.js 14 + TypeScript 프로젝트 생성
- [x] Tailwind CSS 설정
- [x] shadcn/ui 설정
- [x] Supabase 프로젝트 생성 및 연동
- [x] Vercel 배포 연동 (https://bulgul-v2.vercel.app)

### Phase 2: 인증 시스템 (Week 2)
- [x] Supabase 테이블 설계
  - `users` (사용자 + 역할 통합)
- [x] 로그인 페이지 구현
  - 닉네임 + 입장코드 방식 유지
  - 닉네임 드롭다운 선택
- [x] NextAuth.js 설정
- [x] 권한 관리 프록시 (비로그인 시 /login 리다이렉트)

### Phase 3: 핵심 기능 (Week 3-6)
- [x] **Firebase → Supabase 데이터 마이그레이션** (`scripts/migrate.js`)
  - 사용자(35명), 캐릭터(108개), 방어팀(34개), 공격팀(152개), 공지사항(9개), PVE 점수(253개), 덱편성(10명), 총력전(15명), PVE 빌드(58개)
- [x] **반응형 레이아웃** (모바일: 하단 네비 / PC: 왼쪽 사이드바)
- [x] **길드전 공격 페이지** `/guild-war`
  - 방어팀 선택 → 공격팀 목록 2-depth 구조
  - 타입 배지 (확실한 승 / 내줘도 됨 / 위험 / 보통)
  - 캐릭터 칩, 진형/반지/스킬순/펫/장비 표시
  - 관리자/연구원: 승/패 버튼 → Supabase 실시간 업데이트
- [x] **PVE 페이지** `/pve`
  - 공성전/파괴신 점수 랭킹 (이번시즌/지난시즌)
  - 공성전/강림/레이드 빌드 가이드 (아코디언 카드)
- [x] **길드원 관리 페이지** `/admin/users` (관리자 전용)
  - 전체 길드원 목록
  - 역할 변경 드롭다운 (일반/연구원/관리자)
  - 입장코드 재발급 / 회원 삭제

- [ ] **랭킹 페이지** `/ranking`
- [ ] **덱편성 페이지** `/deck-plan`
- [ ] **총력전 페이지** `/totalwar`
- [ ] **공지사항 페이지** `/notices`

### Phase 6: 최적화 & 배포 (Week 11-12)
- [ ] 성능 최적화
  - 이미지 최적화 (Next.js Image)
  - 코드 스플리팅
  - 캐싱 전략
- [ ] SEO 최적화
- [ ] 테스트 코드 작성
- [ ] Vercel 배포
- [ ] 문서화

---

## 📁 프로젝트 구조

```
bulgul-v2/
├── src/
│   └── app/
│       ├── (auth)/
│       │   ├── login/
│       │   └── layout.tsx
│       ├── (main)/
│       │   ├── layout.tsx
│       │   ├── page.tsx              # 홈
│       │   ├── guild-war/            # 길드전 공격
│       │   ├── deck-plan/            # 덱편성
│       │   ├── totalwar/             # 총력전
│       │   ├── ranking/              # 랭킹
│       │   └── pve/                  # PVE 공략
│       └── api/
│           ├── auth/
│           ├── guild-war/
│           └── ranking/
├── components/
│   ├── ui/                           # shadcn/ui 컴포넌트
│   ├── guild-war/                    # 길드전 전용
│   ├── shared/                       # 공통 컴포넌트
│   └── layout/                       # 레이아웃
├── lib/
│   ├── supabase/                     # Supabase 클라이언트
│   ├── types/                        # TypeScript 타입
│   ├── utils/                        # 유틸 함수
│   └── hooks/                        # Custom Hooks
├── public/
│   └── images/
│       ├── chars/                    # 캐릭터 이미지
│       └── pets/                     # 펫 이미지
├── prisma/
│   └── schema.prisma                 # DB 스키마
└── tests/
    ├── unit/
    └── integration/
```

---

## 🚀 로컬 개발 환경 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행 (http://localhost:3000)
npm run dev

# 빌드
npm run build

# 빌드 결과 실행
npm start
```

---

## 🎓 학습 목표

### 프론트엔드
- [x] React 함수형 컴포넌트 마스터
- [ ] TypeScript 타입 시스템 이해
- [ ] Next.js App Router 활용
- [ ] 상태 관리 (Zustand + React Query)
- [ ] 성능 최적화 기법
- [ ] 반응형 디자인

### 백엔드
- [ ] RESTful API 설계
- [ ] 데이터베이스 설계 (정규화)
- [ ] ORM 사용 (Prisma)
- [ ] 인증/인가 구현
- [ ] 실시간 데이터 처리

### DevOps
- [ ] Git 브랜치 전략
- [ ] CI/CD 파이프라인
- [ ] Vercel 배포
- [ ] 환경 변수 관리
- [ ] 모니터링 & 로깅

---

## 📊 V1 vs V2 비교

| 항목 | V1 (Vanilla JS) | V2 (Next.js) |
|---|---|---|
| **코드 구조** | 단일 HTML 파일 (8,800줄) | 모듈화된 컴포넌트 구조 |
| **타입 안정성** | ❌ 없음 | ✅ TypeScript |
| **컴포넌트 재사용** | 어려움 | 쉬움 |
| **테스트** | ❌ 없음 | ✅ Jest + RTL |
| **배포** | GitHub Pages | Vercel |
| **실시간 DB** | Firebase | Supabase |
| **SEO** | 제한적 | ✅ 최적화 |

---

## 📝 개발 일지

### 2026-05-25~26 — Phase 3 핵심 기능 구현 (길드전 / PVE / 관리자)

**진행한 작업**
1. Firebase Realtime DB → Supabase 전체 데이터 마이그레이션 (`scripts/migrate.js`)
2. 게임 테이블 전체 설계 (`supabase/migrations/002_create_game_tables.sql`)
3. 반응형 레이아웃 (모바일 하단 네비 / PC 사이드바)
4. 길드전 공격 페이지 (`/guild-war`)
5. PVE 페이지 (`/pve`) — 점수 랭킹 + 빌드 가이드
6. 관리자 길드원 관리 페이지 (`/admin/users`)

---

**학습한 개념 1: Firebase NoSQL → PostgreSQL 관계형 DB 변환**

Firebase에서는 데이터를 트리 구조로 저장했다:
```json
{
  "allowedUsers": { "김우림": { "code": "123456" } },
  "roles":        { "김우림": "관리자" },
  "defenseTeams": {
    "-Abc123": {
      "name": "방어팀 A",
      "attackTeams": { "-Xyz789": { "name": "공격팀 1", "win": 5 } }
    }
  }
}
```

PostgreSQL에서는 관련 데이터를 테이블로 분리하고 외래키(FK)로 연결한다:
```sql
-- 사용자 (Firebase allowedUsers + roles를 하나로 통합)
CREATE TABLE users (nickname text, role text, entry_code char(6));

-- 방어팀 (Firebase push key를 text PK로 그대로 활용)
CREATE TABLE defense_teams (id text PRIMARY KEY, name text, order_idx int);

-- 공격팀 (defense_team_id FK로 방어팀과 연결)
CREATE TABLE attack_teams (
  id text PRIMARY KEY,
  defense_team_id text REFERENCES defense_teams(id),
  characters text[],   -- 배열 타입! PostgreSQL만의 기능
  win int DEFAULT 0,
  lose int DEFAULT 0
);
```

**왜 Firebase push key를 text로 쓰나?**  
Firebase 내보내기 파일에는 `-Abc123` 같은 push key로 방어팀-공격팀이 이미 연결되어 있다.
새 UUID를 쓰면 마이그레이션 스크립트에서 기존 관계를 다시 매핑해야 한다.
text 타입 PK로 그대로 쓰면 마이그레이션 코드가 단순해진다.

---

**학습한 개념 2: 반응형 레이아웃 — 모바일과 PC를 하나의 코드로**

Tailwind CSS의 반응형 접두사(`md:`)로 브레이크포인트별 스타일을 지정한다:
```tsx
// 모바일(기본): 하단 네비 / PC(md 이상): 왼쪽 사이드바
<nav className="md:hidden fixed bottom-0 left-0 right-0 h-16"> {/* 모바일용 */}
<aside className="hidden md:flex fixed left-0 top-0 w-56">    {/* PC용 */}

// 메인 콘텐츠: PC에서 사이드바(w-56=224px) 만큼 왼쪽 여백
<main className="flex-1 md:ml-56 pb-20 md:pb-0">
```
- `md:` = 768px 이상 적용
- 모바일에서 하단 네비 때문에 콘텐츠가 가려지지 않도록 `pb-20` (80px 하단 패딩)
- PC에서는 사이드바가 fixed라서 `ml-56`으로 밀어줌

---

**학습한 개념 3: 2-Depth 화면 전환 (선택 → 목록)**

별도 페이지 이동 없이 state 하나로 화면 전환:
```tsx
const [selectedDef, setSelectedDef] = useState<DefenseTeam | null>(null)

if (!selectedDef) {
  return <방어팀 목록 />  // selectedDef가 null이면 방어팀 목록 화면
}
return <공격팀 목록 />    // selectedDef가 있으면 공격팀 화면
```
URL이 바뀌지 않기 때문에 뒤로가기 버튼은 `setSelectedDef(null)`로 직접 구현한다.
이 패턴은 모달 없이 "선택 → 상세" 흐름을 구현할 때 자주 쓴다.

---

**학습한 개념 4: Supabase 실시간 업데이트 (Optimistic UI)**

승/패 버튼을 눌렀을 때 DB 응답을 기다리지 않고 화면을 먼저 바꾸는 패턴:
```tsx
async function recordResult(atkId: string, result: 'win' | 'lose') {
  const update = result === 'win' ? { win: atk.win + 1 } : { lose: atk.lose + 1 }

  // 1. 화면 즉시 업데이트 (사용자는 바로 결과를 봄)
  setAttackTeams(prev => prev.map(a => a.id === atkId ? { ...a, ...update } : a))

  // 2. DB 업데이트 (비동기, 실패해도 화면은 이미 바뀐 상태)
  await supabase.from('attack_teams').update(update).eq('id', atkId)
}
```
실제 서비스에선 실패 시 롤백도 해야 하지만, 내부 도구에서는 이 정도로 충분하다.

---

**학습한 개념 5: 아코디언 UI 패턴**

PVE 빌드 페이지에서 각 빌드를 클릭하면 상세 내용이 펼쳐지는 패턴:
```tsx
function BuildCard({ build }) {
  const [open, setOpen] = useState(false)  // 닫힌 상태가 기본값

  return (
    <div>
      <button onClick={() => setOpen(v => !v)}>  {/* v => !v: 현재 값 반전 */}
        {build.buildName}
        {open ? <ChevronUp /> : <ChevronDown />}  {/* 아이콘도 같이 전환 */}
      </button>

      {open && (  /* open이 true일 때만 렌더링됨 */
        <div className="border-t">
          <p>{build.deck}</p>
          <p>{build.skill}</p>
        </div>
      )}
    </div>
  )
}
```
`{open && <JSX />}` 패턴: `&&` 앞이 false면 JSX 자체가 렌더링되지 않는다.

---

**다음 단계**: 랭킹 페이지, 덱편성 페이지, 공지사항 페이지

---

### 2026-05-25 — Phase 2 권한 관리 프록시 (proxy.ts)

**진행한 작업**
- `proxy.ts` 생성 (프로젝트 루트)
- 비로그인 상태에서 모든 페이지 접근 시 `/login`으로 자동 리다이렉트
- 이미 로그인된 상태에서 `/login` 접근 시 `/`로 자동 리다이렉트

**학습한 개념**

**Next.js 16의 Breaking Change — `middleware.ts` → `proxy.ts`**

기존 Next.js 14/15에서는 `middleware.ts` 파일을 프로젝트 루트에 두면 모든 요청을 가로챌 수 있었다.
Next.js 16부터 이 파일 이름이 `proxy.ts`로 변경되었고, 함수 이름도 `middleware` → `proxy`로 바뀌었다.
또한 Edge Runtime이 더 이상 지원되지 않아 Node.js Runtime만 사용한다.

**proxy.ts가 하는 일**

사용자가 어떤 URL을 요청하든 페이지가 렌더링되기 **전에** 이 함수가 먼저 실행된다.
로그인 여부를 확인해서 접근을 허용할지, 다른 페이지로 보낼지 결정할 수 있다.

```
사용자 요청 → proxy() 실행 → 조건 확인 → 허용 or 리다이렉트 → 페이지 렌더링
```

**`getToken()`으로 로그인 상태 확인**

NextAuth.js는 로그인 시 JWT 토큰을 쿠키에 저장한다.
`getToken()`은 그 쿠키를 읽어서 로그인 상태인지 확인하는 함수다.
토큰이 있으면 로그인 상태, 없으면 비로그인 상태.

```ts
const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
// token이 null → 비로그인
// token이 객체 → 로그인됨 (nickname, role 등 정보 포함)
```

**`matcher` — 어떤 경로에서 실행할지 지정**

```ts
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
```
`api`, `_next/static`, `_next/image`, `favicon.ico`를 제외한 모든 경로에서 proxy()가 실행된다.
API 라우트와 정적 파일은 로그인 체크가 필요 없으므로 제외한다.

**다음 단계**: Phase 3 — 메인 레이아웃 및 네비게이션 구성

---

### 2026-05-25 — Vercel 배포 연동

**진행한 작업**
- Vercel 계정 생성 (GitHub 로그인 연동)
- `bulgul-v2` GitHub 저장소 Import → 자동 배포 설정
- 환경변수 4개 Vercel에 등록 (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`)
- 배포 완료 → [https://bulgul-v2.vercel.app](https://bulgul-v2.vercel.app)

**학습한 개념**

**왜 `.env.local`을 그대로 쓰면 안 되나?**

`.env.local`은 보안상 `.gitignore`에 포함되어 있어서 GitHub에 올라가지 않는다.
GitHub에 없으니 Vercel도 그 값을 모른다 → Vercel 대시보드에서 직접 환경변수를 등록해줘야 한다.
```
로컬 개발: .env.local (내 컴퓨터에만 존재)
Vercel 배포: 대시보드 Environment Variables (Vercel 서버에만 존재)
```

**`NEXTAUTH_URL`이 필요한 이유**

NextAuth.js는 로그인/로그아웃 후 리다이렉트할 때 이 주소를 기준으로 삼는다.
로컬에서는 `http://localhost:3000`, 배포 후에는 `https://bulgul-v2.vercel.app`으로 달라지기 때문에 환경별로 따로 설정해야 한다.

**Vercel 자동 배포 흐름**
```
git push → GitHub → Vercel 감지 → 자동 빌드 → 자동 배포
```
`main` 브랜치에 push하면 실제 서비스 주소가 자동으로 업데이트된다.
코드를 고치고 push하는 것만으로 배포 완료 — 별도 작업 불필요.

**다음 단계**: 권한 관리 미들웨어 (비로그인 시 /login으로 리다이렉트)

---

### 2026-05-25 — Phase 2 DB 테이블 설계 및 RLS 설정

**진행한 작업**
- `supabase/migrations/001_create_users.sql` 마이그레이션 파일 생성
- Firebase `allowedUsers` + `roles` → PostgreSQL `users` 테이블로 통합 설계
- RLS(Row Level Security) 활성화 및 조회 정책 설정

**학습한 개념**

**Firebase NoSQL → PostgreSQL 변환**

Firebase는 NoSQL이라 같은 사람 데이터를 `allowedUsers/닉네임`과 `roles/닉네임`으로 따로 저장했다.
PostgreSQL은 같은 사람 데이터를 한 행(row)에 모아두는 게 효율적이라 두 컬렉션을 `users` 테이블 하나로 통합했다.

**`users` 테이블 설계 포인트**
```sql
CREATE TABLE users (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,  -- 자동 생성 고유 ID
  nickname   text NOT NULL UNIQUE,                        -- 중복 닉네임 불가
  entry_code char(6) NOT NULL,                            -- 정확히 6자리 고정
  role       text NOT NULL DEFAULT '일반'
             CHECK (role IN ('일반', '연구원', '관리자')), -- DB 레벨 유효성 검사
  created_at timestamptz DEFAULT now()                    -- 시간대 포함 자동 기록
);
```
- `char(6)` vs `text`: char(6)은 6자리 아니면 저장 자체가 안 됨
- `CHECK`: 허용된 값 외엔 DB가 직접 막아줌 (코드 실수 방지)
- `DEFAULT '일반'`: role 안 넣으면 자동으로 일반 등급

**RLS (Row Level Security)**

Supabase는 테이블 생성 시 기본적으로 외부에서 누구나 접근 가능하다.
RLS를 활성화하면 정책(Policy)으로 접근 권한을 세밀하게 제어할 수 있다.
```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "로그인한 사용자는 조회 가능"
  ON users FOR SELECT
  USING (auth.role() = 'authenticated');
```
- `auth.role() = 'authenticated'`: 로그인된 사용자만 조회 허용
- 비로그인 상태에서 API 호출하면 데이터가 반환되지 않음

**마이그레이션 파일을 Git에 관리하는 이유**

Supabase SQL Editor에서 실행한 SQL을 `supabase/migrations/` 폴더에 파일로 저장한다.
DB를 날려도 파일 순서대로 실행하면 동일한 구조 복원 가능. 팀원이 생겨도 같은 환경 재현 가능.

**다음 단계**: NextAuth.js 연동 및 로그인 페이지 구현

---

### 2026-05-25 — Phase 2 NextAuth.js 설정

**진행한 작업**
- `next-auth` + `@auth/supabase-adapter` 설치
- `src/app/api/auth/[...nextauth]/route.ts` 생성 (CredentialsProvider 설정)
- `.env.local`에 `NEXTAUTH_URL`, `NEXTAUTH_SECRET` 추가

**학습한 개념**

**NextAuth.js가 하는 일**

세션 관리, 쿠키, JWT 토큰 처리를 직접 구현하지 않아도 되게 해주는 Next.js 전용 인증 라이브러리다.
`/api/auth/[...nextauth]` 라우트 하나가 로그인/로그아웃/세션 확인 API를 전부 처리한다.

**CredentialsProvider — 커스텀 로그인**

이메일/비밀번호나 소셜 로그인이 아닌, 닉네임+코드 같은 커스텀 방식을 쓸 때 사용한다.
```ts
async authorize(credentials) {
  // Supabase에서 닉네임+코드 일치하는 사람 찾기
  const { data: user } = await supabase
    .from('users')
    .eq('nickname', credentials.nickname)
    .eq('entry_code', credentials.entry_code)
    .single()

  if (!user) return null  // 없으면 로그인 실패
  return user             // 있으면 로그인 성공 → 세션 생성
}
```

**jwt / session 콜백 — role을 세션에 담기**

로그인 성공 시 `role` 정보를 JWT 토큰에 저장해두면, 이후 모든 페이지에서 `session.user.role`로 권한 확인이 가능하다.
```ts
// 관리자 여부 확인 예시 (나중에 쓸 패턴)
if (session.user.role === '관리자') { ... }
```

**`NEXTAUTH_SECRET`**

JWT를 암호화하는 키. 없으면 NextAuth가 실행 자체를 거부한다.
로컬 개발용은 아무 문자열이나 써도 되지만, 배포 시엔 반드시 랜덤한 긴 값으로 교체해야 한다.

**다음 단계**: 로그인 페이지 UI 구현

---

### 2026-05-25 — Phase 2 로그인 페이지 UI

**진행한 작업**
- `src/components/providers.tsx` 생성 (SessionProvider 래퍼)
- `src/app/layout.tsx`에 Providers 추가
- `src/app/login/page.tsx` 생성 (닉네임 드롭다운 + 입장코드 입력)
- 닉네임 목록 누구나 조회 가능한 RLS 정책 추가

**학습한 개념**

**SessionProvider가 필요한 이유**

NextAuth의 `useSession()`, `signIn()` 같은 훅은 내부적으로 React Context를 사용한다.
App Router에서는 `layout.tsx`에 `SessionProvider`로 감싸줘야 모든 페이지에서 세션 접근이 가능하다.
단, `SessionProvider`는 `'use client'`가 필요하기 때문에 별도 `providers.tsx` 파일로 분리해서 만든다.

**`'use client'` 가 필요한 이유**

Next.js App Router는 기본적으로 모든 컴포넌트가 서버 컴포넌트다.
`useState`, `useEffect`, 이벤트 핸들러처럼 브라우저에서만 동작하는 코드는 파일 맨 위에 `'use client'`를 선언해야 한다.

**로그인 흐름**
```
1. 페이지 로드 → Supabase에서 닉네임 목록 fetch (useEffect)
2. 사용자가 닉네임 선택 + 코드 입력
3. signIn('credentials', { nickname, entry_code, redirect: false })
4. NextAuth → authorize() → Supabase DB 검증
5. 성공: router.push('/') / 실패: 에러 메시지 표시
```

**`redirect: false`를 쓰는 이유**

`signIn()`의 기본값은 로그인 실패 시 에러 페이지로 리다이렉트한다.
`redirect: false`로 설정하면 결과값(`result.error`)을 직접 받아서 에러 메시지를 페이지 안에서 처리할 수 있다.

**다음 단계**: 권한 관리 미들웨어 (비로그인 시 /login으로 리다이렉트)

---

### 2026-05-22 — Phase 1 shadcn/ui 설정

**진행한 작업**
- `npx shadcn@latest init` 으로 shadcn/ui 초기화
- 자동 생성된 파일: `src/components/ui/button.tsx`, `src/lib/utils.ts`

**학습한 개념**

**shadcn/ui 가 일반 라이브러리와 다른 점**

일반 UI 라이브러리(MUI 등)는 `node_modules` 안에 컴포넌트가 있어서 수정이 불가능하다.  
shadcn/ui는 `npx shadcn add button` 하면 **내 `src/components/ui/` 폴더에 코드를 직접 복사**해준다.  
→ 마음대로 수정 가능, 내부 코드 공부 가능, 필요한 것만 추가

**`src/lib/utils.ts` — cn() 함수**

```typescript
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}
```

Tailwind 클래스를 조건부로 합칠 때 쓰는 유틸 함수다.
```typescript
// 예시: 조건에 따라 다른 클래스 적용
cn("p-4 rounded", isActive && "bg-blue-500", className)
// → "p-4 rounded bg-blue-500" (isActive가 true일 때)
```

**`cva` — 컴포넌트 변형(variant) 관리**

`button.tsx`에서 사용하는 `cva`(class-variance-authority)는 같은 컴포넌트의 다양한 스타일을 관리한다.
```typescript
// 버튼 하나로 여러 종류를 만들 수 있음
<Button variant="default">기본 버튼</Button>
<Button variant="outline">외곽선 버튼</Button>
<Button variant="destructive">삭제 버튼</Button>
<Button size="sm">작은 버튼</Button>
<Button size="lg">큰 버튼</Button>
```

**다음 단계**: Supabase 프로젝트 생성 및 연동

---

### 2026-05-22 — Phase 1 프로젝트 초기 세팅

**진행한 작업**
- `create-next-app`으로 Next.js 14 프로젝트 생성
- 선택 옵션: TypeScript, Tailwind CSS, App Router, ESLint, src/ 폴더

**학습한 개념**

**create-next-app 이란?**  
Next.js 공식 프로젝트 생성 도구. 폴더 구조, 설정 파일, 의존성을 자동으로 세팅해준다.

**App Router vs Pages Router**  
Next.js 13부터 도입된 새로운 라우팅 방식. `src/app` 폴더 안의 폴더 구조가 URL 경로가 된다.  
예) `src/app/guild-war/page.tsx` → `/guild-war` 페이지

**TypeScript를 쓰는 이유**  
```typescript
// Vanilla JS (V1 방식) — 타입 오류를 런타임에 발견
function getUser(id) {
  return users[id] // id가 숫자인지 문자열인지 모름
}

// TypeScript (V2 방식) — 타입 오류를 코딩할 때 발견
function getUser(id: number): User {
  return users[id] // id는 반드시 숫자, 반환값은 반드시 User 타입
}
```

**Tailwind CSS를 쓰는 이유**  
별도 CSS 파일 없이 클래스명으로 스타일링. 유지보수가 쉽고 번들 크기가 작다.
```html
<!-- 기존 CSS 방식 -->
<div class="card">...</div>
/* card { padding: 16px; border-radius: 8px; background: white; } */

<!-- Tailwind 방식 -->
<div class="p-4 rounded-lg bg-white">...</div>
```

**생성된 주요 파일 설명**
- `src/app/layout.tsx` — 모든 페이지에 공통 적용되는 레이아웃 (헤더, 폰트 등)
- `src/app/page.tsx` — `/` 루트 경로의 메인 페이지
- `src/app/globals.css` — 전역 CSS (Tailwind 설정 포함)
- `next.config.ts` — Next.js 설정 파일
- `tailwind.config.ts` — Tailwind 설정 파일
- `tsconfig.json` — TypeScript 설정 파일

**다음 단계**: shadcn/ui 설치 및 설정

---

## 🔗 관련 링크

- **V1 저장소**: [bulgul-guild](https://github.com/dnf98083-cmyk/bulgul-guild)
- **V1 배포**: [https://dnf98083-cmyk.github.io/bulgul-guild/](https://dnf98083-cmyk.github.io/bulgul-guild/)

---

## 👨‍💻 개발자

**김우림**
- GitHub: [@dnf98083-cmyk](https://github.com/dnf98083-cmyk)
- 불굴 길드 관리자
