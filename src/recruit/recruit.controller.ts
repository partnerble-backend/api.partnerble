import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RecruitService } from './recruit.service';
import { CreateRecruitDto } from './dto/create-recruit.dto';
import { RecruitResponseDto } from './dto/recruit-response.dto';
import { RecruitListQueryDto } from './dto/recruit-list-query.dto';
import { RecruitListResponseDto } from './dto/recruit-list-response.dto';
import { RecruitDetailResponseDto } from './dto/recruit-detail-response.dto';

@ApiTags('recruits')
@Controller('recruits')
export class RecruitController {
  constructor(private readonly recruitService: RecruitService) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({
    summary: '공고 생성',
    operationId: 'createRecruit',
    description: `새 채용 공고를 생성합니다.
    • 생성 후 운영자에게 이메일 알림이 발송됩니다`,
  })
  @ApiBody({ type: CreateRecruitDto })
  @ApiResponse({
    status: 201,
    description: '공고 생성 성공',
    type: RecruitResponseDto,
  })
  @ApiResponse({ status: 400, description: '유효하지 않은 요청 데이터' })
  create(@Body() dto: CreateRecruitDto): Promise<RecruitResponseDto> {
    return this.recruitService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: '공고 목록 조회',
    operationId: 'findAllRecruits',
    description: `채용 공고 목록을 조회합니다.
    • isActive 파라미터로 활성/비활성 공고를 필터링할 수 있습니다 (기본값: true)`,
  })
  @ApiQuery({
    name: 'isActive',
    description: '활성 공고 여부 필터 (기본값: true)',
    required: false,
    example: true,
  })
  @ApiResponse({
    status: 200,
    description: '공고 목록 조회 성공',
    type: RecruitListResponseDto,
  })
  findAll(
    @Query() query: RecruitListQueryDto,
  ): Promise<RecruitListResponseDto> {
    return this.recruitService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: '공고 상세 조회',
    operationId: 'findOneRecruit',
    description: `채용 공고 상세 정보를 조회합니다.`,
  })
  @ApiParam({ name: 'id', description: '공고 ID', example: 'clx...' })
  @ApiResponse({
    status: 200,
    description: '공고 상세 조회 성공',
    type: RecruitDetailResponseDto,
  })
  @ApiResponse({ status: 404, description: '존재하지 않는 공고 id' })
  findOne(@Param('id') id: string): Promise<RecruitDetailResponseDto> {
    return this.recruitService.findOne(id);
  }
}
