import { Injectable } from '@nestjs/common';
import { Account, AccountType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAccountDto } from './dto/create-account.dto';

@Injectable()
export class AccountService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateAccountDto): Promise<Account> {
    if (dto.type === AccountType.PARTNER) {
      return this.prisma.$transaction(async (tx) => {
        const account = await tx.account.create({
          data: {
            name: dto.name,
            email: dto.email,
            phone: dto.phone,
            type: dto.type,
          },
        });
        await tx.partner.create({
          data: {
            accountId: account.id,
            interestTags: dto.interestTags!,
            industry: dto.industry!,
          },
        });
        return account;
      });
    }
    return this.prisma.account.create({
      data: {
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        type: dto.type,
      },
    });
  }
}
