# Task: 로컬 개발 DB 설정

## Summary

로컬 개발 환경에서 PostgreSQL을 Docker로 실행할 수 있도록 docker-compose.yml을 작성한다. .env.example에 로컬 DATABASE_URL 항목을 추가해 팀원이 바로 사용할 수 있게 한다.

---

## Scope

### 1. docker-compose.yml 생성

**위치:** `docker-compose.yml` (프로젝트 루트)

**요구사항:**

- [ ] 이미지: `postgres:16`
- [ ] DB명: `partnerble`
- [ ] 포트: `5432:5432`
- [ ] 컨테이너명: `partnerble-db`
- [ ] 볼륨 마운트로 데이터 영속화

**구현 예시:**

```yaml
services:
  db:
    image: postgres:16
    container_name: partnerble-db
    environment:
      POSTGRES_DB: partnerble
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

---

### 2. .env.example 업데이트

**위치:** `.env.example`

**요구사항:**

- [ ] `DATABASE_URL` 로컬 예시값 추가: `postgresql://postgres:postgres@localhost:5432/partnerble`

---

## Acceptance Criteria

- [ ] `docker compose up -d` 실행 시 postgres:16 컨테이너가 정상 기동
- [ ] `.env.example`에 `DATABASE_URL` 항목 존재
- [ ] `pnpm lint` 통과

---

## Notes

- POSTGRES_PASSWORD는 로컬 전용이므로 단순한 값 사용 가능
- .env 파일은 .gitignore 처리되어 있으므로 실제 값은 .env에 따로 설정
