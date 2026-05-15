import { BudgetUnit } from '@prisma/client';
import { ListResponseDto } from '../../common/dto/list-response.dto';

export class RecruitListItemDto {
  id: string;
  companyName: string;
  location: string;
  industry: string;
  roleDesc: string;
  budgetAmount: number;
  budgetUnit: BudgetUnit;
  duration: string;
  tags: string[];
  createdAt: Date;
}

export class RecruitListResponseDto extends ListResponseDto<RecruitListItemDto> {}
