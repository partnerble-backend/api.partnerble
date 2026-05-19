# RDS 보안 그룹 — EB 인스턴스에서 5432만 허용
resource "aws_security_group" "rds" {
  name        = "${var.name_prefix}-rds-sg"
  description = "Allow PostgreSQL from EB instances"
  vpc_id      = var.vpc_id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [var.eb_sg_id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# RDS 서브넷 그룹
resource "aws_db_subnet_group" "main" {
  name       = "${var.name_prefix}-db-subnet-group"
  subnet_ids = var.subnet_ids
}

# RDS PostgreSQL 16 인스턴스
resource "aws_db_instance" "main" {
  identifier = "${var.name_prefix}-db"

  engine         = "postgres"
  engine_version = "16"
  instance_class = "db.t3.micro"

  allocated_storage     = 20
  storage_type          = "gp3"
  max_allocated_storage = 0  # 자동 조정 비활성화 (비용 제어)

  db_name  = "partnerble"
  username = "partnerble"
  password = var.db_password

  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  publicly_accessible    = false

  backup_retention_period = 7     # 자동 백업 7일 보존
  skip_final_snapshot     = false # 삭제 시 최종 스냅샷 생성
  final_snapshot_identifier = "${var.name_prefix}-db-final-snapshot"

  deletion_protection = true  # 실수로 인한 삭제 방지
}
