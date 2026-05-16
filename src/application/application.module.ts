import { Module } from '@nestjs/common';
import { S3Module } from '../common/s3/s3.module';
import { NotificationModule } from '../common/notification/notification.module';
import { ApplicationService } from './application.service';
import { ApplicationController } from './application.controller';
import { ApiKeyGuard } from '../common/guards/api-key.guard';

@Module({
  imports: [S3Module, NotificationModule],
  controllers: [ApplicationController],
  providers: [ApplicationService, ApiKeyGuard],
})
export class ApplicationModule {}
