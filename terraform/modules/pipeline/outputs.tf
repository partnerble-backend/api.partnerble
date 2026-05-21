output "pipeline_name" {
  description = "CodePipeline 이름"
  value       = aws_codepipeline.api.name
}

output "codebuild_project_name" {
  description = "CodeBuild 프로젝트 이름"
  value       = aws_codebuild_project.api.name
}

output "codestar_connection_arn" {
  description = "GitHub CodeStar Connection ARN (콘솔 OAuth 승인 시 필요)"
  value       = aws_codestarconnections_connection.github.arn
}

output "artifact_bucket_name" {
  description = "파이프라인 아티팩트 S3 버킷 이름"
  value       = aws_s3_bucket.pipeline_artifacts.bucket
}