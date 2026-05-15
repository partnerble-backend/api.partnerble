import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { RecruitService } from './recruit.service';
import { CreateRecruitDto } from './dto/create-recruit.dto';
import { RecruitResponseDto } from './dto/recruit-response.dto';
import { RecruitListQueryDto } from './dto/recruit-list-query.dto';
import { RecruitListResponseDto } from './dto/recruit-list-response.dto';
import { RecruitDetailResponseDto } from './dto/recruit-detail-response.dto';

@Controller('recruits')
export class RecruitController {
  constructor(private readonly recruitService: RecruitService) {}

  @Post()
  @HttpCode(201)
  create(@Body() dto: CreateRecruitDto): Promise<RecruitResponseDto> {
    return this.recruitService.create(dto);
  }

  @Get()
  findAll(
    @Query() query: RecruitListQueryDto,
  ): Promise<RecruitListResponseDto> {
    return this.recruitService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<RecruitDetailResponseDto> {
    return this.recruitService.findOne(id);
  }
}
