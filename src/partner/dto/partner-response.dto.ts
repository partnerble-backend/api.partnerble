import { ApiProperty } from '@nestjs/swagger';

export class PartnerResponseDto {
  @ApiProperty({ example: 'clx...' })
  id: string;

  @ApiProperty({ example: 'clx...' })
  accountId: string;

  @ApiProperty({ example: '홍길동' })
  name: string;

  @ApiProperty({ nullable: true, example: 'partner@example.com' })
  email: string | null;

  @ApiProperty({ nullable: true, example: '010-1234-5678' })
  phone: string | null;

  @ApiProperty({ type: [String], example: ['SNS 운영', '영상 편집', '디자인'] })
  interestTags: string[];

  @ApiProperty({ example: '뷰티/코스메틱' })
  industry: string;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt: string;
}
