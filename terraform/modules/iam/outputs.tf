output "eb_instance_profile_name" {
  description = "EB 인스턴스 프로파일 이름 (EB 모듈에서 참조)"
  value       = aws_iam_instance_profile.eb.name
}

output "eb_instance_role_arn" {
  description = "EB 인스턴스 역할 ARN"
  value       = aws_iam_role.eb_instance.arn
}
