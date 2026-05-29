import { Body, Controller, Post, Res } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { CreateFounderDto } from './dto/create-founder.dto';
import { FounderService } from './founder.service';

@ApiTags('founders')
@Controller('founders')
export class FounderController {
  constructor(private readonly founderService: FounderService) {}

  @Post()
  @ApiOperation({
    summary: '창업자 등록',
    operationId: 'createFounder',
    description: `창업자 계정을 등록합니다.
    • Account(FOUNDER) 레코드를 생성합니다
    • 이미 등록된 이메일이면 200을 반환합니다`,
  })
  @ApiBody({ type: CreateFounderDto })
  @ApiResponse({ status: 201, description: '창업자 등록 성공' })
  @ApiResponse({ status: 200, description: '이미 등록된 이메일' })
  @ApiResponse({ status: 400, description: '유효성 검사 실패' })
  async createFounder(
    @Body() dto: CreateFounderDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    const result = await this.founderService.create(dto);
    res.status(result === 'created' ? 201 : 200);
  }
}
