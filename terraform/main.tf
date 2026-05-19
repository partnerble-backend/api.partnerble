locals {
  name_prefix    = "${var.project}-${var.environment}"
  s3_bucket_name = "${var.project}-uploads-${var.environment}"
}

# 기본 VPC / 서브넷 데이터 소스 (EB·RDS 배치에 사용)
data "aws_vpc" "default" {
  default = true
}

data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

# ── 모듈 호출 (각 Phase에서 순차적으로 주석 해제) ────────────────────────────

module "iam" {
  source         = "./modules/iam"
  name_prefix    = local.name_prefix
  s3_bucket_name = local.s3_bucket_name
}

module "s3" {
  source      = "./modules/s3"
  bucket_name = local.s3_bucket_name
}

module "ecr" {
  source      = "./modules/ecr"
  name_prefix = local.name_prefix
}

module "eb" {
  source           = "./modules/eb"
  name_prefix      = local.name_prefix
  aws_account_id   = var.aws_account_id
  aws_region       = var.aws_region
  vpc_id           = data.aws_vpc.default.id
  subnet_ids       = data.aws_subnets.default.ids
  instance_profile = module.iam.eb_instance_profile_name
  database_url     = module.rds.database_url
  s3_bucket        = module.s3.bucket_name
  operator_email   = var.operator_email
  ses_from_email   = var.ses_from_email
  admin_api_key    = var.admin_api_key
}

module "rds" {
  source      = "./modules/rds"
  name_prefix = local.name_prefix
  db_password = var.db_password
  vpc_id      = data.aws_vpc.default.id
  subnet_ids  = data.aws_subnets.default.ids
  eb_sg_id    = module.eb.security_group_id
}