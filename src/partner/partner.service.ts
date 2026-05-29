import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { AccountType } from '@prisma/client';
import { NotificationService } from '../common/notification/notification.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePartnerDto } from './dto/create-partner.dto';
import { PartnerResponseDto } from './dto/partner-response.dto';

@Injectable()
export class PartnerService {
  private readonly logger = new Logger(PartnerService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
  ) {}

  async create(dto: CreatePartnerDto): Promise<PartnerResponseDto> {
    const partner = await this.prisma.$transaction(async (tx) => {
      const account = await tx.account.create({
        data: {
          name: dto.name,
          email: dto.email,
          phone: dto.phone,
          type: AccountType.PARTNER,
        },
      });
      return tx.partner.create({
        data: {
          accountId: account.id,
          interestTags: dto.interestTags,
          industry: dto.industry,
        },
        include: { account: true },
      });
    });

    void this.notificationService
      .notifyPartnerRegistration({
        partnerId: partner.id,
        name: partner.account.name,
        email: partner.account.email,
        phone: partner.account.phone,
        interestTags: partner.interestTags,
        industry: partner.industry,
      })
      .catch((err: Error) =>
        this.logger.error(
          `Partner notification failed for partner ${partner.id}: ${err.message}`,
        ),
      );

    return {
      id: partner.id,
      accountId: partner.accountId,
      name: partner.account.name,
      email: partner.account.email ?? null,
      phone: partner.account.phone ?? null,
      interestTags: partner.interestTags,
      industry: partner.industry,
      createdAt: partner.createdAt.toISOString(),
    };
  }

  async findOne(id: string): Promise<PartnerResponseDto> {
    const partner = await this.prisma.partner.findUnique({
      where: { id },
      include: { account: true },
    });
    if (!partner) throw new NotFoundException('존재하지 않는 파트너 id');
    return {
      id: partner.id,
      accountId: partner.accountId,
      name: partner.account.name,
      email: partner.account.email ?? null,
      phone: partner.account.phone ?? null,
      interestTags: partner.interestTags,
      industry: partner.industry,
      createdAt: partner.createdAt.toISOString(),
    };
  }
}
