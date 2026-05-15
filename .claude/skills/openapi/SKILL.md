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

출력 경로를 구성한다:

```
OUTPUT_PATH="$PROJECT_DRIVE_PATH/$PROJECT_OPENAPI_DIR/openapi.json"
```

해당 디렉터리가 존재하는지 확인한다:

```bash
ls "$PROJECT_DRIVE_PATH/$PROJECT_OPENAPI_DIR/"
```

디렉터리가 없으면 사용자에게 알리고 종료한다.

---

### Step 2 — 앱 환경변수 로드

`scripts/generate-openapi.ts`는 NestJS AppModule을 부트스트랩하므로 앱 환경변수가 필요하다.
`.env.local` 파일을 소싱해 현재 쉘에 로드한다:

```bash
set -a && source .env.local && set +a
```

`.env.local`이 없으면 사용자에게 알린다:

```
.env.local 파일이 없습니다. 앱 환경변수가 없으면 generate:openapi가 실패할 수 있습니다.
```

---

### Step 3 — OpenAPI JSON 생성

`OUTPUT_PATH` 환경변수를 전달해 스크립트를 실행한다:

```bash
OUTPUT_PATH="$PROJECT_DRIVE_PATH/$PROJECT_OPENAPI_DIR/openapi.json" pnpm generate:openapi
```

`scripts/generate-openapi.ts`는 HTTP 서버 없이 NestJS 앱 메타데이터만 수집해 JSON을 생성한다.

실패하면 에러 메시지를 사용자에게 전달하고 종료한다.

---

### Step 4 — 완료 보고

생성된 파일을 확인하고 요약 보고한다:

```bash
ls -lh "$PROJECT_DRIVE_PATH/$PROJECT_OPENAPI_DIR/openapi.json"
```

`openapi.json`을 파싱해 간략히 출력한다:

```bash
python3 -c "
import json, sys
with open('$OUTPUT_PATH') as f:
    d = json.load(f)
print('title:', d['info']['title'])
print('version:', d['info']['version'])
print('endpoints:', len(d.get('paths', {})), 'paths')
"
```

```
✅ openapi.json 생성 완료
경로: [OUTPUT_PATH]
title: Partnerble API
version: 1.0
endpoints: N paths
```

---

## Implementation Notes

- **HTTP 서버 미사용**: `scripts/generate-openapi.ts`는 `NestFactory.create()` 후 `listen()` 없이 `SwaggerModule.createDocument()`만 호출하고 `app.close()`로 종료
- **실행 명령**: `pnpm generate:openapi` (`package.json`의 `ts-node --transpile-only -r tsconfig-paths/register scripts/generate-openapi.ts`)
- **환경변수 필요**: `AppModule`의 Joi 스키마 검증 때문에 앱 env vars가 있어야 부트스트랩 성공
- **출력 경로**: `$PROJECT_DRIVE_PATH/$PROJECT_OPENAPI_DIR/openapi.json` 고정

---

## Tools You Can Use

- **Bash** — 환경변수 확인, 스크립트 실행, 파일 확인
