import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from '../common/notification/notification.service';
import { CreateRecruitDto } from './dto/create-recruit.dto';
import { RecruitResponseDto } from './dto/recruit-response.dto';

@Injectable()
export class RecruitService {
  private readonly logger = new Logger(RecruitService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
  ) {}

  async create(dto: CreateRecruitDto): Promise<RecruitResponseDto> {
    const { recruit } = await this.prisma.$transaction(async (tx) => {
      const account = await tx.account.create({
        data: {
          name: dto.name,
          email: dto.email,
          phone: dto.phone,
          type: 'FOUNDER',
        },
      });
      const recruit = await tx.recruit.create({
        data: {
          accountId: account.id,
          isActive: false,
          companyName: dto.companyName,
          location: dto.location,
          industry: dto.industry,
          roleDesc: dto.roleDesc,
          detailContent: dto.detailContent,
          budgetAmount: dto.budgetAmount,
          budgetUnit: dto.budgetUnit,
          duration: dto.duration,
          tags: dto.tags ?? [],
        },
      });
      return { recruit };
    });

    void this.notificationService
      .notifyRecruitSubmission({
        recruitId: recruit.id,
        companyName: recruit.companyName,
        roleDesc: recruit.roleDesc,
        name: dto.name,
        email: dto.email,
      })
      .catch((err: Error) =>
        this.logger.error(
          `Notification failed for recruit ${recruit.id}: ${err.message}`,
        ),
      );

    return {
      id: recruit.id,
      isActive: recruit.isActive,
      createdAt: recruit.createdAt,
    };
  }
}
