import { ApplicationResponseDto } from './application-response.dto';

class PartnerAccountDto {
  name: string;
  phone: string | null;
}

class FounderAccountDto {
  email: string | null;
}

class RecruitDetailDto {
  id: string;
  roleDesc: string;
  account: FounderAccountDto;
}

export class ApplicationDetailResponseDto extends ApplicationResponseDto {
  account: PartnerAccountDto;
  recruit: RecruitDetailDto;
}
