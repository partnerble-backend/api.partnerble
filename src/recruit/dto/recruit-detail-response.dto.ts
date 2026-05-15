import { BudgetUnit } from '@prisma/client';

export class RecruitDetailItemDto {
  id: string;
  companyName: string;
  location: string;
  industry: string;
  roleDesc: string;
  detailContent: string;
  budgetAmount: number;
  budgetUnit: BudgetUnit;
  duration: string;
  tags: string[];
  isActive: boolean;
  createdAt: Date;
}

export class RecruitDetailResponseDto extends RecruitDetailItemDto {}
