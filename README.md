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
- [ ] Supabase 프로젝트 생성 및 연동
- [ ] Git 저장소 구조 설정

### Phase 2: 인증 시스템 (Week 2)
- [x] Supabase 테이블 설계
  - `users` (사용자 + 역할 통합)
- [x] 로그인 페이지 구현
  - 닉네임 + 입장코드 방식 유지
  - 닉네임 드롭다운 선택
- [x] NextAuth.js 설정
- [ ] 권한 관리 미들웨어

### Phase 3: 핵심 기능 (Week 3-6)
- [ ] **길드전 공격 페이지** (Week 3-4)
  - 방어팀 선택
  - 공격덱 목록 (정렬, 필터)
  - 전적 기록 (3가지 방식)
  - 실시간 업데이트

- [ ] **랭킹 페이지** (Week 5)
  - 길드전 랭킹
  - 공성전 랭킹
  - 파괴신 랭킹
  - AI 스캔 기능 (이미지 → 점수 인식)

- [ ] **덱편성 페이지** (Week 6)
  - 팀별 공/방 배정
  - 반지 관리
  - 공유 기능
  - 피드백 시스템

### Phase 4: 추가 기능 (Week 7-8)
- [ ] 총력전 페이지
- [ ] PVE 공략 페이지
- [ ] 공지사항
- [ ] 건의사항

### Phase 5: 관리자 기능 (Week 9-10)
- [ ] 길드원 관리
- [ ] 캐릭터/펫 DB 관리
- [ ] 제보 관리
- [ ] 승패 관리
- [ ] 데이터 복구

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
