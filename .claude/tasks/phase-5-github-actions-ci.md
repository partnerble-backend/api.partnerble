# Task: GitHub Actions CI

## Summary

PR 및 push 시 자동으로 lint와 테스트를 실행하는 CI 워크플로우를 구성해 코드 품질을 보장한다.

---

## Scope

### 1. CI 워크플로우 파일 생성

**위치:** `.github/workflows/ci.yml`

**트리거:**

- [ ] `push` — 모든 브랜치
- [ ] `pull_request` — 모든 브랜치

**실행 순서:**

- [ ] `pnpm install`
- [ ] `pnpm lint`
- [ ] `pnpm test`

**요구사항:**

- [ ] Node.js 버전: 프로젝트 engines 필드 또는 최신 LTS (20.x)
- [ ] pnpm 설치: `pnpm/action-setup` 액션 사용
- [ ] 캐시 활용으로 빠른 실행

**구현 예시:**

```yaml
name: CI

on:
  push:
  pull_request:

jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v3
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - run: pnpm install --frozen-lockfile

      - run: pnpm lint

      - run: pnpm test
```

---

## Acceptance Criteria

- [ ] `.github/workflows/ci.yml` 파일 존재
- [ ] GitHub에 push 시 Actions 탭에서 워크플로우 실행 확인
- [ ] `pnpm lint` 통과

---

## Notes

- pnpm 버전은 package.json의 `packageManager` 필드와 맞추거나 9.x 이상 사용
- 테스트 DB가 필요한 경우 추후 service container를 추가해야 하지만, 현재 단계에서는 불필요
