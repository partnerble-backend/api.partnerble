import { BudgetUnit } from '@prisma/client';

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

export class RecruitListResponseDto {
  items: RecruitListItemDto[];
  total: number;
}
