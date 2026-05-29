import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { FounderController } from './founder.controller';
import { FounderService } from './founder.service';

@Module({
  imports: [PrismaModule],
  controllers: [FounderController],
  providers: [FounderService],
})
export class FounderModule {}
