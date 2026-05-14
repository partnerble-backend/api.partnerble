# Task: 환경변수 검증

## Summary

앱 기동 시 필수 환경변수가 누락되거나 형식이 잘못된 경우 즉시 오류를 발생시키도록 Joi 기반 검증 스키마를 설정한다.

---

## Scope

### 1. 패키지 설치

**요구사항:**

- [ ] `pnpm add joi`
- [ ] `pnpm add -D @types/joi` (필요 시)

---

### 2. ConfigModule 검증 스키마 추가

**위치:** `src/app.module.ts`

**필수 환경변수:**

| 변수명 | 타입 |
|---|---|
| `DATABASE_URL` | string |
| `AWS_REGION` | string |
| `AWS_S3_BUCKET` | string |
| `AWS_ACCESS_KEY_ID` | string |
| `AWS_SECRET_ACCESS_KEY` | string |
| `OPERATOR_EMAIL` | string (email 형식) |
| `SENDGRID_API_KEY` | string |
| `ADMIN_API_KEY` | string |

**요구사항:**

- [ ] `@nestjs/config`의 `ConfigModule.forRoot()`에 `validationSchema` 옵션 추가
- [ ] 모든 필수 변수를 `Joi.string().required()`로 정의
- [ ] `OPERATOR_EMAIL`은 `.email()` 추가 검증

**구현 예시:**

```ts
ConfigModule.forRoot({
  isGlobal: true,
  validationSchema: Joi.object({
    DATABASE_URL: Joi.string().required(),
    AWS_REGION: Joi.string().required(),
    AWS_S3_BUCKET: Joi.string().required(),
    AWS_ACCESS_KEY_ID: Joi.string().required(),
    AWS_SECRET_ACCESS_KEY: Joi.string().required(),
    OPERATOR_EMAIL: Joi.string().email().required(),
    SENDGRID_API_KEY: Joi.string().required(),
    ADMIN_API_KEY: Joi.string().required(),
  }),
}),
```

---

### 3. .env.example 업데이트

**위치:** `.env.example`

**요구사항:**

- [ ] 위 8개 필수 환경변수 항목이 모두 존재하는지 확인, 없으면 추가

---

## Acceptance Criteria

- [ ] 필수 환경변수 중 하나를 제거하면 앱 기동 시 오류 발생
- [ ] `.env.example`에 모든 필수 변수 항목 존재
- [ ] `pnpm lint` 통과

---

## Notes

- `ConfigModule`이 아직 app.module.ts에 없으면 `pnpm add @nestjs/config`도 함께 설치
