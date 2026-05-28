import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AccountService } from './account.service';
import { AccountResponseDto } from './dto/account-response.dto';
import { CreateAccountDto } from './dto/create-account.dto';

@ApiTags('accounts')
@Controller('accounts')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({
    summary: '계정 등록',
    operationId: 'createAccount',
    description: `계정을 등록합니다.
    • type이 PARTNER인 경우 interestTags, industry 필수
    • type이 FOUNDER인 경우 Account만 생성됩니다`,
  })
  @ApiBody({ type: CreateAccountDto })
  @ApiResponse({
    status: 201,
    description: '계정 등록 성공',
    type: AccountResponseDto,
  })
  @ApiResponse({
    status: 400,
    description:
      '유효성 검사 실패 (PARTNER 타입에 interestTags/industry 미전달 포함)',
  })
  create(@Body() dto: CreateAccountDto): Promise<AccountResponseDto> {
    return this.accountService.create(dto);
  }
}
