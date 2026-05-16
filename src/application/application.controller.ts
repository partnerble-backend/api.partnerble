import {
  Body,
  Controller,
  FileTypeValidator,
  Get,
  HttpCode,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { ApplicationStatus } from '@prisma/client';
import { ApplicationService } from './application.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import {
  AdminApplicationListResponseDto,
  ApplicationResponseDto,
  UpdateApplicationStatusResponseDto,
} from './dto/application-response.dto';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';
import { ApplicationListQueryDto } from './dto/application-list-query.dto';
import { MAX_FILE_SIZE_BYTES } from '../common/s3/s3.constants';
import { UploadableFile } from '../common/s3/s3.service';
import { ApiKeyGuard } from '../common/guards/api-key.guard';

@ApiTags('applications')
@Controller('applications')
export class ApplicationController {
  constructor(private readonly applicationService: ApplicationService) {}

  @Post()
  @HttpCode(201)
  @UseInterceptors(FileInterceptor('attachment'))
  @ApiOperation({
    summary: '지원서 제출',
    operationId: 'createApplication',
    description: `채용 공고에 지원서를 제출합니다.
    • 첨부파일은 PDF, JPEG, PNG 형식만 허용합니다 (선택사항)
    • 파일 최대 크기: 10MB
    • 제출 후 운영자에게 이메일 알림이 발송됩니다`,
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: [
        'recruitId',
        'name',
        'contact',
        'introduction',
        'privacyAgreed',
      ],
      properties: {
        recruitId: { type: 'string', example: 'clx...' },
        name: { type: 'string', example: '홍길동' },
        contact: { type: 'string', example: '010-1234-5678' },
        introduction: { type: 'string', example: '안녕하세요...' },
        privacyAgreed: { type: 'boolean', example: true },
        attachment: {
          type: 'string',
          format: 'binary',
          description: 'PDF, JPEG, PNG (선택)',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: '지원서 제출 성공',
    type: ApplicationResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: '유효하지 않은 요청 데이터 또는 허용되지 않는 파일 형식·크기',
  })
  @ApiResponse({ status: 404, description: '존재하지 않는 공고 id' })
  create(
    @Body() dto: CreateApplicationDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: MAX_FILE_SIZE_BYTES }),
          new FileTypeValidator({
            fileType: /^(application\/pdf|image\/jpeg|image\/png)$/,
          }),
        ],
        fileIsRequired: false,
      }),
    )
    file?: UploadableFile,
  ): Promise<ApplicationResponseDto> {
    return this.applicationService.create(dto, file);
  }

  @Get()
  @UseGuards(ApiKeyGuard)
  @ApiSecurity('x-api-key')
  @ApiOperation({
    summary: '지원서 목록 조회 (관리자)',
    operationId: 'findAllApplications',
    description: `관리자가 전체 지원서 목록을 조회합니다.
    • x-api-key 헤더 인증 필요
    • recruitId로 특정 공고의 지원서만 필터링할 수 있습니다
    • status로 처리 상태별 필터링할 수 있습니다
    • page / limit으로 페이지네이션을 제어합니다 (기본값: page=1, limit=20)`,
  })
  @ApiQuery({
    name: 'recruitId',
    description: '공고 ID 필터',
    required: false,
    example: 'clx...',
  })
  @ApiQuery({
    name: 'status',
    description: '지원서 상태 필터',
    required: false,
    enum: ApplicationStatus,
    example: ApplicationStatus.PENDING,
  })
  @ApiQuery({
    name: 'page',
    description: '페이지 번호 (기본값: 1)',
    required: false,
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    description: '페이지당 항목 수 (기본값: 20)',
    required: false,
    example: 20,
  })
  @ApiResponse({
    status: 200,
    description: '지원서 목록 조회 성공',
    type: AdminApplicationListResponseDto,
  })
  @ApiResponse({ status: 401, description: 'API Key 없거나 불일치' })
  findAll(
    @Query() query: ApplicationListQueryDto,
  ): Promise<AdminApplicationListResponseDto> {
    return this.applicationService.findAll(query);
  }

  @Patch(':id/status')
  @UseGuards(ApiKeyGuard)
  @ApiSecurity('x-api-key')
  @ApiOperation({
    summary: '지원서 상태 변경 (관리자)',
    operationId: 'updateApplicationStatus',
    description: `관리자가 지원서의 처리 상태를 변경합니다.
    • x-api-key 헤더 인증 필요
    • 허용 상태값: PENDING, REVIEWED, CONTACTED, REJECTED`,
  })
  @ApiParam({ name: 'id', description: '지원서 ID', example: 'clx...' })
  @ApiBody({ type: UpdateApplicationStatusDto })
  @ApiResponse({
    status: 200,
    description: '상태 변경 성공',
    type: UpdateApplicationStatusResponseDto,
  })
  @ApiResponse({ status: 400, description: 'status 값이 유효하지 않음' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 404, description: '존재하지 않는 지원서 id' })
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateApplicationStatusDto,
  ): Promise<UpdateApplicationStatusResponseDto> {
    return this.applicationService.updateStatus(id, dto);
  }
}
