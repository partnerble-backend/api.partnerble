variable "name_prefix" {
  description = "리소스 이름 접두사 (예: partnerble-prod)"
  type        = string
}

variable "aws_region" {
  description = "AWS 리전"
  type        = string
}

variable "aws_account_id" {
  description = "AWS 계정 ID (ECR URI 구성에 사용)"
  type        = string
}

variable "ecr_repo_name" {
  description = "ECR 리포지토리 이름 (ECR_REPO_URI 구성에 사용)"
  type        = string
}

variable "eb_app_name" {
  description = "Elastic Beanstalk 애플리케이션 이름"
  type        = string
}

variable "eb_env_name" {
  description = "Elastic Beanstalk 환경 이름"
  type        = string
}

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
  default     = "main"
}
