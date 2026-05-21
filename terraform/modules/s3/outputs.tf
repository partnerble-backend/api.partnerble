output "bucket_name" {
  description = "S3 버킷 이름 (EB 환경변수 AWS_S3_BUCKET에 사용)"
  value       = aws_s3_bucket.uploads.bucket
}

output "bucket_arn" {
  description = "S3 버킷 ARN"
  value       = aws_s3_bucket.uploads.arn
}
