output "environment_url" {
  description = "EB 환경 URL"
  value       = aws_elastic_beanstalk_environment.prod.endpoint_url
}

output "security_group_id" {
  description = "EB 인스턴스 보안 그룹 ID (RDS 인바운드 허용에 사용)"
  value       = aws_security_group.eb.id
}
