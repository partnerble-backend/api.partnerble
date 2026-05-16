import {
  Body,
  Controller,
  FileTypeValidator,
  HttpCode,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ApplicationService } from './application.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { ApplicationResponseDto } from './dto/application-response.dto';
import { MAX_FILE_SIZE_BYTES } from '../common/s3/s3.constants';
import { UploadableFile } from '../common/s3/s3.service';

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
}
