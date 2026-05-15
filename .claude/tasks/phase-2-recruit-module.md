# Task: 공고 신청 API

## Summary

창업자(고객)가 공고 신청 폼을 제출하면 FOUNDER Account와 Recruit를 트랜잭션으로 생성하고, 운영자에게 이메일 알림을 발송한다. 신청된 공고는 `isActive: false`로 저장되며 운영자 검토 후 직접 활성화한다.

---

## Scope

### 1. Recruit 모듈 생성

**위치:** `src/recruit/`

**파일 목록:**

- `src/recruit/recruit.module.ts`
- `src/recruit/recruit.controller.ts`
- `src/recruit/recruit.service.ts`
- `src/recruit/dto/create-recruit.dto.ts`
- `src/recruit/dto/recruit-response.dto.ts`

`AppModule`의 `imports`에 `RecruitModule` 등록 필요.

---

### 2. POST /recruits

| Method | Path | Request | Response | Status |
|---|---|---|---|---|
| POST | /recruits | CreateRecruitDto | RecruitResponseDto | 201 |

**비즈니스 로직:**

1. `name`, `email`, `phone`으로 `type: FOUNDER` Account 생성
2. 생성한 Account의 `id`를 `accountId`로 Recruit 생성 (`isActive: false`)
3. Account + Recruit 생성은 `$transaction`으로 묶는다
4. 생성 완료 후 운영자에게 이메일 알림 (fire-and-forget, 실패해도 201 반환)

**구현 예시:**

```ts
const { recruit } = await this.prisma.$transaction(async (tx) => {
  const account = await tx.account.create({
    data: { name: dto.name, email: dto.email, phone: dto.phone, type: 'FOUNDER' },
  });
  const recruit = await tx.recruit.create({
    data: {
      accountId: account.id,
      isActive: false,
      companyName: dto.companyName,
      location: dto.location,
      industry: dto.industry,
      roleDesc: dto.roleDesc,
      detailContent: dto.detailContent,
      budgetAmount: dto.budgetAmount,
      budgetUnit: dto.budgetUnit,
      duration: dto.duration,
      tags: dto.tags ?? [],
    },
  });
  return { recruit };
});
```

---

### 3. CreateRecruitDto

**위치:** `src/recruit/dto/create-recruit.dto.ts`

| 필드 | 타입 | 검증 | 매핑 |
|---|---|---|---|
| name | string | @IsString @IsNotEmpty | Account.name |
| email | string | @IsEmail | Account.email |
| phone | string | @IsString @IsNotEmpty | Account.phone |
| companyName | string | @IsString @IsNotEmpty | Recruit.companyName |
| location | string | @IsString @IsNotEmpty | Recruit.location |
| industry | string | @IsString @IsNotEmpty | Recruit.industry |
| roleDesc | string | @IsString @IsNotEmpty | Recruit.roleDesc |
| detailContent | string | @IsString @IsNotEmpty | Recruit.detailContent |
| budgetAmount | number | @IsInt @Min(0) | Recruit.budgetAmount |
| budgetUnit | BudgetUnit | @IsEnum(BudgetUnit) | Recruit.budgetUnit |
| duration | string | @IsString @IsNotEmpty | Recruit.duration |
| tags | string[] | @IsArray @IsString({ each: true }) @IsOptional | Recruit.tags |

---

### 4. RecruitResponseDto

**위치:** `src/recruit/dto/recruit-response.dto.ts`

```ts
export class RecruitResponseDto {
  id: string;
  isActive: boolean;
  createdAt: Date;
}
```

---

### 5. NotificationService 확장

**위치:** `src/common/notification/notification.service.ts`

기존 `notify(applicationId)` 외에 공고 신청 알림 메서드 추가:

```ts
async notifyRecruitSubmission(data: {
  recruitId: string;
  companyName: string;
  roleDesc: string;
  name: string;
  email: string;
}): Promise<void>
```

- 발송 대상: `OPERATOR_EMAIL`만
- 실패 시 로깅 후 조용히 종료 (예외 전파 금지)
- 기존 `sendEmail` private 메서드 재사용

이메일 템플릿:
- 제목: `[파트너블] 새 공고 신청 — {companyName}`
- 본문: 회사명, 역할, 신청자 이름, 신청자 이메일

`RecruitModule`의 `imports`에 `NotificationModule` 추가 필요.

---

## Acceptance Criteria

- [ ] `POST /recruits` 201 응답, body: `{ id, isActive: false, createdAt }`
- [ ] FOUNDER Account + Recruit 트랜잭션으로 원자적 생성
- [ ] 운영자 이메일 발송 (fire-and-forget)
- [ ] Prisma 스키마 변경 없음
- [ ] `pnpm lint` 통과

---

## Notes

- `isActive` 기본값이 schema에서 `true`이므로 create 시 `isActive: false` 명시 필수
- `notifyRecruitSubmission()`은 DB 재조회 없이 service에서 직접 데이터 전달 (BF-27 패턴 동일)
- `RecruitModule`에 `NotificationModule` import 필요
