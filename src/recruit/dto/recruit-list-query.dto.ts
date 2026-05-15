import { IsBoolean, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class RecruitListQueryDto {
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isActive?: boolean = true;
}
