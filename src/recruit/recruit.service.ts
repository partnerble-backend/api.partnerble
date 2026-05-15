import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from '../common/notification/notification.service';
import { CreateRecruitDto } from './dto/create-recruit.dto';
import { RecruitResponseDto } from './dto/recruit-response.dto';
import { RecruitListQueryDto } from './dto/recruit-list-query.dto';
import { RecruitListResponseDto } from './dto/recruit-list-response.dto';
import { RecruitDetailResponseDto } from './dto/recruit-detail-response.dto';

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

  async findAll(query: RecruitListQueryDto): Promise<RecruitListResponseDto> {
    const isActive = query.isActive ?? true;
    const [data, total] = await this.prisma.$transaction([
      this.prisma.recruit.findMany({
        where: { isActive },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          companyName: true,
          location: true,
          industry: true,
          roleDesc: true,
          budgetAmount: true,
          budgetUnit: true,
          duration: true,
          tags: true,
          createdAt: true,
        },
      }),
      this.prisma.recruit.count({ where: { isActive } }),
    ]);
    return { data, total };
  }

  async findOne(id: string): Promise<RecruitDetailResponseDto> {
    const recruit = await this.prisma.recruit.findUnique({
      where: { id },
      select: {
        id: true,
        companyName: true,
        location: true,
        industry: true,
        roleDesc: true,
        detailContent: true,
        budgetAmount: true,
        budgetUnit: true,
        duration: true,
        tags: true,
        isActive: true,
        createdAt: true,
      },
    });
    if (!recruit) throw new NotFoundException('존재하지 않는 공고입니다.');
    return { data: recruit };
  }
}
