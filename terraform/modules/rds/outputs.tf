output "endpoint" {
  description = "RDS 엔드포인트 (host:port)"
  value       = aws_db_instance.main.endpoint
}

output "database_url" {
  description = "DATABASE_URL 형식의 연결 문자열 (EB 환경변수에 사용)"
  value       = "postgresql://partnerble:${var.db_password}@${aws_db_instance.main.endpoint}/partnerble"
  sensitive   = true
}

output "security_group_id" {
  description = "RDS 보안 그룹 ID"
  value       = aws_security_group.rds.id
}
