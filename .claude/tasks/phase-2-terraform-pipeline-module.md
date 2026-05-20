# Task: Terraform pipeline 모듈 생성

## Summary

`terraform/modules/pipeline/` 디렉터리를 신규 생성하고 CodePipeline, CodeBuild, IAM, S3 아티팩트 버킷 리소스를 정의한다.
이 모듈은 phase-3에서 `terraform/main.tf`에 연결된다.

---

## Scope

### 1. terraform/modules/pipeline/variables.tf

**위치:** `terraform/modules/pipeline/variables.tf`

**요구사항:**

- [ ] `name_prefix` — 리소스 이름 prefix (예: `partnerble-prod`)
- [ ] `aws_region`
- [ ] `aws_account_id`
- [ ] `ecr_repo_name` — ECR 리포지토리명
- [ ] `eb_app_name` — EB 애플리케이션명
- [ ] `eb_env_name` — EB 환경명
- [ ] `github_owner` — GitHub 조직/사용자명
- [ ] `github_repo` — 리포지토리명
- [ ] `github_branch` — 트리거 브랜치 (기본값: `dev`)

---

### 2. terraform/modules/pipeline/main.tf

**위치:** `terraform/modules/pipeline/main.tf`

**포함할 리소스:**

- [ ] `aws_s3_bucket` — 파이프라인 아티팩트 저장용 버킷 (`${name_prefix}-pipeline-artifacts`)
- [ ] `aws_s3_bucket_versioning` — 버킷 버저닝 활성화
- [ ] `aws_codestarconnections_connection` — GitHub 연결 (provider: `GitHub`, 이름: `${name_prefix}-github`)
- [ ] `aws_iam_role` (CodePipeline용) — AssumeRole: `codepipeline.amazonaws.com`
- [ ] `aws_iam_role_policy` (CodePipeline용) — S3 아티팩트, CodeBuild 실행, CodeStar Connection 사용 권한
- [ ] `aws_iam_role` (CodeBuild용) — AssumeRole: `codebuild.amazonaws.com`
- [ ] `aws_iam_role_policy` (CodeBuild용) — ECR push, EB 배포, S3 읽기/쓰기, CloudWatch Logs 권한
- [ ] `aws_codebuild_project` — linux/amd64 Docker 빌드
  - `environment.privileged_mode = true` 필수
  - `environment.image = "aws/codebuild/standard:7.0"`
  - `environment.compute_type = "BUILD_GENERAL1_SMALL"`
  - buildspec: `buildspec.yml` (레포 루트 참조)
  - 환경변수 주입: `AWS_DEFAULT_REGION`, `ECR_REPO_URI`, `EB_APP_NAME`, `EB_ENV_NAME`, `S3_BUCKET`
- [ ] `aws_codepipeline` — 3단계 파이프라인
  - **Source:** CodeStar Connection → GitHub (`github_owner/github_repo`, 브랜치: `github_branch`)
  - **Build:** CodeBuild 프로젝트 실행
  - **Deploy:** 없음 (EB 배포는 buildspec post_build에서 직접 수행)

**CodeBuild IAM policy 권한 목록:**

```json
{
  "ecr:GetAuthorizationToken",
  "ecr:BatchCheckLayerAvailability",
  "ecr:InitiateLayerUpload",
  "ecr:UploadLayerPart",
  "ecr:CompleteLayerUpload",
  "ecr:PutImage",
  "elasticbeanstalk:CreateApplicationVersion",
  "elasticbeanstalk:UpdateEnvironment",
  "elasticbeanstalk:DescribeEnvironments",
  "s3:GetObject", "s3:PutObject", "s3:GetObjectVersion",
  "logs:CreateLogGroup", "logs:CreateLogStream", "logs:PutLogEvents"
}
```

---

### 3. terraform/modules/pipeline/outputs.tf

**위치:** `terraform/modules/pipeline/outputs.tf`

**요구사항:**

- [ ] `pipeline_name` — CodePipeline 이름
- [ ] `codebuild_project_name` — CodeBuild 프로젝트 이름
- [ ] `codestar_connection_arn` — GitHub 연결 ARN (콘솔 OAuth 승인 시 필요)
- [ ] `artifact_bucket_name` — 아티팩트 S3 버킷 이름

---

## Acceptance Criteria

- [ ] `terraform/modules/pipeline/` 디렉터리에 `main.tf`, `variables.tf`, `outputs.tf` 3개 파일 존재
- [ ] `aws_codebuild_project`에 `privileged_mode = true` 설정
- [ ] CodeBuild IAM role에 ECR push 권한 포함
- [ ] CodeBuild IAM role에 EB 배포 권한 포함
- [ ] `aws_codestarconnections_connection` 리소스 존재
- [ ] 아티팩트 S3 버킷 버저닝 활성화

---

## Notes

- CodeStar Connection은 Terraform apply 후 AWS 콘솔에서 수동 OAuth 승인 필요 (Pending → Available)
- CodePipeline Deploy 단계는 생략 — EB 배포를 buildspec post_build에서 직접 AWS CLI로 수행
- 아티팩트 버킷은 기존 `s3` 모듈의 업로드 버킷과 별개
- `aws_s3_bucket_public_access_block` 으로 퍼블릭 접근 차단 추가 권장
