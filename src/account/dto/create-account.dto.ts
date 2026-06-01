import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AccountType } from '@prisma/client';
import {
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateIf,
} from 'class-validator';

export class CreateAccountDto {
  @ApiProperty({ example: '홍길동' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;

  @ApiPropertyOptional({ example: 'partner@example.com' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: '010-1234-5678' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  phone?: string;

  @ApiProperty({ enum: AccountType, example: AccountType.PARTNER })
  @IsEnum(AccountType)
  type: AccountType;

  @ApiPropertyOptional({
    type: [String],
    example: ['SNS 운영', '영상 편집', '디자인'],
  })
  @ValidateIf((o) => o.type === AccountType.PARTNER)
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  interestTags?: string[];

  @ApiPropertyOptional({ example: '뷰티/코스메틱' })
  @ValidateIf((o) => o.type === AccountType.PARTNER)
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  industry?: string;
}
