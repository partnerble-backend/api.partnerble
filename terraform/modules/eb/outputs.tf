output "environment_url" {
  description = "EB 환경 URL"
  value       = aws_elastic_beanstalk_environment.prod.endpoint_url
}

output "security_group_id" {
  description = "EB 인스턴스 보안 그룹 ID (RDS 인바운드 허용에 사용)"
  value       = aws_security_group.eb.id
}

output "eip_public_ip" {
  description = "EB 고정 Elastic IP (Cloudflare A 레코드에 사용)"
  value       = aws_eip.eb.public_ip
}

output "app_name" {
  description = "EB 애플리케이션 이름"
  value       = aws_elastic_beanstalk_application.api.name
}

output "env_name" {
  description = "EB 환경 이름"
  value       = aws_elastic_beanstalk_environment.prod.name
}
