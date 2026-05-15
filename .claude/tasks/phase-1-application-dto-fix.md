# Task: CreateApplicationDto contact → phone 필드 리네임

## Summary

`CreateApplicationDto`의 `contact` 필드를 스키마 필드명(`Account.phone`)에 맞게 `phone`으로 변경한다. `contact`는 스키마에 없는 별칭이며, BF-28 이후 모든 DTO가 스키마 필드명을 직접 사용하도록 통일한다.

---

## Scope

### 1. CreateApplicationDto 수정

**위치:** `src/application/dto/create-application.dto.ts`

**변경:**

```ts
// Before
@IsString()
@IsNotEmpty()
@MaxLength(100)
contact: string;

// After
@IsString()
@IsNotEmpty()
@MaxLength(100)
phone: string;
```

---

### 2. ApplicationService 수정

**위치:** `src/application/application.service.ts`

`dto.contact` → `dto.phone` 참조 변경:

```ts
// Before
phone: dto.contact,

// After
phone: dto.phone,
```

---

## Acceptance Criteria

- [ ] `CreateApplicationDto.contact` → `phone` 리네임
- [ ] `ApplicationService`의 `dto.contact` → `dto.phone` 참조 수정
- [ ] `pnpm lint` 통과

---

## Notes

- 기존 `/applications` POST API의 request body 필드명이 변경됨 (`contact` → `phone`)
- 프론트엔드 연동 시 request body 업데이트 필요
