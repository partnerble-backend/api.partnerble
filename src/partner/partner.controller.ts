import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PartnerService } from './partner.service';
import { PartnerResponseDto } from './dto/partner-response.dto';

@ApiTags('partners')
@Controller('partners')
export class PartnerController {
  constructor(private readonly partnerService: PartnerService) {}

  @Get(':id')
  @ApiOperation({
    summary: '파트너 프로필 조회',
    operationId: 'getPartner',
    description: `파트너 프로필을 조회합니다.
    • Partner + Account 합산 데이터를 반환합니다
    • 존재하지 않는 id 요청 시 404 반환`,
  })
  @ApiParam({ name: 'id', description: 'Partner ID', example: 'clx...' })
  @ApiResponse({
    status: 200,
    description: '조회 성공',
    type: PartnerResponseDto,
  })
  @ApiResponse({ status: 404, description: '존재하지 않는 파트너 id' })
  getPartner(@Param('id') id: string): Promise<PartnerResponseDto> {
    return this.partnerService.findOne(id);
  }
}
