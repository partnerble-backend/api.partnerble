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
import { BudgetUnit } from '@prisma/client';

export class CreateRecruitDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  companyName: string;

  @IsString()
  @IsNotEmpty()
  location: string;

  @IsString()
  @IsNotEmpty()
  industry: string;

  @IsString()
  @IsNotEmpty()
  roleDesc: string;

  @IsString()
  @IsNotEmpty()
  detailContent: string;

  @IsInt()
  @Min(0)
  budgetAmount: number;

  @IsEnum(BudgetUnit)
  budgetUnit: BudgetUnit;

  @IsString()
  @IsNotEmpty()
  duration: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
