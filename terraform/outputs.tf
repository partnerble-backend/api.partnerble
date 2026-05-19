output "ecr_repository_url" {
  description = "ECR 리포지토리 URL (Docker push에 사용)"
  value       = module.ecr.repository_url
}

output "rds_endpoint" {
  description = "RDS 엔드포인트"
  value       = module.rds.endpoint
}

output "eb_environment_url" {
  description = "Elastic Beanstalk 환경 URL"
  value       = module.eb.environment_url
}

output "s3_bucket_name" {
  description = "업로드용 S3 버킷 이름"
  value       = module.s3.bucket_name
}
