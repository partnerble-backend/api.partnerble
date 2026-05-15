import { Module } from '@nestjs/common';
import { NotificationModule } from '../common/notification/notification.module';
import { RecruitController } from './recruit.controller';
import { RecruitService } from './recruit.service';

@Module({
  imports: [NotificationModule],
  controllers: [RecruitController],
  providers: [RecruitService],
})
export class RecruitModule {}
