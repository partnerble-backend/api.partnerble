# Task: 공통 레이어 구성

## Summary

전체 API의 응답 형태를 통일하기 위해 전역 예외 필터와 응답 인터셉터를 구현한다. 에러는 `{ statusCode, message, error }`, 성공은 `{ data }` 형태로 래핑된다.

---

## Scope

### 1. HttpExceptionFilter

**위치:** `src/common/filters/http-exception.filter.ts`

**요구사항:**

- [ ] `ExceptionFilter` 구현, `@Catch(HttpException)` 데코레이터 적용
- [ ] 응답 형태: `{ statusCode, message, error }`

**구현 예시:**

```ts
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatusCode();
    const exceptionResponse = exception.getResponse();

    response.status(status).json({
      statusCode: status,
      message:
        typeof exceptionResponse === 'object' && 'message' in exceptionResponse
          ? (exceptionResponse as any).message
          : exception.message,
      error: exception.name,
    });
  }
}
```

---

### 2. ResponseInterceptor

**위치:** `src/common/interceptors/response.interceptor.ts`

**요구사항:**

- [ ] `NestInterceptor` 구현
- [ ] 성공 응답을 `{ data: <원본 응답> }` 형태로 래핑

**구현 예시:**

```ts
@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(map((data) => ({ data })));
  }
}
```

---

### 3. app.module.ts 글로벌 등록

**위치:** `src/app.module.ts`

**요구사항:**

- [ ] `APP_FILTER`로 `HttpExceptionFilter` 글로벌 등록
- [ ] `APP_INTERCEPTOR`로 `ResponseInterceptor` 글로벌 등록

**구현 예시:**

```ts
providers: [
  { provide: APP_FILTER, useClass: HttpExceptionFilter },
  { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
],
```

---

## Acceptance Criteria

- [ ] 존재하지 않는 경로 요청 시 `{ statusCode: 404, message: ..., error: ... }` 반환
- [ ] 정상 응답이 `{ data: ... }` 형태로 래핑
- [ ] `pnpm lint` 통과

---

## Notes

- `APP_FILTER`, `APP_INTERCEPTOR`는 `@nestjs/core`에서 import
