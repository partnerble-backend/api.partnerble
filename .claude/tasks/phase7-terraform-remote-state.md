# Terraform 인프라 구축 — EB 배포 완료

## 완료된 작업

| 항목 | 상태 |
|---|---|
| terraform apply (전체 인프라) | ✅ 완료 |
| SES 도메인 인증 (partnerble.com) | ✅ Verified |
| SES 샌드박스 해제 | ✅ 승인 완료 |
| Dockerfile 작성 | ✅ 완료 |
| ECR 이미지 push | ✅ 완료 (linux/amd64) |
| EB 배포 | ✅ 완료 — `curl http://43.201.119.213/api` 응답 확인 |

---

## 생성된 인프라 엔드포인트

- ECR: `REPLACE_WITH_AWS_ACCOUNT_ID.dkr.ecr.ap-northeast-2.amazonaws.com/partnerble-prod-api`
- RDS: `partnerble-prod-db.cfw42q4202fy.ap-northeast-2.rds.amazonaws.com:5432`
- S3: `partnerble-uploads-prod`
- EB IP: `43.201.119.213`

---

## 최종 Dockerfile

```dockerfile
# Stage 1 — Build
FROM node:22-slim AS builder
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*
RUN corepack enable

COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma

# flat node_modules: pnpm 가상 스토어 symlink 문제로 Prisma client 해석 오류 방지
RUN echo "shamefully-hoist=true" > .npmrc
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm prisma generate --schema=prisma/schema.prisma
RUN pnpm build

# Stage 2 — Production
FROM node:22-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["sh", "-c", "node_modules/.bin/prisma migrate deploy && node dist/src/main.js"]
```

---

## 디버깅 히스토리 (해결된 오류 전체)

| # | 오류 | 원인 | 해결 |
|---|---|---|---|
| 1 | ARM64 이미지 | Mac Apple Silicon 기본 빌드 | `--platform linux/amd64` |
| 2 | Prisma generate 누락 | build 전 generate 없음 | `RUN pnpm prisma generate` 추가 |
| 3 | Alpine OpenSSL 없음 | `node:22-alpine` 미지원 | `node:22-slim` (Debian)으로 전환 |
| 4 | `dist/main` not found | tsconfig `baseUrl: "./"` 로 출력이 `dist/src/main.js` | CMD를 `node dist/src/main.js`로 수정 |
| 5 | `ResumeStatus` undefined | pnpm 가상 스토어 symlink + schema.prisma `output` 커스텀 경로 충돌 | `shamefully-hoist=true` + schema.prisma `output` 제거 |
| 6 | AWS credentials 누락 | S3/SES 클라이언트에 하드코딩된 credentials | IAM 역할로 전환, credentials 코드에서 제거 |
| 7 | Joi config validation 실패 | `AWS_ACCESS_KEY_ID` required로 설정 | Joi validationSchema 전체 제거 |

---

## 코드 변경 사항

- `prisma/schema.prisma` — `output` 제거, `binaryTargets = ["native", "debian-openssl-3.0.x"]` 추가
- `src/common/s3/s3.service.ts` — S3Client credentials 블록 제거 (IAM 역할 사용)
- `src/common/notification/notification.service.ts` — SESClient credentials 블록 제거
- `src/app.module.ts` — Joi validationSchema 제거, joi import 제거

---

## EB 환경변수 (현재 설정됨)

| 변수 | 값 |
|---|---|
| `DATABASE_URL` | RDS 연결 문자열 |
| `AWS_REGION` | `ap-northeast-2` |
| `AWS_S3_BUCKET` | `partnerble-uploads-prod` |
| `OPERATOR_EMAIL` | `neo.lee@partnerble.com` |
| `SES_FROM_EMAIL` | `no-reply@partnerble.com` |
| `ADMIN_API_KEY` | terraform.tfvars 참조 |

