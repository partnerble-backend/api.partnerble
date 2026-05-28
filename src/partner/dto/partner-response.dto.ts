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

  @ApiProperty({ type: [String], example: ['마케팅', 'IT'] })
  interestTags: string[];

  @ApiProperty({ example: 'IT/스타트업' })
  industry: string;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt: string;
}
