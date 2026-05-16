# Task: ApiKeyGuard 생성

## Summary

`ADMIN_API_KEY` 환경변수를 기반으로 `x-api-key` 헤더를 검증하는 NestJS Guard를 구현한다. 이후 관리자 전용 엔드포인트에 공통으로 적용된다.

---

## Scope

### 1. ApiKeyGuard

**위치:** `src/common/guards/api-key.guard.ts`

**요구사항:**

- [ ] `CanActivate` 인터페이스 구현
- [ ] 요청 헤더 `x-api-key` 값을 `ConfigService`로 읽은 `ADMIN_API_KEY`와 비교
- [ ] 불일치 또는 헤더 누락 시 `UnauthorizedException` throw

**구현 예시:**

```ts
@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];
    const expected = this.configService.get<string>('ADMIN_API_KEY');
    if (!apiKey || apiKey !== expected) {
      throw new UnauthorizedException('Invalid API key');
    }
    return true;
  }
}
```

---

## Acceptance Criteria

- [ ] `x-api-key` 헤더가 없으면 401 반환
- [ ] `x-api-key`가 `ADMIN_API_KEY`와 다르면 401 반환
- [ ] 올바른 키 전달 시 다음 핸들러로 통과
- [ ] `pnpm lint` 통과

---

## Notes

- `ConfigService`는 생성자 주입으로 사용 (`@InjectableScope` 불필요)
- Guard는 별도 모듈 등록 없이 컨트롤러에서 `@UseGuards(ApiKeyGuard)` 직접 사용
