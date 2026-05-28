import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PartnerResponseDto } from './dto/partner-response.dto';

@Injectable()
export class PartnerService {
  constructor(private readonly prisma: PrismaService) {}

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
