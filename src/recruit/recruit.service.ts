import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AccountType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from '../common/notification/notification.service';
import {
  FRONTEND_URL_LOCAL,
  FRONTEND_URL_PROD,
} from '../common/constants/app.constants';
import { CreateRecruitDto } from './dto/create-recruit.dto';
import { RecruitResponseDto } from './dto/recruit-response.dto';
import { RecruitListQueryDto } from './dto/recruit-list-query.dto';
import { RecruitListResponseDto } from './dto/recruit-list-response.dto';
import { RecruitDetailResponseDto } from './dto/recruit-detail-response.dto';

@Injectable()
export class RecruitService {
  private readonly logger = new Logger(RecruitService.name);
  private readonly frontendUrl: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
    configService: ConfigService,
  ) {
    this.frontendUrl =
      configService.get('NODE_ENV') === 'production'
        ? FRONTEND_URL_PROD
        : FRONTEND_URL_LOCAL;
  }

  async create(dto: CreateRecruitDto): Promise<RecruitResponseDto> {
    const existingAccount = await this.prisma.account.findFirst({
      where: { email: dto.email },
    });

    const { recruit } = await this.prisma.$transaction(async (tx) => {
      const accountId =
        existingAccount?.id ??
        (
          await tx.account.create({
            data: {
              name: dto.name,
              email: dto.email,
              phone: dto.phone,
              type: AccountType.FOUNDER,
            },
          })
        ).id;

      const recruit = await tx.recruit.create({
        data: {
          accountId,
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

    const recruitLink = `${this.frontendUrl}/recruit/${recruit.id}`;

    void this.notificationService
      .notifyRecruitRegisteredToFounder({
        recruitId: recruit.id,
        founderEmail: dto.email,
        founderName: dto.name,
        companyName: dto.companyName,
        roleDesc: dto.roleDesc,
        recruitLink,
      })
      .catch((err: Error) =>
        this.logger.error(
          `Founder notification failed for recruit ${recruit.id}: ${err.message}`,
        ),
      );

    void this.notificationService
      .notifyRecruitSubmission({
        recruitId: recruit.id,
        companyName: dto.companyName,
        roleDesc: dto.roleDesc,
        name: dto.name,
        email: dto.email,
        recruitLink,
      })
      .catch((err: Error) =>
        this.logger.error(
          `Operator notification failed for recruit ${recruit.id}: ${err.message}`,
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
    return { items: data, total };
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
    return recruit;
  }
}
