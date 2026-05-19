output "repository_url" {
  description = "ECR 리포지토리 URL (Docker push/pull에 사용)"
  value       = aws_ecr_repository.api.repository_url
}

output "repository_name" {
  description = "ECR 리포지토리 이름"
  value       = aws_ecr_repository.api.name
}
