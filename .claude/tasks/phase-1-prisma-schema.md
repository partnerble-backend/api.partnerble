# Task: Prisma 스키마 변경 — Account.phone optional, Partner 모델 추가

## Summary

Account 모델의 phone 필드를 선택값으로 변경하고, 파트너 전용 프로필 데이터를 저장하는 Partner 모델을 신규 추가한다.
스키마 변경 후 migrate dev → prisma generate 순서로 실행한다.

---

## Scope

### 1. Account 모델 수정

**위치:** `prisma/schema.prisma`

**요구사항:**

- [ ] `phone String` → `phone String?` 로 변경

---

### 2. Partner 모델 신규 추가

**위치:** `prisma/schema.prisma`

**요구사항:**

- [ ] 아래 필드로 Partner 모델 추가
  - `id` — `@id @default(cuid())`
  - `accountId` — `String @unique` (FK → Account.id)
  - `account` — `Account @relation(...)`
  - `interestTags` — `String[]`
  - `industry` — `String`
  - `createdAt` — `DateTime @default(now())`
  - `updatedAt` — `DateTime @updatedAt`
- [ ] `@@map("partners")` 추가
- [ ] Account 모델에 역방향 relation 필드 `partner Partner?` 추가

**구현 예시:**

```prisma
model Partner {
  id           String   @id @default(cuid())
  accountId    String   @unique
  account      Account  @relation(fields: [accountId], references: [id])
  interestTags String[]
  industry     String
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@map("partners")
}
```

---

### 3. Migration 실행

**요구사항:**

- [ ] `pnpm prisma migrate dev --name add-partner-optional-phone` 실행
- [ ] `pnpm prisma generate` 실행

---

## Acceptance Criteria

- [ ] `Account.phone` 이 `String?` 타입
- [ ] `Partner` 모델이 스키마에 존재하고 Account와 1:1 relation
- [ ] migration 파일 생성 및 적용 완료
- [ ] `pnpm prisma generate` 오류 없이 완료
- [ ] `pnpm lint` 통과

---

## Notes

- migrate dev 실행 전 로컬 DB가 실행 중이어야 한다
- phone optional 변경은 기존 rows에 영향 없음 (NULL 허용 추가)
