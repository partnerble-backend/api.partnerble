import { Body, Controller, Get, HttpCode, Param, Post } from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreatePartnerDto } from './dto/create-partner.dto';
import { PartnerResponseDto } from './dto/partner-response.dto';
import { PartnerService } from './partner.service';

@ApiTags('partners')
@Controller('partners')
export class PartnerController {
  constructor(private readonly partnerService: PartnerService) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({
    summary: '파트너 등록',
    operationId: 'createPartner',
    description: `파트너 계정과 프로필을 등록합니다.
    • Account(PARTNER) + Partner 레코드를 트랜잭션으로 동시 생성
    • 등록 완료 시 운영자에게 알림 이메일 발송`,
  })
  @ApiBody({ type: CreatePartnerDto })
  @ApiResponse({
    status: 201,
    description: '파트너 등록 성공',
    type: PartnerResponseDto,
  })
  @ApiResponse({ status: 400, description: '유효성 검사 실패' })
  createPartner(@Body() dto: CreatePartnerDto): Promise<PartnerResponseDto> {
    return this.partnerService.create(dto);
  }

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
