# Task: buildspec.yml 생성

## Summary

GitHub Actions 대신 AWS CodeBuild가 사용할 빌드 명세 파일을 프로젝트 루트에 생성한다.
`dev` 브랜치 push 시 CodePipeline이 이 파일을 읽어 Docker 이미지를 빌드·푸시하고 EB를 업데이트한다.

---

## Scope

### 1. buildspec.yml (프로젝트 루트)

**위치:** `buildspec.yml`

**요구사항:**

- [ ] ECR 로그인: `aws ecr get-login-password` 파이프로 `docker login`
- [ ] `docker buildx build --platform linux/amd64` 로 이미지 빌드
- [ ] 이미지 태그 두 개 생성:
  - `latest`
  - `$CODEBUILD_RESOLVED_SOURCE_VERSION` 앞 7자리 (commit SHA)
- [ ] 두 태그 모두 ECR push
- [ ] Dockerrun.aws.json 생성 후 S3 업로드
- [ ] EB Application Version 생성 (`aws elasticbeanstalk create-application-version`)
- [ ] EB 환경 업데이트 (`aws elasticbeanstalk update-environment`)

**구현 예시:**

```yaml
version: 0.2

env:
  variables:
    AWS_DEFAULT_REGION: ap-northeast-2
    ECR_REPO_URI: <aws_account_id>.dkr.ecr.ap-northeast-2.amazonaws.com/partnerble-prod-api
    EB_APP_NAME: partnerble-prod-backend
    EB_ENV_NAME: partnerble-prod-backend-prod
    S3_BUCKET: <artifact-bucket-name>

phases:
  pre_build:
    commands:
      - COMMIT_SHA=$(echo $CODEBUILD_RESOLVED_SOURCE_VERSION | cut -c1-7)
      - IMAGE_TAG_SHA=$ECR_REPO_URI:$COMMIT_SHA
      - IMAGE_TAG_LATEST=$ECR_REPO_URI:latest
      - aws ecr get-login-password --region $AWS_DEFAULT_REGION | docker login --username AWS --password-stdin $ECR_REPO_URI

  build:
    commands:
      - docker buildx build --platform linux/amd64 -t $IMAGE_TAG_SHA -t $IMAGE_TAG_LATEST .

  post_build:
    commands:
      - docker push $IMAGE_TAG_SHA
      - docker push $IMAGE_TAG_LATEST
      - printf '{"AWSEBDockerrunVersion":"1","Image":{"Name":"%s","Update":"true"}}' $IMAGE_TAG_SHA > Dockerrun.aws.json
      - aws s3 cp Dockerrun.aws.json s3://$S3_BUCKET/deployments/$COMMIT_SHA/Dockerrun.aws.json
      - aws elasticbeanstalk create-application-version --application-name $EB_APP_NAME --version-label $COMMIT_SHA --source-bundle S3Bucket=$S3_BUCKET,S3Key=deployments/$COMMIT_SHA/Dockerrun.aws.json
      - aws elasticbeanstalk update-environment --application-name $EB_APP_NAME --environment-name $EB_ENV_NAME --version-label $COMMIT_SHA
```

> **주의:** ECR_REPO_URI, EB_APP_NAME, EB_ENV_NAME, S3_BUCKET 값은 CodeBuild 프로젝트 환경변수로 주입된다(Terraform에서 설정). buildspec.yml에는 placeholder만 기재하거나 환경변수 참조만 사용한다.

---

## Acceptance Criteria

- [ ] `buildspec.yml` 파일이 프로젝트 루트에 존재
- [ ] `pre_build` / `build` / `post_build` 3단계로 구성
- [ ] `--platform linux/amd64` 플래그 포함
- [ ] commit SHA 7자리 + latest 두 태그 push
- [ ] EB Application Version 생성 및 update-environment 포함

---

## Notes

- CodeBuild 환경변수는 Terraform pipeline 모듈에서 `environment_variable` 블록으로 주입 (phase-2 참고)
- `privileged_mode = true` 는 CodeBuild 프로젝트 설정 — buildspec.yml 내용과 무관
- Dockerrun.aws.json v1 포맷 사용 (Single Container)
