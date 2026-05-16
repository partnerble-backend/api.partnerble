# Task: 관리자 지원서 상태 변경 API

## Summary

관리자가 지원서 상태를 변경할 수 있는 `PATCH /applications/:id/status` 엔드포인트를 추가한다. `x-api-key` 인증이 필요하며, 존재하지 않는 id 요청 시 404를 반환한다.

---

## Scope

### 1. Request DTO

**위치:** `src/application/dto/update-application-status.dto.ts`

**요구사항:**

- [ ] `status` — `@IsEnum(ApplicationStatus) @IsNotEmpty()`

### 2. Response DTO

**위치:** `src/application/dto/application-response.dto.ts` (기존 파일에 추가)

**요구사항:**

- [ ] `UpdateApplicationStatusResponseDto` — `id`, `status`, `updatedAt`

### 3. Service 메서드

**위치:** `src/application/application.service.ts`

**요구사항:**

- [ ] `updateStatus(id: string, dto: UpdateApplicationStatusDto)` 메서드 추가
- [ ] `prisma.application.findUnique`로 존재 여부 확인 → 없으면 `NotFoundException`
- [ ] `prisma.application.update`로 `status` 갱신
- [ ] 갱신된 `id`, `status`, `updatedAt` 반환

### 4. Controller 엔드포인트

**위치:** `src/application/application.controller.ts`

**API Spec:**

| Method | Path | Request | Response | Status |
|---|---|---|---|---|
| PATCH | /applications/:id/status | Body: `UpdateApplicationStatusDto` | `UpdateApplicationStatusResponseDto` | 200 |

**요구사항:**

- [ ] `@UseGuards(ApiKeyGuard)` 적용
- [ ] `@ApiSecurity('x-api-key')` Swagger 어노테이션 추가
- [ ] `:id` 파라미터를 `@Param('id')`로 바인딩

---

## Acceptance Criteria

- [ ] 유효한 id + 올바른 API Key → 200 + `{ id, status, updatedAt }`
- [ ] 존재하지 않는 id → 404
- [ ] API Key 없거나 틀림 → 401
- [ ] `status` 값이 enum 외 값이면 400
- [ ] `pnpm lint` 통과

---

## Notes

- `phase-1-api-key-guard.md` 완료 후 진행
- `ApplicationStatus` enum 값: `PENDING`, `REVIEWED`, `ACCEPTED`, `REJECTED` (Prisma 스키마 기준 확인)
