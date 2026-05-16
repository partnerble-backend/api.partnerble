# Partnerble API

![version](https://img.shields.io/badge/version-v0.1.0-blue)

초기 스타트업 창업자(Founder)와 단기 인력(파트너)을 연결하는 매칭 플랫폼 백엔드 API.

## 기술 스택

| 영역 | 사용 기술 |
|---|---|
| Framework | NestJS (TypeScript) |
| ORM | Prisma |
| DB | PostgreSQL (AWS RDS) |
| 파일 저장소 | AWS S3 |
| Package Manager | pnpm (corepack) |

---

## 로컬 개발 환경 세팅

### 전제 조건

- Node.js 22 이상 (`.nvmrc` 기준 — `nvm install && nvm use`)
- Corepack (`corepack enable` — Node 22에 기본 포함)
- Docker Desktop

### 1단계 — 저장소 클론 및 의존성 설치

```bash
git clone https://github.com/partnerble-backend/api.partnerble.git
cd api.partnerble
nvm install && nvm use   # Node 22로 전환
corepack enable          # pnpm 활성화
pnpm install
```

### 2단계 — Claude Code 초기 설정

> **필수:** Google Drive Desktop을 **partnerble.com 계정**으로 설치하고 로그인하세요.
> 팀 공유 Docs/Works 폴더 접근에 필요합니다. → [Google Drive Desktop 다운로드](https://www.google.com/drive/download/)

Claude Code에서 `/setting`을 실행하면 로컬 설정(`settings.local.json`)이 자동으로 구성됩니다.

```
/setting
```

상세 설정 방법 및 전체 작업 플로우는 팀 Google Drive의 `GUIDE.md`를 참고하세요.

### 3단계 — 환경변수 설정

```bash
cp .env.example .env
```

`.env` 파일을 열어 각 항목을 채운다. 사전에 환경변수 값 관련 팀에 문의 필요한 부분은 문의 하여 공유 받을 것.

### 4단계 — 로컬 DB 실행 (Docker)

```bash
docker compose up -d
```

컨테이너 상태 확인:

```bash
docker ps
# partnerble-db 컨테이너가 Up 상태여야 한다
```

### 5단계 — Prisma 마이그레이션 및 클라이언트 생성

```bash
pnpm prisma migrate dev   # DB 스키마 생성 및 마이그레이션 적용
pnpm prisma generate      # Prisma Client 생성
```

### 6단계 — 개발 서버 실행

```bash
pnpm start:dev
```

서버가 정상 기동되면 아래에서 확인할 수 있다:

- API: `http://localhost:3000/api`
- Swagger UI: `http://localhost:3000/api/docs` (`SWAGGER_ENABLED=true` 시)

---

## 개발 명령어

```bash
pnpm start:dev              # 개발 서버 실행 (watch mode)
pnpm lint                   # ESLint 자동 수정
pnpm lint:ci                # ESLint 검사만 (수정 없음, CI용)
pnpm test                   # Jest 테스트
pnpm prisma migrate dev     # DB 마이그레이션 적용
pnpm prisma generate        # Prisma Client 재생성
pnpm prisma studio          # DB GUI 브라우저에서 열기
docker compose up -d        # 로컬 DB 컨테이너 기동
docker compose down         # 로컬 DB 컨테이너 종료
```

---

**운영 환경 주의사항:**
- `SWAGGER_ENABLED`는 `false`로 설정하거나 변수 자체를 제거해 API 명세를 외부에 노출하지 않는다.
- `NODE_ENV=production` 설정 시 NestJS 최적화 모드로 동작한다.
- DB는 로컬 Docker가 아닌 AWS RDS를 사용하므로 `DATABASE_URL`을 RDS 엔드포인트로 교체한다.

---

## 브랜치 전략

```
main          ← 상용 배포 브랜치 (관리자가 수동으로 머지)
└── dev       ← 개발 통합 브랜치 (모든 작업의 출발점)
    └── feature/[feature-id]/base
        ├── feature/[feature-id]/phase-1-...
        └── feature/[feature-id]/phase-2-...
```

---

## 참고 문서

참고 문서는 팀 Google Drive(`Shared drives/Common/docs`)에서 관리됩니다.

- `service.md` — 서비스 개요 및 MVP 범위
- `terminology.md` — 변수명, 파일명, API 경로 네이밍 기준
- `GUIDE.md` — 개발 환경 설정 및 작업 플로우
