import { ApiProperty } from '@nestjs/swagger';
import { BudgetUnit } from '@prisma/client';

export class RecruitDetailItemDto {
  @ApiProperty({ example: 'clx...' })
  id: string;

  @ApiProperty({ example: '파트너블' })
  companyName: string;

  @ApiProperty({ example: '서울 강남구' })
  location: string;

  @ApiProperty({ example: 'IT/스타트업' })
  industry: string;

  @ApiProperty({ example: '마케터 모집' })
  roleDesc: string;

  @ApiProperty({ example: '함께 성장할 마케터를 찾습니다...' })
  detailContent: string;

  @ApiProperty({ example: 500000 })
  budgetAmount: number;

  @ApiProperty({ enum: BudgetUnit, example: BudgetUnit.MONTHLY })
  budgetUnit: BudgetUnit;

  @ApiProperty({ example: '3개월' })
  duration: string;

  @ApiProperty({ type: [String], example: ['마케팅', 'SNS'] })
  tags: string[];

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt: Date;
}

export class RecruitDetailResponseDto extends RecruitDetailItemDto {}
