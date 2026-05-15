# Task: Prisma 스키마 작성 및 첫 마이그레이션

## Summary

Partnerble MVP의 핵심 두 모델(Recruit, Application)과 관련 Enum을 `prisma/schema.prisma`에 추가하고, 첫 마이그레이션을 실행한다. 기존 datasource/generator 블록은 유지한다.

---

## Scope

### 1. prisma/schema.prisma 모델 추가

**위치:** `prisma/schema.prisma`

**추가할 모델 및 Enum (명세서 원문):**

```prisma
model Recruit {
  id            String        @id @default(cuid())
  companyName   String
  location      String
  industry      String
  roleDesc      String
  detailContent String        @db.Text
  budgetAmount  Int
  budgetUnit    BudgetUnit
  duration      String
  tags          String[]
  isActive      Boolean       @default(true)
  customerEmail String
  customerPhone String
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
  applications  Application[]

  @@map("recruits")
}

enum BudgetUnit {
  monthly
  daily
  per_project

  @@map("budget_unit")
}

model Application {
  id              String            @id @default(cuid())
  recruitId       String
  recruit         Recruit           @relation(fields: [recruitId], references: [id])
  recruitTitle    String
  recruitCompany  String
  name            String
  contact         String
  introduction    String            @db.Text
  attachmentUrl   String?
  attachmentKey   String?
  attachmentName  String?
  privacyAgreedAt DateTime
  status          ApplicationStatus @default(PENDING)
  emailNotifiedAt DateTime?
  smsNotifiedAt   DateTime?
  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt

  @@map("applications")
}

enum ApplicationStatus {
  PENDING
  REVIEWED
  CONTACTED
  REJECTED

  @@map("application_status")
}
```

**요구사항:**

- [ ] 기존 generator/datasource 블록 유지
- [ ] `Recruit` 모델 추가 (`@@map("recruits")`)
- [ ] `Application` 모델 추가 (`@@map("applications")`)
- [ ] `BudgetUnit` Enum 추가 (`@@map("budget_unit")`)
- [ ] `ApplicationStatus` Enum 추가 (`@@map("application_status")`)

---

### 2. 마이그레이션 실행

**요구사항:**

- [ ] `pnpm prisma migrate dev --name init` 실행
- [ ] `pnpm prisma generate` 실행

**전제 조건:** 로컬 Docker DB(`partnerble-db`)가 실행 중이어야 한다.

---

## Acceptance Criteria

- [ ] `prisma/schema.prisma`에 Recruit, Application 모델 및 Enum 2개 존재
- [ ] `prisma/migrations/` 디렉터리 생성 및 초기 마이그레이션 파일 존재
- [ ] `pnpm prisma generate` 정상 완료
- [ ] `pnpm lint` 통과

---

## Notes

- `BudgetUnit` Enum 값이 소문자(`monthly`, `daily`, `per_project`)로 정의됨 — AGENTS.md의 UPPER_SNAKE_CASE 규칙과 상충할 수 있으므로 Validator 검토 필요
- `customerEmail`, `customerPhone` 필드명이 terminology.md의 용어 기준(`founder`)과 맞는지 Validator 검토 필요
- `tags String[]` — PostgreSQL 배열 타입, Prisma에서 지원됨
- `detailContent`, `introduction` 필드는 `@db.Text`로 긴 텍스트 허용