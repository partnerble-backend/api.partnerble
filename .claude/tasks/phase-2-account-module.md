# Task: account 모듈 구현 — POST /api/accounts

## Summary

계정 등록 API를 구현한다. flat request body로 Account와 Partner 데이터를 받아 Prisma $transaction으로 동시에 insert한다.
type === PARTNER일 때 interestTags, industry 필수 검증, FOUNDER일 때는 무시한다.

---

## Scope

### 1. CreateAccountDto

**위치:** `src/account/dto/create-account.dto.ts`

**요구사항:**

- [ ] 아래 필드 정의 (class-validator + @ApiProperty)

| 필드 | 데코레이터 | 비고 |
|---|---|---|
| name | `@IsString() @IsNotEmpty()` | |
| email | `@IsEmail() @IsOptional()` | |
| phone | `@IsString() @IsOptional()` | |
| type | `@IsEnum(AccountType)` | |
| interestTags | `@IsArray() @IsString({ each: true }) @IsOptional()` | |
| industry | `@IsString() @IsOptional()` | |

- [ ] type === PARTNER 시 interestTags, industry 필수 검증 — `@ValidateIf` 또는 커스텀 validator 사용

---

### 2. AccountService

**위치:** `src/account/account.service.ts`

**API Spec:**

| Method | Path | Request | Response | Status |
|---|---|---|---|---|
| POST | /accounts | CreateAccountDto | Prisma `Account` | 201 |

**요구사항:**

- [ ] `create(dto: CreateAccountDto)` 메서드 구현
- [ ] `type === PARTNER`일 때 `$transaction` 으로 Account + Partner 동시 insert
- [ ] `type === FOUNDER`일 때 Account만 insert
- [ ] 반환값: Prisma 생성 `Account` 타입 그대로 (별도 Response DTO 없음)

**구현 예시:**

```ts
async create(dto: CreateAccountDto) {
  if (dto.type === AccountType.PARTNER) {
    return this.prisma.$transaction(async (tx) => {
      const account = await tx.account.create({ data: { name: dto.name, email: dto.email, phone: dto.phone, type: dto.type } });
      await tx.partner.create({ data: { accountId: account.id, interestTags: dto.interestTags!, industry: dto.industry! } });
      return account;
    });
  }
  return this.prisma.account.create({ data: { name: dto.name, email: dto.email, phone: dto.phone, type: dto.type } });
}
```

---

### 3. AccountController

**위치:** `src/account/account.controller.ts`

**요구사항:**

- [ ] `@Post()` + `@HttpCode(201)` 엔드포인트
- [ ] Swagger 데코레이터 완비
  - `@ApiOperation({ summary: '계정 등록', operationId: 'createAccount', description: '...' })`
  - `@ApiBody({ type: CreateAccountDto })`
  - `@ApiResponse({ status: 201, description: '계정 등록 성공' })`
  - `@ApiResponse({ status: 400, description: '유효성 검사 실패' })`

---

### 4. AccountModule

**위치:** `src/account/account.module.ts`

**요구사항:**

- [ ] `PrismaModule` import
- [ ] `AccountService`, `AccountController` 등록
- [ ] `AppModule`에 `AccountModule` import 추가

---

## Acceptance Criteria

- [ ] POST /api/accounts — PARTNER 타입: Account + Partner 동시 insert (transaction)
- [ ] POST /api/accounts — FOUNDER 타입: Account만 insert
- [ ] interestTags, industry 미전달 시 PARTNER 타입에서 400 반환
- [ ] `pnpm lint` 통과

---

## Notes

- phase-1 (스키마 변경 + migrate) 완료 후 진행
- Response DTO 별도 정의 없이 Prisma Account 타입 그대로 반환
