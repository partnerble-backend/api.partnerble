variable "aws_region" {
  description = "AWS 리전"
  type        = string
  default     = "ap-northeast-2"
}

variable "project" {
  description = "프로젝트 이름 (리소스 명명에 사용)"
  type        = string
  default     = "partnerble"
}

variable "environment" {
  description = "배포 환경 (prod / staging)"
  type        = string
  default     = "prod"
}

variable "aws_account_id" {
  description = "AWS 계정 ID (ECR URI 구성에 사용)"
  type        = string
}

# ── RDS ────────────────────────────────────────────────────────────────────────

variable "db_password" {
  description = "RDS 마스터 사용자 비밀번호"
  type        = string
  sensitive   = true
}

# ── 알림 ───────────────────────────────────────────────────────────────────────

variable "operator_email" {
  description = "운영자 알림 수신 이메일"
  type        = string
}

variable "ses_from_email" {
  description = "SES 발신자 이메일 (인증된 주소)"
  type        = string
}

# ── 인증 ───────────────────────────────────────────────────────────────────────

variable "admin_api_key" {
  description = "관리자 API 인증 키 (openssl rand -hex 32)"
  type        = string
  sensitive   = true
}

# ── CI/CD ──────────────────────────────────────────────────────────────────────

variable "github_owner" {
  description = "GitHub 조직 또는 사용자명"
  type        = string
}

variable "github_repo" {
  description = "GitHub 리포지토리명"
  type        = string
}

variable "github_branch" {
  description = "파이프라인 트리거 브랜치"
  type        = string
  default     = "dev"
}
