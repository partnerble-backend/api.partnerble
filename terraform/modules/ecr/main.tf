resource "aws_ecr_repository" "api" {
  name                 = "${var.name_prefix}-api"
  image_tag_mutability = "IMMUTABLE"  # 동일 태그 덮어쓰기 방지

  image_scanning_configuration {
    scan_on_push = true  # 푸시 시 보안 취약점 스캔
  }
}

# 최근 5개 버전 이미지만 유지 (ECR 비용 절감)
resource "aws_ecr_lifecycle_policy" "keep_last_5" {
  repository = aws_ecr_repository.api.name

  policy = jsonencode({
    rules = [{
      rulePriority = 1
      description  = "Keep last 5 images"
      selection = {
        tagStatus   = "any"
        countType   = "imageCountMoreThan"
        countNumber = 5
      }
      action = { type = "expire" }
    }]
  })
}
