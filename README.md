# bulgul-v2
세븐나이츠 리버스 불굴 길드 웹앱 V2 - Next.js 풀스택 리빌드

이프로젝트는 실제로 세븐나이츠리버스 의 길드원들이 사용하고있는 세븐나이츠리버스 게임의 공략 공유 서비스입니다.

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
- [ ] Next.js 14 + TypeScript 프로젝트 생성
- [ ] Tailwind CSS + shadcn/ui 설정
- [ ] Supabase 프로젝트 생성 및 연동
- [ ] Git 저장소 구조 설정

### Phase 2: 인증 시스템 (Week 2)
- [ ] Supabase 테이블 설계
  - `users` (사용자)
  - `roles` (역할: 관리자/연구원/일반)
- [ ] 로그인 페이지 구현
  - 닉네임 + 입장코드 방식 유지
  - 자동완성 기능
- [ ] NextAuth.js 설정
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

## 📁 프로젝트 구조 (예정)

```
bulgul-v2/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── layout.tsx
│   ├── (main)/
│   │   ├── layout.tsx
│   │   ├── page.tsx              # 홈
│   │   ├── guild-war/            # 길드전 공격
│   │   ├── deck-plan/            # 덱편성
│   │   ├── totalwar/             # 총력전
│   │   ├── ranking/              # 랭킹
│   │   └── pve/                  # PVE 공략
│   └── api/
│       ├── auth/
│       ├── guild-war/
│       └── ranking/
├── components/
│   ├── ui/                       # shadcn/ui 컴포넌트
│   ├── guild-war/                # 길드전 전용
│   ├── shared/                   # 공통 컴포넌트
│   └── layout/                   # 레이아웃
├── lib/
│   ├── supabase/                 # Supabase 클라이언트
│   ├── types/                    # TypeScript 타입
│   ├── utils/                    # 유틸 함수
│   └── hooks/                    # Custom Hooks
├── public/
│   └── images/
│       ├── chars/                # 캐릭터 이미지
│       └── pets/                 # 펫 이미지
├── prisma/
│   └── schema.prisma             # DB 스키마
└── tests/
    ├── unit/
    └── integration/
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
| **번들 크기** | ~350KB | ~XX KB (최적화 예정) |
| **초기 로딩** | ~X초 | ~X초 (목표) |
| **컴포넌트 재사용** | 어려움 | 쉬움 |
| **테스트** | ❌ 없음 | ✅ Jest + RTL |
| **배포** | GitHub Pages | Vercel |
| **실시간 DB** | Firebase | Supabase |
| **SEO** | 제한적 | ✅ 최적화 |
| **성능 점수** | XX점 | XX점 (목표) |

---

## 🔗 관련 링크

- **V1 저장소**: [bulgul-guild](https://github.com/dnf98083-cmyk/bulgul-guild)
- **V1 배포**: [https://dnf98083-cmyk.github.io/bulgul-guild/](https://dnf98083-cmyk.github.io/bulgul-guild/)
- **기술 문서**: (작성 예정)
- **API 문서**: (작성 예정)

---

## 📝 개발 일지

### 2026-05-20
- 🎉 프로젝트 시작
- 📋 기술 스택 선정 완료
- 📝 README 작성

---

## 🤝 기여

이 프로젝트는 개인 학습 목적으로 진행됩니다.

---

## 👨‍💻 개발자

**김우림**
- GitHub: [@dnf98083-cmyk](https://github.com/dnf98083-cmyk)
- 불굴 길드 관리자

---

## 📄 라이선스

이 프로젝트는 세븐나이츠 리버스 불굴 길드 전용으로 제작되었습니다.

---

> **참고**: 이 프로젝트는 [V1](https://github.com/dnf98083-cmyk/bulgul-guild)의 전면 리빌드입니다.  
> 기존 기능은 유지하면서 최신 기술 스택으로 마이그레이션하는 것이 목표입니다.
