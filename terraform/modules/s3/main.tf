resource "aws_s3_bucket" "uploads" {
  bucket = var.bucket_name
}

# 퍼블릭 액세스 차단 — 새 퍼블릭 버킷 정책만 허용 (GetObject 공개 읽기용)
resource "aws_s3_bucket_public_access_block" "uploads" {
  bucket = aws_s3_bucket.uploads.id

  block_public_acls       = true
  block_public_policy     = false  # 버킷 정책으로 공개 읽기 허용
  ignore_public_acls      = true
  restrict_public_buckets = false
}

# 공개 읽기 버킷 정책 (첨부파일 URL 직접 접근용)
resource "aws_s3_bucket_policy" "public_read" {
  bucket     = aws_s3_bucket.uploads.id
  depends_on = [aws_s3_bucket_public_access_block.uploads]

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Sid       = "PublicReadGetObject"
      Effect    = "Allow"
      Principal = "*"
      Action    = "s3:GetObject"
      Resource  = "${aws_s3_bucket.uploads.arn}/*"
    }]
  })
}

# CORS 설정 (프론트엔드 직접 업로드 허용)
resource "aws_s3_bucket_cors_configuration" "uploads" {
  bucket = aws_s3_bucket.uploads.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "PUT", "POST"]
    allowed_origins = ["https://partnerble.com"]
    expose_headers  = []
  }
}
