# Terraform 인프라 구축 — 다음 단계

## 완료된 작업 (Phase 1~7)

모든 Terraform 모듈 작성 및 Remote State 설정까지 완료.

| 완료 항목 | 내용 |
|---|---|
| 모듈 구성 | IAM, S3, ECR, RDS, EB 모듈 작성 완료 |
| terraform plan | 17개 리소스 추가 예정, 오류 없음 확인 |
| Remote State | `partnerble-tf-state` S3 버킷 + `partnerble-tf-lock` DynamoDB 연결 완료 |

---

## 다음 세션에서 할 작업

### 1. terraform apply — 실제 인프라 생성

```bash
cd terraform

# terraform.tfvars 파일이 없으면 먼저 생성
cp environments/prod/terraform.tfvars.example environments/prod/terraform.tfvars
# → aws_account_id, operator_email, ses_from_email, db_password, admin_api_key 값 채우기

terraform plan -var-file="environments/prod/terraform.tfvars"   # 17개 리소스 확인
terraform apply -var-file="environments/prod/terraform.tfvars"  # 실제 생성
```

### 2. SES 도메인 인증 (partnerble.com)

AWS 콘솔 → SES → Verified identities → `partnerble.com` 도메인 인증
- DNS에 CNAME 레코드 3개 추가 (DKIM)
- 완료 후 `no-reply@partnerble.com` 발신 가능

### 3. SES 샌드박스 해제

AWS 콘솔 → SES → Account dashboard → Request production access
- Mail type: Transactional
- 승인까지 1~2 영업일 소요

### 4. Dockerfile + Dockerrun.aws.json 추가

DEPLOYMENT.md §6, §7 참고하여 프로젝트 루트에 파일 추가.

### 5. 최초 ECR 이미지 push

```bash
aws ecr get-login-password --region ap-northeast-2 | \
  docker login --username AWS --password-stdin \
  430287291108.dkr.ecr.ap-northeast-2.amazonaws.com

docker build -t partnerble-api .
docker tag partnerble-api:latest \
  430287291108.dkr.ecr.ap-northeast-2.amazonaws.com/partnerble-prod-api:latest
docker push 430287291108.dkr.ecr.ap-northeast-2.amazonaws.com/partnerble-prod-api:latest
```

### 6. RDS 마이그레이션

```bash
DATABASE_URL="postgresql://partnerble:{password}@{rds-endpoint}:5432/partnerble" \
  pnpm prisma migrate deploy
```

### 7. EB 배포

```bash
eb deploy partnerble-prod-backend-prod
```

---

## 환경 정보

- **AWS 계정 ID:** `430287291108`
- **리전:** `ap-northeast-2`
- **State 버킷:** `partnerble-tf-state` (S3, 버저닝 활성화)
- **Lock 테이블:** `partnerble-tf-lock` (DynamoDB)
- **작업 디렉터리:** `terraform/`
- **변수 파일:** `environments/prod/terraform.tfvars`

## 참고 문서

- `terraform/README.md` — 인프라 관리 가이드
- Google Drive: `dev/partnerble-backend/DEPLOYMENT.md` — 전체 배포 가이드
