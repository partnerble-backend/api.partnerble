import { Injectable } from '@nestjs/common';
import { AccountType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFounderDto } from './dto/create-founder.dto';

@Injectable()
export class FounderService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateFounderDto): Promise<void> {
    await this.prisma.account.create({
      data: {
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        type: AccountType.FOUNDER,
      },
    });
  }
}
