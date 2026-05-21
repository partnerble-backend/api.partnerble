variable "name_prefix" {
  description = "리소스 이름 접두사 (예: partnerble-prod)"
  type        = string
}

variable "s3_bucket_name" {
  description = "업로드용 S3 버킷 이름 (IAM 정책 Resource ARN에 사용)"
  type        = string
}
