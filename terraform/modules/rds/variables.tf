variable "name_prefix" {
  description = "리소스 이름 접두사 (예: partnerble-prod)"
  type        = string
}

variable "db_password" {
  description = "RDS 마스터 사용자 비밀번호"
  type        = string
  sensitive   = true
}

variable "vpc_id" {
  description = "RDS를 배치할 VPC ID"
  type        = string
}

variable "subnet_ids" {
  description = "RDS 서브넷 그룹에 사용할 서브넷 ID 목록"
  type        = list(string)
}

variable "eb_sg_id" {
  description = "EB 인스턴스 보안 그룹 ID (RDS 인바운드 허용 대상)"
  type        = string
}
