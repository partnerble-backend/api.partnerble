import { ApiProperty } from '@nestjs/swagger';
import { ResumeStatus } from '@prisma/client';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class UpdateResumeStatusDto {
  @ApiProperty({ enum: ResumeStatus, example: ResumeStatus.REVIEWED })
  @IsEnum(ResumeStatus)
  @IsNotEmpty()
  status: ResumeStatus;
}
