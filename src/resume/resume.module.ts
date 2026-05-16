import { Module } from '@nestjs/common';
import { S3Module } from '../common/s3/s3.module';
import { NotificationModule } from '../common/notification/notification.module';
import { ResumeService } from './resume.service';
import { ResumeController } from './resume.controller';
import { ApiKeyGuard } from '../common/guards/api-key.guard';

@Module({
  imports: [S3Module, NotificationModule],
  controllers: [ResumeController],
  providers: [ResumeService, ApiKeyGuard],
})
export class ResumeModule {}
