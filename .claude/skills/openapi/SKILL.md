---
name: openapi
description: Generate openapi.json from Swagger metadata (no server startup) and save to Google Drive. Path configured via PROJECT_OPENAPI_DIR in settings.local.json. Run with /openapi.
---

You are the OpenAPI spec generator for Partnerble backend.

When the user runs `/openapi`, generate `openapi.json` using the NestJS Swagger metadata (without starting an HTTP server) and save it to the configured Google Drive directory.

---

## Workflow

### Step 1 — 환경변수 확인

```bash
echo $PROJECT_DRIVE_PATH
echo $PROJECT_OPENAPI_DIR
```

- `PROJECT_DRIVE_PATH` 또는 `PROJECT_OPENAPI_DIR`가 없으면 사용자에게 안내하고 종료한다:

```
PROJECT_OPENAPI_DIR가 설정되지 않았습니다.
/setting 을 실행해 PROJECT_OPENAPI_DIR를 설정해 주세요.
```

해당 디렉터리가 존재하는지 확인한다:

```bash
ls "$PROJECT_DRIVE_PATH/$PROJECT_OPENAPI_DIR/"
```

디렉터리가 없으면 사용자에게 알리고 종료한다.

---

### Step 2 — OpenAPI JSON 생성

`pnpm generate:openapi`를 실행한다. 스크립트는 `docs/openapi.json`에 파일을 생성한다:

```bash
pnpm generate:openapi
```

`scripts/generate-openapi.ts`는 HTTP 서버 없이 NestJS 앱 메타데이터만 수집해 JSON을 생성한다.

실패하면 에러 메시지를 사용자에게 전달하고 종료한다.

---

### Step 3 — Google Drive로 복사

생성된 `docs/openapi.json`을 Google Drive 경로로 복사한다:

```bash
cp "docs/openapi.json" "$PROJECT_DRIVE_PATH/$PROJECT_OPENAPI_DIR/openapi.json"
```

---

### Step 4 — 완료 보고

```bash
ls -lh "$PROJECT_DRIVE_PATH/$PROJECT_OPENAPI_DIR/openapi.json"
```

`openapi.json`을 파싱해 간략히 출력한다:

```bash
python3 -c "
import json
with open('docs/openapi.json') as f:
    d = json.load(f)
print('title:', d['info']['title'])
print('version:', d['info']['version'])
print('endpoints:', len(d.get('paths', {})), 'paths')
"
```

```
✅ openapi.json 생성 완료
경로: $PROJECT_DRIVE_PATH/$PROJECT_OPENAPI_DIR/openapi.json
title: Partnerble API
version: 1.0
endpoints: N paths
```

---

## Implementation Notes

- **HTTP 서버 미사용**: `scripts/generate-openapi.ts`는 `AppFactory.create()` 후 `listen()` 없이 `SwaggerModule.createDocument()`만 호출하고 `app.close()`로 종료
- **출력 위치**: `docs/openapi.json` (프로젝트 루트 기준) → 이후 Claude Code env vars로 Google Drive로 복사
- **실행 명령**: `pnpm generate:openapi` (`package.json`의 `ts-node scripts/generate-openapi.ts`)
- **앱 env vars**: `.env` 파일에 더미값이라도 채워져 있어야 Joi 검증 통과

---

## Tools You Can Use

- **Bash** — 환경변수 확인, 스크립트 실행, 파일 복사
