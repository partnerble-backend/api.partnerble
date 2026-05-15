# Task: 이메일 알림 서비스

## Summary

지원서 제출 후 운영자와 창업자(founder)에게 이메일 알림을 **AWS SES**로 발송한다. 발송은 비동기이며 실패해도 지원서 저장 결과(201)에 영향을 주지 않는다. 발송 성공 시 `Application.emailNotifiedAt`을 기록한다.

---

## Scope

### 1. 패키지 설치

**요구사항:**

- [ ] `pnpm add @aws-sdk/client-ses`

> `@aws-sdk/client-s3`가 이미 설치되어 있으므로 AWS SDK v3 패턴 동일하게 사용

---

### 2. 기존 stub 업그레이드

**현재 상태:** `src/common/notification/notification.service.ts`에 로그만 출력하는 stub 존재

**작업:**

- [ ] 기존 `src/common/notification/` stub을 실제 AWS SES 구현으로 교체
- 모듈 위치는 명세서의 `src/notification/`이 아닌 기존 `src/common/notification/` 유지 (이미 `ApplicationModule`에 연결됨)

---

### 3. NotificationService 구현

**위치:** `src/common/notification/notification.service.ts`

**메서드:** `notify(applicationId: string): Promise<void>`

**동작 흐름:**

1. `applicationId`로 Application + Recruit + Account(partner) + Recruit.account(founder) 조회
2. 운영자(`OPERATOR_EMAIL`)와 창업자(founder Account email)에게 **동시 발송** (`Promise.allSettled`)
3. 발송 성공 시 `Application.emailNotifiedAt = new Date()` 업데이트
4. 발송 실패 시 로깅 후 조용히 종료 (예외 전파 금지)

**명세서 용어 매핑 (스키마 기준):**

| 명세서 표현 | 실제 필드 |
|---|---|
| `recruitTitle` | `recruit.roleDesc` (제목으로 사용) |
| `Recruit.customerEmail` | `recruit.account.email` (창업자 Account email) |
| 지원자 이름 | `application.account.name` |
| 지원자 연락처 | `application.account.phone` |

> `customerEmail`, `recruitTitle`은 BF-25/BF-26에서 제거됨. Validator 검토 필요.

**이메일 템플릿:**

운영자 수신:
- 제목: `[파트너블] 새 지원자 — {recruit.roleDesc}`
- 본문: 지원자 이름, 연락처, 자기소개, 첨부파일 URL, 공고명(`roleDesc`)

창업자 수신:
- 제목: `[파트너블] {recruit.roleDesc} 공고에 새 지원자가 있습니다`
- 본문: 파트너블 브랜딩 포함, 지원자 이름, 연락처, 자기소개, 첨부파일 URL

**구현 예시:**

```ts
async notify(applicationId: string): Promise<void> {
  const application = await this.prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      account: true,          // partner (지원자)
      recruit: {
        include: { account: true }, // founder (창업자)
      },
    },
  });

  if (!application) {
    this.logger.warn(`Application not found: ${applicationId}`);
    return;
  }

  const results = await Promise.allSettled([
    this.sendToOperator(application),
    this.sendToFounder(application),
  ]);

  const allSucceeded = results.every((r) => r.status === 'fulfilled');
  if (allSucceeded) {
    await this.prisma.application.update({
      where: { id: applicationId },
      data: { emailNotifiedAt: new Date() },
    });
  } else {
    results.forEach((r, i) => {
      if (r.status === 'rejected') {
        this.logger.error(`Email ${i === 0 ? 'operator' : 'founder'} failed: ${r.reason}`);
      }
    });
  }
}
```

---

### 4. 환경변수 변경

**신규 env var:** `SES_FROM_EMAIL` — SES에서 인증된 발신자 이메일 주소

**제거 env var:** `SENDGRID_API_KEY` — SES는 IAM 역할로 인증하므로 API 키 불필요

**요구사항:**

- [ ] `src/app.module.ts` Joi 스키마에서 `SENDGRID_API_KEY` 제거, `SES_FROM_EMAIL: Joi.string().email().required()` 추가
- [ ] `.env.example`에서 `SENDGRID_API_KEY` 제거, `SES_FROM_EMAIL=` 추가
- [ ] SES 클라이언트 인증: 로컬에서는 `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` 사용, 운영(EB)에서는 IAM 역할 자동 인증

---

## Acceptance Criteria

- [ ] `notify()` 실행 시 운영자/창업자에게 이메일 2통 발송
- [ ] 발송 성공 시 `Application.emailNotifiedAt` 업데이트
- [ ] 발송 실패 시 예외 전파 없이 로그만 출력
- [ ] `SES_FROM_EMAIL` 환경변수 Joi 검증에 추가, `SENDGRID_API_KEY` 제거
- [ ] `pnpm lint` 통과

---

## Notes

- `Promise.allSettled` 사용 — 한 쪽 실패가 다른 쪽 발송을 막지 않음
- `@aws-sdk/client-ses` 타입은 패키지에 내장되어 있어 별도 `@types` 불필요
- 창업자 이메일(`recruit.account.email`)이 null인 경우 (Account.email이 nullable) 발송 건너뜀
- SES는 EB 환경에서 IAM 역할로 자동 인증 — 운영 환경에서 별도 키 불필요
- 로컬 개발 시 `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY`로 SES 접근 (기존 S3와 동일 키 사용 가능, SES 권한 추가 필요)
- SMS(`smsNotifiedAt`)는 이번 태스크 범위 외, 컬럼 유지만
