# Task: 코드 전체 application → resume 리네임

## Summary

Prisma 스키마 리네임(phase-1) 완료 후, NestJS 소스 코드의 모든 `application` 관련 파일·클래스·변수·API 경로를 `resume`으로 통일한다.

---

## Scope

### 1. 디렉터리 및 파일 리네임

| 현재 경로 | 변경 후 경로 |
|---|---|
| `src/application/` | `src/resume/` |
| `src/application/application.controller.ts` | `src/resume/resume.controller.ts` |
| `src/application/application.module.ts` | `src/resume/resume.module.ts` |
| `src/application/application.service.ts` | `src/resume/resume.service.ts` |
| `src/application/dto/create-application.dto.ts` | `src/resume/dto/create-resume.dto.ts` |
| `src/application/dto/application-response.dto.ts` | `src/resume/dto/resume-response.dto.ts` |
| `src/application/dto/application-detail-response.dto.ts` | `src/resume/dto/resume-detail-response.dto.ts` |
| `src/application/dto/application-list-query.dto.ts` | `src/resume/dto/resume-list-query.dto.ts` |
| `src/application/dto/update-application-status.dto.ts` | `src/resume/dto/update-resume-status.dto.ts` |

### 2. 클래스·인터페이스 리네임

| 현재 이름 | 변경 후 이름 |
|---|---|
| `ApplicationModule` | `ResumeModule` |
| `ApplicationController` | `ResumeController` |
| `ApplicationService` | `ResumeService` |
| `CreateApplicationDto` | `CreateResumeDto` |
| `ApplicationResponseDto` | `ResumeResponseDto` |
| `ApplicationDetailResponseDto` | `ResumeDetailResponseDto` |
| `ApplicationListQueryDto` | `ResumeListQueryDto` |
| `AdminApplicationListItemDto` | `AdminResumeListItemDto` |
| `AdminApplicationListResponseDto` | `AdminResumeListResponseDto` |
| `UpdateApplicationStatusDto` | `UpdateResumeStatusDto` |
| `UpdateApplicationStatusResponseDto` | `UpdateResumeStatusResponseDto` |
| `ApplicationStatus` (import from `@prisma/client`) | `ResumeStatus` |

### 3. API 경로 변경

**위치:** `src/resume/resume.controller.ts`

```ts
// Before
@Controller('applications')

// After
@Controller('resumes')
```

### 4. 연관 파일 import 수정

**요구사항:**

- [ ] `src/app.module.ts` — `ApplicationModule` → `ResumeModule` import 및 배열 교체
- [ ] `src/common/notification/notification.service.ts` — `application` 관련 변수·주석 교체
- [ ] `src/common/s3/s3.constants.ts` — `applications` 문자열 잔존 여부 확인 후 `resumes`로 교체
- [ ] `src/common/guards/api-key.guard.ts` — 변경 없음 (application 미참조)
- [ ] `src/app.factory.ts` — 변경 없음 (application 미참조)

### 5. Swagger operationId 및 description 업데이트

**위치:** `src/resume/resume.controller.ts`

- [ ] `operationId: 'createApplication'` → `'createResume'`
- [ ] `operationId: 'findAllApplications'` → `'findAllResumes'`
- [ ] `operationId: 'updateApplicationStatus'` → `'updateResumeStatus'`
- [ ] description 내 "지원서" 표현은 유지 (한국어), 코드 식별자만 변경

---

## Acceptance Criteria

- [ ] `src/application/` 디렉터리 완전 삭제
- [ ] `src/resume/` 디렉터리 및 모든 파일 정상 동작
- [ ] `GET /resumes`, `POST /resumes`, `PATCH /resumes/:id/status` 경로로 변경
- [ ] 코드베이스 전체에 `ApplicationModule`, `ApplicationService`, `ApplicationController` 잔존 없음
- [ ] `ApplicationStatus` import 잔존 없음 (`ResumeStatus`로 교체)
- [ ] `pnpm lint` 통과
- [ ] `pnpm generate:openapi` 정상 완료

---

## Notes

- phase-1 (Prisma 리네임) 완료 후 진행
- 파일 삭제/생성 시 git mv 대신 새 파일 생성 후 기존 파일 삭제 방식으로 처리 (ts-node 경로 충돌 방지)
- S3 업로드 경로 `'applications'` 문자열이 `s3.constants.ts` 또는 service에 하드코딩되어 있다면 `'resumes'`로 변경 (기존 업로드 파일 경로는 변경되지 않으므로 신규 업로드만 영향)
