# Task: 지원서 제출 API

## Summary

파트너가 공고에 지원서를 제출하는 `POST /applications` 엔드포인트를 구현한다. multipart/form-data로 파일을 수신해 S3에 업로드하고 DB에 저장한다. 알림 서비스는 비동기로 호출하며 실패해도 201을 반환한다.

---

## Scope

### 1. CreateApplicationDto

**위치:** `src/application/dto/create-application.dto.ts`

**요구사항:**

- [ ] `recruitId`: `@IsString() @IsNotEmpty()`
- [ ] `name`: `@IsString() @IsNotEmpty() @MaxLength(50)`
- [ ] `contact`: `@IsString() @IsNotEmpty() @MaxLength(100)`
- [ ] `introduction`: `@IsString() @IsNotEmpty() @MaxLength(400)`
- [ ] `privacyAgreed`: `@IsBoolean()` — `true`가 아니면 400 반환

**명세서 원문의 `recruitTitle`, `recruitCompany` 처리:**
BF-25에서 `Application` 모델에서 해당 필드가 제거됐으므로 DTO에도 포함하지 않는다. Validator 검토 필요.

**`accountId` 처리:**
BF-25 스키마에서 `Application`은 `accountId` (파트너 Account FK)를 필수로 가진다. 현재 인증 시스템이 없으므로 임시로 request body에서 받거나, 고정값/nullable 처리 방식을 Questioner를 통해 확인한다.

---

### 2. ApplicationResponseDto

**위치:** `src/application/dto/application-response.dto.ts`

**요구사항:**

- [ ] `id`: string
- [ ] `recruitId`: string
- [ ] `status`: ApplicationStatus
- [ ] `createdAt`: Date

---

### 3. ApplicationService

**위치:** `src/application/application.service.ts`

**요구사항:**

- [ ] `create(dto, file?)` 메서드
  - `recruitId` 존재 여부 확인 → 없으면 `NotFoundException`
  - 파일이 있으면 `S3Service.upload()` 호출 → `attachmentUrl`, `attachmentKey`, `attachmentName` 저장
  - `privacyAgreed`가 `false`이면 `BadRequestException`
  - `privacyAgreedAt` = `new Date()`로 저장
  - `PrismaService`로 `Application` 생성
  - `NotificationService.notify()` 비동기 호출 (`void` — 실패 무시, 로깅만)
- [ ] `PrismaService`, `S3Service` 주입

---

### 4. ApplicationController

**위치:** `src/application/application.controller.ts`

**API Spec:**

| Method | Path | Request | Response | Status |
|---|---|---|---|---|
| POST | /applications | multipart/form-data | ApplicationResponseDto | 201 |

**요구사항:**

- [ ] `@Post()`, `@HttpCode(201)`
- [ ] `@UseInterceptors(FileInterceptor('attachment'))` — multer 파일 수신
- [ ] `@UploadedFile()` + 파일 유효성 검사 파이프 (MIME 타입, 크기 제한)
- [ ] `@Body()` — `CreateApplicationDto`
- [ ] 응답: `ApplicationResponseDto`

---

### 5. NotificationService (스텁)

**위치:** `src/common/notification/notification.service.ts`

**요구사항:**

- [ ] `notify(applicationId: string): Promise<void>` 메서드만 선언 (실제 SendGrid 연동은 별도 Feature)
- [ ] 현재는 로그 출력만

---

### 6. ApplicationModule

**위치:** `src/application/application.module.ts`

**요구사항:**

- [ ] `ApplicationController`, `ApplicationService` 등록
- [ ] `S3Module`, `PrismaModule` import
- [ ] `AppModule`에 `ApplicationModule` 추가

---

## Acceptance Criteria

- [ ] `POST /applications` — 파일 없이 정상 지원 시 201 반환
- [ ] `POST /applications` — 존재하지 않는 recruitId 시 404 반환
- [ ] `POST /applications` — `privacyAgreed: false` 시 400 반환
- [ ] `POST /applications` — 10MB 초과 파일 시 400 반환
- [ ] `pnpm lint` 통과

---

## Notes

- `FileInterceptor`는 `@nestjs/platform-express` 포함 multer 사용
- 파일 유효성은 `ParseFilePipe` + `MaxFileSizeValidator` + `FileTypeValidator`로 처리
- `accountId` 처리 방식은 Questioner 단계에서 확인 필요 (인증 미구현 상태)
- `recruitTitle`, `recruitCompany`는 BF-25 결정에 따라 DTO 및 DB 저장에서 제외
