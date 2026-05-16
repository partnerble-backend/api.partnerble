import { ApiProperty } from '@nestjs/swagger';
import { BudgetUnit } from '@prisma/client';
import { ListResponseDto } from '../../common/dto/response.dto';

export class RecruitListItemDto {
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

  @ApiProperty({ example: 500000 })
  budgetAmount: number;

  @ApiProperty({ enum: BudgetUnit, example: BudgetUnit.MONTHLY })
  budgetUnit: BudgetUnit;

  @ApiProperty({ example: '3개월' })
  duration: string;

  @ApiProperty({ type: [String], example: ['마케팅', 'SNS'] })
  tags: string[];

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt: Date;
}

export class RecruitListResponseDto extends ListResponseDto<RecruitListItemDto> {
  @ApiProperty({ type: () => [RecruitListItemDto] })
  items: RecruitListItemDto[];
}
