import { ApiProperty } from '@nestjs/swagger';
import { ResumeResponseDto } from './resume-response.dto';

class FounderAccountDto {
  @ApiProperty({ example: 'founder@example.com', nullable: true })
  email: string | null;
}

class RecruitDetailDto {
  @ApiProperty({ example: 'clx...' })
  id: string;

  @ApiProperty({ example: '마케터 모집' })
  roleDesc: string;

  @ApiProperty({ type: () => FounderAccountDto })
  account: FounderAccountDto;
}

class PartnerAccountDto {
  @ApiProperty({ example: '홍길동' })
  name: string;

  @ApiProperty({ example: '010-1234-5678', nullable: true })
  phone: string | null;
}

export class ResumeDetailResponseDto extends ResumeResponseDto {
  @ApiProperty({ type: () => PartnerAccountDto })
  account: PartnerAccountDto;

  @ApiProperty({ type: () => RecruitDetailDto })
  recruit: RecruitDetailDto;
}
