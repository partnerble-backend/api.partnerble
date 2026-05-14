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
| Package Manager | pnpm |

## 시작하기

**전제조건:** Node.js 20 이상, pnpm

```bash
pnpm install
cp .env.example .env   # 환경 변수 설정
pnpm prisma generate
pnpm prisma migrate dev
pnpm start:dev
```

## 개발 명령어

```bash
pnpm start:dev              # 개발 서버 실행 (watch mode)
pnpm lint                   # ESLint 검사
pnpm test                   # Jest 테스트
pnpm prisma migrate dev     # DB 마이그레이션 (개발)
pnpm prisma generate        # Prisma Client 재생성
pnpm prisma studio          # DB GUI
```

## 브랜치 전략

```
main          ← 상용 배포 브랜치 (관리자가 수동으로 머지)
└── dev       ← 개발 통합 브랜치 (모든 작업의 출발점)
    └── feature/[feature-id]/base
        ├── feature/[feature-id]/phase-1-...
        └── feature/[feature-id]/phase-2-...
```

## 개발 환경 설정

> **필수:** Google Drive Desktop을 **partnerble.com 계정**으로 설치하고 로그인하세요.
> 팀 공유 Docs/Works 폴더 접근에 필요합니다. → [Google Drive Desktop 다운로드](https://www.google.com/drive/download/)

프로젝트 클론 후 Claude Code에서 `/setting`을 실행하면 초기 설정이 자동으로 진행됩니다.

```
/setting
```

상세 설정 방법 및 전체 작업 플로우는 팀 Google Drive의 `GUIDE.md`를 참고하세요.

## 참고 문서

참고 문서는 팀 Google Drive(`Shared drives/Common/docs`)에서 관리됩니다.

- `service.md` — 서비스 개요 및 MVP 범위
- `terminology.md` — 변수명, 파일명, API 경로 네이밍 기준
- `GUIDE.md` — 개발 환경 설정 및 작업 플로우
