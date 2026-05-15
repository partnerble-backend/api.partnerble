# Task: S3 업로드 서비스

## Summary

파일 첨부 기능을 위한 공통 S3 업로드 서비스를 구현한다. `src/common/s3/` 하위에 분리해 이후 다른 도메인에서도 재사용할 수 있도록 한다.

---

## Scope

### 1. S3Service

**위치:** `src/common/s3/s3.service.ts`

**요구사항:**

- [ ] `@aws-sdk/client-s3` 패키지 설치 (`pnpm add @aws-sdk/client-s3`)
- [ ] `ConfigService`를 통해 `AWS_REGION`, `AWS_S3_BUCKET`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` 주입
- [ ] `upload(file: Express.Multer.File): Promise<{ url: string; key: string }>` 메서드 구현
  - S3 키: `applications/{cuid()}.{확장자}` 형태
  - 업로드 실패 시 예외 전파 (로깅 포함)
- [ ] `delete(key: string): Promise<void>` 메서드 구현 (롤백 대비)

**구현 예시:**

```ts
@Injectable()
export class S3Service {
  private readonly client: S3Client;
  private readonly bucket: string;

  constructor(private readonly config: ConfigService) {
    this.client = new S3Client({
      region: config.get<string>('AWS_REGION'),
      credentials: {
        accessKeyId: config.get<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: config.get<string>('AWS_SECRET_ACCESS_KEY'),
      },
    });
    this.bucket = config.get<string>('AWS_S3_BUCKET');
  }

  async upload(file: Express.Multer.File): Promise<{ url: string; key: string }> {
    // PutObjectCommand로 업로드, 공개 URL 반환
  }
}
```

---

### 2. S3Module

**위치:** `src/common/s3/s3.module.ts`

**요구사항:**

- [ ] `S3Service` export
- [ ] `ConfigModule` import (이미 global이므로 import 생략 가능)

---

### 3. 파일 유효성 상수

**위치:** `src/common/s3/s3.constants.ts`

**요구사항:**

- [ ] `ALLOWED_MIME_TYPES: string[]` — `['application/pdf', 'image/jpeg', 'image/png']`
- [ ] `MAX_FILE_SIZE_BYTES: number` — `10 * 1024 * 1024` (10MB)

---

## Acceptance Criteria

- [ ] `S3Service.upload()` 구현 완료 (실제 S3 연동은 통합 테스트에서 확인)
- [ ] `S3Module`이 export되어 다른 모듈에서 import 가능
- [ ] 상수 파일에 MIME 타입 및 파일 크기 제한 정의
- [ ] `pnpm lint` 통과

---

## Notes

- `@nestjs/platform-express`에 포함된 `multer` 타입은 `@types/multer` 별도 설치 필요 여부 확인
- `ConfigModule`은 `app.module.ts`에서 `isGlobal: true`로 등록되어 있어 각 모듈에서 별도 import 불필요
- S3 URL 형태: `https://{bucket}.s3.{region}.amazonaws.com/{key}`
