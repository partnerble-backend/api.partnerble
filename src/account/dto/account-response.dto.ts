import { ApiProperty } from '@nestjs/swagger';
import { AccountType } from '@prisma/client';

export class AccountResponseDto {
  @ApiProperty({ example: 'clx...' })
  id: string;

  @ApiProperty({ example: '홍길동' })
  name: string;

  @ApiProperty({ nullable: true, example: 'partner@example.com' })
  email: string | null;

  @ApiProperty({ nullable: true, example: '010-1234-5678' })
  phone: string | null;

  @ApiProperty({ enum: AccountType, example: AccountType.PARTNER })
  type: AccountType;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt: Date;
}
