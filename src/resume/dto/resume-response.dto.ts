import { ApiProperty } from '@nestjs/swagger';
import { ResumeStatus } from '@prisma/client';
import { PaginatedResponseDto } from '../../common/dto/response.dto';

export class ResumeResponseDto {
  @ApiProperty({ example: 'clx...' })
  id: string;

  @ApiProperty({ example: 'clx...' })
  recruitId: string;

  @ApiProperty({ enum: ResumeStatus, example: ResumeStatus.PENDING })
  status: ResumeStatus;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ example: '안녕하세요, 마케팅 경력 3년차입니다.' })
  introduction: string;

  @ApiProperty({ example: 'https://s3.amazonaws.com/...', nullable: true })
  attachmentUrl: string | null;
}

export class AdminResumeListItemDto {
  @ApiProperty({ example: 'clx...' })
  id: string;

  @ApiProperty({ example: 'clx...' })
  recruitId: string;

  @ApiProperty({ example: '마케팅 담당자 채용' })
  roleDesc: string;

  @ApiProperty({ example: '파트너블 주식회사' })
  companyName: string;

  @ApiProperty({ example: '홍길동' })
  name: string;

  @ApiProperty({ example: '010-1234-5678' })
  phone: string;

  @ApiProperty({ example: '안녕하세요, 마케팅 경력 3년차입니다.' })
  introduction: string;

  @ApiProperty({ example: 'https://s3.amazonaws.com/...', nullable: true })
  attachmentUrl: string | null;

  @ApiProperty({ example: 'resume.pdf', nullable: true })
  attachmentName: string | null;

  @ApiProperty({ enum: ResumeStatus, example: ResumeStatus.PENDING })
  status: ResumeStatus;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt: Date;
}

export class AdminResumeListResponseDto extends PaginatedResponseDto<AdminResumeListItemDto> {
  @ApiProperty({ type: () => [AdminResumeListItemDto] })
  items: AdminResumeListItemDto[];
}

export class UpdateResumeStatusResponseDto {
  @ApiProperty({ example: 'clx...' })
  id: string;

  @ApiProperty({ enum: ResumeStatus, example: ResumeStatus.REVIEWED })
  status: ResumeStatus;

  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt: Date;
}
