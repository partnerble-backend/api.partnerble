# Task: partner 모듈 구현 — GET /api/partners/:id

## Summary

파트너 프로필 조회 API를 구현한다. Partner + Account 데이터를 합산해 반환하므로 단일 Prisma 모델로 표현 불가 — PartnerResponseDto를 별도 정의한다.

---

## Scope

### 1. PartnerResponseDto

**위치:** `src/partner/dto/partner-response.dto.ts`

**요구사항:**

- [ ] 아래 필드 정의 (모두 `@ApiProperty` 필수)

| 필드 | 타입 | 출처 |
|---|---|---|
| id | string | Partner |
| accountId | string | Partner |
| name | string | Account |
| email | string \| null | Account |
| phone | string \| null | Account |
| interestTags | string[] | Partner |
| industry | string | Partner |
| createdAt | string (ISO) | Partner |

---

### 2. PartnerService

**위치:** `src/partner/partner.service.ts`

**API Spec:**

| Method | Path | Request | Response | Status |
|---|---|---|---|---|
| GET | /partners/:id | — | `PartnerResponseDto` | 200 |

**요구사항:**

- [ ] `findOne(id: string): Promise<PartnerResponseDto>` 메서드 구현
- [ ] Partner를 `include: { account: true }` 로 조회
- [ ] 존재하지 않는 id → `NotFoundException` throw
- [ ] Partner + Account 필드를 합산해 `PartnerResponseDto` 형태로 반환

**구현 예시:**

```ts
async findOne(id: string): Promise<PartnerResponseDto> {
  const partner = await this.prisma.partner.findUnique({
    where: { id },
    include: { account: true },
  });
  if (!partner) throw new NotFoundException('존재하지 않는 파트너 id');
  return {
    id: partner.id,
    accountId: partner.accountId,
    name: partner.account.name,
    email: partner.account.email ?? null,
    phone: partner.account.phone ?? null,
    interestTags: partner.interestTags,
    industry: partner.industry,
    createdAt: partner.createdAt.toISOString(),
  };
}
```

---

### 3. PartnerController

**위치:** `src/partner/partner.controller.ts`

**요구사항:**

- [ ] `@Get(':id')` 엔드포인트
- [ ] Swagger 데코레이터 완비
  - `@ApiOperation({ summary: '파트너 프로필 조회', operationId: 'getPartner', description: '...' })`
  - `@ApiParam({ name: 'id', description: 'Partner ID', example: 'clx...' })`
  - `@ApiResponse({ status: 200, description: '조회 성공', type: PartnerResponseDto })`
  - `@ApiResponse({ status: 404, description: '존재하지 않는 파트너 id' })`

---

### 4. PartnerModule

**위치:** `src/partner/partner.module.ts`

**요구사항:**

- [ ] `PrismaModule` import
- [ ] `PartnerService`, `PartnerController` 등록
- [ ] `AppModule`에 `PartnerModule` import 추가

---

## Acceptance Criteria

- [ ] GET /api/partners/:id — Partner + Account 합산 응답 정상 반환
- [ ] 존재하지 않는 id → 404 반환
- [ ] `PartnerResponseDto` 의 모든 필드에 `@ApiProperty` 존재
- [ ] `pnpm lint` 통과

---

## Notes

- phase-2 (account 모듈) 완료 후 진행
- partner 모듈은 account 모듈과 독립적으로 구성 (AccountModule import 불필요)
