# Task: Prisma 스키마 application → resume 리네임

## Summary

`application`이 NestJS 앱 인스턴스 등 일반 기술 용어와 혼동될 수 있어 지원서 도메인 전체를 `resume`으로 통일한다. 이 phase는 Prisma 스키마 변경과 DB 마이그레이션을 담당한다.

---

## Scope

### 1. Prisma 스키마 변경

**위치:** `prisma/schema.prisma`

**요구사항:**

- [ ] `Account.applications Application[]` → `Account.resumes Resume[]`
- [ ] `Recruit.applications Application[]` → `Recruit.resumes Resume[]`
- [ ] `model Application` → `model Resume`
- [ ] `@@map("applications")` → `@@map("resumes")`
- [ ] `Application.status ApplicationStatus` → `Resume.status ResumeStatus`
- [ ] `Application.account Account` relation → `Resume.account Account`
- [ ] `Application.recruit Recruit` relation → `Resume.recruit Recruit`
- [ ] `enum ApplicationStatus` → `enum ResumeStatus`
- [ ] `@@map("application_status")` → `@@map("resume_status")`
- [ ] enum 값은 유지 (PENDING, REVIEWED, CONTACTED, REJECTED)

**변경 전/후 예시:**

```prisma
// Before
model Application {
  ...
  status  ApplicationStatus @default(PENDING)
  @@map("applications")
}
enum ApplicationStatus {
  PENDING
  ...
  @@map("application_status")
}

// After
model Resume {
  ...
  status  ResumeStatus @default(PENDING)
  @@map("resumes")
}
enum ResumeStatus {
  PENDING
  ...
  @@map("resume_status")
}
```

### 2. Prisma 마이그레이션 실행

**요구사항:**

- [ ] `pnpm prisma:migrate` 실행 (마이그레이션 이름: `rename_application_to_resume`)
- [ ] `pnpm prisma:generate` 실행

---

## Acceptance Criteria

- [ ] `prisma/schema.prisma`에 `Application`, `ApplicationStatus` 잔존 없음
- [ ] 마이그레이션 파일이 `prisma/migrations/` 에 생성됨
- [ ] `pnpm prisma:generate` 정상 완료
- [ ] `pnpm lint` 통과

---

## Notes

- DB 테이블명 `applications` → `resumes`, enum 타입명 `application_status` → `resume_status` 로 실제 변경됨 — 운영 DB 적용 시 주의
- 이 task 완료 후 phase-2 (코드 리네임)를 진행한다
- phase-2에서 `ApplicationStatus` import를 모두 `ResumeStatus`로 교체하므로 이 phase에서는 스키마·마이그레이션만 처리한다
