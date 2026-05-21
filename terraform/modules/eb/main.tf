# 고정 Elastic IP — 인스턴스 교체 시에도 IP 유지
resource "aws_eip" "eb" {
  domain = "vpc"
}

# EB 애플리케이션
resource "aws_elastic_beanstalk_application" "api" {
  name = "${var.name_prefix}-backend"
}

# EB 인스턴스 보안 그룹 (RDS 모듈이 인바운드 소스로 참조)
resource "aws_security_group" "eb" {
  name        = "${var.name_prefix}-eb-sg"
  description = "Elastic Beanstalk EC2 instance security group"
  vpc_id      = var.vpc_id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# EB 환경 (Docker, 단일 인스턴스)
resource "aws_elastic_beanstalk_environment" "prod" {
  name                = "${var.name_prefix}-backend-prod"
  application         = aws_elastic_beanstalk_application.api.name
  solution_stack_name = "64bit Amazon Linux 2023 v4.12.3 running Docker"

  # ── 인스턴스 ──────────────────────────────────────────────────────────────────
  setting {
    namespace = "aws:autoscaling:launchconfiguration"
    name      = "InstanceType"
    value     = "t3.micro"
  }

  setting {
    namespace = "aws:autoscaling:launchconfiguration"
    name      = "IamInstanceProfile"
    value     = var.instance_profile
  }

  setting {
    namespace = "aws:autoscaling:launchconfiguration"
    name      = "SecurityGroups"
    value     = aws_security_group.eb.id
  }

  # ── VPC 설정 ──────────────────────────────────────────────────────────────────
  setting {
    namespace = "aws:ec2:vpc"
    name      = "VPCId"
    value     = var.vpc_id
  }

  setting {
    namespace = "aws:ec2:vpc"
    name      = "Subnets"
    value     = join(",", var.subnet_ids)
  }

  # ── 단일 인스턴스 (로드밸런서 없음, 비용 최소화) ─────────────────────────────
  setting {
    namespace = "aws:elasticbeanstalk:environment"
    name      = "EnvironmentType"
    value     = "SingleInstance"
  }

  # ── 환경변수 ──────────────────────────────────────────────────────────────────
  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "NODE_ENV"
    value     = "production"
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "PORT"
    value     = "3000"
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "DATABASE_URL"
    value     = var.database_url
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "AWS_REGION"
    value     = var.aws_region
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "AWS_S3_BUCKET"
    value     = var.s3_bucket
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "OPERATOR_EMAIL"
    value     = var.operator_email
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "SES_FROM_EMAIL"
    value     = var.ses_from_email
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "ADMIN_API_KEY"
    value     = var.admin_api_key
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "EIP_ALLOCATION_ID"
    value     = aws_eip.eb.allocation_id
  }
}
