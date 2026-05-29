import { Injectable } from '@nestjs/common';
import { Prisma, AccountType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFounderDto } from './dto/create-founder.dto';

@Injectable()
export class FounderService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateFounderDto): Promise<'created' | 'exists'> {
    try {
      await this.prisma.account.create({
        data: {
          name: dto.name,
          email: dto.email,
          phone: dto.phone,
          type: AccountType.FOUNDER,
        },
      });
      return 'created';
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      ) {
        return 'exists';
      }
      throw e;
    }
  }
}
