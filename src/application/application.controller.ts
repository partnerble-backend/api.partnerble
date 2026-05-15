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
import { ApplicationService } from './application.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { ApplicationResponseDto } from './dto/application-response.dto';
import { MAX_FILE_SIZE_BYTES } from '../common/s3/s3.constants';
import { UploadableFile } from '../common/s3/s3.service';

@Controller('applications')
export class ApplicationController {
  constructor(private readonly applicationService: ApplicationService) {}

  @Post()
  @HttpCode(201)
  @UseInterceptors(FileInterceptor('attachment'))
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
