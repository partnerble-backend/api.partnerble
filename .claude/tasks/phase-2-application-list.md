# Task: 관리자 지원서 목록 조회 API

## Summary

관리자가 전체 지원서를 조회할 수 있는 `GET /applications` 엔드포인트를 추가한다. `x-api-key` 인증이 필요하며, `recruitId`·`status` 필터와 페이지네이션을 지원한다.

---

## Scope

### 1. Query DTO

**위치:** `src/application/dto/get-applications-query.dto.ts`

**요구사항:**

- [ ] `recruitId` — `@IsOptional() @IsString()`
- [ ] `status` — `@IsOptional()` + `ApplicationStatus` enum 검증
- [ ] `page` — `@IsOptional() @IsInt() @Min(1)`, 기본값 `1`
- [ ] `limit` — `@IsOptional() @IsInt() @Min(1)`, 기본값 `20`

### 2. Response DTO

**위치:** `src/application/dto/application-response.dto.ts` (기존 파일에 추가)

**요구사항:**

- [ ] `AdminApplicationListItemDto` — `id`, `recruitId`, `roleDesc`, `companyName`, `name`, `phone`, `introduction`, `attachmentUrl`, `attachmentName`, `status`, `createdAt`
- [ ] `AdminApplicationListResponseDto extends PaginatedResponseDto<AdminApplicationListItemDto>`

### 3. Service 메서드

**위치:** `src/application/application.service.ts`

**요구사항:**

- [ ] `findAll(query: GetApplicationsQueryDto)` 메서드 추가
- [ ] `recruitId`, `status` 조건 있을 때만 `where`에 포함
- [ ] `createdAt desc` 정렬
- [ ] `skip` / `take` 페이지네이션 적용
- [ ] `total` count와 `items` 함께 반환

### 4. Controller 엔드포인트

**위치:** `src/application/application.controller.ts`

**API Spec:**

| Method | Path | Request | Response | Status |
|---|---|---|---|---|
| GET | /applications | Query: `GetApplicationsQueryDto` | `AdminApplicationListResponseDto` | 200 |

**요구사항:**

- [ ] `@UseGuards(ApiKeyGuard)` 적용
- [ ] `@ApiSecurity('x-api-key')` Swagger 어노테이션 추가
- [ ] Query params를 `GetApplicationsQueryDto`로 바인딩

---

## Acceptance Criteria

- [ ] `GET /applications` — 전체 목록 반환 (최신순)
- [ ] `?recruitId=xxx` — 해당 공고 지원서만 필터
- [ ] `?status=PENDING` — 해당 상태만 필터
- [ ] `?page=2&limit=10` — 페이지네이션 동작
- [ ] 인증 없으면 401 반환
- [ ] `pnpm lint` 통과

---

## Notes

- `PaginatedResponseDto`는 `src/common/dto/response.dto.ts`에서 import
- `ApplicationStatus` enum은 Prisma 스키마에서 import (`@prisma/client`)
- `phase-1-api-key-guard.md` 완료 후 진행
