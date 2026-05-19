variable "name_prefix" {
  description = "리소스 이름 접두사 (예: partnerble-prod)"
  type        = string
}

variable "vpc_id" {
  description = "EB 환경 및 보안 그룹을 배치할 VPC ID"
  type        = string
}

variable "subnet_ids" {
  description = "EB EC2 인스턴스를 배치할 서브넷 ID 목록"
  type        = list(string)
}

variable "aws_account_id" {
  description = "AWS 계정 ID (ECR URI 구성에 사용)"
  type        = string
}

variable "aws_region" {
  description = "AWS 리전"
  type        = string
}

variable "instance_profile" {
  description = "EB 인스턴스 프로파일 이름 (IAM 모듈 output)"
  type        = string
}

variable "database_url" {
  description = "DATABASE_URL (RDS 모듈 output)"
  type        = string
  sensitive   = true
}

variable "s3_bucket" {
  description = "업로드용 S3 버킷 이름 (S3 모듈 output)"
  type        = string
}

variable "operator_email" {
  description = "운영자 알림 수신 이메일"
  type        = string
}

variable "ses_from_email" {
  description = "SES 발신자 이메일"
  type        = string
}

variable "admin_api_key" {
  description = "관리자 API 인증 키"
  type        = string
  sensitive   = true
}
