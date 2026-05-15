# Task: 공고 목록 및 상세 API

## Summary

기존 `src/recruit/` 모듈에 공고 목록(GET /recruits)과 상세(GET /recruits/:id) 엔드포인트를 추가한다. 응답에서 `email`, `phone`(Account 정보)은 항상 제외하며, 프론트 mock 데이터를 이 API로 대체한다.

---

## Scope

### 1. DTOs 추가

**위치:** `src/recruit/dto/`

**파일 목록:**

- `src/recruit/dto/recruit-list-query.dto.ts` — 목록 조회 query params
- `src/recruit/dto/recruit-list-response.dto.ts` — 목록 응답 (`{ data, total }`)
- `src/recruit/dto/recruit-detail-response.dto.ts` — 상세 응답 (`{ data }`)

#### RecruitListQueryDto

```ts
export class RecruitListQueryDto {
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isActive?: boolean = true;
}
```

#### RecruitListItemDto (내부 타입, list response에서 사용)

| 필드 | 타입 |
|---|---|
| id | string |
| companyName | string |
| location | string |
| industry | string |
| roleDesc | string |
| budgetAmount | number |
| budgetUnit | BudgetUnit |
| duration | string |
| tags | string[] |
| createdAt | Date |

#### RecruitListResponseDto

```ts
export class RecruitListResponseDto {
  data: RecruitListItemDto[];
  total: number;
}
```

#### RecruitDetailItemDto (내부 타입, detail response에서 사용)

`RecruitListItemDto`의 모든 필드 + `detailContent: string`, `isActive: boolean`

#### RecruitDetailResponseDto

```ts
export class RecruitDetailResponseDto {
  data: RecruitDetailItemDto;
}
```

---

### 2. GET /recruits

| Method | Path | Query | Response | Status |
|---|---|---|---|---|
| GET | /recruits | isActive (boolean, 기본 true) | RecruitListResponseDto | 200 |

**비즈니스 로직:**

- `isActive` 필터 적용 (`where: { isActive: query.isActive ?? true }`)
- 최신순 정렬 (`orderBy: { createdAt: 'desc' }`)
- `email`, `phone` 미포함 (Account relation select 없음)

---

### 3. GET /recruits/:id

| Method | Path | Response | Status |
|---|---|---|---|
| GET | /recruits/:id | RecruitDetailResponseDto | 200 |

**비즈니스 로직:**

- `id`로 Recruit 조회
- 없으면 `NotFoundException` throw
- `email`, `phone` 미포함

---

### 4. Controller 수정

**위치:** `src/recruit/recruit.controller.ts`

기존 `POST` 유지하고 두 엔드포인트 추가:

```ts
@Get()
findAll(@Query() query: RecruitListQueryDto): Promise<RecruitListResponseDto> {
  return this.recruitService.findAll(query);
}

@Get(':id')
findOne(@Param('id') id: string): Promise<RecruitDetailResponseDto> {
  return this.recruitService.findOne(id);
}
```

---

### 5. Service 수정

**위치:** `src/recruit/recruit.service.ts`

기존 `create()` 유지하고 두 메서드 추가:

```ts
async findAll(query: RecruitListQueryDto): Promise<RecruitListResponseDto> {
  const isActive = query.isActive ?? true;
  const [data, total] = await this.prisma.$transaction([
    this.prisma.recruit.findMany({
      where: { isActive },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, companyName: true, location: true, industry: true,
        roleDesc: true, budgetAmount: true, budgetUnit: true,
        duration: true, tags: true, createdAt: true,
      },
    }),
    this.prisma.recruit.count({ where: { isActive } }),
  ]);
  return { data, total };
}

async findOne(id: string): Promise<RecruitDetailResponseDto> {
  const recruit = await this.prisma.recruit.findUnique({
    where: { id },
    select: {
      id: true, companyName: true, location: true, industry: true,
      roleDesc: true, detailContent: true, budgetAmount: true, budgetUnit: true,
      duration: true, tags: true, isActive: true, createdAt: true,
    },
  });
  if (!recruit) throw new NotFoundException('존재하지 않는 공고입니다.');
  return { data: recruit };
}
```

---

## Acceptance Criteria

- [ ] `GET /recruits` — `{ data: [...], total: N }` 반환, `isActive` 기본값 `true`
- [ ] `GET /recruits?isActive=false` — 비활성 공고만 반환
- [ ] `GET /recruits/:id` — `{ data: {...} }` 반환, 없는 id → 404
- [ ] 응답에 `email`, `phone` 미포함
- [ ] `pnpm lint` 통과

---

## Notes

- `select`를 명시해 Account relation join 없이 Recruit 필드만 조회 (`email`, `phone` 노출 차단)
- `isActive` query param은 문자열로 오므로 `@Transform`으로 boolean 변환 필요
- `RecruitListItemDto`, `RecruitDetailItemDto`는 DTO 파일 내 class로 정의 (export)
