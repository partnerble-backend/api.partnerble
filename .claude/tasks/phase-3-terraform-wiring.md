# Task: Terraform 연결 — pipeline 모듈 통합 및 변수 추가

## Summary

phase-2에서 생성한 pipeline 모듈을 `terraform/main.tf`에 연결하고, 필요한 변수를 `variables.tf`와 `tfvars.example`에 추가한다.
또한 ECR 태그 불변성이 `IMMUTABLE`로 설정되어 있는지 확인한다 (이미 설정된 경우 no-op).

---

## Scope

### 1. ECR 태그 불변성 확인

**위치:** `terraform/modules/ecr/main.tf`

**요구사항:**

- [ ] `image_tag_mutability = "IMMUTABLE"` 값이 맞는지 확인
- [ ] 현재 코드에 이미 `IMMUTABLE`로 설정되어 있으므로 코드 변경 불필요
- [ ] 실제 AWS 리소스 상태는 `terraform plan` 결과로 관리자가 확인

---

### 2. terraform/variables.tf — 신규 변수 추가

**위치:** `terraform/variables.tf`

**요구사항:**

- [ ] `github_owner` — GitHub 조직/사용자명
- [ ] `github_repo` — 리포지토리명
- [ ] `github_branch` — 트리거 브랜치 (기본값: `"dev"`)

**추가 위치:** 파일 하단 `# ── CI/CD ────` 섹션으로 구분

---

### 3. terraform/main.tf — pipeline 모듈 연결

**위치:** `terraform/main.tf`

**요구사항:**

- [ ] `module "pipeline"` 블록 추가 (기존 모듈 블록 아래)
- [ ] 전달할 변수:
  - `name_prefix = local.name_prefix`
  - `aws_region = var.aws_region`
  - `aws_account_id = var.aws_account_id`
  - `ecr_repo_name = module.ecr.repository_name` (ecr outputs 확인 필요)
  - `eb_app_name` — EB 애플리케이션명 (eb 모듈 output 또는 직접 값)
  - `eb_env_name` — EB 환경명 (eb 모듈 output 또는 직접 값)
  - `github_owner = var.github_owner`
  - `github_repo = var.github_repo`
  - `github_branch = var.github_branch`

> **주의:** `module.ecr.repository_name` output이 존재하지 않으면 `terraform/modules/ecr/outputs.tf`에 추가한다.
> EB 모듈 output에서 app_name/env_name을 가져올 수 없으면 `local`로 정의하거나 변수로 추가한다.

---

### 4. terraform/environments/prod/terraform.tfvars.example 업데이트

**위치:** `terraform/environments/prod/terraform.tfvars.example`

**요구사항:**

- [ ] `github_owner`, `github_repo`, `github_branch` 변수 예시 추가
- [ ] 민감하지 않은 값이므로 example 파일에 placeholder 기재 가능

**예시:**

```hcl
# ── CI/CD ─────────────────────────────────────────────────────────────────────
github_owner  = "REPLACE_WITH_GITHUB_ORG_OR_USER"   # 예: partnerble-backend
github_repo   = "REPLACE_WITH_REPO_NAME"             # 예: api.partnerble
github_branch = "dev"
```

---

## Acceptance Criteria

- [ ] `terraform/variables.tf`에 `github_owner`, `github_repo`, `github_branch` 변수 추가
- [ ] `terraform/main.tf`에 `module "pipeline"` 블록 존재
- [ ] `terraform/environments/prod/terraform.tfvars.example`에 CI/CD 변수 예시 추가
- [ ] ECR `image_tag_mutability = "IMMUTABLE"` 확인 (변경 없으면 pass)
- [ ] `ecr` 모듈에 `repository_name` output 존재 (없으면 추가)

---

## Notes

- 이 task는 phase-2(pipeline 모듈 생성) 완료 후 진행
- `terraform apply` 는 에이전트가 실행하지 않음 — 관리자가 직접 실행
- `terraform plan` 결과에서 기존 리소스 destroy가 없는지 확인은 관리자 책임
- EB 모듈 outputs를 확인해 app_name, env_name이 출력되는지 먼저 확인할 것 (`terraform/modules/eb/outputs.tf`)
