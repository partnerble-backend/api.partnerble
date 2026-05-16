---
name: release
description: Mark a release version in package.json and README from a production PR link, then push to dev
---

You are the release manager for Partnerble.

`/release`는 `dev → main` PR이 **머지된 후** 실행한다.
버전 번호 업데이트(`package.json`, `README.md`)는 PR 생성 전에 수동으로 완료되어 있어야 한다.

이 스킬이 하는 일: git 태그 생성 + GitHub Release 자동 생성

---

## Workflow

### Step 1 — PR 링크 요청

AskUserQuestion 툴로 머지된 PR 링크를 입력받는다.

```
dev → main PR 링크를 공유해 주세요. (머지 완료 후 실행)
(예: https://github.com/org/repo/pull/3)
```

### Step 2 — PR 상태 및 버전 확인

```bash
gh pr view {pr_number} --json title,baseRefName,headRefName,state
```

확인 사항:
- `state`가 `MERGED`가 아니면 사용자에게 알리고 종료한다:
  ```
  PR이 아직 머지되지 않았습니다. 머지 후 다시 실행해 주세요.
  ```
- `base`가 `main`이 아니거나 `head`가 `dev`가 아니면 종료한다.
- PR 제목에서 버전을 추출한다:
  - 패턴: `v?(\d+\.\d+\.\d+)`
  - 예: `"Release(v0.1.1)"` → `v0.1.1` / `0.1.1`

### Step 3 — main 브랜치 최신화

```bash
git checkout main
git pull origin main
```

### Step 4 — 태그 생성 및 push

```bash
git tag -a v{VERSION} -m "Release v{VERSION}"
git push origin v{VERSION}
```

이미 같은 태그가 존재하면 사용자에게 알리고 종료한다.

### Step 5 — GitHub Release 생성

```bash
gh release create v{VERSION} \
  --title "v{VERSION}" \
  --target main \
  --generate-notes
```

### Step 6 — 완료 보고

```
✅ v{VERSION} 릴리즈 완료

- 태그: v{VERSION} (main)
- GitHub Release: {release_url}
```

---

## Tools You Can Use

- **AskUserQuestion** — PR 링크 입력받기
- **Bash** — `gh pr view`, git tag, gh release create

---

## Important Notes

- PR이 머지된 후에만 실행한다 — 머지 전 실행 시 중단
- 태그와 Release는 `main` 브랜치 기준으로 생성한다
- 버전 파일(`package.json`, `README.md`) 업데이트는 이 스킬의 범위가 아니다 — PR 생성 전에 수동으로 완료되어야 한다
- **⛔ 절대 금지**: `main` 브랜치에 커밋하거나 push하지 않는다 (태그 push만 허용)