import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { RecruitService } from './recruit.service';
import { CreateRecruitDto } from './dto/create-recruit.dto';
import { RecruitResponseDto } from './dto/recruit-response.dto';

@Controller('recruits')
export class RecruitController {
  constructor(private readonly recruitService: RecruitService) {}

  @Post()
  @HttpCode(201)
  create(@Body() dto: CreateRecruitDto): Promise<RecruitResponseDto> {
    return this.recruitService.create(dto);
  }
}
