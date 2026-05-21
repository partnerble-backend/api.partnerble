# Partnerble 인프라 관리 가이드

> 이 문서는 Terraform을 처음 접하는 관리자를 위한 가이드입니다.
> Terraform 코드를 직접 수정하지 않아도 됩니다.
> AI 에이전트(Claude Code)에게 작업을 위임하고 결과를 감독하는 방법을 설명합니다.

---

## 목차

0. [처음 시작하기 — 필수 준비사항](#0-처음-시작하기--필수-준비사항)
1. [Terraform이란 무엇인가](#1-terraform이란-무엇인가)
2. [이 프로젝트의 인프라 구조](#2-이-프로젝트의-인프라-구조)
3. [폴더 및 파일 읽는 법](#3-폴더-및-파일-읽는-법)
4. [인프라 생애주기 — plan / apply / destroy](#4-인프라-생애주기--plan--apply--destroy)
5. [에이전트에게 작업 위임하는 법](#5-에이전트에게-작업-위임하는-법)
6. [관리자가 직접 할 수 있는 감독 명령어](#6-관리자가-직접-할-수-있는-감독-명령어)
7. [절대 하면 안 되는 것](#7-절대-하면-안-되는-것)
8. [인프라 전체 종료 방법](#8-인프라-전체-종료-방법)

---

## 0. 처음 시작하기 — 필수 준비사항

Terraform 명령어를 처음 실행하기 전에 아래 3가지를 반드시 완료해야 합니다.

### 도구 설치

```bash
# Terraform 설치 확인
terraform version   # v1.0 이상이어야 함

# AWS CLI 설치 확인
aws --version

# AWS 자격증명 확인
aws sts get-caller-identity
# Account: REPLACE_WITH_AWS_ACCOUNT_ID 이 출력되면 정상
```

> 설치되어 있지 않다면 루트 [README.md](../README.md)의 인프라 관리 섹션을 참고하세요.

### terraform.tfvars 파일 생성

`.tfvars` 파일은 보안상 git에 포함되지 않습니다. **처음 작업 시 반드시 직접 생성**해야 합니다.

```bash
cd terraform/environments/prod
cp terraform.tfvars.example terraform.tfvars
```

`terraform.tfvars`를 열어 값을 채웁니다:

```hcl
aws_account_id = "REPLACE_WITH_AWS_ACCOUNT_ID"        # 변경 금지
operator_email = "neo.lee@partnerble.com"
ses_from_email = "no-reply@partnerble.com"
# 나머지 값은 기본값 유지
```

> `db_password`, `admin_api_key`는 이 파일에 적지 않습니다. apply 시 환경변수로 주입합니다.

### Terraform 초기화

```bash
cd terraform   # 반드시 terraform/ 디렉터리에서 실행
terraform init
```

`Terraform has been successfully initialized!` 메시지가 나오면 준비 완료입니다.

---

## 1. Terraform이란 무엇인가

### 한 줄 정의

> **"AWS 콘솔에서 클릭으로 만들던 것을 코드로 기록해두는 도구"**

### 왜 쓰는가

| 콘솔(클릭) 방식 | Terraform(코드) 방식 |
|---|---|
| 누가 언제 무엇을 만들었는지 기록이 없음 | git 히스토리로 모든 변경 이력 추적 가능 |
| 같은 환경을 다시 만들려면 처음부터 반복 | 명령어 하나로 동일한 환경 재현 |
| 실수로 삭제하면 복구 불가 | 코드가 남아 있으므로 재생성 가능 |
| 팀원이 인프라 현황을 알기 어려움 | 코드만 읽으면 현재 인프라 파악 가능 |

### 핵심 개념 3가지

```
코드(HCL 파일) → plan(미리보기) → apply(실제 생성)
```

- **HCL**: Terraform이 사용하는 설정 언어. `*.tf` 파일이 전부 이것
- **plan**: "이런 변경을 할 예정입니다" 미리보기. AWS에 아무것도 건드리지 않음
- **apply**: plan을 실제로 AWS에 반영. 리소스가 생성·수정·삭제됨
- **state**: 현재 인프라 현황을 기록한 파일 (`terraform.tfstate`). Terraform의 두뇌

---

## 2. 이 프로젝트의 인프라 구조

```
GitHub (main 브랜치 push) ← dev 브랜치 push는 배포에 영향 없음
    ↓
AWS CodePipeline (Source → Build)
    ↓
AWS CodeBuild (Docker linux/amd64 빌드 · ECR push · EB 배포)
    ↓
AWS ECR (컨테이너 이미지 저장소, commit SHA 7자리 태그)
    ↓
AWS Elastic Beanstalk (NestJS API 실행 환경)
    ├── IAM 역할 (AWS 서비스 접근 권한)
    ├── AWS RDS PostgreSQL (데이터베이스)
    └── AWS S3 (첨부파일 저장)

이메일 발송: AWS SES (별도 설정 필요 — Terraform 외 수동)
```

### Terraform이 관리하는 AWS 리소스

| 모듈 | 생성되는 AWS 리소스 | 역할 |
|---|---|---|
| `iam` | IAM 역할, 인스턴스 프로파일, 정책 | EC2가 S3·SES에 접근할 수 있는 권한 부여 |
| `s3` | S3 버킷, 버킷 정책, CORS | 파일 업로드 |
| `ecr` | ECR 리포지토리, 수명주기 정책 | Docker 이미지 저장소 |
| `rds` | RDS 인스턴스, 보안 그룹, 서브넷 그룹 | PostgreSQL 데이터베이스 |
| `eb` | EB 애플리케이션, 환경, 보안 그룹 | NestJS API 실행 |
| `pipeline` | CodePipeline, CodeBuild, IAM, S3 아티팩트 버킷, CodeStar Connection | main 브랜치 push 시 자동 빌드·배포 |

---

## 3. 폴더 및 파일 읽는 법

```
terraform/
├── README.md                        ← 지금 읽고 있는 파일
├── providers.tf                     ← AWS 연결 설정 (리전, 공통 태그)
├── variables.tf                     ← 입력값 정의 (어떤 값이 필요한지)
├── main.tf                          ← 핵심 — 모든 모듈을 조립하는 파일
├── outputs.tf                       ← apply 후 출력되는 주요 정보
├── environments/
│   └── prod/
│       └── terraform.tfvars         ← 실제 운영 환경 변수값 (여기를 수정)
└── modules/
    ├── iam/                         ← IAM 권한 설정
    ├── s3/                          ← S3 버킷 설정
    ├── ecr/                         ← ECR 설정
    ├── rds/                         ← RDS 데이터베이스 설정
    ├── eb/                          ← Elastic Beanstalk 설정
    └── pipeline/                    ← CodePipeline CI/CD 설정
```

### 관리자가 실제로 봐야 하는 파일

#### `environments/prod/terraform.tfvars` — 운영 환경 변수값
```hcl
aws_region     = "ap-northeast-2"    # AWS 리전 (변경 거의 없음)
project        = "partnerble"        # 프로젝트명 (변경 금지)
environment    = "prod"              # 환경명 (변경 금지)
aws_account_id = "REPLACE_WITH_AWS_ACCOUNT_ID"      # AWS 계정 ID (변경 금지)

operator_email = "ops@partnerble.com"       # 운영자 알림 수신 이메일 ← 변경 가능
ses_from_email = "no-reply@partnerble.com"  # 발신자 이메일 ← 변경 가능
```

> 민감한 값(DB 비밀번호, API 키)은 이 파일에 기재하지 않습니다.
> 에이전트에게 apply를 요청할 때 환경변수로 주입합니다.

#### `main.tf` — 인프라 전체 조립도
각 모듈이 어떻게 연결되는지 한눈에 파악할 수 있습니다.
코드를 몰라도 모듈 이름과 전달하는 값만 보면 구조를 이해할 수 있습니다.

#### `modules/*/main.tf` — 실제 리소스 정의
세부 설정이 궁금할 때 참고합니다. 직접 수정하지 말고 에이전트에게 요청합니다.

---

## 4. 인프라 생애주기 — plan / apply / destroy

### 처음 인프라를 만들 때

```
1. terraform init   → Terraform 초기화 (AWS provider 다운로드)
2. terraform plan   → 무엇이 만들어질지 미리보기
3. terraform apply  → 실제로 AWS에 리소스 생성
```

### 인프라를 수정할 때 (예: 이메일 주소 변경)

```
1. terraform.tfvars 수정
2. terraform plan   → 변경사항 미리보기 (기존 리소스에 영향 확인)
3. terraform apply  → 변경사항 반영
```

### plan 결과 읽는 법

```
+ create   ← 새로 만들어질 리소스 (녹색)
~ update   ← 변경될 리소스 (노란색) — 기존 데이터 보존
- destroy  ← 삭제될 리소스 (빨간색) ⚠️ 데이터 손실 위험
```

> `-` (destroy)가 포함된 plan은 에이전트에게 이유를 먼저 확인하고 apply합니다.

---

## 5. 에이전트에게 작업 위임하는 법

### 위임 전 준비사항 체크리스트

- [ ] AWS CLI 자격증명이 설정되어 있는가 (`aws sts get-caller-identity`)
- [ ] 변경하려는 내용이 명확한가 (무엇을, 왜)
- [ ] plan 결과를 확인할 시간이 있는가 (apply 전 반드시 검토)

---

### 위임 프롬프트 템플릿

#### 신규 리소스 추가

```
terraform/modules/ 하위에 [리소스명] 모듈을 추가해줘.
설정 조건:
- [조건 1]
- [조건 2]

추가 후 terraform plan 결과를 보여줘. apply는 내가 확인 후 별도로 요청할게.
```

#### 기존 설정 변경

```
[어떤 리소스]의 [어떤 값]을 [기존값]에서 [변경값]으로 바꿔줘.
변경 이유: [이유]

terraform plan 결과에서 destroy가 발생하는지 확인하고 알려줘.
```

#### 현황 파악

```
현재 terraform/ 폴더의 구성을 보고,
[특정 리소스]가 어떤 설정으로 되어 있는지 요약해줘.
코드는 수정하지 말고 설명만 해줘.
```

#### apply 요청

```
직전에 확인한 plan을 apply해줘.
DB 비밀번호: [값] (또는 "환경변수로 주입할게")
Admin API 키: [값]
```

---

### 실제 위임 예시

**예시 1 — RDS 인스턴스 타입 업그레이드**
```
현재 RDS가 db.t3.micro인데 db.t3.small로 업그레이드해야 해.
modules/rds/main.tf에서 instance_class를 변경하고
terraform plan 결과를 보여줘. destroy 없이 update만으로 가능한지 확인해줘.
```

**예시 2 — 운영자 이메일 변경**
```
운영자 알림 수신 이메일을 ops@partnerble.com에서 team@partnerble.com으로 변경해야 해.
environments/prod/terraform.tfvars를 수정하고 plan 결과 보여줘.
```

**예시 3 — 새 환경변수 추가**
```
EB 환경에 FEATURE_FLAG=true 환경변수를 추가해야 해.
modules/eb/main.tf에서 setting 블록을 추가하고 plan 결과 확인해줘.
```

---

### plan 결과 에이전트에게 검토 요청하는 법

```
위 plan 결과에서:
1. destroy되는 리소스가 있는가?
2. 있다면 데이터 손실 위험이 있는가?
3. apply해도 안전한가?

판단 후 apply 여부를 추천해줘.
```

---

## 6. 관리자가 직접 할 수 있는 감독 명령어

> 아래 명령어는 읽기 전용입니다. 실행해도 AWS에 아무 변경이 없습니다.

```bash
# 현재 관리 중인 인프라 목록 확인
terraform state list

# 특정 리소스의 현재 상태 상세 확인
terraform state show module.rds.aws_db_instance.main
terraform state show module.eb.aws_elastic_beanstalk_environment.prod

# 변경 예정 내용 미리보기 (apply 없이)
terraform plan -var-file="environments/prod/terraform.tfvars" \
  -var="db_password=$TF_VAR_db_password" \
  -var="admin_api_key=$TF_VAR_admin_api_key"

# apply 이후 주요 정보 확인 (ECR URL, RDS 엔드포인트 등)
terraform output

# 현재 AWS 자격증명 확인
aws sts get-caller-identity
```

### apply 후 인프라 정상 확인

```bash
# EB 환경 상태 확인
aws elasticbeanstalk describe-environments \
  --environment-names partnerble-prod-backend-prod \
  --query "Environments[0].{Status:Status,Health:Health}"

# RDS 인스턴스 상태 확인
aws rds describe-db-instances \
  --db-instance-identifier partnerble-prod-db \
  --query "DBInstances[0].{Status:DBInstanceStatus,Endpoint:Endpoint.Address}"

# ECR 리포지토리 확인
aws ecr describe-repositories \
  --query "repositories[?repositoryName=='partnerble-prod-api']"

# CodePipeline 실행 상태 확인
aws codepipeline get-pipeline-state --name partnerble-prod-pipeline \
  --query "stageStates[*].{Stage:stageName,Status:latestExecution.status}"

# CodeStar Connection 상태 확인 (AVAILABLE이어야 파이프라인 실행 가능)
aws codestar-connections list-connections \
  --query "Connections[?ConnectionName=='partnerble-prod-github'].{Name:ConnectionName,Status:ConnectionStatus}"
```

> ⚠️ **CodeStar Connection:** `terraform apply` 직후 `PENDING` 상태로 생성됩니다.
> AWS 콘솔 → Developer Tools → Connections에서 OAuth 승인을 완료해야 파이프라인이 실행됩니다.

---

## 7. 절대 하면 안 되는 것

### `terraform.tfstate` 파일 직접 편집 금지

state 파일은 Terraform이 현재 인프라와 코드를 동기화하는 데이터베이스입니다.
직접 편집하면 실제 AWS 리소스와 불일치가 발생해 이후 모든 apply가 실패할 수 있습니다.

### `terraform destroy` 단독 실행 금지

```bash
# ❌ 절대 금지 — 모든 인프라(RDS 포함)가 삭제됨
terraform destroy
```

인프라를 종료할 때는 반드시 아래 [8. 인프라 전체 종료 방법](#8-인프라-전체-종료-방법)을 따릅니다.

### plan 없이 apply 금지

```bash
# ❌ 절대 금지
terraform apply -auto-approve
```

항상 plan → 검토 → apply 순서를 지킵니다.

### 민감한 값을 tfvars 파일에 기재 금지

```hcl
# ❌ 절대 금지 — git에 커밋되면 비밀번호가 노출됨
db_password   = "실제비밀번호"
admin_api_key = "실제키값"
```

민감한 값은 환경변수로만 주입합니다:
```bash
TF_VAR_db_password="실제비밀번호" \
TF_VAR_admin_api_key="실제키값" \
terraform apply -var-file="environments/prod/terraform.tfvars"
```

---

## 8. 인프라 전체 종료 방법

> ⚠️ 이 작업은 데이터베이스를 포함한 **모든 인프라를 삭제**합니다.
> 반드시 데이터 백업 후 진행하세요.

### 종료 전 체크리스트

- [ ] RDS 스냅샷 수동 생성 완료
- [ ] S3 데이터 다운로드 또는 백업 완료
- [ ] 팀 전체 공지 완료
- [ ] 에이전트에게 plan 결과 검토 요청 완료

### 에이전트에게 위임하는 방법 (권장)

```
인프라를 전부 종료해야 해.
순서:
1. terraform plan -destroy 로 삭제될 리소스 목록 먼저 보여줘
2. 목록을 확인하고 내가 OK하면 그때 destroy 진행해줘
3. RDS deletion_protection이 걸려 있으면 먼저 해제하는 절차도 안내해줘
```

### 직접 진행하는 경우

```bash
# 1단계: 삭제 예정 목록 확인 (실제 삭제 없음)
terraform plan -destroy \
  -var-file="environments/prod/terraform.tfvars" \
  -var="db_password=$TF_VAR_db_password" \
  -var="admin_api_key=$TF_VAR_admin_api_key"

# 2단계: RDS deletion_protection 해제 (에이전트에게 요청)
# modules/rds/main.tf에서 deletion_protection = false 로 변경 후 apply

# 3단계: 실제 삭제
terraform destroy \
  -var-file="environments/prod/terraform.tfvars" \
  -var="db_password=$TF_VAR_db_password" \
  -var="admin_api_key=$TF_VAR_admin_api_key"
```

### 부분 종료 (특정 리소스만)

서비스 전체가 아닌 특정 리소스만 삭제할 때는 에이전트에게 요청합니다:

```
EB 환경만 종료하고 RDS와 S3는 유지해야 해.
module.eb만 destroy할 수 있도록 명령어와 주의사항 알려줘.
```

---

## 부록 — 자주 쓰는 에이전트 위임 문구 모음

```
# 현황 파악
"terraform/README.md와 main.tf를 읽고 현재 인프라 구성을 한국어로 요약해줘."

# 비용 확인
"현재 Terraform으로 관리 중인 리소스의 예상 월 비용을 DEPLOYMENT.md 기준으로 계산해줘."

# 변경 검토
"[파일명]을 수정했어. terraform plan 결과를 보고 안전한지 검토해줘."

# 장애 대응
"RDS 연결이 안 돼. 보안 그룹 설정이 올바른지 terraform state로 확인해줘."

# 롤백
"직전 apply가 문제를 일으켰어. 변경사항을 되돌리는 방법 알려줘."
```