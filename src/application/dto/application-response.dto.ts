import { ApiProperty } from '@nestjs/swagger';
import { ApplicationStatus } from '@prisma/client';
import { PaginatedResponseDto } from '../../common/dto/response.dto';

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

export class AdminApplicationListItemDto {
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

  @ApiProperty({ enum: ApplicationStatus, example: ApplicationStatus.PENDING })
  status: ApplicationStatus;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt: Date;
}

export class AdminApplicationListResponseDto extends PaginatedResponseDto<AdminApplicationListItemDto> {
  @ApiProperty({ type: () => [AdminApplicationListItemDto] })
  items: AdminApplicationListItemDto[];
}

export class UpdateApplicationStatusResponseDto {
  @ApiProperty({ example: 'clx...' })
  id: string;

  @ApiProperty({ enum: ApplicationStatus, example: ApplicationStatus.REVIEWED })
  status: ApplicationStatus;

  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt: Date;
}
