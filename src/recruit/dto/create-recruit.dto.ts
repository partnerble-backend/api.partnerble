import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { IsEmail } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BudgetUnit } from '@prisma/client';

export class CreateRecruitDto {
  @ApiProperty({ example: '홍길동' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'contact@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '010-1234-5678' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: '파트너블' })
  @IsString()
  @IsNotEmpty()
  companyName: string;

  @ApiProperty({ example: '서울 강남구' })
  @IsString()
  @IsNotEmpty()
  location: string;

  @ApiProperty({ example: '뷰티/코스메틱' })
  @IsString()
  @IsNotEmpty()
  industry: string;

  @ApiProperty({ example: '마케터 모집' })
  @IsString()
  @IsNotEmpty()
  roleDesc: string;

  @ApiProperty({ example: '함께 성장할 마케터를 찾습니다...' })
  @IsString()
  @IsNotEmpty()
  detailContent: string;

  @ApiProperty({ example: 500000 })
  @IsInt()
  @Min(0)
  budgetAmount: number;

  @ApiProperty({ enum: BudgetUnit, example: BudgetUnit.MONTHLY })
  @IsEnum(BudgetUnit)
  budgetUnit: BudgetUnit;

  @ApiProperty({ example: '3개월' })
  @IsString()
  @IsNotEmpty()
  duration: string;

  @ApiPropertyOptional({ type: [String], example: ['SNS 운영', '영상 편집'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
