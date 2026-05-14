# Task: Swagger 설정

## Summary

NestJS 앱에 Swagger UI를 추가해 `/api/docs` 경로에서 API 명세를 확인할 수 있게 한다. `SWAGGER_ENABLED` 환경변수로 운영 환경에서 비활성화할 수 있도록 한다.

---

## Scope

### 1. 패키지 설치

**요구사항:**

- [ ] `pnpm add @nestjs/swagger swagger-ui-express`

---

### 2. main.ts SwaggerModule 초기화

**위치:** `src/main.ts`

**요구사항:**

- [ ] `SWAGGER_ENABLED` 환경변수가 `'true'`일 때만 Swagger 활성화
- [ ] 문서 경로: `/api/docs`
- [ ] 타이틀: `Partnerble API`

**구현 예시:**

```ts
if (process.env.SWAGGER_ENABLED === 'true') {
  const config = new DocumentBuilder()
    .setTitle('Partnerble API')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
}
```

---

### 3. .env.example 업데이트

**위치:** `.env.example`

**요구사항:**

- [ ] `SWAGGER_ENABLED=true` 항목 추가

---

## Acceptance Criteria

- [ ] `SWAGGER_ENABLED=true` 설정 시 `http://localhost:3000/api/docs` 접근 가능
- [ ] `SWAGGER_ENABLED` 미설정 또는 `false`이면 Swagger 미노출
- [ ] `pnpm lint` 통과

---

## Notes

- 운영 환경에서는 `SWAGGER_ENABLED`를 설정하지 않거나 `false`로 두면 자동으로 비활성화
