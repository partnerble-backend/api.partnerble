import { ApiPropertyOptional } from '@nestjs/swagger';
import { ApplicationStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class ApplicationListQueryDto {
  @ApiPropertyOptional({ example: 'clx...', description: '공고 ID 필터' })
  @IsOptional()
  @IsString()
  recruitId?: string;

  @ApiPropertyOptional({
    enum: ApplicationStatus,
    example: ApplicationStatus.PENDING,
    description: '지원서 상태 필터',
  })
  @IsOptional()
  @IsEnum(ApplicationStatus)
  status?: ApplicationStatus;

  @ApiPropertyOptional({
    example: 1,
    description: '페이지 번호 (기본값: 1)',
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    example: 20,
    description: '페이지당 항목 수 (기본값: 20)',
    default: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;
}
