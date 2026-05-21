# ── EB 인스턴스 역할 ────────────────────────────────────────────────────────────

resource "aws_iam_role" "eb_instance" {
  name = "${var.name_prefix}-eb-instance-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "ec2.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
}

# EB 기본 권한 (로그, 헬스체크 등)
resource "aws_iam_role_policy_attachment" "eb_web_tier" {
  role       = aws_iam_role.eb_instance.name
  policy_arn = "arn:aws:iam::aws:policy/AWSElasticBeanstalkWebTier"
}

# ECR 이미지 pull 권한
resource "aws_iam_role_policy_attachment" "ecr_read" {
  role       = aws_iam_role.eb_instance.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
}

# S3 업로드 + SES 발송 인라인 정책
resource "aws_iam_role_policy" "s3_ses" {
  name = "${var.name_prefix}-s3-ses-policy"
  role = aws_iam_role.eb_instance.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "S3FileAccess"
        Effect = "Allow"
        Action = ["s3:PutObject", "s3:DeleteObject", "s3:GetObject"]
        Resource = "arn:aws:s3:::${var.s3_bucket_name}/*"
      },
      {
        Sid      = "SESSendEmail"
        Effect   = "Allow"
        Action   = ["ses:SendEmail", "ses:SendRawEmail"]
        Resource = "*"
      },
      {
        Sid      = "EIPAssociate"
        Effect   = "Allow"
        Action   = ["ec2:AssociateAddress", "ec2:DescribeAddresses"]
        Resource = "*"
      }
    ]
  })
}

# EC2 인스턴스 프로파일 (EB가 역할을 EC2에 연결할 때 사용)
resource "aws_iam_instance_profile" "eb" {
  name = "${var.name_prefix}-eb-instance-profile"
  role = aws_iam_role.eb_instance.name
}
