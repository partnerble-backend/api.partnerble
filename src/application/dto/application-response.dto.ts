import { ApiProperty } from '@nestjs/swagger';
import { ApplicationStatus } from '@prisma/client';

export class ApplicationResponseDto {
  @ApiProperty({ example: 'clx...' })
  id: string;

  @ApiProperty({ example: 'clx...' })
  recruitId: string;

  @ApiProperty({ enum: ApplicationStatus, example: ApplicationStatus.PENDING })
  status: ApplicationStatus;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ example: '안녕하세요, 마케팅 경력 3년차입니다.' })
  introduction: string;

  @ApiProperty({ example: 'https://s3.amazonaws.com/...', nullable: true })
  attachmentUrl: string | null;
}
